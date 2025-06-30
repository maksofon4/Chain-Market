import { Router } from "express";
const router = Router(); // просто вызываем функцию

const authRouter = require("./authRoutes");
const productRouter = require("./productRoutes");

router.use(authRouter);
router.use(productRouter);

module.exports = router;
