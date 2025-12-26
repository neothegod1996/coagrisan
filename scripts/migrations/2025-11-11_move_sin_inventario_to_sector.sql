/*
 * Migración: Mover sin_inventario de albaran a sector
 * Fecha: 2025-11-11
 * Descripción: Añade `sin_inventario` a `sector` y elimina el campo en `albaran`.
 *              Incluye una migración de datos básica para marcar sectores
 *              de fincas que tuvieran algún albarán con sin_inventario=1.
 */

USE `coagrisan`;

-- Añadir campo sin_inventario a sectores
ALTER TABLE `sector`
  ADD COLUMN `sin_inventario` BIT(1) NOT NULL DEFAULT 0;

-- Migración de datos: marcar sectores de fincas con albaranes sin inventario
UPDATE `sector` s
INNER JOIN `albaran` a ON a.finca_id = s.finca_id
SET s.`sin_inventario` = 1
WHERE a.`sin_inventario` = 1;

-- Eliminar el campo sin_inventario de albarán (se mantiene motivo_sin_inventario)
ALTER TABLE `albaran`
  DROP COLUMN `sin_inventario`;

-- Verificar cambios
DESCRIBE `sector`;
DESCRIBE `albaran`;