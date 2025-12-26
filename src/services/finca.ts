/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import type {RetrieveFincaResponse, RetrieveFincasQueryParams, RetrieveSectorResponse} from "@coa/api-types";
import {FieldPacket, RowDataPacket} from "mysql2/promise";
import {mysql} from "../config/mysql.js";
import * as utils from "../utils.js";

interface FincaQuery extends RowDataPacket {
    id: number;
    bc_id: string;
    nombre: string;
}

interface SectorQuery extends RowDataPacket {
    id: number;
    bc_id: string;
    finca_id: number;
    sin_inventario: Buffer;
}

export async function retrieveFincas(filter: RetrieveFincasQueryParams): Promise<RetrieveFincaResponse[]> {
	let query = "SELECT * FROM `finca` WHERE `nombre` LIKE ?";
	let params: any[] = [`%${filter.contains ?? ""}%`];

	if (filter.limit !== undefined) {
		query += " LIMIT ?";
		params.push(filter.limit);
		
		if (filter.offset !== undefined) {
			query += " OFFSET ?";
			params.push(filter.offset);
		}
	} else if (filter.offset !== undefined) {
		query += " LIMIT 18446744073709551615 OFFSET ?";
		params.push(filter.offset);
	}

	const [fincaQuery]: [FincaQuery[], FieldPacket[]] = await mysql.query<FincaQuery[]>(query, params);

	// Obtener todos los sectores para las fincas encontradas
	const fincaIds = fincaQuery.map(finca => finca.id);
	let sectores: SectorQuery[] = [];
	
	if (fincaIds.length > 0) {
		const placeholders = fincaIds.map(() => '?').join(',');
		const [sectorQuery]: [SectorQuery[], FieldPacket[]] = await mysql.query<SectorQuery[]>(
			`SELECT * FROM \`sector\` WHERE \`finca_id\` IN (${placeholders})`,
			fincaIds
		);
		sectores = sectorQuery;
	}

    return fincaQuery.map<RetrieveFincaResponse>(finca => {
        const fincaSectores = sectores.filter(sector => sector.finca_id === finca.id);
        return {
            id: finca.id,
            bc_id: finca.bc_id,
            nombre: finca.nombre,
            sectorIds: fincaSectores.map(sector => sector.id),
            sectores: fincaSectores.map<RetrieveSectorResponse>(sector => ({
                id: sector.id,
                bc_id: sector.bc_id,
                finca_id: sector.finca_id,
                sinInventario: utils.bitToBoolean(sector.sin_inventario)
            }))
        };
    });
}

export async function retrieveFinca(id: number): Promise<RetrieveFincaResponse> {
	const [fincaQuery]: [FincaQuery[], FieldPacket[]] = await mysql.query<FincaQuery[]>(
		"SELECT * FROM `finca` WHERE `id` = ?", [id]
	);

    const [sectorQuery]: [SectorQuery[], FieldPacket[]] = await mysql.query<SectorQuery[]>(
        "SELECT * FROM `sector` WHERE `finca_id` = ?", [id]
    );

    return {
        id: fincaQuery[0].id,
        bc_id: fincaQuery[0].bc_id,
        nombre: fincaQuery[0].nombre,
        sectorIds: sectorQuery.map(sector => sector.id),
        sectores: sectorQuery.map<RetrieveSectorResponse>(sector => ({
            id: sector.id,
            bc_id: sector.bc_id,
            finca_id: sector.finca_id,
            sinInventario: utils.bitToBoolean(sector.sin_inventario)
        }))
    };
}

// Buscar finca por bc_id (código de barras)
export async function retrieveFincaByBcId(bcId: string): Promise<RetrieveFincaResponse | null> {
	const [fincaQuery]: [FincaQuery[], FieldPacket[]] = await mysql.query<FincaQuery[]>(
		"SELECT * FROM `finca` WHERE `bc_id` LIKE ?", [`%${bcId}%`]
	);

	if (fincaQuery.length === 0) {
		return null;
	}

    const [sectorQuery]: [SectorQuery[], FieldPacket[]] = await mysql.query<SectorQuery[]>(
        "SELECT * FROM `sector` WHERE `finca_id` = ?", [fincaQuery[0].id]
    );

    return {
        id: fincaQuery[0].id,
        bc_id: fincaQuery[0].bc_id,
        nombre: fincaQuery[0].nombre,
        sectorIds: sectorQuery.map(sector => sector.id),
        sectores: sectorQuery.map<RetrieveSectorResponse>(sector => ({
            id: sector.id,
            bc_id: sector.bc_id,
            finca_id: sector.finca_id,
            sinInventario: utils.bitToBoolean(sector.sin_inventario)
        }))
    };
}
