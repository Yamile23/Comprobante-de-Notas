import React, { useState } from 'react';
import { EntregaDocente, Docente, Receptor } from '../types/index.ts';
import { generateMySQLDump, downloadSQLFile } from '../utils/sqlExporter.ts';
import {
  Database,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Table,
  Layers,
  Key,
  Users
} from 'lucide-react';

interface MySQLViewerProps {
  entregas: EntregaDocente[];
  docentes: Docente[];
  receptores: Receptor[];
}

export const MySQLViewer: React.FC<MySQLViewerProps> = ({
  entregas,
  docentes,
  receptores,
}) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'sql' | 'nodejs' | 'php' | 'python'>('sql');
  const [copied, setCopied] = useState(false);

  const sqlContent = generateMySQLDump(entregas, docentes, receptores);

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nodeJsSnippet = `// Node.js + Express + mysql2 (Sentencias Preparadas para Docentes y Comprobantes)
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'app_docentes',
  password: process.env.DB_PASSWORD || 'SecretPassword123!',
  database: 'gestion_academica_nur',
  charset: 'utf8mb4'
});

// 1. Insertar o Listar Docentes
app.post('/api/docentes', async (req, res) => {
  const { nombre, titulo, departamento } = req.body;
  const [result] = await pool.execute(
    'INSERT INTO docentes (nombre, titulo, departamento, activo) VALUES (?, ?, ?, TRUE)',
    [nombre, titulo || null, departamento || null]
  );
  res.status(201).json({ id: result.insertId, nombre });
});

// 2. Registrar Comprobante de Recepción de Notas (Sin campo entrega)
app.post('/api/comprobantes', async (req, res) => {
  const {
    numeroComprobante, semestre, nombreDocente,
    materiasDicta, materiasPendientes, materiasEducad,
    materiasPresencial, materiasOtros, nombreRecepcion,
    fecha, ciudad, observaciones
  } = req.body;

  const query = \`
    INSERT INTO entregas_docentes (
      numero_comprobante, semestre, nombre_docente, materias_dicta, materias_pendientes,
      materias_educad, materias_presencial, materias_otros,
      nombre_recepcion, fecha_entrega, ciudad, observaciones
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  \`;

  const [result] = await pool.execute(query, [
    numeroComprobante, semestre, nombreDocente, materiasDicta, materiasPendientes,
    materiasEducad, materiasPresencial, materiasOtros, nombreRecepcion,
    fecha, ciudad || 'Santa Cruz de la Sierra', observaciones || null
  ]);

  res.status(201).json({ id: result.insertId, correlativo: numeroComprobante });
});`;

  const phpSnippet = `<?php
// PHP PDO con MySQL: Universidad Nur
$pdo = new PDO("mysql:host=localhost;dbname=gestion_academica_nur;charset=utf8mb4", "app_docentes", "SecretPassword123!", [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_EMULATE_PREPARES => false,
]);

// Inserción de Comprobante
$sql = "INSERT INTO entregas_docentes (
            numero_comprobante, semestre, nombre_docente, materias_dicta, materias_pendientes,
            materias_educad, materias_presencial, materias_otros,
            nombre_recepcion, fecha_entrega, ciudad, observaciones
        ) VALUES (
            :num, :semestre, :docente, :dicta, :pendientes,
            :educad, :presencial, :otros,
            :recepcion, :fecha, :ciudad, :obs
        )";

$stmt = $pdo->prepare($sql);
$stmt->execute([
    ':num'        => $_POST['numero_comprobante'],
    ':semestre'   => $_POST['semestre'],
    ':docente'    => $_POST['nombre_docente'],
    ':dicta'      => (int)$_POST['materias_dicta'],
    ':pendientes' => (int)$_POST['materias_pendientes'],
    ':educad'     => (int)$_POST['materias_educad'],
    ':presencial' => (int)$_POST['materias_presencial'],
    ':otros'      => (int)$_POST['materias_otros'],
    ':recepcion'  => $_POST['nombre_recepcion'],
    ':fecha'      => $_POST['fecha'],
    ':ciudad'     => $_POST['ciudad'] ?? 'Santa Cruz de la Sierra',
    ':obs'        => $_POST['observaciones'] ?? null
]);
?>`;

  const pythonSnippet = `# Python PyMySQL: Inserción Segura
import pymysql

connection = pymysql.connect(
    host='localhost',
    user='app_docentes',
    password='SecretPassword123!',
    database='gestion_academica_nur',
    charset='utf8mb4'
)

with connection.cursor() as cursor:
    sql = """
    INSERT INTO entregas_docentes (
        numero_comprobante, semestre, nombre_docente, materias_dicta, materias_pendientes,
        materias_educad, materias_presencial, materias_otros,
        nombre_recepcion, fecha_entrega, ciudad, observaciones
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    cursor.execute(sql, (
        data['numeroComprobante'], data['semestre'], data['nombreDocente'],
        data['materiasDicta'], data['materiasPendientes'], data['materiasEducad'],
        data['materiasPresencial'], data['materiasOtros'], data['nombreRecepcion'],
        data['fecha'], data.get('ciudad', 'Santa Cruz de la Sierra'), data.get('observaciones')
    ))
connection.commit()`;

  return (
    <div className="space-y-6">
      {/* Top Banner & Info */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900">
                Arquitectura de Base de Datos MySQL: Universidad Nur
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Esquema relacional con tablas para <strong className="text-slate-800">Docentes</strong>, <strong className="text-slate-800">Personal de Recepción</strong> y <strong className="text-slate-800">Comprobantes de Entrega</strong> con numeración correlativa única (sin duplicados).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado!' : 'Copiar SQL'}</span>
            </button>
            <button
              type="button"
              onClick={() => downloadSQLFile(entregas, docentes, receptores)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar .SQL Completo</span>
            </button>
          </div>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100 text-xs">
          <div className="flex items-start gap-2.5">
            <Users className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-800">Listas Catálogos Normalizadas</strong>
              <span className="text-slate-500">
                Tablas independientes `docentes` ({docentes.length}) y `personal_recepcion` ({receptores.length}) para inserción flexible.
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Key className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-800">Correlativo Único</strong>
              <span className="text-slate-500">
                Restricción `UNIQUE KEY uq_comprobante` que imposibilita duplicados.
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-800">Eficiencia y Seguridad</strong>
              <span className="text-slate-500">
                Campo generado `total_entregadas` STORED e índices B-Tree en campos clave.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Code Viewer Container */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
        {/* Code tabs */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveCodeTab('sql')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeCodeTab === 'sql'
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Script SQL (DDL + Listas + Comprobantes)
            </button>
            <button
              onClick={() => setActiveCodeTab('nodejs')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeCodeTab === 'nodejs'
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Node.js / Express
            </button>
            <button
              onClick={() => setActiveCodeTab('php')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeCodeTab === 'php'
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              PHP PDO
            </button>
            <button
              onClick={() => setActiveCodeTab('python')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeCodeTab === 'python'
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Python PyMySQL
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            {activeCodeTab === 'sql' && `MySQL 8.0+ · ${entregas.length} comprobantes · ${docentes.length} docentes`}
            {activeCodeTab === 'nodejs' && `mysql2/promise`}
            {activeCodeTab === 'php' && `PDO Prepared Statements`}
            {activeCodeTab === 'python' && `PyMySQL Connection`}
          </div>
        </div>

        {/* Code Viewport */}
        <div className="p-4 overflow-x-auto max-h-[500px] text-xs font-mono text-slate-200 leading-relaxed">
          {activeCodeTab === 'sql' && (
            <pre className="whitespace-pre">{sqlContent}</pre>
          )}
          {activeCodeTab === 'nodejs' && (
            <pre className="whitespace-pre text-emerald-300">{nodeJsSnippet}</pre>
          )}
          {activeCodeTab === 'php' && (
            <pre className="whitespace-pre text-sky-300">{phpSnippet}</pre>
          )}
          {activeCodeTab === 'python' && (
            <pre className="whitespace-pre text-amber-300">{pythonSnippet}</pre>
          )}
        </div>
      </div>

      {/* Relational Tables Dictionary */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Table className="w-4 h-4 text-slate-500" />
          <span>Esquema de Tablas Relacionales en MySQL</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-xs text-blue-700 block mb-1">1. Tabla: `docentes`</span>
            <p className="text-xs text-slate-600 mb-2">Permite registrar y consultar todos los docentes de la institución.</p>
            <ul className="text-xs font-mono space-y-1 text-slate-700">
              <li>• id INT UNSIGNED AUTO_INCREMENT PK</li>
              <li>• nombre VARCHAR(150) NOT NULL UNIQUE</li>
              <li>• titulo VARCHAR(100) NULL</li>
              <li>• departamento VARCHAR(100) NULL</li>
              <li>• activo BOOLEAN DEFAULT TRUE</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-xs text-emerald-700 block mb-1">2. Tabla: `personal_recepcion`</span>
            <p className="text-xs text-slate-600 mb-2">Personal encargado de la recepción de notas en secretaría.</p>
            <ul className="text-xs font-mono space-y-1 text-slate-700">
              <li>• id INT UNSIGNED AUTO_INCREMENT PK</li>
              <li>• nombre VARCHAR(150) NOT NULL UNIQUE</li>
              <li>• cargo VARCHAR(100) NOT NULL</li>
              <li>• activo BOOLEAN DEFAULT TRUE</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
