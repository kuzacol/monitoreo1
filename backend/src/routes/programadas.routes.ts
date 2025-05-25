import { Router } from 'express';
import { check } from 'express-validator';
import { validarCampos } from '../middlewares/validar-campos';
import { validarJWT } from '../middlewares/validar-jwt';
import {
  createProgramada,
  getProgramadas,
  takeProgramada,
  updateProgramada,
  archiveProgramada,
  getArchivedProgramadas,
  exportProgramadas,
  deleteProgramada,
  getProgramadaById
} from '../controllers/programadas.controller';

const router = Router();

// Aplicar validación JWT a todas las rutas
router.use(validarJWT);

// Crear programada
router.post('/', [
  check('numero_servicio', 'El número de servicio es obligatorio').not().isEmpty(),
  check('observacion_inicial', 'La observación inicial es obligatoria').not().isEmpty(),
  validarCampos
], createProgramada);

// Obtener programadas activas
router.get('/', getProgramadas);

// Tomar programada
router.put('/:id/take', takeProgramada);

// Actualizar programada
router.put('/:id', [
  check('id', 'El ID debe ser numérico').isNumeric(),
  check('estado', 'El estado no es válido').optional().isIn(['pendiente', 'en_gestion', 'archivada', 'finalizado_sin_contacto']),
  validarCampos
], updateProgramada);

// Archivar programada
router.put('/:id/archive', [
  check('observacionFinal', 'La observación final es obligatoria').not().isEmpty(),
  validarCampos
], archiveProgramada);

// Obtener programadas archivadas
router.get('/archived', getArchivedProgramadas);

// Exportar programadas
router.get('/export', exportProgramadas);

// Obtener una programada por ID
router.get('/:id', [
  check('id', 'El ID debe ser numérico').isNumeric(),
  validarCampos
], getProgramadaById);

// Eliminar programada
router.delete('/:id', [
  check('id', 'El ID debe ser numérico').isNumeric(),
  validarCampos
], deleteProgramada);

export default router; 