const router = require('express').Router();
const controller = require('./fields.controller');
const { protect, restrictTo } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const {
  createFieldSchema,
  updateFieldSchema,
  scheduleSchema,
} = require('./fields.validation');
const { upload } = require('../../config/cloudinary');

// Public routes
router.get('/', controller.getAllFields);
router.get('/:field_id', controller.getFieldDetails);
router.get('/:field_id/schedule', controller.getSchedule);

// Protected routes
router.use(protect);

// Owner only
router.post(
  '/',
  restrictTo('owner'),
  validate(createFieldSchema),
  controller.createField
);
router.post(
  '/:field_id/images',
  restrictTo('owner'),
  upload.array('images', 10),
  controller.uploadImages
);
router.put(
  '/:field_id',
  restrictTo('owner'),
  validate(updateFieldSchema),
  controller.updateField
);
router.post(
  '/:field_id/schedule',
  restrictTo('owner'),
  validate(scheduleSchema),
  controller.setSchedule
);

module.exports = router;
