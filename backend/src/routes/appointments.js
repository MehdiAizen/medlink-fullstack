const express = require('express');
const db = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/appointments - list appointments (filtered by role)
router.get('/', authenticate, async (req, res) => {
  try {
    let query, params;
    if (req.user.role === 'patient') {
      query = `
        SELECT a.*, u.full_name AS doctor_name, u.specialty
        FROM appointments a
        JOIN users u ON a.doctor_id = u.id
        WHERE a.patient_id = $1
        ORDER BY a.appointment_date ASC, a.appointment_time ASC
      `;
      params = [req.user.id];
    } else {
      // doctor or admin
      query = `
        SELECT a.*, p.full_name AS patient_name
        FROM appointments a
        JOIN users p ON a.patient_id = p.id
        WHERE a.doctor_id = $1
        ORDER BY a.appointment_date ASC, a.appointment_time ASC
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

// POST /api/appointments - create appointment (patient)
router.post('/', authenticate, requireRole('patient'), async (req, res) => {
  try {
    const { doctor_id, appointment_date, appointment_time, reason, type } = req.body;
    if (!doctor_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    const result = await db.query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, type, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [req.user.id, doctor_id, appointment_date, appointment_time, reason || null, type || 'consultation']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PATCH /api/appointments/:id - update status (doctor)
router.patch('/:id', authenticate, requireRole('doctor', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const result = await db.query(
      `UPDATE appointments SET status = $1, updated_at = NOW()
       WHERE id = $2 AND doctor_id = $3
       RETURNING *`,
      [status, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/appointments/doctors - list available doctors
router.get('/doctors/list', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, full_name, specialty FROM users WHERE role = 'doctor' ORDER BY full_name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
