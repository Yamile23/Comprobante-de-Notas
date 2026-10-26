/**
 * Generador de Comprobante en formato PNG (Canvas 2x High-DPI)
 * Replica exactamente el formato físico de la Universidad Nur
 */
import { EntregaDocente } from '../types/index.ts';

export interface GeneratedVoucherImage {
  blob: Blob;
  dataUrl: string;
  file: File;
}

export async function generateVoucherPng(item: EntregaDocente): Promise<GeneratedVoucherImage> {
  const width = 1600;
  const height = 1060;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No se pudo inicializar el contexto 2D de Canvas');
  }

  // Fondo estilo papel oficial con ligero matiz marfil
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Borde exterior suave del comprobante
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Borde interior fino
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(32, 32, width - 64, height - 64);

  // Intentar cargar el logo oficial de la Universidad Nur
  try {
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    const logoLoaded = new Promise<boolean>((resolve) => {
      logoImg.onload = () => resolve(true);
      logoImg.onerror = () => resolve(false);
    });
    logoImg.src = '/assets/aistudio/Logo_nur_6994dcb1.png';
    const success = await Promise.race([
      logoLoaded,
      new Promise<boolean>((r) => setTimeout(() => r(false), 800)),
    ]);

    if (success && logoImg.width > 0) {
      // Dibujar logo con proporción adecuada
      const logoAspect = logoImg.width / logoImg.height;
      const targetHeight = 90;
      const targetWidth = targetHeight * logoAspect;
      ctx.drawImage(logoImg, 70, 50, targetWidth, targetHeight);
    } else {
      // Fallback estético si no carga imagen
      ctx.fillStyle = '#C59B27';
      ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('UNIVERSIDAD NUR', 70, 95);
    }
  } catch {
    // Silently continue if image load fails
  }

  // Textos de cabecera izquierda
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 22px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText('UNIVERSIDAD NUR', 70, 165);

  ctx.fillStyle = '#475569';
  ctx.font = '600 16px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText('DPTO. ADMISIONES Y REGISTROS', 70, 192);

  // Centro: Número correlativo estilo sello rojo de talonario
  ctx.fillStyle = '#DC2626';
  ctx.font = 'bold 44px "JetBrains Mono", Courier, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`Nº ${item.numeroComprobante}`, width / 2, 110);

  // Derecha: Semestre
  ctx.textAlign = 'right';
  ctx.fillStyle = '#334155';
  ctx.font = '600 24px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText('Semestre: ', width - 260, 110);

  // Valor del semestre y línea de subrayado
  ctx.font = 'bold 26px "JetBrains Mono", monospace';
  ctx.fillStyle = '#0F172A';
  ctx.fillText(item.semestre, width - 80, 108);

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(width - 250, 118);
  ctx.lineTo(width - 70, 118);
  ctx.stroke();

  // Título Central: COMPROBANTE DE RECEPCIÓN DE NOTAS
  ctx.textAlign = 'center';
  ctx.fillStyle = '#334155';
  ctx.font = '800 38px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText('COMPROBANTE DE RECEPCIÓN DE NOTAS', width / 2, 280);

  // Restablecer alineación a la izquierda para los campos
  ctx.textAlign = 'left';

  // --- FILA 1: Nombre del docente ---
  const row1Y = 380;
  ctx.fillStyle = '#475569';
  ctx.font = '600 24px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText('Nombre del docente:', 70, row1Y);

  // Valor docente
  ctx.fillStyle = '#0F172A';
  ctx.font = '700 26px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText(item.nombreDocente, 350, row1Y);

  // Línea debajo del nombre del docente
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(340, row1Y + 10);
  ctx.lineTo(width - 70, row1Y + 10);
  ctx.stroke();

  // --- FILA 2: No. de Materias que dicta & No. Materias pendientes ---
  const row2Y = 480;
  ctx.fillStyle = '#475569';
  ctx.font = '600 24px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText('No. de Materias que dicta:', 70, row2Y);

  // Valor materias que dicta
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 28px "JetBrains Mono", monospace';
  ctx.fillText(String(item.materiasDicta), 410, row2Y);

  // Línea para materias que dicta
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(395, row2Y + 10);
  ctx.lineTo(510, row2Y + 10);
  ctx.stroke();

  // No. Materias pendientes para entregar
  ctx.fillStyle = '#475569';
  ctx.font = '600 24px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText('No. Materias pendientes para entregar:', 570, row2Y);

  // Valor materias pendientes
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 28px "JetBrains Mono", monospace';
  ctx.fillText(String(item.materiasPendientes), 1080, row2Y);

  // Línea para materias pendientes
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(1060, row2Y + 10);
  ctx.lineTo(1200, row2Y + 10);
  ctx.stroke();

  // --- FILA 3: Materias que entrega (Educad, Presencial, Otros) ---
  const row3Y = 580;
  ctx.fillStyle = '#475569';
  ctx.font = '600 24px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText('Materias que entrega:', 70, row3Y);

  // Educad
  ctx.fillText('Educad', 380, row3Y);
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 28px "JetBrains Mono", monospace';
  ctx.fillText(String(item.materiasEducad), 490, row3Y);
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(480, row3Y + 10);
  ctx.lineTo(580, row3Y + 10);
  ctx.stroke();

  // Presencial
  ctx.fillStyle = '#475569';
  ctx.font = '600 24px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText('Presencial', 660, row3Y);
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 28px "JetBrains Mono", monospace';
  ctx.fillText(String(item.materiasPresencial), 810, row3Y);
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(800, row3Y + 10);
  ctx.lineTo(920, row3Y + 10);
  ctx.stroke();

  // Otros
  ctx.fillStyle = '#475569';
  ctx.font = '600 24px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText('Otros', 1000, row3Y);
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 28px "JetBrains Mono", monospace';
  ctx.fillText(String(item.materiasOtros), 1100, row3Y);
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(1090, row3Y + 10);
  ctx.lineTo(1220, row3Y + 10);
  ctx.stroke();

  // --- LÍNEA DE SEPARACIÓN SUAVE ANTES DE FIRMAS ---
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(70, 680);
  ctx.lineTo(width - 70, 680);
  ctx.stroke();

  // --- FILA DE FIRMAS: Firma del Docente & Nombre (Recepción) ---
  const signLineY = 800;

  // Lado Izquierdo: Firma del Docente
  // 1. Nombre como firma sobre la línea
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0F172A';
  ctx.font = 'italic 28px Georgia, "Times New Roman", serif';
  ctx.fillText(item.nombreDocente, 360, signLineY - 14);

  // Línea de firma
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(140, signLineY);
  ctx.lineTo(580, signLineY);
  ctx.stroke();

  // Debajo de la línea: Firma del Docente
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 22px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText('Firma del Docente', 360, signLineY + 36);

  // Lado Derecho: Nombre (Recepción)
  // 1. Nombre como firma sobre la línea
  ctx.fillStyle = '#0F172A';
  ctx.font = 'italic 28px Georgia, "Times New Roman", serif';
  ctx.fillText(item.nombreRecepcion, width - 360, signLineY - 14);

  // Línea de firma
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(width - 580, signLineY);
  ctx.lineTo(width - 140, signLineY);
  ctx.stroke();

  // Debajo de la línea: Nombre (Recepción)
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 22px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText('Nombre (Recepción)', width - 360, signLineY + 36);

  // --- PIE DE PÁGINA: Santa Cruz de la Sierra: DD / MM / AAAA ---
  ctx.textAlign = 'left';
  const footerY = 960;
  ctx.fillStyle = '#475569';
  ctx.font = '600 22px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText('Santa Cruz de la Sierra:', 70, footerY);

  // Parsear fecha
  let day = '__', month = '__', year = '____';
  if (item.fecha) {
    const parts = item.fecha.split('-');
    if (parts.length === 3) {
      year = parts[0];
      month = parts[1];
      day = parts[2];
    }
  }

  // Cuadro / línea para la fecha
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 24px "JetBrains Mono", monospace';
  ctx.fillText(`${day}  /  ${month}  /  ${year}`, 360, footerY);

  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(350, footerY + 8);
  ctx.lineTo(580, footerY + 8);
  ctx.stroke();

  // Sello digital de validez en la esquina inferior derecha
  ctx.textAlign = 'right';
  ctx.fillStyle = '#94A3B8';
  ctx.font = '500 14px "JetBrains Mono", monospace';
  ctx.fillText(`VALIDACIÓN DIGITAL · NUR-${item.numeroComprobante} · ${new Date().toISOString().slice(0, 10)}`, width - 70, footerY);

  // Convertir canvas a Blob y File
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Error al generar Blob PNG desde Canvas'));
          return;
        }
        const dataUrl = canvas.toDataURL('image/png');
        const filename = `Comprobante_NUR_${item.numeroComprobante}.png`;
        const file = new File([blob], filename, { type: 'image/png' });
        resolve({ blob, dataUrl, file });
      },
      'image/png',
      1.0
    );
  });
}
