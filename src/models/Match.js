const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    field: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Field',
      required: true,
    },
    date: { type: String, required: true },
    time: { type: String, required: true },
    players_needed: { type: Number, required: true },
    price_per_player: { type: Number, required: true },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: {
      type: String,
      enum: ['open', 'full', 'cancelled'],
      default: 'open',
    },
  },
  { timestamps: true }
);

// virtual: spots left
matchSchema.virtual('spots_left').get(function () {
  return this.players_needed - this.players.length;
});

matchSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Match', matchSchema);
