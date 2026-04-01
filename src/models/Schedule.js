const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    time: { type: String, required: true }, // "17:00"
    status: {
      type: String,
      enum: ['available', 'booked'],
      default: 'available',
    },
  },
  { _id: false }
);

const scheduleSchema = new mongoose.Schema(
  {
    field: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Field',
      required: true,
    },
    date: { type: String, required: true }, // "2026-02-03"
    slots: [slotSchema],
  },
  { timestamps: true }
);

// unique per field+date
scheduleSchema.index({ field: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
