const API_BASE = "/api";

function getToken() {
  return localStorage.getItem("medlink_token");
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
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

export const api = {
  // --- Module AUTH ---
  auth: {
    login: (email, password) =>
      request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
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
    },

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
