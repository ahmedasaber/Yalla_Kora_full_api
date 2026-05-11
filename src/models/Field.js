const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema(
  { id: { type: String, required: true }, name: { type: String, required: true } },
  { _id: false }
);

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },       // "مدينة نصر"
    address: { type: String, required: true },    // "القاهرة - النزهة"
    lat: { type: Number },
    lng: { type: Number },
    // 
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number],
    },
  },
  { _id: false }
);

const fieldSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    location: { type: locationSchema, required: true },
    price_per_hour: { type: Number, required: true },
    type: { type: String, enum: ['5x5', '7x7', '11x11'], required: true },
    open_time: { type: String, required: true },
    close_time: { type: String, required: true },
    is24Hours: { type: Boolean, default: false },
    features: [featureSchema],
    images: [{ type: String }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    rating_avg: { type: Number, default: 0 },
    rating_count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

fieldSchema.index({ 'location.coordinates': '2dsphere' });
// text index for search
fieldSchema.index({ name: 'text', 'location.name': 'text' });

module.exports = mongoose.model('Field', fieldSchema);
