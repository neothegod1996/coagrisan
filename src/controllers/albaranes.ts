/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import type {NextFunction, Request, Response} from "express";
import type {
	DuplicateAlbaranRequest,
	GenerarCuarentenaQueryParams,
	NewAlbaranAbonoRequest,
	NewAlbaranProductRequest,
	NewAlbaranRequest,
	NewItemResponse,
	RetrieveAlbaranesQueryParams,
	RetrieveAlbaranResponse,
	UpdateAlbaranRequest
} from "@coa/api-types";
import * as albaran from "../services/albaran.js";
import createHttpError from "http-errors";
import {mysql} from "../config/mysql.js";
import {retrieveUltimoSocioIdPlaceholder} from "../services/albaran.js";
import dayjs from "dayjs";

type IdParam = { id: string };

export async function newAlbaran(req: Request<{}, NewItemResponse, NewAlbaranRequest>, res: Response<NewItemResponse>, next: NextFunction) {
	try {
		const albaranId = await albaran.newAlbaran(req.body);
		res.json({id: albaranId});
	} catch (err: unknown) {
		next(err);
	}
}

export async function duplicateAlbaran(req: Request<IdParam, NewItemResponse[], DuplicateAlbaranRequest>, res: Response<NewItemResponse[]>, next: NextFunction) {
	try {
		const albaranIds = await albaran.duplicateAlbaran(req.body);
		if (albaranIds !== null) {
			res.json(albaranIds.map<NewItemResponse>(albaranId => ({
				id: albaranId
			})));
		} else
			next(createHttpError(404, "Albarán no encontrado"));
	} catch (err: unknown) {
		next(err);
	}
}

export async function retrieveAlbaran(req: Request<IdParam>, res: Response<RetrieveAlbaranResponse>, next: NextFunction) {
	const albaranObj = await albaran.retrieveAlbaran(req.params.id);
	if (albaranObj)
		res.json(albaranObj);
	else
		next(createHttpError(404, "Albaran no encontrado"));
}

export async function retrieveAlbaranes(req: Request<IdParam, RetrieveAlbaranResponse[], {}, RetrieveAlbaranesQueryParams>, res: Response<RetrieveAlbaranResponse[]>, next: NextFunction) {
	try {
		res.json(await albaran.retrieveAlbaranes(req.query));
	} catch (err: unknown) {
		next(err);
	}
}

export async function retrieveAlbaranPrimerListado(req: Request<IdParam>, res: Response<RetrieveAlbaranResponse>, next: NextFunction) {
	const fullId = await albaran.retrievePrimerListadoId(req.params.id);
	if (!fullId) {
		next(createHttpError(404, "Albaran no encontrado"));
		return;
	}

	const albaranObj = await albaran.retrieveAlbaran(fullId);
	if (albaranObj)
		res.json(albaranObj);
	else
		next(createHttpError(404, "Albaran no encontrado"));
}

export async function retrieveAlbaranListadoAnterior(req: Request<IdParam>, res: Response<RetrieveAlbaranResponse>, next: NextFunction) {
	const fullId = await albaran.retrieveListadoAnteriorId(req.params.id);
	if (!fullId) {
		next(createHttpError(404, "Albaran no encontrado"));
		return;
	}

	const albaranObj = await albaran.retrieveAlbaran(fullId);
	if (albaranObj)
		res.json(albaranObj);
	else
		next(createHttpError(404, "Albaran no encontrado"));
}

export async function retrieveAlbaranListadoSiguiente(req: Request<IdParam>, res: Response<RetrieveAlbaranResponse>, next: NextFunction) {
	const fullId = await albaran.retrieveListadoSiguienteId(req.params.id);
	if (!fullId) {
		next(createHttpError(404, "Albaran no encontrado"));
		return;
	}

	const albaranObj = await albaran.retrieveAlbaran(fullId);
	if (albaranObj)
		res.json(albaranObj);
	else
		next(createHttpError(404, "Albaran no encontrado"));
}

export async function retrieveAlbaranUltimoListado(req: Request<IdParam>, res: Response<RetrieveAlbaranResponse>, next: NextFunction) {
	const fullId = await albaran.retrieveUltimoListadoId(req.params.id);
	if (!fullId) {
		next(createHttpError(404, "Albaran no encontrado"));
		return;
	}

	const albaranObj = await albaran.retrieveAlbaran(fullId);
	if (albaranObj)
		res.json(albaranObj);
	else
		next(createHttpError(404, "Albaran no encontrado"));
}

