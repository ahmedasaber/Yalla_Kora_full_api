const Rating = require('../../models/Rating');
const Field = require('../../models/Field');
const Booking = require('../../models/Booking');

const rateField = async (playerId, fieldId, { rating, comment }) => {
  // Only players who booked the field can rate
  const hasBooked = await Booking.findOne({
    player: playerId,
    field: fieldId,
    status: { $in: ['confirmed', 'completed'] },
  });
  if (!hasBooked) {
    throw { statusCode: 403, message: 'يجب أن تحجز الملعب أولاً قبل التقييم' };
  }

  // Upsert rating (update if already rated)
  const existingRating = await Rating.findOne({ player: playerId, field: fieldId });

  let doc;
  if (existingRating) {
    existingRating.rating = rating;
    if (comment !== undefined) existingRating.comment = comment;
    doc = await existingRating.save();
  } else {
    doc = await Rating.create({ player: playerId, field: fieldId, rating, comment });
  }

  // Recalculate field avg rating
  const stats = await Rating.aggregate([
    { $match: { field: doc.field } },
    { $group: { _id: '$field', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await Field.findByIdAndUpdate(fieldId, {
      rating_avg: Math.round(stats[0].avg * 10) / 10,
      rating_count: stats[0].count,
    });
  }

  return doc;
};

module.exports = { rateField };
