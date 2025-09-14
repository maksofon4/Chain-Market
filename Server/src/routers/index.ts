import { Router } from "express";
import session from "express-session";
const router = Router(); // просто вызываем функцию

const authRouter = require("./authRoutes");
const productRouter = require("./productRoutes");
const chatsRouter = require("./chatRoutes");
const usersRouter = require("./usersRoutes");

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
router.use(chatsRouter);
router.use(usersRouter);

module.exports = router;
