const express = require('express');
const router = express.Router();
const { getAllNotes, uploadNote, deleteNote } = require('../controllers/notesController');
const { verifyToken, authorize } = require('../middleware/auth');
const { uploadNotes } = require('../middleware/upload');

router.get('/', verifyToken, getAllNotes);
router.post('/', verifyToken, authorize('cr'), uploadNotes.single('file'), uploadNote);
router.delete('/:id', verifyToken, authorize('cr', 'admin'), deleteNote);

module.exports = router;
