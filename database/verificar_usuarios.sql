-- Mostrar las bases de datos
SHOW DATABASES;

-- Seleccionar la base de datos
USE monitoreo_db;

-- Mostrar las tablas de la base de datos actual
SHOW TABLES;

-- Intentar seleccionar datos de la tabla usuarios
SELECT * FROM usuarios LIMIT 1;

-- Verificar estructura de la tabla
SHOW CREATE TABLE usuarios;

-- Verificar usuarios existentes y sus roles
SELECT 
    id,
    nombre_usuario,
    nombre_completo,
    rol,
    activo,
    ultimo_login,
    created_at,
    updated_at 
FROM usuarios 
ORDER BY created_at DESC;

-- Verificar el hash de la contraseña del admin
SELECT 
    id,
    nombre_usuario,
    LEFT(contrasena, 30) as inicio_hash,
    rol,
    activo
FROM usuarios 
WHERE nombre_usuario = 'admin';

-- Verificar índices
SHOW INDEX FROM usuarios;

-- Verificar todos los usuarios y sus estados
SELECT 
    id,
    nombre_usuario,
    nombre_completo,
    rol,
    activo,
    LENGTH(contrasena) as longitud_contrasena,
    LEFT(contrasena, 10) as inicio_hash,
    created_at,
    updated_at
FROM usuarios
ORDER BY id; 