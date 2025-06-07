require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./config/db');
const authRoutes = require('./routes/auth');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);

app.get('/', (req, res) => {
  res.send('✅ LRS Backend está funcionando');
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // Crea la tabla si no existe
    console.log('✅ Conectado a la base de datos MySQL');
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  } catch (err) {
    console.error('❌ Error al iniciar:', err);
  }
});
