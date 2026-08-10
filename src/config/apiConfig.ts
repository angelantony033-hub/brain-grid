export const BASE_URL = "https://quiz-backend-4pjd.onrender.com";

// ── Auth token helpers ─────────────────────────────────────────
export const getToken = () => localStorage.getItem('admin_token');

export const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});