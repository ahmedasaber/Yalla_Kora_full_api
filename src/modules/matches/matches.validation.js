const Joi = require('joi');

const createMatchSchema = Joi.object({
  field_id: Joi.string().required(),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  time: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  players_needed: Joi.number().min(2).max(22).required(),
  price_per_player: Joi.number().min(0).required(),
});

module.exports = { createMatchSchema };
