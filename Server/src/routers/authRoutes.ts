import { Router } from "express";

import AuthController from "../controllers/AuthController"; // path adjusted as needed

const router = Router();

router.post("/register", AuthController.registration);
router.post("/login", AuthController.login);
router.get("/auth", AuthController.authCheck);

module.exports = router;
