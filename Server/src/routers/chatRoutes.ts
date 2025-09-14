import { Router } from "express";
import { Socket } from "socket.io";
import AuthController from "../controllers/AuthController";
import ChatsController from "../controllers/ChatsController";

const router = Router();

router.get(
  "/chats-history",
  AuthController.authCheck,
  ChatsController.getChatsHistory
);

module.exports = router;
