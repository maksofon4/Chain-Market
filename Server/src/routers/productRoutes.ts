import { Router } from "express";

import ProductController from "../controllers/ProductController";

const router = Router();

router.post("/upload-product", ProductController.uploading);
router.delete("/remove-product", ProductController.removing);

module.exports = router;
