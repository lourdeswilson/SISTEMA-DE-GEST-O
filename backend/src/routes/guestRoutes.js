const express = require('express');
const router = express.Router();
const { getGuests, createGuest, checkIn, checkOut, updateGuest } = require('../controllers/guestController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.get('/', protect, authorize('admin', 'recepcao', 'rh'), getGuests);
router.post('/', protect, authorize('admin', 'recepcao'), createGuest);
router.put('/:id/checkin', protect, authorize('admin', 'recepcao'), checkIn);
router.put('/:id/checkout', protect, authorize('admin', 'recepcao'), checkOut);
router.put('/:id', protect, authorize('admin', 'recepcao'), updateGuest);

module.exports = router;