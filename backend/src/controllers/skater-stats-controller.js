import getSkaterStats from "../services/skater-stats-service.js";

export default async function skaterStatsController(req, res) {
  try {
    const { season, sort } = req.query;
    const stats = await getSkaterStats(season, sort);
    res.json(stats);
  } catch (err) {
    res.status(500).send(err);
  }
};