-- Modificar el ENUM de estados en la tabla programadas
ALTER TABLE programadas 
MODIFY COLUMN estado ENUM('pendiente', 'en_gestion', 'archivada', 'finalizado_sin_contacto') NOT NULL DEFAULT 'pendiente';

-- Verificar los estados disponibles
SHOW COLUMNS FROM programadas LIKE 'estado'; 