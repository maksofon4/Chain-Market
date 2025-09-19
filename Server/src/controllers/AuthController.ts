import { Request, Response, NextFunction } from "express";
import { SessionRequest } from "../models/express-session";
import { UserRepository } from "../repositories/UserRepository";
import ApiError from "../error/ApiError";
import bcrypt from "bcrypt";

class AuthController {
  async registration(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, email, password } = req.body;
      if (!email || !password) {
        return next(ApiError.badRequest("Email and password are required"));
      }

      const candidate = await UserRepository.findByEmail(email);

      if (candidate) {
        return next(ApiError.badRequest("User with this email already exists"));
      }

      const newUser = { username, email, password };
      await UserRepository.create(newUser);

      res.json("User Registered Successfully");
    } catch (error) {
      next(error);
    }
  }

  async login(req: SessionRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const user = await UserRepository.findByEmail(email);

      if (!user) {
        throw ApiError.badRequest("User does not exist");
      }

      const validCredentials = await bcrypt.compare(password, user.password);
      if (!validCredentials) {
        throw ApiError.badRequest("Invalid Credentials");
      }

      req.session.userId = user.user_id;
      res.status(200).json({
        userId: user.user_id,
        username: user.user_name,
        email: user.email,
        profilePhoto: user.profile_photo,
        pinnedChats: user.pinned_chats,
        selectedProducts: user.selected_products,
      });
    } catch (error) {
      next(error);
    }
  }

  async authCheck(req: SessionRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.session;

      if (!userId) {
        throw ApiError.badRequest("Not authenticated");
      }
      const userData = await UserRepository.findOneById(userId);

      if (!userData) {
        return next(ApiError.badRequest("User not found"));
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  async sendUserData(req: SessionRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.session;

      if (!userId) {
        return next(ApiError.badRequest("Not authenticated"));
      }

      const user = await UserRepository.findOneById(userId);

      if (!user) {
        return next(ApiError.badRequest("User not found"));
      }

      const profilePhoto =
        user.profile_photo && user.profile_photo !== null
          ? `http://localhost:3001/profilePhotos/${user.profile_photo}`
          : "http://localhost:3001/imgs/userImgDefault.png";

      res.status(200).json({
        userId: user.user_id,
        username: user.user_name,
        email: user.email,
        profilePhoto,
        pinnedChats: user.pinned_chats,
        selectedProducts: user.selected_products,
      });
    } catch (error) {
      return next(error);
    }
  }

  async logOut(req: SessionRequest, res: Response, next: NextFunction) {
    try {
      req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.send("Logged out successfully");
      });
    } catch (error) {
      return next(ApiError.internal("Unexpected error"));
    }
  }
}

export default new AuthController();
