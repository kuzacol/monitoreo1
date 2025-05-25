USE monitoreo_db;

-- Verificar el estado actual del admin
SELECT 
    id,
    nombre_usuario,
    nombre_completo,
    rol,
    activo,
    LEFT(contrasena, 10) as inicio_hash,
    LENGTH(contrasena) as longitud_hash,
    ultimo_login,
    created_at,
    updated_at
FROM usuarios 
WHERE nombre_usuario = 'admin'; 