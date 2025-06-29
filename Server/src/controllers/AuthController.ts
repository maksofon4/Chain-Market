import { Request, Response, NextFunction } from "express";
import { UserRepository } from "../repositories/UserRepository";
import ApiError from "../error/ApiError";

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

      UserRepository.create(newUser);
    } catch (error) {
      next(error); // пробрасываем в error middleware
    }
  }

  async login(req: Request, res: Response) {
    // реализация
  }

  async authCheck(req: Request, res: Response, next: NextFunction) {
    if (req) {
      return next(ApiError.badRequest("bad request"));
    }
    res.json("authenticated");
  }
}

export default new AuthController();
