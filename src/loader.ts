/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import {register} from "node:module";
import {pathToFileURL} from "node:url";
import * as path from "node:path";

console.log("Registering @src/* loader hooks...");
register(pathToFileURL(path.join(import.meta.dirname, "hooks" + path.extname(import.meta.filename))));
