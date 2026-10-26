import React, { useState } from 'react';
import { EntregaDocente } from '../types/index.ts';
import { ChevronLeft, ChevronRight, Printer, Pencil, Plus, Copy, Download, Check } from 'lucide-react';
import { generateVoucherPng } from '../utils/voucherImageGenerator.ts';

interface TalonarioViewProps {
  entregas: EntregaDocente[];
  onEdit: (item: EntregaDocente) => void;
  onOpenNew: () => void;
}

export const TalonarioView: React.FC<TalonarioViewProps> = ({
  entregas,
  onEdit,
  onOpenNew,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (entregas.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-slate-500 text-sm mb-4">No hay comprobantes en el talonario actualmente.</p>
        <button
          onClick={onOpenNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          + Emitir Primer Comprobante
        </button>
      </div>
    );
  }

  const safeIndex = Math.min(Math.max(0, currentIndex), entregas.length - 1);
  const item = entregas[safeIndex];

  const handlePrev = () => {
    if (safeIndex > 0) setCurrentIndex(safeIndex - 1);
  };

  const handleNext = () => {
    if (safeIndex < entregas.length - 1) setCurrentIndex(safeIndex + 1);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyPng = async () => {
    try {
      const { blob } = await generateVoucherPng(item);
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new window.ClipboardItem({
            'image/png': blob,
          }),
        ]);
        setCopied(true);
        setToastMessage('¡Comprobante PNG copiado al portapapeles!');
        setTimeout(() => {
          setCopied(false);
          setToastMessage(null);
        }, 2500);
      } else {
        handleDownloadPng();
      }
    } catch (err) {
      console.error('Error al copiar imagen PNG:', err);
      handleDownloadPng();
    }
  };

  const handleDownloadPng = async () => {
    try {
      setDownloading(true);
      const { dataUrl } = await generateVoucherPng(item);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Comprobante_NUR_${item.numeroComprobante}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setToastMessage('Comprobante descargado en formato PNG.');
      setTimeout(() => setToastMessage(null), 2500);
    } catch (err) {
      console.error('Error al descargar PNG:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Format date to DD / MM / YYYY
  const formatDateParts = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-');
      return { day: day || '__', month: month || '__', year: year || '____' };
    } catch {
      return { day: '__', month: '__', year: '____' };
    }
  };

  const { day, month, year } = formatDateParts(item.fecha);

  return (
    <div className="space-y-4">
      {/* Talonario Navigator Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              disabled={safeIndex === 0}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Comprobante anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={safeIndex === entregas.length - 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Comprobante siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="text-xs font-medium text-slate-600">
            Comprobante <strong className="text-slate-900 font-mono tabular-nums">{safeIndex + 1}</strong> de{' '}
            <strong className="text-slate-900 font-mono tabular-nums">{entregas.length}</strong>
          </div>
        </div>

        {/* Jump selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Ir a Nº:</span>
          <select
            value={safeIndex}
            onChange={(e) => setCurrentIndex(parseInt(e.target.value, 10))}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-red-600 focus:outline-none"
          >
            {entregas.map((e, idx) => (
              <option key={e.id} value={idx}>
                Nº {e.numeroComprobante} - {e.nombreDocente}
              </option>
            ))}
          </select>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Botón Copiar PNG */}
          <button
            type="button"
            onClick={handleCopyPng}
            title="Copiar comprobante PNG al portapapeles"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">¡PNG Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>Copiar PNG</span>
              </>
            )}
          </button>

          {/* Botón Descargar PNG */}
          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={downloading}
            title="Descargar imagen PNG"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>{downloading ? 'Generando...' : 'Descargar PNG'}</span>
          </button>

          <button
            onClick={() => onEdit(item)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Notificación flotante de confirmación */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-2 font-medium rounded-lg flex items-center justify-center gap-2 print:hidden animate-in fade-in duration-150 shadow-sm max-w-md mx-auto">
          <Check className="w-4 h-4 text-white shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* The Physical Receipt Container */}
      <div className="bg-white rounded-xl shadow-md border border-slate-300 p-8 sm:p-12 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
        {/* Cabecera Superior: Logo a la izquierda, Nº en el centro en rojo, Semestre a la derecha */}
        <div className="flex items-start justify-between gap-4 pb-4">
          {/* Lado Izquierdo: Logo Nur + Dpto */}
          <div className="flex flex-col items-start w-56 shrink-0">
            <img
              src="/assets/aistudio/Logo_nur_6994dcb1.png"
              alt="Universidad Nur"
              className="h-16 w-auto object-contain mb-1"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/public/assets/aistudio/Logo_nur_6994dcb1.png';
              }}
            />
            <span className="text-[12px] font-bold tracking-tight text-slate-900 leading-tight">
              UNIVERSIDAD NUR
            </span>
            <span className="text-[10px] font-semibold text-slate-600 tracking-wider">
              DPTO. ADMISIONES Y REGISTROS
            </span>
          </div>

          {/* Centro: Numeración correlativa en rojo estilo talonario */}
          <div className="flex-1 text-center pt-2">
            <div className="inline-block px-4 py-1.5 rounded-lg border border-red-200 bg-red-50/50">
              <span className="text-2xl sm:text-3xl font-bold tracking-widest text-red-600 font-mono">
                Nº {item.numeroComprobante}
              </span>
            </div>
            <span className="block text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
              Numeración Correlativa Oficial
            </span>
          </div>

          {/* Lado Derecho: Semestre con línea */}
          <div className="w-48 text-right pt-4 shrink-0">
            <div className="flex items-baseline justify-end gap-1.5 text-base">
              <span className="font-semibold text-slate-700">Semestre</span>
              <span className="border-b-2 border-slate-700 px-3 min-w-[100px] text-center font-mono font-bold text-slate-900">
                {item.semestre}
              </span>
            </div>
          </div>
        </div>

        {/* Título Principal */}
        <div className="text-center my-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 uppercase font-sans">
            COMPROBANTE DE RECEPCIÓN DE NOTAS
          </h1>
        </div>

        {/* Campos del Documento en Formato Impreso */}
        <div className="space-y-6 text-base leading-relaxed">
          {/* Línea: Nombre del docente */}
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-slate-700 whitespace-nowrap">
              Nombre del docente:
            </span>
            <div className="flex-1 border-b border-slate-600 px-2 font-medium text-slate-900">
              {item.nombreDocente}
            </div>
          </div>

          {/* Línea: No. de Materias que dicta & No. Materias pendientes para entregar */}
          <div className="flex flex-wrap sm:flex-nowrap items-baseline gap-8">
            <div className="flex items-baseline gap-2 flex-1">
              <span className="font-semibold text-slate-700 whitespace-nowrap">
                No. de Materias que dicta:
              </span>
              <div className="border-b border-slate-600 px-4 min-w-[80px] text-center font-mono font-bold text-slate-900">
                {item.materiasDicta}
              </div>
            </div>

            <div className="flex items-baseline gap-2 flex-1">
              <span className="font-semibold text-slate-700 whitespace-nowrap">
                No. Materias pendientes para entregar:
              </span>
              <div className="border-b border-slate-600 px-4 min-w-[80px] text-center font-mono font-bold text-slate-900">
                {item.materiasPendientes}
              </div>
            </div>
          </div>

          {/* Línea: Materias que entrega: Educad, Presencial, Otros */}
          <div className="flex flex-wrap items-baseline gap-6 pt-2">
            <span className="font-semibold text-slate-700 whitespace-nowrap">
              Materias que entrega:
            </span>

            <div className="flex items-baseline gap-2">
              <div className="border-b border-slate-600 px-4 min-w-[60px] text-center font-mono font-bold text-slate-900">
                {item.materiasEducad}
              </div>
              <span className="text-slate-800 font-medium">Educad</span>
            </div>

            <div className="flex items-baseline gap-2">
              <div className="border-b border-slate-600 px-4 min-w-[60px] text-center font-mono font-bold text-slate-900">
                {item.materiasPresencial}
              </div>
              <span className="text-slate-800 font-medium">Presencial</span>
            </div>

            <div className="flex items-baseline gap-2">
              <div className="border-b border-slate-600 px-4 min-w-[60px] text-center font-mono font-bold text-slate-900">
                {item.materiasOtros}
              </div>
              <span className="text-slate-800 font-medium">Otros</span>
            </div>
          </div>

          {/* Observaciones si las hay */}
          {item.observaciones && (
            <div className="flex items-baseline gap-2 text-sm">
              <span className="font-semibold text-slate-600 whitespace-nowrap">
                Observaciones:
              </span>
              <div className="flex-1 border-b border-slate-400 px-2 text-slate-700 italic">
                {item.observaciones}
              </div>
            </div>
          )}

          {/* Línea complementaria en blanco */}
          <div className="border-b border-slate-400 h-6"></div>
        </div>

        {/* Sección Inferior de Firmas */}
        <div className="mt-16 pt-8 grid grid-cols-2 gap-12 text-center text-sm">
          <div>
            {/* Firma del docente */}
            <div className="h-10 flex items-end justify-center pb-1">
              <span className="font-serif italic text-lg sm:text-xl text-slate-800 tracking-wide font-medium">
                {item.nombreDocente}
              </span>
            </div>
            <div className="border-b-2 border-slate-700 w-4/5 mx-auto mb-2"></div>
            <span className="font-bold text-slate-800 block text-base">Firma del Docente</span>
          </div>

          <div>
            {/* Firma de recepción */}
            <div className="h-10 flex items-end justify-center pb-1">
              <span className="font-serif italic text-lg sm:text-xl text-slate-800 tracking-wide font-medium">
                {item.nombreRecepcion}
              </span>
            </div>
            <div className="border-b-2 border-slate-700 w-4/5 mx-auto mb-2"></div>
            <span className="font-bold text-slate-800 block text-base">Nombre (Recepción)</span>
          </div>
        </div>

        {/* Pie de Página: Ciudad y Fecha */}
        <div className="mt-16 pt-4 border-t border-slate-200 flex items-baseline justify-between text-xs text-slate-600">
          <div className="flex items-baseline gap-2 text-sm">
            <span className="font-semibold text-slate-700">
              {item.ciudad || 'Santa Cruz de la Sierra'}:
            </span>
            <span className="font-mono font-bold text-slate-900 tracking-wider">
              {day} / {month} / {year}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">
            UNIVERSIDAD NUR · COMPROBANTE OFICIAL Nº {item.numeroComprobante}
          </div>
        </div>
      </div>
    </div>
  );
};
