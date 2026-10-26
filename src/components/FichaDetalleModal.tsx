import React, { useState } from 'react';
import { EntregaDocente } from '../types/index.ts';
import { X, Printer, Copy, Download, Check, FileImage } from 'lucide-react';
import { generateVoucherPng } from '../utils/voucherImageGenerator.ts';

interface FichaDetalleModalProps {
  isOpen: boolean;
  item: EntregaDocente | null;
  onClose: () => void;
}

export const FichaDetalleModal: React.FC<FichaDetalleModalProps> = ({
  isOpen,
  item,
  onClose,
}) => {
  if (!isOpen || !item) return null;

  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
        // Fallback a descarga si el portapapeles no soporta imagen
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden my-4 print:m-0 print:border-none print:shadow-none print:w-full">
        {/* Floating Controls Bar (Hidden when printed) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-slate-200 bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">
              Comprobante Oficial · Formato Físico
            </span>
            <span className="text-[10px] font-mono text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded font-bold">
              Nº {item.numeroComprobante}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón Copiar PNG */}
            <button
              type="button"
              onClick={handleCopyPng}
              title="Copiar comprobante en formato PNG al portapapeles"
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
              title="Descargar comprobante en formato de imagen PNG"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>{downloading ? 'Generando...' : 'Descargar PNG'}</span>
            </button>

            {/* Botón Imprimir */}
            <button
              type="button"
              onClick={handlePrint}
              title="Imprimir boleta física"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>

            {/* Botón Cerrar */}
            <button
              onClick={onClose}
              title="Cerrar ventana"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notificación flotante de confirmación */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 font-medium flex items-center justify-center gap-2 print:hidden animate-in fade-in duration-150">
            <Check className="w-4 h-4 text-white" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Replica Exacta del Comprobante Físico de Recepción de Notas */}
        <div className="p-8 sm:p-12 bg-white text-slate-900 font-sans print:p-8 border-4 border-slate-100 sm:m-4 rounded-lg print:border-none print:m-0">
          {/* Cabecera Superior: Logo a la izquierda, Nº en el centro en rojo, Semestre a la derecha */}
          <div className="flex items-start justify-between gap-4 pb-4">
            {/* Lado Izquierdo: Logo Nur + Dpto */}
            <div className="flex flex-col items-start w-52 shrink-0">
              <img
                src="/assets/aistudio/Logo_nur_6994dcb1.png"
                alt="Universidad Nur"
                className="h-14 w-auto object-contain mb-1"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/public/assets/aistudio/Logo_nur_6994dcb1.png';
                }}
              />
              <span className="text-[11px] font-bold tracking-tight text-slate-900 leading-tight">
                UNIVERSIDAD NUR
              </span>
              <span className="text-[9px] font-semibold text-slate-600 tracking-wider">
                DPTO. ADMISIONES Y REGISTROS
              </span>
            </div>

            {/* Centro: Numeración correlativa en rojo estilo talonario */}
            <div className="flex-1 text-center pt-2">
              <div className="inline-block px-3 py-1">
                <span className="text-xl sm:text-2xl font-bold tracking-widest text-red-600 font-mono">
                  Nº {item.numeroComprobante}
                </span>
              </div>
            </div>

            {/* Lado Derecho: Semestre con línea */}
            <div className="w-48 text-right pt-3 shrink-0">
              <div className="flex items-baseline justify-end gap-1.5 text-sm">
                <span className="font-semibold text-slate-700">Semestre</span>
                <span className="border-b-2 border-slate-700 px-2 min-w-[90px] text-center font-mono font-bold text-slate-900">
                  {item.semestre}
                </span>
              </div>
            </div>
          </div>

          {/* Título Principal */}
          <div className="text-center my-6">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-800 uppercase font-sans">
              COMPROBANTE DE RECEPCIÓN DE NOTAS
            </h1>
          </div>

          {/* Campos del Documento en Formato Impreso */}
          <div className="space-y-6 text-sm sm:text-base leading-relaxed">
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
            <div className="flex flex-wrap sm:flex-nowrap items-baseline gap-6">
              <div className="flex items-baseline gap-2 flex-1">
                <span className="font-semibold text-slate-700 whitespace-nowrap">
                  No. de Materias que dicta:
                </span>
                <div className="border-b border-slate-600 px-3 min-w-[70px] text-center font-mono font-bold text-slate-900">
                  {item.materiasDicta}
                </div>
              </div>

              <div className="flex items-baseline gap-2 flex-1">
                <span className="font-semibold text-slate-700 whitespace-nowrap">
                  No. Materias pendientes para entregar:
                </span>
                <div className="border-b border-slate-600 px-3 min-w-[70px] text-center font-mono font-bold text-slate-900">
                  {item.materiasPendientes}
                </div>
              </div>
            </div>

            {/* Línea: Materias que entrega: Educad, Presencial, Otros */}
            <div className="flex flex-wrap items-baseline gap-4 pt-1">
              <span className="font-semibold text-slate-700 whitespace-nowrap">
                Materias que entrega:
              </span>

              <div className="flex items-baseline gap-1.5">
                <div className="border-b border-slate-600 px-3 min-w-[50px] text-center font-mono font-bold text-slate-900">
                  {item.materiasEducad}
                </div>
                <span className="text-slate-800 font-medium">Educad</span>
              </div>

              <div className="flex items-baseline gap-1.5">
                <div className="border-b border-slate-600 px-3 min-w-[50px] text-center font-mono font-bold text-slate-900">
                  {item.materiasPresencial}
                </div>
                <span className="text-slate-800 font-medium">Presencial</span>
              </div>

              <div className="flex items-baseline gap-1.5">
                <div className="border-b border-slate-600 px-3 min-w-[50px] text-center font-mono font-bold text-slate-900">
                  {item.materiasOtros}
                </div>
                <span className="text-slate-800 font-medium">Otros</span>
              </div>
            </div>

            {/* Observaciones si las hay */}
            {item.observaciones && (
              <div className="flex items-baseline gap-2 text-xs sm:text-sm">
                <span className="font-semibold text-slate-600 whitespace-nowrap">
                  Observaciones:
                </span>
                <div className="flex-1 border-b border-slate-400 px-2 text-slate-700 italic">
                  {item.observaciones}
                </div>
              </div>
            )}

            {/* Línea complementaria en blanco */}
            <div className="border-b border-slate-400 h-4"></div>
          </div>

          {/* Sección Inferior de Firmas */}
          <div className="mt-14 pt-6 grid grid-cols-2 gap-10 text-center text-xs sm:text-sm">
            <div>
              {/* Firma del docente */}
              <div className="h-9 flex items-end justify-center pb-1">
                <span className="font-serif italic text-base sm:text-lg text-slate-800 tracking-wide font-medium">
                  {item.nombreDocente}
                </span>
              </div>
              <div className="border-b-2 border-slate-700 w-4/5 mx-auto mb-2"></div>
              <span className="font-bold text-slate-800 block text-sm">Firma del Docente</span>
            </div>

            <div>
              {/* Firma de recepción */}
              <div className="h-9 flex items-end justify-center pb-1">
                <span className="font-serif italic text-base sm:text-lg text-slate-800 tracking-wide font-medium">
                  {item.nombreRecepcion}
                </span>
              </div>
              <div className="border-b-2 border-slate-700 w-4/5 mx-auto mb-2"></div>
              <span className="font-bold text-slate-800 block text-sm">Nombre (Recepción)</span>
            </div>
          </div>

          {/* Pie de Página: Ciudad y Fecha */}
          <div className="mt-12 pt-4 border-t border-slate-200 flex items-baseline justify-between text-xs text-slate-600">
            <div className="flex items-baseline gap-2 text-xs sm:text-sm">
              <span className="font-semibold text-slate-700">
                {item.ciudad || 'Santa Cruz de la Sierra'}:
              </span>
              <span className="font-mono font-bold text-slate-900 tracking-wider">
                {day} / {month} / {year}
              </span>
            </div>

            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              UNIVERSIDAD NUR · COMPROBANTE OFICIAL Nº {item.numeroComprobante}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
