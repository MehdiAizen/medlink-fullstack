const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard - stats for current user
router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'patient') {
      const [appts, records, results] = await Promise.all([
        db.query(
          `SELECT COUNT(*) FROM appointments WHERE patient_id = $1 AND status IN ('pending','confirmed') AND appointment_date >= CURRENT_DATE`,
          [req.user.id]
        ),
        db.query(`SELECT COUNT(*) FROM medical_records WHERE patient_id = $1`, [req.user.id]),
        db.query(`SELECT COUNT(*) FROM lab_results WHERE patient_id = $1`, [req.user.id]),
      ]);

      const upcoming = await db.query(
        `SELECT a.*, u.full_name AS doctor_name, u.specialty
         FROM appointments a
         JOIN users u ON a.doctor_id = u.id
         WHERE a.patient_id = $1 AND a.appointment_date >= CURRENT_DATE AND a.status != 'cancelled'
         ORDER BY a.appointment_date, a.appointment_time
         LIMIT 5`,
        [req.user.id]
      );

      return res.json({
        role: 'patient',
        stats: {
          upcoming_appointments: parseInt(appts.rows[0].count),
          medical_records: parseInt(records.rows[0].count),
          lab_results: parseInt(results.rows[0].count),
        },
        upcoming: upcoming.rows,
      });
    }

    // Doctor dashboard
    const [today, pending, patients] = await Promise.all([
      db.query(
        `SELECT COUNT(*) FROM appointments WHERE doctor_id = $1 AND appointment_date = CURRENT_DATE AND status != 'cancelled'`,
        [req.user.id]
      ),
      db.query(
        `SELECT COUNT(*) FROM appointments WHERE doctor_id = $1 AND status = 'pending'`,
        [req.user.id]
      ),
      db.query(
        `SELECT COUNT(DISTINCT patient_id) FROM appointments WHERE doctor_id = $1`,
        [req.user.id]
      ),
    ]);

    const todayList = await db.query(
      `SELECT a.*, p.full_name AS patient_name
       FROM appointments a
       JOIN users p ON a.patient_id = p.id
       WHERE a.doctor_id = $1 AND a.appointment_date = CURRENT_DATE AND a.status != 'cancelled'
       ORDER BY a.appointment_time`,
      [req.user.id]
    );

    res.json({
      role: 'doctor',
      stats: {
        today_appointments: parseInt(today.rows[0].count),
        pending_appointments: parseInt(pending.rows[0].count),
        total_patients: parseInt(patients.rows[0].count),
      },
      today: todayList.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
