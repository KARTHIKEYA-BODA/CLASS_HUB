const pool = require('../config/db');

// ==========================================================
// STUDENT: SUBMIT FEEDBACK
// ==========================================================
const submitFeedback = async (req, res, next) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and Message are required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO feedback (student_id, subject, message) VALUES (?, ?, ?)`,
      [req.user.id, subject, message]
    );

    res.status(201).json({ success: true, message: 'Feedback submitted successfully. Thank you!', feedback_id: result.insertId });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// ADMIN: GET ALL FEEDBACK (only Admin can view)
// ==========================================================
const getAllFeedback = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT f.feedback_id, f.subject, f.message, f.status, f.submitted_at,
              s.name AS student_name, s.roll_number
       FROM feedback f
       JOIN students s ON s.student_id = f.student_id
       ORDER BY f.submitted_at DESC`
    );
    res.json({ success: true, count: rows.length, feedback: rows });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// ADMIN: MARK FEEDBACK AS READ
// ==========================================================
const markFeedbackRead = async (req, res, next) => {
  try {
    const [result] = await pool.query(
      `UPDATE feedback SET status = 'read' WHERE feedback_id = ?`,
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Feedback not found.' });
    }
    res.json({ success: true, message: 'Feedback marked as read.' });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// STUDENT: GET OWN SUBMITTED FEEDBACK
// ==========================================================
const getMyFeedback = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT feedback_id, subject, message, status, submitted_at FROM feedback
       WHERE student_id = ? ORDER BY submitted_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, feedback: rows });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitFeedback, getAllFeedback, markFeedbackRead, getMyFeedback };
