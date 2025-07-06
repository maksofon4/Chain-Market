import { Router } from "express";
import session from "express-session";
const router = Router(); // просто вызываем функцию

const authRouter = require("./authRoutes");
const productRouter = require("./productRoutes");

router.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
    },
  })
);

router.use(authRouter);
router.use(productRouter);

module.exports = router;
