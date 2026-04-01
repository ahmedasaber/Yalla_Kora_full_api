const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['player', 'owner'], required: true },
    avatar: { type: String, default: null },

    // player fields
    age: { type: Number },

    // owner fields
    field_name: { type: String },

    // stats (player)
    matches_played: { type: Number, default: 0 },
    favorite_fields: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Field' }],
    splits_joined: { type: Number, default: 0 },

    // notifications
    match_notifications: { type: Boolean, default: true },

    // wallet
    wallet_balance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function (candidate, hashed) {
  return bcrypt.compare(candidate, hashed);
};

module.exports = mongoose.model('User', userSchema);
