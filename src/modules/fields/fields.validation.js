const Joi = require('joi');

const locationSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  lat: Joi.number(),
  lng: Joi.number(),
});

const featureSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
});

const createFieldSchema = Joi.object({
  name: Joi.string().min(2).required(),
  location: locationSchema.required(),
  price_per_hour: Joi.number().min(1).required(),
  type: Joi.string().valid('5x5', '7x7', '11x11').required(),
  open_time: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  close_time: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  is24Hours: Joi.boolean().default(false),
  features: Joi.array().items(featureSchema).default([]),
});

const updateFieldSchema = Joi.object({
  name: Joi.string().min(2),
  location: locationSchema,
  price_per_hour: Joi.number().min(1),
  type: Joi.string().valid('5x5', '7x7', '11x11'),
  open_time: Joi.string().pattern(/^\d{2}:\d{2}$/),
  close_time: Joi.string().pattern(/^\d{2}:\d{2}$/),
  is24Hours: Joi.boolean(),
  features: Joi.array().items(featureSchema),
  status: Joi.string().valid('active', 'inactive'),
});

const scheduleSchema = Joi.object({
 date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  slots: Joi.array().items(
    Joi.object({
      time: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
      status: Joi.string().valid('available', 'booked').required(),
    })
  ).required(),
});

module.exports = { createFieldSchema, updateFieldSchema, scheduleSchema };
