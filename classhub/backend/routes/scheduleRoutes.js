const express = require('express');
const router = express.Router();
const {
  getTodaySchedule, getWeeklySchedule, addScheduleEntry, updateScheduleEntry, deleteScheduleEntry
} = require('../controllers/scheduleController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/today', getTodaySchedule);       // public - shown on home page
router.get('/weekly', verifyToken, getWeeklySchedule);

router.post('/', verifyToken, authorize('cr', 'admin'), addScheduleEntry);
router.put('/:id', verifyToken, authorize('cr', 'admin'), updateScheduleEntry);
router.delete('/:id', verifyToken, authorize('cr', 'admin'), deleteScheduleEntry);

module.exports = router;
