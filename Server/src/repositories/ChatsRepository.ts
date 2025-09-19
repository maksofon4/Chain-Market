import { chatsPhotosDir } from "../config/env";
import postgreSql from "../dataBase/postgre";
import { Message } from "../models/chats";
import ApiError from "../error/ApiError";
import { error } from "console";

const chatsPhotosDest = `../${chatsPhotosDir}`;

export class ChatsRepository {
  static async getChatsHistory(userId: string): Promise<Record<string, any[]>> {
    try {
      const query = `
    SELECT
      m.id,
      m.from_user_id AS from,
      m.to_user_id AS to,
      m.content,
      m.sent_at AS timestamp,
      c.chat_id,
      CASE
    WHEN m.from_user_id = $1 THEN 'checked'
    ELSE m.status
  END AS status
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

      if (rows.length === 0) return {};
      const chats: Record<string, any[]> = {};
      rows.forEach((message) => {
        const otherUserId = message.from === userId ? message.to : message.from;

        if (!chats[otherUserId]) {
          chats[otherUserId] = [];
        }

        chats[otherUserId].push(message);
      });

      return chats;
    } catch (error) {
      throw ApiError.internal(
        "Unexpected error occured during chat history request"
      );
    }
  }

  static async createChats(forUserIds: string[]): Promise<any[]> {
    try {
      if (forUserIds.length !== 2) {
        throw ApiError.badRequest(
          `Expected 2 user Ids but got ${forUserIds.length}`
        );
      }

      const [user1, user2] = forUserIds;

      const query = `
    INSERT INTO chats (owner_user_id, with_user_id)
    VALUES ($1, $2), ($2, $1)
    RETURNING chat_id, owner_user_id, with_user_id, created_at, is_chat_deleted;
  `;

      const values = [user1, user2];
      const { rows: chats } = await postgreSql.query(query, values);

      if (chats.length === 0) {
        throw ApiError.internal("Failed to create chats");
      }

      return chats;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.log("error occured on creating chats", error);
      throw ApiError.internal(`Error occured during creating chats ${error}`);
    }
  }

  static async findChatsByIds(userId1: string, userId2: string) {
    try {
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
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal("Unexpected error occured while finding chats");
    }
  }

  static async writeMessage({
    senderId,
    receiverId,
    content,
  }: {
    senderId: string;
    receiverId: string;
    content: object;
  }): Promise<Message> {
    const client = await postgreSql.connect();
    try {
      await client.query("BEGIN");

      const chats = await ChatsRepository.findChatsByIds(senderId, receiverId);

      if (!chats) {
        throw ApiError.badRequest("The chats between users don't exist");
      }
      const insertQuery = `
      INSERT INTO messages (from_user_id, to_user_id, content)
      VALUES ($1, $2, $3)
      RETURNING id, from_user_id AS "fromUserId", to_user_id AS "toUserId", content, sent_at AS "sentAt";
    `;

      const values = [senderId, receiverId, content];

      const { rows } = await client.query(insertQuery, values);

      if (rows.length === 0) throw ApiError.internal("Failed to save message");

      await client.query("COMMIT");

      return rows[0];
    } catch (error) {
      if (error instanceof ApiError) throw error;
      await client.query("ROLLBACK");
      throw ApiError.internal("Unexpected error occured during saving message");
    } finally {
      client.release();
    }
  }

  static async markMessagesAsChecked(ownerUserId: string, otherUserId: string) {
    try {
      const updateQuery = `
    UPDATE messages
    SET status = 'checked'
    WHERE to_user_id = $1 
      AND from_user_id = $2
    RETURNING id, from_user_id AS "from", to_user_id AS "to",
              content, sent_at AS "sentAt", status;
  `;
      const { rows } = await postgreSql.query(updateQuery, [
        ownerUserId,
        otherUserId,
      ]);

      if (rows.length === 0)
        throw ApiError.internal("Failed to update message status");
      return rows;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.badRequest(
        "Unexpected error occured during updating message status"
      );
    }
  }
}
