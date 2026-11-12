import keycloak from '../keycloak.js';

const API_BASE = "/api";

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Rafraîchir le token si nécessaire
  if (keycloak.authenticated) {
    await keycloak.updateToken(30);
    headers.Authorization = `Bearer ${keycloak.token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Erreur ${res.status}`);
  }
  return data;
}

// Routes publiques : pas de token. On garde les erreurs par champ (err.fields).
async function publicPost(path, payload) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Erreur ${res.status}`);
    err.status = res.status;
    err.fields = data.fields || {};
    throw err;
  }
  return data;
}

const qs = (params = {}) => {
  const q = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== '' && v != null)
  ).toString();
  return q ? `?${q}` : '';
};
const withBody = (method, body) => ({ method, body: JSON.stringify(body) });

// Rôle lu dans le token Keycloak (realm_access.roles), pas dans un claim "role"
function currentRole() {
  const roles = keycloak.tokenParsed?.realm_access?.roles || [];
  return ['admin', 'practitioner', 'patient'].find((r) => roles.includes(r)) || null;
}

const byRole = (map) => (...args) => {
  const fn = map[currentRole()];
  if (!fn) return Promise.reject(new Error('Action non disponible pour votre rôle'));
  return fn(...args);
};

// --- Module AUTH ---
const auth = {
  me: () => request('/auth/me'),
  register: (payload) => publicPost('/auth/register', payload),
  practitionerOptions: () => request('/auth/practitioner-options'),
  requestPractitioner: (payload) => publicPost('/auth/practitioner-requests', payload),
};

// --- Module PATIENT ---
const patient = {
  practitioners: () => request('/patient/practitioners'),
  doctors: () => request('/patient/doctors'),
  appointments: {
    list: () => request('/patient/appointments'),
    create: (data) => request('/patient/appointments', withBody('POST', data)),
    cancel: (id) => request(`/patient/appointments/${id}/cancel`, { method: 'PATCH' }),
    reschedule: (id, data) =>
      request(`/patient/appointments/${id}/reschedule`, withBody('PATCH', data)),
  },
  cancel: (id) => request(`/patient/appointments/${id}/cancel`, { method: 'PATCH' }),
  records: {
    list: () => request('/patient/records'),
    results: () => request('/patient/records/results'),
  },
};

// --- Module PRACTITIONER ---
const practitioner = {
  dashboard: () => request('/dashboard'),
  appointments: {
    list: () => request('/practitioner/appointments'),
    updateStatus: (id, status) =>
      request(`/practitioner/appointments/${id}`, withBody('PATCH', { status })),
  },
  disponibilites: {
    list: () => request('/practitioner/disponibilites'),
    create: (data) => request('/practitioner/disponibilites', withBody('POST', data)),
    remove: (id) => request(`/practitioner/disponibilites/${id}`, { method: 'DELETE' }),
  },
  patients: {
    search: (q = '') =>
      request(`/practitioner/patients${q ? `?q=${encodeURIComponent(q)}` : ''}`),
    records: (id) => request(`/practitioner/patients/${id}/records`),
    results: (id) => request(`/practitioner/patients/${id}/results`),
    addRecord: (id, data) =>
      request(`/practitioner/patients/${id}/records`, withBody('POST', data)),
    addResult: (id, data) =>
      request(`/practitioner/patients/${id}/results`, withBody('POST', data)),
  },
  records: {
    list: () => request('/practitioner/records'),
    create: (data) => request('/practitioner/records', withBody('POST', data)),
  },
  results: {
    create: (data) => request('/practitioner/results', withBody('POST', data)),
  },
};

// --- Module ADMIN ---
const admin = {
  stats: () => request('/admin/stats'),
  users: {
    list: (params) => request(`/admin/users${qs(params)}`),
    create: (data) => request('/admin/users', withBody('POST', data)),
    update: (id, data) => request(`/admin/users/${id}`, withBody('PATCH', data)),
    setStatus: (id, enabled) =>
      request(`/admin/users/${id}/status`, withBody('PATCH', { enabled })),
    resetPassword: (id, password) =>
      request(`/admin/users/${id}/reset-password`, withBody('POST', { password })),
    remove: (id, confirm_email) =>
      request(`/admin/users/${id}`, withBody('DELETE', { confirm_email })),
    sync: () => request('/admin/users/sync', { method: 'POST' }),
  },
  cliniques: {
    list: () => request('/admin/cliniques'),
    create: (data) => request('/admin/cliniques', withBody('POST', data)),
    update: (id, data) => request(`/admin/cliniques/${id}`, withBody('PUT', data)),
    remove: (id) => request(`/admin/cliniques/${id}`, { method: 'DELETE' }),
    setPractitioners: (id, practitioner_ids) =>
      request(`/admin/cliniques/${id}/practitioners`, withBody('PUT', { practitioner_ids })),
  },
  audit: (params) => request(`/admin/audit${qs(params)}`),
};

export const api = {
  auth,
  // raccourcis historiques
  register: auth.register,
  patient,
  practitioner,
  admin,

  // façades selon le rôle (utilisées par les pages d'Aya)
  appointments: {
    list: byRole({ patient: patient.appointments.list, practitioner: practitioner.appointments.list }),
    create: byRole({ patient: patient.appointments.create }),
    updateStatus: byRole({ practitioner: practitioner.appointments.updateStatus }),
    doctors: byRole({ patient: patient.doctors }),
  },
  records: {
    list: byRole({ patient: patient.records.list, practitioner: practitioner.records.list }),
    results: byRole({ patient: patient.records.results }),
    create: byRole({ practitioner: practitioner.records.create }),
  },

  dashboard: () => request('/dashboard'),
};