-- Eliminar el usuario gestor anterior si existe
DELETE FROM usuarios WHERE nombre_usuario = 'gestor1';

-- Crear nuevo usuario gestor con contraseña hasheada correctamente
-- La contraseña es: Gestor123! (hash generado y verificado con bcryptjs)
INSERT INTO usuarios (nombre_usuario, contrasena, nombre_completo, rol, activo)
VALUES (
    'gestor1',
    '$2b$10$VBviwTfDNIREOHRNQX6xJ.equOwK13k4yapDdDOWyLjjfwexc3Axq',
    'Gestor Principal',
    'gestor',
    TRUE
); 