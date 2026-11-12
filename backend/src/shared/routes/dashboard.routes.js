import { Router } from "express";
import pool from "../utils/db.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

/**
 * @openapi
 * /api/dashboard:
 *   get:
 *     summary: Récupère les statistiques du tableau de bord (adapté au rôle)
 *     description: Renvoie des données différentes si l'utilisateur est un patient ou un praticien.
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
 *               practitioner:
 *                 summary: Réponse pour un praticien
 *                 value:
 *                   role: practitioner
 *                   stats:
 *                     today_appointments: 5
 *                     pending_appointments: 1
 *                     total_patients: 42
 *                   today: []
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Rôle non autorisé (l'admin utilise /api/admin/stats)
 *       500:
 *         description: Erreur serveur
 */

// Dashboard patient / praticien. L'admin a son propre endpoint : GET /api/admin/stats
router.get(
  "/",
  authenticate,
  requireRole("patient", "practitioner"),
  async (req, res) => {
    try {
      const { id, role } = req.user;

      // ----- Patient -----
      if (role === "patient") {
        const [appts, records, results, upcoming] = await Promise.all([
          pool.query(
            `SELECT COUNT(*)::int AS n FROM appointments
             WHERE patient_id = $1 AND status IN ('pending','confirmed')`,
            [id],
          ),
          pool.query(
            `SELECT COUNT(*)::int AS n FROM medical_records WHERE patient_id = $1`,
            [id],
          ),
          pool.query(
            `SELECT COUNT(*)::int AS n FROM lab_results WHERE patient_id = $1`,
            [id],
          ),
          // Le frontend lit "doctor_name" : on garde cet alias
          pool.query(
            `SELECT a.*, u.full_name AS doctor_name, u.specialty
             FROM appointments a
             JOIN users u ON a.practitioner_id = u.id
             WHERE a.patient_id = $1
               AND a.appointment_date >= CURRENT_DATE
               AND a.status <> 'cancelled'
             ORDER BY a.appointment_date, a.appointment_time
             LIMIT 5`,
            [id],
          ),
        ]);

        return res.json({
          role: "patient",
          stats: {
            upcoming_appointments: appts.rows[0].n,
            medical_records: records.rows[0].n,
            lab_results: results.rows[0].n,
          },
          upcoming: upcoming.rows,
        });
      }

      // ----- Praticien -----
      const [today, pending, patients, agenda] = await Promise.all([
        pool.query(
          `SELECT COUNT(*)::int AS n FROM appointments
           WHERE practitioner_id = $1 AND appointment_date = CURRENT_DATE
             AND status <> 'cancelled'`,
          [id],
        ),
        pool.query(
          `SELECT COUNT(*)::int AS n FROM appointments
           WHERE practitioner_id = $1 AND status = 'pending'`,
          [id],
        ),
        pool.query(
          `SELECT COUNT(DISTINCT patient_id)::int AS n FROM appointments
           WHERE practitioner_id = $1`,
          [id],
        ),
        // Agenda du jour : le frontend lit "today", "patient_name" et "clinique_ville"
        pool.query(
          `SELECT a.id, a.appointment_date, a.appointment_time, a.reason, a.type, a.status,
                  p.full_name AS patient_name,
                  c.nom AS clinique_nom, c.ville AS clinique_ville
           FROM appointments a
           JOIN users p ON p.id = a.patient_id
           LEFT JOIN cliniques c ON c.id = a.clinique_id
           WHERE a.practitioner_id = $1
             AND a.appointment_date = CURRENT_DATE
             AND a.status <> 'cancelled'
           ORDER BY a.appointment_time`,
          [id],
        ),
      ]);

      res.json({
        role: "practitioner",
        stats: {
          today_appointments: today.rows[0].n,
          pending_appointments: pending.rows[0].n,
          total_patients: patients.rows[0].n,
        },
        today: agenda.rows,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  },
);

export default router;