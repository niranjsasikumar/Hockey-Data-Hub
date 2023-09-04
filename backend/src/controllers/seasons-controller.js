import getSeasons from "../services/seasons-service.js";

export default async function seasonsController(req, res) {
  try {
    const seasons = await getSeasons();
    res.json(seasons);
  } catch (err) {
    res.status(500).send(err);
  }
};