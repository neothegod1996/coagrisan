/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import { mysql } from "../config/mysql.js";
import type { FieldPacket, RowDataPacket } from "mysql2/promise";
import type { UserRole } from "@coa/api-types";

export interface LoginQuery extends RowDataPacket {
	id: number;
	nombre_usuario: string;
	rol: UserRole;
}

export async function login(username: string, password: string): Promise<LoginQuery | null> {
	console.log(username, password)
	const [result]: [LoginQuery[], FieldPacket[]] = await mysql.query<LoginQuery[]>(
		"SELECT `id`, `nombre_usuario`, `rol` FROM `usuario` WHERE `nombre_usuario` = ? AND `clave_hash` = UNHEX(SHA2(CONCAT(`clave_salt`, ?), 256))",
		[username, password]
	);

	if (result.length > 0) return result[0];
	else return null;
}