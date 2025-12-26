/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import type {NextFunction, Request, Response} from "express";
import type {RetrieveAbonoResponse, RetrieveAbonosQueryParams} from "@coa/api-types";
import * as abono from "../services/abono.js";
import createHttpError from "http-errors";

type IdParam = { id: string };

export async function retrieveAbonos(req: Request<{}, RetrieveAbonoResponse[], {}, RetrieveAbonosQueryParams>, res: Response<RetrieveAbonoResponse[]>, next: NextFunction) {
	try {
		if (req.query.limit)
			req.query.limit = parseInt(<string><unknown>(req.query.limit));

		if (req.query.offset)
			req.query.offset = parseInt(<string><unknown>(req.query.offset));

		res.json(await abono.retrieveAbonos(req.query));
	} catch (err: unknown) {
		next(err);
	}
}

export async function retrieveAbono(req: Request<IdParam, RetrieveAbonoResponse>, res: Response<RetrieveAbonoResponse>, next: NextFunction) {
	try {
		const abonoItem = await abono.retrieveAbono(parseInt(req.params.id));

		if (abonoItem)
			res.json(abonoItem);
		else
			next(createHttpError(404, "abono no encontrado"));
	} catch (err: unknown) {
		next(err);
	}
}
