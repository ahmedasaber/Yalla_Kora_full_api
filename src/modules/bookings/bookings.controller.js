const bookingsService = require('./bookings.service');
const { success } = require('../../utils/response');

const createBooking = async (req, res, next) => {
  try {
    const booking = await bookingsService.createBooking(req.user._id, req.body);
    return success(res, { booking }, 'تم تأكيد الحجز بنجاح', 201);
  } catch (err) {
    next(err);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const { type } = req.query; // upcoming | past
    const bookings = await bookingsService.getMyBookings(req.user._id, type);
    return success(res, { count: bookings.length, bookings });
  } catch (err) {
    next(err);
  }
};

const getBookingDetails = async (req, res, next) => {
  try {
    const booking = await bookingsService.getBookingDetails(
      req.params.booking_id,
      req.user._id
    );
    return success(res, { booking });
  } catch (err) {
    next(err);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    await bookingsService.cancelBooking(req.params.booking_id, req.user._id);
    return success(res, {}, 'تم إلغاء الحجز بنجاح');
  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking, getMyBookings, getBookingDetails, cancelBooking };
