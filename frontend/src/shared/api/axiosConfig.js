
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

const qs = (params = {}) => {
    const q = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== "" && v != null)
    ).toString();

    return q ? `?${q}` : "";
};

const withBody = (method, body) => ({
    method,
    body: JSON.stringify(body),
});

// ================= AUTH =================

const auth = {
    login: (email, password) =>
        request("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        }),

    me: () => request("/auth/me"),
};

// ================= PATIENT =================

const patient = {
    doctors: () => request("/patient/doctors"),
    practitioners: () => request("/patient/practitioners"),

    appointments: {
        list: () => request("/patient/appointments"),

        create: (data) =>
            request("/patient/appointments", withBody("POST", data)),

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

    records: {
        list: () => request("/patient/records"),
        results: () => request("/patient/records/results"),
    },
};

// ================= PRACTITIONER =================

const practitioner = {
    dashboard: () => request("/dashboard"),

    appointments: {
        list: () => request("/practitioner/appointments"),

        updateStatus: (id, status) =>
            request(`/practitioner/appointments/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            }),
    },

    disponibilites: {
        list: () => request("/practitioner/disponibilites"),

        create: (data) =>
            request("/practitioner/disponibilites", withBody("POST", data)),

        remove: (id) =>
            request(`/practitioner/disponibilites/${id}`, {
                method: "DELETE",
            }),
    },

    patients: {
        search: (q = "") =>
            request(`/practitioner/patients${q ? `?q=${encodeURIComponent(q)}` : ""}`),

        records: (id) => request(`/practitioner/patients/${id}/records`),

        results: (id) => request(`/practitioner/patients/${id}/results`),

        addRecord: (id, data) =>
            request(`/practitioner/patients/${id}/records`, withBody("POST", data)),

        addResult: (id, data) =>
            request(`/practitioner/patients/${id}/results`, withBody("POST", data)),
    },

    records: {
        list: () => request("/practitioner/records"),

        create: (data) =>
            request("/practitioner/records", withBody("POST", data)),
    },

    results: {
        create: (data) =>
            request("/practitioner/results", withBody("POST", data)),
    },
};

// ================= ADMIN =================

const admin = {
    stats: () => request("/admin/stats"),

    users: {
        list: (params) => request(`/admin/users${qs(params)}`),

        create: (data) =>
            request("/admin/users", withBody("POST", data)),

        update: (id, data) =>
            request(`/admin/users/${id}`, withBody("PATCH", data)),

        setStatus: (id, enabled) =>
            request(`/admin/users/${id}/status`, withBody("PATCH", { enabled })),

        resetPassword: (id, password) =>
            request(`/admin/users/${id}/reset-password`, withBody("POST", { password })),

        remove: (id, confirm_email) =>
            request(`/admin/users/${id}`, withBody("DELETE", { confirm_email })),

        sync: () => request("/admin/users/sync", { method: "POST" }),
    },

    cliniques: {
        list: () => request("/admin/cliniques"),

        create: (data) =>
            request("/admin/cliniques", withBody("POST", data)),

        update: (id, data) =>
            request(`/admin/cliniques/${id}`, withBody("PUT", data)),

        remove: (id) =>
            request(`/admin/cliniques/${id}`, { method: "DELETE" }),

        setPractitioners: (id, practitioner_ids) =>
            request(`/admin/cliniques/${id}/practitioners`,
                withBody("PUT", { practitioner_ids })
            ),
    },

    audit: (params) => request(`/admin/audit${qs(params)}`),
};

// ================= API EXPORT =================

export const api = {
    auth,
    patient,
    practitioner,
    admin,

    dashboard: () => request("/dashboard"),
};
