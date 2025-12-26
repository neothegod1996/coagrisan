/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import type {RetrieveTecnicoResponse, RetrieveTecnicosQueryParams} from "@coa/api-types";
import type {FieldPacket, RowDataPacket} from "mysql2/promise";
import {mysql} from "../config/mysql.js";

interface TecnicoQuery extends RowDataPacket {
	usuario_id: number;
	nombres: string;
	apellidos: string;
}

export async function retrieveTecnicos(filter: RetrieveTecnicosQueryParams): Promise<RetrieveTecnicoResponse[]> {
	// Construir la consulta dinámicamente según si hay límite o no
	let query = "SELECT * FROM `tecnico` WHERE (`nombres` LIKE ? OR `apellidos` LIKE ?)";
	let params: any[] = [
		`%${filter.contains ?? ""}%`,
		`%${filter.contains ?? ""}%`
	];
	
	// Si hay límite, agregar LIMIT y OFFSET
	if (filter.limit !== undefined && filter.limit !== null) {
		query += " LIMIT ? OFFSET ?";
		params.push(filter.limit, filter.offset ?? 0);
	} else if (filter.offset && filter.offset > 0) {
		// Si solo hay offset sin límite, usar un límite muy alto
		query += " LIMIT 999999 OFFSET ?";
		params.push(filter.offset);
	}
	
	const [tecnicoQuery]: [TecnicoQuery[], FieldPacket[]] = await mysql.query<TecnicoQuery[]>(query, params);
	
	return tecnicoQuery.map<RetrieveTecnicoResponse>(tecnico => ({
		id: tecnico.usuario_id,
		nombres: tecnico.nombres,
		apellidos: tecnico.apellidos
	}));
}
