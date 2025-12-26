/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import {configDotenv} from "dotenv";
import * as path from "node:path";

configDotenv({
	path: [
		path.join(process.cwd(), ".env")
	],
	encoding: "utf8",
	debug: process.env.NODE_ENV === "development",
	override: false
});

/**
 * Retrieves the specified environment variable while making
 * its existence mandatory.
 * @param envkey
 */
function getEnvvar(envkey: string) : string {
	if (process.env[envkey])
		return process.env[envkey];
	else
		throw new Error(`Environment variable "${envkey}" is required, but is undefined.`);
}

export const envConfig = {
	DEBUG: process.env.DEBUG,
	SERVER_PORT: parseInt(process.env.SERVER_PORT || "3000"),
	MYSQL_HOST: getEnvvar("MYSQL_HOST"),
	MYSQL_PORT: parseInt(getEnvvar("MYSQL_PORT")),
	MYSQL_USER: getEnvvar("MYSQL_USER"),
	MYSQL_PASS: getEnvvar("MYSQL_PASS"),
	MYSQL_DB: getEnvvar("MYSQL_DB"),
	REDIS_HOST: getEnvvar("REDIS_HOST"),
	REDIS_DATABASE: parseInt(getEnvvar("REDIS_DATABASE")),
	REDIS_PASSWORD: "",
	SESSION_SECRET: getEnvvar("SESSION_SECRET"),
	BC_USER: getEnvvar("BC_USER"),
	BC_PASS: getEnvvar("BC_PASS"),
	BC_URL: getEnvvar("BC_URL"),
	// Opcional: algunas instancias de BC requieren especificar la compañía en la query string
	BC_COMPANY: process.env.BC_COMPANY
};
