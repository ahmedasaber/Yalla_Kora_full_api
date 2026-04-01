const Joi = require('joi');

const createBookingSchema = Joi.object({
  field_id: Joi.string().required(),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  time_from: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  time_to: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  players_count: Joi.number().min(1).required(),
  type: Joi.string().valid('5x5', '7x7', '11x11').required(),
  payment_method: Joi.string().valid('cash', 'vodafone_cash', 'wallet').required(),
});

module.exports = { createBookingSchema };
