import { Router } from "express";
import { authenticate, requireRole } from "../../shared/middleware/auth.js";
import {
  getPractitioners,
  getAppointments,
  createAppointment,
} from "./patient.controller.js";

const router = Router();

// Toutes les routes de ce module sont réservées aux patients connectés.
router.use(authenticate, requireRole("patient"));

/**
 * @openapi
 * /api/patient/practitioners:
 *   get:
 *     summary: Liste tous les praticiens disponibles
 *     tags: [Patient - M2]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste récupérée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé (rôle patient requis)
 */
router.get("/practitioners", getPractitioners);

/**
 * @openapi
 * /api/patient/appointments:
 *   get:
 *     summary: Liste les rendez-vous du patient connecté
 *     tags: [Patient - M2]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des rendez-vous
 *       401:
 *         description: Non authentifié
 */
router.get("/appointments", getAppointments);

/**
 * @openapi
 * /api/patient/appointments:
 *   post:
 *     summary: Créer un nouveau rendez-vous
 *     tags: [Patient - M2]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctor_id
 *               - appointment_date
 *               - appointment_time
 *             properties:
 *               doctor_id:
 *                 type: integer
 *                 example: 1
 *               appointment_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-12-01"
 *               appointment_time:
 *                 type: string
 *                 example: "09:00"
 *               reason:
 *                 type: string
 *                 example: "Consultation de suivi"
 *               type:
 *                 type: string
 *                 enum: [consultation, suivi, urgence, teleconsultation]
 *                 example: "consultation"
 *     responses:
 *       201:
 *         description: Rendez-vous créé (statut pending)
 *       400:
 *         description: Erreur de validation (date passée, format invalide)
 *       401:
 *         description: Non authentifié
 *       409:
 *         description: Créneau déjà réservé
 */
router.post("/appointments", createAppointment);

export default router;
