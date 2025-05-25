-- Verificar la estructura de la tabla programadas
SHOW CREATE TABLE programadas;

-- Verificar las foreign keys
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE
    REFERENCED_TABLE_NAME = 'usuarios'
    AND TABLE_SCHEMA = DATABASE(); 