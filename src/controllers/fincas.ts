/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import type {NextFunction, Request, Response} from "express";
import type {RetrieveFincaResponse, RetrieveFincasQueryParams} from "@coa/api-types";
import * as finca from "../services/finca.js";
import createHttpError from "http-errors";

type IdParam = { id: string };

export async function retrieveFincas(req: Request<{}, RetrieveFincaResponse[], {}, RetrieveFincasQueryParams>, res: Response<RetrieveFincaResponse[]>, next: NextFunction) {
	try {
		if (req.query.limit)
			req.query.limit = parseInt(<string><unknown>(req.query.limit));

		if (req.query.offset)
			req.query.offset = parseInt(<string><unknown>(req.query.offset));

		res.json(await finca.retrieveFincas(req.query));
	} catch (err: unknown) {
		next(err);
	}
}

export async function retrieveFinca(req: Request<IdParam, RetrieveFincaResponse>, res: Response<RetrieveFincaResponse>, next: NextFunction) {
	try {
		res.json(await finca.retrieveFinca(parseInt(req.params.id)));
	} catch (err: unknown) {
		next(err);
	}
}

type BcIdParam = { bcId: string };

export async function retrieveFincaByBcId(req: Request<BcIdParam, RetrieveFincaResponse>, res: Response<RetrieveFincaResponse>, next: NextFunction) {
	try {
		const fincaItem = await finca.retrieveFincaByBcId(req.params.bcId);
		if (fincaItem)
			res.json(fincaItem);
		else
			next(createHttpError(404, "Finca no encontrada"));
	} catch (err: unknown) {
		next(err);
	}
}
