// Generate booking code like BO-2547
const generateBookingCode = () => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `BO-${num}`;
};

// Generate time slots between open_time and close_time (hourly)
const generateTimeSlots = (openTime, closeTime) => {
  const slots = [];
  const [openH] = openTime.split(':').map(Number);
  const [closeH] = closeTime.split(':').map(Number);

  for (let h = openH; h < closeH; h++) {
    const time = `${String(h).padStart(2, '0')}:00`;
    slots.push({ time, status: 'available' });
  }
  return slots;
};

// Check if two time ranges overlap
const timesOverlap = (from1, to1, from2, to2) => {
  return from1 < to2 && to1 > from2;
};

module.exports = { generateBookingCode, generateTimeSlots, timesOverlap };
