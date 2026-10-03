const path = require('path');
const fs = require('fs');
const pool = require('../config/db');

// ==========================================================
// GET ALL NOTES (Student + CR + Admin can view)
// ==========================================================
const getAllNotes = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT note_id, subject, title, file_path, file_type, uploaded_by_name, upload_date
       FROM notes ORDER BY upload_date DESC`
    );
    res.json({ success: true, count: rows.length, notes: rows });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// CR: UPLOAD NOTE (PDF/Image)
// ==========================================================
const uploadNote = async (req, res, next) => {
  try {
    const { subject, title } = req.body;

    if (!subject || !title) {
      return res.status(400).json({ success: false, message: 'Subject and Title are required.' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'A PDF or Image file is required.' });
    }

    const ext = path.extname(req.file.filename).toLowerCase();
    const fileType = ext === '.pdf' ? 'pdf' : 'image';
    const filePath = `/uploads/notes/${req.file.filename}`;

    const [result] = await pool.query(
      `INSERT INTO notes (subject, title, file_path, file_type, uploaded_by, uploaded_by_name)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [subject, title, filePath, fileType, req.user.id, req.user.name]
    );

    res.status(201).json({ success: true, message: 'Note uploaded successfully.', note_id: result.insertId });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// CR: DELETE OWN NOTE / ADMIN: DELETE ANY NOTE
// ==========================================================
const deleteNote = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM notes WHERE note_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    const note = rows[0];

    // CR can only delete their own uploads; Admin can delete any
    if (req.user.role === 'cr' && note.uploaded_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only delete notes you uploaded.' });
    }

    await pool.query('DELETE FROM notes WHERE note_id = ?', [req.params.id]);

    // Remove physical file
    const filePath = path.join(__dirname, '..', note.file_path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ success: true, message: 'Note deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllNotes, uploadNote, deleteNote };
