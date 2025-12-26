# Sistema de Migraciones de Base de Datos

Este directorio contiene las migraciones de la base de datos para el proyecto Coagrisan.

## 📁 Estructura

```
scripts/
├── migrations/
│   ├── README.md                    # Este archivo
│   ├── add_sin_inventario_fields.sql
│   ├── fix_maquinaria_enum.sql
│   └── [futuras_migraciones].sql
└── run-migrations.cjs               # Script ejecutor de migraciones
```

## 🚀 Uso

### Ejecutar Migraciones

```bash
# Ejecutar todas las migraciones pendientes
npm run migrate

# Ejecutar migraciones en entorno de desarrollo (levanta DB + migra)
npm run migrate:dev
```

### Crear Nueva Migración

1. Crea un nuevo archivo `.sql` en este directorio
2. Usa un nombre descriptivo con prefijo de fecha/orden: `YYYY-MM-DD_descripcion.sql`
3. Escribe tu SQL de migración

**Ejemplo de nombre:**
```
2025-01-25_add_user_roles_table.sql
2025-01-26_update_product_categories.sql
```

## 📝 Formato de Migración

```sql
-- Descripción de la migración
-- Fecha: YYYY-MM-DD
-- Autor: Tu Nombre

USE `coagrisan`;

-- Tu código SQL aquí
ALTER TABLE tabla ADD COLUMN nueva_columna VARCHAR(255);

-- Más declaraciones SQL...
```

## ⚙️ Cómo Funciona

1. **Orden de Ejecución**: Las migraciones se ejecutan en orden alfabético por nombre de archivo
2. **Control de Estado**: Se crea una tabla `migrations` que registra qué migraciones ya se ejecutaron
3. **Seguridad**: Si una migración falla, el proceso se detiene para evitar inconsistencias
4. **Idempotencia**: Las migraciones ya ejecutadas se saltan automáticamente

## 📊 Tabla de Control

El sistema crea automáticamente una tabla `migrations`:

```sql
CREATE TABLE migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔍 Verificar Estado

Para ver qué migraciones se han ejecutado:

```sql
SELECT filename, executed_at FROM migrations ORDER BY executed_at;
```

## ⚠️ Buenas Prácticas

1. **Nombres Descriptivos**: Usa nombres que expliquen claramente qué hace la migración
2. **Orden Cronológico**: Usa prefijos de fecha para mantener el orden
3. **Reversibilidad**: Considera crear migraciones de rollback si es necesario
4. **Pruebas**: Prueba las migraciones en un entorno de desarrollo antes de producción
5. **Comentarios**: Documenta cambios complejos con comentarios SQL

## 📋 Migraciones Existentes

- `add_sin_inventario_fields.sql` - Agrega campos para productos sin inventario
- `fix_maquinaria_enum.sql` - Corrige ortografía del ENUM maquinaria (pulveriador → pulverizador)

## 🛠️ Troubleshooting

### Error de Conexión
Verifica que las variables de entorno estén configuradas en `.env`:
```
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASS=tu_password
MYSQL_DB=coagrisan
```

### Migración Fallida
Si una migración falla:
1. Revisa el error en la consola
2. Corrige el archivo SQL
3. Ejecuta `npm run migrate` nuevamente

### Forzar Re-ejecución
Si necesitas re-ejecutar una migración:
```sql
DELETE FROM migrations WHERE filename = 'nombre_archivo.sql';
```

## 🔗 Scripts Relacionados

- `npm run migrate` - Ejecuta migraciones pendientes
- `npm run migrate:dev` - Levanta DB de desarrollo y ejecuta migraciones
- `npm run dev:db` - Solo levanta la base de datos de desarrollo