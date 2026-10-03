const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const dirs = ['uploads/notes', 'uploads/assignments', 'uploads/projects', 'uploads/profile'];
dirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

const storage = (subfolder) => multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', subfolder));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const safeName = file.fieldname + '-' + uniqueSuffix + ext;
    cb(null, safeName);
  }
});

const fileFilter = (allowedTypes) => (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Only ${allowedTypes.join(', ')} files are allowed`), false);
  }
};

const uploadNotes = multer({
  storage: storage('notes'),
  fileFilter: fileFilter(['.pdf', '.jpg', '.jpeg', '.png']),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const uploadAssignment = multer({
  storage: storage('assignments'),
  fileFilter: fileFilter(['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.zip']),
  limits: { fileSize: 15 * 1024 * 1024 }
});

const uploadProject = multer({
  storage: storage('projects'),
  fileFilter: fileFilter(['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.zip']),
  limits: { fileSize: 15 * 1024 * 1024 }
});

const uploadProfile = multer({
  storage: storage('profile'),
  fileFilter: fileFilter(['.jpg', '.jpeg', '.png']),
  limits: { fileSize: 3 * 1024 * 1024 }
});

module.exports = { uploadNotes, uploadAssignment, uploadProject, uploadProfile };
