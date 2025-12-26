/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

import express from "express";
import cors, {type CorsOptions} from "cors";
import logger from "morgan";
import cookieParser from "cookie-parser";
import {notFound} from "./middleware/notFound.js";
import {errorHandler} from "./middleware/errorHandler.js";
import albaranesRouter from "./routes/albaranes.js";
import usersRouter from "./routes/users.js";
import sociosRouter from "./routes/socios.js";
import fincasRouter from "./routes/fincas.js";
import productosRouter from "./routes/productos.js";
import abonosRouter from "./routes/abonos.js";
import sectoresRouter from "./routes/sectores.js";
import tecnicosRouter from "./routes/tecnicos.js";
import {redis} from "./config/redis.js";
import {sessionMiddleware} from "./middleware/session.js";

const app = express();

if (process.env.NODE_ENV !== "test") {
	await redis.connect();
}

const corsOptions: CorsOptions = {
	origin: (origin, callback) => {
		const allowedOrigins = process.env.NODE_ENV === "development" 
			? ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:4173"]
			: ["http://localhost:5173", "https://bc.coagrisan.com", "https://rw7ttrtb-4173.use.devtunnels.ms"];
		
		console.log(`CORS Debug - Origin: ${origin}, Allowed: ${allowedOrigins.includes(origin || '')}`);
		
		// Permitir requests sin origin (como Postman, curl, etc.)
		if (!origin) return callback(null, true);
		
		if (allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			console.log(`CORS Error - Origin ${origin} not allowed. Allowed origins:`, allowedOrigins);
			callback(new Error('Not allowed by CORS'));
		}
	},
	credentials: true,
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
	allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
	optionsSuccessStatus: 200,
};

app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

app.enable("trust proxy");
app.use(logger("dev"));
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use("/api/albaranes", albaranesRouter);
app.use("/api/user", usersRouter);
app.use("/api/socios", sociosRouter);
app.use("/api/fincas", fincasRouter);
app.use("/api/tecnicos", tecnicosRouter);
app.use("/api/productos", productosRouter);
app.use("/api/abonos", abonosRouter);
app.use("/api/sectores", sectoresRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
