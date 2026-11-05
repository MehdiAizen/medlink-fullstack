import pool from "../../shared/utils/db.js";

export async function listPractitioners() {
  const result = await pool.query(`
    SELECT
      id,
      full_name,
      specialty
    FROM users
    WHERE role = 'practitioner'
    ORDER BY full_name
  `);

  return result.rows;
}

export async function listPatientAppointments(patientId) {
  const result = await pool.query(
    `
      SELECT
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.reason,
        a.type,
        a.status,
        a.clinique_id,
        u.full_name AS practitioner_name,
        u.specialty,
        c.nom AS clinique_nom,
        c.ville AS clinique_ville
      FROM appointments a
      JOIN users u ON u.id = a.practitioner_id
      LEFT JOIN cliniques c ON c.id = a.clinique_id
      WHERE a.patient_id = $1
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `,
    [patientId],
  );

  return result.rows;
}

export async function bookAppointment(patientId, data) {
  const { doctor_id, appointment_date, appointment_time, reason, type } = data;

  if (!doctor_id || !appointment_date || !appointment_time) {
    throw new Error("Praticien, date et heure sont obligatoires");
  }

  const practitionerId = Number(doctor_id);

  if (!Number.isInteger(practitionerId) || practitionerId <= 0) {
    throw new Error("Praticien invalide");
  }

  const validTypes = ["consultation", "suivi", "urgence", "teleconsultation"];

  if (type && !validTypes.includes(type)) {
    throw new Error("Type de consultation invalide");
  }

  // Vérifier le format de la date et de l'heure.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(appointment_date)) {
    throw new Error("Format de date invalide");
  }

  if (!/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(appointment_time)) {
    throw new Error("Format de l’heure invalide");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Sérialiser les réservations du même praticien pour éviter
    // deux réservations simultanées du même créneau par cette API.
    await client.query("SELECT pg_advisory_xact_lock($1::integer)", [
      practitionerId,
    ]);

    const practitioner = await client.query(
      `SELECT id FROM users
       WHERE id = $1 AND role = 'practitioner'`,
      [practitionerId],
    );

    if (practitioner.rows.length === 0) {
      throw new Error("Praticien introuvable");
    }

    const requestedDate = await client.query(
      `SELECT $1::date AS appointment_date,
              CURRENT_DATE AS today`,
      [appointment_date],
    );

    if (requestedDate.rows[0].appointment_date <= requestedDate.rows[0].today) {
      throw new Error("Choisissez une date future");
    }

    const conflict = await client.query(
      `
        SELECT id
        FROM appointments
        WHERE practitioner_id = $1
          AND appointment_date = $2::date
          AND appointment_time = $3::time
          AND status IN ('pending', 'confirmed')
        LIMIT 1
      `,
      [practitionerId, appointment_date, appointment_time],
    );

    if (conflict.rows.length > 0) {
      throw new Error("Ce créneau est déjà réservé");
    }

    const result = await client.query(
      `
        INSERT INTO appointments (
          patient_id,
          practitioner_id,
          appointment_date,
          appointment_time,
          reason,
          type,
          status
        )
        VALUES ($1, $2, $3::date, $4::time, $5, $6, 'pending')
        RETURNING *
      `,
      [
        patientId,
        practitionerId,
        appointment_date,
        appointment_time,
        reason?.trim() || null,
        type || "consultation",
      ],
    );

    await client.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function cancelAppointment(patientId, appointmentId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Anti-IDOR : on vérifie que le RDV appartient bien au patient
    const check = await client.query(
      `SELECT id, status FROM appointments 
       WHERE id = $1 AND patient_id = $2 FOR UPDATE`,
      [appointmentId, patientId]
    );

    if (check.rows.length === 0) {
      throw new Error("Rendez-vous introuvable ou non autorisé");
    }

    if (check.rows[0].status === "cancelled") {
      throw new Error("Ce rendez-vous est déjà annulé");
    }

    const result = await client.query(
      `UPDATE appointments 
       SET status = 'cancelled', updated_at = NOW() 
       WHERE id = $1 RETURNING *`,
      [appointmentId]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
