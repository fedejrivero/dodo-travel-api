const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'trip-' + uniqueSuffix + ext);
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /^image\/(jpe?g|png|webp)$/;
  
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (filetypes.test(extname) && mimetypes.test(mimetype)) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (JPEG, PNG, WebP)'));
  }
};

// Initialize upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Middleware to handle single file upload
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, function (err) {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            error: 'El archivo es demasiado grande. Tamaño máximo: 5MB' 
          });
        }
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  };
};

// Helper to get the full URL for a file
const getFileUrl = (filename) => {
  if (!filename) return null;
  // In production, you would use your actual domain
  const baseUrl = process.env.BASE_URL || 'http://localhost:5001';
  return `${baseUrl}/uploads/${filename}`;
};

// Middleware to clean up uploaded files on error
const cleanupUploadedFiles = (req, res, next) => {
  // If there's an error response and a file was uploaded, delete it
  if (res.statusCode >= 400 && req.file) {
    const filePath = path.join(uploadDir, req.file.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
  next();
};

module.exports = {
  uploadSingle,
  getFileUrl,
  cleanupUploadedFiles
};
