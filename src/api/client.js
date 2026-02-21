const DEFAULT_API_BASE_URL = "http://157.180.108.156:5000/api";

export const getApiBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL;
  const base = (envUrl && String(envUrl).trim()) || DEFAULT_API_BASE_URL;
  return base.replace(/\/+$/, "");
};

export const getAuthToken = () => {
  return localStorage.getItem("pa_token");
};

export const setAuthSession = ({ token, refreshToken, user }) => {
  if (token) localStorage.setItem("pa_token", token);
  if (refreshToken) localStorage.setItem("pa_refresh_token", refreshToken);
  if (user) localStorage.setItem("pa_user", JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem("pa_token");
  localStorage.removeItem("pa_refresh_token");
  localStorage.removeItem("pa_user");
};

export const getCurrentUser = () => {
  const raw = localStorage.getItem("pa_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

export const apiRequest = async (path, options = {}) => {
  const {
    method = "GET",
    body,
    params,
    token = getAuthToken(),
    headers,
    timeoutMs = 30000,
    signal,
  } = options;

  const baseUrl = getApiBaseUrl();
  const fullPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${baseUrl}${fullPath}`);

  if (params && typeof params === "object") {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      url.searchParams.set(key, String(value));
    });
  }

  const isFormData =
    typeof FormData !== "undefined" && body && body instanceof FormData;
  const hasJsonBody = body !== undefined && body !== null && !isFormData;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), Number(timeoutMs) || 30000);
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  let res;
  try {
    res = await fetch(url.toString(), {
      method,
      headers: {
        ...(!isFormData ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {}),
      },
      body: hasJsonBody ? JSON.stringify(body) : isFormData ? body : undefined,
      signal: controller.signal,
    });
  } catch (e) {
    if (e?.name === "AbortError") {
      const err = new Error("Request timed out");
      err.status = 408;
      throw err;
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("pa_token");
      localStorage.removeItem("pa_refresh_token");
      localStorage.removeItem("pa_user");
    }
    const message =
      (payload && payload.message) ||
      (typeof payload === "string" ? payload : "Request failed");
    const error = new Error(message);
    error.status = res.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};
