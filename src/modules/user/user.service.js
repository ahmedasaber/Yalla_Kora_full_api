const User = require('../../models/User');

const getProfile = async (userId) => {
  const user = await User.findById(userId).populate('favorite_fields', 'name location images rating_avg');
  if (!user) throw { statusCode: 404, message: 'المستخدم غير موجود' };
  return user;
};

const updateProfile = async (userId, body) => {
  const allowedFields = ['name', 'age', 'avatar', 'match_notifications'];
  const updates = {};
  allowedFields.forEach((f) => {
    if (body[f] !== undefined) updates[f] = body[f];
  });

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) throw { statusCode: 404, message: 'المستخدم غير موجود' };
  return user;
};

module.exports = { getProfile, updateProfile };
