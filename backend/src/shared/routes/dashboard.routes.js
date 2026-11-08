
import { Router } from "express";
import pool from "../utils/db.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  try {
    // Dashboard patient
    if (req.user.role === "patient") {
      const [appts, records, results] = await Promise.all([
        pool.query(
          `SELECT COUNT(*) FROM appointments
           WHERE patient_id = $1
           AND status IN ('pending', 'confirmed')`,
          [req.user.id]
        ),
        pool.query(
          `SELECT COUNT(*) FROM medical_records
           WHERE patient_id = $1`,
          [req.user.id]
        ),
        pool.query(
          `SELECT COUNT(*) FROM lab_results
           WHERE patient_id = $1`,
          [req.user.id]
        ),
      ]);

      const upcoming = await pool.query(
        `SELECT a.*, u.full_name AS doctor_name, u.specialty
         FROM appointments a
         JOIN users u ON a.practitioner_id = u.id
         WHERE a.patient_id = $1
         AND a.appointment_date >= CURRENT_DATE
         ORDER BY a.appointment_date, a.appointment_time
         LIMIT 5`,
        [req.user.id]
      );

      return res.json({
        role: "patient",
        stats: {
          upcoming_appointments: parseInt(appts.rows[0].count, 10),
          medical_records: parseInt(records.rows[0].count, 10),
          lab_results: parseInt(results.rows[0].count, 10),
        },
        upcoming: upcoming.rows,
      });
    }

    // Dashboard praticien
    const [today, pending, patients, todayAppointments] =
      await Promise.all([
        pool.query(
          `SELECT COUNT(*) FROM appointments
           WHERE practitioner_id = $1
           AND appointment_date = CURRENT_DATE`,
          [req.user.id]
        ),
        pool.query(
          `SELECT COUNT(*) FROM appointments
           WHERE practitioner_id = $1
           AND status = 'pending'`,
          [req.user.id]
        ),
        pool.query(
          `SELECT COUNT(DISTINCT patient_id) FROM appointments
           WHERE practitioner_id = $1`,
          [req.user.id]
        ),
        pool.query(
          `SELECT a.*, u.full_name AS patient_name
           FROM appointments a
           JOIN users u ON a.patient_id = u.id
           WHERE a.practitioner_id = $1
           AND a.appointment_date = CURRENT_DATE
           ORDER BY a.appointment_time`,
          [req.user.id]
        ),
      ]);

    return res.json({
      role: req.user.role,
      stats: {
        today_appointments: parseInt(today.rows[0].count, 10),
        pending_appointments: parseInt(pending.rows[0].count, 10),
        total_patients: parseInt(patients.rows[0].count, 10),
      },
      today: todayAppointments.rows,
    });

  } catch (err) {
    console.error("Erreur dashboard :", err);

    if (res.headersSent) {
      return;
    }

    return res.status(500).json({
      error: "Erreur serveur",
    });
  }
});

export default router;
