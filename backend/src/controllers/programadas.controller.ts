import { Request, Response } from 'express';
import pool from '../config/database';
import { utils, write } from 'xlsx';

export const createProgramada = async (req: Request, res: Response) => {
  const { numero_servicio, observacion_inicial } = req.body;
  const creador_id = req.user?.uid;

  try {
    // Validar campos requeridos
    if (!numero_servicio || !observacion_inicial) {
      return res.status(400).json({
        ok: false,
        msg: 'El número de servicio y la observación son obligatorios'
      });
    }

    // Insertar con valores por defecto
    const [result]: any = await pool.query(
      `INSERT INTO programadas (
        numero_servicio, 
        observacion_inicial, 
        fecha_creacion, 
        estado, 
        creador_id
      ) VALUES (?, ?, NOW(), 'pendiente', ?)`,
      [numero_servicio, observacion_inicial, creador_id]
    );

    // Obtener la programada creada con información del creador y gestor
    const [programadaCreada]: any = await pool.query(
      `SELECT p.*, 
        u1.nombre_completo as creador_nombre,
        u2.nombre_completo as gestor_nombre
      FROM programadas p 
      LEFT JOIN usuarios u1 ON p.creador_id = u1.id 
      LEFT JOIN usuarios u2 ON p.gestor_id = u2.id 
      WHERE p.id = ?`,
      [result.insertId]
    );

    res.json({
      ok: true,
      msg: 'Programada creada exitosamente',
      programada: programadaCreada[0]
    });
  } catch (error) {
    console.error('Error al crear programada:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error inesperado al crear la programada'
    });
  }
};

export const getProgramadas = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      `SELECT p.*, 
        u1.nombre_completo as creador_nombre,
        u2.nombre_completo as gestor_nombre
      FROM programadas p 
      LEFT JOIN usuarios u1 ON p.creador_id = u1.id 
      LEFT JOIN usuarios u2 ON p.gestor_id = u2.id 
      WHERE p.estado != 'archivada' 
      ORDER BY p.fecha_creacion DESC`
    );

    res.json({
      ok: true,
      programadas: rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: 'Error inesperado'
    });
  }
};

export const takeProgramada = async (req: Request, res: Response) => {
  const { id } = req.params;
  const usuario_id = req.user?.uid;

  try {
    // Verificar si la programada existe y está disponible
    const [programada]: any = await pool.query(
      'SELECT * FROM programadas WHERE id = ?',
      [id]
    );

    if (programada.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: 'Programada no encontrada'
      });
    }

    if (programada[0].estado !== 'pendiente') {
      return res.status(400).json({
        ok: false,
        msg: 'La programada no está disponible'
      });
    }

    // Actualizar el estado y asignar el gestor
    const [result]: any = await pool.query(
      'UPDATE programadas SET estado = ?, gestor_id = ?, inicio_gestion = NOW() WHERE id = ?',
      ['en_gestion', usuario_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        ok: false,
        msg: 'No se pudo tomar la programada'
      });
    }

    // Obtener la programada actualizada
    const [programadaActualizada]: any = await pool.query(
      'SELECT * FROM programadas WHERE id = ?',
      [id]
    );

    res.json({
      ok: true,
      msg: 'Programada tomada exitosamente',
      programada: programadaActualizada[0]
    });
  } catch (error) {
    console.error('Error al tomar programada:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error inesperado'
    });
  }
};

export const updateProgramada = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { estado, observacion_final } = req.body;

  try {
    const [programada]: any = await pool.query(
      'SELECT * FROM programadas WHERE id = ?',
      [id]
    );

    if (programada.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: 'Programada no encontrada'
      });
    }

    await pool.query(
      'UPDATE programadas SET estado = ?, observacion_final = ? WHERE id = ?',
      [estado, observacion_final, id]
    );

    res.json({
      ok: true,
      msg: 'Programada actualizada exitosamente'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: 'Error inesperado'
    });
  }
};

