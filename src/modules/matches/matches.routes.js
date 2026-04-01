const router = require('express').Router();
const controller = require('./matches.controller');
const { protect, restrictTo } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { createMatchSchema } = require('./matches.validation');

router.get('/', controller.getMatches);
router.get('/:match_id', controller.getMatchDetails);

router.use(protect);
router.use(restrictTo('player'));

router.post('/', validate(createMatchSchema), controller.createMatch);
router.post('/:match_id/join', controller.joinMatch);
router.post('/:match_id/leave', controller.leaveMatch);

module.exports = router;
