export const BASE_URL = "http://192.168.68.89:5000";

// ── Auth token helpers ─────────────────────────────────────────
export const getToken = () => localStorage.getItem('admin_token');

export const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});