import { Request, Response, NextFunction } from "express";
import { UserRepository } from "../repositories/UserRepository";
import ApiError from "../error/ApiError";

class UsersController {
  async sendUsersPublicData(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return next(ApiError.badRequest("No user ids were passed"));
      }

      // Получаем пользователей параллельно
      const users = await UserRepository.getAllUsers();
      const userData = users.map((user) => ({
        userId: user.userId,
        username: user.username,
        profilePhoto:
          user.profilePhoto !== ""
            ? `http://localhost:3001/profilePhotos/${user.profilePhoto}`
            : "http://localhost:3001/imgs/userImgDefault.png",
      }));
      res.json(userData);
    } catch (error) {
      next(error);
    }
  }
}
export default new UsersController();
