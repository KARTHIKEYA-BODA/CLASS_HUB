const express = require('express');
const router = express.Router();
const { getAllNotices, createNotice, updateNotice, deleteNotice } = require('../controllers/noticeController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', getAllNotices); // public - shown on home page
router.post('/', verifyToken, authorize('admin', 'cr'), createNotice);
router.put('/:id', verifyToken, authorize('admin', 'cr'), updateNotice);
router.delete('/:id', verifyToken, authorize('admin', 'cr'), deleteNotice);

module.exports = router;
