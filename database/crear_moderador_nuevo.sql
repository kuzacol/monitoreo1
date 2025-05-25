-- Eliminar el usuario moderador anterior si existe
DELETE FROM usuarios WHERE nombre_usuario = 'moderador1';

-- Crear nuevo usuario moderador con contraseña hasheada correctamente
-- La contraseña es: Mod123! (hash generado con bcryptjs)
INSERT INTO usuarios (nombre_usuario, contrasena, nombre_completo, rol, activo)
VALUES (
    'moderador1',
    '$2b$10$VBviwTfDNIREOHRNQX6xJ.equOwK13k4yapDdDOWyLjjfwexc3Axq',
    'Moderador Principal',
    'moderador',
    TRUE
); 