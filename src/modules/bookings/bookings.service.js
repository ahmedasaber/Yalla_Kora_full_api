const Booking = require('../../models/Booking');
const Field = require('../../models/Field');
const Schedule = require('../../models/Schedule');
const User = require('../../models/User');
const { generateBookingCode } = require('../../utils/helpers');
const fieldsService = require('../fields/fields.service');

const SERVICE_FEE = Number(process.env.SERVICE_FEE) || 10;

const createBooking = async (playerId, body) => {
  const { field_id, date, time_from, time_to, players_count, type, payment_method } = body;

  // 1. Get field
  const field = await Field.findById(field_id);
  if (!field || !field.is_active) {
    throw { statusCode: 404, message: 'الملعب غير موجود' };
  }

  // 2. Ensure schedule exists for this date
  const schedule = await fieldsService.ensureSchedule(field, date);

  // 3. Collect requested slots (each slot = 1 hour)
  const requestedTimes = [];
  const [fromH] = time_from.split(':').map(Number);
  const [toH] = time_to.split(':').map(Number);
  for (let h = fromH; h < toH; h++) {
    requestedTimes.push(`${String(h).padStart(2, '0')}:00`);
  }

  // 4. Check all requested slots are available
  for (const t of requestedTimes) {
    const slot = schedule.slots.find((s) => s.time === t);
    if (!slot) throw { statusCode: 400, message: `الوقت ${t} غير موجود في جدول الملعب` };
    if (slot.status === 'booked') {
      throw { statusCode: 409, message: `الوقت ${t} محجوز بالفعل` };
    }
  }

  // 5. Handle wallet payment
  if (payment_method === 'wallet') {
    const player = await User.findById(playerId);
    const hours = toH - fromH;
    const total = field.price_per_hour * hours + SERVICE_FEE;
    if (player.wallet_balance < total) {
      throw { statusCode: 400, message: 'رصيد المحفظة غير كافٍ' };
    }
    player.wallet_balance -= total;
    await player.save();
  }

  // 6. Mark slots as booked
  schedule.slots = schedule.slots.map((s) => {
    if (requestedTimes.includes(s.time)) return { ...s, status: 'booked' };
    return s;
  });
  await schedule.save();

  // 7. Calculate price
  const hours = toH - fromH;
  const total_price = field.price_per_hour * hours + SERVICE_FEE;

  // 8. Create booking
  const booking = await Booking.create({
    booking_code: generateBookingCode(),
    player: playerId,
    field: field_id,
    date,
    time_from,
    time_to,
    players_count,
    type,
    payment_method,
    total_price,
    service_fee: SERVICE_FEE,
  });

  return booking.populate('field', 'name location');
};

const getMyBookings = async (playerId, type) => {
  const today = new Date().toISOString().split('T')[0];
  let filter = { player: playerId };

  if (type === 'upcoming') {
    filter.date = { $gte: today };
    filter.status = 'confirmed';
  } else if (type === 'past') {
    filter.$or = [{ date: { $lt: today } }, { status: 'cancelled' }];
  }

  const bookings = await Booking.find(filter)
    .populate('field', 'name location images type')
    .sort('-date');

  return bookings;
};

const getBookingDetails = async (bookingId, playerId) => {
  const booking = await Booking.findOne({ _id: bookingId, player: playerId })
    .populate('field', 'name location images price_per_hour');
  if (!booking) throw { statusCode: 404, message: 'الحجز غير موجود' };
  return booking;
};

const cancelBooking = async (bookingId, playerId) => {
  const booking = await Booking.findOne({ _id: bookingId, player: playerId });
  if (!booking) throw { statusCode: 404, message: 'الحجز غير موجود' };
  if (booking.status === 'cancelled') {
    throw { statusCode: 400, message: 'الحجز ملغي بالفعل' };
  }

  booking.status = 'cancelled';
  await booking.save();

  // Free up the slots
  const schedule = await Schedule.findOne({ field: booking.field, date: booking.date });
  if (schedule) {
    const [fromH] = booking.time_from.split(':').map(Number);
    const [toH] = booking.time_to.split(':').map(Number);
    const cancelledTimes = [];
    for (let h = fromH; h < toH; h++) {
      cancelledTimes.push(`${String(h).padStart(2, '0')}:00`);
    }
    schedule.slots = schedule.slots.map((s) => {
      if (cancelledTimes.includes(s.time)) return { ...s, status: 'available' };
      return s;
    });
    await schedule.save();
  }

  // Refund wallet if paid by wallet
  if (booking.payment_method === 'wallet') {
    await User.findByIdAndUpdate(playerId, {
      $inc: { wallet_balance: booking.total_price },
    });
  }

  return booking;
};

module.exports = { createBooking, getMyBookings, getBookingDetails, cancelBooking };
