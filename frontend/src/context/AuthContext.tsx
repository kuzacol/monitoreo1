import React, { createContext, useContext, useReducer } from 'react';
import { AuthState, User, LoginForm, RegisterForm } from '../types';
import axios from 'axios';

// Configuración global de axios
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:5000/api';

// Interceptor para manejar las credenciales
axios.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user) {
      config.headers['x-token'] = user.token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

interface AuthContextType extends AuthState {
  login: (nombreUsuario: string, contrasena: string) => Promise<void>;
  register: (formData: RegisterForm) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  checking: false,
  user: null,
  error: null
};

type AuthAction =
  | { type: 'CHECK_AUTH' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'CHECK_AUTH':
      return {
        ...state,
        checking: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        checking: false,
        user: action.payload.user,
        error: null
      };
    case 'AUTH_ERROR':
      return {
        checking: false,
        user: null,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        checking: false,
        user: null,
        error: null
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (nombreUsuario: string, contrasena: string) => {
    try {
      dispatch({ type: 'CHECK_AUTH' });
      const { data } = await axios.post('/auth/login', { nombreUsuario, contrasena });
      
      // Guardar el token en localStorage
      localStorage.setItem('user', JSON.stringify({ token: data.token }));
      
      dispatch({ type: 'AUTH_SUCCESS', payload: { user: data.usuario } });
    } catch (error: any) {
      console.error('Error en login:', error);
      dispatch({ type: 'AUTH_ERROR', payload: error.response?.data?.msg || 'Error al iniciar sesión' });
      throw error;
    }
  };

  const register = async (formData: RegisterForm) => {
    try {
      dispatch({ type: 'CHECK_AUTH' });
      const { data } = await axios.post('/auth/register', formData);
      dispatch({ type: 'AUTH_SUCCESS', payload: { user: data.user } });
    } catch (error: any) {
      console.error('Error en registro:', error);
      dispatch({ type: 'AUTH_ERROR', payload: error.response?.data?.msg || 'Error al registrar usuario' });
      throw error;
    }
  };

  const logout = () => {
    // Limpiar el token del localStorage
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}; 