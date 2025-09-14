import { Request, Response, NextFunction } from "express";
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
      return next(ApiError.internal("Unexpected Error"));
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

    // Listen for private messages
    socket.on("private message", async (data: messageFromClient) => {
      const { toUserId, message, sentAt } = data;
      const fromUserId = socket.userId; // Use the session ID stored in the socket
      if (!fromUserId) return;

      let chats = await ChatsRepository.findChatsByIds(toUserId, fromUserId);

      if (!chats || chats.length === 0) {
        const userIds = [toUserId, fromUserId];
        chats = await ChatsRepository.createChats(userIds);

        if (!chats || chats.length === 0) {
          throw new Error("Failed to create chat");
        }
      }

      const messageforDb = {
        senderId: fromUserId,
        receiverId: toUserId,
        content: message,
        sentAt: sentAt,
      };

      const writeMessageRes = await ChatsRepository.writeMessage(messageforDb);

      if (!writeMessageRes) throw new Error("Failed to save the message");

      // Emit the message to the sender

      socket.emit("private message", {
        from: fromUserId,
        to: toUserId,
        content: message,
        status: "checked",
        sentAt: sentAt,
      });

      // Check if the recipient is connected
      const recipientSocketId = connectedUsers[toUserId];
      if (recipientSocketId) {
        const recipientSocket = io.sockets.sockets.get(recipientSocketId);
        if (recipientSocket) {
          // Emit the message to the recipient
          recipientSocket.emit("private message", {
            from: fromUserId,
            to: toUserId,
            message,
            status: "new",
            sentAt,
          });
        }
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
      if (socket.userId) delete connectedUsers[socket.userId];
    });
  });
};
