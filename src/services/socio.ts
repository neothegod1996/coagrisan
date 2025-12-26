/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import type {RetrieveSocioResponse, RetrieveSociosQueryParams} from "@coa/api-types";
import type {FieldPacket, RowDataPacket} from "mysql2/promise";
import {mysql} from "../config/mysql.js";

interface SocioQuery extends RowDataPacket {
    usuario_id: number;
    nombre: string;
    bc_id: string;
}

export async function retrieveSocios(filter: RetrieveSociosQueryParams): Promise<RetrieveSocioResponse[]> {
	// Construir la consulta dinámicamente según si hay límite o no
	let query = "SELECT * FROM `socio` WHERE `nombre` LIKE ?";
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
	
	const [sociosQuery]: [SocioQuery[], FieldPacket[]] = await mysql.query<SocioQuery[]>(query, params);

    return sociosQuery.map<RetrieveSocioResponse>(socio => ({
        id: socio.usuario_id,
        nombre: socio.nombre,
        bc_id: socio.bc_id
    }));
}

export async function retrieveSocio(id: number): Promise<RetrieveSocioResponse | null> {
    const [sociosQuery]: [SocioQuery[], FieldPacket[]] = await mysql.query<SocioQuery[]>(
        "SELECT `usuario_id`, `nombre`, `bc_id` FROM `socio` WHERE `usuario_id` = ?", [id]
    );

    if (sociosQuery.length) {
        return {
            id: sociosQuery[0].usuario_id,
            nombre: sociosQuery[0].nombre,
            bc_id: sociosQuery[0].bc_id
        }
    } else
        return null;
}

// Buscar socio por bc_id (código de barras)
export async function retrieveSocioByBcId(bcId: string): Promise<RetrieveSocioResponse | null> {
    const [sociosQuery]: [SocioQuery[], FieldPacket[]] = await mysql.query<SocioQuery[]>(
        "SELECT `usuario_id`, `nombre`, `bc_id` FROM `socio` WHERE `bc_id` LIKE ?", [`%${bcId}%`]
    );

    if (sociosQuery.length) {
        return {
            id: sociosQuery[0].usuario_id,
            nombre: sociosQuery[0].nombre,
            bc_id: sociosQuery[0].bc_id
        }
    } else
        return null;
}
