const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).required().messages({
    'string.min': 'الاسم يجب أن يكون على الأقل حرفين',
    'any.required': 'الاسم مطلوب',
  }),
  phone: Joi.string()
    .pattern(/^(01)[0125][0-9]{8}$/)
    .required()
    .messages({
      'string.pattern.base': 'رقم الهاتف غير صحيح',
      'any.required': 'رقم الهاتف مطلوب',
    }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    'any.required': 'كلمة المرور مطلوبة',
  }),
  role: Joi.string().valid('player', 'owner').required(),
  age: Joi.when('role', {
    is: 'player',
    then: Joi.number().min(10).max(80).required(),
    otherwise: Joi.forbidden(),
  }),
  field_name: Joi.when('role', {
    is: 'owner',
    then: Joi.string().min(2).required(),
    otherwise: Joi.forbidden(),
  }),
});

const loginSchema = Joi.object({
  phone: Joi.string().required(),
  password: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema };
