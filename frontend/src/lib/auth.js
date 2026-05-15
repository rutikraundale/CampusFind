/**
 * auth.js — JWT auth utility for CampusFind frontend
 *
 * Responsibilities:
 *  - Storing / reading the access token (in-memory preferred; localStorage as fallback)
 *  - Performing token refresh via /api/v1/users/refresh
 *  - Logout (clears state + triggers cross-tab sync via StorageEvent)
 *  - Listening for logout events from other tabs
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

// ─── In-memory access token (never persisted to localStorage for security) ────
let _accessToken = null;

// ─── LocalStorage key used ONLY to broadcast logout signal across tabs ────────
const LOGOUT_SIGNAL_KEY = "campusfind:logout";

// ─── Token helpers ────────────────────────────────────────────────────────────

/** Store the in-memory access token after login / refresh */
export const setAccessToken = (token) => {
    _accessToken = token;
};

/** Get the current in-memory access token */
export const getAccessToken = () => _accessToken;

/** Clear the in-memory access token */
export const clearAccessToken = () => {
    _accessToken = null;
};

// ─── API call wrapper with automatic token refresh ───────────────────────────

/**
 * Authenticated fetch wrapper.
 * - Attaches Authorization header with current access token.
 * - On 401, attempts a single silent token refresh then retries.
 * - On second 401, triggers full logout.
 */
export const authFetch = async (url, options = {}) => {
    const makeRequest = (token) =>
        fetch(url, {
            ...options,
            credentials: "include", // send cookies (refreshToken httpOnly cookie)
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

    let response = await makeRequest(_accessToken);

    // Silently refresh on 401 and retry once
    if (response.status === 401) {
        const refreshed = await silentRefresh();
        if (refreshed) {
            response = await makeRequest(_accessToken);
        } else {
            // Refresh also failed — force logout
            await logout();
        }
    }

    return response;
};

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * Login for both Student and Admin.
 * @param {{ email?, username?, password, role }} credentials
 * @returns {Promise<{ user, accessToken }>}
 */
export const login = async (credentials) => {
    const res = await fetch(`${API_BASE}/users/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    setAccessToken(data.data.accessToken);
    return data.data;
};

// ─── Silent Refresh ───────────────────────────────────────────────────────────

/**
 * Silently calls /refresh — the httpOnly refreshToken cookie is sent automatically.
 * Returns true on success, false on failure.
 */
export const silentRefresh = async () => {
    try {
        const res = await fetch(`${API_BASE}/users/refresh`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) return false;

        const data = await res.json();
        setAccessToken(data.data.accessToken);
        return true;
    } catch {
        return false;
    }
};

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * Calls the logout endpoint, clears in-memory token,
 * and broadcasts a logout signal so all other tabs also clear their state.
 */
export const logout = async () => {
    try {
        await fetch(`${API_BASE}/users/logout`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(  _accessToken ? { Authorization: `Bearer ${_accessToken}` } : {}),
            },
        });
    } catch {
        // Proceed with local cleanup even if the server call fails
    } finally {
        clearAccessToken();
        broadcastLogout();
    }
};

// ─── Cross-tab logout via localStorage StorageEvent ─────────────────────────

/**
 * Write a timestamped value to a localStorage key.
 * Other tabs receive a `storage` event and clear their auth state.
 */
const broadcastLogout = () => {
    localStorage.setItem(LOGOUT_SIGNAL_KEY, Date.now().toString());
    // Remove immediately — the event is what matters, not the stored value
    localStorage.removeItem(LOGOUT_SIGNAL_KEY);
};

/**
 * Call once (e.g. in main.jsx or App.jsx) to start listening for
 * logout signals from other tabs.
 *
 * @param {Function} onLogout - callback to run when another tab logs out
 *                              (e.g. redirect to /login, clear React auth state)
 * @returns {Function} cleanup function to remove the listener
 */
export const listenForCrossTabLogout = (onLogout) => {
    const handler = (event) => {
        if (event.key === LOGOUT_SIGNAL_KEY) {
            clearAccessToken();
            if (typeof onLogout === "function") onLogout();
        }
    };

    window.addEventListener("storage", handler);

    // Return cleanup so callers can remove listener (e.g. in useEffect)
    return () => window.removeEventListener("storage", handler);
};

// ─── Bootstrap: attempt silent refresh on page load ──────────────────────────

/**
 * Try to restore the session silently when the app first loads.
 * Call this in main.jsx before rendering the React tree.
 *
 * @returns {Promise<boolean>} true if session was restored
 */
export const bootstrapAuth = async () => {
    return await silentRefresh();
};
