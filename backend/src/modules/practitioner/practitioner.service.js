import pool from '../../shared/utils/db.js';

/**
 * Liste les RDV du praticien connecté (US-19 — agenda multi-sites).
 * Champs alignés sur la page Agenda :
 * id, patient_name, appointment_date, appointment_time, reason, type, status,
 * clinique_id, clinique_nom, clinique_ville
 */
export async function listAppointments(practitionerId) {
  const result = await pool.query(
    `SELECT
       a.id,
       a.appointment_date,
       a.appointment_time,
       a.reason,
       a.type,
       a.status,
       a.clinique_id,
       c.nom   AS clinique_nom,
       c.ville AS clinique_ville,
       p.id    AS patient_id,
       p.full_name AS patient_name
     FROM appointments a
     JOIN users p ON a.patient_id = p.id
     LEFT JOIN cliniques c ON a.clinique_id = c.id
     WHERE a.practitioner_id = $1
     ORDER BY a.appointment_date ASC, a.appointment_time ASC`,
    [practitionerId]
  );
  return result.rows;
}

export async function updateAppointmentStatus(practitionerId, appointmentId, status) {
  const allowed = ['pending', 'confirmed', 'cancelled', 'completed'];
  if (!allowed.includes(status)) {
    const err = new Error('Statut invalide');
    err.status = 400;
    throw err;
  }

  const result = await pool.query(
    `UPDATE appointments
     SET status = $1, updated_at = NOW()
     WHERE id = $2 AND practitioner_id = $3
     RETURNING id, status, appointment_date, appointment_time, reason, type`,
    [status, appointmentId, practitionerId]
  );

  if (result.rows.length === 0) {
    const err = new Error('Rendez-vous non trouvé');
    err.status = 404;
    throw err;
  }

  return result.rows[0];
}

/** Liste les disponibilités du praticien (US-18, US-21) */
export async function listDisponibilites(practitionerId) {
  const result = await pool.query(
    `SELECT d.*, c.nom AS clinique_nom, c.ville AS clinique_ville
     FROM disponibilites d
     JOIN cliniques c ON d.clinique_id = c.id
     WHERE d.practitioner_id = $1
     ORDER BY d.date_debut ASC, d.heure_debut ASC`,
    [practitionerId]
  );
  return result.rows;
}

