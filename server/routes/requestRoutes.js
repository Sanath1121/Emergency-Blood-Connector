const express = require('express');
const {
  createRequest,
  getRequests,
  getRequestById,
  respondToRequest,
  confirmDonor,
  fulfillRequest,
  cancelRequest,
  markNoShow,
  triggerSOS,
  coordinateRequest
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const router = express.Router();

router.use(protect);

router.post('/', authorize('requester', 'hospital'), createRequest);
router.get('/', getRequests);
router.get('/:id', getRequestById);
router.put('/:id/respond', authorize('donor'), respondToRequest);
router.put('/:id/confirm/:donorId', authorize('requester', 'hospital'), confirmDonor);
router.put('/:id/fulfill', authorize('requester', 'hospital', 'admin'), fulfillRequest);
router.put('/:id/cancel', cancelRequest);
router.put('/:id/noshow/:donorId', authorize('requester', 'hospital', 'admin'), markNoShow);
router.post('/:id/sos', authorize('admin', 'hospital'), triggerSOS);
router.put('/:id/coordinate', authorize('donor'), coordinateRequest);

module.exports = router;
