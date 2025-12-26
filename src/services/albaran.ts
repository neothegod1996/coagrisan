/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import {mysql} from "../config/mysql.js";
import type {ResultSetHeader, RowDataPacket} from "mysql2/promise";
import type {FieldPacket} from "mysql2/promise";
import type {
	AlbaranAbonoType,
	AlbaranDiasSemana,
	AlbaranDuracionPlanAbono,
	AlbaranLaboresCulturales,
	AlbaranMaquinaria,
	AlbaranNivel,
	AlbaranProductType, DuplicateAlbaranRequest,
	NewAlbaranAbonoRequest,
	NewAlbaranProductRequest,
	NewAlbaranRequest,
	RetrieveAbonoResponse,
	RetrieveAlbaranesQueryParams,
	RetrieveAlbaranResponse,
	RetrieveProductResponse,
	UpdateAlbaranRequest
} from "@coa/api-types";
import * as utils from "../utils.js";
import {ProductoQuery} from "./producto.js";
import {AbonoQuery} from "./abono.js";

interface AlbaranSectorQuery extends RowDataPacket {
	albaran_finca_id: number;
	sector_id: number;
	full_id: string;
	activado: Buffer;
	sin_inventario: Buffer;
}

interface AlbaranProductoQuery extends ProductoQuery {
	maquinaria: AlbaranMaquinaria;
	nivel: AlbaranNivel;
	gastos_l: number;
}

interface AlbaranAbonoQuery extends AbonoQuery {
	tanque: "A" | "B";
	kilos: number;
}

interface AlbaranFullIdQuery extends RowDataPacket {
	albaran_full_id: string;
}

interface AlbaranViewQuery extends AlbaranFullIdQuery {
	albaran_id: number;
	socio_id: number;
	finca_id: number;
	anio: number;
	tecnico_id: number;
	fecha_instrucciones: Date;
	fecha_ejecucion: Date;
	plazo_ejecucion_dias: number;
	ejecucion_pendiente: Buffer;
	riego_ce: number;
	riego_lm2: number;
	riego_tiempo_minutos: number;
	equilibrio: string;
	duracion_plan_abono: AlbaranDuracionPlanAbono;
	tanque_dias_semana: string;
	labores_culturales: string;
	observaciones: string;
	firma: string;
	motivo_sin_inventario: string | null;
	socio_nombre: string;
	finca_nombre: string;
	tecnico_nombres: string;
	tecnico_apellidos: string;
}

export interface AlbaranCompositeId {
	albaranId: number;
	socioId: number;
	fincaId: number;
	anio: number;
}

interface LastIdQuery extends RowDataPacket {
	id: number;
}

