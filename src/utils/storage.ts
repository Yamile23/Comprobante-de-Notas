import { EntregaDocente, Docente, Receptor } from '../types/index.ts';
import { INITIAL_ENTREGAS, INITIAL_DOCENTES, INITIAL_RECEPTORES } from '../data/initialData.ts';

const STORAGE_KEY_ENTREGAS = 'edu_docentes_entregas_v3';
const STORAGE_KEY_DOCENTES = 'edu_docentes_lista_v1';
const STORAGE_KEY_RECEPTORES = 'edu_receptores_lista_v1';

export function loadEntregas(): EntregaDocente[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ENTREGAS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ENTREGAS, JSON.stringify(INITIAL_ENTREGAS));
      return INITIAL_ENTREGAS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_ENTREGAS;
  } catch (err) {
    console.error('Error al cargar entregas:', err);
    return INITIAL_ENTREGAS;
  }
}

export function saveEntregas(entregas: EntregaDocente[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ENTREGAS, JSON.stringify(entregas));
  } catch (err) {
    console.error('Error al guardar entregas:', err);
  }
}

export function loadDocentes(): Docente[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DOCENTES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_DOCENTES, JSON.stringify(INITIAL_DOCENTES));
      return INITIAL_DOCENTES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_DOCENTES;
  } catch (err) {
    console.error('Error al cargar docentes:', err);
    return INITIAL_DOCENTES;
  }
}

export function saveDocentes(docentes: Docente[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_DOCENTES, JSON.stringify(docentes));
  } catch (err) {
    console.error('Error al guardar docentes:', err);
  }
}

export function loadReceptores(): Receptor[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECEPTORES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_RECEPTORES, JSON.stringify(INITIAL_RECEPTORES));
      return INITIAL_RECEPTORES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_RECEPTORES;
  } catch (err) {
    console.error('Error al cargar personal de recepcion:', err);
    return INITIAL_RECEPTORES;
  }
}

export function saveReceptores(receptores: Receptor[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_RECEPTORES, JSON.stringify(receptores));
  } catch (err) {
    console.error('Error al guardar personal de recepcion:', err);
  }
}

export function resetAllData(): {
  entregas: EntregaDocente[];
  docentes: Docente[];
  receptores: Receptor[];
} {
  try {
    localStorage.setItem(STORAGE_KEY_ENTREGAS, JSON.stringify(INITIAL_ENTREGAS));
    localStorage.setItem(STORAGE_KEY_DOCENTES, JSON.stringify(INITIAL_DOCENTES));
    localStorage.setItem(STORAGE_KEY_RECEPTORES, JSON.stringify(INITIAL_RECEPTORES));
  } catch (err) {
    console.error('Error al reiniciar datos:', err);
  }
  return {
    entregas: INITIAL_ENTREGAS,
    docentes: INITIAL_DOCENTES,
    receptores: INITIAL_RECEPTORES,
  };
}

export function getNextCorrelativeNumber(entregas: EntregaDocente[]): string {
  if (entregas.length === 0) {
    return '0005531';
  }
  const numericValues = entregas
    .map((e) => parseInt(e.numeroComprobante.replace(/\D/g, ''), 10))
    .filter((n) => !isNaN(n));

  if (numericValues.length === 0) {
    return '0005531';
  }

  const maxVal = Math.max(...numericValues);
  const nextVal = Math.max(maxVal + 1, 5531);
  return String(nextVal).padStart(7, '0');
}
