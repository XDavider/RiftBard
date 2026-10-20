import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config'; // Esto busca el archivo .env automáticamente en la carpeta donde se ejecuta el proceso

if (!process.env.DATABASE_URL) {
  console.warn('⚠️ [RiftBard] DATABASE_URL no está configurada en .env. Configura tus credenciales de Supabase o PostgreSQL.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Permite conexiones seguras SSL con Supabase
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err.message || err);
});

export default pool;