import React from 'react';
import { EntregaDocente } from '../types/index.ts';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  item: EntregaDocente | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  item,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-lg shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-slate-900">
                ¿Eliminar registro de entrega?
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Esta acción eliminará el registro de entrega del docente:
              </p>

              <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                <div>
                  <span className="text-slate-500 font-medium">Docente:</span>{' '}
                  <strong className="text-slate-800">{item.nombreDocente}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Semestre:</span>{' '}
                  <span className="font-mono">{item.semestre}</span> · Fecha: {item.fecha}
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Materias:</span>{' '}
                  {item.materiasDicta} dictadas, {item.materiasPendientes} pendientes
                </div>
              </div>

              <p className="text-[11px] text-red-600 mt-2">
                Esta operación no se puede deshacer en la base de datos local.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Sí, Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
