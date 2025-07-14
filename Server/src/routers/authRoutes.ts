import { Router } from "express";
import { upload } from "../repositories/MediaRepository";

import AuthController from "../controllers/UserController"; // path adjusted as needed

const router = Router();

router.post("/register", AuthController.registration);
router.delete("/remove-user", AuthController.removing);
router.post("/login", AuthController.login);
router.get("/auth", AuthController.authCheck, AuthController.sendUserData);
// router.post(
//   "/update-profile-photo",
//   AuthController.authCheck, // авторизация
//   upload.single("profilePhoto"), // обработка файла
//   AuthController.updateProfilePhoto // логика
// );
router.post(
  "/update-profile-photo",
  (req, res, next) => {
    console.log("➡ reached router");
    next();
  },
  upload.single("profilePhoto"),
  (req, res, next) => {
    console.log("➡ multer passed");
    console.log("FILE:", req.file);
    console.log("BODY:", req.body);
    next();
  },
  AuthController.updateProfilePhoto
);

module.exports = router;
