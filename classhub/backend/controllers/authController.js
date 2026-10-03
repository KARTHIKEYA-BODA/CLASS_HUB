const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../config/db');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwt');

const SALT_ROUNDS = 10;

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// ==========================================================
// STUDENT REGISTER
// ==========================================================
const registerStudent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
    }

    const { name, roll_number, email, phone, password, confirm_password } = req.body;

    if (password !== confirm_password) {
      return res.status(400).json({ success: false, message: 'Password and Confirm Password do not match.' });
    }

    // Check duplicates (roll number or email) across students table
    const [existing] = await pool.query(
      'SELECT student_id FROM students WHERE roll_number = ? OR email = ?',
      [roll_number, email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'A student with this Roll Number or Email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await pool.query(
      `INSERT INTO students (name, roll_number, email, phone, password) VALUES (?, ?, ?, ?, ?)`,
      [name, roll_number, email, phone, hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful! You can now login using your Roll Number and Password.',
      student_id: result.insertId
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// STUDENT LOGIN (via Roll Number)
// ==========================================================
const loginStudent = async (req, res, next) => {
  try {
    const { roll_number, password } = req.body;
    if (!roll_number || !password) {
      return res.status(400).json({ success: false, message: 'Roll Number and Password are required.' });
    }

    const [rows] = await pool.query('SELECT * FROM students WHERE roll_number = ?', [roll_number]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid Roll Number or Password.' });
    }

    const student = rows[0];

    if (student.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact Admin.' });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid Roll Number or Password.' });
    }

    const token = generateToken({
      id: student.student_id,
      role: 'student',
      name: student.name,
      roll_number: student.roll_number
    });

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: student.student_id,
        name: student.name,
        roll_number: student.roll_number,
        email: student.email,
        phone: student.phone,
        branch: student.branch,
        semester: student.semester,
        profile_image: student.profile_image,
        role: 'student'
      }
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// CR LOGIN (via Roll Number)
// ==========================================================
const loginCR = async (req, res, next) => {
  try {
    const { roll_number, password } = req.body;
    if (!roll_number || !password) {
      return res.status(400).json({ success: false, message: 'Roll Number and Password are required.' });
    }

    const [rows] = await pool.query('SELECT * FROM cr WHERE roll_number = ?', [roll_number]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid Roll Number or Password.' });
    }

    const cr = rows[0];

    if (cr.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Your CR account has been deactivated. Contact Admin.' });
    }

    const isMatch = await bcrypt.compare(password, cr.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid Roll Number or Password.' });
    }

    const token = generateToken({
      id: cr.cr_id,
      role: 'cr',
      name: cr.name,
      roll_number: cr.roll_number
    });

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: cr.cr_id,
        name: cr.name,
        roll_number: cr.roll_number,
        email: cr.email,
        phone: cr.phone,
        branch: cr.branch,
        semester: cr.semester,
        class_strength: cr.class_strength,
        profile_image: cr.profile_image,
        role: 'cr'
      }
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// ADMIN LOGIN (via Email)
// ==========================================================
const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and Password are required.' });
    }

    const [rows] = await pool.query('SELECT * FROM admin WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid Email or Password.' });
    }

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid Email or Password.' });
    }

    const token = generateToken({
      id: admin.admin_id,
      role: 'admin',
      name: admin.name
    });

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: admin.admin_id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: 'admin'
      }
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// GET CURRENT LOGGED-IN USER (any role) - used to re-hydrate session
// ==========================================================
const getMe = async (req, res, next) => {
  try {
    const { id, role } = req.user;
    let query, table;

    if (role === 'student') table = 'students';
    else if (role === 'cr') table = 'cr';
    else if (role === 'admin') table = 'admin';
    else return res.status(400).json({ success: false, message: 'Invalid role.' });

    const idCol = role === 'admin' ? 'admin_id' : role === 'cr' ? 'cr_id' : 'student_id';
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE ${idCol} = ?`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = rows[0];
    delete user.password;

    res.json({ success: true, user: { ...user, role } });
  } catch (err) {
    next(err);
  }
};

module.exports = { registerStudent, loginStudent, loginCR, loginAdmin, getMe };
