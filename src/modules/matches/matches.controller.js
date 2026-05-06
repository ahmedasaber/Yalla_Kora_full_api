const matchesService = require('./matches.service');
const { success } = require('../../utils/response');

const createMatch = async (req, res, next) => {
  try {
    const match = await matchesService.createMatch(req.user._id, req.body);
    return success(res, { match }, 'تم إنشاء التقسيمة بنجاح', 201);
  } catch (err) {
    next(err);
  }
};

const getMatches = async (req, res, next) => {
  try {
    const result = await matchesService.getMatches(req.query);
    return success(res, result);
    
    // const matches = await matchesService.getMatches(req.query);
    // return success(res, { count: matches.length, matches });
  } catch (err) {
    next(err);
  }
};

const getMatchDetails = async (req, res, next) => {
  try {
    const match = await matchesService.getMatchDetails(req.params.match_id);
    return success(res, { match });
  } catch (err) {
    next(err);
  }
};

const joinMatch = async (req, res, next) => {
  try {
    const match = await matchesService.joinMatch(req.params.match_id, req.user._id);
    return success(res, { match }, 'تم الانضمام للتقسيمة بنجاح');
  } catch (err) {
    next(err);
  }
};

const leaveMatch = async (req, res, next) => {
  try {
    const match = await matchesService.leaveMatch(req.params.match_id, req.user._id);
    return success(res, { match }, 'تم مغادرة التقسيمة');
  } catch (err) {
    next(err);
  }
};

module.exports = { createMatch, getMatches, getMatchDetails, joinMatch, leaveMatch };
