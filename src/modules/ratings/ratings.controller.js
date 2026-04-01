const ratingsService = require('./ratings.service');
const { success } = require('../../utils/response');

const rateField = async (req, res, next) => {
  try {
    const rating = await ratingsService.rateField(
      req.user._id,
      req.params.field_id,
      req.body
    );
    return success(res, { rating }, 'تم إرسال التقييم بنجاح');
  } catch (err) {
    next(err);
  }
};

module.exports = { rateField };
