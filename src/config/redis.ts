/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import {createClient} from "redis";
import {envConfig} from "./env.js";

export const redis = createClient({
	url: `redis://${envConfig.REDIS_HOST}:6379`,
	database: envConfig.REDIS_DATABASE,
	password: envConfig.REDIS_PASSWORD || undefined
});
