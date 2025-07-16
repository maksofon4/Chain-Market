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
        // return next(ApiError.internal("Unexpected Error"));
        res.json(result);
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
        username: user.username,
        email: user.email,
        profilePhoto: user.profilePhoto,
        pinnedChats: user.pinnedChats,
        selectedProducts: user.selectedProducts,
      });
    }
  }

  async authCheck(req: SessionRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.session;

      if (!userId) {
        return next(ApiError.badRequest("Not authenticated"));
      }

      const userData = await UserRepository.findById(userId);

      if (!userData) {
        return next(ApiError.badRequest("User not found"));
      }

      req.session.userId = userData.userId;
      req.session.username = userData.username;
      req.session.email = userData.email;
      req.session.profilePhoto = userData.profilePhoto;
      req.session.pinnedChats = userData.pinnedChats;
      req.session.selectedProducts = userData.selectedProducts;
      next();
    } catch (error) {
      return next(ApiError.internal("Unexpected Error"));
    }
  }

  async sendUserData(req: SessionRequest, res: Response, next: NextFunction) {
    try {
      const user = req.session;

      if (!user) {
        return next(ApiError.badRequest("No user in request"));
      }

      const profilePhoto =
        user.profilePhoto && user.profilePhoto !== ""
          ? `http://localhost:3001/profilePhotos/${user.profilePhoto}`
          : "http://localhost:3001/imgs/userImgDefault.png";

      res.status(200).json({
        userId: user.userId,
        username: user.username,
        email: user.email,
        profilePhoto,
        pinnedChats: user.pinnedChats,
        selectedProducts: user.selectedProducts,
      });
    } catch (error) {
      return next(ApiError.internal("Unexpected error"));
    }
  }

  // Update profile photo

  async updateProfilePhoto(
    req: SessionRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const password = req.body.currentPassword;

      // 1. Проверка авторизации
      if (!req.session.userId) {
        return next(ApiError.badRequest("Not authenticated"));
      }

      // 2. Найти пользователя
      const user = await UserRepository.findById(req.session.userId);
      if (!user) {
        return next(ApiError.badRequest("User not found"));
      }
      const validCredentials = await bcrypt.compare(password, user.password);

      if (!validCredentials) {
        return next(ApiError.badRequest("Invalid Credentials"));
      }

      // 3. Проверка файла
      if (!req.file) {
        return next(ApiError.badRequest("No file uploaded"));
      }

      // 4. Обновить путь к фото
      user.profilePhoto = `${req.file.filename}`;
      const updatedUser = await UserRepository.saveUser(user);

      res.status(200).json({ message: "success" });
    } catch (error) {
      return next(ApiError.internal("Unexpected Error"));
    }
  }
}

export default new AuthController();
