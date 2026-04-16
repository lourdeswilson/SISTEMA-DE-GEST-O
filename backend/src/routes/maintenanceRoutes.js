const express = require('express');
const router = express.Router();
const { getMaintenanceRequests, createMaintenanceRequest, updateMaintenanceStatus } = require('../controllers/maintenanceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.get('/', protect, authorize('admin', 'recepcao', 'manutencao'), getMaintenanceRequests);
router.post('/', protect, authorize('admin', 'recepcao'), createMaintenanceRequest);
router.put('/:id/status', protect, authorize('admin', 'manutencao'), updateMaintenanceStatus);

module.exports = router;