const Field = require('../../models/Field');
const Schedule = require('../../models/Schedule');
const { generateTimeSlots } = require('../../utils/helpers');

const ARABIC_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const formatField = (field) => ({
  id: field._id,
  ownerId: field.owner._id || field.owner,
  name: field.name,
  type: {
    id: field.type,
    label: { '5x5': 'خماسي', '7x7': 'سباعي', '11x11': 'حادي عشر' }[field.type],
  },
  pricePerHour: field.price_per_hour,
  rating: field.rating_avg,
  reviewsCount: field.rating_count,
  location: field.location,
  images: field.images,
  features: field.features,
  workingHours: {
    is24Hours: field.is24Hours,
    openTime: field.open_time,
    closeTime: field.close_time,
  },
  status: field.status,
});

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
  const filter = { status: 'active' }

  if (query.location) {
    filter['location.name'] = { $regex: query.location, $options: 'i' };
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
    .sort('-createdAt')
    .lean();

  return fields.map(formatField);
};

const getFieldDetails = async (fieldId) => {
  const field = await Field.findById(fieldId).populate('owner', 'name phone').lean();
  if (!field) throw { statusCode: 404, message: 'الملعب غير موجود' };
  return formatField(field);
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

const getMonthAvailability = async (fieldId, month) => {
  const field = await Field.findById(fieldId);
  if (!field) throw { statusCode: 404, message: 'الملعب غير موجود' };

  // Generate all dates in the month
  const [year, monthNum] = month.split('-').map(Number);
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const dates = [];
  for (let d = 1; d <= daysInMonth; d++) {
    dates.push(`${month}-${String(d).padStart(2, '0')}`);
  }

  // Fetch all schedules for this field in this month at once
  const schedules = await Schedule.find({
    field: fieldId,
    date: { $in: dates },
  });
  const scheduleMap = Object.fromEntries(schedules.map((s) => [s.date, s]));

  const days = dates.map((date) => {
    const jsDate = new Date(date);
    const dayName = ARABIC_DAYS[jsDate.getDay()];

    let slots;
    if (scheduleMap[date]) {
      // Use existing schedule
      slots = scheduleMap[date].slots.map((slot, idx) => {
        const [h] = slot.time.split(':').map(Number);
        const endHour = String(h + 1).padStart(2, '0');
        return {
          id: `${date}-s${idx + 1}`,
          startTime: slot.time,
          endTime: `${endHour}:00`,
          isAvailable: slot.status === 'available',
          price: field.price_per_hour,
        };
      });
    } else {
      // Auto-generate from open/close times
      const rawSlots = generateTimeSlots(field.open_time, field.close_time);
      slots = rawSlots.map((slot, idx) => {
        const [h] = slot.time.split(':').map(Number);
        const endHour = String(h + 1).padStart(2, '0');
        return {
          id: `${date}-s${idx + 1}`,
          startTime: slot.time,
          endTime: `${endHour}:00`,
          isAvailable: true,
          price: field.price_per_hour,
        };
      });
    }

    return { dayDate: date, dayName, slots };
  });

  return {
    fieldId,
    month,
    timezone: 'Africa/Cairo',
    slotDuration: 60,
    currency: 'EGP',
    days,
  };
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
  getMonthAvailability,
};
