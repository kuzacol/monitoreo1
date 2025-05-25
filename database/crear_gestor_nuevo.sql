-- Eliminar el usuario gestor anterior si existe
DELETE FROM usuarios WHERE nombre_usuario = 'gestor1';

-- Crear nuevo usuario gestor con contraseña hasheada correctamente
-- La contraseña es: Gestor123! (hash generado con bcrypt y 10 rondas)
INSERT INTO usuarios (nombre_usuario, contrasena, nombre_completo, rol, activo)
VALUES (
    'gestor1',
    '$2b$10$3cqoq9yD.ZyuV.qZqX9X6.1QiLJZ8yS5QXJRF0O5LrZZzHJSFlVPO',
    'Gestor Principal',
    'gestor',
    TRUE
); 