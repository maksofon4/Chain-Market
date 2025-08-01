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
router.delete("/remove-product", ProductController.removing);
router.get("/search/products/:id", ProductController.searchOne);
router.get("/recent-products", ProductController.getRecentProducts);

module.exports = router;
