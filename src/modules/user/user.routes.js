const router = require('express').Router();
const controller = require('./user.controller');
const { protect } = require('../../middleware/auth');

router.use(protect);

router.get('/profile', controller.getProfile);
router.put('/profile', controller.updateProfile);

module.exports = router;
