const express = require('express');
const router = express.Router();
const { getPayments, createPayment, registerPayment, markAsDebt } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.get('/', protect, authorize('admin', 'recepcao'), getPayments);
router.post('/', protect, authorize('admin', 'recepcao'), createPayment);
router.put('/:id/pagar', protect, authorize('admin', 'recepcao'), registerPayment);
router.put('/:id/divida', protect, authorize('admin', 'recepcao'), markAsDebt);

module.exports = router;