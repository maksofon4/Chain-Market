import { Request, Response, NextFunction } from "express";
import { SessionRequest } from "../models/express-session";
import { UserRepository } from "../repositories/UserRepository";
import ApiError from "../error/ApiError";
import bcrypt from "bcrypt";

class UserProfileController {
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

      res.status(200).json({ message: "success", user: updatedUser });
    } catch (error) {
      return next(ApiError.internal("Unexpected Error"));
    }
  }

  async updateProfileInfo(
    req: SessionRequest,
    res: Response,
    next: NextFunction
  ) {
    const { email, username, currentpassword, password } = req.body;
    if (!req.session.userId) {
      return next(ApiError.badRequest("Not authenticated"));
    }
    const userId = req.session.userId;

    try {
      const user = await UserRepository.findById(userId);

      if (!user) {
        res.status(404).json({ message: "User not found." });
        return;
      }

      let updated = false; // Flag to track if any update was made

      // Update email or username if provided
      if (email && currentpassword) {
        const isMatch = await bcrypt.compare(currentpassword, user.password);
        if (isMatch) {
          user.email = email;
          const updateUserRes = await UserRepository.saveUser(user);
          if (updateUserRes) {
            updated = true;
          } else {
            return next(ApiError.internal("Unexpected Error"));
          }
        } else {
          return next(ApiError.badRequest("Account password is incorrect."));
        }
      }
      if (username && currentpassword) {
        const isMatch = await bcrypt.compare(currentpassword, user.password);
        if (isMatch) {
          user.username = username;
          const updateUserRes = await UserRepository.saveUser(user);
          if (updateUserRes) {
            updated = true;
          } else {
            next(ApiError.internal("Unexpected Error"));
          }
        } else {
          return next(ApiError.badRequest("Account password is incorrect."));
        }
      }

      // Handle password change if current password is provided
      if (password && currentpassword) {
        const isMatch = await bcrypt.compare(currentpassword, user.password);

        if (isMatch) {
          const hashedPassword = await bcrypt.hash(password, 10);
          user.password = hashedPassword;
          const updateUserRes = await UserRepository.saveUser(user);
          if (updateUserRes) {
            updated = true;
          } else {
            return next(ApiError.internal("Unexpected Error"));
          }
        } else {
          return next(ApiError.badRequest("Account password is incorrect."));
        }
      }

      if (updated) {
        res
          .status(200)
          .json({ message: "Your account has been updated successfully" });
      } else {
        res.status(400).json({ message: "No changes detected." });
      }
    } catch (error) {
      next(ApiError.internal("Unexpected Error"));
    }
  }
}

export default new UserProfileController();