export async function retrieveAlbaranSocioAnterior(req: Request<IdParam>, res: Response<RetrieveAlbaranResponse>, next: NextFunction) {
	const fullId = await albaran.retrieveSocioAnteriorId(req.params.id);
	if (!fullId) {
		next(createHttpError(404, "Albaran no encontrado"));
		return;
	}

	const albaranObj = await albaran.retrieveAlbaran(fullId);
	if (albaranObj)
		res.json(albaranObj);
	else
		next(createHttpError(404, "Albaran no encontrado"));
}

export async function retrieveAlbaranSocioSiguiente(req: Request<IdParam>, res: Response<RetrieveAlbaranResponse>, next: NextFunction) {
	const fullId = await albaran.retrieveSocioSiguienteId(req.params.id);
	if (!fullId) {
		next(createHttpError(404, "Albaran no encontrado"));
		return;
	}

	const albaranObj = await albaran.retrieveAlbaran(fullId);
	if (albaranObj)
		res.json(albaranObj);
	else
		next(createHttpError(404, "Albaran no encontrado"));
}

export async function retrievePlaceholder(req: Request<{}, {placeholder: string}, {}, {fincaId: string, socioId: string}>, res: Response<{placeholder: string}>, next: NextFunction) {
	try {
		res.json({placeholder: await retrieveUltimoSocioIdPlaceholder(parseInt(req.query.fincaId), parseInt(req.query.socioId))});
	} catch (err: unknown) {
		next(err);
	}
}

export async function updateAlbaran(req: Request<IdParam, {}, UpdateAlbaranRequest>, res: Response, next: NextFunction) {
	try {
		await albaran.updateAlbaran(req.params.id, req.body);
		res.status(204).end();
	} catch (err: unknown) {
		next(err);
	}
}

export async function deleteAlbaran(req: Request<IdParam>, res: Response, next: NextFunction) {
	try {
		await mysql.execute(
			"DELETE FROM `albaran` WHERE CONCAT(`anio`, `finca_id`, `socio_id`, `id`) = ?",
			[req.params.id]
		);
		res.status(204).end();
	} catch (err: unknown) {
		next(err);
	}
}

export async function newAlbaranProducts(req: Request<IdParam, {}, NewAlbaranProductRequest>, res: Response, next: NextFunction) {
	try {
		await albaran.newAlbaranProduct(req.params.id, req.body);
		res.status(204).end();
	} catch (err: unknown) {
		next(err);
	}
}

export async function deleteAlbaranProducts(req: Request<IdParam, {}, number[]>, res: Response, next: NextFunction) {
	try {
		const placeholders = req.body.map(() => "?").join(", ");
		await mysql.execute(
			`DELETE
			 FROM \`albaran_has_producto\`
			 WHERE CONCAT(\`albaran_anio\`, \`albaran_finca_id\`, \`albaran_socio_id\`, \`albaran_id\`) = ?
			   AND \`producto_id\` IN (${placeholders})`,
			(<any[]>[req.params.id]).concat(req.body)
		);

		res.status(204).end();
	} catch (err: unknown) {
		next(err);
	}
}

export async function newAlbaranAbonos(req: Request<IdParam, {}, NewAlbaranAbonoRequest>, res: Response, next: NextFunction) {
	try {
		await albaran.newAlbaranAbono(req.params.id, req.body);
		res.status(204).end();
	} catch (err: unknown) {
		next(err);
	}
}

export async function deleteAlbaranAbonos(req: Request<IdParam, {}, number[]>, res: Response, next: NextFunction) {
	try {
		const placeholders = req.body.map(() => "?").join(", ");
		await mysql.execute(
			`DELETE
			 FROM \`albaran_has_abono\`
			 WHERE CONCAT(\`albaran_anio\`, \`albaran_finca_id\`, \`albaran_socio_id\`, \`albaran_id\`) = ?
			   AND \`abono_id\` IN (${placeholders})`,
			(<any[]>[req.params.id]).concat(req.body)
		);

		res.status(204).end();
	} catch (err: unknown) {
		next(err);
	}
}

