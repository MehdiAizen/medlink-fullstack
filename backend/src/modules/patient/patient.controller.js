import {
  listPractitioners,
  listPatientAppointments,
  bookAppointment,
} from "./patient.service.js";

export async function getPractitioners(req, res) {
  try {
    const practitioners = await listPractitioners();
    res.json(practitioners);
  } catch (error) {
    console.error("Erreur lors du chargement des praticiens :", error);
    res.status(500).json({ error: "Impossible de charger les praticiens" });
  }
}

export async function getAppointments(req, res) {
  try {
    const appointments = await listPatientAppointments(req.user.id);
    res.json(appointments);
  } catch (error) {
    console.error("Erreur lors du chargement des rendez-vous :", error);
    res.status(500).json({ error: "Impossible de charger les rendez-vous" });
  }
}

export async function createAppointment(req, res) {
  try {
    const appointment = await bookAppointment(req.user.id, req.body);

    res.status(201).json({
      message: "Rendez-vous demandé avec succès",
      appointment,
    });
  } catch (error) {
    const clientErrors = [
      "Praticien, date et heure sont obligatoires",
      "Praticien invalide",
      "Type de consultation invalide",
      "Format de date invalide",
      "Format de l’heure invalide",
      "Praticien introuvable",
      "Choisissez une date future",
      "Ce créneau est déjà réservé",
    ];

    if (clientErrors.includes(error.message)) {
      return res.status(400).json({ error: error.message });
    }

    console.error("Erreur lors de la réservation :", error);
    res.status(500).json({ error: "Impossible de créer le rendez-vous" });
  }
}
