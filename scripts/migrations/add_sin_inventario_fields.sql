/*
 * Migración: Agregar campos sin_inventario y motivo_sin_inventario a tabla albaran
 * Fecha: 2025-10-17
 * Descripción: Permite marcar albaranes donde no se ha realizado inventario,
 *              bloqueando la finca en cuarentena hasta que se entregue.
 */

USE `coagrisan`;

-- Agregar campo sin_inventario
ALTER TABLE `albaran` 
ADD COLUMN `sin_inventario` BIT(1) NOT NULL DEFAULT 0 AFTER `firma`;

-- Agregar campo motivo_sin_inventario
ALTER TABLE `albaran` 
ADD COLUMN `motivo_sin_inventario` TEXT NULL AFTER `sin_inventario`;

-- Verificar los cambios
DESCRIBE `albaran`;

