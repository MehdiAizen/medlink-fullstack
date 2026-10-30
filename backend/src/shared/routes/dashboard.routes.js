import { Router } from "express";
import pool from "../utils/db.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

/**
 * @openapi
 * /api/dashboard:
 *   get:
 *     summary: Récupère les statistiques du tableau de bord (adapté au rôle)
 *     description: Renvoie des données différentes si l'utilisateur est un patient ou un médecin.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Succès (le schéma de réponse dépend du rôle de l'utilisateur connecté)
 *         content:
 *           application/json:
 *             examples:
 *               patient:
 *                 summary: Réponse pour un patient
 *                 value:
 *                   role: patient
 *                   stats:
 *                     upcoming_appointments: 2
 *                     medical_records: 1
 *                     lab_results: 3
 *                   upcoming: []
 *               doctor:
 *                 summary: Réponse pour un médecin
 *                 value:
 *                   role: doctor
 *                   stats:
 *                     today_appointments: 5
 *                     pending_appointments: 1
 *                     total_patients: 42
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.get("/", authenticate, async (req, res) => {
  try {
    if (req.user.role === "patient") {
      const [appts, records, results] = await Promise.all([
        pool.query(
          `SELECT COUNT(*) FROM appointments WHERE patient_id = $1 AND status IN ('pending','confirmed')`,
          [req.user.id],
        ),
        pool.query(
          `SELECT COUNT(*) FROM medical_records WHERE patient_id = $1`,
          [req.user.id],
        ),
        pool.query(`SELECT COUNT(*) FROM lab_results WHERE patient_id = $1`, [
          req.user.id,
        ]),
      ]);

      const upcoming = await pool.query(
        `SELECT a.*, u.full_name AS doctor_name, u.specialty FROM appointments a JOIN users u ON a.doctor_id = u.id WHERE a.patient_id = $1 AND a.appointment_date >= CURRENT_DATE ORDER BY a.appointment_date, a.appointment_time LIMIT 5`,
        [req.user.id],
      );
      return res.json({
        role: "patient",
        stats: {
          upcoming_appointments: parseInt(appts.rows[0].count),
          medical_records: parseInt(records.rows[0].count),
          lab_results: parseInt(results.rows[0].count),
        },
        upcoming: upcoming.rows,
      });
    }

    // Dashboard médecin
    const [today, pending, patients] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) FROM appointments WHERE doctor_id = $1 AND appointment_date = CURRENT_DATE`,
        [req.user.id],
      ),
      pool.query(
        `SELECT COUNT(*) FROM appointments WHERE doctor_id = $1 AND status = 'pending'`,
        [req.user.id],
      ),
      pool.query(
        `SELECT COUNT(DISTINCT patient_id) FROM appointments WHERE doctor_id = $1`,
        [req.user.id],
      ),
    ]);

    res.json({
      role: "doctor",
      stats: {
        today_appointments: parseInt(today.rows[0].count),
        pending_appointments: parseInt(pending.rows[0].count),
        total_patients: parseInt(patients.rows[0].count),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
