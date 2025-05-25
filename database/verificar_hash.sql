USE monitoreo_db;

-- Verificar el hash actual del admin
SELECT 
    id,
    nombre_usuario,
    contrasena,
    rol,
    activo
FROM usuarios 
WHERE nombre_usuario = 'admin';

-- Verificar el formato del hash
SELECT 
    nombre_usuario,
    LEFT(contrasena, 4) as formato_hash,
    LENGTH(contrasena) as longitud_hash,
    activo,
    rol
FROM usuarios 
WHERE nombre_usuario = 'admin'; 