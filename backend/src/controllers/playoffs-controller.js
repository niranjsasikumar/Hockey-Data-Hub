import getPlayoffs from "../services/playoffs-service.js";

export default async function playoffsController(req, res) {
  try {
    const { season } = req.params;
    const playoffs = await getPlayoffs(season);
    res.json(playoffs);
  } catch (err) {
    res.status(500).send(err);
  }
};