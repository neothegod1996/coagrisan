/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import {NextFunction, Request, Response} from "express";
import createError from "http-errors";

export default function methodNotAllowed(req: Request, res: Response, next: NextFunction) {
	next(createError(405));
}
