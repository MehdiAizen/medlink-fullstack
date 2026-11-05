import { Router } from 'express';

// backend/routes/dashboard.js (ou dans ton fichier de routes principal)
import express from 'express';
import pool from '../../shared/utils/db.js'; // Adapte le chemin vers ton fichier db.js
// import { authenticateToken, requireRole } from '../middleware/auth.js'; // Décommente si tu as ces middlewares

const router = express.Router();

// Route spécifique pour le tableau de bord PRATICIEN
router.get('/dashboard/practitioner', async (req, res) => {
  try {
    // TODO: Décommente ces lignes quand ton middleware d'auth est prêt
    // authenticateToken(req, res, () => {});
    // requireRole('practitioner')(req, res, () => {});

    const practitionerId = req.user?.id || 4; // Fallback sur l'ID 4 (Dr. Karim) si le JWT n'est pas encore lu

    // 1. Compter les rendez-vous du jour pour ce praticien (US-19)
    const appointmentsToday = await pool.query(
      `SELECT COUNT(*) FROM appointments 
       WHERE practitioner_id = $1 AND appointment_date = CURRENT_DATE`,
      [practitionerId]
    );

    // 2. Compter les comptes-rendus en attente (exemple)
    const pendingReports = await pool.query(
      `SELECT COUNT(*) FROM medical_records 
       WHERE practitioner_id = $1 AND record_date = CURRENT_DATE`,
      [practitionerId]
    );

    // 3. Récupérer les 3 prochains rendez-vous pour l'affichage
    const nextAppointments = await pool.query(
      `SELECT a.appointment_date, a.appointment_time, a.status, u.full_name as patient_name, c.ville as clinic_city
       FROM appointments a
       JOIN users u ON a.patient_id = u.id
       JOIN cliniques c ON a.clinique_id = c.id
       WHERE a.practitioner_id = $1 AND a.appointment_date >= CURRENT_DATE
       ORDER BY a.appointment_date ASC, a.appointment_time ASC
       LIMIT 3`,
      [practitionerId]
    );

    res.json({
      success: true,
      data: {
        appointmentsToday: parseInt(appointmentsToday.rows[0].count),
        pendingReports: parseInt(pendingReports.rows[0].count),
        nextAppointments: nextAppointments.rows
      }
    });

  } catch (error) {
    console.error("❌ Erreur dans le dashboard praticien:", error);
    res.status(500).json({ success: false, message: "Erreur interne du serveur" });
  }
});

export default router;