function convertQueryToAlbaran(albaranView: AlbaranViewQuery, sectorQuery: AlbaranSectorQuery[], productoQuery: AlbaranProductoQuery[], abonoQuery: AlbaranAbonoQuery[]): RetrieveAlbaranResponse {
	return {
		general: {
			socioId: albaranView.socio_id,
			fincaId: albaranView.finca_id,
			anio: albaranView.anio,
			sectoresActivados: sectorQuery.filter(sector => utils.bitToBoolean(sector.activado)).map(sector => sector.sector_id),
			tecnicoId: albaranView.tecnico_id,
			fechaInstrucciones: albaranView.fecha_instrucciones.toISOString().split("T")[0],
			fechaEjecucion: albaranView.fecha_ejecucion.toISOString().split("T")[0],
			plazoEjecucionDias: albaranView.plazo_ejecucion_dias,
			pendiente: utils.bitToBoolean(albaranView.ejecucion_pendiente),
			sinInventario: sectorQuery.some(sector => utils.bitToBoolean(sector.sin_inventario)),
			motivoSinInventario: albaranView.motivo_sin_inventario ?? undefined
		},
		productos: productoQuery.map<AlbaranProductType>(producto => ({
			productoId: producto.id,
			maquinaria: producto.maquinaria,
			nivel: producto.nivel,
			gastosL: producto.gastos_l
		})),
		abono: {
			tanqueA: abonoQuery.filter(abono => abono.tanque === "A").map<AlbaranAbonoType>(abono => ({
				abonoId: abono.id,
				kilos: abono.kilos
			})),
			tanqueB: abonoQuery.filter(abono => abono.tanque === "B").map<AlbaranAbonoType>(abono => ({
				abonoId: abono.id,
				kilos: abono.kilos
			}))
		},
		riego: {
			ce: albaranView.riego_ce,
			lm2: albaranView.riego_lm2,
			tiempoRiegoMin: albaranView.riego_tiempo_minutos,
			equilibrio: albaranView.equilibrio,
			duracionPlanAbono: albaranView.duracion_plan_abono,
			tanqueDiasSemana: <AlbaranDiasSemana[]>albaranView.tanque_dias_semana.split(",")
		},
		laboresCulturales: <AlbaranLaboresCulturales[]>albaranView.labores_culturales.split(","),
		observaciones: albaranView.observaciones,
		firma: albaranView.firma,
		albaranId: albaranView.albaran_id,
		albaranFullId: albaranView.albaran_full_id,
		view: {
			socioNombre: albaranView.socio_nombre,
			fincaNombre: albaranView.finca_nombre,
			tecnicoNombres: albaranView.tecnico_nombres,
			tecnicoApellidos: albaranView.tecnico_apellidos,
			sectorIds: sectorQuery.map(sector => sector.sector_id),
			sectorFullIds: sectorQuery.map(sector => sector.full_id),
            productos: productoQuery.map<RetrieveProductResponse>(producto => ({
                dosis: producto.dosis,
                id: producto.id,
                bc_id: producto.bc_id,
                materiaActiva: producto.materia_activa,
                nombre: producto.nombre,
                plaga: producto.plaga,
                plazoSeguimiento: producto.plazo_seguimiento
            })),
			abonos: abonoQuery.map<RetrieveAbonoResponse>(abono => ({
				id: abono.id,
				nombre: abono.nombre
			}))
		}
	};
}