/** Créer un créneau ou un blocage (US-18, US-21) */
export async function createDisponibilite(practitionerId, data) {
  const {
    clinique_id,
    date_debut,
    date_fin,
    heure_debut,
    heure_fin,
    type = 'disponible',
    motif = null,
  } = data;

  if (!clinique_id || !date_debut || !date_fin || !heure_debut || !heure_fin) {
    const err = new Error('Champs obligatoires manquants');
    err.status = 400;
    throw err;
  }

  const allowed = ['disponible', 'bloque', 'absence'];
  if (!allowed.includes(type)) {
    const err = new Error('Type invalide');
    err.status = 400;
    throw err;
  }

  // Vérifier que le praticien est bien affecté à cette clinique
  const link = await pool.query(
    `SELECT 1 FROM practitioner_clinique
     WHERE practitioner_id = $1 AND clinique_id = $2`,
    [practitionerId, clinique_id]
  );
  if (link.rows.length === 0) {
    const err = new Error('Vous n\'êtes pas affecté à cette clinique');
    err.status = 403;
    throw err;
  }

  const result = await pool.query(
    `INSERT INTO disponibilites
       (practitioner_id, clinique_id, date_debut, date_fin, heure_debut, heure_fin, type, motif)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [practitionerId, clinique_id, date_debut, date_fin, heure_debut, heure_fin, type, motif]
  );
  return result.rows[0];
}

/** Supprimer un créneau / blocage (uniquement le sien) */
export async function deleteDisponibilite(practitionerId, id) {
  const result = await pool.query(
    `DELETE FROM disponibilites
     WHERE id = $1 AND practitioner_id = $2
     RETURNING id`,
    [id, practitionerId]
  );
  if (result.rows.length === 0) {
    const err = new Error('Disponibilité non trouvée');
    err.status = 404;
    throw err;
  }
  return { deleted: true };
}

/** US-22 : recherche parmi MES patients uniquement */
export async function searchMyPatients(practitionerId, q = '') {
  const term = `%${q.trim()}%`;

  const result = await pool.query(
    `SELECT DISTINCT
       u.id,
       u.full_name,
       u.email,
       u.phone
     FROM users u
     WHERE u.role = 'patient'
       AND (
         EXISTS (
           SELECT 1 FROM appointments a
           WHERE a.patient_id = u.id AND a.practitioner_id = $1
         )
         OR EXISTS (
           SELECT 1 FROM medical_records m
           WHERE m.patient_id = u.id AND m.practitioner_id = $1
         )
       )
       AND (
         $2 = '%%'
         OR u.full_name ILIKE $2
         OR u.email ILIKE $2
         OR CAST(u.id AS TEXT) = TRIM($3)
       )
     ORDER BY u.full_name ASC
     LIMIT 50`,
    [practitionerId, term, q.trim()]
  );

  return result.rows;
}

/**
 * US-23 + US-47 :
 * accès au dossier d'un patient (uniquement s'il est "mien")
 * + écriture obligatoire dans journal_audit
 */
export async function getPatientRecords(practitionerId, patientId, ip = null) {
  // 1. Vérifier que ce patient appartient bien à ce praticien
  const check = await pool.query(
    `SELECT 1
     FROM users u
     WHERE u.id = $1 AND u.role = 'patient'
       AND (
         EXISTS (
           SELECT 1 FROM appointments a
           WHERE a.patient_id = u.id AND a.practitioner_id = $2
         )
         OR EXISTS (
           SELECT 1 FROM medical_records m
           WHERE m.patient_id = u.id AND m.practitioner_id = $2
         )
       )`,
    [patientId, practitionerId]
  );

  if (check.rows.length === 0) {
    // Tentative non autorisée → journaliser aussi (US-39 / US-47)
    await pool.query(
      `INSERT INTO journal_audit (utilisateur_id, action, ressource, adresse_ip)
       VALUES ($1, 'ACCESS_DENIED', $2, $3)`,
      [practitionerId, `Dossier patient #${patientId}`, ip]
    );
    const err = new Error('Accès non autorisé à ce dossier');
    err.status = 403;
    throw err;
  }

  // 2. Récupérer le dossier
  const records = await pool.query(
    `SELECT
       m.id,
       m.title,
       m.diagnosis,
       m.notes,
       m.record_date,
       m.created_at,
       u.full_name AS practitioner_name
     FROM medical_records m
     LEFT JOIN users u ON m.practitioner_id = u.id
     WHERE m.patient_id = $1
     ORDER BY m.record_date DESC, m.created_at DESC`,
    [patientId]
  );

  // 3. Journaliser l'accès autorisé (US-47)
  await pool.query(
    `INSERT INTO journal_audit (utilisateur_id, action, ressource, adresse_ip)
     VALUES ($1, 'VIEW_RECORD', $2, $3)`,
    [practitionerId, `Dossier patient #${patientId}`, ip]
  );

  // 4. Infos patient (sans données inutiles)
  const patient = await pool.query(
    `SELECT id, full_name, email, phone FROM users WHERE id = $1`,
    [patientId]
  );

  return {
    patient: patient.rows[0],
    records: records.rows,
  };
}

