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

export const api = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  me: () => request('/auth/me'),

  dashboard: () => request('/dashboard'),

  appointments: {
    list: () => request('/appointments'),
    create: (data) => request('/appointments', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id, status) =>
      request(`/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    doctors: () => request('/appointments/doctors/list'),
  },

  records: {
    list: () => request('/records'),
    results: () => request('/records/results'),
    create: (data) => request('/records', { method: 'POST', body: JSON.stringify(data) }),
    patients: () => request('/records/patients/list'),
  },
};
