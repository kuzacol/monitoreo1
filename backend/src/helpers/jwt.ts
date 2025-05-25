import jwt from 'jsonwebtoken';

export const generarJWT = (uid: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const payload = { uid };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'tu_secret_key',
            {
                expiresIn: '24h'
            },
            (err, token) => {
                if (err) {
                    console.error('Error al generar JWT:', err);
                    reject('No se pudo generar el token');
                } else {
                    resolve(token as string);
                }
            }
        );
    });
}; 