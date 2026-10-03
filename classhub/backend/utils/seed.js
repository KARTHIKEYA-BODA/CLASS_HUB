/**
 * ClassHub Database Seeder
 * ------------------------
 * Run this AFTER importing database/schema.sql
 * It hashes the sample passwords with bcrypt so login actually works,
 * since raw SQL INSERTs cannot compute bcrypt hashes.
 *
 * Usage: npm run seed   (from /backend folder)
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const SALT_ROUNDS = 10;

const credentials = {
  admin: { email: process.env.ADMIN_EMAIL || 'admin@classhub.edu', password: process.env.ADMIN_PASSWORD || 'Admin@12345' },
  cr: { roll_number: 'CSE21CR01', password: 'Cr@12345' },
  students: [
    { roll_number: 'CSE21001', password: 'Student@123' },
    { roll_number: 'CSE21002', password: 'Student@123' },
    { roll_number: 'CSE21003', password: 'Student@123' },
    { roll_number: 'CSE21004', password: 'Student@123' },
    { roll_number: 'CSE21005', password: 'Student@123' }
  ]
};

const run = async () => {
  try {
    console.log('🌱 Starting ClassHub database seeding...\n');

    // --- Hash & update Admin password ---
    const adminHash = await bcrypt.hash(credentials.admin.password, SALT_ROUNDS);
    await pool.query('UPDATE admin SET password = ? WHERE email = ?', [adminHash, credentials.admin.email]);
    console.log(`✅ Admin password set  → email: ${credentials.admin.email} | password: ${credentials.admin.password}`);

    // --- Hash & update CR password ---
    const crHash = await bcrypt.hash(credentials.cr.password, SALT_ROUNDS);
    await pool.query('UPDATE cr SET password = ? WHERE roll_number = ?', [crHash, credentials.cr.roll_number]);
    console.log(`✅ CR password set     → roll no: ${credentials.cr.roll_number} | password: ${credentials.cr.password}`);

    // --- Hash & update each student password ---
    for (const s of credentials.students) {
      const hash = await bcrypt.hash(s.password, SALT_ROUNDS);
      await pool.query('UPDATE students SET password = ? WHERE roll_number = ?', [hash, s.roll_number]);
      console.log(`✅ Student password set → roll no: ${s.roll_number} | password: ${s.password}`);
    }

    console.log('\n🎉 Seeding complete! You can now log in using the credentials above.');
    console.log('   (Full credential list is also in README.md)\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

run();
