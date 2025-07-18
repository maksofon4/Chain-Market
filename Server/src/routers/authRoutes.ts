import { Router } from "express";
import { upload } from "../repositories/MediaRepository";

import AuthController from "../controllers/UserController"; // path adjusted as needed
import UserProfileController from "../controllers/UserProfileController";

const router = Router();

router.post("/register", AuthController.registration);
router.delete("/remove-user", AuthController.removing);
router.post("/login", AuthController.login);
router.get("/auth", AuthController.authCheck, AuthController.sendUserData);
router.post(
  "/update-profile",
  AuthController.authCheck,
  UserProfileController.updateProfileInfo
);
router.post(
  "/update-profile-photo",
  AuthController.authCheck,
  upload.single("profilePhoto"),
  UserProfileController.updateProfilePhoto
);

module.exports = router;
