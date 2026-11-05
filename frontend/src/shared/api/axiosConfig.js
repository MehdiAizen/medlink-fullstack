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

// Lit le rôle dans le JWT stocké (sert uniquement à choisir la bonne route côté interface :
// la vraie vérification des droits reste faite par le backend sur chaque requête).
function currentRole() {
  try {
    const payload = getToken().split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload)).role;
  } catch {
    return null;
  }
}

// Appelle la fonction correspondant au rôle connecté, ou refuse proprement.
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
  appointments: {
    list: () => request('/practitioner/appointments'),
    updateStatus: (id, status) =>
        request(`/practitioner/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
  records: {
    list: () => request('/practitioner/records'),
    create: (data) => request('/practitioner/records', { method: 'POST', body: JSON.stringify(data) }),
  },
};

export const api = {
  auth,
  patient,
  practitioner,

  // Raccourcis utilisés par les pages partagées (Appointments, BookAppointment, Records, Results) :
  // chaque appel est dirigé vers le module du rôle connecté.
  appointments: {
    list: byRole({ patient: patient.appointments.list, practitioner: practitioner.appointments.list }),
    create: byRole({ patient: patient.appointments.create }),
    updateStatus: byRole({ practitioner: practitioner.appointments.updateStatus }),
    doctors: byRole({ patient: patient.doctors }),
  },
  records: {
    list: byRole({ patient: patient.records.list, practitioner: practitioner.records.list }),
    results: byRole({ patient: patient.records.results }),
  },

  // --- Fallback Dashboard ---
  dashboard: () => request('/dashboard'),
};