const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const SALT_ROUNDS = 10;

// ==========================================================
// GET OWN PROFILE (student)
// ==========================================================
const getProfile = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT student_id, name, roll_number, email, phone, branch, semester, profile_image, created_at
       FROM students WHERE student_id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Profile not found.' });
    res.json({ success: true, profile: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// UPDATE OWN PROFILE (student) - Roll Number NOT editable
// ==========================================================
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    const studentId = req.user.id;

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

    values.push(studentId);
    await pool.query(`UPDATE students SET ${fields.join(', ')} WHERE student_id = ?`, values);

    const [updated] = await pool.query(
      `SELECT student_id, name, roll_number, email, phone, branch, semester, profile_image FROM students WHERE student_id = ?`,
      [studentId]
    );

    res.json({ success: true, message: 'Profile updated successfully.', profile: updated[0] });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// ADMIN: GET ALL STUDENTS
// ==========================================================
const getAllStudents = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT student_id, name, roll_number, email, phone, branch, semester, status, created_at
       FROM students ORDER BY roll_number ASC`
    );
    res.json({ success: true, count: rows.length, students: rows });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// ADMIN: GET SINGLE STUDENT BY ID
// ==========================================================
const getStudentById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT student_id, name, roll_number, email, phone, branch, semester, status, created_at
       FROM students WHERE student_id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found.' });
    res.json({ success: true, student: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// ADMIN: CREATE STUDENT
// ==========================================================
const createStudent = async (req, res, next) => {
  try {
    const { name, roll_number, email, phone, password, branch, semester } = req.body;

    if (!name || !roll_number || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const [existing] = await pool.query(
      'SELECT student_id FROM students WHERE roll_number = ? OR email = ?',
      [roll_number, email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Roll Number or Email already exists.' });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const [result] = await pool.query(
      `INSERT INTO students (name, roll_number, email, phone, password, branch, semester)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, roll_number, email, phone, hashed, branch || 'CSE', semester || 1]
    );

    res.status(201).json({ success: true, message: 'Student created successfully.', student_id: result.insertId });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// ADMIN: UPDATE STUDENT (any field including roll number)
// ==========================================================
const updateStudentByAdmin = async (req, res, next) => {
  try {
    const { name, email, phone, branch, semester, status, password } = req.body;
    const fields = [];
    const values = [];

    if (name) { fields.push('name = ?'); values.push(name); }
    if (email) { fields.push('email = ?'); values.push(email); }
    if (phone) { fields.push('phone = ?'); values.push(phone); }
    if (branch) { fields.push('branch = ?'); values.push(branch); }
    if (semester) { fields.push('semester = ?'); values.push(semester); }
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
    const [result] = await pool.query(`UPDATE students SET ${fields.join(', ')} WHERE student_id = ?`, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    res.json({ success: true, message: 'Student updated successfully.' });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// ADMIN: DELETE STUDENT
// ==========================================================
const deleteStudent = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM students WHERE student_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    res.json({ success: true, message: 'Student deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudentByAdmin,
  deleteStudent
};
