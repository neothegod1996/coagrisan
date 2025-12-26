/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import express from "express";
import {isAuthorized} from "../middleware/isAuthorized.js";
import {bulkUpdateSectores, deleteSector, newSector, retrieveSector, retrieveSectores, updateSector} from "../controllers/sectores.js";

const router = express.Router();

router.get("/:fincaId", [isAuthorized()], retrieveSectores);
router.get("/:fincaId/:id", [isAuthorized()], retrieveSector);

router.post("/:fincaId", [isAuthorized()], newSector);
// Colocar rutas más específicas antes de las genéricas para evitar colisiones
router.patch("/:fincaId/bulk", [isAuthorized()], bulkUpdateSectores);
router.patch("/:fincaId/:id", [isAuthorized()], updateSector);
router.delete("/:fincaId/:id", [isAuthorized()], deleteSector);

export default router;
