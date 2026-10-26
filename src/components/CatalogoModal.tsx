import React, { useState } from 'react';
import { Docente, Receptor } from '../types/index.ts';
import { X, Plus, UserPlus, Users, Trash2, Check, Search, ShieldCheck } from 'lucide-react';

interface CatalogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  docentes: Docente[];
  receptores: Receptor[];
  onAddDocente: (docente: Omit<Docente, 'id' | 'createdAt'>) => void;
  onDeleteDocente: (id: string) => void;
  onAddReceptor: (receptor: Omit<Receptor, 'id' | 'createdAt'>) => void;
  onDeleteReceptor: (id: string) => void;
}

export const CatalogoModal: React.FC<CatalogoModalProps> = ({
  isOpen,
  onClose,
  docentes,
  receptores,
  onAddDocente,
  onDeleteDocente,
  onAddReceptor,
  onDeleteReceptor,
}) => {
  const [activeTab, setActiveTab] = useState<'docentes' | 'receptores'>('docentes');
  const [search, setSearch] = useState('');

  // New Docente Form state
  const [docNombre, setDocNombre] = useState('');
  const [docTitulo, setDocTitulo] = useState('');
  const [docDepto, setDocDepto] = useState('');
  const [docError, setDocError] = useState('');

  // New Receptor Form state
  const [recNombre, setRecNombre] = useState('');
  const [recCargo, setRecCargo] = useState('Admisiones y Registros');
  const [recError, setRecError] = useState('');

  if (!isOpen) return null;

  const handleCreateDocente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNombre.trim()) {
      setDocError('El nombre del docente es obligatorio');
      return;
    }
    if (docentes.some((d) => d.nombre.toLowerCase() === docNombre.trim().toLowerCase())) {
      setDocError('Este docente ya se encuentra registrado en la lista');
      return;
    }
    onAddDocente({
      nombre: docNombre.trim(),
      titulo: docTitulo.trim() || undefined,
      departamento: docDepto.trim() || undefined,
      activo: true,
    });
    setDocNombre('');
    setDocTitulo('');
    setDocDepto('');
    setDocError('');
  };

  const handleCreateReceptor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recNombre.trim()) {
      setRecError('El nombre de recepción es obligatorio');
      return;
    }
    if (receptores.some((r) => r.nombre.toLowerCase() === recNombre.trim().toLowerCase())) {
      setRecError('Este funcionario ya se encuentra registrado en la lista');
      return;
    }
    onAddReceptor({
      nombre: recNombre.trim(),
      cargo: recCargo.trim() || 'Admisiones y Registros',
      activo: true,
    });
    setRecNombre('');
    setRecCargo('Admisiones y Registros');
    setRecError('');
  };

  const filteredDocentes = docentes.filter(
    (d) =>
      d.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (d.departamento && d.departamento.toLowerCase().includes(search.toLowerCase())) ||
      (d.titulo && d.titulo.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredReceptores = receptores.filter(
    (r) =>
      r.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (r.cargo && r.cargo.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Catálogo Oficial: Docentes y Personal de Recepción
              </h2>
              <p className="text-xs text-slate-500">
                Listas almacenadas en MySQL para autocompletar comprobantes de notas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center justify-between px-6 pt-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('docentes');
                setSearch('');
              }}
              className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'docentes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Docentes ({docentes.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('receptores');
                setSearch('');
              }}
              className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'receptores'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Personal de Recepción ({receptores.length})
            </button>
          </div>

          <div className="relative mb-2 w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en la lista..."
              className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
            />
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[65vh] overflow-y-auto">
          {/* Form to insert new person */}
          <div className="md:col-span-1 bg-slate-50 p-4 rounded-xl border border-slate-200 h-fit">
            {activeTab === 'docentes' ? (
              <form onSubmit={handleCreateDocente} className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  <span>Insertar Docente</span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nombre Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={docNombre}
                    onChange={(e) => setDocNombre(e.target.value)}
                    placeholder="Ej. Ing. Carlos Mendoza"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {docError && <p className="text-[10px] text-red-600 mt-1">{docError}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Título / Grado Académico
                  </label>
                  <input
                    type="text"
                    value={docTitulo}
                    onChange={(e) => setDocTitulo(e.target.value)}
                    placeholder="Ej. Magíster en Finanzas"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Departamento / Carrera
                  </label>
                  <input
                    type="text"
                    value={docDepto}
                    onChange={(e) => setDocDepto(e.target.value)}
                    placeholder="Ej. Tecnología"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full mt-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Guardar Docente</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleCreateReceptor} className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  <span>Insertar Receptor</span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nombre (Recepción) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={recNombre}
                    onChange={(e) => setRecNombre(e.target.value)}
                    placeholder="Ej. Lic. Claudia Suárez"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {recError && <p className="text-[10px] text-red-600 mt-1">{recError}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Cargo o Unidad
                  </label>
                  <input
                    type="text"
                    value={recCargo}
                    onChange={(e) => setRecCargo(e.target.value)}
                    placeholder="Ej. Admisiones y Registros"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full mt-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Guardar Receptor</span>
                </button>
              </form>
            )}
          </div>

          {/* Roster List */}
          <div className="md:col-span-2 space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              {activeTab === 'docentes'
                ? `Listado de Docentes (${filteredDocentes.length})`
                : `Listado de Personal (${filteredReceptores.length})`}
            </span>

            {activeTab === 'docentes' ? (
              filteredDocentes.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {filteredDocentes.map((d) => (
                    <div
                      key={d.id}
                      className="p-3 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                    >
                      <div>
                        <strong className="block text-xs sm:text-sm font-semibold text-slate-900">
                          {d.nombre}
                        </strong>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          {d.titulo && <span>{d.titulo}</span>}
                          {d.titulo && d.departamento && <span>·</span>}
                          {d.departamento && <span>Dpto: {d.departamento}</span>}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteDocente(d.id)}
                        title="Eliminar de la lista"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-8 text-center bg-slate-50 rounded-lg">
                  No se encontraron docentes con ese criterio.
                </p>
              )
            ) : filteredReceptores.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {filteredReceptores.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                  >
                    <div>
                      <strong className="block text-xs sm:text-sm font-semibold text-slate-900">
                        {r.nombre}
                      </strong>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {r.cargo || 'Admisiones y Registros'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteReceptor(r.id)}
                      title="Eliminar de la lista"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-8 text-center bg-slate-50 rounded-lg">
                No se encontró personal de recepción con ese criterio.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Los nombres insertados estarán disponibles inmediatamente en todos los formularios y en el script MySQL.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
