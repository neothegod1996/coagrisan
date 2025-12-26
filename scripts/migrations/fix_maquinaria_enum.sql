-- Migración para corregir la ortografía del ENUM maquinaria
-- Cambiar "pulveriador" por "pulverizador" (agregar la "z")
-- Fecha: 2025-01-25

USE `coagrisan`;

-- Paso 1: Agregar una columna temporal con el ENUM corregido
ALTER TABLE `albaran_has_producto` 
ADD COLUMN `maquinaria_temp` ENUM('pulverizador', 'espolvoreador', 'riego', 'mochila', 'siembra-manual') 
CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL DEFAULT 'pulverizador';

-- Paso 2: Copiar los datos de la columna original a la temporal, corrigiendo la ortografía
UPDATE `albaran_has_producto` 
SET `maquinaria_temp` = CASE 
    WHEN `maquinaria` = 'pulveriador' THEN 'pulverizador'
    WHEN `maquinaria` = 'espolvoreador' THEN 'espolvoreador'
    WHEN `maquinaria` = 'riego' THEN 'riego'
    WHEN `maquinaria` = 'mochila' THEN 'mochila'
    WHEN `maquinaria` = 'siembra-manual' THEN 'siembra-manual'
    ELSE 'pulverizador'  -- valor por defecto en caso de datos inesperados
END;

-- Paso 3: Eliminar la columna original
ALTER TABLE `albaran_has_producto` DROP COLUMN `maquinaria`;

-- Paso 4: Renombrar la columna temporal a la original
ALTER TABLE `albaran_has_producto` CHANGE COLUMN `maquinaria_temp` `maquinaria` 
ENUM('pulverizador', 'espolvoreador', 'riego', 'mochila', 'siembra-manual') 
CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL;

-- Verificar que la migración fue exitosa
SELECT DISTINCT `maquinaria` FROM `albaran_has_producto`;

-- Mostrar la nueva estructura de la tabla
SHOW CREATE TABLE `albaran_has_producto`;