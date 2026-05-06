const ownerService = require('./owner.service');
const { success } = require('../../utils/response');

const getFieldBookings = async (req, res, next) => {
  try {
    const result = await ownerService.getFieldBookings(
      req.params.field_id,
      req.user._id,
      req.query
    );
    return success(res, result);

    // const bookings = await ownerService.getFieldBookings(
    //   req.params.field_id,
    //   req.user._id,
    //   req.query
    // );
    // return success(res, { count: bookings.length, bookings });
  } catch (err) {
    next(err);
  }
};

const getFieldDashboard = async (req, res, next) => {
  try {
    const dashboard = await ownerService.getFieldDashboard(
      req.params.field_id,
      req.user._id,
      req.query.date
    );
    return success(res, dashboard);
  } catch (err) {
    next(err);
  }
};

module.exports = { getFieldBookings, getFieldDashboard };
