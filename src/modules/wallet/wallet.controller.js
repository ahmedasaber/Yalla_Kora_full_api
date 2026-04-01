const walletService = require('./wallet.service');
const { success } = require('../../utils/response');

const getWallet = async (req, res, next) => {
  try {
    const wallet = await walletService.getWallet(req.user._id);
    return success(res, wallet);
  } catch (err) {
    next(err);
  }
};

const chargeWallet = async (req, res, next) => {
  try {
    const result = await walletService.chargeWallet(req.user._id, req.body);
    return success(res, result, 'تم شحن المحفظة بنجاح');
  } catch (err) {
    next(err);
  }
};

module.exports = { getWallet, chargeWallet };
