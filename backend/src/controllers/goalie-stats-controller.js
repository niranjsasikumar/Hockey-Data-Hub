import getGoalieStats from "../services/goalie-stats-service.js";

export default async function goalieStatsController(req, res) {
  try {
    const { season, sort } = req.query;
    const stats = await getGoalieStats(season, sort);
    res.json(stats);
  } catch (err) {
    res.status(500).send(err);
  }
};