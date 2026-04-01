const router = require('express').Router({ mergeParams: true });
const controller = require('./ratings.controller');
const { protect, restrictTo } = require('../../middleware/auth');

router.use(protect);
router.use(restrictTo('player'));

router.post('/', controller.rateField);

module.exports = router;
