/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import type {ResolveHookContext} from "node:module";
import * as path from "node:path";
import {fileURLToPath, pathToFileURL} from "node:url";
import fs from "node:fs";

function findPackageJsonPath(context: ResolveHookContext): string {
	let currentDir = context.parentURL ? path.dirname(fileURLToPath(context.parentURL)) : process.cwd();

	while (currentDir !== path.parse(currentDir).root) {
		if (fs.existsSync(path.join(currentDir, "package.json")))
			return currentDir;

		currentDir = path.dirname(currentDir);
	}

	return process.cwd();
}

// noinspection JSUnusedGlobalSymbols
export async function resolve(specifier: string, context: ResolveHookContext, nextResolve: Function) {
	if (specifier.startsWith("@src/")) {
		const parentPath = fileURLToPath(context.parentURL!);
		const parentExtension = path.extname(parentPath);
		const rootDirectory = findPackageJsonPath(context);
		const isTypeScript = parentExtension === ".ts" || parentExtension === ".mts" || parentExtension === ".cts";

		const relativePath: string = specifier.endsWith(parentExtension)
			? specifier.replace(/^@src\/(.+)\.([mc]?[jt]s)$/, "$1.$2")
			: specifier.replace(/^@src\/(.+)$/, "$1" + parentExtension);

		const absolutePath: string = pathToFileURL(path.join(rootDirectory, isTypeScript ? "src" : "dist", relativePath)).href;
		return nextResolve(absolutePath, context);
	}

	// Call the next resolve hook in the chain
	return nextResolve(specifier, context);
}
