/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import type {RetrieveAbonoResponse, RetrieveAbonosQueryParams} from "@coa/api-types";
import {FieldPacket, RowDataPacket} from "mysql2/promise";
import {mysql} from "../config/mysql.js";

export interface AbonoQuery extends RowDataPacket {
	id: number;
	nombre: string;
}

export async function retrieveAbonos(filter: RetrieveAbonosQueryParams): Promise<RetrieveAbonoResponse[]> {
	// Construir la consulta dinámicamente según si hay límite o no
	let query = "SELECT * FROM `abono` WHERE `nombre` LIKE ?";
	let params: any[] = [`%${filter.contains ?? ""}%`];
	
	// Si hay límite, agregar LIMIT y OFFSET
	if (filter.limit !== undefined && filter.limit !== null) {
		query += " LIMIT ? OFFSET ?";
		params.push(filter.limit, filter.offset ?? 0);
	} else if (filter.offset && filter.offset > 0) {
		// Si solo hay offset sin límite, usar un límite muy alto
		query += " LIMIT 999999 OFFSET ?";
		params.push(filter.offset);
	}
	
	const [abonoQuery]: [AbonoQuery[], FieldPacket[]] = await mysql.query<AbonoQuery[]>(query, params);
	return abonoQuery;
}

export async function retrieveAbono(id: number): Promise<RetrieveAbonoResponse | null> {
	const [abonoQuery]: [AbonoQuery[], FieldPacket[]] = await mysql.query<AbonoQuery[]>(
		"SELECT * FROM `abono` WHERE `id` = ?", [id]
	);

	if (abonoQuery.length > 0)
		return abonoQuery[0];
	else
		return null;
}
