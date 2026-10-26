-- =====================================================================
-- BASE DE DATOS MYSQL: UNIVERSIDAD NUR
-- DEPARTAMENTO DE ADMISIONES Y REGISTROS
-- Comprobantes de Recepción de Notas con Listas de Docentes y Recepción
-- =====================================================================

CREATE DATABASE IF NOT EXISTS gestion_academica_nur
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE gestion_academica_nur;

-- =====================================================================
-- 1. TABLA: docentes (Catálogo oficial de docentes habilitados)
-- =====================================================================

DROP TABLE IF EXISTS docentes;

CREATE TABLE docentes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL UNIQUE COMMENT 'Nombre completo del docente',
  titulo VARCHAR(100) NULL COMMENT 'Grado académico (ej. Dra., Ing., Msc., Lic.)',
  departamento VARCHAR(100) NULL COMMENT 'Facultad o Departamento Académico',
  activo BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Estado del docente en la institución',
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_docente_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 2. TABLA: personal_recepcion (Catálogo del personal receptor)
-- =====================================================================

DROP TABLE IF EXISTS personal_recepcion;

CREATE TABLE personal_recepcion (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL UNIQUE COMMENT 'Nombre completo del funcionario',
  cargo VARCHAR(100) NOT NULL DEFAULT 'Admisiones y Registros' COMMENT 'Cargo institucional',
  activo BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Habilitado para recibir comprobantes',
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_recepcion_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 3. TABLA PRINCIPAL: entregas_docentes (Comprobantes de notas)
-- Se ha eliminado el campo 'Entrega' a solicitud
-- =====================================================================

DROP TABLE IF EXISTS entregas_docentes;

CREATE TABLE entregas_docentes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  
  -- Numeración correlativa estricta y única (ej. 0005531)
  numero_comprobante VARCHAR(20) NOT NULL COMMENT 'Número correlativo único no duplicado',
  
  -- Periodo Académico
  semestre VARCHAR(20) NOT NULL COMMENT 'Periodo lectivo (ej. 2025-1, 2024-2)',
  
  -- Docente (vinculado al catálogo de docentes)
  nombre_docente VARCHAR(150) NOT NULL COMMENT 'Nombre del docente que realiza la entrega',
  
  -- Carga Académica
  materias_dicta TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'No. total de materias que dicta',
  materias_pendientes TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'No. materias pendientes para entregar',
  
  -- Desglose de Materias que Entrega: Educad, Presencial, Otros;
  materias_educad TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Materias entregadas modalidad Educad',
  materias_presencial TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Materias entregadas modalidad Presencial',
  materias_otros TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Materias entregadas modalidad Otros',
  
  -- Total calculado automáticamente
  total_entregadas INT GENERATED ALWAYS AS (materias_educad + materias_presencial + materias_otros) STORED,
  
  -- Personal de Recepción y Control Temporal
  nombre_recepcion VARCHAR(150) NOT NULL COMMENT 'Nombre de quien recibe en Admisiones y Registros',
  fecha_entrega DATE NOT NULL COMMENT 'Fecha de recepción',
  ciudad VARCHAR(100) NOT NULL DEFAULT 'Santa Cruz de la Sierra',
  observaciones TEXT NULL COMMENT 'Detalles u observaciones adicionales',
  
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Restricción de unicidad del comprobante correlativo
  UNIQUE KEY uq_comprobante (numero_comprobante),
  INDEX idx_semestre (semestre),
  INDEX idx_nombre_docente (nombre_docente),
  INDEX idx_nombre_recepcion (nombre_recepcion),
  INDEX idx_fecha_entrega (fecha_entrega)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 4. PROCEDIMIENTOS ALMACENADOS PARA INSERTAR DOCENTES Y RECEPTORES
-- =====================================================================

DELIMITER $$

CREATE PROCEDURE sp_insertar_docente(
  IN p_nombre VARCHAR(150),
  IN p_titulo VARCHAR(100),
  IN p_departamento VARCHAR(100),
  OUT p_id INT
)
BEGIN
  INSERT INTO docentes (nombre, titulo, departamento, activo)
  VALUES (TRIM(p_nombre), TRIM(p_titulo), TRIM(p_departamento), TRUE)
  ON DUPLICATE KEY UPDATE activo = TRUE;
  
  SET p_id = LAST_INSERT_ID();
END$$

CREATE PROCEDURE sp_insertar_receptor(
  IN p_nombre VARCHAR(150),
  IN p_cargo VARCHAR(100),
  OUT p_id INT
)
BEGIN
  INSERT INTO personal_recepcion (nombre, cargo, activo)
  VALUES (TRIM(p_nombre), TRIM(p_cargo), TRUE)
  ON DUPLICATE KEY UPDATE activo = TRUE;
  
  SET p_id = LAST_INSERT_ID();
END$$

DELIMITER ;

-- =====================================================================
-- 5. DATOS SEMILLA (DOCENTES, RECEPTORES Y COMPROBANTES)
-- =====================================================================

-- Docentes de la Universidad Nur
INSERT INTO docentes (nombre, titulo, departamento) VALUES
('Dra. María Elena Rostagno', 'Doctora en Ciencias Exactas', 'Ingeniería'),
('Ing. Roberto Gómez Palacios', 'Ingeniero de Sistemas', 'Tecnología'),
('Msc. Clara Beatriz Fuentes', 'Magíster en Bioquímica', 'Salud'),
('Lic. Andrés Felipe Moreno', 'Licenciado en Administración', 'Ciencias Empresariales'),
('Dra. Patricia Silva Méndez', 'Doctora en Educación Superior', 'Humanidades'),
('Dr. Javier Hernando Castro', 'Doctor en Derecho', 'Ciencias Jurídicas'),
('Ing. Gustavo Adolfo Paz', 'Ingeniero Comercial', 'Ciencias Empresariales'),
('Lic. Verónica Salazar Pinto', 'Licenciada en Comunicación', 'Humanidades');

-- Personal de Recepción en Admisiones y Registros
INSERT INTO personal_recepcion (nombre, cargo) VALUES
('Lic. Carlos Morales', 'Encargado de Admisiones y Registros'),
('Prof. Andrea Vaca', 'Secretaria General Académica'),
('Lic. Mariana Torrico', 'Coordinadora de Registros Estudiantiles'),
('Ing. Fernando Justiniano', 'Oficial de Control Curricular');

-- Comprobantes iniciales
INSERT INTO entregas_docentes (
  numero_comprobante, semestre, nombre_docente, materias_dicta, materias_pendientes,
  materias_educad, materias_presencial, materias_otros,
  nombre_recepcion, fecha_entrega, ciudad, observaciones
) VALUES
('0005531', '2025-1', 'Dra. María Elena Rostagno', 4, 1, 2, 1, 0, 'Lic. Carlos Morales', '2025-03-15', 'Santa Cruz de la Sierra', 'Falta entrega de planillas finales de Cálculo II presencial.'),
('0005532', '2025-1', 'Ing. Roberto Gómez Palacios', 3, 0, 1, 2, 0, 'Lic. Carlos Morales', '2025-03-16', 'Santa Cruz de la Sierra', 'Entrega total en orden. Evaluaciones digitales y actas firmadas.'),
('0005533', '2025-1', 'Msc. Clara Beatriz Fuentes', 5, 2, 1, 1, 1, 'Prof. Andrea Vaca', '2025-03-18', 'Santa Cruz de la Sierra', 'Pendiente reporte de notas para taller de laboratorio de Bioquímica.'),
('0005534', '2024-2', 'Lic. Andrés Felipe Moreno', 4, 0, 2, 2, 0, 'Lic. Carlos Morales', '2024-11-20', 'Santa Cruz de la Sierra', 'Cierre de semestre regular sin observaciones.'),
('0005535', '2024-2', 'Dra. Patricia Silva Méndez', 6, 1, 3, 2, 0, 'Prof. Andrea Vaca', '2024-11-25', 'Santa Cruz de la Sierra', 'Entrega tardía justificada por licencia médica institucional.'),
('0005536', '2024-1', 'Dr. Javier Hernando Castro', 3, 0, 1, 1, 1, 'Lic. Carlos Morales', '2024-06-12', 'Santa Cruz de la Sierra', 'Documentación entregada digital en Educad y carpetas físicas.');

-- Vista de resumen por semestre
CREATE OR REPLACE VIEW vista_resumen_semestral AS
SELECT 
  semestre,
  COUNT(*) AS total_comprobantes,
  SUM(materias_dicta) AS total_materias_dictadas,
  SUM(total_entregadas) AS total_materias_entregadas,
  SUM(materias_educad) AS total_educad,
  SUM(materias_presencial) AS total_presencial,
  SUM(materias_otros) AS total_otros,
  SUM(materias_pendientes) AS total_materias_pendientes,
  ROUND(
    CASE 
      WHEN SUM(materias_dicta) > 0 THEN (SUM(total_entregadas) / SUM(materias_dicta)) * 100 
      ELSE 0 
    END, 2
  ) AS porcentaje_cumplimiento
FROM entregas_docentes
GROUP BY semestre
ORDER BY semestre DESC;
