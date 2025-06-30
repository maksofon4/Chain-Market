import { Router } from "express";

import ProductController from "../controllers/ProductController";

const router = Router();

router.post("/upload-product", ProductController.uploading);

module.exports = router;
