const express = require('express');
const router = express.Router();
const {
  getProfile, updateProfile, getAllStudents, getStudentById,
  createStudent, updateStudentByAdmin, deleteStudent
} = require('../controllers/studentController');
const { verifyToken, authorize } = require('../middleware/auth');
const { uploadProfile } = require('../middleware/upload');

// Student: own profile
router.get('/profile', verifyToken, authorize('student'), getProfile);
router.put('/profile', verifyToken, authorize('student'), uploadProfile.single('profile_image'), updateProfile);

// Admin: manage all students
router.get('/', verifyToken, authorize('admin', 'cr'), getAllStudents); // CR needs list for attendance
router.get('/:id', verifyToken, authorize('admin'), getStudentById);
router.post('/', verifyToken, authorize('admin'), createStudent);
router.put('/:id', verifyToken, authorize('admin'), updateStudentByAdmin);
router.delete('/:id', verifyToken, authorize('admin'), deleteStudent);

module.exports = router;
