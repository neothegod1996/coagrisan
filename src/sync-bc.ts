import cron from "node-cron";
import axios from "axios";
import crypto from "crypto";
import { mysql } from "./config/mysql.js";
import { envConfig } from "./config/env.js";

const authHeader = "Basic " + Buffer.from(`${envConfig.BC_USER}:${envConfig.BC_PASS}`).toString("base64");

function withCompany(url: string): string {
    const company = envConfig.BC_COMPANY;
    if (!company) return url;
    const delimiter = url.includes("?") ? "&" : "?";
    return `${url}${delimiter}company=${encodeURIComponent(company)}`;
}

async function fetchAllData(url: string) {
    let results: any[] = [];
    let next = url;

    while (next) {
        const res = await axios.get(next, {
            headers: { Authorization: authHeader },
        });
        results = results.concat(res.data.value);
        next = res.data["@odata.nextLink"];
    }

    return results;
}

async function sync() {

    // Si no hay compañía configurada, evitar realizar llamadas que fallarán
    if (!envConfig.BC_COMPANY) {
        console.warn("🚸 BC Sync desactivado: variable de entorno BC_COMPANY no configurada");
        return;
    }

    try {
        const socios = await fetchAllData(withCompany(`${envConfig.BC_URL}/vendors`));
        for (const socio of socios) {
            // Verificar si el socio ya existe por bc_id
            const [existingSocio]: [any[], any] = await mysql.query(
                'SELECT usuario_id FROM socio WHERE bc_id = ?',
                [socio.no]
            );

            if (existingSocio.length > 0) {
                // Si existe, solo actualizar el nombre
                await mysql.execute(
                    'UPDATE socio SET nombre = ? WHERE bc_id = ?',
                    [socio.name, socio.no]
                );
            } else {
                // Si no existe, crear nuevo usuario y socio
                const conn = await mysql.getConnection();
                try {
                    await conn.beginTransaction();
                    
                    const username = `socio_${socio.no}`;
                    
                    // Crear usuario manualmente para tener más control
                    const salt = Buffer.from(Array.from({length: 16}, () => Math.floor(Math.random() * 256)));
                    const password = 'default_password_123';
                    const hashedPassword = Buffer.from(crypto.createHash('sha256').update(Buffer.concat([salt, Buffer.from(password)])).digest('hex'), 'hex');
                    
                    const [userResult]: [any, any] = await conn.execute(
                        'INSERT INTO usuario (nombre_usuario, clave_hash, clave_salt, rol) VALUES (?, ?, ?, ?)',
                        [username, hashedPassword, salt, 'socio']
                    );
                    
                    const usuarioId = userResult.insertId;
                    
                    // Crear socio con el usuario_id y bc_id
                    await conn.execute(
                        'INSERT INTO socio (usuario_id, bc_id, nombre) VALUES (?, ?, ?)',
                        [usuarioId, socio.no, socio.name]
                    );
                    
                    await conn.commit();
                } catch (err: any) {
                    await conn.rollback();
                    console.error(`Error creando socio ${socio.no} (primer intento):`, {
                        message: err.message,
                        code: err.code,
                        errno: err.errno,
                        sqlState: err.sqlState,
                        sqlMessage: err.sqlMessage
                    });
                    
                    // Si falla (ej: username duplicado), intentar con un username único
                    try {
                        await conn.beginTransaction();
                        const uniqueUsername = `socio_${socio.no}_${Date.now()}`;
                        
                        // Crear usuario manualmente para el retry también
                        const retrySalt = Buffer.from(Array.from({length: 16}, () => Math.floor(Math.random() * 256)));
                        const retryPassword = 'default_password_123';
                        const retryHashedPassword = Buffer.from(crypto.createHash('sha256').update(Buffer.concat([retrySalt, Buffer.from(retryPassword)])).digest('hex'), 'hex');
                        
                        const [retryUserResult]: [any, any] = await conn.execute(
                            'INSERT INTO usuario (nombre_usuario, clave_hash, clave_salt, rol) VALUES (?, ?, ?, ?)',
                            [uniqueUsername, retryHashedPassword, retrySalt, 'socio']
                        );
                        
                        const retryUsuarioId = retryUserResult.insertId;
                        
                        // Crear socio con el usuario_id y bc_id
                        await conn.execute(
                            'INSERT INTO socio (usuario_id, bc_id, nombre) VALUES (?, ?, ?)',
                            [retryUsuarioId, socio.no, socio.name]
                        );
                        
                        await conn.commit();
                    } catch (retryErr: any) {
                        await conn.rollback();
                        console.error(`Error creando socio ${socio.no} (retry):`, {
                            message: retryErr.message,
                            code: retryErr.code,
                            errno: retryErr.errno,
                            sqlState: retryErr.sqlState,
                            sqlMessage: retryErr.sqlMessage
                        });
                    }
                } finally {
                    conn.release();
                }
            }
        }

        const productsRes = await fetchAllData(withCompany(`${envConfig.BC_URL}/items`));
        const products = productsRes.filter((p) => p.itemCategoryCode !== "ABONOS-FERTILIZANTE");
        const abonos = productsRes.filter((p) => p.itemCategoryCode === "ABONOS-FERTILIZANTE");
        for (const p of products) {
            await mysql.execute(
                `
                    INSERT INTO producto (bc_id, bc_code, nombre)
                    VALUES (?, ?, ?)
                    ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)
                `,
                [p.no, p.itemCategoryCode, p.description]
            );
        }

        for (const ab of abonos) {
            await mysql.execute(
                `
                    INSERT INTO abono (bc_id, bc_code, nombre)
                    VALUES (?, ?, ?)
                    ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)
                `,
                [ab.no, ab.itemCategoryCode, ab.description]
            );
        }

//        const fincas = await fetchAllData(withCompany(`${envConfig.BC_URL}/orderAddresses?$expand=orderAddressDimensions`));
//        for (const f of fincas) {
//           await mysql.execute(
//                `
//                    INSERT INTO finca (bc_id, nombre)
//                    VALUES (?, ?)
//                   ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)
//                `,
//                [f.code, f.name]
//            );
//        }

        // TODO: Sectores

    } catch (err: any) {
        console.error("🚨 BC Sync Error:", err);
    }
}

cron.schedule("0 * * * *", () => {
    sync();
});

sync();
