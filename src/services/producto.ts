/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import type {RetrieveProductResponse, RetrieveProductsQueryParams} from "@coa/api-types";
import {FieldPacket, RowDataPacket} from "mysql2/promise";
import {mysql} from "../config/mysql.js";

export interface ProductoQuery extends RowDataPacket {
    id: number;
    bc_id: string;
    nombre: string;
    materia_activa: string;
    plazo_seguimiento: number;
    dosis: string;
    plaga: string;
}

export async function retrieveProductos(filter: RetrieveProductsQueryParams): Promise<RetrieveProductResponse[]> {
	// Construir la consulta dinámicamente según si hay límite o no
	let query = "SELECT * FROM `producto` WHERE `nombre` LIKE ?";
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
	
	const [productQuery]: [ProductoQuery[], FieldPacket[]] = await mysql.query<ProductoQuery[]>(query, params);
	
    return productQuery.map(product => ({
        id: product.id,
        bc_id: product.bc_id,
        nombre: product.nombre,
        materiaActiva: product.materia_activa,
        plazoSeguimiento: product.plazo_seguimiento,
        dosis: product.dosis,
        plaga: product.plaga
    }));
}

export async function retrieveProducto(id: number): Promise<RetrieveProductResponse | null> {
	const [productQuery]: [ProductoQuery[], FieldPacket[]] = await mysql.query<ProductoQuery[]>(
		"SELECT * FROM `producto` WHERE `id` = ?", [id]
	);

    if (productQuery.length > 0) {
        return {
            id: productQuery[0].id,
            bc_id: productQuery[0].bc_id,
            nombre: productQuery[0].nombre,
            materiaActiva: productQuery[0].materia_activa,
            plazoSeguimiento: productQuery[0].plazo_seguimiento,
            dosis: productQuery[0].dosis,
            plaga: productQuery[0].plaga
        };
    } else
        return null;
}
