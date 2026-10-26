import React from 'react';
import { Database, Plus, TableProperties, BarChart3, RotateCcw, FileText, Users } from 'lucide-react';

interface NavbarProps {
  activeTab: 'tabla' | 'talonario' | 'metricas' | 'mysql';
  setActiveTab: (tab: 'tabla' | 'talonario' | 'metricas' | 'mysql') => void;
  onOpenNewTask: () => void;
  onOpenCatalogo: () => void;
  onResetData: () => void;
  totalCount: number;
  totalDocentes: number;
  lastCorrelative: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTask,
  onOpenCatalogo,
  onResetData,
  totalCount,
  totalDocentes,
  lastCorrelative,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-18">
          {/* Zone 1: Logo Universidad Nur a lado izquierdo */}
          <div className="flex items-center gap-3 shrink-0">
            <img
              src="/assets/aistudio/Logo_nur_6994dcb1.png"
              alt="Universidad Nur"
              className="h-11 w-auto object-contain shrink-0 drop-shadow-xs"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/public/assets/aistudio/Logo_nur_6994dcb1.png';
              }}
            />
            <div className="hidden sm:block border-l border-slate-200 pl-3">
              <span className="block font-bold text-xs sm:text-sm tracking-tight text-slate-900 leading-tight">
                UNIVERSIDAD NUR
              </span>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Dpto. Admisiones y Registros
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links / Segmented Tabs */}
          <nav className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('tabla')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'tabla'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TableProperties className="w-4 h-4 shrink-0" />
              <span>Planilla ({totalCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('talonario')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'talonario'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0 text-red-500" />
              <span>Talonario Oficial</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('metricas')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'metricas'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>Resumen</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('mysql')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'mysql'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Database className="w-4 h-4 shrink-0 text-amber-500" />
              <span>MySQL</span>
            </button>
          </nav>

          {/* Zone 3: Actions + Catálogo button + correlativo */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenCatalogo}
              title="Administrar catálogo de Docentes y Recepción"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Docentes ({totalDocentes})</span>
            </button>

            <div className="hidden xl:flex items-center gap-1 text-[11px] font-mono bg-red-50 text-red-700 px-2.5 py-1 rounded-md border border-red-200">
              <span className="font-sans text-red-600 font-semibold">Sig:</span>
              <strong className="tracking-wider">Nº {lastCorrelative}</strong>
            </div>

            <button
              type="button"
              title="Restablecer datos originales"
              onClick={onResetData}
              className="hidden 2xl:flex items-center gap-1 px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onOpenNewTask}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuevo Comprobante</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
