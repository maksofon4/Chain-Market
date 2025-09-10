import { Request, Response, NextFunction } from "express";
import { SessionRequest } from "../models/express-session";
import { ChatsRepository } from "../repositories/ChatsRepository";
import ApiError from "../error/ApiError";

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