export async function generarCuarentena(req: Request<{}, string, {}, GenerarCuarentenaQueryParams>, res: Response<string>, next: NextFunction) {
	
	try {
		const { desde, hasta } = req.query;
		
		// Validar parámetros de fecha
		if (!desde || !hasta) {
			next(createHttpError(400, "Los parámetros 'desde' y 'hasta' son requeridos"));
			return;
		}

		const fechaDesde = dayjs(desde);
		const fechaHasta = dayjs(hasta);
		
		if (!fechaDesde.isValid() || !fechaHasta.isValid()) {
			next(createHttpError(400, "Formato de fecha inválido. Use YYYY-MM-DD"));
			return;
		}

		if (fechaDesde.isAfter(fechaHasta)) {
			next(createHttpError(400, "La fecha 'desde' debe ser anterior a 'hasta'"));
			return;
		}

		// Query para obtener albaranes con productos y sus plazos de seguimiento en el rango de fechas
		const queryProductos = `
			SELECT 
				a.socio_id,
				a.finca_id,
				a.fecha_ejecucion,
				p.plazo_seguimiento,
				s.nombre as socio_nombre,
				f.nombre as finca_nombre,
				'producto' as tipo_cuarentena
			FROM albaran a
			INNER JOIN albaran_has_producto ahp ON (
				a.id = ahp.albaran_id AND 
				a.socio_id = ahp.albaran_socio_id AND 
				a.finca_id = ahp.albaran_finca_id AND 
				a.anio = ahp.albaran_anio
			)
			INNER JOIN producto p ON ahp.producto_id = p.id
			INNER JOIN socio s ON a.socio_id = s.usuario_id
			INNER JOIN finca f ON a.finca_id = f.id
			WHERE a.fecha_ejecucion BETWEEN ? AND ?
			AND p.plazo_seguimiento IS NOT NULL
			AND p.plazo_seguimiento > 0
			ORDER BY a.socio_id, a.finca_id, a.fecha_ejecucion
		`;

		// Query para obtener albaranes marcados como "sin inventario" por sectores asociados
		const querySinInventario = `
			SELECT 
				a.socio_id,
				a.finca_id,
				a.fecha_ejecucion,
				999 as plazo_seguimiento,
				s.nombre as socio_nombre,
				f.nombre as finca_nombre,
				'sin_inventario' as tipo_cuarentena
			FROM albaran a
			INNER JOIN socio s ON a.socio_id = s.usuario_id
			INNER JOIN finca f ON a.finca_id = f.id
			INNER JOIN albaran_has_sector ahs ON ahs.albaran_id = a.id AND ahs.albaran_socio_id = a.socio_id AND ahs.albaran_finca_id = a.finca_id AND ahs.albaran_anio = a.anio
			INNER JOIN sector sec ON sec.id = ahs.sector_id AND sec.finca_id = ahs.albaran_finca_id
			WHERE a.fecha_ejecucion BETWEEN ? AND ?
			AND sec.sin_inventario = 1
			ORDER BY a.socio_id, a.finca_id, a.fecha_ejecucion
		`;

		const [rowsProductos] = await mysql.execute(queryProductos, [desde, hasta]);
		const [rowsSinInventario] = await mysql.execute(querySinInventario, [desde, hasta]);
		
		const albaranes = [...(rowsProductos as any[]), ...(rowsSinInventario as any[])];

		// Agrupar por socio_id + finca_id + fecha para sumar los plazos de seguridad
		const cuarentenaMap = new Map<string, {
			socioId: string;
			fincaId: string;
			fecha: string;
			totalDias: number;
			socioNombre: string;
			fincaNombre: string;
			sinInventario: boolean;
		}>();

		for (const albaran of albaranes) {
			const socioIdPadded = String(albaran.socio_id).padStart(4, '0');
			const fincaIdPadded = String(albaran.finca_id).padStart(4, '0');
			const fechaFormatted = dayjs(albaran.fecha_ejecucion).format('YYYYMMDD');
			
			const key = `${socioIdPadded}${fincaIdPadded}${fechaFormatted}`;
			const esSinInventario = albaran.tipo_cuarentena === 'sin_inventario';
			
			if (cuarentenaMap.has(key)) {
				const existing = cuarentenaMap.get(key)!;
				
				if (esSinInventario) {
					existing.sinInventario = true;
					existing.totalDias = 999;
				} else if (!existing.sinInventario) {
					existing.totalDias += albaran.plazo_seguimiento;
				}
			} else {
				cuarentenaMap.set(key, {
					socioId: socioIdPadded,
					fincaId: fincaIdPadded,
					fecha: fechaFormatted,
					totalDias: esSinInventario ? "INV" : albaran.plazo_seguimiento,
					socioNombre: albaran.socio_nombre,
					fincaNombre: albaran.finca_nombre,
					sinInventario: esSinInventario
				});
			}
		}

		let txtContent = '';

		const sortedEntries = Array.from(cuarentenaMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
		
		for (const [key, data] of sortedEntries) {
			txtContent += `${key}         ${data.totalDias}\n`;
		}

		if (sortedEntries.length === 0) {
			txtContent += `# No se encontraron albaranes con productos en cuarentena para el período especificado\n`;
		}

		res.attachment(req.query.filename ?? "cuarentena.txt");
		res.type("text/plain");
		res.send(txtContent);
	} catch (err: unknown) {
		next(err);
	}
}