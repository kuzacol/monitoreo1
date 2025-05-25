-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS monitoreo_db;

-- Usar la base de datos
USE monitoreo_db;

-- Crear tabla de usuarios
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

-- Crear tabla de programadas
CREATE TABLE IF NOT EXISTS programadas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_servicio VARCHAR(50) NOT NULL,
  observacion_inicial TEXT NOT NULL,
  observacion_final TEXT,
  fecha_creacion DATETIME NOT NULL,
  estado ENUM('pendiente', 'en_gestion', 'archivada', 'finalizado_sin_contacto') NOT NULL DEFAULT 'pendiente',
  creada_por INT,
  gestionada_por INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (creada_por) REFERENCES usuarios(id),
  FOREIGN KEY (gestionada_por) REFERENCES usuarios(id)
);

-- Crear tabla de logs de roles
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