const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const SALT_ROUNDS = 10;

// ==========================================================
// GET OWN PROFILE (CR)
// ==========================================================
const getProfile = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT cr_id, name, roll_number, email, phone, branch, semester, class_strength, profile_image, created_at
       FROM cr WHERE cr_id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Profile not found.' });
    res.json({ success: true, profile: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// UPDATE OWN PROFILE (CR)
// ==========================================================
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    const crId = req.user.id;

    const fields = [];
    const values = [];

    if (name) { fields.push('name = ?'); values.push(name); }
    if (email) { fields.push('email = ?'); values.push(email); }
    if (phone) { fields.push('phone = ?'); values.push(phone); }
    if (password) {
      const hashed = await bcrypt.hash(password, SALT_ROUNDS);
      fields.push('password = ?');
      values.push(hashed);
    }
    if (req.file) {
      fields.push('profile_image = ?');
      values.push(`/uploads/profile/${req.file.filename}`);
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided to update.' });
    }

    values.push(crId);
    await pool.query(`UPDATE cr SET ${fields.join(', ')} WHERE cr_id = ?`, values);

    const [updated] = await pool.query(
      `SELECT cr_id, name, roll_number, email, phone, branch, semester, class_strength, profile_image FROM cr WHERE cr_id = ?`,
      [crId]
    );

    res.json({ success: true, message: 'Profile updated successfully.', profile: updated[0] });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// CR: EDIT CLASS STRENGTH (own class only)
// ==========================================================
const updateClassStrength = async (req, res, next) => {
  try {
    const { class_strength } = req.body;
    if (!class_strength || class_strength < 1) {
      return res.status(400).json({ success: false, message: 'Valid class strength is required.' });
    }

    await pool.query('UPDATE cr SET class_strength = ? WHERE cr_id = ?', [class_strength, req.user.id]);
    res.json({ success: true, message: 'Class strength updated successfully.', class_strength });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// ADMIN: GET ALL CRs
// ==========================================================
const getAllCRs = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT cr_id, name, roll_number, email, phone, branch, semester, class_strength, status, created_at
       FROM cr ORDER BY name ASC`
    );
    res.json({ success: true, count: rows.length, crs: rows });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// ADMIN: CREATE CR
// ==========================================================
const createCR = async (req, res, next) => {
  try {
    const { name, roll_number, email, phone, password, branch, semester, class_strength } = req.body;

    if (!name || !roll_number || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const [existing] = await pool.query(
      'SELECT cr_id FROM cr WHERE roll_number = ? OR email = ?',
      [roll_number, email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Roll Number or Email already exists.' });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const [result] = await pool.query(
      `INSERT INTO cr (name, roll_number, email, phone, password, branch, semester, class_strength)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, roll_number, email, phone, hashed, branch || 'CSE', semester || 1, class_strength || 60]
    );

    res.status(201).json({ success: true, message: 'CR account created successfully.', cr_id: result.insertId });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// ADMIN: UPDATE CR
// ==========================================================
const updateCRByAdmin = async (req, res, next) => {
  try {
    const { name, email, phone, branch, semester, class_strength, status, password } = req.body;
    const fields = [];
    const values = [];

    if (name) { fields.push('name = ?'); values.push(name); }
    if (email) { fields.push('email = ?'); values.push(email); }
    if (phone) { fields.push('phone = ?'); values.push(phone); }
    if (branch) { fields.push('branch = ?'); values.push(branch); }
    if (semester) { fields.push('semester = ?'); values.push(semester); }
    if (class_strength) { fields.push('class_strength = ?'); values.push(class_strength); }
    if (status) { fields.push('status = ?'); values.push(status); }
    if (password) {
      const hashed = await bcrypt.hash(password, SALT_ROUNDS);
      fields.push('password = ?');
      values.push(hashed);
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided to update.' });
    }

    values.push(req.params.id);
    const [result] = await pool.query(`UPDATE cr SET ${fields.join(', ')} WHERE cr_id = ?`, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'CR not found.' });
    }

    res.json({ success: true, message: 'CR updated successfully.' });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// ADMIN: DELETE CR
// ==========================================================
const deleteCR = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM cr WHERE cr_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'CR not found.' });
    }
    res.json({ success: true, message: 'CR deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateClassStrength,
  getAllCRs,
  createCR,
  updateCRByAdmin,
  deleteCR
};
