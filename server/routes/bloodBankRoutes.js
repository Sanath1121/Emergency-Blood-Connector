const express = require('express');
const {
  getBloodBanks,
  getBloodBankById,
  createBloodBank,
  updateBloodBank,
  deleteBloodBank
} = require('../controllers/bloodBankController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const router = express.Router();

router.get('/', getBloodBanks);
router.get('/:id', getBloodBankById);

// Admin operations
router.post('/', protect, authorize('admin'), createBloodBank);
router.put('/:id', protect, authorize('admin'), updateBloodBank);
router.delete('/:id', protect, authorize('admin'), deleteBloodBank);

module.exports = router;
