const Booking = require('../../models/Booking');
const Field = require('../../models/Field');
const Schedule = require('../../models/Schedule');
const { generateTimeSlots } = require('../../utils/helpers');

// Verify field belongs to owner
const verifyOwner = async (fieldId, ownerId) => {
  const field = await Field.findOne({ _id: fieldId, owner: ownerId });
  if (!field) throw { statusCode: 403, message: 'هذا الملعب لا ينتمي إليك' };
  return field;
};

const getFieldBookings = async (fieldId, ownerId, query) => {
  await verifyOwner(fieldId, ownerId);

  const filter = { field: fieldId };
  if (query.date) filter.date = query.date;
  if (query.status) filter.status = query.status;

  const bookings = await Booking.find(filter)
    .populate('player', 'name phone avatar')
    .sort('-date -time_from');

  return bookings;
};

const getFieldDashboard = async (fieldId, ownerId, date) => {
  const field = await verifyOwner(fieldId, ownerId);

  if (!date) throw { statusCode: 400, message: 'التاريخ مطلوب' };

  // Get or generate schedule
  let schedule = await Schedule.findOne({ field: fieldId, date });
  if (!schedule) {
    const slots = generateTimeSlots(field.open_time, field.close_time);
    schedule = { date, slots };
  }

  // Enrich with booking info
  const bookings = await Booking.find({
    field: fieldId,
    date,
    status: { $ne: 'cancelled' },
  }).populate('player', 'name phone');

  const enrichedSlots = schedule.slots.map((slot) => {
    const booking = bookings.find(
      (b) =>
        b.time_from <= slot.time && slot.time < b.time_to
    );
    return {
      time: slot.time,
      status: slot.status,
      booking: booking
        ? {
            id: booking._id,
            booking_code: booking.booking_code,
            player: booking.player,
            time_from: booking.time_from,
            time_to: booking.time_to,
            total_price: booking.total_price,
          }
        : null,
    };
  });

  // Summary stats
  const totalSlots = schedule.slots.length;
  const bookedSlots = schedule.slots.filter((s) => s.status === 'booked').length;
  const revenue = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0);

  return {
    date,
    field: { id: field._id, name: field.name },
    summary: {
      total_slots: totalSlots,
      booked_slots: bookedSlots,
      available_slots: totalSlots - bookedSlots,
      revenue_today: revenue,
    },
    slots: enrichedSlots,
  };
};

module.exports = { getFieldBookings, getFieldDashboard };
