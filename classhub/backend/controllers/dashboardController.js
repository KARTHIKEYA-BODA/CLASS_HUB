const pool = require('../config/db');

// ==========================================================
// ADMIN: DASHBOARD SUMMARY STATS
// ==========================================================
const getAdminStats = async (req, res, next) => {
  try {
    const [[{ totalStudents }]] = await pool.query('SELECT COUNT(*) AS totalStudents FROM students WHERE status = "active"');
    const [[{ totalCRs }]] = await pool.query('SELECT COUNT(*) AS totalCRs FROM cr WHERE status = "active"');
    const [[{ totalNotices }]] = await pool.query('SELECT COUNT(*) AS totalNotices FROM notices');
    const [[{ totalNotes }]] = await pool.query('SELECT COUNT(*) AS totalNotes FROM notes');
    const [[{ totalAssignments }]] = await pool.query('SELECT COUNT(*) AS totalAssignments FROM assignments');
    const [[{ totalProjects }]] = await pool.query('SELECT COUNT(*) AS totalProjects FROM projects');
    const [[{ unreadFeedback }]] = await pool.query('SELECT COUNT(*) AS unreadFeedback FROM feedback WHERE status = "unread"');
    const [[{ avgAttendance }]] = await pool.query('SELECT ROUND(AVG(percentage),2) AS avgAttendance FROM attendance_percentage');

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalCRs,
        totalNotices,
        totalNotes,
        totalAssignments,
        totalProjects,
        unreadFeedback,
        avgAttendance: avgAttendance || 0
      }
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// CR: DASHBOARD SUMMARY STATS
// ==========================================================
const getCRStats = async (req, res, next) => {
  try {
    const [[{ totalStudents }]] = await pool.query('SELECT COUNT(*) AS totalStudents FROM students WHERE status = "active"');
    const [[cr]] = await pool.query('SELECT class_strength FROM cr WHERE cr_id = ?', [req.user.id]);
    const today = new Date().toISOString().split('T')[0];
    const [[{ marked10AM }]] = await pool.query(
      'SELECT COUNT(*) AS marked10AM FROM attendance WHERE attendance_date = ? AND session = "10AM"', [today]
    );
    const [[{ marked2PM }]] = await pool.query(
      'SELECT COUNT(*) AS marked2PM FROM attendance WHERE attendance_date = ? AND session = "2PM"', [today]
    );
    const [[{ myNotes }]] = await pool.query('SELECT COUNT(*) AS myNotes FROM notes WHERE uploaded_by = ?', [req.user.id]);
    const [[{ myAssignments }]] = await pool.query('SELECT COUNT(*) AS myAssignments FROM assignments WHERE uploaded_by = ?', [req.user.id]);

    res.json({
      success: true,
      stats: {
        totalStudents,
        classStrength: cr ? cr.class_strength : 0,
        attendanceMarkedToday: { session_10AM: marked10AM, session_2PM: marked2PM },
        myNotes,
        myAssignments
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAdminStats, getCRStats };
