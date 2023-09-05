import getSeasonsList from "../services/seasons-list-service.js";

export default async function seasonsListController(req, res) {
  try {
    const seasons = await getSeasonsList();
    res.json(seasons);
  } catch (err) {
    res.status(500).send(err);
  }
};