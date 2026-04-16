const express = require('express');
const router = express.Router();
const { getRooms, getRoom, createRoom, updateRoom, deleteRoom } = require('../controllers/roomController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.get('/', protect, getRooms);
router.get('/:id', protect, getRoom);
router.post('/', protect, authorize('admin', 'recepcao'), createRoom);
router.put('/:id', protect, authorize('admin', 'recepcao'), updateRoom);
router.delete('/:id', protect, authorize('admin'), deleteRoom);

module.exports = router;