/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import _debug from "debug";
import app from "./app.js";
import {envConfig} from "./config/env.js";
import * as http from "node:http";
import "./sync-bc.js";

app.set("port", envConfig.SERVER_PORT);

const debug = _debug("coa-backend:server");
const server = http.createServer(app);
server.listen(envConfig.SERVER_PORT);
server.on("error", (error: NodeJS.ErrnoException) => {
	if (error.syscall !== "listen")
		throw error;

	const bind = "Port " + envConfig.SERVER_PORT;

	// handle specific listen errors with friendly messages
	// noinspection FallThroughInSwitchStatementJS
	switch (error.code) {
		case "EACCES":
			console.error(bind + " requires elevated privileges");
			process.exit(1);
		case "EADDRINUSE":
			console.error(bind + " is already in use");
			process.exit(1);
		default:
			throw error;
	}
});
server.on("listening", () => {
	const addr = server.address();
	const bind = typeof addr === "string"
		? "pipe " + addr
		: "port " + addr?.port;
	debug("Listening on " + bind);
});
