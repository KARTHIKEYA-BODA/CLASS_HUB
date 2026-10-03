const pool = require('../config/db');

// ==========================================================
// GET CONTACT INFO (public - all roles + homepage)
// ==========================================================
const getContact = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM contact ORDER BY contact_id DESC LIMIT 1');
    if (rows.length === 0) {
      return res.json({ success: true, contact: null, message: 'Contact information not yet set.' });
    }
    res.json({ success: true, contact: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// ADMIN: UPDATE CONTACT INFO
// ==========================================================
const updateContact = async (req, res, next) => {
  try {
    const { admin_name, email, phone, college_name, address } = req.body;

    if (!admin_name || !email || !phone || !college_name) {
      return res.status(400).json({ success: false, message: 'Admin Name, Email, Phone, and College Name are required.' });
    }

    const [existing] = await pool.query('SELECT contact_id FROM contact ORDER BY contact_id DESC LIMIT 1');

    if (existing.length > 0) {
      await pool.query(
        `UPDATE contact SET admin_name = ?, email = ?, phone = ?, college_name = ?, address = ? WHERE contact_id = ?`,
        [admin_name, email, phone, college_name, address || null, existing[0].contact_id]
      );
    } else {
      await pool.query(
        `INSERT INTO contact (admin_name, email, phone, college_name, address) VALUES (?, ?, ?, ?, ?)`,
        [admin_name, email, phone, college_name, address || null]
      );
    }

    res.json({ success: true, message: 'Contact information updated successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getContact, updateContact };
