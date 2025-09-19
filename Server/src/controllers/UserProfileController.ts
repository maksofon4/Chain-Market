import { Request, Response, NextFunction } from "express";
import { SessionRequest } from "../models/express-session";
import { UserRepository } from "../repositories/UserRepository";
import ApiError from "../error/ApiError";
import bcrypt from "bcrypt";

class UserProfileController {
  async updateProfilePhoto(
    req: SessionRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const password = req.body.currentPassword;

      // 1. Проверка авторизации
      if (!req.session.userId) {
        throw ApiError.badRequest("Not authenticated");
      }

      if (!password) {
        throw ApiError.badRequest("Password is required for the operation");
      }

      // 2. Найти пользователя
      const user = await UserRepository.findOneById(req.session.userId);
      if (!user) {
        throw ApiError.badRequest("User not found");
      }
      const validCredentials = await bcrypt.compare(password, user.password);

      if (!validCredentials) {
        throw ApiError.badRequest("Invalid Credentials");
      }

      // 3. Проверка файла
      if (!req.file) {
        throw ApiError.badRequest("No file uploaded");
      }

      // 4. Обновить путь к фото
      user.profile_photo = `${req.file.filename}`;
      const updatedUser = await UserRepository.saveUser(user);

      res.status(200).json({ message: "success", user: updatedUser });
    } catch (error) {
      next(error);
    }
  }

  async updateProfileInfo(
    req: SessionRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { email, username, currentpassword, password } = req.body;
      if (!req.session.userId) {
        throw ApiError.badRequest("Not authenticated");
      }
      const userId = req.session.userId;

      const user = await UserRepository.findOneById(userId);

      if (!user) {
        throw ApiError.internal("Failed to find user");
      }

      let updated = false;
      let isPasswordCorrect = await bcrypt.compare(
        currentpassword,
        user.password
      );

      if (!email && !username && !password) {
        throw ApiError.badRequest("No values were passed for change");
      }

      if (!isPasswordCorrect) {
        throw ApiError.badRequest("Account password is incorrect.");
      }

      if (email) {
        user.email = email;
      }
      if (username) {
        user.user_name = username;
      }

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
      }
      const updateUserRes = await UserRepository.saveUser(user);
      if (updateUserRes) {
        updated = true;
      }

      if (updated) {
        res
          .status(200)
          .json({ message: "Your account has been updated successfully" });
      }
    } catch (error) {
      next(error);
    }
  }

  async addProductsToFavorites(
    req: SessionRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.session.userId;
      const { productIds } = req.body;

      if (!userId) {
        throw ApiError.badRequest("Not authenticated");
      }
      if (!Array.isArray(productIds) || productIds.length === 0) {
        throw ApiError.badRequest("Expected non-empty array of product IDs");
      }

      const user = await UserRepository.findOneById(userId);
      if (!user) {
        throw ApiError.badRequest("User not found");
      }

      user.selected_products = [...user.selected_products, ...productIds];
      const result = await UserRepository.saveUser(user);
      if (result) {
        res
          .status(200)
          .json({ message: "The Product has been added to favorites" });
      }
    } catch (error) {
      next(error);
    }
  }

  async removeProductsFromFavorites(
    req: SessionRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.session.userId;
      const { productIds } = req.body;

      if (!userId) {
        throw ApiError.badRequest("Not authenticated");
      }
      if (!Array.isArray(productIds) || productIds.length === 0) {
        throw ApiError.badRequest("Expected non-empty array of product IDs");
      }

      const user = await UserRepository.findOneById(userId);
      if (!user) {
        throw ApiError.badRequest("User not found");
      }

      user.selected_products = user.selected_products.filter(
        (productId: string) => !productIds.includes(productId)
      );

      const result = await UserRepository.saveUser(user);

      if (result) {
        res
          .status(200)
          .json({ message: "The products have been removed from favorites" });
      }
    } catch (error) {
      next(error);
    }
  }
}

export default new UserProfileController();
