require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// ==========================================================
// GLOBAL MIDDLEWARE
// ==========================================================
app.use(helmet({ crossOriginResourcePolicy: false })); // allow serving uploaded files cross-origin
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Serve uploaded files statically (notes, assignments, projects, profile images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================================
// API ROUTES
// ==========================================================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/cr', require('./routes/crRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/schedule', require('./routes/scheduleRoutes'));
app.use('/api/notes', require('./routes/notesRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/ranking', require('./routes/rankingRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'ClassHub API is running', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Welcome to ClassHub API. See /api/health for status.' });
});

// ==========================================================
// ERROR HANDLING (must be last)
// ==========================================================
app.use(notFound);
app.use(errorHandler);

// ==========================================================
// START SERVER
// ==========================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════════════╗
  ║   🎓  ClassHub API Server                             ║
  ║   Running on: http://localhost:${PORT}                   ║
  ║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(38)}║
  ╚══════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
