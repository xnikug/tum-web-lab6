const BASE_URL_KEY    = 'api_base_url';
const TOKEN_KEY       = 'api_token';
const TOKEN_ROLE_KEY  = 'api_token_role';   // role used to mint the current token
const AUTO_REFRESH_KEY = 'api_auto_refresh'; // 'true' | 'false'

function getBaseUrl() {
  return localStorage.getItem(BASE_URL_KEY) || 'http://localhost:3001';
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

async function request(method, path, body) {
  const token = getToken();
  const res = await fetch(`${getBaseUrl()}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.error || res.statusText), { status: res.status });
  return data;
}

export const api = {
  // Config
  getBaseUrl,
  setBaseUrl:      url  => localStorage.setItem(BASE_URL_KEY, url),
  getToken,
  setToken:        tok  => localStorage.setItem(TOKEN_KEY, tok),
  clearToken:      ()   => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(TOKEN_ROLE_KEY); },
  isConnected:     ()   => !!getToken(),
  getTokenRole:    ()   => localStorage.getItem(TOKEN_ROLE_KEY) || 'ADMIN',
  setTokenRole:    role => localStorage.setItem(TOKEN_ROLE_KEY, role),
  getAutoRefresh:  ()   => localStorage.getItem(AUTO_REFRESH_KEY) === 'true',
  setAutoRefresh:  val  => localStorage.setItem(AUTO_REFRESH_KEY, val ? 'true' : 'false'),

  // Auth
  fetchToken: role => request('POST', '/token', { role }),

  // Health
  health: () => request('GET', '/health'),

  // Subscriptions
  getSubscriptions: (params = {}) => {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
    ).toString();
    return request('GET', `/api/subscriptions${q ? `?${q}` : ''}`);
  },
  createSubscription:  data      => request('POST',   '/api/subscriptions', data),
  updateSubscription:  (id, data) => request('PUT',    `/api/subscriptions/${id}`, data),
  toggleSubscription:  id        => request('PATCH',   `/api/subscriptions/${id}/status`),
  deleteSubscription:  id        => request('DELETE',  `/api/subscriptions/${id}`),

  // API Keys
  getApiKeys: (params = {}) => {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
    ).toString();
    return request('GET', `/api/api-keys${q ? `?${q}` : ''}`);
  },
  createApiKey:  data       => request('POST',  '/api/api-keys', data),
  updateApiKey:  (id, data) => request('PUT',   `/api/api-keys/${id}`, data),
  deleteApiKey:  id         => request('DELETE', `/api/api-keys/${id}`),

  // API Usage
  getApiUsage: (params = {}) => {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
    ).toString();
    return request('GET', `/api/api-usage${q ? `?${q}` : ''}`);
  },
  createApiUsage: data => request('POST',  '/api/api-usage', data),
  updateApiUsage: (id, data) => request('PUT', `/api/api-usage/${id}`, data),
  deleteApiUsage: id   => request('DELETE', `/api/api-usage/${id}`),
};
