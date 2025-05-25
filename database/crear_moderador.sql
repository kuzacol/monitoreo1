-- Crear usuario moderador con contraseña: Mod123!
INSERT INTO usuarios (nombre_usuario, contrasena, nombre_completo, rol, activo)
VALUES (
    'moderador1', 
    '$2a$10$XnxmKkVuAf/OK9eUFgYXu.K2.sal9KyHEZMX5qHQoL1Lz8.9ndtDu',
    'Moderador Principal',
    'moderador',
    TRUE
); 