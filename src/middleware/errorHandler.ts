/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import type {Request, Response, NextFunction} from "express";
import type {ErrorResponse} from "@coa/api-types";
import {HttpError} from "http-errors";

export function errorHandler(err: Error, _req: Request<{}, ErrorResponse>, res: Response<ErrorResponse>, _next: NextFunction): void {
	let errorResponse: ErrorResponse = {};

	if (process.env.NODE_ENV === "development") {
		errorResponse.message = err.message;
		errorResponse.name = err.name;
		errorResponse.stack = err.stack;

		if (err.cause && err.cause instanceof Error) {
			errorResponse.cause = {
				message: err.cause.message,
				name: err.cause.name,
				stack: err.cause.stack,
				cause: err.cause.cause
			};
		}
	}

	if (err instanceof HttpError) {
		res.status(err.status);
		errorResponse.message = err.message;

		if (err.status >= 500)
			console.error(err);

		// If an HTTP error provides an error code, such error code is part of the API,
		// therefore, it's not exposing sensitive data.
		if (err.code)
			errorResponse.errorCode = err.code;
	} else {
		res.status(500);
		console.error(err);
	}

	res.json(errorResponse);
}