export async function newAlbaran(albaran: NewAlbaranRequest) {
	const conn = await mysql.getConnection();
	try {
		await conn.beginTransaction();
		const [albaranResult]: [ResultSetHeader, FieldPacket[]] = await conn.execute<ResultSetHeader>(
			"INSERT INTO `albaran` (`socio_id`, `finca_id`, `anio`, `tecnico_id`, `fecha_instrucciones`, `fecha_ejecucion`, `plazo_ejecucion_dias`, `ejecucion_pendiente`, `riego_ce`, `riego_lm2`, `riego_tiempo_minutos`, `equilibrio`, `duracion_plan_abono`, `tanque_dias_semana`, `labores_culturales`, `observaciones`, `firma`, `motivo_sin_inventario`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			[
				albaran.general.socioId,
				albaran.general.fincaId,
				albaran.general.anio,
				albaran.general.tecnicoId,
				albaran.general.fechaInstrucciones,
				albaran.general.fechaEjecucion,
				albaran.general.plazoEjecucionDias,
				utils.booleanToBit(albaran.general.pendiente),
				albaran.riego.ce,
				albaran.riego.lm2,
				albaran.riego.tiempoRiegoMin,
				albaran.riego.equilibrio,
				albaran.riego.duracionPlanAbono,
				albaran.riego.tanqueDiasSemana.join(","),
				albaran.laboresCulturales.join(","),
				albaran.observaciones ?? null,
				albaran.firma,
				albaran.general.motivoSinInventario ?? null
			]
		);

		const albaranId: number = albaranResult.insertId;

		const [sectorResult]: [AlbaranSectorQuery[], FieldPacket[]] = await conn.query<AlbaranSectorQuery[]>(
			"SELECT * FROM `sector` WHERE `finca_id` = ?", [albaran.general.fincaId]
		);

		if (sectorResult.length > 0) {
			await conn.query(
				"INSERT INTO `albaran_has_sector` (`albaran_id`, `albaran_socio_id`, `albaran_finca_id`, `albaran_anio`, `sector_id`, `activado`) VALUES ?",
				[sectorResult.map(sector => [
					albaranId,
					albaran.general.socioId,
					albaran.general.fincaId,
					albaran.general.anio,
					sector.id,
					utils.booleanToBit(albaran.general.sectoresActivados.includes(sector.id))
				])]
			);
		}

		if (albaran.productos.length > 0) {
			// Validar y limpiar datos antes del INSERT
			const validMaquinarias: AlbaranMaquinaria[] = ["pulverizador", "espolvoreador", "riego", "mochila", "siembra-manual"];
			
			await conn.query(
				"INSERT INTO `albaran_has_producto` (`albaran_id`, `albaran_socio_id`, `albaran_finca_id`, `albaran_anio`, `producto_id`, `maquinaria`, `nivel`, `gastos_l`) VALUES ?",
				[albaran.productos.map(producto => {
					// Limpiar y validar maquinaria
					const maquinariaLimpia = producto.maquinaria?.toString().trim() as AlbaranMaquinaria;
					
					if (!validMaquinarias.includes(maquinariaLimpia)) {
						throw new Error(`Valor de maquinaria inválido: "${producto.maquinaria}". Valores permitidos: ${validMaquinarias.join(", ")}`);
					}
					
					return [
						albaranId,
						albaran.general.socioId,
						albaran.general.fincaId,
						albaran.general.anio,
						producto.productoId,
						maquinariaLimpia,
						producto.nivel,
						producto.gastosL
					];
				})]
			);
		}

		let abonos = albaran.abono.tanqueA.map(abono => [
			"A",
			albaranId,
			albaran.general.socioId,
			albaran.general.fincaId,
			albaran.general.anio,
			abono.abonoId,
			abono.kilos
		]).concat(
			albaran.abono.tanqueB.map(abono => [
				"B",
				albaranId,
				albaran.general.socioId,
				albaran.general.fincaId,
				albaran.general.anio,
				abono.abonoId,
				abono.kilos
			]));

		if (abonos.length > 0) {
			await conn.query(
				"INSERT INTO `albaran_has_abono` (`tanque`, `albaran_id`, `albaran_socio_id`, `albaran_finca_id`, `albaran_anio`, `abono_id`, `kilos`) VALUES ?",
				[abonos]
			);
		}

		await conn.commit();

		return albaranId;
	} catch (err: unknown) {
console.log(err);
		await conn.rollback();
		throw err;
	} finally {
		conn.release();
	}
}

export async function duplicateAlbaran(data: DuplicateAlbaranRequest) {
	let [albaranQuery]: [AlbaranViewQuery[], FieldPacket[]] = await mysql.query<AlbaranViewQuery[]>(
		"SELECT `albaran_id`, `socio_id`, `finca_id`, `anio` FROM `eager_albaran` WHERE (`socio_id` BETWEEN ? AND ?) AND (`fecha_instrucciones` BETWEEN ? AND ?)",
		[data.socioDesdeId, data.socioHastaId, data.fechaDesde, data.fechaHasta]
	);

	if (albaranQuery.length <= 0)
		return null;

	let newIds: number[] = [];

	for (const albaranView of albaranQuery) {
		await mysql.execute(
			"CALL clonar_albaran(?, ?, ?, ?, @copied_albaran_id)",
			[albaranView.albaran_id, albaranView.socio_id, albaranView.finca_id, albaranView.anio]
		);

		const [lastId]: [LastIdQuery[], FieldPacket[]] = await mysql.query<LastIdQuery[]>("SELECT @copied_albaran_id AS `albaranId`");
		newIds.push(lastId[0].id);
	}

	return newIds;
}

