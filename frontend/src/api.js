
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

const ACCESS_KEY = "jobtrack_access";
const REFRESH_KEY = "jobtrack_refresh";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the access token to every API request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Shared refresh request prevents multiple simultaneous refresh calls.
let refreshPromise = null;

// Automatically refresh expired access tokens.
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Don't retry authentication endpoints.
    const isAuthRequest =
      originalRequest.url?.includes("/accounts/token/") ||
      originalRequest.url?.includes("/accounts/register/");

    if (isAuthRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem(REFRESH_KEY);

    if (!refreshToken) {
      logoutUser();
      window.dispatchEvent(new Event("auth-expired"));
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${API_BASE}/accounts/token/refresh/`, {
            refresh: refreshToken,
          })
          .then((response) => {
            const newAccessToken = response.data.access;

            localStorage.setItem(ACCESS_KEY, newAccessToken);

            return newAccessToken;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newAccessToken = await refreshPromise;

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);

    } catch (refreshError) {
      logoutUser();
      window.dispatchEvent(new Event("auth-expired"));

      return Promise.reject(refreshError);
    }
  }
);

// Login.
export async function loginUser(username, password) {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);

  const response = await api.post("/accounts/token/", {
    username,
    password,
  });

  localStorage.setItem(ACCESS_KEY, response.data.access);
  localStorage.setItem(REFRESH_KEY, response.data.refresh);

  return response.data;
}

// Register.
export async function registerUser(username, email, password) {
  const response = await api.post("/accounts/register/", {
    username,
    email,
    password,
  });

  return response.data;
}

// Jobs.
export async function getJobs() {
  const response = await api.get("/jobs/");
  return response.data;
}

export async function createJob(jobData) {
  const response = await api.post("/jobs/", jobData);
  return response.data;
}

export async function updateJob(id, jobData) {
  const response = await api.patch(`/jobs/${id}/`, jobData);
  return response.data;
}

export async function deleteJob(id) {
  const response = await api.delete(`/jobs/${id}/`);
  return response.data;
}

// Interviews.
export async function getInterviews() {
  const response = await api.get("/jobs/interviews/");
  return response.data;
}

export async function createInterview(interviewData) {
  const response = await api.post(
    "/jobs/interviews/",
    interviewData
  );

  return response.data;
}

export async function updateInterview(id, interviewData) {
  const response = await api.patch(
    `/jobs/interviews/${id}/`,
    interviewData
  );

  return response.data;
}

export async function deleteInterview(id) {
  const response = await api.delete(
    `/jobs/interviews/${id}/`
  );

  return response.data;
}

// Logout.
export function logoutUser() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export default api;
