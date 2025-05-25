-- Verificar si la columna estado existe
SHOW COLUMNS FROM programadas_historico LIKE 'estado';

-- Si no existe, agregarla
ALTER TABLE programadas_historico 
ADD COLUMN estado VARCHAR(50) NOT NULL AFTER tiempo_resolucion;

-- Modificar la columna estado existente
ALTER TABLE programadas_historico 
MODIFY COLUMN estado VARCHAR(50) NOT NULL; 