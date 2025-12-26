/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import express from "express";
import {retrieveFinca, retrieveFincas, retrieveFincaByBcId} from "../controllers/fincas.js";
import {isAuthorized} from "../middleware/isAuthorized.js";

const router = express.Router();

router.get("/", [isAuthorized()], retrieveFincas);
router.get("/bc/:bcId", [isAuthorized()], retrieveFincaByBcId);
router.get("/:id", [isAuthorized()], retrieveFinca);

router.post("/", [isAuthorized(["tecnico"])], () => {});
router.patch("/:id", [isAuthorized(["tecnico"])], () => {});
router.delete("/:id", [isAuthorized(["tecnico"])], () => {});

export default router;
