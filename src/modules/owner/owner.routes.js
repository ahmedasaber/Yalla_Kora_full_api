const router = require('express').Router();
const controller = require('./owner.controller');
const { protect, restrictTo } = require('../../middleware/auth');

router.use(protect);
router.use(restrictTo('owner'));

router.get('/fields/:field_id/bookings', controller.getFieldBookings);
router.get('/fields/:field_id/dashboard', controller.getFieldDashboard);

module.exports = router;
