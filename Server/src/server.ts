const express = require("express");
const http = require("http");
const session = require("express-session");
import { Socket } from "socket.io";
import dotenv from "dotenv";
const socketIO = require("socket.io");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const router = require("./routers/index");
const errorHandler = require("./middleware/errorHandlingMiddleware");

// Create an Express app
const app = express();

dotenv.config();

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "localhost";

const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(require("morgan")("combined"));
app.use(
  cors({
    origin: "http://localhost:3000", // Разрешаем доступ с React
    credentials: true, // Если используешь сессии или куки
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.use(
  "/uploads",
  express.static(path.join(__dirname, "dataFolder", "uploads"))
);

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "..", "client", "build")));
app.use("/api", router);
app.use(errorHandler);

const chatDirectory = path.join(__dirname, "chats");
if (!fs.existsSync(chatDirectory)) {
  fs.mkdirSync(chatDirectory); // Create the directory if it doesn't exist
}

interface CustomSocket extends Socket {
  userId?: string;
}

const connectedUsers: Record<string, string> = {};

io.on("connection", (socket: CustomSocket) => {
  console.log("New user connected");
  // Listen for "join" event where the client sends the userId (session ID)
  socket.on("join", (userId: string) => {
    console.log(`User joined with ID: ${userId}`);
    socket.userId = userId; // Store the session userId in the socket object
    connectedUsers[userId] = socket.id; // Map userId to socket.id
    socket.emit("join");
    // Load chat history and send it to the user
    const userChatFile = path.join(chatDirectory, `${userId}.json`);
    if (fs.existsSync(userChatFile)) {
      const chatHistory = JSON.parse(fs.readFileSync(userChatFile, "utf-8"));
      socket.emit("chat history", chatHistory);
    }
  });

  interface PrivateMessageData {
    toUserId: string; // recipient user ID
    message: string | object;
    status?: string; // optional status
    files?: string[];
    fromUserId: string;
  }

  interface ChatMessage {
    from: string;
    to: string;
    message: string | object;
    timestamp: string;
    file: string[];
    status?: string;
  }

  // Listen for private messages
  socket.on("private message", (data: PrivateMessageData) => {
    const { toUserId, message } = data;
    const fromUserId = socket.userId; // Use the session ID stored in the socket
    if (!fromUserId) return;
    const timestamp = new Date().toISOString();
    let status = data.status;
    let messageFile: string[] = [];

    if (data.files) {
      // Generate a unique file name (already handled by multer above)
      const fileName = data.files; // This should be the path to the file stored on the server

      // Save the file info into the message JSON
      messageFile = fileName;
    }

    // Save message in the recipient's chat file
    const recipientChatFile = path.join(chatDirectory, `${toUserId}.json`);
    let recipientChatHistory: ChatMessage[] = [];
    if (fs.existsSync(recipientChatFile)) {
      recipientChatHistory = JSON.parse(
        fs.readFileSync(recipientChatFile, "utf-8")
      );
    }
    recipientChatHistory.push({
      from: fromUserId,
      to: toUserId,
      message,
      timestamp,
      file: messageFile,
      status,
    });
    fs.writeFileSync(
      recipientChatFile,
      JSON.stringify(recipientChatHistory, null, 2)
    );

    // Save message in the sender's chat file
    const senderChatFile = path.join(chatDirectory, `${fromUserId}.json`);
    let senderChatHistory: ChatMessage[] = [];
    if (fs.existsSync(senderChatFile)) {
      senderChatHistory = JSON.parse(fs.readFileSync(senderChatFile, "utf-8"));
    }
    senderChatHistory.push({
      from: fromUserId,
      to: toUserId,
      message,
      timestamp,
      file: messageFile,
      status: "checked",
    });
    fs.writeFileSync(
      senderChatFile,
      JSON.stringify(senderChatHistory, null, 2)
    );

    // Emit the message to the sender
    socket.emit("private message", {
      from: fromUserId,
      to: toUserId,
      message,
      timestamp,
      file: messageFile,
      status,
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
          timestamp,
          file: messageFile,
          status,
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

// Start the server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});