export async function retrievePrimerListadoId(referenceFrameId: string) {
	let [albaranQuery]: [AlbaranViewQuery[], FieldPacket[]] = await mysql.query<AlbaranViewQuery[]>(
		"SELECT `socio_id`, `albaran_id`, `albaran_full_id` FROM `eager_albaran` WHERE `albaran_full_id` = ?", [referenceFrameId]
	);

	if (albaranQuery[0].length <= 0) {
		return null;
	}

	let [previousQuery]: [AlbaranFullIdQuery[], FieldPacket[]] = await mysql.query<AlbaranFullIdQuery[]>(
		"SELECT `albaran_full_id` FROM `eager_albaran` ORDER BY `albaran_full_id` LIMIT 1;"
	);

	if (previousQuery.length <= 0) {
		return null;
	}

	return previousQuery[0].albaran_full_id;
}

export async function retrieveListadoAnteriorId(referenceFrameId: string) {
	let [albaranQuery]: [AlbaranViewQuery[], FieldPacket[]] = await mysql.query<AlbaranViewQuery[]>(
		"SELECT `socio_id`, `albaran_id`, `albaran_full_id` FROM `eager_albaran` WHERE `albaran_full_id` = ?", [referenceFrameId]
	);

	if (albaranQuery[0].length <= 0) {
		return null;
	}

	let [previousQuery]: [AlbaranFullIdQuery[], FieldPacket[]] = await mysql.query<AlbaranFullIdQuery[]>(
		"SELECT `albaran_full_id` FROM `eager_albaran` WHERE `albaran_full_id` < ? ORDER BY `albaran_full_id` DESC LIMIT 1;",
		[albaranQuery[0].albaran_full_id]
	);

	if (previousQuery.length <= 0) {
		return null;
	}

	return previousQuery[0].albaran_full_id;
}

export async function retrieveListadoSiguienteId(referenceFrameId: string) {
	let [albaranQuery]: [AlbaranViewQuery[], FieldPacket[]] = await mysql.query<AlbaranViewQuery[]>(
		"SELECT `socio_id`, `albaran_id`, `albaran_full_id` FROM `eager_albaran` WHERE `albaran_full_id` = ?", [referenceFrameId]
	);

	if (albaranQuery[0].length <= 0) {
		return null;
	}

	let [previousQuery]: [AlbaranFullIdQuery[], FieldPacket[]] = await mysql.query<AlbaranFullIdQuery[]>(
		"SELECT `albaran_full_id` FROM `eager_albaran` WHERE `albaran_full_id` > ? ORDER BY `albaran_full_id` LIMIT 1;",
		[albaranQuery[0].albaran_full_id]
	);

	if (previousQuery.length <= 0) {
		return null;
	}

	return previousQuery[0].albaran_full_id;
}

export async function retrieveUltimoListadoId(referenceFrameId: string) {
	let [albaranQuery]: [AlbaranViewQuery[], FieldPacket[]] = await mysql.query<AlbaranViewQuery[]>(
		"SELECT `socio_id`, `albaran_id`, `albaran_full_id` FROM `eager_albaran` WHERE `albaran_full_id` = ?", [referenceFrameId]
	);

	if (albaranQuery[0].length <= 0) {
		return null;
	}

	let [previousQuery]: [AlbaranFullIdQuery[], FieldPacket[]] = await mysql.query<AlbaranFullIdQuery[]>(
		"SELECT `albaran_full_id` FROM `eager_albaran` ORDER BY `albaran_full_id` DESC LIMIT 1;"
	);

	if (previousQuery.length <= 0) {
		return null;
	}

	return previousQuery[0].albaran_full_id;
}

export async function retrieveUltimoSocioIdPlaceholder(fincaId: number, socioId: number) {
	let [albaranQuery]: [AlbaranViewQuery[], FieldPacket[]] = await mysql.query<AlbaranViewQuery[]>(
		"SELECT `socio_id`, `albaran_id`, `albaran_full_id` FROM `eager_albaran` WHERE `socio_id` = ? AND `finca_id` = ? ORDER BY `albaran_full_id` DESC LIMIT 1;", [socioId, fincaId]
	);

	if (albaranQuery.length > 0)
		return (parseInt(albaranQuery[0].albaran_full_id) + 1).toString();
	else
		return `${new Date().getFullYear()}${fincaId.toString().padStart(4, "0")}${socioId.toString().padStart(4, "0")}001`;
}

