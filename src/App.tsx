/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { EntregaDocente, FormDataDocente, Docente, Receptor } from './types/index.ts';
import {
  loadEntregas,
  saveEntregas,
  loadDocentes,
  saveDocentes,
  loadReceptores,
  saveReceptores,
  resetAllData,
  getNextCorrelativeNumber
} from './utils/storage.ts';
import { Navbar } from './components/Navbar.tsx';
import { TaskTable } from './components/TaskTable.tsx';
import { TalonarioView } from './components/TalonarioView.tsx';
import { TaskFormModal } from './components/TaskFormModal.tsx';
import { DeleteConfirmModal } from './components/DeleteConfirmModal.tsx';
import { FichaDetalleModal } from './components/FichaDetalleModal.tsx';
import { CatalogoModal } from './components/CatalogoModal.tsx';
import { MySQLViewer } from './components/MySQLViewerModal.tsx';
import { MetricsDashboard } from './components/MetricsDashboard.tsx';
import { CheckCircle2, Plus, Users } from 'lucide-react';

export default function App() {
  const [entregas, setEntregas] = useState<EntregaDocente[]>(() => loadEntregas());
  const [docentes, setDocentes] = useState<Docente[]>(() => loadDocentes());
  const [receptores, setReceptores] = useState<Receptor[]>(() => loadReceptores());

  const [activeTab, setActiveTab] = useState<'tabla' | 'talonario' | 'metricas' | 'mysql'>('tabla');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCatalogoOpen, setIsCatalogoOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EntregaDocente | null>(null);
  const [deleteItem, setDeleteItem] = useState<EntregaDocente | null>(null);
  const [viewDocItem, setViewDocItem] = useState<EntregaDocente | null>(null);

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Sync state with localStorage
  useEffect(() => {
    saveEntregas(entregas);
  }, [entregas]);

  useEffect(() => {
    saveDocentes(docentes);
  }, [docentes]);

  useEffect(() => {
    saveReceptores(receptores);
  }, [receptores]);

  // Next suggested correlative number (e.g. "0005537")
  const nextCorrelative = useMemo(() => {
    return getNextCorrelativeNumber(entregas);
  }, [entregas]);

  // All currently existing correlative numbers
  const allExistingCorrelatives = useMemo(() => {
    return entregas.map((e) => e.numeroComprobante);
  }, [entregas]);

  // Extract unique semesters list
  const existingSemestres = useMemo(() => {
    const set = new Set(entregas.map((e) => e.semestre));
    if (!set.has('2025-1')) set.add('2025-1');
    if (!set.has('2024-2')) set.add('2024-2');
    return Array.from(set).sort().reverse();
  }, [entregas]);

  // Add or Edit entrega handler
  const handleSaveEntrega = (data: FormDataDocente, id?: string) => {
    const now = new Date().toISOString();

    if (id) {
      setEntregas((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                ...data,
                updatedAt: now,
              }
            : item
        )
      );
      showToast(`Comprobante Nº ${data.numeroComprobante} (${data.nombreDocente}) actualizado.`);
    } else {
      const newItem: EntregaDocente = {
        id: `doc-${Date.now()}`,
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      setEntregas((prev) => [newItem, ...prev]);
      showToast(`Comprobante Nº ${data.numeroComprobante} emitido con éxito para "${data.nombreDocente}".`);
    }
  };

  // Delete entrega handler
  const handleConfirmDelete = () => {
    if (!deleteItem) return;
    const num = deleteItem.numeroComprobante;
    const name = deleteItem.nombreDocente;
    setEntregas((prev) => prev.filter((item) => item.id !== deleteItem.id));
    setDeleteItem(null);
    showToast(`Comprobante Nº ${num} (${name}) eliminado.`, 'info');
  };

  // Update phone handler from WhatsApp modal
  // Quick add docente on the fly
  const handleQuickAddDocente = (nombre: string, telefono?: string) => {
    if (!docentes.some((d) => d.nombre.toLowerCase() === nombre.trim().toLowerCase())) {
      const newDoc: Docente = {
        id: `doc-u-${Date.now()}`,
        nombre: nombre.trim(),
        telefono: telefono ? telefono.trim() : undefined,
        activo: true,
        createdAt: new Date().toISOString(),
      };
      setDocentes((prev) => [...prev, newDoc]);
      showToast(`Docente "${nombre}" registrado en la lista oficial.`);
    }
  };

  // Quick add receptor on the fly
  const handleQuickAddReceptor = (nombre: string) => {
    if (!receptores.some((r) => r.nombre.toLowerCase() === nombre.trim().toLowerCase())) {
      const newRec: Receptor = {
        id: `rec-${Date.now()}`,
        nombre: nombre.trim(),
        cargo: 'Admisiones y Registros',
        activo: true,
        createdAt: new Date().toISOString(),
      };
      setReceptores((prev) => [...prev, newRec]);
      showToast(`Funcionario "${nombre}" registrado en la lista de recepción.`);
    }
  };

  // Full add docente from catalog modal
  const handleAddDocente = (data: Omit<Docente, 'id' | 'createdAt'>) => {
    const newDoc: Docente = {
      id: `doc-u-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
    };
    setDocentes((prev) => [...prev, newDoc]);
    showToast(`Docente "${data.nombre}" agregado con éxito.`);
  };

  const handleDeleteDocente = (id: string) => {
    setDocentes((prev) => prev.filter((d) => d.id !== id));
    showToast('Docente removido de la lista.', 'info');
  };

  // Full add receptor from catalog modal
  const handleAddReceptor = (data: Omit<Receptor, 'id' | 'createdAt'>) => {
    const newRec: Receptor = {
      id: `rec-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
    };
    setReceptores((prev) => [...prev, newRec]);
    showToast(`Receptor "${data.nombre}" agregado con éxito.`);
  };

  const handleDeleteReceptor = (id: string) => {
    setReceptores((prev) => prev.filter((r) => r.id !== id));
    showToast('Funcionario removido de la lista.', 'info');
  };

  // Reset to initial data
  const handleResetData = () => {
    const initial = resetAllData();
    setEntregas(initial.entregas);
    setDocentes(initial.docentes);
    setReceptores(initial.receptores);
    showToast('Datos y catálogos restablecidos a los valores originales.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar con Logo Universidad Nur a la izquierda */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTask={() => {
          setEditingItem(null);
          setIsFormOpen(true);
        }}
        onOpenCatalogo={() => setIsCatalogoOpen(true)}
        onResetData={handleResetData}
        totalCount={entregas.length}
        totalDocentes={docentes.length}
        lastCorrelative={nextCorrelative}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Institutional Banner with Logo on Left and Correlative Tag */}
        <div className="mb-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src="/assets/aistudio/Logo_nur_6994dcb1.png"
              alt="Universidad Nur Logo"
              className="h-14 w-auto object-contain shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/public/assets/aistudio/Logo_nur_6994dcb1.png';
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Universidad Nur · ISO 9001
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500 font-medium">
                  Dpto. Admisiones y Registros
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
                Comprobantes de Recepción de Notas
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Control correlativo oficial con opciones de copia PNG, descarga e impresión de comprobantes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setIsCatalogoOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4 text-blue-600" />
              <span>Ver Docentes ({docentes.length})</span>
            </button>

            <div className="text-right bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
              <span className="block text-[10px] text-red-600 uppercase font-semibold tracking-wider">
                Próximo Correlativo
              </span>
              <span className="text-base font-bold font-mono text-red-700 tracking-wider">
                Nº {nextCorrelative}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Emitir Comprobante</span>
            </button>
          </div>
        </div>

        {/* View Switcher Content */}
        {activeTab === 'tabla' && (
          <TaskTable
            entregas={entregas}
            docentes={docentes}
            receptores={receptores}
            onEdit={(item) => {
              setEditingItem(item);
              setIsFormOpen(true);
            }}
            onDelete={(item) => setDeleteItem(item)}
            onViewDoc={(item) => setViewDocItem(item)}
            onOpenNew={() => {
              setEditingItem(null);
              setIsFormOpen(true);
            }}
            onOpenCatalogo={() => setIsCatalogoOpen(true)}
          />
        )}

        {activeTab === 'talonario' && (
          <TalonarioView
            entregas={entregas}
            onEdit={(item) => {
              setEditingItem(item);
              setIsFormOpen(true);
            }}
            onOpenNew={() => {
              setEditingItem(null);
              setIsFormOpen(true);
            }}
          />
        )}

        {activeTab === 'metricas' && <MetricsDashboard entregas={entregas} />}

        {activeTab === 'mysql' && (
          <MySQLViewer
            entregas={entregas}
            docentes={docentes}
            receptores={receptores}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/Logo_nur_6994dcb1.png"
              alt="Nur"
              className="h-6 w-auto opacity-80"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/public/assets/aistudio/Logo_nur_6994dcb1.png';
              }}
            />
            <span className="font-semibold text-slate-700">Universidad Nur</span>
            <span>·</span>
            <span>Sistema Oficial de Recepción de Notas</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Santa Cruz de la Sierra</span>
            <span>·</span>
            <span>Numeración Correlativa Segura</span>
            <span>·</span>
            <span>MySQL 8.0</span>
          </div>
        </div>
      </footer>

      {/* Interactive Form Modal (Add / Edit) */}
      <TaskFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveEntrega}
        initialData={editingItem}
        existingSemestres={existingSemestres}
        suggestedCorrelative={nextCorrelative}
        allExistingCorrelatives={allExistingCorrelatives}
        docentesList={docentes}
        receptoresList={receptores}
        onQuickAddDocente={handleQuickAddDocente}
        onQuickAddReceptor={handleQuickAddReceptor}
      />

      {/* Catalogo Modal (Docentes y Recepción) */}
      <CatalogoModal
        isOpen={isCatalogoOpen}
        onClose={() => setIsCatalogoOpen(false)}
        docentes={docentes}
        receptores={receptores}
        onAddDocente={handleAddDocente}
        onDeleteDocente={handleDeleteDocente}
        onAddReceptor={handleAddReceptor}
        onDeleteReceptor={handleDeleteReceptor}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteItem)}
        item={deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Printable Receipt / Certificate Modal with Copy PNG and Download PNG */}
      <FichaDetalleModal
        isOpen={Boolean(viewDocItem)}
        item={viewDocItem}
        onClose={() => setViewDocItem(null)}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-lg text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
