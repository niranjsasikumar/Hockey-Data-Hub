import getSchedule from "../services/schedule-service.js";

export default async function scheduleController(req, res) {
  try {
    const { team, date, offset } = req.query;
    const schedule = await getSchedule(team, date, offset);
    res.json(schedule);
  } catch (err) {
    res.status(500).send(err);
  }
};