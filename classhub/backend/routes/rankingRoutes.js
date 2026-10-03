const express = require('express');
const router = express.Router();
const { getRanking, upsertRanking, deleteRanking } = require('../controllers/rankingController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', verifyToken, getRanking);
router.post('/', verifyToken, authorize('admin'), upsertRanking);
router.delete('/:id', verifyToken, authorize('admin'), deleteRanking);

module.exports = router;
