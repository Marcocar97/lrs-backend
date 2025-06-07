const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { name, position, phone, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'El correo ya está registrado.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, position, phone, email, password: hashedPassword });

    res.status(201).json({ message: 'Usuario registrado correctamente.' });
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Contraseña incorrecta.' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { name: user.name, position: user.position, phone: user.phone, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

// Ruta protegida (ejemplo)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

    res.json({
      name: user.name,
      position: user.position,
      phone: user.phone,
      email: user.email
    });
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

module.exports = router;
