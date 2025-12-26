/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import type {NextFunction, Request, Response} from "express";
import createHttpError from "http-errors";

export function notFound(req: Request, res: Response, next: NextFunction) {
	next(createHttpError(404));
}
