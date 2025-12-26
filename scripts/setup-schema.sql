/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema coagrisan
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `coagrisan` ;

-- -----------------------------------------------------
-- Schema coagrisan
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `coagrisan` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci ;
USE `coagrisan` ;

-- -----------------------------------------------------
-- Table `coagrisan`.`usuario`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `coagrisan`.`usuario` ;

CREATE TABLE IF NOT EXISTS `coagrisan`.`usuario` (
	                                                 `id` MEDIUMINT(4) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT,
	                                                 `nombre_usuario` VARCHAR(255) NOT NULL,
	                                                 `clave_hash` BINARY(32) NOT NULL,
	                                                 `clave_salt` BINARY(16) NOT NULL,
	                                                 `rol` ENUM('tecnico', 'socio') NOT NULL,
	                                                 `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	                                                 PRIMARY KEY (`id`),
	                                                 UNIQUE INDEX `username_UNIQUE` (`nombre_usuario` ASC) VISIBLE)
	ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `coagrisan`.`socio`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `coagrisan`.`socio` ;

CREATE TABLE IF NOT EXISTS `coagrisan`.`socio` (
	                                               `usuario_id` MEDIUMINT(4) UNSIGNED ZEROFILL NOT NULL,
												   `bc_id` VARCHAR(20) NOT NULL,
	                                               `nombre` VARCHAR(255) NOT NULL,
	                                               PRIMARY KEY (`usuario_id`),
	                                               INDEX `socio_nombre_idx` (`nombre` ASC) VISIBLE,
	                                               INDEX `fk_socio_usuario_idx` (`usuario_id` ASC) VISIBLE,
	                                               CONSTRAINT `fk_socio_usuario`
		                                               FOREIGN KEY (`usuario_id`)
			                                               REFERENCES `coagrisan`.`usuario` (`id`)
			                                               ON DELETE NO ACTION
			                                               ON UPDATE NO ACTION)
	ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `coagrisan`.`finca`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `coagrisan`.`finca` ;

CREATE TABLE IF NOT EXISTS `coagrisan`.`finca` (
	                                               `id` SMALLINT(4) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT,
												   `bc_id` VARCHAR(20) NOT NULL,
	                                               `nombre` VARCHAR(255) NOT NULL,
	                                               PRIMARY KEY (`id`),
	                                               INDEX `finca_nombre_idx` (`nombre` ASC) VISIBLE)
	ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `coagrisan`.`tecnico`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `coagrisan`.`tecnico` ;

CREATE TABLE IF NOT EXISTS `coagrisan`.`tecnico` (
	                                                 `usuario_id` MEDIUMINT(4) UNSIGNED ZEROFILL NOT NULL,
	                                                 `nombres` VARCHAR(255) NOT NULL,
	                                                 `apellidos` VARCHAR(255) NOT NULL,
	                                                 PRIMARY KEY (`usuario_id`),
	                                                 INDEX `tecnico_nombre_completo_idx` (`nombres` ASC, `apellidos` ASC) INVISIBLE,
	                                                 INDEX `fk_tecnico_usuario_idx` (`usuario_id` ASC) VISIBLE,
	                                                 CONSTRAINT `fk_tecnico_usuario`
		                                                 FOREIGN KEY (`usuario_id`)
			                                                 REFERENCES `coagrisan`.`usuario` (`id`)
			                                                 ON DELETE NO ACTION
			                                                 ON UPDATE NO ACTION)
	ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `coagrisan`.`albaran`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `coagrisan`.`albaran` ;

CREATE TABLE IF NOT EXISTS `coagrisan`.`albaran` (
	                                                 `id` SMALLINT(3) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT,
	                                                 `socio_id` MEDIUMINT(4) UNSIGNED ZEROFILL NOT NULL,
	                                                 `finca_id` SMALLINT(4) UNSIGNED ZEROFILL NOT NULL,
	                                                 `anio` SMALLINT(4) UNSIGNED ZEROFILL NOT NULL,
	                                                 `tecnico_id` MEDIUMINT(4) UNSIGNED ZEROFILL NOT NULL,
	                                                 `fecha_instrucciones` DATE NOT NULL,
	                                                 `fecha_ejecucion` DATE NOT NULL,
	                                                 `plazo_ejecucion_dias` SMALLINT UNSIGNED NOT NULL,
	                                                 `ejecucion_pendiente` BIT(1) NOT NULL DEFAULT 1,
	                                                 `riego_ce` DECIMAL(2,1) UNSIGNED NOT NULL,
	                                                 `riego_lm2` DECIMAL(10,4) UNSIGNED NOT NULL,
	                                                 `riego_tiempo_minutos` SMALLINT UNSIGNED NOT NULL,
	                                                 `equilibrio` VARCHAR(255) NOT NULL,
	                                                 `duracion_plan_abono` ENUM('1semana', '15dias', '1mes', 'indefinido') NOT NULL DEFAULT 'indefinido',
	                                                 `tanque_dias_semana` SET('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo') NOT NULL,
	                                                 `labores_culturales` SET('eliminar-malas-hierbas', 'colocar-placas', 'despuntar', 'deshijar', 'deshojar', 'eliminar-plantas-viroticas', 'reponer-abejorros', 'entuturar', 'descolgar') NOT NULL,
	                                                 `observaciones` LONGTEXT NULL,
	                                                 `firma` VARCHAR(512) NOT NULL,
	                                                 `motivo_sin_inventario` TEXT NULL,
	                                                 PRIMARY KEY (`id`, `socio_id`, `finca_id`, `anio`),
	                                                 INDEX `fk_albaran_socio_idx` (`socio_id` ASC) VISIBLE,
	                                                 INDEX `fk_albaran_finca_idx` (`finca_id` ASC) VISIBLE,
	                                                 INDEX `fk_albaran_tecnico_idx` (`tecnico_id` ASC) VISIBLE,
	                                                 CONSTRAINT `fk_albaran_socio`
		                                                 FOREIGN KEY (`socio_id`)
			                                                 REFERENCES `coagrisan`.`socio` (`usuario_id`)
			                                                 ON DELETE CASCADE
			                                                 ON UPDATE CASCADE,
	                                                 CONSTRAINT `fk_albaran_finca`
		                                                 FOREIGN KEY (`finca_id`)
			                                                 REFERENCES `coagrisan`.`finca` (`id`)
			                                                 ON DELETE CASCADE
			                                                 ON UPDATE CASCADE,
	                                                 CONSTRAINT `fk_albaran_tecnico`
		                                                 FOREIGN KEY (`tecnico_id`)
			                                                 REFERENCES `coagrisan`.`tecnico` (`usuario_id`)
			                                                 ON DELETE CASCADE
			                                                 ON UPDATE CASCADE)
	ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `coagrisan`.`sector`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `coagrisan`.`sector` ;

CREATE TABLE IF NOT EXISTS `coagrisan`.`sector` (
	                                                `id` SMALLINT(4) UNSIGNED ZEROFILL NOT NULL,
											`bc_id` VARCHAR(20) NOT NULL,
	                                                `finca_id` SMALLINT(4) UNSIGNED ZEROFILL NOT NULL,
	                                                `sin_inventario` BIT(1) NOT NULL DEFAULT 0,
	                                                PRIMARY KEY (`id`, `finca_id`),
	                                                CONSTRAINT `fk_sector_finca`
		                                                FOREIGN KEY (`finca_id`)
			                                                REFERENCES `coagrisan`.`finca` (`id`)
			                                                ON DELETE CASCADE
			                                                ON UPDATE CASCADE)
	ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `coagrisan`.`albaran_has_sector`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `coagrisan`.`albaran_has_sector` ;

CREATE TABLE IF NOT EXISTS `coagrisan`.`albaran_has_sector` (
	                                                            `albaran_id` SMALLINT(3) UNSIGNED ZEROFILL NOT NULL,
	                                                            `albaran_socio_id` MEDIUMINT(4) UNSIGNED ZEROFILL NOT NULL,
	                                                            `albaran_finca_id` SMALLINT(4) UNSIGNED ZEROFILL NOT NULL,
	                                                            `albaran_anio` SMALLINT(4) UNSIGNED ZEROFILL NOT NULL,
	                                                            `sector_id` SMALLINT(4) UNSIGNED ZEROFILL NOT NULL,
	                                                            `activado` BIT(1) NOT NULL DEFAULT 0,
	                                                            PRIMARY KEY (`albaran_id`, `albaran_socio_id`, `albaran_finca_id`, `albaran_anio`, `sector_id`),
	                                                            INDEX `fk_albaran_has_sector_sector_idx` (`sector_id` ASC, `albaran_finca_id` ASC) INVISIBLE,
	                                                            INDEX `fk_albaran_has_sector_albaran_idx` (`albaran_id` ASC, `albaran_socio_id` ASC, `albaran_finca_id` ASC, `albaran_anio` ASC) VISIBLE,
	                                                            CONSTRAINT `fk_albaran_has_sector_albaran`
		                                                            FOREIGN KEY (`albaran_id` , `albaran_socio_id` , `albaran_finca_id` , `albaran_anio`)
			                                                            REFERENCES `coagrisan`.`albaran` (`id` , `socio_id` , `finca_id` , `anio`)
			                                                            ON DELETE CASCADE
			                                                            ON UPDATE CASCADE,
	                                                            CONSTRAINT `fk_albaran_has_sector_sector`
		                                                            FOREIGN KEY (`sector_id` , `albaran_finca_id`)
			                                                            REFERENCES `coagrisan`.`sector` (`id` , `finca_id`)
			                                                            ON DELETE CASCADE
			                                                            ON UPDATE CASCADE)
	ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `coagrisan`.`abono`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `coagrisan`.`abono` ;

CREATE TABLE IF NOT EXISTS `coagrisan`.`abono` (
	                                               `id` MEDIUMINT NOT NULL AUTO_INCREMENT,
												   `bc_id` VARCHAR(20) NOT NULL,
												   `bc_code` VARCHAR(40) NOT NULL,
	                                               `nombre` VARCHAR(255) NOT NULL,
	                                               PRIMARY KEY (`id`),
	                                               INDEX `abono_nombre_idx` (`nombre` ASC) VISIBLE)
	ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `coagrisan`.`albaran_has_abono`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `coagrisan`.`albaran_has_abono` ;

CREATE TABLE IF NOT EXISTS `coagrisan`.`albaran_has_abono` (
	                                                           `tanque` ENUM('A', 'B') NOT NULL,
	                                                           `albaran_id` SMALLINT(3) UNSIGNED ZEROFILL NOT NULL,
	                                                           `albaran_socio_id` MEDIUMINT(4) UNSIGNED ZEROFILL NOT NULL,
	                                                           `albaran_finca_id` SMALLINT(4) UNSIGNED ZEROFILL NOT NULL,
	                                                           `albaran_anio` SMALLINT(4) UNSIGNED ZEROFILL NOT NULL,
	                                                           `abono_id` MEDIUMINT NOT NULL,
	                                                           `kilos` DECIMAL(10,4) UNSIGNED NOT NULL,
	                                                           PRIMARY KEY (`tanque`, `albaran_id`, `albaran_socio_id`, `albaran_finca_id`, `albaran_anio`, `abono_id`),
	                                                           INDEX `fk_albaran_has_abono_abono_idx` (`abono_id` ASC) VISIBLE,
	                                                           INDEX `fk_albaran_has_abono_albaran_idx` (`albaran_id` ASC, `albaran_socio_id` ASC, `albaran_finca_id` ASC, `albaran_anio` ASC) VISIBLE,
	                                                           CONSTRAINT `fk_albaran_has_abono_albaran`
		                                                           FOREIGN KEY (`albaran_id` , `albaran_socio_id` , `albaran_finca_id` , `albaran_anio`)
			                                                           REFERENCES `coagrisan`.`albaran` (`id` , `socio_id` , `finca_id` , `anio`)
			                                                           ON DELETE CASCADE
			                                                           ON UPDATE CASCADE,
	                                                           CONSTRAINT `fk_albaran_has_abono_abono`
		                                                           FOREIGN KEY (`abono_id`)
			                                                           REFERENCES `coagrisan`.`abono` (`id`)
			                                                           ON DELETE CASCADE
			                                                           ON UPDATE CASCADE)
	ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `coagrisan`.`producto`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `coagrisan`.`producto` ;

CREATE TABLE IF NOT EXISTS `coagrisan`.`producto` (
	                                                  `id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
													  `bc_id` VARCHAR(20) NOT NULL,
													  `bc_code` VARCHAR(40) NOT NULL,
	                                                  `nombre` VARCHAR(255) NOT NULL,
	                                                  `materia_activa` VARCHAR(255) DEFAULT NULL,
	                                                  `plazo_seguimiento` MEDIUMINT UNSIGNED NULL DEFAULT NULL,
	                                                  `dosis` VARCHAR(255) DEFAULT NULL,
	                                                  `plaga` VARCHAR(255) DEFAULT NULL,
	                                                  PRIMARY KEY (`id`),
	                                                  INDEX `producto_nombre_idx` (`nombre` ASC) VISIBLE)
	ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `coagrisan`.`albaran_has_producto`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `coagrisan`.`albaran_has_producto` ;

CREATE TABLE IF NOT EXISTS `coagrisan`.`albaran_has_producto` (
	                                                              `albaran_id` SMALLINT(3) UNSIGNED ZEROFILL NOT NULL,
	                                                              `albaran_socio_id` MEDIUMINT(4) UNSIGNED ZEROFILL NOT NULL,
	                                                              `albaran_finca_id` SMALLINT(4) UNSIGNED ZEROFILL NOT NULL,
	                                                              `albaran_anio` SMALLINT(4) UNSIGNED ZEROFILL NOT NULL,
	                                                              `producto_id` MEDIUMINT UNSIGNED NOT NULL,
	                                                              `maquinaria` ENUM('pulverizador', 'espolvoreador', 'riego', 'mochila', 'siembra-manual') NOT NULL,
	                                                              `nivel` ENUM('alta', 'media', 'baja') NOT NULL DEFAULT 'alta',
	                                                              `gastos_l` MEDIUMINT UNSIGNED NOT NULL,
	                                                              PRIMARY KEY (`albaran_id`, `albaran_socio_id`, `albaran_finca_id`, `albaran_anio`, `producto_id`),
	                                                              INDEX `fk_albaran_has_producto_producto_idx` (`producto_id` ASC) VISIBLE,
	                                                              INDEX `fk_albaran_has_producto_albara_idx` (`albaran_id` ASC, `albaran_socio_id` ASC, `albaran_finca_id` ASC, `albaran_anio` ASC) VISIBLE,
	                                                              CONSTRAINT `fk_albaran_has_producto_albaran`
		                                                              FOREIGN KEY (`albaran_id` , `albaran_socio_id` , `albaran_finca_id` , `albaran_anio`)
			                                                              REFERENCES `coagrisan`.`albaran` (`id` , `socio_id` , `finca_id` , `anio`)
			                                                              ON DELETE CASCADE
			                                                              ON UPDATE CASCADE,
	                                                              CONSTRAINT `fk_albaran_has_producto_productos`
		                                                              FOREIGN KEY (`producto_id`)
			                                                              REFERENCES `coagrisan`.`producto` (`id`)
			                                                              ON DELETE CASCADE
			                                                              ON UPDATE CASCADE)
	ENGINE = InnoDB;

