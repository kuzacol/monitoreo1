export interface User {
  id: number;
  uid: number;
  username: string;
  nombreCompleto: string;
  rol: 'admin' | 'moderador' | 'gestor';
  created_at: string;
}

export interface AuthState {
  checking: boolean;
  user: User | null;
}

export interface Programada {
  id: number;
  numero_servicio: string;
  observacion_inicial: string;
  observacion_final: string | null;
  fecha_creacion: string;
  estado: 'pendiente' | 'en_gestion' | 'archivada' | 'finalizado_sin_contacto' | 'en_proceso';
  creador_id: string | null;
  creador_nombre: string | null;
  gestor_id: string | null;
  gestor_nombre: string | null;
  inicio_gestion: string | null;
  fin_gestion: string | null;
  tiempo_resolucion: number | null;
}

export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  password: string;
  nombreCompleto: string;
} 