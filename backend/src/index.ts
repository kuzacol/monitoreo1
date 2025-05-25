import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import programadasRoutes from './routes/programadas.routes';
import usuariosRoutes from './routes/usuarios.routes';

// Cargar variables de entorno
dotenv.config();

const app = express();

// Configuración de CORS
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));

// Middlewares
app.use(express.json());

// Middleware de logging detallado
app.use((req, res, next) => {
  const start = Date.now();
  
  console.log('\n🔄 Nueva Petición:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    body: req.body,
    query: req.query,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent']
    }
  });

  // Interceptar la respuesta
  const oldSend = res.send;
  res.send = function(data) {
    console.log('📤 Respuesta:', {
      statusCode: res.statusCode,
      body: data,
      tiempoRespuesta: `${Date.now() - start}ms`
    });
    return oldSend.apply(res, arguments);
  };

  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/programadas', programadasRoutes);
app.use('/api/usuarios', usuariosRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor iniciado en puerto ${PORT}`);
  console.log('🔧 Configuración:', {
    nodeEnv: process.env.NODE_ENV,
    dbHost: process.env.DB_HOST,
    dbName: process.env.DB_NAME,
    corsOrigin: 'http://localhost:3000'
  });
}); 