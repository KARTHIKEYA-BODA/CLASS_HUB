const path = require('path');
const fs = require('fs');
const pool = require('../config/db');

// ==========================================================
// GET ALL PROJECTS
// ==========================================================
const getAllProjects = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.project_id, p.title, p.subject, p.description, p.assigned_date,
              p.submission_deadline, p.attachment_path, c.name AS uploaded_by_name
       FROM projects p
       JOIN cr c ON c.cr_id = p.uploaded_by
       ORDER BY p.assigned_date DESC`
    );
    res.json({ success: true, count: rows.length, projects: rows });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// CR: CREATE PROJECT
// ==========================================================
const createProject = async (req, res, next) => {
  try {
    const { title, subject, description, assigned_date, submission_deadline } = req.body;

    if (!title || !subject || !assigned_date || !submission_deadline) {
      return res.status(400).json({ success: false, message: 'Title, Subject, Assigned Date, and Submission Deadline are required.' });
    }

    const attachmentPath = req.file ? `/uploads/projects/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO projects (title, subject, description, assigned_date, submission_deadline, attachment_path, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, subject, description || null, assigned_date, submission_deadline, attachmentPath, req.user.id]
    );

    res.status(201).json({ success: true, message: 'Project created successfully.', project_id: result.insertId });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// CR: UPDATE PROJECT (own uploads only)
// ==========================================================
const updateProject = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM projects WHERE project_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Project not found.' });

    if (rows[0].uploaded_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only edit projects you created.' });
    }

    const { title, subject, description, assigned_date, submission_deadline } = req.body;
    const fields = [];
    const values = [];

    if (title) { fields.push('title = ?'); values.push(title); }
    if (subject) { fields.push('subject = ?'); values.push(subject); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (assigned_date) { fields.push('assigned_date = ?'); values.push(assigned_date); }
    if (submission_deadline) { fields.push('submission_deadline = ?'); values.push(submission_deadline); }
    if (req.file) { fields.push('attachment_path = ?'); values.push(`/uploads/projects/${req.file.filename}`); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided to update.' });
    }

    values.push(req.params.id);
    await pool.query(`UPDATE projects SET ${fields.join(', ')} WHERE project_id = ?`, values);

    res.json({ success: true, message: 'Project updated successfully.' });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// CR/ADMIN: DELETE PROJECT
// ==========================================================
const deleteProject = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM projects WHERE project_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Project not found.' });

    if (req.user.role === 'cr' && rows[0].uploaded_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only delete projects you created.' });
    }

    await pool.query('DELETE FROM projects WHERE project_id = ?', [req.params.id]);

    if (rows[0].attachment_path) {
      const filePath = path.join(__dirname, '..', rows[0].attachment_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllProjects, createProject, updateProject, deleteProject };
