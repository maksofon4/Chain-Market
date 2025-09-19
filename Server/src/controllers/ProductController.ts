import { Request, Response, NextFunction } from "express";
import { ProductRepository } from "../repositories/ProductRepository";
import { UserRepository } from "../repositories/UserRepository";
import ApiError from "../error/ApiError";
import { SessionRequest } from "../models/express-session";

class ProductController {
  async uploading(req: SessionRequest, res: Response, next: NextFunction) {
    try {
      const {
        name,
        category,
        description,
        location,
        price,
        condition,
        tradePossible,
        email,
        phoneNumber,
      } = req.body;

      const { userId } = req.session;

      if (!userId) throw ApiError.badRequest("Not authenticated");

      const files = req.files as Express.Multer.File[];

      if (files.length === 0) {
        throw ApiError.internal("Failed to save product images");
      }

      const imageFilenames = files?.map((file) => file.filename) || [];

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
        images: imageFilenames,
      };

      console.log(newProduct);

      await ProductRepository.create(newProduct);

      res.json("Product Uploaded Successfully");
    } catch (error) {
      next(error); // пробрасываем в error middleware
    }
  }

  async getFavoriteProducts(
    req: SessionRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { userId } = req.session;

      if (!userId) {
        return next(ApiError.internal("Not authenticated"));
      }
      const user = await UserRepository.findOneById(userId);

      if (!user) throw ApiError.badRequest("Not authenticated");

      const productIds = user.selected_products;

      const result = await ProductRepository.findManyById(productIds);

      if (!result) {
        return next(ApiError.internal("Unexpected Error"));
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getPostedProducts(
    req: SessionRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { userId } = req.session;

      if (!userId) {
        throw ApiError.badRequest("Not Authenticated");
      }

      const result = await ProductRepository.findByUserId(userId);

      if (!result) {
        return next(ApiError.internal("Unexpected Error"));
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async removing(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.body;

      const product = await ProductRepository.findById(productId);

      if (!product) {
        throw ApiError.badRequest("The product does not exist");
      }

      await ProductRepository.remove(productId);

      res.json("Product Removed Successfully");
    } catch (error) {
      next(error); // пробрасываем в error middleware
    }
  }

  async search(req: Request, res: Response, next: NextFunction) {
    try {
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

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async searchOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) {
        throw ApiError.badRequest(`Expected product Id but got ${id}`);
      }

      const result = await ProductRepository.findById(id);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
  async getRecentProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductRepository.getRecentProducts(20);

      res.json(result);
    } catch (error) {
      next(error); // пробрасываем в error middleware
    }
  }
}

export default new ProductController();
