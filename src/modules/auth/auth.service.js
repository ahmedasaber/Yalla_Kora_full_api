const jwt = require('jsonwebtoken');
const User = require('../../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });

const register = async (body) => {
  const existing = await User.findOne({ phone: body.phone });
  if (existing) throw { statusCode: 400, message: 'رقم الهاتف مستخدم بالفعل' };

  const user = await User.create(body);
  const token = signToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      governorate: user.governorate,
      age: user.age,                          // player only
      field_name: user.field_name,            // owner only
      matches_played: user.matches_played,
      splits_joined: user.splits_joined,
      match_notifications: user.match_notifications,
      wallet_balance: user.wallet_balance,
    },
  };
};

const login = async ({ phone, password }) => {
  const user = await User.findOne({ phone }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    throw { statusCode: 401, message: 'رقم الهاتف أو كلمة المرور غير صحيحة' };
  }

  const token = signToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
    },
  };
};

module.exports = { register, login };
