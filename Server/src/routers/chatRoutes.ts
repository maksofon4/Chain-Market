import { Router } from "express";

import AuthController from "../controllers/AuthController";
import ChatsController from "../controllers/ChatsController";

const router = Router();

router.get(
  "/chats-history",
  AuthController.authCheck,
  ChatsController.getChatsHistory
);

module.exports = router;
