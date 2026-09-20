import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 45000,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("lpu_rms_token");
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("lpu_rms_token");
      localStorage.removeItem("lpu_rms_user");
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const loginUser = async (userId: string, password: string, role: string) => {
  const mappedRole =
    role === "Faculty/Warden"
      ? "warden"
      : role === "Maintenance Staff"
      ? "maintenance"
      : role.toLowerCase();

  const response = await api.post("/api/auth/login", {
    user_id: userId,
    password,
    role: mappedRole,
  });
  return response.data; // { access_token, user }
};

export const verifyAuth = async (token: string) => {
  const response = await api.post("/api/auth/verify", {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Ticket APIs
export interface TicketPayload {
  block: string;
  sub_block?: string;
  room_number: string;
  contact_number: string;
  category: string;
  sub_category?: string;
  specific_category?: string;
  equipment?: string;
  message_type?: string;
  availability_date?: string;
  time_slots?: string;
  description: string;
  urgency_level?: string;
}

export const createTicket = async (payload: TicketPayload, token?: string) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.post("/api/tickets/create", payload, { headers });
  return response.data;
};

export const getStudentTickets = async (token?: string) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.get("/api/tickets/my-tickets", { headers });
  return response.data;
};

export const getWardenTickets = async (block: string, token?: string) => {
  const cleanBlock = encodeURIComponent(block.trim().toLowerCase());
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.get(`/api/tickets/warden/${cleanBlock}`, { headers });
  return response.data;
};

export const assignMaintenance = async (ticketId: string, token?: string) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.patch(
    `/api/tickets/${ticketId}/assign-maintenance`,
    { maintenance_user_id: "MAINT001" },
    { headers }
  );
  return response.data;
};

export const getMaintenanceTickets = async (token?: string) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.get("/api/tickets/maintenance/assigned", { headers });
  return response.data;
};

export const resolveTicket = async (ticketId: string, token?: string) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.patch(`/api/tickets/${ticketId}/resolve`, {}, { headers });
  return response.data;
};

// AI Diagnosis API
export const runAIDiagnosis = async (ticketId: string, authToken?: string) => {
  const token =
    authToken ||
    (typeof window !== "undefined" ? localStorage.getItem("lpu_rms_token") : "") ||
    "";

  const response = await api.post(
    `/api/tickets/${ticketId}/ai-diagnose`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Analytics API
export const getAnalytics = async (token?: string) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.get("/api/analytics", { headers });
  return response.data;
};

export default api;
