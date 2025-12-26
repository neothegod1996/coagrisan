/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import type {NewSectorRequest, PaginationQueryParams, RetrieveSectorResponse, UpdateSectorRequest} from "@coa/api-types";
import type {FieldPacket, RowDataPacket} from "mysql2/promise";
import {mysql} from "../config/mysql.js";
import * as utils from "../utils.js";

interface SectorQuery extends RowDataPacket {
  id: number;
  bc_id: string;
  finca_id: number;
  sin_inventario: Buffer;
}

export async function retrieveSectores(fincaId: number, filter: PaginationQueryParams): Promise<RetrieveSectorResponse[]> {
  let query = "SELECT * FROM `sector` WHERE `finca_id` = ?";
  const params: any[] = [fincaId];

  if (filter.limit !== undefined && filter.limit !== null) {
    query += " LIMIT ? OFFSET ?";
    params.push(filter.limit, filter.offset ?? 0);
  } else if (filter.offset && filter.offset > 0) {
    // Si solo hay offset sin límite, usar un límite muy alto
    query += " LIMIT 999999 OFFSET ?";
    params.push(filter.offset);
  }

  const [rows]: [SectorQuery[], FieldPacket[]] = await mysql.query<SectorQuery[]>(query, params);
  return rows.map<RetrieveSectorResponse>(s => ({ id: s.id, bc_id: s.bc_id, finca_id: s.finca_id, sinInventario: utils.bitToBoolean(s.sin_inventario) }));
}

export async function retrieveSector(fincaId: number, id: number): Promise<RetrieveSectorResponse | null> {
  const [rows]: [SectorQuery[], FieldPacket[]] = await mysql.query<SectorQuery[]>(
    "SELECT * FROM `sector` WHERE `finca_id` = ? AND `id` = ?",
    [fincaId, id]
  );

  if (rows.length === 0)
    return null;

  const s = rows[0];
  return { id: s.id, bc_id: s.bc_id, finca_id: s.finca_id, sinInventario: utils.bitToBoolean(s.sin_inventario) };
}

export async function newSector(fincaId: number, data: NewSectorRequest) {
  const [result]: [import("mysql2/promise").ResultSetHeader, FieldPacket[]] = await mysql.execute(
    "INSERT INTO `sector` (`bc_id`, `finca_id`, `sin_inventario`) VALUES (?, ?, ?)",
    [data.bc_id, fincaId, utils.booleanToBit(!!data.sinInventario)]
  );
  return { id: result.insertId };
}

export async function updateSector(fincaId: number, id: number, data: UpdateSectorRequest) {
  const set: Record<string, any> = {};
  if (data.bc_id !== undefined) set["bc_id"] = data.bc_id;
  if (data.sinInventario !== undefined) set["sin_inventario"] = utils.booleanToBit(!!data.sinInventario);

  if (Object.keys(set).length === 0) return;

  const assignments = Object.keys(set).map(k => `\`${k}\` = ?`).join(", ");
  await mysql.execute(
    `UPDATE \`sector\` SET ${assignments} WHERE \`finca_id\` = ? AND \`id\` = ?`,
    [...Object.values(set), fincaId, id]
  );
}

export async function deleteSector(fincaId: number, id: number) {
  await mysql.execute(
    "DELETE FROM `sector` WHERE `finca_id` = ? AND `id` = ?",
    [fincaId, id]
  );
}

export async function bulkUpdateSectoresSinInventario(
  fincaId: number,
  updates: Array<{ id: number; sinInventario: boolean }>
): Promise<{ affectedRows: number }> {
  if (!updates || updates.length === 0) {
    return { affectedRows: 0 };
  }

  const caseClauses = updates.map(() => "WHEN `id` = ? THEN ?");
  const ids = updates.map(u => u.id);
  const placeholders = ids.map(() => "?").join(",");

  const sql = `UPDATE \`sector\`
SET \`sin_inventario\` = CASE ${caseClauses.join(" ")} ELSE \`sin_inventario\` END
WHERE \`finca_id\` = ? AND \`id\` IN (${placeholders})`;

  const params = updates.flatMap(u => [u.id, utils.booleanToBit(!!u.sinInventario)])
    .concat([fincaId], ids);

  const [result]: [import("mysql2/promise").ResultSetHeader, FieldPacket[]] = await mysql.execute(sql, params);
  return { affectedRows: (result as any).affectedRows ?? 0 };
}