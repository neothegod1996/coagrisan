/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import express from "express";
import methodNotAllowed from "../middleware/methodNotAllowed.js";
import {loginUser, logout} from "../controllers/users.js";

const router = express.Router();

router.post("/login", (req, res, next) => {
	loginUser(req, res, next);
});
router.get("/logout", logout);

// router.all("/user/login", methodNotAllowed);
// router.all("/user/logout", methodNotAllowed);

export default router;
