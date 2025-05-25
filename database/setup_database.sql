-- Crear la tabla de usuarios si no existe
CREATE TABLE IF NOT EXISTS usuarios (
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

-- Crear la tabla de programadas
CREATE TABLE IF NOT EXISTS programadas (
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

-- Crear la tabla de programadas archivadas (histórico)
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

-- Crear la tabla de logs de roles
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

-- Asegurarse de que existe el usuario admin con la contraseña: Admin123!
INSERT IGNORE INTO usuarios (nombre_usuario, contrasena, nombre_completo, rol)
VALUES ('admin', '$2a$10$XnxmKkVuAf/OK9eUFgYXu.K2.sal9KyHEZMX5qHQoL1Lz8.9ndtDu', 'Administrador del Sistema', 'admin'); 