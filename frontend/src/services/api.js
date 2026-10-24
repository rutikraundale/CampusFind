import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
const resolveApiBaseUrl = () => {
  const apiUrl = new URL(configuredApiUrl, window.location.origin);
  const apiUsesLoopback = /^(localhost|127(?:\.\d{1,3}){3}|\[::1\])$/i.test(apiUrl.hostname);
  const pageUsesLanHost = !/^(localhost|127(?:\.\d{1,3}){3}|\[::1\])$/i.test(window.location.hostname);

  if (import.meta.env.DEV && apiUsesLoopback && pageUsesLanHost) {
    apiUrl.hostname = window.location.hostname;
  }

  return apiUrl.toString();
};

// 1. Initialize custom axios instance with local environments base url
const API = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true, // Enables sending/receiving secure httpOnly cookies & sessions
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. Outgoing Request Interceptor: Automatically inject Access Token if it is saved in local storage
API.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("campusfind_token");
    const userStr = localStorage.getItem("campusfind_user");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (err) {
        console.error("Failed to parse user session token from local storage:", err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Incoming Response Interceptor: Seamlessly process responses & parse error messages
API.interceptors.response.use(
  (response) => response.data, // Directly return data element to simplify callers' async calls
  (error) => {
    // Extract formatted message from backend response if available
    const errorResponse = error.response?.data;
    const errorMessage = errorResponse?.message || "Something went wrong. Please check connection and try again.";
    
    // Create detailed error object
    const apiError = new Error(errorMessage);
    apiError.status = error.response?.status;
    apiError.errors = errorResponse?.errors || [];
    
    return Promise.reject(apiError);
  }
);

// ─── Module API Enpoints ──────────────────────────────────────────────────────

export const authAPI = {
  /**
   * Start a new Student registration
   * @param {Object} userData { username, college_id, email, mobile, password }
   */
  register: (userData) => API.post("/users/register", userData),

  /**
   * Verify registration email with OTP
   * @param {Object} otpData { email, otp }
   */
  verifyOTP: (otpData) => API.post("/users/verify-otp", otpData),

  /**
   * Resend registration OTP
   * @param {Object} resendData { email }
   */
  resendOTP: (resendData) => API.post("/users/resend-otp", resendData),

  /**
   * Authenticate a user session (Student or Admin)
   * @param {Object} credentials { email, password, role }
   */
  login: (credentials) => API.post("/users/login", credentials),

  /**
   * End user session
   */
  logout: () => API.post("/users/logout"),

  /**
   * Fetch authenticated user's profile details
   */
  getMe: () => API.get("/users/me"),

  /**
   * Update student password or details
   */
  updateProfile: (profileData) => API.post("/users/update-profile", profileData),
};

export const itemsAPI = {
  /**
   * Retrieve all posted items (allows querying filters like type, category)
   * @param {Object} params { type, category, status }
   */
  getAll: (params) => API.get("/items", { params }),
  adminGetAll: () => API.get("/items/admin/records"),

  /**
   * Advanced search items via search index
   * @param {Object} params { query, category, type, location }
   */
  search: (params) => API.get("/search", { params }),

  /**
   * Retrieve individual item details by ID
   * @param {string} id 
   */
  getById: (id) => API.get(`/items/${id}`),

  /**
   * Fetch items posted by the logged-in student
   */
  getMyPosts: () => API.get("/items/my-posts"),

  /**
   * Post a new lost or found item (Requires multipart form-data for upload)
   * @param {FormData} formData
   */
  create: (formData) => {
    return API.post("/items", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  },
  guestSendOtp: (email) => API.post("/items/guest/send-otp", { email }),
  guestVerifyOtp: (payload) => API.post("/items/guest/verify-otp", payload),
  guestCreate: (formData) => API.post("/items/guest", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }),

  /**
   * Delete an item by ID (owner or admin only)
   * @param {string} id
   */
  delete: (id) => API.delete(`/items/${id}`),
};

export const foundItemUploadAPI = {
  createSession: () => API.post("/found-item-uploads/sessions"),
  getSession: (id, config) => API.get(`/found-item-uploads/sessions/${id}`, config),
  cancelSession: (id) => API.delete(`/found-item-uploads/sessions/${id}`),
  uploadFromAdmin: (id, formData, config) =>
    API.post(`/found-item-uploads/sessions/${id}/image`, formData, {
      ...config,
      headers: { ...config?.headers, "Content-Type": "multipart/form-data" },
    }),
  publish: (id, payload) => API.post(`/found-item-uploads/sessions/${id}/publish`, payload),
  validateMobileToken: (token, config) =>
    API.get(`/found-item-uploads/${encodeURIComponent(token)}`, config),
  uploadFromMobile: (token, formData, config) =>
    API.post(`/found-item-uploads/${encodeURIComponent(token)}/image`, formData, {
      ...config,
      headers: { ...config?.headers, "Content-Type": "multipart/form-data" },
    }),
};

export const claimsAPI = {
  /**
   * File a claim for a lost/found item
   * @param {string} itemId 
   * @param {Object} claimData { claimReason }
   */
  create: (itemId, claimData) => API.post(`/claims/${itemId}`, claimData),

  /**
   * List claims filed by the logged-in student
   */
  getMyClaims: () => API.get("/claims/my-claims"),

  /**
   * Cancel an active claim
   * @param {string} claimId
   */
  cancel: (claimId) => API.delete(`/claims/${claimId}/cancel`),

  /**
   * Admin: List all filed claims
   * @param {Object} params { verified }
   */
  adminGetAll: (params) => API.get("/claims", { params }),

  /**
   * Admin: Review and verify a claim
   * @param {string} claimId 
   * @param {Object} verificationData { status: 'approved' | 'rejected', note }
   */
  adminVerify: (claimId, verificationData) => API.post(`/claims/${claimId}/verify`, verificationData),
  getHandoverItems: () => API.get("/claims/handover/items"),
  getHandoverHistory: () => API.get("/claims/handover/history"),
  getHandoverSession: (id) => API.get(`/claims/handover/${id}`),
  cancelHandoverSession: (id) => API.delete(`/claims/handover/${id}`),
  checkHandoverStudent: (email) => API.post("/claims/handover/check-student", { email }),
  sendHandoverOtp: (payload) => API.post("/claims/handover/send-otp", payload),
  verifyHandoverOtp: (payload) => API.post("/claims/handover/verify-otp", payload),
  confirmHandover: (payload) => API.post("/claims/handover/confirm", payload),
};

export const studentIssuesAPI = {
  create: (issue) => API.post("/issues", issue),
  getMine: () => API.get("/issues/mine"),
  adminGetAll: () => API.get("/issues/admin"),
  adminUpdateStatus: (id, update) => API.patch(`/issues/${id}/status`, update),
};

export default API;
