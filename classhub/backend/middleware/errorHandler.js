const multer = require('multer');

// 404 handler for unmatched routes
const notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  // Multer file upload errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large.' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }

  // Custom file filter errors
  if (err.message && err.message.includes('files are allowed')) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'Duplicate entry. This record already exists.' });
  }

  // MySQL foreign key constraint
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(400).json({ success: false, message: 'Invalid reference. Related record not found.' });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { notFound, errorHandler };
