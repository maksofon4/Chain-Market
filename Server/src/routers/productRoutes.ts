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
router.get("/user-posted-products", ProductController.getPostedProducts);

module.exports = router;
