const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('medlink_token');
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Erreur ${res.status}`);
  }
  return data;
}

function currentRole() {
  try {
    const payload = getToken().split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload)).role;
  } catch {
    return null;
  }
}

const byRole = (map) => (...args) => {
  const fn = map[currentRole()];
  if (!fn) return Promise.reject(new Error('Action non disponible pour votre rôle'));
  return fn(...args);
};

// --- Module AUTH ---
const auth = {
  login: (email, password) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request('/auth/me'),
};

// --- Module PATIENT ---
const patient = {
  doctors: () => request('/patient/doctors'),
  appointments: {
    list: () => request('/patient/appointments'),
    create: (data) => request('/patient/appointments', { method: 'POST', body: JSON.stringify(data) }),
  },
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
      request(`/practitioner/appointments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },
  disponibilites: {
    list: () => request('/practitioner/disponibilites'),
    create: (data) =>
      request('/practitioner/disponibilites', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    remove: (id) =>
      request(`/practitioner/disponibilites/${id}`, { method: 'DELETE' }),
  },
  patients: {
    search: (q = '') =>
      request(`/practitioner/patients${q ? `?q=${encodeURIComponent(q)}` : ''}`),
    records: (id) => request(`/practitioner/patients/${id}/records`),
    results: (id) => request(`/practitioner/patients/${id}/results`),
    addRecord: (id, data) =>
      request(`/practitioner/patients/${id}/records`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    addResult: (id, data) =>
      request(`/practitioner/patients/${id}/results`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  records: {
    // ✅ CORRIGÉ : Appelle maintenant la bonne route pour lister les comptes-rendus
    list: () => request('/practitioner/records'),
    create: (data) =>
      request('/practitioner/records', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  results: {
    create: (data) =>
      request('/practitioner/results', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};

export const api = {
  auth,
  patient,
  practitioner,

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