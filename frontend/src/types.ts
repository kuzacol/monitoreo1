// Interfaces para la autenticación
export interface User {
  id: number;
  uid: string;
  email: string;
  nombre: string;
  rol: string;
  username: string;
  nombreCompleto: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  checking: boolean;
  error: string | null;
}

export interface AuthContextType {
  user: User | null;
  checking: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (formData: RegisterForm) => Promise<void>;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  nombre: string;
  rol: string;
}

// Interface para las programadas
export interface Programada {
  id: number;
  numero_servicio: string;
  fecha_creacion: string;
  estado: 'pendiente' | 'en_gestion' | 'archivada' | 'finalizado_sin_contacto';
  creador_id: string;
  creador_nombre: string;
  gestor_id: string | null;
  gestor_nombre: string | null;
  observacion_inicial: string;
  observacion_final: string | null;
  inicio_gestion: string | null;
  fin_gestion: string | null;
} 