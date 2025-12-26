/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import type {NextFunction, Request, RequestHandler, Response} from "express";
import createHttpError from "http-errors";
import type {UserRole} from "@coa/api-types";

export function isAuthorized(allowedRoles?: UserRole[]): RequestHandler {
	return (req: Request, _res: Response, next: NextFunction) => {
		if (req.session && req.session.userId) { // is logged in
			if (allowedRoles) { // endpoints is restricted to certain roles
				if (req.session.role && allowedRoles.includes(req.session.role)) {
					next();
				} else
					next(createHttpError(403));
			} else // all logged in users can access the endpoint
				next();
		} else
			next(createHttpError(401));
	};
}
