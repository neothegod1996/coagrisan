/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import express from "express";
import {
	duplicateAlbaran,
	deleteAlbaran,
	deleteAlbaranAbonos,
	deleteAlbaranProducts,
	newAlbaran,
	newAlbaranAbonos,
	newAlbaranProducts,
	retrieveAlbaran,
	retrieveAlbaranes,
	retrieveAlbaranListadoAnterior, retrieveAlbaranListadoSiguiente,
	retrieveAlbaranPrimerListado,
	retrieveAlbaranSocioAnterior,
	retrieveAlbaranSocioSiguiente, retrieveAlbaranUltimoListado,
	updateAlbaran, generarCuarentena, retrievePlaceholder
} from "../controllers/albaranes.js";
import methodNotAllowed from "../middleware/methodNotAllowed.js";
import {isAuthorized} from "../middleware/isAuthorized.js";

const router = express.Router();

router.get("/", [isAuthorized()], retrieveAlbaranes);
// Rutas específicas DEBEN ir antes que las rutas con parámetros dinámicos
router.get("/placeholder", [isAuthorized()], retrievePlaceholder);
router.get("/cuarentena", [isAuthorized()], generarCuarentena);
// Rutas con parámetros dinámicos van después
router.get("/:id", [isAuthorized()], retrieveAlbaran);
router.get("/:id/primer-listado", [isAuthorized()], retrieveAlbaranPrimerListado);
router.get("/:id/listado-anterior", [isAuthorized()], retrieveAlbaranListadoAnterior);
router.get("/:id/listado-siguiente", [isAuthorized()], retrieveAlbaranListadoSiguiente);
router.get("/:id/ultimo-listado", [isAuthorized()], retrieveAlbaranUltimoListado);
router.get("/:id/socio-anterior", [isAuthorized()], retrieveAlbaranSocioAnterior);
router.get("/:id/socio-siguiente", [isAuthorized()], retrieveAlbaranSocioSiguiente);

router.post("/", [isAuthorized(["tecnico"])], newAlbaran);
router.post("/duplicate", [isAuthorized(["tecnico"])], duplicateAlbaran);
router.patch("/:id", [isAuthorized(["tecnico"])], updateAlbaran);
router.delete("/:id", [isAuthorized(["tecnico"])], deleteAlbaran);

router.post("/:id/productos", [isAuthorized(["tecnico"])], newAlbaranProducts);
router.delete("/:id/productos", [isAuthorized(["tecnico"])], deleteAlbaranProducts);

router.post("/:id/abonos", [isAuthorized(["tecnico"])], newAlbaranAbonos);
router.delete("/:id/abonos", [isAuthorized(["tecnico"])], deleteAlbaranAbonos);

// router.all("/albaranes", methodNotAllowed);
// router.all("/albaran/:id", methodNotAllowed);
// router.all("/albaran/:id/producto", methodNotAllowed);
// router.all("/albaran/:id/abono", methodNotAllowed);

export default router;
