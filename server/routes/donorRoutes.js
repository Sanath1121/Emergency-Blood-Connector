const express = require('express');
const {
  getDonors,
  getDonorById,
  updateProfile,
  toggleAvailability,
  getMyRespondedRequests,
  getDonationHistory,
  getLeaderboard
} = require('../controllers/donorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const router = express.Router();

router.use(protect);

router.get('/', getDonors);
router.get('/leaderboard', getLeaderboard);
router.put('/profile', authorize('donor'), updateProfile);
router.put('/availability', authorize('donor'), toggleAvailability);
router.get('/my/requests', authorize('donor'), getMyRespondedRequests);
router.get('/my/history', authorize('donor'), getDonationHistory);
router.get('/:id', getDonorById);

module.exports = router;
