const express = require('express');
const router = express.Router();
const { getAllAssignments, createAssignment, updateAssignment, deleteAssignment } = require('../controllers/assignmentController');
const { verifyToken, authorize } = require('../middleware/auth');
const { uploadAssignment } = require('../middleware/upload');

router.get('/', verifyToken, getAllAssignments);
router.post('/', verifyToken, authorize('cr'), uploadAssignment.single('attachment'), createAssignment);
router.put('/:id', verifyToken, authorize('cr'), uploadAssignment.single('attachment'), updateAssignment);
router.delete('/:id', verifyToken, authorize('cr', 'admin'), deleteAssignment);

module.exports = router;
