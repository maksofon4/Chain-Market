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
      res.json("Product Uploaded Successfully");
    } catch (error) {
      next(error); // пробрасываем в error middleware
    }
  }

  async removing(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.body;

      const result = await ProductRepository.remove(productId);
      if (!result) {
        return next(ApiError.internal("Unexpected Error"));
      }
      res.json("Product Removed Successfully");
    } catch (error) {
      next(error); // пробрасываем в error middleware
    }
  }

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      // Так как в Экспресс другая типизация то мы проверяем является ли он валидным чтобы сохранить
      const category =
        typeof req.query.category === "string" ? req.query.category : undefined;
      const location =
        typeof req.query.location === "string" ? req.query.location : undefined;
      const condition =
        typeof req.query.condition === "string"
          ? req.query.condition
          : undefined;
      const name =
        typeof req.query.name === "string" ? req.query.name : undefined;

      const tradePossible =
        req.query.tradePossible === "true"
          ? true
          : req.query.tradePossible === "false"
          ? false
          : undefined;

      const priceMin =
        typeof req.query.priceMin === "string"
          ? Number(req.query.priceMin)
          : undefined;
      const priceMax =
        typeof req.query.priceMax === "string"
          ? Number(req.query.priceMax)
          : undefined;

      const result = await ProductRepository.findProducts(
        category,
        location,
        condition,
        tradePossible,
        priceMin,
        priceMax,
        name
      );
      if (!result) {
        return next(ApiError.internal("Unexpected Error"));
      }
      res.json(result);
    } catch (error) {
      next(error); // пробрасываем в error middleware
    }
  }

  async searchOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const result = await ProductRepository.findById(id);

      if (!result) {
        return next(ApiError.internal("Unexpected Error"));
      }
      res.json(result);
    } catch (error) {
      next(error); // пробрасываем в error middleware
    }
  }
}

export default new ProductController();
