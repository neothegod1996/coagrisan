/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import type {NextFunction, Request, Response} from "express";
import type {BulkUpdateSectoresRequest, NewItemResponse, NewSectorRequest, PaginationQueryParams, RetrieveSectorResponse, UpdateSectorRequest} from "@coa/api-types";
import * as sectorSvc from "../services/sector.js";
import createHttpError from "http-errors";

type FincaParam = { fincaId: string };
type SectorParam = { fincaId: string; id: string };

export async function retrieveSectores(req: Request<FincaParam, RetrieveSectorResponse[], {}, PaginationQueryParams>, res: Response<RetrieveSectorResponse[]>, next: NextFunction) {
  try {
    if (req.query.limit)
      req.query.limit = parseInt(<string><unknown>(req.query.limit));

    if (req.query.offset)
      req.query.offset = parseInt(<string><unknown>(req.query.offset));

    const fincaId = parseInt(req.params.fincaId);
    res.json(await sectorSvc.retrieveSectores(fincaId, req.query));
  } catch (err: unknown) {
    next(err);
  }
}

export async function retrieveSector(req: Request<SectorParam, RetrieveSectorResponse>, res: Response<RetrieveSectorResponse>, next: NextFunction) {
  try {
    const fincaId = parseInt(req.params.fincaId);
    const id = parseInt(req.params.id);

    const s = await sectorSvc.retrieveSector(fincaId, id);
    if (!s)
      return next(createHttpError(404, "Sector no encontrado"));

    res.json(s);
  } catch (err: unknown) {
    next(err);
  }
}

export async function newSector(req: Request<FincaParam, NewItemResponse, NewSectorRequest>, res: Response<NewItemResponse>, next: NextFunction) {
  try {
    const fincaId = parseInt(req.params.fincaId);
    const created = await sectorSvc.newSector(fincaId, req.body);
    res.status(201).json(created);
  } catch (err: unknown) {
    next(err);
  }
}

export async function updateSector(req: Request<SectorParam, {}, UpdateSectorRequest>, res: Response, next: NextFunction) {
  try {
    const fincaId = parseInt(req.params.fincaId);
    const id = parseInt(req.params.id);
    await sectorSvc.updateSector(fincaId, id, req.body);
    res.status(204).end();
  } catch (err: unknown) {
    next(err);
  }
}

export async function deleteSector(req: Request<SectorParam>, res: Response, next: NextFunction) {
  try {
    const fincaId = parseInt(req.params.fincaId);
    const id = parseInt(req.params.id);
    await sectorSvc.deleteSector(fincaId, id);
    res.status(204).end();
  } catch (err: unknown) {
    next(err);
  }
}

export async function bulkUpdateSectores(req: Request<FincaParam, {}, BulkUpdateSectoresRequest>, res: Response, next: NextFunction) {
  try {
    const fincaId = parseInt(req.params.fincaId);
    const { updates } = req.body || {};

    if (!Array.isArray(updates) || updates.length === 0) {
      return next(createHttpError(400, "Se requiere una lista 'updates' no vacía"));
    }

    const normalized = updates.map(u => ({
      id: typeof u.id === "string" ? parseInt(u.id, 10) : u.id,
      sinInventario: !!u.sinInventario,
    }));

    if (normalized.some(u => Number.isNaN(u.id) || typeof u.sinInventario !== "boolean")) {
      return next(createHttpError(400, "Formato de 'updates' inválido"));
    }

    const result = await sectorSvc.bulkUpdateSectoresSinInventario(fincaId, normalized);
    res.status(200).json(result);
  } catch (err: unknown) {
    next(err);
  }
}