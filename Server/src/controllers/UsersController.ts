import { Request, Response, NextFunction } from "express";
import { UserRepository } from "../repositories/UserRepository";
import ApiError from "../error/ApiError";

class UsersController {
  async sendUsersPublicData(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        throw ApiError.badRequest("No user ids were passed");
      }

      // Получаем пользователей параллельно
      const users = await UserRepository.findManyById(ids);
      if (!users) {
        throw ApiError.internal("The data request has failed");
      }
      const userData = users.map((user) => ({
        userId: user.user_id,
        username: user.user_name,
        profilePhoto:
          user.profile_photo !== null
            ? `http://localhost:3001/profilePhotos/${user.profile_photo}`
            : "http://localhost:3001/imgs/userImgDefault.png",
      }));
      res.json(userData);
    } catch (error) {
      next(error);
    }
  }
}
export default new UsersController();
