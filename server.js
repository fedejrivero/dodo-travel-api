const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import routes
const tripRoutes = require('./routes/tripRoutes');
const rateRoutes = require('./routes/rateRoutes');
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const passengerRoutes = require('./routes/passengerRoutes');
const operatorRoutes = require('./routes/operatorRoutes');
const fileRoutes = require('./routes/fileRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const depositRoutes = require('./routes/depositRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const { uploadSingle, getFileUrl, cleanupUploadedFiles } = require('./utils/fileUpload');

// Initialize express
const app = express();

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  process.env.FRONTEND_ADMIN_URL,
  'http://localhost:3001'
];

app.use(cors({
  origin: function(origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'El origen CORS no está permitido.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/api/trips', tripRoutes);
app.use('/api/rates', rateRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/passengers', passengerRoutes);
app.use('/api/operators', operatorRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/expenses', expenseRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Image upload endpoint
app.post('/api/upload', uploadSingle('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
    }
    
    const fileUrl = getFileUrl(req.file.filename);
    res.status(200).json({ 
      success: true, 
      imageUrl: fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
});

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
