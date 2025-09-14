import { Router } from "express";
import { upload } from "../repositories/MediaRepository";
import AuthController from "../controllers/AuthController";
import ProductController from "../controllers/ProductController";

const router = Router();

router.post(
  "/upload-product",
  AuthController.authCheck,
  upload.array("images"),
  ProductController.uploading
);
router.delete("/delete-product", ProductController.removing);
router.get("/search/products/:id", ProductController.searchOne);
router.get("/recent-products", ProductController.getRecentProducts);
router.get(
  "/user-posted-products",
  AuthController.authCheck,
  ProductController.getPostedProducts
);
router.get(
  "/user-favorite-products",
  AuthController.authCheck,
  ProductController.getFavoriteProducts
);
router.get("/search-products", ProductController.search);

module.exports = router;
