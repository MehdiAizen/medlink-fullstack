import { Router } from 'express';
import pool from '../utils/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (req, res) => {
    try {
        const { id, role } = req.user;

        // ----- Tableau de bord patient -----
        if (role === 'patient') {
            const [appts, records, results, upcoming] = await Promise.all([
                pool.query(
                    `SELECT COUNT(*) FROM appointments WHERE patient_id = $1 AND status IN ('pending','confirmed')`,
                    [id]
                ),
                pool.query(`SELECT COUNT(*) FROM medical_records WHERE patient_id = $1`, [id]),
                pool.query(`SELECT COUNT(*) FROM lab_results WHERE patient_id = $1`, [id]),
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
                    [id]
                ),
            ]);

            return res.json({
                role: 'patient',
                stats: {
                    upcoming_appointments: parseInt(appts.rows[0].count, 10),
                    medical_records: parseInt(records.rows[0].count, 10),
                    lab_results: parseInt(results.rows[0].count, 10),
                },
                upcoming: upcoming.rows,
            });
        }

        // ----- Tableau de bord praticien -----
        if (role === 'practitioner') {
            const [todayCount, pending, patients, todayList] = await Promise.all([
                pool.query(
                    `SELECT COUNT(*) FROM appointments
                     WHERE practitioner_id = $1 AND appointment_date = CURRENT_DATE AND status <> 'cancelled'`,
                    [id]
                ),
                pool.query(
                    `SELECT COUNT(*) FROM appointments WHERE practitioner_id = $1 AND status = 'pending'`,
                    [id]
                ),
                pool.query(
                    `SELECT COUNT(DISTINCT patient_id) FROM appointments WHERE practitioner_id = $1`,
                    [id]
                ),
                // Agenda du jour : le frontend lit "data.today" et "patient_name"
                pool.query(
                    `SELECT a.id, a.appointment_date, a.appointment_time, a.reason, a.type, a.status,
                            u.full_name AS patient_name, c.nom AS clinique_nom, c.ville
                     FROM appointments a
                     JOIN users u ON u.id = a.patient_id
                     LEFT JOIN cliniques c ON c.id = a.clinique_id
                     WHERE a.practitioner_id = $1
                       AND a.appointment_date = CURRENT_DATE
                       AND a.status <> 'cancelled'
                     ORDER BY a.appointment_time`,
                    [id]
                ),
            ]);

            return res.json({
                role: 'practitioner',
                stats: {
                    today_appointments: parseInt(todayCount.rows[0].count, 10),
                    pending_appointments: parseInt(pending.rows[0].count, 10),
                    total_patients: parseInt(patients.rows[0].count, 10),
                },
                today: todayList.rows,
            });
        }

        // ----- Autres rôles (admin) : pas encore de tableau de bord -----
        return res.status(403).json({ error: 'Tableau de bord non disponible pour ce rôle' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

export default router;