export async function retrieveSocioAnteriorId(referenceFrameId: string) {
	let [albaranQuery]: [AlbaranViewQuery[], FieldPacket[]] = await mysql.query<AlbaranViewQuery[]>(
		"SELECT `socio_id`, `albaran_id` FROM `eager_albaran` WHERE `albaran_full_id` = ?", [referenceFrameId]
	);

	if (albaranQuery[0].length <= 0) {
		return null;
	}

	let [previousQuery]: [AlbaranFullIdQuery[], FieldPacket[]] = await mysql.query<AlbaranFullIdQuery[]>(
		"SELECT `albaran_full_id` FROM `eager_albaran` WHERE `socio_id` = ? AND `albaran_id` < ? ORDER BY `albaran_id` DESC LIMIT 1;",
		[albaranQuery[0].socio_id, albaranQuery[0].albaran_id]
	);

	if (previousQuery.length <= 0) {
		return null;
	}

	return previousQuery[0].albaran_full_id;
}

export async function retrieveSocioSiguienteId(referenceFrameId: string) {
	let [albaranQuery]: [AlbaranViewQuery[], FieldPacket[]] = await mysql.query<AlbaranViewQuery[]>(
		"SELECT `socio_id`, `albaran_id` FROM `eager_albaran` WHERE `albaran_full_id` = ?", [referenceFrameId]
	);

	if (!albaranQuery || !albaranQuery[0] || albaranQuery[0].length <= 0) {
		return null;
	}

	let [previousQuery]: [AlbaranFullIdQuery[], FieldPacket[]] = await mysql.query<AlbaranFullIdQuery[]>(
		"SELECT `albaran_full_id` FROM `eager_albaran` WHERE `socio_id` = ? AND `albaran_id` > ? ORDER BY `albaran_id` LIMIT 1;",
		[albaranQuery[0].socio_id, albaranQuery[0].albaran_id]
	);

	if (previousQuery.length <= 0) {
		return null;
	}

	return previousQuery[0].albaran_full_id;
}

export async function retrieveAlbaran(id: string | AlbaranCompositeId): Promise<RetrieveAlbaranResponse | null> {
	let albaranQuery: [AlbaranViewQuery[], FieldPacket[]];

	if (typeof id === "string") {
		albaranQuery = await mysql.query<AlbaranViewQuery[]>(
			"SELECT * FROM `eager_albaran` WHERE `albaran_full_id` = ?", [id]
		);
	} else {
		albaranQuery = await mysql.query<AlbaranViewQuery[]>(
			"SELECT * FROM `eager_albaran` WHERE `albaran_id` = ? AND `socio_id` = ? AND `finca_id` = ? AND `anio` = ?",
			[id.albaranId, id.socioId, id.fincaId, id.anio]
		);
	}

	const albaranView: AlbaranViewQuery = albaranQuery[0][0];

	if (albaranQuery[0].length <= 0) {
		return null;
	}

	let [sectorQuery]: [AlbaranSectorQuery[], FieldPacket[]] = await mysql.query(
		`SELECT ahs.albaran_finca_id, ahs.sector_id,
		 CONCAT(ahs.albaran_anio, ahs.albaran_finca_id, ahs.albaran_socio_id, ahs.albaran_id, ahs.sector_id) AS full_id,
		 ahs.activado, s.sin_inventario
		 FROM albaran_has_sector ahs
		 INNER JOIN sector s ON s.id = ahs.sector_id AND s.finca_id = ahs.albaran_finca_id
		 WHERE ahs.albaran_id = ? AND ahs.albaran_socio_id = ? AND ahs.albaran_finca_id = ? AND ahs.albaran_anio = ?`,
		[albaranView.albaran_id, albaranView.socio_id, albaranView.finca_id, albaranView.anio]
	);

	let [productoQuery]: [AlbaranProductoQuery[], FieldPacket[]] = await mysql.query(
		"SELECT `producto`.*, `albaran_has_producto`.`maquinaria`, `albaran_has_producto`.`nivel`, `albaran_has_producto`.`gastos_l` FROM `producto` INNER JOIN `albaran_has_producto` ON `producto`.`id` = `albaran_has_producto`.`producto_id` WHERE `albaran_has_producto`.`albaran_id` = ? AND `albaran_has_producto`.`albaran_socio_id` = ? AND `albaran_has_producto`.`albaran_finca_id` = ? AND `albaran_has_producto`.`albaran_anio` = ?",
		[albaranView.albaran_id, albaranView.socio_id, albaranView.finca_id, albaranView.anio]
	);

	let [abonoQuery]: [AlbaranAbonoQuery[], FieldPacket[]] = await mysql.query(
		"SELECT `abono`.*, `albaran_has_abono`.`tanque`, `albaran_has_abono`.`kilos` FROM `abono` INNER JOIN `albaran_has_abono` ON `abono`.`id` = `albaran_has_abono`.`abono_id` WHERE `albaran_has_abono`.`albaran_id` = ? AND `albaran_has_abono`.`albaran_socio_id` = ? AND `albaran_has_abono`.`albaran_finca_id` = ? AND `albaran_has_abono`.`albaran_anio` = ?",
		[albaranView.albaran_id, albaranView.socio_id, albaranView.finca_id, albaranView.anio]
	);

	return convertQueryToAlbaran(albaranView, sectorQuery, productoQuery, abonoQuery);
}

