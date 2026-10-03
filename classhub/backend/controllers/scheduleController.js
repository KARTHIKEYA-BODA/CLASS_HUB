const pool = require('../config/db');

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ==========================================================
// GET TODAY'S SCHEDULE
// ==========================================================
const getTodaySchedule = async (req, res, next) => {
  try {
    const today = DAYS[new Date().getDay()];

    if (today === 'Sunday') {
      return res.json({ success: true, day: today, schedule: [], message: 'No classes today. Enjoy your Sunday!' });
    }

    const [rows] = await pool.query(
      `SELECT schedule_id, subject, faculty, start_time, end_time, room_number
       FROM schedule WHERE day_of_week = ? ORDER BY start_time ASC`,
      [today]
    );

    res.json({ success: true, day: today, schedule: rows });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// GET FULL WEEKLY SCHEDULE
// ==========================================================
const getWeeklySchedule = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT schedule_id, day_of_week, subject, faculty, start_time, end_time, room_number
       FROM schedule ORDER BY FIELD(day_of_week,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'), start_time ASC`
    );
    res.json({ success: true, schedule: rows });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// CR/ADMIN: ADD SCHEDULE ENTRY
// ==========================================================
const addScheduleEntry = async (req, res, next) => {
  try {
    const { day_of_week, subject, faculty, start_time, end_time, room_number } = req.body;

    if (!day_of_week || !subject || !faculty || !start_time || !end_time || !room_number) {
      return res.status(400).json({ success: false, message: 'All schedule fields are required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO schedule (day_of_week, subject, faculty, start_time, end_time, room_number, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [day_of_week, subject, faculty, start_time, end_time, room_number, req.user.id]
    );

    res.status(201).json({ success: true, message: 'Schedule entry added successfully.', schedule_id: result.insertId });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// CR/ADMIN: UPDATE SCHEDULE ENTRY
// ==========================================================
const updateScheduleEntry = async (req, res, next) => {
  try {
    const { day_of_week, subject, faculty, start_time, end_time, room_number } = req.body;
    const fields = [];
    const values = [];

    if (day_of_week) { fields.push('day_of_week = ?'); values.push(day_of_week); }
    if (subject) { fields.push('subject = ?'); values.push(subject); }
    if (faculty) { fields.push('faculty = ?'); values.push(faculty); }
    if (start_time) { fields.push('start_time = ?'); values.push(start_time); }
    if (end_time) { fields.push('end_time = ?'); values.push(end_time); }
    if (room_number) { fields.push('room_number = ?'); values.push(room_number); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided to update.' });
    }

    values.push(req.params.id);
    const [result] = await pool.query(`UPDATE schedule SET ${fields.join(', ')} WHERE schedule_id = ?`, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Schedule entry not found.' });
    }

    res.json({ success: true, message: 'Schedule updated successfully.' });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// CR/ADMIN: DELETE SCHEDULE ENTRY
// ==========================================================
const deleteScheduleEntry = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM schedule WHERE schedule_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Schedule entry not found.' });
    }
    res.json({ success: true, message: 'Schedule entry deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTodaySchedule, getWeeklySchedule, addScheduleEntry, updateScheduleEntry, deleteScheduleEntry };
