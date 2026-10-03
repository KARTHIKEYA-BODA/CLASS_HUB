const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { registerStudent, loginStudent, loginCR, loginAdmin, getMe } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('roll_number').trim().notEmpty().withMessage('Roll Number is required'),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('phone').trim().matches(/^[0-9]{10}$/).withMessage('Phone number must be exactly 10 digits'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

router.post('/student/register', registerValidation, registerStudent);
router.post('/student/login', loginStudent);
router.post('/cr/login', loginCR);
router.post('/admin/login', loginAdmin);
router.get('/me', verifyToken, getMe);

module.exports = router;
