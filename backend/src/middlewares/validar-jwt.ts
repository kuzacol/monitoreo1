import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database';

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: number;
        rol: string;
      };
    }
  }
}

export const validarJWT = async (req: Request, res: Response, next: NextFunction) => {
  // Leer el token del header
  const token = req.header('x-token');

  if (!token) {
    return res.status(401).json({
      ok: false,
      msg: 'No hay token en la petición'
    });
  }

  try {
    // Verificar el token
    const { uid } = jwt.verify(token, process.env.JWT_SECRET || 'tu_secret_key') as { uid: number };

    // Leer el usuario correspondiente al uid
    const [rows]: any = await pool.query(
      'SELECT id, rol FROM usuarios WHERE id = ? AND activo = TRUE',
      [uid]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        ok: false,
        msg: 'Token no válido - usuario no existe o está inactivo'
      });
    }

    // Agregar la información del usuario al request
    req.user = {
      uid: rows[0].id,
      rol: rows[0].rol
    };

    next();
  } catch (error) {
    console.error('Error validando token:', error);
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        ok: false,
        msg: 'Token expirado'
      });
    }
    return res.status(401).json({
      ok: false,
      msg: 'Token no válido'
    });
  }
}; 