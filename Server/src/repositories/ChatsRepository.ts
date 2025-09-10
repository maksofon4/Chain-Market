import { promises as fs } from "fs";
import path from "path";
import { chatsPhotosDir } from "../config/env";
import postgreSql from "../../data/dataBase/postgre";

const chatsPhotosDest = `../${chatsPhotosDir}`;

export class ChatsRepository {
  static async getChatsHistory(userId: string): Promise<object[]> {
    const query = `
    SELECT 
      m.id,
      m.from_user_id,
      m.to_user_id,
      m.content,
      m.sent_at
    FROM messages m
    JOIN chats c 
      ON ( (c.owner_user_id = m.from_user_id AND c.with_user_id = m.to_user_id)
           OR (c.owner_user_id = m.to_user_id AND c.with_user_id = m.from_user_id) )
    WHERE (c.owner_user_id = $1 OR c.with_user_id = $1)
      AND c.is_chat_deleted = FALSE
      AND m.sent_at >= c.created_at
    ORDER BY m.sent_at ASC
  `;

    const { rows } = await postgreSql.query(query, [userId]);
    return rows;
  }
  static async createChats(forUserIds: string[]): Promise<object[] | null> {
    if (forUserIds.length !== 2) {
      throw new Error("Нужно передать ровно 2 user_id");
    }

    const [user1, user2] = forUserIds;

    const query = `
    INSERT INTO chats (owner_user_id, with_user_id)
    VALUES ($1, $2), ($2, $1)
    RETURNING chat_id, owner_user_id, with_user_id, created_at, is_chat_deleted;
  `;

    const values = [user1, user2];
    const result = await postgreSql.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows;
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
  }: {
    senderId: string;
    receiverId: string;
    content: any;
  }): Promise<any[]> {
    const client = await postgreSql.connect();

    try {
      await client.query("BEGIN");

      const chats = await ChatsRepository.findChatsByIds(senderId, receiverId);

      if (chats.length !== 2) {
        throw new Error("The chats between users don't exist");
      }
      const insertQuery = `
      INSERT INTO messages (from_user_id, to_user_id, content)
      VALUES ($1, $2, $3)
      RETURNING id, from_user_id, to_user_id, content, sent_at;
    `;

      const values = [senderId, receiverId, content];

      const { rows: messages } = await client.query(insertQuery, values);

      await client.query("COMMIT");

      return messages;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}
