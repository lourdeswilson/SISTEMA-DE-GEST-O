const express = require('express');
const router = express.Router();
const { getCleaningRequests, createCleaningRequest, updateCleaningStatus } = require('../controllers/cleaningController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.get('/', protect, authorize('admin', 'recepcao', 'limpeza'), getCleaningRequests);
router.post('/', protect, authorize('admin', 'recepcao'), createCleaningRequest);
router.put('/:id/status', protect, authorize('admin', 'limpeza'), updateCleaningStatus);

module.exports = router;