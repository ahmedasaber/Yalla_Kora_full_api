const authService = require('./auth.service');
const { success, error } = require('../../utils/response');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return success(res, result, 'تم إنشاء الحساب بنجاح', 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return success(res, result, 'تم تسجيل الدخول بنجاح');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
