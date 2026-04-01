const Field = require('../../models/Field');
const Schedule = require('../../models/Schedule');
const { generateTimeSlots } = require('../../utils/helpers');

const createField = async (ownerId, body) => {
  const field = await Field.create({ owner: ownerId, ...body });
  return field;
};

const uploadImages = async (fieldId, ownerId, files) => {
  const field = await Field.findOne({ _id: fieldId, owner: ownerId });
  if (!field) throw { statusCode: 404, message: 'الملعب غير موجود' };

  const urls = files.map((f) => f.path);
  field.images.push(...urls);
  await field.save();
  return field;
};

const updateField = async (fieldId, ownerId, body) => {
  const field = await Field.findOneAndUpdate(
    { _id: fieldId, owner: ownerId },
    body,
    { new: true, runValidators: true }
  );
  if (!field) throw { statusCode: 404, message: 'الملعب غير موجود' };
  return field;
};

const getAllFields = async (query) => {
  const filter = { is_active: true };

  if (query.location) {
    filter.location = { $regex: query.location, $options: 'i' };
  }
  if (query.type) {
    filter.type = query.type;
  }
  if (query.min_price || query.max_price) {
    filter.price_per_hour = {};
    if (query.min_price) filter.price_per_hour.$gte = Number(query.min_price);
    if (query.max_price) filter.price_per_hour.$lte = Number(query.max_price);
  }
  if (query.search) {
    filter.$text = { $search: query.search };
  }

  const fields = await Field.find(filter)
    .populate('owner', 'name phone')
    .sort('-createdAt');

  return fields;
};

const getFieldDetails = async (fieldId) => {
  const field = await Field.findById(fieldId).populate('owner', 'name phone');
  if (!field) throw { statusCode: 404, message: 'الملعب غير موجود' };
  return field;
};

// Auto-generate schedule for a date if it doesn't exist yet
const ensureSchedule = async (field, date) => {
  let schedule = await Schedule.findOne({ field: field._id, date });
  if (!schedule) {
    const slots = generateTimeSlots(field.open_time, field.close_time);
    schedule = await Schedule.create({ field: field._id, date, slots });
  }
  return schedule;
};

const getSchedule = async (fieldId, date) => {
  const field = await Field.findById(fieldId);
  if (!field) throw { statusCode: 404, message: 'الملعب غير موجود' };

  const schedule = await ensureSchedule(field, date);
  return { date, slots: schedule.slots };
};

const setSchedule = async (fieldId, ownerId, date, slots) => {
  const field = await Field.findOne({ _id: fieldId, owner: ownerId });
  if (!field) throw { statusCode: 404, message: 'الملعب غير موجود أو لا تملكه' };

  const schedule = await Schedule.findOneAndUpdate(
    { field: fieldId, date },
    { field: fieldId, date, slots },
    { upsert: true, new: true }
  );
  return schedule;
};

module.exports = {
  createField,
  uploadImages,
  updateField,
  getAllFields,
  getFieldDetails,
  getSchedule,
  setSchedule,
  ensureSchedule,
};
