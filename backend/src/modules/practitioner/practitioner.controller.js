import * as service from './practitioner.service.js';

export async function getAppointments(req, res) {
  try {
    const appointments = await service.listAppointments(req.user.id);
    res.json({ success: true, data: appointments });
  } catch (err) {
    console.error('[practitioner] getAppointments:', err);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

export async function patchAppointmentStatus(req, res) {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, error: 'Le champ status est requis' });

    const updated = await service.updateAppointmentStatus(req.user.id, req.params.id, status);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('[practitioner] patchAppointmentStatus:', err);
    res.status(err.status || 500).json({ success: false, error: err.message || 'Erreur serveur' });
  }
}

export async function getDisponibilites(req, res) {
  try {
    const list = await service.listDisponibilites(req.user.id);
    res.json({ success: true, data: list });
  } catch (err) {
    console.error('[practitioner] getDisponibilites:', err);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

export async function postDisponibilite(req, res) {
  try {
    const created = await service.createDisponibilite(req.user.id, req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error('[practitioner] postDisponibilite:', err);
    res.status(err.status || 500).json({ success: false, error: err.message || 'Erreur serveur' });
  }
}

export async function removeDisponibilite(req, res) {
  try {
    const result = await service.deleteDisponibilite(req.user.id, req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[practitioner] removeDisponibilite:', err);
    res.status(err.status || 500).json({ success: false, error: err.message || 'Erreur serveur' });
  }
}

export async function searchPatients(req, res) {
  try {
    const q = req.query.q || '';
    const patients = await service.searchMyPatients(req.user.id, q);
    res.json({ success: true, data: patients, count: patients.length });
  } catch (err) {
    console.error('[practitioner] searchPatients:', err);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}

export async function getPatientRecords(req, res) {
  try {
    const patientId = parseInt(req.params.id, 10);
    if (Number.isNaN(patientId)) return res.status(400).json({ success: false, error: 'ID patient invalide' });

    const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : req.socket?.remoteAddress || null;
    const data = await service.getPatientRecords(req.user.id, patientId, ip);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[practitioner] getPatientRecords:', err);
    res.status(err.status || 500).json({ success: false, error: err.message || 'Erreur serveur' });
  }
}

export async function postMedicalRecord(req, res) {
  try {
    const record = await service.createMedicalRecord(req.user.id, req.body);
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    console.error('[practitioner] postMedicalRecord:', err);
    res.status(err.status || 500).json({ success: false, error: err.message || 'Erreur serveur' });
  }
}

export async function postLabResult(req, res) {
  try {
    const lab = await service.createLabResult(req.user.id, req.body);
    res.status(201).json({ success: true, data: lab });
  } catch (err) {
    console.error('[practitioner] postLabResult:', err);
    res.status(err.status || 500).json({ success: false, error: err.message || 'Erreur serveur' });
  }
}

export async function getPatientResults(req, res) {
  try {
    const patientId = parseInt(req.params.id, 10);
    if (Number.isNaN(patientId)) return res.status(400).json({ success: false, error: 'ID patient invalide' });
    
    const results = await service.getPatientResults(req.user.id, patientId);
    res.json({ success: true, data: results });
  } catch (err) {
    console.error('[practitioner] getPatientResults:', err);
    res.status(err.status || 500).json({ success: false, error: err.message || 'Erreur serveur' });
  }
}

// ✅ 3. NOUVELLE FONCTION CONTRÔLEUR AJOUTÉE ICI
export async function listRecords(req, res) {
  try {
    console.log("🚀 DEBUG: La route /api/practitioner/records a été appelée avec succès !");
    const records = await service.listAllRecords(req.user.id);
    res.json({ success: true, data: records });
  } catch (err) {
    console.error('[practitioner] listRecords:', err);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
}