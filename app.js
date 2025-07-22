// app.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const path = require('path');

const app = express();

app.use(cors({
  origin: 'https://liquidwaterproofingacademy.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Rutas
app.use('/api', authRoutes);
app.use('/api', uploadRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('✅ LRS Backend está funcionando');
});

module.exports = app;
