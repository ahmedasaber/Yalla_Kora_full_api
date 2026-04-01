const router = require('express').Router();
const controller = require('./wallet.controller');
const { protect } = require('../../middleware/auth');

router.use(protect);

router.get('/', controller.getWallet);
router.post('/charge', controller.chargeWallet);

module.exports = router;
