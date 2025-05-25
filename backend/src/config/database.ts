import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'monitoreo_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Log de configuración
console.log('Configuración de base de datos:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  // No mostrar la contraseña por seguridad
});

const pool = createPool(dbConfig);

// Verificar la conexión y la existencia de la base de datos
pool.getConnection()
  .then(async connection => {
    console.log('✅ Conexión a la base de datos establecida correctamente');
    
    try {
      // Verificar si la base de datos existe
      await connection.query('USE monitoreo_db');
      console.log('✅ Base de datos monitoreo_db seleccionada correctamente');
      
      // Verificar si la tabla usuarios existe
      const [tables]: any = await connection.query('SHOW TABLES');
      console.log('Tablas en la base de datos:', tables);
      
    } catch (error) {
      console.error('❌ Error verificando la base de datos:', error);
    } finally {
      connection.release();
    }
  })
  .catch(error => {
    console.error('❌ Error al conectar con la base de datos:', error.message);
  });

export default pool; 