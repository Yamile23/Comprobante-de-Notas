import React from 'react';
import { EntregaDocente } from '../types/index.ts';
import { BookOpen, CheckCircle2, Clock, Users, Laptop, Building2, Layers } from 'lucide-react';

interface StatsCardsProps {
  entregas: EntregaDocente[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ entregas }) => {
  const totalComprobantes = entregas.length;
  const docentesUnicos = new Set(entregas.map((e) => e.nombreDocente)).size;
  const totalDictadas = entregas.reduce((acc, curr) => acc + curr.materiasDicta, 0);
  const totalPendientes = entregas.reduce((acc, curr) => acc + curr.materiasPendientes, 0);
  const totalEducad = entregas.reduce((acc, curr) => acc + curr.materiasEducad, 0);
  const totalPresencial = entregas.reduce((acc, curr) => acc + curr.materiasPresencial, 0);
  const totalOtros = entregas.reduce((acc, curr) => acc + curr.materiasOtros, 0);
  const totalEntregadas = totalEducad + totalPresencial + totalOtros;

  const porcentajeCumplimiento = totalDictadas > 0
    ? Math.round((totalEntregadas / totalDictadas) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Tarjeta 1: Total Comprobantes y Docentes */}
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Comprobantes Emitidos
          </span>
          <Users className="w-4 h-4 text-slate-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {totalComprobantes}
          </span>
          <span className="text-xs text-slate-500">actas oficiales</span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs text-slate-500 gap-1.5">
          <span>{docentesUnicos} docentes atendidos</span>
        </div>
      </div>

      {/* Tarjeta 2: Materias Dictadas */}
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Materias que Dictan
          </span>
          <BookOpen className="w-4 h-4 text-blue-500" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {totalDictadas}
          </span>
          <span className="text-xs text-slate-500">asignaturas en total</span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs text-slate-500 gap-1.5">
          <span>Promedio: {totalComprobantes > 0 ? (totalDictadas / totalComprobantes).toFixed(1) : 0} por comprobante</span>
        </div>
      </div>

      {/* Tarjeta 3: Materias Entregadas con Desglose */}
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Materias Entregadas
          </span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-emerald-700 font-mono tabular-nums">
            {totalEntregadas}
          </span>
          <span className="text-xs text-slate-500">recibidas</span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-mono tabular-nums">
          <span className="flex items-center gap-1" title="Modalidad Educad">
            <Laptop className="w-3 h-3 text-slate-400" /> Educad: {totalEducad}
          </span>
          <span className="flex items-center gap-1" title="Modalidad Presencial">
            <Building2 className="w-3 h-3 text-slate-400" /> Presencial: {totalPresencial}
          </span>
          <span className="flex items-center gap-1" title="Otras modalidades">
            <Layers className="w-3 h-3 text-slate-400" /> Otros: {totalOtros}
          </span>
        </div>
      </div>

      {/* Tarjeta 4: Materias Pendientes y % Cumplimiento */}
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Materias Pendientes
          </span>
          <Clock className="w-4 h-4 text-amber-500" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-amber-700 font-mono tabular-nums">
            {totalPendientes}
          </span>
          <span className="text-xs text-slate-500">por consignar</span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Cumplimiento:</span>
          <span className="font-semibold text-slate-900 font-mono tabular-nums">
            {porcentajeCumplimiento}%
          </span>
        </div>
      </div>
    </div>
  );
};
