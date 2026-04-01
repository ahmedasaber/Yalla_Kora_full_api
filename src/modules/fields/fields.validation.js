const Joi = require('joi');

const createFieldSchema = Joi.object({
  name: Joi.string().min(2).required(),
  location: Joi.string().required(),
  price_per_hour: Joi.number().min(1).required(),
  type: Joi.string().valid('5x5', '7x7', '11x11').required(),
  open_time: Joi.string()
    .pattern(/^\d{2}:\d{2}$/)
    .required(),
  close_time: Joi.string()
    .pattern(/^\d{2}:\d{2}$/)
    .required(),
  features: Joi.array().items(Joi.string()).default([]),
});

const updateFieldSchema = Joi.object({
  name: Joi.string().min(2),
  location: Joi.string(),
  price_per_hour: Joi.number().min(1),
  type: Joi.string().valid('5x5', '7x7', '11x11'),
  open_time: Joi.string().pattern(/^\d{2}:\d{2}$/),
  close_time: Joi.string().pattern(/^\d{2}:\d{2}$/),
  features: Joi.array().items(Joi.string()),
  is_active: Joi.boolean(),
});

const scheduleSchema = Joi.object({
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
  slots: Joi.array()
    .items(
      Joi.object({
        time: Joi.string()
          .pattern(/^\d{2}:\d{2}$/)
          .required(),
        status: Joi.string().valid('available', 'booked').required(),
      })
    )
    .required(),
});

module.exports = { createFieldSchema, updateFieldSchema, scheduleSchema };
