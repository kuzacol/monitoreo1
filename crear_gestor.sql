-- Crear usuario gestor con contraseña: Gestor123!
INSERT INTO usuarios (nombre_usuario, contrasena, nombre_completo, rol, activo)
VALUES (
    'gestor1', 
    '$2a$10$XnxmKkVuAf/OK9eUFgYXu.K2.sal9KyHEZMX5qHQoL1Lz8.9ndtDu',
    'Gestor Principal',
    'gestor',
    TRUE
); 