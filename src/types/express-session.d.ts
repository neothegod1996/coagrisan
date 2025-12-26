/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import "express-session";
import type {UserRole} from "@coa/api-types";

declare module "express-session" {
	interface SessionData {
		userId: number;
		username: string;
		role: UserRole;
	}
}
