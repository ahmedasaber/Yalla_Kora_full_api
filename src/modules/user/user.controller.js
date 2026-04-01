const userService = require('./user.service');
const { success } = require('../../utils/response');

const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user._id);
    return success(res, { user });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user._id, req.body);
    return success(res, { user }, 'تم تحديث الملف الشخصي');
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile };
