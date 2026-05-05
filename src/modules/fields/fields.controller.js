const fieldsService = require('./fields.service');
const { success } = require('../../utils/response');

const createField = async (req, res, next) => {
  try {
    const field = await fieldsService.createField(req.user._id, req.body);
    return success(res, { field }, 'تم إنشاء الملعب بنجاح', 201);
  } catch (err) {
    next(err);
  }
};

const uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next({ statusCode: 400, message: 'لم يتم رفع أي صور' });
    }
    const field = await fieldsService.uploadImages(
      req.params.field_id,
      req.user._id,
      req.files
    );
    return success(res, { images: field.images }, 'تم رفع الصور بنجاح');
  } catch (err) {
    next(err);
  }
};

const updateField = async (req, res, next) => {
  try {
    const field = await fieldsService.updateField(
      req.params.field_id,
      req.user._id,
      req.body
    );
    return success(res, { field }, 'تم تحديث الملعب بنجاح');
  } catch (err) {
    next(err);
  }
};

const getAllFields = async (req, res, next) => {
  try {
    const fields = await fieldsService.getAllFields(req.query);
    return success(res, { count: fields.length, fields });
  } catch (err) {
    next(err);
  }
};

const getFieldDetails = async (req, res, next) => {
  try {
    const field = await fieldsService.getFieldDetails(req.params.field_id);
    return success(res, field);
  } catch (err) {
    next(err);
  }
};

const getSchedule = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return next({ statusCode: 400, message: 'التاريخ مطلوب' });
    const schedule = await fieldsService.getSchedule(req.params.field_id, date);
    return success(res, schedule);
  } catch (err) {
    next(err);
  }
};

const setSchedule = async (req, res, next) => {
  try {
    const { date, slots } = req.body;
    const schedule = await fieldsService.setSchedule(
      req.params.field_id,
      req.user._id,
      date,
      slots
    );
    return success(res, { schedule }, 'تم تحديث الجدول بنجاح');
  } catch (err) {
    next(err);
  }
};

const getAvailability = async (req, res, next) => {
  try {
    const { month } = req.query; // "2026-02"
    if (!month) return next({ statusCode: 400, message: 'الشهر مطلوب (مثال: 2026-02)' });
    const result = await fieldsService.getMonthAvailability(req.params.field_id, month);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createField,
  uploadImages,
  updateField,
  getAllFields,
  getFieldDetails,
  getSchedule,
  setSchedule,
  getAvailability,
};
