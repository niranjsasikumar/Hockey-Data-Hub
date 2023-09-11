import getSeasonInfo from "../services/season-info-service.js";

export default async function seasonInfoController(req, res) {
  try {
    const { season } = req.params;
    const seasonInfo = await getSeasonInfo(season);
    res.json(seasonInfo);
  } catch (err) {
    res.status(500).send(err);
  }
};