export const archiveProgramada = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { observacionFinal, estado } = req.body;
  const gestor_id = req.user?.uid;

  try {
    // Iniciamos una transacción
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Primero obtenemos los datos de la programada
      const [programada]: any = await connection.query(
        `SELECT p.*, 
          u1.nombre_completo as creador_nombre,
          u2.nombre_completo as gestor_nombre
        FROM programadas p 
        LEFT JOIN usuarios u1 ON p.creador_id = u1.id 
        LEFT JOIN usuarios u2 ON p.gestor_id = u2.id 
        WHERE p.id = ?`,
        [id]
      );

      if (programada.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({
          ok: false,
          msg: 'Programada no encontrada'
        });
      }

      // Validar el estado
      const estadosValidos = ['archivada', 'finalizado_sin_contacto', 'en_proceso'];
      if (!estadosValidos.includes(estado)) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          ok: false,
          msg: 'Estado no válido'
        });
      }

      // Si el estado es en_proceso, solo actualizamos el estado y la observación
      if (estado === 'en_proceso') {
        await connection.query(
          `UPDATE programadas 
           SET estado = ?, 
               observacion_final = ?
           WHERE id = ?`,
          [estado, observacionFinal, id]
        );
      } else {
        // Para otros estados, movemos al histórico
        await connection.query(
          `INSERT INTO programadas_historico (
            programada_id,
            numero_servicio,
            observacion_inicial,
            observacion_final,
            fecha_creacion,
            creador_id,
            gestor_id,
            inicio_gestion,
            fin_gestion,
            tiempo_resolucion,
            estado
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 
            TIMESTAMPDIFF(MINUTE, inicio_gestion, NOW()),
            ?)`,
          [
            programada[0].id,
            programada[0].numero_servicio,
            programada[0].observacion_inicial,
            observacionFinal,
            programada[0].fecha_creacion,
            programada[0].creador_id,
            gestor_id,
            programada[0].inicio_gestion,
            estado
          ]
        );

        // Eliminamos la programada de la tabla principal
        await connection.query('DELETE FROM programadas WHERE id = ?', [id]);
      }

      // Confirmamos la transacción
      await connection.commit();
      connection.release();

      res.json({
        ok: true,
        msg: estado === 'en_proceso' ? 'Programada actualizada exitosamente' : 'Programada archivada exitosamente'
      });

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error al archivar programada:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error inesperado al archivar la programada'
    });
  }
};

export const getArchivedProgramadas = async (req: Request, res: Response) => {
  const { desde, hasta } = req.query;

  try {
    let query = `
      SELECT ph.*,
        u1.nombre_completo as creador_nombre,
        u2.nombre_completo as gestor_nombre,
        DATE_FORMAT(ph.fecha_archivo, '%Y-%m-%d %H:%i:%s') as fecha_archivo_formatted
      FROM programadas_historico ph
      LEFT JOIN usuarios u1 ON ph.creador_id = u1.id
      LEFT JOIN usuarios u2 ON ph.gestor_id = u2.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (desde && hasta) {
      query += ' AND ph.fecha_creacion BETWEEN ? AND ?';
      params.push(desde, hasta);
    }

    query += ' ORDER BY ph.fecha_archivo DESC';

    const [rows]: any = await pool.query(query, params);

    res.json({
      ok: true,
      programadas: rows
    });
  } catch (error) {
    console.error('Error al obtener programadas archivadas:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error inesperado al obtener programadas archivadas'
    });
  }
};

export const exportProgramadas = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      'SELECT p.*, u1.nombre_completo as creador, u2.nombre_completo as gestor FROM programadas p LEFT JOIN usuarios u1 ON p.creador_id = u1.id LEFT JOIN usuarios u2 ON p.gestor_id = u2.id ORDER BY fecha_creacion DESC'
    );

    res.json({
      ok: true,
      programadas: rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: 'Error inesperado'
    });
  }
};

export const deleteProgramada = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userRole = req.user?.rol;

  try {
    // Solo admin puede eliminar programadas
    if (userRole !== 'admin') {
      return res.status(403).json({
        ok: false,
        msg: 'No tiene permisos para eliminar programadas'
      });
    }

    const [result]: any = await pool.query(
      'DELETE FROM programadas WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        msg: 'Programada no encontrada'
      });
    }

    res.json({
      ok: true,
      msg: 'Programada eliminada exitosamente'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: 'Error inesperado'
    });
  }
};

export const getProgramadaById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [rows]: any = await pool.query(
      'SELECT * FROM programadas WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        ok: false,
        msg: 'Programada no encontrada'
      });
    }

    res.json({
      ok: true,
      programada: rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: 'Error inesperado'
    });
  }
}; 