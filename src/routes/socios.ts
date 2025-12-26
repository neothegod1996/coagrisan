/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import express from "express";
import {retrieveSocio, retrieveSocios, retrieveSocioByBcId} from "../controllers/socios.js";
import {isAuthorized} from "../middleware/isAuthorized.js";

const router = express.Router();

router.get("/", [isAuthorized()], retrieveSocios);
router.get("/bc/:bcId", [isAuthorized()], retrieveSocioByBcId);
router.get("/:id", [isAuthorized()], retrieveSocio);

/*router.post("/socios", () => {});
router.patch("/socio/:id", () => {});
router.delete("/socio/:id", () => {});*/

export default router;
