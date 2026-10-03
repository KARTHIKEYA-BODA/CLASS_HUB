const pool = require('../config/db');

// ==========================================================
// GET ALL NOTICES (public-ish; all roles + home page preview)
// ==========================================================
const getAllNotices = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    let query = 'SELECT * FROM notices ORDER BY posted_date DESC';
    if (limit) query += ` LIMIT ${limit}`;

    const [rows] = await pool.query(query);
    res.json({ success: true, count: rows.length, notices: rows });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// ADMIN/CR: CREATE NOTICE
// ==========================================================
const createNotice = async (req, res, next) => {
  try {
    const { title, description, is_important } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and Description are required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO notices (title, description, posted_by_role, posted_by_id, posted_by_name, is_important)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, req.user.role, req.user.id, req.user.name, is_important ? 1 : 0]
    );

    res.status(201).json({ success: true, message: 'Notice posted successfully.', notice_id: result.insertId });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// ADMIN: UPDATE ANY NOTICE / CR: UPDATE OWN NOTICE
// ==========================================================
const updateNotice = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM notices WHERE notice_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Notice not found.' });

    if (req.user.role === 'cr' && rows[0].posted_by_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only edit notices you posted.' });
    }

    const { title, description, is_important } = req.body;
    const fields = [];
    const values = [];

    if (title) { fields.push('title = ?'); values.push(title); }
    if (description) { fields.push('description = ?'); values.push(description); }
    if (is_important !== undefined) { fields.push('is_important = ?'); values.push(is_important ? 1 : 0); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided to update.' });
    }

    values.push(req.params.id);
    await pool.query(`UPDATE notices SET ${fields.join(', ')} WHERE notice_id = ?`, values);

    res.json({ success: true, message: 'Notice updated successfully.' });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// ADMIN: DELETE ANY NOTICE / CR: DELETE OWN NOTICE
// ==========================================================
const deleteNotice = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM notices WHERE notice_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Notice not found.' });

    if (req.user.role === 'cr' && rows[0].posted_by_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only delete notices you posted.' });
    }

    await pool.query('DELETE FROM notices WHERE notice_id = ?', [req.params.id]);
    res.json({ success: true, message: 'Notice deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllNotices, createNotice, updateNotice, deleteNotice };
