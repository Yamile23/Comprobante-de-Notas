import React from 'react';
import { EntregaDocente } from '../types/index.ts';
import { StatsCards } from './StatsCards.tsx';
import { Laptop, Building2, Layers, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface MetricsDashboardProps {
  entregas: EntregaDocente[];
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ entregas }) => {
  // Group metrics by semester
  const semestres = Array.from(new Set(entregas.map((e) => e.semestre))).sort().reverse();

  const metricsBySemestre = semestres.map((sem) => {
    const semItems = entregas.filter((e) => e.semestre === sem);
    const totalDocentes = semItems.length;
    const materiasDictan = semItems.reduce((acc, curr) => acc + curr.materiasDicta, 0);
    const materiasPendientes = semItems.reduce((acc, curr) => acc + curr.materiasPendientes, 0);
    const educad = semItems.reduce((acc, curr) => acc + curr.materiasEducad, 0);
    const presencial = semItems.reduce((acc, curr) => acc + curr.materiasPresencial, 0);
    const otros = semItems.reduce((acc, curr) => acc + curr.materiasOtros, 0);
    const totalEntregadas = educad + presencial + otros;
    const porcentaje = materiasDictan > 0 ? Math.round((totalEntregadas / materiasDictan) * 100) : 0;

    return {
      semestre: sem,
      totalDocentes,
      materiasDictan,
      materiasPendientes,
      educad,
      presencial,
      otros,
      totalEntregadas,
      porcentaje,
    };
  });

  const totalEducad = entregas.reduce((a, c) => a + c.materiasEducad, 0);
  const totalPresencial = entregas.reduce((a, c) => a + c.materiasPresencial, 0);
  const totalOtros = entregas.reduce((a, c) => a + c.materiasOtros, 0);
  const totalEntregadasGeneral = totalEducad + totalPresencial + totalOtros;

  const pctEducad = totalEntregadasGeneral > 0 ? Math.round((totalEducad / totalEntregadasGeneral) * 100) : 0;
  const pctPresencial = totalEntregadasGeneral > 0 ? Math.round((totalPresencial / totalEntregadasGeneral) * 100) : 0;
  const pctOtros = totalEntregadasGeneral > 0 ? Math.round((totalOtros / totalEntregadasGeneral) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Resumen Global de Métricas */}
      <StatsCards entregas={entregas} />

      {/* Modality Breakdown Bar */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Distribución Global de Entregas por Modalidad
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Total de materias recibidas distribuidas entre Educad (Virtual), Presencial y Otros formatos
        </p>

        {/* Stacked bar */}
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${pctEducad}%` }}
            className="bg-blue-600 h-full transition-all duration-300"
            title={`Educad: ${totalEducad} (${pctEducad}%)`}
          />
          <div
            style={{ width: `${pctPresencial}%` }}
            className="bg-slate-700 h-full transition-all duration-300"
            title={`Presencial: ${totalPresencial} (${pctPresencial}%)`}
          />
          <div
            style={{ width: `${pctOtros}%` }}
            className="bg-purple-500 h-full transition-all duration-300"
            title={`Otros: ${totalOtros} (${pctOtros}%)`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Educad (Virtual)</span>
                <strong className="font-mono tabular-nums text-slate-900">{totalEducad} ({pctEducad}%)</strong>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-700 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Presencial</span>
                <strong className="font-mono tabular-nums text-slate-900">{totalPresencial} ({pctPresencial}%)</strong>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Otros</span>
                <strong className="font-mono tabular-nums text-slate-900">{totalOtros} ({pctOtros}%)</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown by Semester Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Rendimiento y Cumplimiento por Semestre
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Resumen consolidado generado a partir de la vista relacional <code className="text-xs bg-slate-100 px-1 py-0.5 rounded text-slate-700">vista_resumen_semestral</code>
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase">
                <th className="py-2.5 px-3">Semestre</th>
                <th className="py-2.5 px-3 text-right">Docentes</th>
                <th className="py-2.5 px-3 text-right">Materias Dictadas</th>
                <th className="py-2.5 px-3 text-right">Educad</th>
                <th className="py-2.5 px-3 text-right">Presencial</th>
                <th className="py-2.5 px-3 text-right">Otros</th>
                <th className="py-2.5 px-3 text-right">Total Entregadas</th>
                <th className="py-2.5 px-3 text-right">Pendientes</th>
                <th className="py-2.5 px-3 text-right">% Cumplimiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {metricsBySemestre.map((m) => (
                <tr key={m.semestre} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-slate-900">{m.semestre}</td>
                  <td className="py-3 px-3 text-right text-slate-700">{m.totalDocentes}</td>
                  <td className="py-3 px-3 text-right text-slate-900 font-semibold">{m.materiasDictan}</td>
                  <td className="py-3 px-3 text-right text-blue-700">{m.educad}</td>
                  <td className="py-3 px-3 text-right text-slate-700">{m.presencial}</td>
                  <td className="py-3 px-3 text-right text-purple-700">{m.otros}</td>
                  <td className="py-3 px-3 text-right text-emerald-700 font-bold">{m.totalEntregadas}</td>
                  <td className="py-3 px-3 text-right text-amber-600 font-semibold">{m.materiasPendientes}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs ${
                        m.porcentaje >= 80
                          ? 'bg-emerald-50 text-emerald-700'
                          : m.porcentaje >= 50
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {m.porcentaje}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
