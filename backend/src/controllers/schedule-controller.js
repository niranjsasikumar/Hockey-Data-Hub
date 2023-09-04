import getSchedule from "../services/schedule-service.js";

export default async function scheduleController(req, res) {
  try {
    const { date, offset } = req.query;
    const schedule = await getSchedule(date, offset);
    res.json(schedule);
  } catch (err) {
    res.status(500).send(err);
  }
};