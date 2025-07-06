import { Request, Response, NextFunction } from "express";
import { SessionRequest } from "../models/express-session";
import { UserRepository } from "../repositories/UserRepository";
import ApiError from "../error/ApiError";
import bcrypt from "bcrypt";

class AuthController {
  async registration(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, email, password } = req.body;

      // 1. Проверка, переданы ли данные
      if (!email || !password) {
        return next(ApiError.badRequest("Email and password are required"));
      }

      // 2. Проверка, существует ли пользователь
      const candidate = await UserRepository.findByEmail(email);
      if (candidate) {
        return next(ApiError.badRequest("User with this email already exists"));
      }

      const newUser = { username, email, password };
      const result = await UserRepository.create(newUser);
      if (!result) {
        return next(ApiError.internal("Unexpected Error"));
      }
      res.json("User Registered Successfully");
    } catch (error) {
      next(error); // пробрасываем в error middleware
    }
  }
  async removing(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.body;

      // 1. Проверка, переданы ли данные
      if (!userId) {
        return next(ApiError.badRequest("User Id is required"));
      }

      // 2. Проверка, существует ли пользователь
      const user = await UserRepository.findById(userId);
      if (!user) {
        return next(ApiError.badRequest("User does not exist"));
      }

      const result = await UserRepository.remove(userId);
      if (!result) {
        return next(ApiError.internal("Unexpected Error"));
      }
      res.json("User has been removed ");
    } catch (error) {
      next(error); // пробрасываем в error middleware
    }
  }

  async login(req: SessionRequest, res: Response, next: NextFunction) {
    const { email, password } = req.body;
    const user = await UserRepository.findByEmail(email);

    if (!user) {
      return next(ApiError.badRequest("User does not exist"));
    }

    const validCredentials = await bcrypt.compare(password, user.password);
    if (!validCredentials) {
      return next(ApiError.badRequest("Invalid Credentials"));
    }

    if (validCredentials) {
      req.session.userId = user.userId;
      res.status(200).json({
        userId: user.userId,
        username: user.userId,
        email: user.email,
      });
    }
  }

  async authCheck(req: SessionRequest, res: Response, next: NextFunction) {
    try {
      if (!req.session.userId) {
        return next(ApiError.badRequest("Not authenticated"));
      }
      const session = req.session;
      res.status(200).json({
        userId: session.userId,
        username: session.userId,
        email: session.email,
      });
    } catch (error) {
      return next(ApiError.internal("Unexpected Error"));
    }
  }
}

export default new AuthController();
