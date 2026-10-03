const express = require('express');
const router = express.Router();
const { submitFeedback, getAllFeedback, markFeedbackRead, getMyFeedback } = require('../controllers/feedbackController');
const { verifyToken, authorize } = require('../middleware/auth');

router.post('/', verifyToken, authorize('student'), submitFeedback);
router.get('/my', verifyToken, authorize('student'), getMyFeedback);
router.get('/', verifyToken, authorize('admin'), getAllFeedback);       // ONLY Admin can view all feedback
router.put('/:id/read', verifyToken, authorize('admin'), markFeedbackRead);

module.exports = router;
