const express = require('express');
const router = express.Router();
const { getContact, updateContact } = require('../controllers/contactController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', getContact); // public
router.put('/', verifyToken, authorize('admin'), updateContact);

module.exports = router;
