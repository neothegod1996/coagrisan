/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import type {NextFunction, Request, Response} from "express";
import type {RetrieveTecnicoResponse, RetrieveTecnicosQueryParams} from "@coa/api-types";
import * as tecnico from "../services/tecnico.js";

export async function retrieveTecnicos(req: Request<{}, RetrieveTecnicoResponse[], {}, RetrieveTecnicosQueryParams>, res: Response<RetrieveTecnicoResponse[]>, next: NextFunction) {
	try {
		if (req.query.limit)
			req.query.limit = parseInt(<string><unknown>(req.query.limit));

		if (req.query.offset)
			req.query.offset = parseInt(<string><unknown>(req.query.offset));

		res.json(await tecnico.retrieveTecnicos(req.query));
	} catch (err: unknown) {
		next(err);
	}
}
