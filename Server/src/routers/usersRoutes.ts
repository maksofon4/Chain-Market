import { Router } from "express";

import UsersController from "../controllers/UsersController";

const router = Router();

router.post("/users-public-data", UsersController.sendUsersPublicData);

module.exports = router;
