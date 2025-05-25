-- Eliminar el usuario gestor anterior si existe
DELETE FROM usuarios WHERE nombre_usuario = 'gestor1';

-- Crear nuevo usuario gestor con contraseña hasheada correctamente
-- La contraseña es: Gestor123! (hash generado con bcryptjs)
INSERT INTO usuarios (nombre_usuario, contrasena, nombre_completo, rol, activo)
VALUES (
    'gestor1',
    '$2a$10$XnxmKkVuAf/OK9eUFgYXu.K2.sal9KyHEZMX5qHQoL1Lz8.9ndtDu',
    'Gestor Principal',
    'gestor',
    TRUE
); 