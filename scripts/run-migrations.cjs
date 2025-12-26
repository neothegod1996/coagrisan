const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigrations() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || 'localhost',
        port: process.env.MYSQL_PORT || 3306,
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASS || 'root',
        database: process.env.MYSQL_DB || 'coagrisan'
    });

    try {
        console.log('🔗 Conectado a la base de datos...');
        
        // Crear tabla de migraciones si no existe
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS migrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                filename VARCHAR(255) NOT NULL UNIQUE,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('📋 Tabla de migraciones verificada');

        // Obtener migraciones ya ejecutadas
        const [executedMigrations] = await connection.execute(
            'SELECT filename FROM migrations ORDER BY executed_at'
        );
        const executedFiles = executedMigrations.map(row => row.filename);
        
        // Leer archivos de migración
        const migrationsDir = path.join(__dirname, 'migrations');
        if (!fs.existsSync(migrationsDir)) {
            console.log('📁 Creando directorio de migraciones...');
            fs.mkdirSync(migrationsDir, { recursive: true });
        }

        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort(); // Ejecutar en orden alfabético

        console.log(`📂 Encontradas ${migrationFiles.length} migraciones`);
        
        let executedCount = 0;
        
        for (const filename of migrationFiles) {
            if (executedFiles.includes(filename)) {
                console.log(`⏭️  Saltando ${filename} (ya ejecutada)`);
                continue;
            }

            console.log(`🚀 Ejecutando migración: ${filename}`);
            
            try {
                const migrationPath = path.join(migrationsDir, filename);
                const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
                
                // Limpiar el SQL: remover comentarios y líneas vacías
                const cleanSQL = migrationSQL
                    .split('\n')
                    .filter(line => {
                        const trimmed = line.trim();
                        return trimmed.length > 0 && 
                               !trimmed.startsWith('--') && 
                               !trimmed.startsWith('/*') && 
                               !trimmed.startsWith('*') &&
                               !trimmed.endsWith('*/');
                    })
                    .join('\n');

                // Dividir el SQL en declaraciones individuales
                const statements = cleanSQL
                    .split(';')
                    .map(stmt => stmt.trim())
                    .filter(stmt => stmt.length > 0);

                // Ejecutar cada declaración por separado
                for (const statement of statements) {
                    if (statement.trim()) {
                        // Saltar comandos USE ya que estamos conectados a la DB correcta
                        if (statement.toUpperCase().startsWith('USE ')) {
                            console.log(`   ⏭️  Saltando comando USE (ya conectados a la DB)`);
                            continue;
                        }
                        
                        try {
                            await connection.execute(statement);
                        } catch (error) {
                            // Si falla con prepared statement, intentar con query normal
                            if (error.code === 'ER_UNSUPPORTED_PS') {
                                await connection.query(statement);
                            } else {
                                throw error;
                            }
                        }
                    }
                }

                // Marcar como ejecutada
                await connection.execute(
                    'INSERT INTO migrations (filename) VALUES (?)',
                    [filename]
                );

                console.log(`✅ Migración ${filename} ejecutada exitosamente`);
                executedCount++;
                
            } catch (error) {
                console.error(`❌ Error ejecutando ${filename}:`, error.message);
                throw error; // Detener si hay un error
            }
        }

        if (executedCount === 0) {
            console.log('✨ Todas las migraciones ya están actualizadas');
        } else {
            console.log(`🎉 ${executedCount} migraciones ejecutadas exitosamente`);
        }

        // Mostrar estado final
        console.log('\n📊 Estado de migraciones:');
        const [allMigrations] = await connection.execute(
            'SELECT filename, executed_at FROM migrations ORDER BY executed_at'
        );
        allMigrations.forEach(migration => {
            console.log(`   ✅ ${migration.filename} - ${migration.executed_at}`);
        });

    } catch (error) {
        console.error('💥 Error ejecutando migraciones:', error);
        process.exit(1);
    } finally {
        await connection.end();
        console.log('\n🔌 Conexión cerrada');
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    runMigrations();
}

module.exports = { runMigrations };