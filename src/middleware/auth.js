const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { error } = require('../utils/response');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'يجب تسجيل الدخول أولاً', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return error(res, 'المستخدم غير موجود', 401);

    req.user = user;
    next();
  } catch (err) {
    return error(res, 'token غير صالح', 401);
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return error(res, 'ليس لديك صلاحية للقيام بهذا الإجراء', 403);
    }
    next();
  };
};

module.exports = { protect, restrictTo };
