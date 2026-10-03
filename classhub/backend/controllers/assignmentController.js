const path = require('path');
const fs = require('fs');
const pool = require('../config/db');

// ==========================================================
// GET ALL ASSIGNMENTS
// ==========================================================
const getAllAssignments = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.assignment_id, a.subject, a.title, a.description, a.date_assigned,
              a.last_submission, a.attachment_path, c.name AS uploaded_by_name
       FROM assignments a
       JOIN cr c ON c.cr_id = a.uploaded_by
       ORDER BY a.date_assigned DESC`
    );
    res.json({ success: true, count: rows.length, assignments: rows });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// CR: CREATE ASSIGNMENT
// ==========================================================
const createAssignment = async (req, res, next) => {
  try {
    const { subject, title, description, date_assigned, last_submission } = req.body;

    if (!subject || !title || !date_assigned || !last_submission) {
      return res.status(400).json({ success: false, message: 'Subject, Title, Date Assigned, and Last Submission Date are required.' });
    }

    const attachmentPath = req.file ? `/uploads/assignments/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO assignments (subject, title, description, date_assigned, last_submission, attachment_path, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [subject, title, description || null, date_assigned, last_submission, attachmentPath, req.user.id]
    );

    res.status(201).json({ success: true, message: 'Assignment created successfully.', assignment_id: result.insertId });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// CR: UPDATE ASSIGNMENT (own uploads only)
// ==========================================================
const updateAssignment = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM assignments WHERE assignment_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Assignment not found.' });

    if (rows[0].uploaded_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only edit assignments you created.' });
    }

    const { subject, title, description, date_assigned, last_submission } = req.body;
    const fields = [];
    const values = [];

    if (subject) { fields.push('subject = ?'); values.push(subject); }
    if (title) { fields.push('title = ?'); values.push(title); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (date_assigned) { fields.push('date_assigned = ?'); values.push(date_assigned); }
    if (last_submission) { fields.push('last_submission = ?'); values.push(last_submission); }
    if (req.file) { fields.push('attachment_path = ?'); values.push(`/uploads/assignments/${req.file.filename}`); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided to update.' });
    }

    values.push(req.params.id);
    await pool.query(`UPDATE assignments SET ${fields.join(', ')} WHERE assignment_id = ?`, values);

    res.json({ success: true, message: 'Assignment updated successfully.' });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// CR/ADMIN: DELETE ASSIGNMENT
// ==========================================================
const deleteAssignment = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM assignments WHERE assignment_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Assignment not found.' });

    if (req.user.role === 'cr' && rows[0].uploaded_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only delete assignments you created.' });
    }

    await pool.query('DELETE FROM assignments WHERE assignment_id = ?', [req.params.id]);

    if (rows[0].attachment_path) {
      const filePath = path.join(__dirname, '..', rows[0].attachment_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.json({ success: true, message: 'Assignment deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllAssignments, createAssignment, updateAssignment, deleteAssignment };
