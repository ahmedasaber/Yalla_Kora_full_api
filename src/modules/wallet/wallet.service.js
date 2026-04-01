const User = require('../../models/User');

const getWallet = async (userId) => {
  const user = await User.findById(userId).select('wallet_balance name');
  if (!user) throw { statusCode: 404, message: 'المستخدم غير موجود' };
  return { balance: user.wallet_balance };
};

const chargeWallet = async (userId, { amount, method }) => {
  if (!amount || amount <= 0) {
    throw { statusCode: 400, message: 'المبلغ غير صحيح' };
  }

  // In production: integrate with payment gateway here
  // For now we trust the request (sandbox mode)
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { wallet_balance: amount } },
    { new: true }
  ).select('wallet_balance');

  return {
    balance: user.wallet_balance,
    charged: amount,
    method,
  };
};

module.exports = { getWallet, chargeWallet };
