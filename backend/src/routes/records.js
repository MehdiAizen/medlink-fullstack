const express = require('express');
const db = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/records - medical records
router.get('/', authenticate, async (req, res) => {
  try {
    let query, params;
    if (req.user.role === 'patient') {
      query = `
        SELECT r.*, u.full_name AS doctor_name
        FROM medical_records r
        LEFT JOIN users u ON r.doctor_id = u.id
        WHERE r.patient_id = $1
        ORDER BY r.record_date DESC
      `;
      params = [req.user.id];
    } else {
      // doctor sees records they created or of their patients
      query = `
        SELECT r.*, p.full_name AS patient_name
        FROM medical_records r
        JOIN users p ON r.patient_id = p.id
        WHERE r.doctor_id = $1
        ORDER BY r.record_date DESC
      `;
      params = [req.user.id];
    }
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/records/results - lab results for patient
router.get('/results', authenticate, requireRole('patient'), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM lab_results WHERE patient_id = $1 ORDER BY result_date DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/records - create medical record (doctor)
router.post('/', authenticate, requireRole('doctor', 'admin'), async (req, res) => {
  try {
    const { patient_id, title, diagnosis, notes, record_date } = req.body;
    if (!patient_id || !title) {
      return res.status(400).json({ error: 'patient_id et title requis' });
    }

    const result = await db.query(
      `INSERT INTO medical_records (patient_id, doctor_id, title, diagnosis, notes, record_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [patient_id, req.user.id, title, diagnosis || null, notes || null, record_date || new Date()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/records/patients - list patients for doctor
router.get('/patients/list', authenticate, requireRole('doctor', 'admin'), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, full_name, email, phone FROM users WHERE role = 'patient' ORDER BY full_name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
