-- Eliminar el usuario admin anterior si existe
DELETE FROM usuarios WHERE nombre_usuario = 'admin';

-- Crear nuevo usuario admin con contraseña hasheada correctamente
-- La contraseña es: Admin123! (hash generado con bcryptjs)
INSERT INTO usuarios (nombre_usuario, contrasena, nombre_completo, rol, activo)
VALUES (
    'admin',
    '$2b$10$VBviwTfDNIREOHRNQX6xJ.equOwK13k4yapDdDOWyLjjfwexc3Axq',
    'Administrador Principal',
    'admin',
    TRUE
); 