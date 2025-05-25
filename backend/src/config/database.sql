-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS monitoreo_db;
USE monitoreo_db;

-- Hacer backup de la tabla usuarios
CREATE TABLE IF NOT EXISTS usuarios_backup AS SELECT * FROM usuarios;
CREATE TABLE IF NOT EXISTS programadas_backup AS SELECT * FROM programadas;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios_new (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  nombre_completo VARCHAR(100) NOT NULL,
  rol ENUM('admin', 'moderador', 'gestor') NOT NULL DEFAULT 'gestor',
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  ultimo_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Migrar datos de usuarios
INSERT INTO usuarios_new (id, nombre_usuario, contrasena, nombre_completo, rol, activo, created_at)
SELECT id, nombre_usuario, contrasena, nombre_completo, rol, TRUE, created_at
FROM usuarios;

-- Renombrar tablas
DROP TABLE IF EXISTS usuarios;
RENAME TABLE usuarios_new TO usuarios;

-- Tabla de programadas
CREATE TABLE IF NOT EXISTS programadas_new (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_servicio VARCHAR(50) NOT NULL,
  observacion_inicial TEXT NOT NULL,
  fecha_creacion DATETIME NOT NULL,
  estado ENUM('pendiente', 'en_gestion', 'archivada', 'finalizado_sin_contacto') NOT NULL DEFAULT 'pendiente',
  creador_id INT,
  gestor_id INT,
  inicio_gestion DATETIME,
  fin_gestion DATETIME,
  tiempo_resolucion INT,
  observacion_final TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (creador_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (gestor_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Migrar datos de programadas
INSERT INTO programadas_new (
  id, numero_servicio, observacion_inicial, fecha_creacion, 
  estado, gestor_id, inicio_gestion, fin_gestion, 
  tiempo_resolucion, observacion_final, created_at
)
SELECT 
  p.id, p.numero_servicio, p.observacion_inicial, p.fecha_creacion,
  p.estado, u.id, p.inicio_gestion, p.fin_gestion,
  p.tiempo_resolucion, p.observacion_final, p.created_at
FROM programadas p
LEFT JOIN usuarios u ON p.gestor = u.nombre_usuario;

-- Renombrar tablas
DROP TABLE IF EXISTS programadas;
RENAME TABLE programadas_new TO programadas;

-- Tabla de programadas archivadas (histórico)
CREATE TABLE IF NOT EXISTS programadas_historico (
  id INT AUTO_INCREMENT PRIMARY KEY,
  programada_id INT NOT NULL,
  numero_servicio VARCHAR(50) NOT NULL,
  observacion_inicial TEXT NOT NULL,
  observacion_final TEXT,
  fecha_creacion DATETIME NOT NULL,
  creador_id INT,
  gestor_id INT,
  inicio_gestion DATETIME,
  fin_gestion DATETIME,
  tiempo_resolucion INT,
  estado VARCHAR(50) NOT NULL,
  fecha_archivo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creador_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (gestor_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabla de logs de cambios de rol
CREATE TABLE IF NOT EXISTS logs_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  rol_anterior ENUM('admin', 'moderador', 'gestor') NOT NULL,
  rol_nuevo ENUM('admin', 'moderador', 'gestor') NOT NULL,
  modificado_por INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (modificado_por) REFERENCES usuarios(id) ON DELETE NO ACTION
);

-- Procedimiento almacenado para actualizar roles
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS actualizar_rol(
  IN p_usuario_id INT,
  IN p_nuevo_rol ENUM('admin', 'moderador', 'gestor'),
  IN p_modificado_por INT
)
BEGIN
  DECLARE v_rol_anterior ENUM('admin', 'moderador', 'gestor');
  
  -- Obtener rol anterior
  SELECT rol INTO v_rol_anterior
  FROM usuarios
  WHERE id = p_usuario_id;
  
  -- Actualizar rol
  UPDATE usuarios
  SET rol = p_nuevo_rol
  WHERE id = p_usuario_id;
  
  -- Registrar el cambio en el log
  INSERT INTO logs_roles (usuario_id, rol_anterior, rol_nuevo, modificado_por)
  VALUES (p_usuario_id, v_rol_anterior, p_nuevo_rol, p_modificado_por);
END //
DELIMITER ;

-- Asegurarse de que existe al menos un admin
INSERT IGNORE INTO usuarios (nombre_usuario, contrasena, nombre_completo, rol)
SELECT 'admin', '$2a$10$YourHashedPasswordHere', 'Administrador del Sistema', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE rol = 'admin'); 