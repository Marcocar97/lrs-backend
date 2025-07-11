const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Crear carpeta si no existe
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Configurar multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Ruta para subir PDF
router.post('/upload', upload.single('file'), (req, res) => {
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl });
});

// Listar archivos subidos
router.get('/list', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
      if (err) return res.status(500).json({ error: 'Error al leer archivos.' });
  
      const fileUrls = files.map(filename => {
        return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
      });
  
      res.json({ files: fileUrls });
    });
  });
  

module.exports = router;
