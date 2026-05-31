const express = require('express');
const {
  getUsers,
  verifyDonor,
  toggleSuspendUser,
  getStats,
  getAllRequests
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/users', getUsers);
router.put('/users/:id/verify', verifyDonor);
router.put('/users/:id/suspend', toggleSuspendUser);
router.get('/stats', getStats);
router.get('/requests', getAllRequests);

module.exports = router;
