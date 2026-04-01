const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
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
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

// one rating per player per field
ratingSchema.index({ player: 1, field: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
