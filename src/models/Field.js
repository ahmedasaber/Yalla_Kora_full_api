const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true },
    price_per_hour: { type: Number, required: true },
    type: { type: String, enum: ['5x5', '7x7', '11x11'], required: true },
    open_time: { type: String, required: true },   // "09:00"
    close_time: { type: String, required: true },  // "23:00"
    features: [{ type: String }],
    images: [{ type: String }],
    is_active: { type: Boolean, default: true },

    // computed avg rating
    rating_avg: { type: Number, default: 0 },
    rating_count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// text index for search
fieldSchema.index({ name: 'text', location: 'text' });

module.exports = mongoose.model('Field', fieldSchema);
