-- Insertar usuario de prueba
-- La contraseña es '123456'
INSERT INTO usuarios (nombre_usuario, contrasena, nombre_completo) 
VALUES ('admin', '$2a$10$3HGhw/QpXrYrAq9WbI7ZvOgTc6SsyqFqnLHCrZtNZ5kU1nKtkNrIi', 'Administrador');

-- Si necesitas más usuarios de prueba:
INSERT INTO usuarios (nombre_usuario, contrasena, nombre_completo) 
VALUES ('usuario1', '$2a$10$YourHashedPasswordHere', 'Usuario de Prueba 1');

-- Para ver los usuarios creados:
SELECT id, nombre_usuario, nombre_completo FROM usuarios; 