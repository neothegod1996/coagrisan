/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import type {NextFunction, Request, Response} from "express";
import * as socio from "../services/socio.js";
import type {RetrieveSocioResponse, RetrieveSociosQueryParams} from "@coa/api-types";
import createHttpError from "http-errors";

type IdParam = { id: string };

export async function retrieveSocios(req: Request<{}, RetrieveSocioResponse[], {}, RetrieveSociosQueryParams>, res: Response<RetrieveSocioResponse[]>, next: NextFunction) {
	try {
		if (req.query.limit)
			req.query.limit = parseInt(<string><unknown>(req.query.limit));

		if (req.query.offset)
			req.query.offset = parseInt(<string><unknown>(req.query.offset));

		res.json(await socio.retrieveSocios(req.query));
	} catch (err: unknown) {
		console.log(err);
		next(err);
	}
}

export async function retrieveSocio(req: Request<IdParam, RetrieveSocioResponse>, res: Response<RetrieveSocioResponse>, next: NextFunction) {
	try {
		const socioItem = await socio.retrieveSocio(parseInt(req.params.id));
		if (socioItem)
			res.json(socioItem);
		else
			next(createHttpError(404, "Socio no encontrado"));
	} catch (err: unknown) {
		next(err);
	}
}

type BcIdParam = { bcId: string };

export async function retrieveSocioByBcId(req: Request<BcIdParam, RetrieveSocioResponse>, res: Response<RetrieveSocioResponse>, next: NextFunction) {
	try {
		const socioItem = await socio.retrieveSocioByBcId(req.params.bcId);
		if (socioItem)
			res.json(socioItem);
		else
			next(createHttpError(404, "Socio no encontrado"));
	} catch (err: unknown) {
		next(err);
	}
}
