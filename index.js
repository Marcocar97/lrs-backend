// index.js
require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./config/db');

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // Crea las tablas si no existen
    console.log('✅ Conectado a la base de datos MySQL');
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  } catch (err) {
    console.error('❌ Error al iniciar:', err);
  }
});
