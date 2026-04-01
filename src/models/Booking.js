const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    booking_code: { type: String, unique: true },
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    field: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Field',
      required: true,
    },
    date: { type: String, required: true },       // "2025-12-03"
    time_from: { type: String, required: true },  // "17:00"
    time_to: { type: String, required: true },    // "18:00"
    players_count: { type: Number, required: true },
    type: { type: String, enum: ['5x5', '7x7', '11x11'], required: true },
    payment_method: {
      type: String,
      enum: ['cash', 'vodafone_cash', 'wallet'],
      required: true,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
    },
    total_price: { type: Number },
    service_fee: { type: Number, default: 10 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
