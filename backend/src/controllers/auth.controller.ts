import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';

const generarJWT = (uid: number): string => {
  return jwt.sign(
    { uid },
    process.env.JWT_SECRET || 'tu_secret_key',
    { expiresIn: '24h' }
  );
};

export const login = async (req: Request, res: Response) => {
    try {
        // Verificar que el body tenga los campos necesarios
        if (!req.body) {
            console.error('Error: No se recibió body en la petición');
            return res.status(400).json({
                ok: false,
                msg: 'No se recibieron credenciales'
            });
        }

        // Aceptar ambos formatos de credenciales
        const nombreUsuario = req.body.nombreUsuario || req.body.username;
        const contrasena = req.body.contrasena || req.body.password;

        // Validar que se recibieron las credenciales
        if (!nombreUsuario || !contrasena) {
            console.error('Error: Faltan credenciales', { nombreUsuario: !!nombreUsuario, contrasena: !!contrasena });
            return res.status(400).json({
                ok: false,
                msg: 'Faltan credenciales'
            });
        }

        console.log('👤 Intento de login:', { 
            nombreUsuario,
            bodyRecibido: req.body 
        });

        // Verificar si el usuario existe
        const [rows]: any = await pool.query(
            'SELECT id, nombre_usuario, nombre_completo, contrasena, rol, activo FROM usuarios WHERE nombre_usuario = ?',
            [nombreUsuario]
        );

        console.log('🔍 Búsqueda de usuario:', {
            encontrado: rows.length > 0,
            activo: rows.length > 0 ? rows[0].activo : null,
            rol: rows.length > 0 ? rows[0].rol : null
        });

        if (rows.length === 0 || !rows[0].activo) {
            return res.status(400).json({
                ok: false,
                msg: 'Credenciales incorrectas'
            });
        }

        // Verificar la contraseña
        const hashAlmacenado = rows[0].contrasena;
        
        let validPassword = false;
        try {
            validPassword = bcrypt.compareSync(contrasena, hashAlmacenado);
            console.log('✅ Resultado de validación:', { validPassword });
        } catch (error) {
            console.error('❌ Error al comparar contraseñas:', error);
            return res.status(500).json({
                ok: false,
                msg: 'Error en la validación de credenciales'
            });
        }

        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Credenciales incorrectas'
            });
        }

        await pool.query(
            'UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?',
            [rows[0].id]
        );

        // Generar JWT
        const token = generarJWT(rows[0].id);

        console.log('🎉 Login exitoso:', {
            usuario: rows[0].nombre_usuario,
            rol: rows[0].rol
        });

        res.json({
            ok: true,
            token,
            usuario: {
                id: rows[0].id,
                nombreUsuario: rows[0].nombre_usuario,
                nombreCompleto: rows[0].nombre_completo,
                rol: rows[0].rol
            }
        });

    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        });
    }
};

export const register = async (req: Request, res: Response) => {
  const { username, password, fullName } = req.body;

  try {
    const [existingUser]: any = await pool.query('SELECT * FROM usuarios WHERE nombre_usuario = ?', [username]);

    if (existingUser.length > 0) {
      return res.status(400).json({
        ok: false,
        msg: 'El usuario ya existe'
      });
    }

    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(password, salt);

    const [result]: any = await pool.query(
      'INSERT INTO usuarios (nombre_usuario, contrasena, nombre_completo) VALUES (?, ?, ?)',
      [username, hashedPassword, fullName]
    );

    res.json({
      ok: true,
      usuario: {
        id: result.insertId,
        nombreUsuario: username,
        nombreCompleto: fullName,
        rol: 'gestor'
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'Error inesperado'
    });
  }
}; 