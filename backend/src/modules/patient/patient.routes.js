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

// Liste des praticiens disponibles.
router.get("/practitioners", getPractitioners);

// Liste des rendez-vous du patient connecté.
router.get("/appointments", getAppointments);

// Création d'un rendez-vous.
router.post("/appointments", createAppointment);

export default router;
