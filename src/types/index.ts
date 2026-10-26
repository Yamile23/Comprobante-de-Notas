export interface Docente {
  id: string;
  nombre: string;
  titulo?: string;
  departamento?: string;
  telefono?: string; // Número de celular para WhatsApp
  activo: boolean;
  createdAt?: string;
}

export interface Receptor {
  id: string;
  nombre: string;
  cargo?: string;
  activo: boolean;
  createdAt?: string;
}

export interface EntregaDocente {
  id: string;
  numeroComprobante: string; // Correlativo único ej: "0005531"
  semestre: string;
  nombreDocente: string;
  telefonoDocente?: string; // Celular del docente para envío por WhatsApp
  materiasDicta: number;
  materiasPendientes: number;
  materiasEducad: number;
  materiasPresencial: number;
  materiasOtros: number;
  nombreRecepcion: string;
  fecha: string; // YYYY-MM-DD
  observaciones?: string;
  ciudad?: string; // "Santa Cruz de la Sierra"
  createdAt?: string;
  updatedAt?: string;
}

export type FormDataDocente = Omit<EntregaDocente, 'id' | 'createdAt' | 'updatedAt'>;
