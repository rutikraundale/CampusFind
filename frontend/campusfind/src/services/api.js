import axios from "axios";

// 1. Initialize custom axios instance with local environments base url
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  withCredentials: true, // Enables sending/receiving secure httpOnly cookies & sessions
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. Outgoing Request Interceptor: Automatically inject Access Token if it is saved in local storage
API.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem("campusfind_user");
    if (userStr) {
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
   * Register a new Student account
   * @param {Object} userData { username, CollegeID, email, phone, password }
   */
  register: (userData) => API.post("/users/register", userData),

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

  /**
   * Delete an item by ID (owner or admin only)
   * @param {string} id
   */
  delete: (id) => API.delete(`/items/${id}`),
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
};

export default API;
