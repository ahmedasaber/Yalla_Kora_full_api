const Match = require('../../models/Match');
const Field = require('../../models/Field');

const createMatch = async (creatorId, body) => {
  const { field_id, date, time, players_needed, price_per_player } = body;

  const field = await Field.findById(field_id);
  if (!field) throw { statusCode: 404, message: 'الملعب غير موجود' };

  const match = await Match.create({
    creator: creatorId,
    field: field_id,
    date,
    time,
    players_needed,
    price_per_player,
    players: [creatorId], // creator joins automatically
  });

  return match.populate('field', 'name location images');
};

const getMatches = async (query) => {
  const filter = { status: 'open' };

  if (query.date) filter.date = query.date;
  if (query.field_id) filter.field = query.field_id;

  const matches = await Match.find(filter)
    .populate('field', 'name location images type')
    .populate('creator', 'name avatar')
    .sort('date time');

  return matches;
};

const getMatchDetails = async (matchId) => {
  const match = await Match.findById(matchId)
    .populate('field', 'name location images price_per_hour')
    .populate('creator', 'name avatar')
    .populate('players', 'name avatar');
  if (!match) throw { statusCode: 404, message: 'التقسيمة غير موجودة' };
  return match;
};

const joinMatch = async (matchId, playerId) => {
  const match = await Match.findById(matchId);
  if (!match) throw { statusCode: 404, message: 'التقسيمة غير موجودة' };
  if (match.status !== 'open') throw { statusCode: 400, message: 'التقسيمة مكتملة أو ملغية' };

  const alreadyJoined = match.players.some((p) => p.toString() === playerId.toString());
  if (alreadyJoined) throw { statusCode: 400, message: 'انت منضم بالفعل لهذه التقسيمة' };

  match.players.push(playerId);

  if (match.players.length >= match.players_needed) {
    match.status = 'full';
  }

  await match.save();
  return match;
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
  return match;
};

module.exports = { createMatch, getMatches, getMatchDetails, joinMatch, leaveMatch };
