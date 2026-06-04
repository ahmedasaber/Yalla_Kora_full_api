const Match = require('../../models/Match');
const Field = require('../../models/Field');

const CAPACITY_MAP = { '5x5': 10, '7x7': 14, '11x11': 22 };

// helper عشان يرتب الـ location ويشيل الـ fields الزيادة
const formatMatch = (match) => {
  const obj = match.toObject({ virtuals: true });

  // نظف الـ location
  if (obj.field?.location) {
    obj.field.location = {
      name: obj.field.location.name,
      address: obj.field.location.address,
    };
  }

  return obj;
};

const createMatch = async (creatorId, body) => {
  const { field_id, date, time, players_needed, price_per_player } = body;

  const field = await Field.findById(field_id);
  if (!field) throw { statusCode: 404, message: 'الملعب غير موجود' };

    if (!CAPACITY_MAP[field.type]) {
      throw {
        statusCode: 400,
        message: 'نوع الملعب غير مدعوم'
      };
    }
   // field_capacity من الـ type
   const field_capacity = CAPACITY_MAP[field.type];

     // validation إن players_needed متعداش الـ capacity
  if (players_needed > field_capacity) {
    throw { 
      statusCode: 400, 
      message: `ملعب ${field.type} بيستوعب ${field_capacity} لاعب بس` 
    };
  }

  const match = await Match.create({
    creator: creatorId,
    field: field_id,
    date,
    time,
    field_capacity,
    players_needed,
    price_per_player,
    players: [creatorId], // creator joins automatically
  });

  await match.populate('field', 'name location images type');
  return formatMatch(match);
};

const getMatches = async (query) => {
  const filter = { status: 'open' };

  if (query.date) filter.date = query.date;
  if (query.field_id) filter.field = query.field_id;

  // Pagination
  const page  = parseInt(query.page)  || 1;
  const limit = parseInt(query.limit) || 10;
  const skip  = (page - 1) * limit;

  const [matches, total] = await Promise.all([
    Match.find(filter)
      .populate('field', 'name location images type')
      .populate('creator', 'name avatar')
      .populate('players', 'name avatar _id')
      .sort('date time')
      .skip(skip)
      .limit(limit),
    Match.countDocuments(filter),
  ]);

  return {
    matches: matches.map(formatMatch),
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

const getMatchDetails = async (matchId) => {
  const match = await Match.findById(matchId)
    .populate('field', 'name location type images price_per_hour')
    .populate('creator', 'name avatar')
    .populate('players', 'name avatar _id');
  if (!match) throw { statusCode: 404, message: 'التقسيمة غير موجودة' };
  return formatMatch(match);
};

const joinMatch = async (matchId, playerId) => {
  const match = await Match.findById(matchId);

  if (!match) {
    throw { statusCode: 404, message: 'التقسيمة غير موجودة' };
  }
  if (match.status !== 'open') {
    throw { statusCode: 400, message: 'التقسيمة مكتملة أو ملغية' };
  }
  const alreadyJoined = match.players.some(
    (p) => p.toString() === playerId.toString()
  );
  if (alreadyJoined) {
    throw { statusCode: 400, message: 'انت منضم بالفعل لهذه التقسيمة' };
  }
  if (match.players.length >= match.players_needed) {
    throw {
      statusCode: 400,
      message: 'التقسيمة مكتملة'
    };
  }
  match.players.push(playerId);
  if (match.players.length >= match.players_needed) {
    match.status = 'full';
  }
  await match.save();
  await match.populate([
    { path: 'players', select: 'name avatar _id' },
    { path: 'creator', select: 'name avatar _id' },
    { path: 'field', select: 'name location type' },
  ]);
  
  return formatMatch(match);
};

const leaveMatch = async (matchId, playerId) => {
  const match = await Match.findById(matchId);
  if (!match) throw { statusCode: 404, message: 'التقسيمة غير موجودة' };

  const isInMatch = match.players.some((p) => p.toString() === playerId.toString());
  if (!isInMatch) throw { statusCode: 400, message: 'أنت لست منضماً لهذه التقسيمة' };

  if (match.creator.toString() === playerId.toString()) {
    throw { statusCode: 400, message: 'منشئ التقسيمة لا يمكنه مغادرتها' };
  }

  match.players = match.players.filter((p) => p.toString() !== playerId.toString());

  if (match.status === 'full') match.status = 'open';

  await match.save();
  await match.populate([
    { path: 'players', select: 'name avatar _id' },
    { path: 'creator', select: 'name avatar _id' },
    { path: 'field', select: 'name location type' },
  ]);
  
  return formatMatch(match);
};

module.exports = { createMatch, getMatches, getMatchDetails, joinMatch, leaveMatch };
