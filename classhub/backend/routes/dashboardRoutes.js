const express = require('express');
const router = express.Router();
const { getAdminStats, getCRStats } = require('../controllers/dashboardController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/admin-stats', verifyToken, authorize('admin'), getAdminStats);
router.get('/cr-stats', verifyToken, authorize('cr'), getCRStats);

module.exports = router;
