const pool = require('../config/db');

// ==========================================================
// GET SEMESTER RANKING (all roles can view)
// ==========================================================
const getRanking = async (req, res, next) => {
  try {
    const semester = req.query.semester;
    let query = `
      SELECT r.ranking_id, r.rank_no, s.name AS student_name, s.roll_number, r.sgpa, r.cgpa, r.semester
      FROM semester_ranking r
      JOIN students s ON s.student_id = r.student_id
    `;
    const params = [];
    if (semester) {
      query += ' WHERE r.semester = ?';
      params.push(semester);
    }
    query += ' ORDER BY r.rank_no ASC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, count: rows.length, ranking: rows });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// ADMIN: UPLOAD/UPDATE RANKING FOR A STUDENT
// ==========================================================
const upsertRanking = async (req, res, next) => {
  try {
    const { student_id, semester, rank_no, sgpa, cgpa } = req.body;

    if (!student_id || !semester || !rank_no || sgpa === undefined || cgpa === undefined) {
      return res.status(400).json({ success: false, message: 'student_id, semester, rank_no, sgpa, and cgpa are required.' });
    }

    await pool.query(
      `INSERT INTO semester_ranking (student_id, semester, rank_no, sgpa, cgpa, updated_by)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         rank_no = VALUES(rank_no), sgpa = VALUES(sgpa), cgpa = VALUES(cgpa), updated_by = VALUES(updated_by)`,
      [student_id, semester, rank_no, sgpa, cgpa, req.user.id]
    );

    res.json({ success: true, message: 'Semester ranking updated successfully.' });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// ADMIN: DELETE RANKING ENTRY
// ==========================================================
const deleteRanking = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM semester_ranking WHERE ranking_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Ranking entry not found.' });
    }
    res.json({ success: true, message: 'Ranking entry deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRanking, upsertRanking, deleteRanking };
