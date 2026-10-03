const express = require('express');
const router = express.Router();
const {
  markAttendance, getAttendanceBySession, getStudentAttendanceHistory,
  getMyAttendancePercentage, uploadAttendancePercentage, getAllAttendancePercentages
} = require('../controllers/attendanceController');
const { verifyToken, authorize } = require('../middleware/auth');

// CR only: take/edit attendance twice daily
router.post('/mark', verifyToken, authorize('cr'), markAttendance);
router.get('/session', verifyToken, authorize('cr'), getAttendanceBySession);
router.get('/history/:studentId', verifyToken, authorize('cr', 'admin'), getStudentAttendanceHistory);

// Student: view own percentage (uploaded by Admin)
router.get('/my-percentage', verifyToken, authorize('student'), getMyAttendancePercentage);

// Admin only: upload percentages
router.post('/percentage', verifyToken, authorize('admin'), uploadAttendancePercentage);
router.get('/percentage/all', verifyToken, authorize('admin'), getAllAttendancePercentages);

module.exports = router;
