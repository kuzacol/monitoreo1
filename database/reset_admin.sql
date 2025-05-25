USE monitoreo_db;

-- Actualizar el usuario admin existente
UPDATE usuarios 
SET 
    contrasena = '$2b$10$fPObS0x.AZuzf9u4aCG.uuzLyw4Xeg2s6Bcwxztor0iZt.BztcQhS', -- Admin123!
    nombre_completo = 'Administrador del Sistema',
    rol = 'admin',
    activo = TRUE,
    updated_at = NOW()
WHERE nombre_usuario = 'admin'; 