export async function retrieveAlbaranes(filter: RetrieveAlbaranesQueryParams): Promise<RetrieveAlbaranResponse[]> {
	let [albaranQuery]: [AlbaranViewQuery[], FieldPacket[]] = await mysql.query(
		"SELECT * FROM `eager_albaran` WHERE (`albaran_id` BETWEEN ? AND ?) AND (`fecha_ejecucion` BETWEEN ? AND ?) AND `socio_id` = ? AND `finca_id` = ?",
		[filter.from_id, filter.to_id, filter.from_fecha, filter.to_fecha, filter.socio_id, filter.finca_id]
	);

	let ret: RetrieveAlbaranResponse[] = [];

	for (const albaranView of albaranQuery) {
	let [sectorQuery]: [AlbaranSectorQuery[], FieldPacket[]] = await mysql.query(
		`SELECT ahs.albaran_finca_id, ahs.sector_id,
		 CONCAT(ahs.albaran_anio, ahs.albaran_finca_id, ahs.albaran_socio_id, ahs.albaran_id, ahs.sector_id) AS full_id,
		 ahs.activado, s.sin_inventario
		 FROM albaran_has_sector ahs
		 INNER JOIN sector s ON s.id = ahs.sector_id AND s.finca_id = ahs.albaran_finca_id
		 WHERE ahs.albaran_id = ? AND ahs.albaran_socio_id = ? AND ahs.albaran_finca_id = ? AND ahs.albaran_anio = ?`,
		[albaranView.albaran_id, albaranView.socio_id, albaranView.finca_id, albaranView.anio]
	);

		let [productoQuery]: [AlbaranProductoQuery[], FieldPacket[]] = await mysql.query(
			"SELECT `producto`.*, `albaran_has_producto`.`maquinaria`, `albaran_has_producto`.`nivel`, `albaran_has_producto`.`gastos_l` FROM `producto` INNER JOIN `albaran_has_producto` ON `producto`.`id` = `albaran_has_producto`.`producto_id` WHERE `albaran_has_producto`.`albaran_id` = ? AND `albaran_has_producto`.`albaran_socio_id` = ? AND `albaran_has_producto`.`albaran_finca_id` = ? AND `albaran_has_producto`.`albaran_anio` = ?",
			[albaranView.albaran_id, albaranView.socio_id, albaranView.finca_id, albaranView.anio]
		);

		let [abonoQuery]: [AlbaranAbonoQuery[], FieldPacket[]] = await mysql.query(
			"SELECT `abono`.*, `albaran_has_abono`.`tanque`, `albaran_has_abono`.`kilos` FROM `abono` INNER JOIN `albaran_has_abono` ON `abono`.`id` = `albaran_has_abono`.`abono_id` WHERE `albaran_has_abono`.`albaran_id` = ? AND `albaran_has_abono`.`albaran_socio_id` = ? AND `albaran_has_abono`.`albaran_finca_id` = ? AND `albaran_has_abono`.`albaran_anio` = ?",
			[albaranView.albaran_id, albaranView.socio_id, albaranView.finca_id, albaranView.anio]
		);

		ret.push(convertQueryToAlbaran(albaranView, sectorQuery, productoQuery, abonoQuery));
	}

	return ret;
}

