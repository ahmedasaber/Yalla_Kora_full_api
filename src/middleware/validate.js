const { error } = require('../utils/response');

const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    const { error: joiError } = schema.validate(req[target], {
      abortEarly: false,
    });
    if (joiError) {
      const message = joiError.details.map((d) => d.message).join(', ');
      return error(res, message, 422);
    }
    next();
  };
};

module.exports = validate;
