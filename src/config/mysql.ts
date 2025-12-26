/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import mysql2 from "mysql2/promise";
import {envConfig} from "./env.js";

export const mysql = mysql2.createPool({
	host: envConfig.MYSQL_HOST,
	port: envConfig.MYSQL_PORT,
	user: envConfig.MYSQL_USER,
	password: envConfig.MYSQL_PASS,
	database: envConfig.MYSQL_DB,
	charset: "utf8mb4_unicode_ci"
});
