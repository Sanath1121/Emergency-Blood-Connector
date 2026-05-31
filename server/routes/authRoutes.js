const express = require('express');
const { register, login, googleSignin, changePassword, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleSignin);
router.put('/change-password', protect, changePassword);
router.get('/me', protect, getMe);

module.exports = router;
