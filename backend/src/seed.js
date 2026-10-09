const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  console.log('🌱 Seeding MedLink database...');

  // Create tables
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
      specialty VARCHAR(100),
      phone VARCHAR(30),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER NOT NULL REFERENCES users(id),
      doctor_id INTEGER NOT NULL REFERENCES users(id),
      appointment_date DATE NOT NULL,
      appointment_time TIME NOT NULL,
      reason TEXT,
      type VARCHAR(50) DEFAULT 'consultation',
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS medical_records (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER NOT NULL REFERENCES users(id),
      doctor_id INTEGER REFERENCES users(id),
      title VARCHAR(255) NOT NULL,
      diagnosis TEXT,
      notes TEXT,
      record_date DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS lab_results (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER NOT NULL REFERENCES users(id),
      test_name VARCHAR(255) NOT NULL,
      result_value VARCHAR(100),
      unit VARCHAR(50),
      reference_range VARCHAR(100),
      status VARCHAR(20) DEFAULT 'normal' CHECK (status IN ('normal', 'abnormal', 'critical')),
      result_date DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  const hash = await bcrypt.hash('password123', 10);

  // Clear existing data (for re-seeding)
  await db.query('TRUNCATE lab_results, medical_records, appointments, users RESTART IDENTITY CASCADE');

  // Users
  const users = await db.query(
    `INSERT INTO users (email, password_hash, full_name, role, specialty, phone) VALUES
      ('patient@medlink.tn', $1, 'Amine Ben Salah', 'patient', NULL, '+216 98 123 456'),
      ('sara.patient@medlink.tn', $1, 'Sara Trabelsi', 'patient', NULL, '+216 22 456 789'),
      ('doctor@medlink.tn', $1, 'Dr. Karim Mansouri', 'doctor', 'Cardiologie', '+216 71 234 567'),
      ('pediatre@medlink.tn', $1, 'Dr. Leila Gharbi', 'doctor', 'Pédiatrie', '+216 71 345 678'),
      ('generaliste@medlink.tn', $1, 'Dr. Youssef Khelifi', 'doctor', 'Médecine Générale', '+216 71 456 789')
     RETURNING id, email, role`,
    [hash]
  );

  const patient1 = users.rows[0].id;
  const patient2 = users.rows[1].id;
  const doctor1 = users.rows[2].id;
  const doctor2 = users.rows[3].id;
  const doctor3 = users.rows[4].id;

  // Appointments
  await db.query(
    `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, type, status) VALUES
      ($1, $3, CURRENT_DATE + 2, '09:30', 'Contrôle tension artérielle', 'consultation', 'confirmed'),
      ($1, $5, CURRENT_DATE + 5, '14:00', 'Bilan annuel', 'consultation', 'pending'),
      ($2, $4, CURRENT_DATE + 1, '10:15', 'Vaccination enfant', 'consultation', 'confirmed'),
      ($1, $3, CURRENT_DATE - 10, '11:00', 'Suivi post-infarctus', 'suivi', 'completed'),
      ($2, $5, CURRENT_DATE, '16:30', 'Consultation générale', 'consultation', 'pending')`,
    [patient1, patient2, doctor1, doctor2, doctor3]
  );

  // Medical records
  await db.query(
    `INSERT INTO medical_records (patient_id, doctor_id, title, diagnosis, notes, record_date) VALUES
      ($1, $3, 'Consultation cardiologique', 'Hypertension artérielle grade 1', 'Patient stable. Traitement par IEC maintenu. Contrôle dans 3 mois.', CURRENT_DATE - 10),
      ($1, $5, 'Bilan de santé annuel', 'État général satisfaisant', 'Aucun point d''alerte. Recommandations hygiéno-diététiques.', CURRENT_DATE - 45),
      ($2, $4, 'Consultation pédiatrique', 'Croissance normale', 'Vaccination à jour. Prochain contrôle dans 6 mois.', CURRENT_DATE - 20)`,
    [patient1, patient2, doctor1, doctor2, doctor3]
  );

  // Lab results
  await db.query(
    `INSERT INTO lab_results (patient_id, test_name, result_value, unit, reference_range, status, result_date) VALUES
      ($1, 'Cholestérol total', '1.95', 'g/L', '1.50 - 2.00', 'normal', CURRENT_DATE - 12),
      ($1, 'HDL Cholestérol', '0.48', 'g/L', '> 0.40', 'normal', CURRENT_DATE - 12),
      ($1, 'LDL Cholestérol', '1.22', 'g/L', '< 1.60', 'normal', CURRENT_DATE - 12),
      ($1, 'Glycémie à jeun', '0.98', 'g/L', '0.70 - 1.10', 'normal', CURRENT_DATE - 12),
      ($1, 'Créatinine', '9.2', 'mg/L', '6.0 - 12.0', 'normal', CURRENT_DATE - 12),
      ($1, 'TSH', '2.1', 'mUI/L', '0.4 - 4.0', 'normal', CURRENT_DATE - 30),
      ($2, 'Hémoglobine', '13.2', 'g/dL', '12.0 - 16.0', 'normal', CURRENT_DATE - 15)`,
    [patient1, patient2]
  );

  console.log('✅ Seed completed successfully!');
  console.log('');
  console.log('Comptes de démo :');
  console.log('  Patient  : patient@medlink.tn  / password123');
  console.log('  Patient  : sara.patient@medlink.tn / password123');
  console.log('  Médecin  : doctor@medlink.tn   / password123  (Cardiologie)');
  console.log('  Médecin  : pediatre@medlink.tn / password123  (Pédiatrie)');
  console.log('  Médecin  : generaliste@medlink.tn / password123 (Médecine Générale)');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
