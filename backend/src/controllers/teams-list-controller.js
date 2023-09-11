import getTeamsList from "../services/teams-list-service.js";

export default async function teamsListController(req, res) {
  try {
    const { season } = req.params;
    const teams = await getTeamsList(season);
    res.json(teams);
  } catch (err) {
    res.status(500).send(err);
  }
};