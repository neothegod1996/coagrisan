/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import session from "express-session";
import {RedisStore} from "connect-redis";
import {redis} from "../config/redis.js";
import {envConfig} from "../config/env.js";

const isProduction = process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "test";

function addYearFromNow(): Date {
	let date = new Date();
	date.setFullYear(date.getFullYear() + 1);
	return date;
}

export const sessionMiddleware = session({
	store: new RedisStore({
		client: redis,
		ttl: 31536000
	}),
	secret: envConfig.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	name: "sid",
	cookie: {
		path: "/",
		secure: isProduction,
		httpOnly: false,
		sameSite: isProduction ? "strict" : "lax",
		expires: addYearFromNow()
	},
	rolling: true
});
