const express = require('express');
const multer = require('multer');
const {
  getServiceDocuments,
  uploadServiceDocument,
  openServiceDocument,
  deleteServiceDocument
} = require('../controllers/serviceDocumentController');

const router = express.Router();
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const allowedTypes = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (allowedTypes.has(file.mimetype)) return callback(null, true);
    return callback(new Error('Solo se permiten archivos PDF o imágenes JPG, PNG, WebP y GIF'));
  }
});

const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (!error) return next();
    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'El archivo supera el máximo de 10 MB'
      : error.message;
    return res.status(400).json({ success: false, error: message });
  });
};

router.get('/:id/documents', getServiceDocuments);
router.post('/:id/documents/:type', handleUpload, uploadServiceDocument);
router.get('/:id/documents/:type', openServiceDocument);
router.delete('/:id/documents/:type', deleteServiceDocument);

module.exports = router;
