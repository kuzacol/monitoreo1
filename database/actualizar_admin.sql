-- Actualizar la contraseña del admin con el nuevo hash verificado
-- La contraseña es: Admin123!
UPDATE usuarios 
SET contrasena = '$2b$10$W9Lu7jflYMM9y2nTZq5urOnu9g9ypteq21tQ5w3WsZ6tDAjTgurMC'
WHERE nombre_usuario = 'admin'; 