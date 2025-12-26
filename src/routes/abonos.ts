/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import express from "express";
import methodNotAllowed from "../middleware/methodNotAllowed.js";
import {retrieveAbono, retrieveAbonos} from "../controllers/abonos.js";
import {isAuthorized} from "../middleware/isAuthorized.js";

const router = express.Router();

router.get("/", [isAuthorized()], retrieveAbonos);
router.get("/:id", [isAuthorized()], retrieveAbono);

// router.all("/abonos", methodNotAllowed);
// router.all("/abonos/:id", methodNotAllowed);

export default router;
