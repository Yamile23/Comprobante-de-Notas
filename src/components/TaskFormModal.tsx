import React, { useState, useEffect } from 'react';
import { EntregaDocente, FormDataDocente, Docente, Receptor } from '../types/index.ts';
import { X, Check, AlertCircle, Calendar, Hash, UserPlus, Lock } from 'lucide-react';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormDataDocente, id?: string) => void;
  initialData?: EntregaDocente | null;
  existingSemestres: string[];
  suggestedCorrelative: string;
  allExistingCorrelatives: string[];
  docentesList: Docente[];
  receptoresList: Receptor[];
  onQuickAddDocente: (nombre: string, telefono?: string) => void;
  onQuickAddReceptor: (nombre: string) => void;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingSemestres,
  suggestedCorrelative,
  allExistingCorrelatives,
  docentesList,
  receptoresList,
  onQuickAddDocente,
  onQuickAddReceptor,
}) => {
  const isEditing = Boolean(initialData);
  const getTodayString = () => new Date().toISOString().slice(0, 10);

  const [numeroComprobante, setNumeroComprobante] = useState(suggestedCorrelative);
  const [semestre, setSemestre] = useState('2025-1');
  const [customSemestre, setCustomSemestre] = useState('');
  const [isCustomSemestre, setIsCustomSemestre] = useState(false);

  const [nombreDocente, setNombreDocente] = useState('');
  const [telefonoDocente, setTelefonoDocente] = useState('');
  const [isCustomDocente, setIsCustomDocente] = useState(false);
  const [customDocenteName, setCustomDocenteName] = useState('');

  const [materiasDicta, setMateriasDicta] = useState<number>(3);
  const [materiasPendientes, setMateriasPendientes] = useState<number>(0);
  const [materiasEducad, setMateriasEducad] = useState<number>(1);
  const [materiasPresencial, setMateriasPresencial] = useState<number>(2);
  const [materiasOtros, setMateriasOtros] = useState<number>(0);

  const [nombreRecepcion, setNombreRecepcion] = useState('');
  const [isCustomReceptor, setIsCustomReceptor] = useState(false);
  const [customReceptorName, setCustomReceptorName] = useState('');

  const [fecha, setFecha] = useState(getTodayString());
  const [ciudad, setCiudad] = useState('Santa Cruz de la Sierra');
  const [observaciones, setObservaciones] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setNumeroComprobante(initialData.numeroComprobante);
      if (existingSemestres.includes(initialData.semestre)) {
        setSemestre(initialData.semestre);
        setIsCustomSemestre(false);
        setCustomSemestre('');
      } else {
        setSemestre('otro');
        setIsCustomSemestre(true);
        setCustomSemestre(initialData.semestre);
      }
      setNombreDocente(initialData.nombreDocente);
      setTelefonoDocente(initialData.telefonoDocente || '');
      setIsCustomDocente(false);
      setCustomDocenteName('');

      setMateriasDicta(initialData.materiasDicta);
      setMateriasPendientes(initialData.materiasPendientes);
      setMateriasEducad(initialData.materiasEducad);
      setMateriasPresencial(initialData.materiasPresencial);
      setMateriasOtros(initialData.materiasOtros);

      setNombreRecepcion(initialData.nombreRecepcion);
      setIsCustomReceptor(false);
      setCustomReceptorName('');

      setFecha(initialData.fecha);
      setCiudad(initialData.ciudad || 'Santa Cruz de la Sierra');
      setObservaciones(initialData.observaciones || '');
      setErrors({});
    } else {
      setNumeroComprobante(suggestedCorrelative);
      setSemestre(existingSemestres[0] || '2025-1');
      setIsCustomSemestre(false);
      setCustomSemestre('');

      const defaultDoc = docentesList[0]?.nombre || '';
      setNombreDocente(defaultDoc);
      setTelefonoDocente(docentesList[0]?.telefono || '+591 ');
      setIsCustomDocente(false);
      setCustomDocenteName('');

      setMateriasDicta(3);
      setMateriasPendientes(0);
      setMateriasEducad(1);
      setMateriasPresencial(2);
      setMateriasOtros(0);

      const defaultRec = receptoresList[0]?.nombre || 'Lic. Carlos Morales';
      setNombreRecepcion(defaultRec);
      setIsCustomReceptor(false);
      setCustomReceptorName('');

      setFecha(getTodayString());
      setCiudad('Santa Cruz de la Sierra');
      setObservaciones('');
      setErrors({});
    }
  }, [initialData, isOpen, existingSemestres, suggestedCorrelative, docentesList, receptoresList]);

  // When teacher select changes, update phone automatically
  const handleDocenteChange = (name: string) => {
    setNombreDocente(name);
    const doc = docentesList.find((d) => d.nombre === name);
    if (doc?.telefono) {
      setTelefonoDocente(doc.telefono);
    }
  };

  if (!isOpen) return null;

  const totalEntregadasCalculado = (materiasEducad || 0) + (materiasPresencial || 0) + (materiasOtros || 0);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const cleanNum = numeroComprobante.trim();
    if (!cleanNum) {
      newErrors.numeroComprobante = 'El número de comprobante es obligatorio';
    }

    const finalSemestre = isCustomSemestre ? customSemestre.trim() : semestre;
    if (!finalSemestre) {
      newErrors.semestre = 'El semestre es obligatorio';
    }

    const finalDocente = isCustomDocente ? customDocenteName.trim() : nombreDocente.trim();
    if (!finalDocente) {
      newErrors.nombreDocente = 'Debe seleccionar o ingresar el nombre del docente';
    }

    const finalReceptor = isCustomReceptor ? customReceptorName.trim() : nombreRecepcion.trim();
    if (!finalReceptor) {
      newErrors.nombreRecepcion = 'Debe seleccionar o ingresar el nombre de recepción';
    }

    if (materiasDicta < 0) {
      newErrors.materiasDicta = 'Debe ser un número mayor o igual a 0';
    }
    if (materiasPendientes < 0) newErrors.materiasPendientes = 'No puede ser negativo';
    if (materiasEducad < 0) newErrors.materiasEducad = 'No puede ser negativo';
    if (materiasPresencial < 0) newErrors.materiasPresencial = 'No puede ser negativo';
    if (materiasOtros < 0) newErrors.materiasOtros = 'No puede ser negativo';

    if (!fecha) {
      newErrors.fecha = 'La fecha de recepción es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalSemestre = isCustomSemestre ? customSemestre.trim() : semestre;
    const finalDocente = isCustomDocente ? customDocenteName.trim() : nombreDocente.trim();
    const finalReceptor = isCustomReceptor ? customReceptorName.trim() : nombreRecepcion.trim();

    if (isCustomDocente && finalDocente) {
      onQuickAddDocente(finalDocente, telefonoDocente.trim() || undefined);
    }
    if (isCustomReceptor && finalReceptor) {
      onQuickAddReceptor(finalReceptor);
    }

    const payload: FormDataDocente = {
      numeroComprobante: numeroComprobante.trim(),
      semestre: finalSemestre,
      nombreDocente: finalDocente,
      telefonoDocente: telefonoDocente.trim() || undefined,
      materiasDicta: Number(materiasDicta),
      materiasPendientes: Number(materiasPendientes),
      materiasEducad: Number(materiasEducad),
      materiasPresencial: Number(materiasPresencial),
      materiasOtros: Number(materiasOtros),
      nombreRecepcion: finalReceptor,
      fecha,
      ciudad: ciudad.trim() || 'Santa Cruz de la Sierra',
      observaciones: observaciones.trim() || undefined,
    };

    onSave(payload, initialData?.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header con Logo Nur al lado izquierdo */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/Logo_nur_6994dcb1.png"
              alt="Universidad Nur"
              className="h-10 w-auto object-contain shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/public/assets/aistudio/Logo_nur_6994dcb1.png';
              }}
            />
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                {isEditing ? 'Editar Comprobante' : 'Nuevo Comprobante de Recepción de Notas'}
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">
                Universidad Nur · Dpto. Admisiones y Registros
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 rounded-md">
              <Lock className="w-3.5 h-3.5 text-red-600" />
              <span className="text-xs font-mono font-bold text-red-600">
                Nº {numeroComprobante || '_______'}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Fila: Control del Número Correlativo (Bloqueado) y Semestre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-red-600" />
                  Numeración Correlativa Única
                </span>
                <span className="text-[10px] text-slate-500 font-normal flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" /> Bloqueado
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-red-600 text-sm">
                  Nº
                </span>
                <input
                  type="text"
                  value={numeroComprobante}
                  readOnly
                  disabled
                  className="w-full pl-10 pr-10 py-2 text-sm bg-slate-100 border border-slate-300 rounded-lg font-mono font-bold text-red-700 tracking-wider cursor-not-allowed select-none"
                  title="Campo bloqueado: asignado automáticamente de forma correlativa y única"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                * Asignado automáticamente sin duplicados. No editable.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Semestre <span className="text-red-500">*</span>
              </label>
              {!isCustomSemestre ? (
                <select
                  value={semestre}
                  onChange={(e) => {
                    if (e.target.value === 'otro') {
                      setIsCustomSemestre(true);
                    } else {
                      setSemestre(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {existingSemestres.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                  {!existingSemestres.includes('2025-1') && <option value="2025-1">2025-1</option>}
                  {!existingSemestres.includes('2025-2') && <option value="2025-2">2025-2</option>}
                  <option value="otro">+ Escribir otro semestre...</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSemestre}
                    placeholder="Ej. 2026-1"
                    onChange={(e) => setCustomSemestre(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomSemestre(false);
                      setSemestre(existingSemestres[0] || '2025-1');
                    }}
                    className="px-2.5 py-2 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                  >
                    Lista
                  </button>
                </div>
              )}
              {errors.semestre && <p className="text-xs text-red-600 mt-1">{errors.semestre}</p>}
            </div>
          </div>

          {/* Campo: Nombre del docente */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Nombre del docente <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomDocente(!isCustomDocente);
                  if (!isCustomDocente) setCustomDocenteName('');
                }}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isCustomDocente ? 'Seleccionar lista' : '+ Insertar nuevo docente'}</span>
              </button>
            </div>

            {!isCustomDocente ? (
              <select
                value={nombreDocente}
                onChange={(e) => handleDocenteChange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="">-- Seleccione un docente registrado --</option>
                {docentesList.map((d) => (
                  <option key={d.id} value={d.nombre}>
                    {d.nombre} {d.departamento ? `(${d.departamento})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={customDocenteName}
                placeholder="Escriba el nombre completo del nuevo docente..."
                onChange={(e) => setCustomDocenteName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                autoFocus
              />
            )}
            {errors.nombreDocente && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.nombreDocente}
              </p>
            )}
          </div>

          {/* Fila: No. de Materias que dicta & No. Materias pendientes para entregar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50/70 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                No. de Materias que dicta <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={materiasDicta}
                onChange={(e) => setMateriasDicta(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono tabular-nums font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.materiasDicta && <p className="text-xs text-red-600 mt-1">{errors.materiasDicta}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                No. Materias pendientes para entregar <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={materiasPendientes}
                onChange={(e) => setMateriasPendientes(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono tabular-nums font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.materiasPendientes && (
                <p className="text-xs text-red-600 mt-1">{errors.materiasPendientes}</p>
              )}
            </div>
          </div>

          {/* Fila: Materias que entrega: Educad, Presencial, Otros; */}
          <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Materias que entrega: Educad, Presencial, Otros; <span className="text-red-500">*</span>
              </label>
              <span className="text-xs font-mono font-bold text-blue-700">
                Total Entregadas: {totalEntregadasCalculado}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Educad (Virtual)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={materiasEducad}
                  onChange={(e) => setMateriasEducad(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono tabular-nums font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Presencial
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={materiasPresencial}
                  onChange={(e) => setMateriasPresencial(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono tabular-nums font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Otros
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={materiasOtros}
                  onChange={(e) => setMateriasOtros(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono tabular-nums font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Fila: Nombre (Recepción) con selector e inserción + Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Nombre (Recepción) <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomReceptor(!isCustomReceptor);
                    if (!isCustomReceptor) setCustomReceptorName('');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isCustomReceptor ? 'Seleccionar lista' : '+ Insertar nuevo'}</span>
                </button>
              </div>

              {!isCustomReceptor ? (
                <select
                  value={nombreRecepcion}
                  onChange={(e) => setNombreRecepcion(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="">-- Seleccione funcionario de recepción --</option>
                  {receptoresList.map((r) => (
                    <option key={r.id} value={r.nombre}>
                      {r.nombre} ({r.cargo || 'Recepción'})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={customReceptorName}
                  placeholder="Escriba el nombre del nuevo funcionario..."
                  onChange={(e) => setCustomReceptorName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  autoFocus
                />
              )}
              {errors.nombreRecepcion && (
                <p className="text-xs text-red-600 mt-1">{errors.nombreRecepcion}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Fecha <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setFecha(getTodayString())}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <Calendar className="w-3 h-3" /> Hoy
                </button>
              </div>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              {errors.fecha && <p className="text-xs text-red-600 mt-1">{errors.fecha}</p>}
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Observaciones (Opcional)
            </label>
            <textarea
              rows={2}
              value={observaciones}
              placeholder="Notas sobre planillas de evaluación, actas firmadas o justificaciones..."
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Guardar Cambios' : 'Emitir Comprobante'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
