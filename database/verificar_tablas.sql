-- Mostrar todas las tablas en la base de datos
SHOW TABLES;

-- Verificar la estructura de la tabla usuarios
DESCRIBE usuarios;

-- Verificar los usuarios existentes
SELECT id, nombre_usuario, nombre_completo, rol, activo 
FROM usuarios;

-- Verificar la estructura de la tabla programadas
DESCRIBE programadas;

-- Verificar las foreign keys de programadas
SELECT 
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'programadas'
AND REFERENCED_TABLE_NAME IS NOT NULL; 