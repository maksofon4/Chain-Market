import { Request, Response, NextFunction } from "express";
import { ProductRepository } from "../repositories/ProductRepository";
import ApiError from "../error/ApiError";

class ProductController {
  async uploading(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        userId,
        name,
        category,
        description,
        location,
        price,
        condition,
        tradePossible,
        contactDetails: { email, phoneNumber },
        images,
        formattedDateTime,
      } = req.body;

      const newProduct = {
        userId,
        name,
        category,
        description,
        location,
        price,
        condition,
        tradePossible,
        contactDetails: { email, phoneNumber },
        images,
        formattedDateTime,
      };
      const result = await ProductRepository.create(newProduct);
      if (!result) {
        return next(ApiError.internal("Unexpected Error"));
      }
      res.json("User Registered Successfully");
    } catch (error) {
      next(error); // пробрасываем в error middleware
    }
  }

  async login(req: Request, res: Response) {
    // реализация
  }

  async authCheck(req: Request, res: Response, next: NextFunction) {
    res.json("authenticated");
  }
}

export default new ProductController();