/** US-24 : rédiger un compte-rendu de consultation */
export async function createMedicalRecord(practitionerId, data) {
  const { patient_id, title, diagnosis, notes, record_date } = data;

  if (!patient_id || !title) {
    const err = new Error('patient_id et title sont obligatoires');
    err.status = 400;
    throw err;
  }

  // Le patient doit être lié au praticien (RDV ou dossier existant)
  const check = await pool.query(
    `SELECT 1 FROM users u
     WHERE u.id = $1 AND u.role = 'patient'
       AND (
         EXISTS (SELECT 1 FROM appointments a WHERE a.patient_id = u.id AND a.practitioner_id = $2)
         OR EXISTS (SELECT 1 FROM medical_records m WHERE m.patient_id = u.id AND m.practitioner_id = $2)
       )`,
    [patient_id, practitionerId]
  );

  if (check.rows.length === 0) {
    const err = new Error('Patient non autorisé pour ce praticien');
    err.status = 403;
    throw err;
  }

  const result = await pool.query(
    `INSERT INTO medical_records
       (patient_id, practitioner_id, title, diagnosis, notes, record_date)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6::date, CURRENT_DATE))
     RETURNING id, patient_id, practitioner_id, title, diagnosis, notes, record_date, created_at`,
    [patient_id, practitionerId, title, diagnosis || null, notes || null, record_date || null]
  );

  // Journal d'audit
  await pool.query(
    `INSERT INTO journal_audit (utilisateur_id, action, ressource)
     VALUES ($1, 'CREATE_RECORD', $2)`,
    [practitionerId, `Compte-rendu #${result.rows[0].id} patient #${patient_id}`]
  );

  return result.rows[0];
}

/** US-26 : historique des comptes-rendus d'un patient (déjà couvert par getPatientRecords) */

/** US-25 : publier un résultat d'examen */
export async function createLabResult(practitionerId, data) {
  const {
    patient_id,
    test_name,
    result_value,
    unit,
    reference_range,
    status = 'normal',
    result_date,
  } = data;

  if (!patient_id || !test_name) {
    const err = new Error('patient_id et test_name sont obligatoires');
    err.status = 400;
    throw err;
  }

  const allowedStatus = ['normal', 'abnormal', 'critical'];
  if (!allowedStatus.includes(status)) {
    const err = new Error('Statut invalide (normal | abnormal | critical)');
    err.status = 400;
    throw err;
  }

  // Même contrôle d'appartenance
  const check = await pool.query(
    `SELECT 1 FROM users u
     WHERE u.id = $1 AND u.role = 'patient'
       AND (
         EXISTS (SELECT 1 FROM appointments a WHERE a.patient_id = u.id AND a.practitioner_id = $2)
         OR EXISTS (SELECT 1 FROM medical_records m WHERE m.patient_id = u.id AND m.practitioner_id = $2)
       )`,
    [patient_id, practitionerId]
  );

  if (check.rows.length === 0) {
    const err = new Error('Patient non autorisé pour ce praticien');
    err.status = 403;
    throw err;
  }

  const result = await pool.query(
    `INSERT INTO lab_results
       (patient_id, test_name, result_value, unit, reference_range, status, result_date)
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7::date, CURRENT_DATE))
     RETURNING *`,
    [
      patient_id,
      test_name,
      result_value || null,
      unit || null,
      reference_range || null,
      status,
      result_date || null,
    ]
  );

  await pool.query(
    `INSERT INTO journal_audit (utilisateur_id, action, ressource)
     VALUES ($1, 'PUBLISH_RESULT', $2)`,
    [practitionerId, `Résultat #${result.rows[0].id} patient #${patient_id}`]
  );

  return result.rows[0];
}

/** Liste des résultats d'un patient (pour le praticien) */
export async function getPatientResults(practitionerId, patientId) {
  const check = await pool.query(
    `SELECT 1 FROM users u
     WHERE u.id = $1 AND u.role = 'patient'
       AND (
         EXISTS (SELECT 1 FROM appointments a WHERE a.patient_id = u.id AND a.practitioner_id = $2)
         OR EXISTS (SELECT 1 FROM medical_records m WHERE m.patient_id = u.id AND m.practitioner_id = $2)
       )`,
    [patientId, practitionerId]
  );

  if (check.rows.length === 0) {
    const err = new Error('Accès non autorisé');
    err.status = 403;
    throw err;
  }

  const result = await pool.query(
    `SELECT id, test_name, result_value, unit, reference_range, status, result_date, created_at
     FROM lab_results
     WHERE patient_id = $1
     ORDER BY result_date DESC, created_at DESC`,
    [patientId]
  );

  return result.rows;
}