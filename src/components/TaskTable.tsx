import React, { useState, useMemo } from 'react';
import { EntregaDocente, Docente, Receptor } from '../types/index.ts';
import {
  Search,
  Filter,
  Pencil,
  Trash2,
  FileText,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Plus,
  ArrowUpDown,
  Users,
} from 'lucide-react';
import { downloadCSVFile, downloadSQLFile } from '../utils/sqlExporter.ts';

interface TaskTableProps {
  entregas: EntregaDocente[];
  docentes: Docente[];
  receptores: Receptor[];
  onEdit: (entrega: EntregaDocente) => void;
  onDelete: (entrega: EntregaDocente) => void;
  onViewDoc: (entrega: EntregaDocente) => void;
  onOpenNew: () => void;
  onOpenCatalogo: () => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  entregas,
  docentes,
  receptores,
  onEdit,
  onDelete,
  onViewDoc,
  onOpenNew,
  onOpenCatalogo,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemestre, setSelectedSemestre] = useState<string>('todos');
  const [selectedDocente, setSelectedDocente] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<'comprobante' | 'fecha' | 'docente' | 'semestre' | 'pendientes'>('comprobante');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Available semesters list
  const semestresList = useMemo(() => {
    const set = new Set(entregas.map((e) => e.semestre));
    return Array.from(set).sort().reverse();
  }, [entregas]);

  // Filtered & sorted data
  const filteredData = useMemo(() => {
    return entregas
      .filter((item) => {
        const matchesSearch =
          item.numeroComprobante.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.nombreDocente.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.nombreRecepcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.telefonoDocente && item.telefonoDocente.includes(searchTerm)) ||
          (item.observaciones && item.observaciones.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesSemestre = selectedSemestre === 'todos' || item.semestre === selectedSemestre;
        const matchesDocente = selectedDocente === 'todos' || item.nombreDocente === selectedDocente;

        return matchesSearch && matchesSemestre && matchesDocente;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'comprobante') {
          comparison = a.numeroComprobante.localeCompare(b.numeroComprobante);
        } else if (sortBy === 'fecha') {
          comparison = a.fecha.localeCompare(b.fecha);
        } else if (sortBy === 'docente') {
          comparison = a.nombreDocente.localeCompare(b.nombreDocente);
        } else if (sortBy === 'semestre') {
          comparison = a.semestre.localeCompare(b.semestre);
        } else if (sortBy === 'pendientes') {
          comparison = a.materiasPendientes - b.materiasPendientes;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [entregas, searchTerm, selectedSemestre, selectedDocente, sortBy, sortOrder]);

  const toggleSort = (field: 'comprobante' | 'fecha' | 'docente' | 'semestre' | 'pendientes') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Controls Bar: Search, Filters, Export */}
      <div className="p-4 border-b border-slate-200 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4 bg-slate-50/50">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por Nº comprobante, docente, celular..."
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Right: Filters, Catalog Manager & Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Semestre filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSemestre}
              onChange={(e) => setSelectedSemestre(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="todos">Todos los semestres</option>
              {semestresList.map((s) => (
                <option key={s} value={s}>
                  Semestre {s}
                </option>
              ))}
            </select>
          </div>

          {/* Docente filter */}
          <select
            value={selectedDocente}
            onChange={(e) => setSelectedDocente(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[160px] truncate"
          >
            <option value="todos">Todos los docentes</option>
            {docentes.map((d) => (
              <option key={d.id} value={d.nombre}>
                {d.nombre}
              </option>
            ))}
          </select>

          {/* Catalog button */}
          <button
            type="button"
            onClick={onOpenCatalogo}
            title="Administrar catálogo de Docentes y Recepción"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Docentes ({docentes.length})</span>
          </button>

          {/* Export buttons */}
          <button
            type="button"
            onClick={() => downloadCSVFile(filteredData)}
            title="Exportar a archivo CSV (Excel)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel</span>
          </button>

          <button
            type="button"
            onClick={() => downloadSQLFile(filteredData, docentes, receptores)}
            title="Exportar base de datos a archivo .SQL"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-600" />
            <span>Dump SQL</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              {/* Nº Comprobante */}
              <th className="py-3 px-4">
                <button
                  onClick={() => toggleSort('comprobante')}
                  className="flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                >
                  <span className="text-red-600 font-bold">Nº Comprobante</span>
                  <ArrowUpDown className="w-3 h-3 text-red-400" />
                </button>
              </th>
              <th className="py-3 px-3">
                <button
                  onClick={() => toggleSort('semestre')}
                  className="flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                >
                  <span>Semestre</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4">
                <button
                  onClick={() => toggleSort('docente')}
                  className="flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                >
                  <span>Docente</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-3 text-right">No. Dicta</th>
              <th className="py-3 px-4 text-center">Materias que Entrega (Educad / Pres. / Otros)</th>
              <th className="py-3 px-3 text-right">
                <button
                  onClick={() => toggleSort('pendientes')}
                  className="flex items-center justify-end gap-1 hover:text-slate-900 ml-auto cursor-pointer"
                >
                  <span>Pendientes</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4">Nombre (Recepción)</th>
              <th className="py-3 px-4">
                <button
                  onClick={() => toggleSort('fecha')}
                  className="flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                >
                  <span>Fecha</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {filteredData.length > 0 ? (
              filteredData.map((item) => {
                const totalEntregadas = item.materiasEducad + item.materiasPresencial + item.materiasOtros;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Nº Comprobante Correlativo */}
                    <td className="py-3.5 px-4 font-mono font-bold text-red-600 whitespace-nowrap">
                      Nº {item.numeroComprobante}
                    </td>

                    {/* Semestre */}
                    <td className="py-3.5 px-3 font-mono font-medium text-slate-700 whitespace-nowrap">
                      {item.semestre}
                    </td>

                    {/* Nombre del Docente */}
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <div>{item.nombreDocente}</div>
                      {item.observaciones && (
                        <div className="text-[11px] text-slate-500 mt-0.5 max-w-xs truncate" title={item.observaciones}>
                          {item.observaciones}
                        </div>
                      )}
                    </td>

                    {/* No. Materias que dicta */}
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-800 font-semibold">
                      {item.materiasDicta}
                    </td>

                    {/* Materias que Entrega: Educad, Presencial, Otros; */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-mono tabular-nums bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                        <span title="Modalidad Educad (Virtual)" className="text-blue-700 font-medium">
                          Ed: {item.materiasEducad}
                        </span>
                        <span className="text-slate-300">/</span>
                        <span title="Modalidad Presencial" className="text-slate-800 font-medium">
                          Pr: {item.materiasPresencial}
                        </span>
                        <span className="text-slate-300">/</span>
                        <span title="Otras modalidades" className="text-slate-600 font-medium">
                          Ot: {item.materiasOtros}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-emerald-700 font-semibold" title="Total materias entregadas">
                          ={totalEntregadas}
                        </span>
                      </div>
                    </td>

                    {/* No Materias pendientes para entregar */}
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                      <span
                        className={`font-semibold ${
                          item.materiasPendientes > 0 ? 'text-amber-600' : 'text-slate-400'
                        }`}
                      >
                        {item.materiasPendientes}
                      </span>
                    </td>

                    {/* Nombre (Recepción) */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium max-w-xs truncate" title={item.nombreRecepcion}>
                      {item.nombreRecepcion}
                    </td>

                    {/* Fecha */}
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-500 whitespace-nowrap">
                      {item.fecha}
                    </td>

                    {/* Acciones: Ver Comprobante, Editar, Eliminar */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Botón Ver Comprobante (con opciones Copiar PNG y Descarga) */}
                        <button
                          type="button"
                          onClick={() => onViewDoc(item)}
                          title="Ver Comprobante Oficial (Copiar PNG, Descargar o Imprimir)"
                          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors cursor-pointer shadow-2xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>Ver Comprobante</span>
                        </button>

                        {/* Botón Editar */}
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          title="Editar comprobante"
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* Botón Eliminar */}
                        <button
                          type="button"
                          onClick={() => onDelete(item)}
                          title="Eliminar comprobante"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="py-12 px-4 text-center">
                  <div className="max-w-sm mx-auto flex flex-col items-center">
                    <AlertCircle className="w-10 h-10 text-slate-300 mb-3" />
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">
                      No se encontraron comprobantes
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      {searchTerm || selectedSemestre !== 'todos' || selectedDocente !== 'todos'
                        ? 'No hay registros que coincidan con los filtros seleccionados.'
                        : 'Aún no se han registrado comprobantes de recepción de notas.'}
                    </p>
                    <button
                      type="button"
                      onClick={onOpenNew}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Emitir Primer Comprobante</span>
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Summary Count */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
        <div>
          Mostrando <strong className="text-slate-700 font-mono tabular-nums">{filteredData.length}</strong> de{' '}
          <strong className="text-slate-700 font-mono tabular-nums">{entregas.length}</strong> comprobantes
        </div>
        <div className="flex items-center gap-3">
          <span>Totales:</span>
          <span className="font-mono tabular-nums">
            Dictan: {filteredData.reduce((a, c) => a + c.materiasDicta, 0)}
          </span>
          <span>·</span>
          <span className="font-mono tabular-nums text-emerald-700">
            Entregadas: {filteredData.reduce((a, c) => a + (c.materiasEducad + c.materiasPresencial + c.materiasOtros), 0)}
          </span>
          <span>·</span>
          <span className="font-mono tabular-nums text-amber-600">
            Pendientes: {filteredData.reduce((a, c) => a + c.materiasPendientes, 0)}
          </span>
        </div>
      </div>
    </div>
  );
};
