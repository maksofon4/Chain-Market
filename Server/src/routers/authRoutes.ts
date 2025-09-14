import { Router } from "express";
import { upload } from "../repositories/MediaRepository";

import AuthController from "../controllers/AuthController"; // path adjusted as needed
import UserProfileController from "../controllers/UserProfileController";

const router = Router();

router.post("/register", AuthController.registration);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logOut);
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

router.post(
  "/add-product-to-favorites",
  AuthController.authCheck,
  UserProfileController.addProductsToFavorites
);

router.post(
  "/remove-product-from-favorites",
  AuthController.authCheck,
  UserProfileController.removeProductsFromFavorites
);

module.exports = router;
