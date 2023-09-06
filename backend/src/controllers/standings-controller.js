import getStandings from "../services/standings-service.js";

export default async function standingsController(req, res) {
  try {
    const { season } = req.params;
    const standings = await getStandings(season);
    res.json(standings);
  } catch (err) {
    res.status(500).send(err);
  }
};