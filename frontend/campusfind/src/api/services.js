import api from "./axios";

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/users/register", data),
  login: (data) => api.post("/users/login", data),
  logout: () => api.post("/users/logout"),
  getCurrentUser: () => api.get("/users/me"),
  refreshToken: () => api.post("/users/refresh"),
  verifyEmail: (token) => api.get(`/users/verify-email/${token}`),
  updateProfile: (data) => api.post("/users/update-profile", data),
};

// ─── Items ────────────────────────────────────────────────────────────────────
export const itemsAPI = {
  getAll: (params) => api.get("/items", { params }),
  getById: (id) => api.get(`/items/${id}`),
  getMyPosts: () => api.get("/items/my-posts"),
  post: (formData) =>
    api.post("/items", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/items/${id}`),
};

// ─── Claims ───────────────────────────────────────────────────────────────────
export const claimsAPI = {
  initiate: (itemId) => api.post(`/claims/${itemId}`),
  verify: (claimId, data) => api.post(`/claims/${claimId}/verify`, data),
  getAll: (params) => api.get("/claims", { params }),
  getMyClaims: () => api.get("/claims/my-claims"),
  cancel: (claimId) => api.delete(`/claims/${claimId}/cancel`),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  verifyClaim: (data) => api.post("/admin/verify-claim", data),
  getManagedItems: (params) => api.get("/admin/items", { params }),
  getActions: () => api.get("/admin/actions"),
  updateActions: (data) => api.put("/admin/actions", data),
};

// ─── Search ──────────────────────────────────────────────────────────────────
export const searchAPI = {
  search: (query) => api.get("/search", { params: { q: query } }),
};
