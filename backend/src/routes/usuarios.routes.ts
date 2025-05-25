import { Router } from 'express';
import { getUsuarios, createUsuario, updateUsuarioRol, deleteUsuario, updateUsuario } from '../controllers/usuarios.controller';
import { check } from 'express-validator';
import { validarCampos } from '../middlewares/validar-campos';
import { validarJWT } from '../middlewares/validar-jwt';

const router = Router();

// Aplicar validación JWT a todas las rutas
router.use(validarJWT);

// Obtener usuarios
router.get('/', getUsuarios);

// Crear usuario (admin y moderador)
router.post('/', [
  check('nombreUsuario', 'El nombre de usuario es obligatorio').not().isEmpty(),
  check('nombreCompleto', 'El nombre completo es obligatorio').not().isEmpty(),
  check('contrasena', 'La contraseña es obligatoria').not().isEmpty(),
  check('rol', 'El rol es obligatorio').isIn(['admin', 'moderador', 'gestor']),
  validarCampos
], createUsuario);

// Actualizar usuario (admin y moderador)
router.put('/:id', [
  check('nombreUsuario', 'El nombre de usuario es obligatorio').not().isEmpty(),
  check('nombreCompleto', 'El nombre completo es obligatorio').not().isEmpty(),
  check('rol', 'El rol es obligatorio').isIn(['admin', 'moderador', 'gestor']),
  validarCampos
], updateUsuario);

// Actualizar rol de usuario (solo admin)
router.put('/:id/rol', [
  check('rol', 'El rol es obligatorio').isIn(['admin', 'moderador', 'gestor']),
  validarCampos
], updateUsuarioRol);

// Eliminar usuario (admin y moderador)
router.delete('/:id', deleteUsuario);

export default router; 