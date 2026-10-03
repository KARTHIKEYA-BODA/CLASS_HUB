const express = require('express');
const router = express.Router();
const {
  getProfile, updateProfile, updateClassStrength,
  getAllCRs, createCR, updateCRByAdmin, deleteCR
} = require('../controllers/crController');
const { verifyToken, authorize } = require('../middleware/auth');
const { uploadProfile } = require('../middleware/upload');

// CR: own profile & class strength
router.get('/profile', verifyToken, authorize('cr'), getProfile);
router.put('/profile', verifyToken, authorize('cr'), uploadProfile.single('profile_image'), updateProfile);
router.put('/class-strength', verifyToken, authorize('cr'), updateClassStrength);

// Admin: manage all CRs
router.get('/', verifyToken, authorize('admin'), getAllCRs);
router.post('/', verifyToken, authorize('admin'), createCR);
router.put('/:id', verifyToken, authorize('admin'), updateCRByAdmin);
router.delete('/:id', verifyToken, authorize('admin'), deleteCR);

module.exports = router;
