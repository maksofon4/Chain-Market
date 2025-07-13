import { Router } from "express";

import AuthController from "../controllers/UserController"; // path adjusted as needed

const router = Router();

router.post("/register", AuthController.registration);
router.delete("/remove-user", AuthController.removing);
router.post("/login", AuthController.login);
router.get("/auth", AuthController.authCheck);

module.exports = router;
