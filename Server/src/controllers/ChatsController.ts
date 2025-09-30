import e, { Request, Response, NextFunction } from "express";
import { SessionRequest } from "../models/express-session";
import { ChatsRepository } from "../repositories/ChatsRepository";
import ApiError from "../error/ApiError";
import { Server } from "socket.io";
import { messageFromClient, CustomSocket } from "../models/chats";
import { Server as HttpServer } from "http";

class ChatsController {
  async getChatsHistory(
    req: SessionRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { userId } = req.session;

      if (!userId) {
        return next(ApiError.internal("Unexpected Error"));
      }

      const history = await ChatsRepository.getChatsHistory(userId);

      if (!history) {
        return next(ApiError.internal("Unexpected Error"));
      }
      res.json(history);
    } catch (error) {
      next(error);
    }
  }

  async checkMessagesForChatOwner(
    req: SessionRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { userId } = req.session;
      const { forUserId } = req.body;

      if (!userId || !forUserId) {
        return next(
          ApiError.badRequest("The request must consits of two values")
        );
      }

      const chats = await ChatsRepository.findChatsByIds(userId, forUserId);

      if (chats.length < 2) {
        throw ApiError.internal(
          `Couldn't find chats, expected 2 values but querry returned 1 or less`
        );
      }

      const ownersChat = chats.find(
        (chat) =>
          chat.owner_user_id === userId && chat.with_user_id === forUserId
      );

      if (!ownersChat) {
        return next(ApiError.badRequest("The chat does not exist"));
      }

      await ChatsRepository.markMessagesAsChecked(
        ownersChat.owner_user_id,
        forUserId
      );
      res.status(200).json("message status was updated successfully");
    } catch (error) {
      next(error);
    }
  }
}

export default new ChatsController();

export const socketController = (server: HttpServer) => {
  const connectedUsers: Record<string, string> = {};

  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });

  io.on("connection", (socket: CustomSocket) => {
    console.log("New user connected");

    socket.on("join", (userId: string) => {
      socket.userId = userId;
      connectedUsers[userId] = socket.id;
      socket.emit("join");
    });

    socket.on("private message", async (data: messageFromClient) => {
      try {
        const { toUserId, message } = data;
        const fromUserId = socket.userId;
        if (!fromUserId) throw ApiError.internal("Connection lost");

        let chats = await ChatsRepository.findChatsByIds(toUserId, fromUserId);

        if (chats.length === 0) {
          const userIds = [toUserId, fromUserId];
          chats = await ChatsRepository.createChats(userIds);
        }

        const messageforDb = {
          senderId: fromUserId,
          receiverId: toUserId,
          content: message,
        };

        const writeMessageRes = await ChatsRepository.writeMessage(
          messageforDb
        );

        const messageFromDb = {
          id: writeMessageRes.id,
          from: writeMessageRes.fromUserId,
          to: writeMessageRes.toUserId,
          content: writeMessageRes.content,
          status: writeMessageRes.status,
          timestamp: writeMessageRes.sentAt,
        };
        socket.emit("private message", messageFromDb);

        // Check if the recipient is connected
        const recipientSocketId = connectedUsers[toUserId];
        if (recipientSocketId) {
          const recipientSocket = io.sockets.sockets.get(recipientSocketId);
          if (recipientSocket) {
            // Emit the message to the recipient
            recipientSocket.emit("private message", messageFromDb);
          }
        }
      } catch (error) {
        if (error instanceof ApiError) {
          socket.emit("error", {
            status: error.status,
            message: error.message,
          });
        } else {
          socket.emit("error", { status: 500, message: "Unexpected error" });
        }
        console.error("Socket error:", error);
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
      if (socket.userId) delete connectedUsers[socket.userId];
    });
  });
};
