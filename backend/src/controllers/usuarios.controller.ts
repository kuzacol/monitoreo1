import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database';

export const getUsuarios = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      'SELECT id, nombre_usuario as username, nombre_completo as nombreCompleto, rol, created_at FROM usuarios WHERE activo = TRUE ORDER BY created_at DESC'
    );

    res.json({
      ok: true,
      usuarios: rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: 'Error inesperado'
    });
  }
};

export const createUsuario = async (req: Request, res: Response) => {
  const { nombreUsuario, nombreCompleto, contrasena, rol } = req.body;
  const userRole = req.user?.rol;

  try {
    // Verificar si el usuario que crea es admin o moderador
    if (userRole !== 'admin' && userRole !== 'moderador') {
      return res.status(403).json({
        ok: false,
        msg: 'No tiene permisos para crear usuarios'
      });
    }

    // Si no es admin, solo puede crear gestores
    if (userRole !== 'admin' && rol !== 'gestor') {
      return res.status(403).json({
        ok: false,
        msg: 'Solo los administradores pueden crear moderadores y administradores'
      });
    }

    // Verificar si el usuario ya existe
    const [existingUser]: any = await pool.query(
      'SELECT id FROM usuarios WHERE nombre_usuario = ?',
      [nombreUsuario]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        ok: false,
        msg: 'El nombre de usuario ya existe'
      });
    }

    // Encriptar contraseña
    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(contrasena, salt);

    // Crear usuario
    const [result]: any = await pool.query(
      'INSERT INTO usuarios (nombre_usuario, nombre_completo, contrasena, rol) VALUES (?, ?, ?, ?)',
      [nombreUsuario, nombreCompleto, hashedPassword, rol]
    );

    res.json({
      ok: true,
      usuario: {
        id: result.insertId,
        nombreUsuario,
        nombreCompleto,
        rol
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: 'Error inesperado'
    });
  }
};

export const updateUsuarioRol = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rol } = req.body;
  const userRole = req.user?.rol;
  const userId = req.user?.uid;

  try {
    // Verificar si el usuario que actualiza es admin
    if (userRole !== 'admin') {
      return res.status(403).json({
        ok: false,
        msg: 'Solo los administradores pueden actualizar roles'
      });
    }

    // Verificar si el usuario existe y está activo
    const [existingUser]: any = await pool.query(
      'SELECT id, rol FROM usuarios WHERE id = ? AND activo = TRUE',
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: 'Usuario no encontrado o inactivo'
      });
    }

    // No permitir cambiar el rol de otros administradores
    if (existingUser[0].rol === 'admin' && existingUser[0].id !== userId) {
      return res.status(403).json({
        ok: false,
        msg: 'No se puede modificar el rol de otros administradores'
      });
    }

    // Usar el procedimiento almacenado para actualizar el rol
    await pool.query('CALL actualizar_rol(?, ?, ?)', [id, rol, userId]);

    res.json({
      ok: true,
      msg: 'Rol actualizado correctamente'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: 'Error inesperado'
    });
  }
};

export const deleteUsuario = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userRole = req.user?.rol;
  const userId = req.user?.uid;

  try {
    // Verificar si el usuario que elimina es admin o moderador
    if (userRole !== 'admin' && userRole !== 'moderador') {
      return res.status(403).json({
        ok: false,
        msg: 'No tiene permisos para eliminar usuarios'
      });
    }

    // Verificar si el usuario existe
    const [existingUser]: any = await pool.query(
      'SELECT id, rol FROM usuarios WHERE id = ?',
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: 'Usuario no encontrado'
      });
    }

    // Reglas de eliminación:
    // 1. Los administradores pueden eliminar cualquier usuario excepto otros administradores
    // 2. Los moderadores solo pueden eliminar gestores
    // 3. Nadie puede eliminarse a sí mismo
    if (userId === existingUser[0].id) {
      return res.status(403).json({
        ok: false,
        msg: 'No puede eliminarse a sí mismo'
      });
    }

    if (existingUser[0].rol === 'admin') {
      return res.status(403).json({
        ok: false,
        msg: 'No se puede eliminar a un administrador'
      });
    }

    if (userRole === 'moderador' && existingUser[0].rol !== 'gestor') {
      return res.status(403).json({
        ok: false,
        msg: 'Los moderadores solo pueden eliminar gestores'
      });
    }

    // Eliminar usuario de la base de datos
    await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);

    res.json({
      ok: true,
      msg: 'Usuario eliminado correctamente'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: 'Error inesperado'
    });
  }
};

export const updateUsuario = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombreUsuario, nombreCompleto, contrasena, rol } = req.body;
  const userRole = req.user?.rol;
  const userId = req.user?.uid;

  try {
    // Verificar si el usuario que actualiza es admin o moderador
    if (userRole !== 'admin' && userRole !== 'moderador') {
      return res.status(403).json({
        ok: false,
        msg: 'No tiene permisos para actualizar usuarios'
      });
    }

    // Verificar si el usuario existe y está activo
    const [existingUser]: any = await pool.query(
      'SELECT id, rol, nombre_usuario FROM usuarios WHERE id = ? AND activo = TRUE',
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: 'Usuario no encontrado o inactivo'
      });
    }

    // Verificar si el nuevo nombre de usuario ya existe (si se está cambiando)
    if (nombreUsuario !== existingUser[0].nombre_usuario) {
      const [userWithSameName]: any = await pool.query(
        'SELECT id FROM usuarios WHERE nombre_usuario = ? AND id != ?',
        [nombreUsuario, id]
      );

      if (userWithSameName.length > 0) {
        return res.status(400).json({
          ok: false,
          msg: 'El nombre de usuario ya existe'
        });
      }
    }

    // Reglas de actualización:
    // 1. Los moderadores solo pueden actualizar gestores
    // 2. Los administradores pueden actualizar cualquier usuario excepto otros administradores
    // 3. No se puede cambiar el rol a menos que sea administrador
    if (userRole === 'moderador') {
      if (existingUser[0].rol !== 'gestor') {
        return res.status(403).json({
          ok: false,
          msg: 'Los moderadores solo pueden actualizar gestores'
        });
      }
      // Los moderadores no pueden cambiar roles
      if (rol !== existingUser[0].rol) {
        return res.status(403).json({
          ok: false,
          msg: 'Los moderadores no pueden cambiar roles'
        });
      }
    } else if (userRole === 'admin') {
      // Los administradores no pueden modificar a otros administradores
      if (existingUser[0].rol === 'admin' && existingUser[0].id !== userId) {
        return res.status(403).json({
          ok: false,
          msg: 'No se puede modificar a otros administradores'
        });
      }
    }

    // Preparar la actualización
    let query = 'UPDATE usuarios SET nombre_usuario = ?, nombre_completo = ?';
    let params = [nombreUsuario, nombreCompleto];

    // Si se proporciona contraseña, actualizarla
    if (contrasena) {
      const salt = bcrypt.genSaltSync();
      const hashedPassword = bcrypt.hashSync(contrasena, salt);
      query += ', contrasena = ?';
      params.push(hashedPassword);
    }

    // Si es admin y se proporciona rol, actualizarlo
    if (userRole === 'admin' && rol) {
      query += ', rol = ?';
      params.push(rol);
    }

    query += ' WHERE id = ?';
    params.push(id);

    // Ejecutar la actualización
    await pool.query(query, params);

    res.json({
      ok: true,
      msg: 'Usuario actualizado correctamente'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: 'Error inesperado'
    });
  }
}; 