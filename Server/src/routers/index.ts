import { Router } from "express";
const router = Router(); // просто вызываем функцию

const authRouter = require("./authRoutes");

router.use(authRouter);

module.exports = router;
