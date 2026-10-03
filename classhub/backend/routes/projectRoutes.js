const express = require('express');
const router = express.Router();
const { getAllProjects, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { verifyToken, authorize } = require('../middleware/auth');
const { uploadProject } = require('../middleware/upload');

router.get('/', verifyToken, getAllProjects);
router.post('/', verifyToken, authorize('cr'), uploadProject.single('attachment'), createProject);
router.put('/:id', verifyToken, authorize('cr'), uploadProject.single('attachment'), updateProject);
router.delete('/:id', verifyToken, authorize('cr', 'admin'), deleteProject);

module.exports = router;
