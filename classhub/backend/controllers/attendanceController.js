const pool = require('../config/db');

// Helper: determine current session based on server time (used as a hint for the UI)
const getCurrentSession = () => {
  const hour = new Date().getHours();
  // 10AM session window: before 2 PM ; 2PM session window: 2 PM onward
  return hour < 14 ? '10AM' : '2PM';
};

// ==========================================================
// CR: MARK/SUBMIT ATTENDANCE FOR A SESSION (bulk upsert)
// Body: { attendance_date, session: '10AM'|'2PM', records: [{student_id, status}] }
// ==========================================================
const markAttendance = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { attendance_date, session, records } = req.body;
    const crId = req.user.id;

    if (!attendance_date || !session || !Array.isArray(records) || records.length === 0) {
      connection.release();
      return res.status(400).json({ success: false, message: 'attendance_date, session, and records[] are required.' });
    }
    if (!['10AM', '2PM'].includes(session)) {
      connection.release();
      return res.status(400).json({ success: false, message: 'Session must be either 10AM or 2PM.' });
    }

    await connection.beginTransaction();

    for (const rec of records) {
      const { student_id, status } = rec;
      if (!student_id || !['Present', 'Absent'].includes(status)) continue;

      // UPSERT: insert new record, or update if (student, date, session) already exists — this is how CR can "edit" attendance
      await connection.query(
        `INSERT INTO attendance (student_id, cr_id, attendance_date, session, status)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status), cr_id = VALUES(cr_id), updated_at = CURRENT_TIMESTAMP`,
        [student_id, crId, attendance_date, session, status]
      );
    }

    await connection.commit();
    connection.release();

    res.json({ success: true, message: `Attendance for ${session} session on ${attendance_date} saved successfully.` });
  } catch (err) {
    await connection.rollback();
    connection.release();
    next(err);
  }
};

// ==========================================================
// CR: GET ATTENDANCE FOR A SPECIFIC DATE + SESSION (to view/edit)
// ==========================================================
const getAttendanceBySession = async (req, res, next) => {
  try {
    const { date, session } = req.query;
    if (!date || !session) {
      return res.status(400).json({ success: false, message: 'date and session query params are required.' });
    }

    // Get all active students, LEFT JOIN with attendance for that date/session
    const [rows] = await pool.query(
      `SELECT s.student_id, s.name, s.roll_number,
              COALESCE(a.status, 'Absent') AS status,
              a.attendance_id
       FROM students s
       LEFT JOIN attendance a
         ON a.student_id = s.student_id AND a.attendance_date = ? AND a.session = ?
       WHERE s.status = 'active'
       ORDER BY s.roll_number ASC`,
      [date, session]
    );

    res.json({ success: true, date, session, students: rows, currentSession: getCurrentSession() });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// CR/ADMIN: GET ATTENDANCE HISTORY FOR A SPECIFIC STUDENT
// ==========================================================
const getStudentAttendanceHistory = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;
    const [rows] = await pool.query(
      `SELECT attendance_date, session, status FROM attendance
       WHERE student_id = ? ORDER BY attendance_date DESC, session DESC LIMIT 60`,
      [studentId]
    );
    res.json({ success: true, records: rows });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// STUDENT: GET OWN ATTENDANCE PERCENTAGE (uploaded by Admin only)
// ==========================================================
const getMyAttendancePercentage = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT total_classes, attended_classes, percentage, updated_at
       FROM attendance_percentage WHERE student_id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.json({
        success: true,
        percentage: { total_classes: 0, attended_classes: 0, percentage: 0, updated_at: null },
        message: 'Attendance percentage has not been uploaded by Admin yet.'
      });
    }

    res.json({ success: true, percentage: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// ADMIN: UPLOAD/UPDATE ATTENDANCE PERCENTAGE FOR A STUDENT
// ==========================================================
const uploadAttendancePercentage = async (req, res, next) => {
  try {
    const { student_id, total_classes, attended_classes } = req.body;

    if (!student_id || total_classes === undefined || attended_classes === undefined) {
      return res.status(400).json({ success: false, message: 'student_id, total_classes, and attended_classes are required.' });
    }
    if (attended_classes > total_classes) {
      return res.status(400).json({ success: false, message: 'Attended classes cannot exceed total classes.' });
    }

    const percentage = total_classes > 0 ? ((attended_classes / total_classes) * 100).toFixed(2) : 0;

    await pool.query(
      `INSERT INTO attendance_percentage (student_id, total_classes, attended_classes, percentage, updated_by)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         total_classes = VALUES(total_classes),
         attended_classes = VALUES(attended_classes),
         percentage = VALUES(percentage),
         updated_by = VALUES(updated_by)`,
      [student_id, total_classes, attended_classes, percentage, req.user.id]
    );

    res.json({ success: true, message: 'Attendance percentage updated successfully.', percentage });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// ADMIN: GET ALL ATTENDANCE PERCENTAGES (with student names)
// ==========================================================
const getAllAttendancePercentages = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.student_id, s.name, s.roll_number,
              COALESCE(ap.total_classes, 0) AS total_classes,
              COALESCE(ap.attended_classes, 0) AS attended_classes,
              COALESCE(ap.percentage, 0) AS percentage,
              ap.updated_at
       FROM students s
       LEFT JOIN attendance_percentage ap ON ap.student_id = s.student_id
       WHERE s.status = 'active'
       ORDER BY s.roll_number ASC`
    );
    res.json({ success: true, records: rows });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  markAttendance,
  getAttendanceBySession,
  getStudentAttendanceHistory,
  getMyAttendancePercentage,
  uploadAttendancePercentage,
  getAllAttendancePercentages
};
