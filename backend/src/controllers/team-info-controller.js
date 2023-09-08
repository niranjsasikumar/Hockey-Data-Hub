import getTeamInfo from "../services/team-info-service.js";

export default async function teamInfoController(req, res) {
  try {
    const { season, team } = req.query;
    const teamInfo = await getTeamInfo(season, team);
    res.json(teamInfo);
  } catch (err) {
    res.status(500).send(err);
  }
};