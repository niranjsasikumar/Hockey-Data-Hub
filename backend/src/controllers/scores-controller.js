import getScores from "../services/scores-service.js";

export default async function scoresController(req, res) {
  try {
    const { date, offset } = req.query;
    const scores = await getScores(date, offset);
    res.json(scores);
  } catch (err) {
    res.status(500).send(err);
  }
};