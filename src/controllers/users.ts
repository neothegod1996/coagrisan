/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import type {NextFunction, Request, Response} from "express";
import type {LoginRequest, LoginResponse, VerifyLoginResponse} from "@coa/api-types";
import createHttpError from "http-errors";
import {login} from "../services/users.js";

async function destroySession(req: Request): Promise<void> {
	return new Promise((resolve, reject) => {
		req.session.destroy((err: any) => {
			if (err)
				return reject(err);

			resolve();
		});
	});
}

export async function loginUser(req: Request<{}, LoginResponse, LoginRequest>, res: Response<LoginResponse>, next: NextFunction) {
	try {
		const user = await login(req.body.username, req.body.password);

		if (user) {
			req.session.userId = user.id;
			req.session.username = user.nombre_usuario;
			req.session.role = user.rol;
			res.status(200);
			res.json({
				userId: user.id,
				role: user.rol
			});
		} else
			next(createHttpError(404, "User not found"));
	} catch (err: unknown) {
		next(createHttpError(500, "Unknown error"));
	}
}

export async function logout(req: Request, res: Response, _next: NextFunction) {
	await destroySession(req);
	res.clearCookie("sid");
	res.status(204).end();
}

export function verifyLogin(req: Request<{}, VerifyLoginResponse, null>, res: Response<VerifyLoginResponse>, _next: NextFunction) {
	if (req.session && req.session.userId) {
		res.json({
			authenticated: true,
			user: {
				userId: req.session.userId,
				username: req.session.username!,
				role: req.session.role!
			}
		});
	} else {
		res.json({authenticated: false});
	}
}
