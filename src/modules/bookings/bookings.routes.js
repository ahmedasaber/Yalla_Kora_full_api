const router = require('express').Router();
const controller = require('./bookings.controller');
const { protect, restrictTo } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { createBookingSchema } = require('./bookings.validation');

router.use(protect);
router.use(restrictTo('player'));

router.post('/', validate(createBookingSchema), controller.createBooking);
router.get('/', controller.getMyBookings);
router.get('/:booking_id', controller.getBookingDetails);
router.delete('/:booking_id', controller.cancelBooking);

module.exports = router;
