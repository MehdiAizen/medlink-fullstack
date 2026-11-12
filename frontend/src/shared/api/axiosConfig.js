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

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Erreur ${res.status}`);
  }

  return data;
}

<<<<<<< HEAD
const qs = (params = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null)).toString();
    return q ? `?${q}` : '';
};
const withBody = (method, body) => ({ method, body: JSON.stringify(body) });

export const api = {
  // --- Module AUTH ---
auth: {
  me: () => request("/auth/me"),
  // Routes publiques de la demande de compte praticien.
  practitionerOptions: () => request("/auth/practitioner-options"),
  requestPractitioner: async (payload) => {
    const res = await fetch(`${API_BASE}/auth/practitioner-requests`, {
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
=======
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
>>>>>>> 9a5ca9baf5b73266df14e2524266ee449c608f65
  },
  // Route publique : pas de token. On garde les erreurs par champ (err.fields).
  register: async (payload) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
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
  },
},

<<<<<<< HEAD
  // --- Module PATIENT ---
  patient: {
    practitioners: () => request("/patient/practitioners"),

    appointments: {
      list: () => request("/patient/appointments"),
      create: (data) =>
        request("/patient/appointments", {
          method: "POST",
          body: JSON.stringify(data),
        }),

      cancel: (id) =>
        request(`/patient/appointments/${id}/cancel`, {
          method: "PATCH",
        }),

      reschedule: (id, data) =>
        request(`/patient/appointments/${id}/reschedule`, {
          method: "PATCH",
          body: JSON.stringify(data),
        }),
    },

    cancel: (id) =>
      request(`/patient/appointments/${id}/cancel`, {
        method: "PATCH",
      }),

    records: {
      list: () => request("/patient/records"),
      results: () => request("/patient/records/results"),
    },
  },

  // --- Module PRACTITIONER ---
  practitioner: {
    appointments: {
      list: () => request("/practitioner/appointments"),
      updateStatus: (id, status) =>
        request(`/practitioner/appointments/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }),
    },

      // --- Module admin
      admin: {
          stats: () => request('/admin/stats'),
          users: {
              list: (params) => request(`/admin/users${qs(params)}`),
              create: (data) => request('/admin/users', withBody('POST', data)),
              update: (id, data) => request(`/admin/users/${id}`, withBody('PATCH', data)),
              setStatus: (id, enabled) => request(`/admin/users/${id}/status`, withBody('PATCH', { enabled })),
              resetPassword: (id, password) => request(`/admin/users/${id}/reset-password`, withBody('POST', { password })),
              remove: (id, confirm_email) => request(`/admin/users/${id}`, withBody('DELETE', { confirm_email })),
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
      },
    records: {
      list: () => request("/practitioner/records"),
      create: (data) =>
        request("/practitioner/records", {
          method: "POST",
          body: JSON.stringify(data),
        }),
    },
  },

  // --- Fallback Dashboard ---
  dashboard: () => request("/dashboard"),
};
=======
  dashboard: () => request('/dashboard'),
};
>>>>>>> 9a5ca9baf5b73266df14e2524266ee449c608f65
