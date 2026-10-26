import { EntregaDocente, Docente, Receptor } from '../types/index.ts';

function escapeSql(val: string | undefined): string {
  if (val === undefined || val === null) return "''";
  return "'" + val.replace(/'/g, "''").replace(/\\/g, '\\\\') + "'";
}

export function generateMySQLDump(
  entregas: EntregaDocente[],
  docentes: Docente[] = [],
  receptores: Receptor[] = []
): string {
  const insertDocentes = docentes.map((d) => {
    return `INSERT INTO docentes (nombre, titulo, departamento, activo) VALUES (${escapeSql(d.nombre)}, ${escapeSql(d.titulo || '')}, ${escapeSql(d.departamento || '')}, ${d.activo ? 'TRUE' : 'FALSE'}) ON DUPLICATE KEY UPDATE activo = VALUES(activo);`;
  }).join('\n');

  const insertReceptores = receptores.map((r) => {
    return `INSERT INTO personal_recepcion (nombre, cargo, activo) VALUES (${escapeSql(r.nombre)}, ${escapeSql(r.cargo || 'Admisiones y Registros')}, ${r.activo ? 'TRUE' : 'FALSE'}) ON DUPLICATE KEY UPDATE activo = VALUES(activo);`;
  }).join('\n');

  const insertStatements = entregas.map((e) => {
    return `INSERT INTO entregas_docentes (
  numero_comprobante, semestre, nombre_docente, materias_dicta, materias_pendientes,
  materias_educad, materias_presencial, materias_otros,
  nombre_recepcion, fecha_entrega, ciudad, observaciones
) VALUES (
  ${escapeSql(e.numeroComprobante)},
  ${escapeSql(e.semestre)},
  ${escapeSql(e.nombreDocente)},
  ${e.materiasDicta},
  ${e.materiasPendientes},
  ${e.materiasEducad},
  ${e.materiasPresencial},
  ${e.materiasOtros},
  ${escapeSql(e.nombreRecepcion)},
  ${escapeSql(e.fecha)},
  ${escapeSql(e.ciudad || 'Santa Cruz de la Sierra')},
  ${e.observaciones ? escapeSql(e.observaciones) : 'NULL'}
);`;
  }).join('\n\n');

  return `-- =====================================================================
-- EXPORTACIÓN MYSQL: UNIVERSIDAD NUR
-- DEPARTAMENTO DE ADMISIONES Y REGISTROS
-- Comprobantes de Recepción de Notas
-- Fecha: ${new Date().toISOString()}
-- =====================================================================

CREATE DATABASE IF NOT EXISTS gestion_academica_nur
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE gestion_academica_nur;

-- 1. Catálogo de Docentes
CREATE TABLE IF NOT EXISTS docentes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL UNIQUE,
  titulo VARCHAR(100) NULL,
  departamento VARCHAR(100) NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Catálogo de Personal de Recepción
CREATE TABLE IF NOT EXISTS personal_recepcion (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL UNIQUE,
  cargo VARCHAR(100) NOT NULL DEFAULT 'Admisiones y Registros',
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de Comprobantes de Notas
CREATE TABLE IF NOT EXISTS entregas_docentes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  numero_comprobante VARCHAR(20) NOT NULL UNIQUE,
  semestre VARCHAR(20) NOT NULL,
  nombre_docente VARCHAR(150) NOT NULL,
  materias_dicta TINYINT UNSIGNED NOT NULL DEFAULT 0,
  materias_pendientes TINYINT UNSIGNED NOT NULL DEFAULT 0,
  materias_educad TINYINT UNSIGNED NOT NULL DEFAULT 0,
  materias_presencial TINYINT UNSIGNED NOT NULL DEFAULT 0,
  materias_otros TINYINT UNSIGNED NOT NULL DEFAULT 0,
  total_entregadas INT GENERATED ALWAYS AS (materias_educad + materias_presencial + materias_otros) STORED,
  nombre_recepcion VARCHAR(150) NOT NULL,
  fecha_entrega DATE NOT NULL,
  ciudad VARCHAR(100) NOT NULL DEFAULT 'Santa Cruz de la Sierra',
  observaciones TEXT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_comprobante (numero_comprobante),
  INDEX idx_semestre (semestre),
  INDEX idx_nombre_docente (nombre_docente),
  INDEX idx_nombre_recepcion (nombre_recepcion),
  INDEX idx_fecha_entrega (fecha_entrega)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserción de Docentes (${docentes.length} registros)
${insertDocentes}

-- Inserción de Personal de Recepción (${receptores.length} registros)
${insertReceptores}

-- Inserción de Comprobantes Activos (${entregas.length} registros)
${insertStatements}
`;
}

export function downloadSQLFile(
  entregas: EntregaDocente[],
  docentes: Docente[] = [],
  receptores: Receptor[] = []
): void {
  const content = generateMySQLDump(entregas, docentes, receptores);
  const blob = new Blob([content], { type: 'application/sql;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `nur_comprobantes_notas_${new Date().toISOString().slice(0, 10)}.sql`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCSVFile(entregas: EntregaDocente[]): void {
  const headers = [
    'No. Comprobante',
    'Semestre',
    'Nombre del Docente',
    'No. Materias Dicta',
    'No. Materias Pendientes',
    'Entrega Educad',
    'Entrega Presencial',
    'Entrega Otros',
    'Total Entregadas',
    'Nombre (Recepcion)',
    'Fecha',
    'Ciudad',
    'Observaciones'
  ];

  const rows = entregas.map((e) => [
    `"${e.numeroComprobante}"`,
    `"${e.semestre}"`,
    `"${e.nombreDocente.replace(/"/g, '""')}"`,
    e.materiasDicta,
    e.materiasPendientes,
    e.materiasEducad,
    e.materiasPresencial,
    e.materiasOtros,
    e.materiasEducad + e.materiasPresencial + e.materiasOtros,
    `"${e.nombreRecepcion.replace(/"/g, '""')}"`,
    e.fecha,
    `"${(e.ciudad || 'Santa Cruz de la Sierra').replace(/"/g, '""')}"`,
    `"${(e.observaciones || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `nur_comprobantes_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
