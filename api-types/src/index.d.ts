declare namespace coatypes {
	type AlbaranDuracionPlanAbono = "1semana" | "15dias" | "1mes" | "indefinido";
	type AlbaranMaquinaria = "pulverizador" | "espolvoreador" | "riego" | "mochila" | "siembra-manual";
	type AlbaranNivel = "alta" | "media" | "baja";
	type AlbaranDiasSemana = "lunes" | "martes" | "miercoles" | "jueves" | "viernes" | "sabado" | "domingo";
	type AlbaranLaboresCulturales = "eliminar-malas-hierbas" | "colocar-placas" | "despuntar" | "deshijar" | "deshojar" | "eliminar-plantas-viroticas" | "reponer-abejorros" | "entuturar" | "descolgar";

	type DeepPartial<T> = {
		[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
	};

	interface NewItemResponse {
		id: number;
	}

	interface AlbaranProductType {
		maquinaria: AlbaranMaquinaria;
		nivel: AlbaranNivel;
		gastosL: number;
		productoId: number;
	}

	interface AlbaranAbonoType {
		abonoId: number;
		kilos: number;
	}

	interface NewAlbaranRequest {
		general: {
			socioId: number;
			fincaId: number;
			anio: number;
			sectoresActivados: number[];
			tecnicoId: number;
			fechaInstrucciones: string;
			fechaEjecucion: string;
			plazoEjecucionDias: number;
			pendiente: boolean;
			sinInventario: boolean;
			motivoSinInventario?: string;
		};
		productos: AlbaranProductType[];
		abono: {
			tanqueA: AlbaranAbonoType[];
			tanqueB: AlbaranAbonoType[];
		};
		riego: {
			ce: number;
			lm2: number;
			tiempoRiegoMin: number;
			equilibrio: string;
			duracionPlanAbono: AlbaranDuracionPlanAbono;
			tanqueDiasSemana: AlbaranDiasSemana[];
		};
		laboresCulturales: AlbaranLaboresCulturales[];
		observaciones?: string;
		firma: string;
	}

	interface RetrieveAlbaranResponse extends NewAlbaranRequest {
		albaranId: number;
		albaranFullId: string;
		view: {
			socioNombre: string;
			fincaNombre: string;
			tecnicoNombres: string;
			tecnicoApellidos: string;
			sectorIds: number[];
			sectorFullIds: string[];
			productos: RetrieveProductResponse[];
			abonos: RetrieveAbonoResponse[];
		};
	}

	interface DuplicateAlbaranRequest {
		socioDesdeId: number;
		socioHastaId: number;
		fechaDesde: string;
		fechaHasta: string;
	}

	interface PaginationQueryParams {
		limit?: number;
		offset?: number;
	}

	interface RetrieveAlbaranesQueryParams {
		from_id: number;
		to_id: number;
		from_fecha: string;
		to_fecha: string;
		socio_id: number;
		finca_id: number;
	}

	interface RetrieveSociosQueryParams extends PaginationQueryParams {
		contains?: string;
	}

	interface RetrieveFincasQueryParams extends PaginationQueryParams {
		contains?: string;
	}

	interface RetrieveTecnicosQueryParams extends PaginationQueryParams {
		contains?: string;
	}

	interface RetrieveProductsQueryParams extends PaginationQueryParams {
		contains?: string;
	}

	interface RetrieveAbonosQueryParams extends PaginationQueryParams {
		contains?: string;
	}

	interface RetrieveSocioResponse {
		id: number;
		nombre: string;
		bc_id: string;
	}

	interface RetrieveSectorResponse {
		id: number;
		bc_id: string;
		finca_id: number;
		sinInventario: boolean;
	}

	interface NewSectorRequest {
		bc_id: string;
		sinInventario?: boolean;
	}

	interface UpdateSectorRequest extends DeepPartial<NewSectorRequest> {}

	interface BulkUpdateSectoresRequest {
		updates: Array<{ id: number; sinInventario: boolean }>;
	}

	interface RetrieveFincaResponse {
		id: number;
		bc_id: string;
		nombre: string;
		sectorIds: number[];
		sectores: RetrieveSectorResponse[];
	}

	interface RetrieveTecnicoResponse {
		id: number;
		nombres: string;
		apellidos: string;
	}

	interface RetrieveProductResponse {
		id: number;
		bc_id: string;
		nombre: string;
		materiaActiva: string;
		plazoSeguimiento?: number;
		dosis: string;
		plaga?: string;
	}

	interface RetrieveAbonoResponse {
		id: number;
		nombre: string;
	}

	interface GenerarCuarentenaQueryParams {
		desde: string;
		hasta: string;
		filename?: string;
	}

	type UpdateAlbaranRequest = DeepPartial<Omit<NewAlbaranRequest, "productos" | "abono">>;

	type NewAlbaranProductRequest = AlbaranProductType[];

	interface NewAlbaranAbonoRequest {
		tanqueA: AlbaranAbonoType[];
		tanqueB: AlbaranAbonoType[];
	}

	interface LoginRequest {
		username: string;
		password: string;
	}

	interface LoginResponse {
		userId: number;
		role: UserRole;
	}

	interface VerifyLoginResponse {
		authenticated: boolean;
		user?: {
			userId: number;
			username: string;
			role: UserRole;
		}
	}

	interface ErrorResponse {
		message?: string;
		name?: string;
		stack?: string;
		cause?: {
			message: string;
			name?: string;
			stack?: string;
			cause?: string | unknown;
		};
		errorCode?: string;
	}

	type UserRole = "tecnico" | "socio";

	enum UserRoleEnum {
		Tecnico = "tecnico",
		Socio = "socio",
	}
}

export = coatypes;
