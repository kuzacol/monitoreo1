import { Router } from 'express';
import { check } from 'express-validator';
import { login } from '../controllers/auth.controller';
import { validarCampos } from '../middlewares/validar-campos';

const router = Router();

// Login
router.post('/login', [
    check(['nombreUsuario', 'username'], 'El nombre de usuario es obligatorio')
        .optional({ checkFalsy: true })
        .custom((value, { req }) => {
            if (!req.body.nombreUsuario && !req.body.username) {
                throw new Error('El nombre de usuario es obligatorio');
            }
            return true;
        }),
    check(['contrasena', 'password'], 'La contraseña es obligatoria')
        .optional({ checkFalsy: true })
        .custom((value, { req }) => {
            if (!req.body.contrasena && !req.body.password) {
                throw new Error('La contraseña es obligatoria');
            }
            return true;
        }),
    validarCampos
], login);

export default router; 