USE `coagrisan` ;

-- -----------------------------------------------------
-- procedure crear_usuario
-- -----------------------------------------------------

USE `coagrisan`;
DROP procedure IF EXISTS `coagrisan`.`crear_usuario`;

DELIMITER $$
USE `coagrisan`$$
CREATE PROCEDURE `crear_usuario` (
	IN `nombre_usuario` VARCHAR(255),
	IN `clave` VARCHAR(128),
	IN `rol` ENUM('tecnico', 'socio'),
	OUT `id` MEDIUMINT(4) UNSIGNED ZEROFILL
)
BEGIN
	SET @`salt` = RANDOM_BYTES(16);
	SET @`hashed_password` = UNHEX(SHA2(CONCAT((@`salt`), `clave`), 256));

	INSERT INTO `usuario` (`nombre_usuario`, `clave_hash`, `clave_salt`, `rol`) VALUES (`nombre_usuario`, @`hashed_password`, @`salt`, `rol`);

	SELECT LAST_INSERT_ID() INTO `id`;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure crear_tecnico
-- -----------------------------------------------------

USE `coagrisan`;
DROP procedure IF EXISTS `coagrisan`.`crear_tecnico`;

DELIMITER $$
USE `coagrisan`$$
CREATE PROCEDURE `crear_tecnico` (
	IN `nombres` VARCHAR(255),
	IN `apellidos` VARCHAR(255),
	IN `nombre_usuario` VARCHAR(255),
	IN `clave` VARCHAR(128)
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
		BEGIN
			ROLLBACK;
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User creation failed';
		END;

	START TRANSACTION;

	CALL crear_usuario(`nombre_usuario`, `clave`, 'tecnico', @`usuario_id`);

	INSERT INTO `tecnico` (`usuario_id`, `nombres`, `apellidos`) VALUES (@`usuario_id`, `nombres`, `apellidos`);

	COMMIT;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure crear_socio
-- -----------------------------------------------------

USE `coagrisan`;
DROP procedure IF EXISTS `coagrisan`.`crear_socio`;

DELIMITER $$
USE `coagrisan`$$
CREATE PROCEDURE `crear_socio` (
	IN `nombre` VARCHAR(255),
	IN `nombre_usuario` VARCHAR(255),
	IN `clave` VARCHAR(128)
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
		BEGIN
			ROLLBACK;
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User creation failed';
		END;

	START TRANSACTION;

	CALL crear_usuario(`nombre_usuario`, `clave`, 'socio', @`usuario_id`);

	INSERT INTO `socio` (`usuario_id`, `nombre`) VALUES (@`usuario_id`, `nombre`);

	COMMIT;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure clonar_albaran
-- -----------------------------------------------------

USE `coagrisan`;
DROP procedure IF EXISTS `coagrisan`.`clonar_albaran`;

DELIMITER $$
USE `coagrisan`$$
CREATE PROCEDURE `clonar_albaran`(
	IN `original_albaran_id` SMALLINT(3) UNSIGNED ZEROFILL,
	IN `original_albaran_socio_id` MEDIUMINT(4) UNSIGNED ZEROFILL,
	IN `original_albaran_finca_id` SMALLINT(4) UNSIGNED ZEROFILL,
	IN `original_albaran_anio` SMALLINT(4) UNSIGNED ZEROFILL,
	OUT `new_albaran_id` SMALLINT(3) UNSIGNED ZEROFILL
)
BEGIN

	DECLARE EXIT HANDLER FOR SQLEXCEPTION
		BEGIN
			ROLLBACK;
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User creation failed';
		END;

	START TRANSACTION;

	INSERT INTO `albaran` (`socio_id`,
	                       `finca_id`,
	                       `anio`,
	                       `tecnico_id`,
	                       `fecha_instrucciones`,
	                       `fecha_ejecucion`,
	                       `plazo_ejecucion_dias`,
	                       `ejecucion_pendiente`,
	                       `riego_ce`,
	                       `riego_lm2`,
	                       `riego_tiempo_minutos`,
	                       `equilibrio`,
	                       `duracion_plan_abono`,
	                       `tanque_dias_semana`,
	                       `labores_culturales`,
	                       `observaciones`,
	                       `firma`)
	SELECT `socio_id`,
	       `finca_id`,
	       `anio`,
	       `tecnico_id`,
	       `fecha_instrucciones`,
	       `fecha_ejecucion`,
	       `plazo_ejecucion_dias`,
	       `ejecucion_pendiente`,
	       `riego_ce`,
	       `riego_lm2`,
	       `riego_tiempo_minutos`,
	       `equilibrio`,
	       `duracion_plan_abono`,
	       `tanque_dias_semana`,
	       `labores_culturales`,
	       `observaciones`,
	       `firma`
	FROM `albaran`
	WHERE `id` = `original_albaran_id`
	  AND `socio_id` = `original_albaran_socio_id`
	  AND `finca_id` = `original_albaran_finca_id`
	  AND `anio` = `original_albaran_anio`;

	SELECT LAST_INSERT_ID() INTO `new_albaran_id`;

	INSERT INTO `albaran_has_abono` (`tanque`,
	                                 `albaran_id`,
	                                 `albaran_socio_id`,
	                                 `albaran_finca_id`,
	                                 `albaran_anio`,
	                                 `abono_id`,
	                                 `kilos`)
	SELECT `tanque`,
	       `new_albaran_id`,
	       `albaran_socio_id`,
	       `albaran_finca_id`,
	       `albaran_anio`,
	       `abono_id`,
	       `kilos`
	FROM `albaran_has_abono`
	WHERE `albaran_id` = `original_albaran_id`
	  AND `albaran_socio_id` = `original_albaran_socio_id`
	  AND `albaran_finca_id` = `original_albaran_finca_id`
	  AND `albaran_anio` = `original_albaran_anio`;

	INSERT INTO `albaran_has_producto` (`albaran_id`,
	                                    `albaran_socio_id`,
	                                    `albaran_finca_id`,
	                                    `albaran_anio`,
	                                    `producto_id`,
	                                    `maquinaria`,
	                                    `nivel`,
	                                    `gastos_l`)
	SELECT `new_albaran_id`,
	       `albaran_socio_id`,
	       `albaran_finca_id`,
	       `albaran_anio`,
	       `producto_id`,
	       `maquinaria`,
	       `nivel`,
	       `gastos_l`
	FROM `albaran_has_producto`
	WHERE `albaran_id` = `original_albaran_id`
	  AND `albaran_socio_id` = `original_albaran_socio_id`
	  AND `albaran_finca_id` = `original_albaran_finca_id`
	  AND `albaran_anio` = `original_albaran_anio`;

	INSERT INTO `albaran_has_sector` (`albaran_id`,
	                                  `albaran_socio_id`,
	                                  `albaran_finca_id`,
	                                  `albaran_anio`,
	                                  `sector_id`,
	                                  `activado`)
	SELECT `new_albaran_id`,
	       `albaran_socio_id`,
	       `albaran_finca_id`,
	       `albaran_anio`,
	       `sector_id`,
	       `activado`
	FROM `albaran_has_sector`
	WHERE `albaran_id` = `original_albaran_id`
	  AND `albaran_socio_id` = `original_albaran_socio_id`
	  AND `albaran_finca_id` = `original_albaran_finca_id`
	  AND `albaran_anio` = `original_albaran_anio`;

	COMMIT;

END$$

DELIMITER ;

-- -----------------------------------------------------
-- View `coagrisan`.`eager_albaran`
-- -----------------------------------------------------
DROP VIEW IF EXISTS `coagrisan`.`eager_albaran` ;
USE `coagrisan`;
CREATE  OR REPLACE VIEW `eager_albaran` AS
SELECT
	CONCAT(`albaran`.`anio`, `albaran`.`finca_id`, `albaran`.`socio_id`, `albaran`.`id`) AS `albaran_full_id`,
	`albaran`.`id` AS `albaran_id`,
	`albaran`.`socio_id`,
	`albaran`.`finca_id`,
	`albaran`.`anio`,
	`albaran`.`tecnico_id`,
	`albaran`.`fecha_instrucciones`,
	`albaran`.`fecha_ejecucion`,
	`albaran`.`plazo_ejecucion_dias`,
	`albaran`.`ejecucion_pendiente`,
	`albaran`.`riego_ce`,
	`albaran`.`riego_lm2`,
	`albaran`.`riego_tiempo_minutos`,
	`albaran`.`equilibrio`,
	`albaran`.`duracion_plan_abono`,
	`albaran`.`tanque_dias_semana`,
	`albaran`.`labores_culturales`,
	`albaran`.`observaciones`,
	`albaran`.`firma`,
	`socio`.`nombre` AS `socio_nombre`,
	`finca`.`nombre` AS `finca_nombre`,
	`tecnico`.`nombres` AS `tecnico_nombres`,
	`tecnico`.`apellidos` AS `tecnico_apellidos`
FROM
	`albaran`
		INNER JOIN `socio` ON CAST(albaran.socio_id AS UNSIGNED) = `socio`.`usuario_id`
		INNER JOIN `finca` ON CAST(albaran.finca_id AS UNSIGNED) = `finca`.`id`
		LEFT JOIN `tecnico` ON CAST(albaran.tecnico_id AS UNSIGNED) = `tecnico`.`usuario_id`;

-- -----------------------------------------------------
-- View `coagrisan`.`eager_albaran_has_sector`
-- -----------------------------------------------------
DROP VIEW IF EXISTS `coagrisan`.`eager_albaran_has_sector` ;
USE `coagrisan`;
CREATE  OR REPLACE VIEW `eager_albaran_has_sector` AS
SELECT
	*, CONCAT(`albaran_finca_id`, `sector_id`) AS `full_id`
FROM
	`albaran_has_sector`;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
