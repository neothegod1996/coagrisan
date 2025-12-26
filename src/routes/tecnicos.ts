/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import express from "express";
import methodNotAllowed from "../middleware/methodNotAllowed.js";
import {retrieveTecnicos} from "../controllers/tecnicos.js";
import {isAuthorized} from "../middleware/isAuthorized.js";

const router = express.Router();

router.get("/", [isAuthorized()], retrieveTecnicos);

// router.all("/tecnicos", methodNotAllowed);

export default router;
