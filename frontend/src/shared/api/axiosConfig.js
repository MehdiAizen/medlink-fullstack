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

export const api = {
  // --- Module AUTH ---
auth: {
  me: () => request("/auth/me"),
},

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
