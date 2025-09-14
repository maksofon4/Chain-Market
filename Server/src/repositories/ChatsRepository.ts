import { chatsPhotosDir } from "../config/env";
import postgreSql from "../../data/dataBase/postgre";
import { Message } from "../models/chats";

const chatsPhotosDest = `../${chatsPhotosDir}`;

export class ChatsRepository {
  static async getChatsHistory(userId: string): Promise<Record<string, any[]>> {
    const query = `
    SELECT
      m.id,
      m.from_user_id AS from,
      m.to_user_id AS to,
      m.content,
      m.sent_at AS timestamp,
      c.chat_id,
      m.status
    FROM messages m
    JOIN chats c
      ON c.owner_user_id = $1
      AND (
        (m.from_user_id = c.owner_user_id AND m.to_user_id = c.with_user_id)
        OR
        (m.from_user_id = c.with_user_id AND m.to_user_id = c.owner_user_id)
      )
    WHERE c.is_chat_deleted = FALSE
      AND m.sent_at >= c.created_at
    ORDER BY m.sent_at ASC;
  `;

    const { rows } = await postgreSql.query(query, [userId]);

    const chats: Record<string, any[]> = {};

    rows.forEach((message) => {
      const otherUserId = message.from === userId ? message.to : message.from;

      if (!chats[otherUserId]) {
        chats[otherUserId] = [];
      }

      chats[otherUserId].push(message);
    });

    return chats;
  }
  static async createChats(forUserIds: string[]): Promise<any[]> {
    if (forUserIds.length !== 2) {
      throw new Error("Нужно передать ровно 2 user_id");
    }

    const [user1, user2] = forUserIds;

    try {
      const query = `
    INSERT INTO chats (owner_user_id, with_user_id)
    VALUES ($1, $2), ($2, $1)
    RETURNING chat_id, owner_user_id, with_user_id, created_at, is_chat_deleted;
  `;

      const values = [user1, user2];
      const result = await postgreSql.query(query, values);

      return result.rows;
    } catch (error) {
      console.log("error occured on creating chats", error);
      throw error;
    }
  }

  static async findChatsByIds(userId1: string, userId2: string) {
    const chatQuery = `
      SELECT chat_id, owner_user_id, with_user_id
      FROM chats
      WHERE (owner_user_id = $1 AND with_user_id = $2)
         OR (owner_user_id = $2 AND with_user_id = $1);
    `;

    const { rows: chats } = await postgreSql.query(chatQuery, [
      userId1,
      userId2,
    ]);

    return chats;
  }

  static async writeMessage({
    senderId,
    receiverId,
    content,
    sentAt,
  }: {
    senderId: string;
    receiverId: string;
    content: object;
    sentAt: string;
  }): Promise<Message> {
    const client = await postgreSql.connect();

    try {
      await client.query("BEGIN");

      const chats = await ChatsRepository.findChatsByIds(senderId, receiverId);

      if (chats.length !== 2) {
        throw new Error("The chats between users don't exist");
      }
      const insertQuery = `
      INSERT INTO messages (from_user_id, to_user_id, content,sent_at)
      VALUES ($1, $2, $3, $4)
      RETURNING id, from_user_id AS fromUserId, to_user_id AS toUserId, content, sent_at AS sentAt;
    `;

      const values = [senderId, receiverId, content, sentAt];

      const { rows } = await client.query(insertQuery, values);

      await client.query("COMMIT");

      return rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}
