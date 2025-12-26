/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import type {NextFunction, Request, Response} from "express";
import type {RetrieveProductResponse, RetrieveProductsQueryParams} from "@coa/api-types";
import * as producto from "../services/producto.js";
import createHttpError from "http-errors";

type IdParam = { id: string };

export async function retrieveProductos(req: Request<{}, RetrieveProductResponse[], {}, RetrieveProductsQueryParams>, res: Response<RetrieveProductResponse[]>, next: NextFunction) {
	try {
		if (req.query.limit)
			req.query.limit = parseInt(<string><unknown>(req.query.limit));

		if (req.query.offset)
			req.query.offset = parseInt(<string><unknown>(req.query.offset));

		res.json(await producto.retrieveProductos(req.query));
	} catch (err: unknown) {
		next(err);
	}
}

export async function retrieveProducto(req: Request<IdParam, RetrieveProductResponse>, res: Response<RetrieveProductResponse>, next: NextFunction) {
	try {
		const productoItem = await producto.retrieveProducto(parseInt(req.params.id));

		if (productoItem)
			res.json(productoItem);
		else
			next(createHttpError(404, "Producto no encontrado"));
	} catch (err: unknown) {
		next(err);
	}
}
