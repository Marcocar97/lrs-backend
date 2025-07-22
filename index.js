require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./config/db');
const authRoutes = require('./routes/auth');
const User = require('./models/User');

const app = express(); 

const allowedOrigins = ['https://liquidwaterproofingacademy.com', 'http://localhost:3000'];



/* Updated*/

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));


app.use('/api', authRoutes);

app.get('/', (req, res) => {
  res.send('✅ LRS Backend está funcionando');
});

const PORT = process.env.PORT || 3001;

const uploadRoutes = require('./routes/upload');

app.use('/uploads', express.static('uploads'));
app.use('/api', uploadRoutes); // después del authRoutes si quieres


app.listen(PORT, '0.0.0.0', async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // Crea la tabla si no existe
    console.log('✅ Conectado a la base de datos MySQL');
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  } catch (err) {
    console.error('❌ Error al iniciar:', err);
  }
});
