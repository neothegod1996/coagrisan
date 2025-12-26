/*
 * Copyright (c) 2025 Coagrisan Servicios S.L. Todos los derechos reservados
 */

export function booleanToBit(bool: boolean) {
	return Buffer.from([bool ? 1 : 0]);
}

// Convert BIT(1) (Buffer) to boolean
export function bitToBoolean(buffer: Buffer) {
	return buffer && buffer.length > 0 ? buffer[0] === 1 : false;
}

export function buildSetPairsFromObject(obj: any): string[] {
	let pairs: string[] = [];

	for (const [key, value] of Object.entries(obj)) {
		if (value !== undefined && value !== null)
			pairs.push(`${key}=?`);
	}

	return pairs;
}