export async function updateAlbaran(id: string | AlbaranCompositeId, data: UpdateAlbaranRequest) {
	const updatableAlbaran = {
		tecnico_id: data.general?.tecnicoId,
		fecha_instrucciones: data.general?.fechaInstrucciones,
		fecha_ejecucion: data.general?.fechaEjecucion,
		plazo_ejecucion_dias: data.general?.plazoEjecucionDias,
		ejecucion_pendiente: data.general?.pendiente !== undefined ? utils.booleanToBit(data.general?.pendiente) : undefined,
		motivo_sin_inventario: data.general?.motivoSinInventario !== undefined ? data.general?.motivoSinInventario : undefined,
		riego_ce: data.riego?.ce,
		riego_lm2: data.riego?.lm2,
		riego_tiempo_minutos: data.riego?.tiempoRiegoMin,
		equilibrio: data.riego?.equilibrio,
		duracion_plan_abono: data.riego?.duracionPlanAbono,
		tanque_dias_semana: data.riego?.tanqueDiasSemana?.join(","),
		labores_culturales: data.laboresCulturales?.join(","),
		observaciones: data.observaciones,
		firma: data.firma
	};

	const conn = await mysql.getConnection();

	try {
		await conn.beginTransaction();

		if (typeof id === "string") {
			const updateSetPairs = utils.buildSetPairsFromObject(updatableAlbaran);

			if (updateSetPairs.length > 0) {
				await conn.execute(
					`UPDATE \`albaran\`
					 SET ${updateSetPairs}
					 WHERE CONCAT(\`anio\`, \`finca_id\`, \`socio_id\`, \`id\`) = ?`,
					Object.values(updatableAlbaran).filter(value => value !== undefined && value !== null).concat([id])
				);
			}

			// Disable all sectors so only the enabled one can be enabled
			await conn.execute(
				"UPDATE `albaran_has_sector` SET `activado`=0 WHERE CONCAT(`albaran_anio`, `albaran_finca_id`, `albaran_socio_id`, `albaran_id`) = ?", [id]
			);

			// Enable requested sectors
			const sectorIds: number[] = data.general?.sectoresActivados?.filter(sector => sector !== undefined) ?? [];
			if (sectorIds.length > 0) {
				const sectorPlaceholders: string = sectorIds.map(() => "?").join(", ");
				await conn.execute(
					`UPDATE \`albaran_has_sector\`
				 SET \`activado\`=1
				 WHERE CONCAT(\`albaran_anio\`, \`albaran_finca_id\`, \`albaran_socio_id\`, \`albaran_id\`) = ?
				   AND \`sector_id\` IN (${sectorPlaceholders})`,
					(<any[]>[id]).concat(sectorIds)
				);
			}
		} else {
			await conn.execute(
				`UPDATE \`albaran\`
				 SET ${utils.buildSetPairsFromObject(updatableAlbaran)}
				 WHERE \`id\` = ?
				   AND \`socio_id\` = ?
				   AND \`finca_id\` = ?
				   AND \`anio\` = ?`,
				Object.values(updatableAlbaran).filter(value => value !== undefined && value !== null).concat([
					id.albaranId,
					id.socioId,
					id.fincaId,
					id.anio
				])
			);

			// Disable all sectors so only the enabled one can be enabled
			await conn.execute(
				"UPDATE `albaran_has_sector` SET `activado`=0 WHERE `albaran_id` = ? AND `albaran_socio_id` = ? AND `albaran_finca_id` = ? AND `albaran_anio` = ?",
				[id.albaranId, id.socioId, id.fincaId, id.albaranId]
			);

			// Enable requested sectors
			const sectorIds: number[] = data.general?.sectoresActivados?.filter(sector => sector !== undefined) ?? [];
			const sectorPlaceholders: string = sectorIds.map(() => "?").join(", ");
			await conn.execute(
				`UPDATE \`albaran_has_sector\`
				 SET \`activado\`=1
				 WHERE \`albaran_id\` = ?
				   AND \`albaran_socio_id\` = ?
				   AND \`albaran_finca_id\` = ?
				   AND \`albaran_anio\` = ?
				   AND \`sector_id\` IN (${sectorPlaceholders})`,
				[id.albaranId, id.socioId, id.fincaId, id.albaranId].concat(sectorIds)
			);
		}

		await conn.commit();
	} catch (err: unknown) {
		await conn.rollback();
		throw err;
	} finally {
		conn.release();
	}

}

