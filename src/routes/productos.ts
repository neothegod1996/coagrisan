/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import express from "express";
import methodNotAllowed from "../middleware/methodNotAllowed.js";
import {retrieveProducto, retrieveProductos} from "../controllers/productos.js";
import {isAuthorized} from "../middleware/isAuthorized.js";

const router = express.Router();

router.get("/", [isAuthorized()], retrieveProductos);
router.get("/:id", [isAuthorized()], retrieveProducto);

// router.all("/productos", methodNotAllowed);
// router.all("/productos/:id", methodNotAllowed);

export default router;