export async function newAlbaranProduct(albaranId: string, products: NewAlbaranProductRequest) {
	let [albaranQuery]: [AlbaranViewQuery[], FieldPacket[]] = await mysql.query<AlbaranViewQuery[]>(
		"SELECT `id`, `socio_id`, `finca_id`, `anio` FROM `albaran` WHERE CONCAT(`anio`, `finca_id`, `socio_id`, `id`) = ?",
		[albaranId]
	);

	if (albaranQuery.length <= 0)
		return;

	const albaranView = albaranQuery[0];

	if (products.length > 0) {
		// Validar y limpiar datos antes del INSERT
		const validMaquinarias: AlbaranMaquinaria[] = ["pulverizador", "espolvoreador", "riego", "mochila", "siembra-manual"];
		
		await mysql.query(
			"INSERT INTO `albaran_has_producto` (`albaran_id`, `albaran_socio_id`, `albaran_finca_id`, `albaran_anio`, `producto_id`, `maquinaria`, `nivel`, `gastos_l`) VALUES ?",
			[products.map(producto => {
				// Limpiar y validar maquinaria
				const maquinariaLimpia = producto.maquinaria?.toString().trim() as AlbaranMaquinaria;
				
				if (!validMaquinarias.includes(maquinariaLimpia)) {
					throw new Error(`Valor de maquinaria inválido: "${producto.maquinaria}". Valores permitidos: ${validMaquinarias.join(", ")}`);
				}
				
				return [
					<number><unknown>albaranView.id,
					albaranView.socio_id,
					albaranView.finca_id,
					albaranView.anio,
					producto.productoId,
					maquinariaLimpia,
					producto.nivel,
					producto.gastosL
				];
			})]
		);
	}
}

export async function newAlbaranAbono(albaranId: string, abono: NewAlbaranAbonoRequest) {
	let [albaranQuery]: [AlbaranViewQuery[], FieldPacket[]] = await mysql.query<AlbaranViewQuery[]>(
		"SELECT `id`, `socio_id`, `finca_id`, `anio` FROM `albaran` WHERE CONCAT(`anio`, `finca_id`, `socio_id`, `id`) = ?",
		[albaranId]
	);

	if (albaranQuery.length <= 0)
		return;

	const albaranView = albaranQuery[0];

	let abonos = abono.tanqueA.map(abono => [
		"A",
		<number><unknown>albaranView.id,
		albaranView.socio_id,
		albaranView.finca_id,
		albaranView.anio,
		abono.abonoId,
		abono.kilos
	]).concat(
		abono.tanqueB.map(abono => [
			"B",
			<number><unknown>albaranView.id,
			albaranView.socio_id,
			albaranView.finca_id,
			albaranView.anio,
			abono.abonoId,
			abono.kilos
		]));

	if (abonos.length > 0) {
		await mysql.query(
			"INSERT INTO `albaran_has_abono` (`tanque`, `albaran_id`, `albaran_socio_id`, `albaran_finca_id`, `albaran_anio`, `abono_id`, `kilos`) VALUES ?",
			[abonos]
		);
	}
}
