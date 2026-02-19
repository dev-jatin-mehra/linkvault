const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const normalizedApiUrl = rawApiUrl.replace(/\/$/, "");
const API = /\/api$/i.test(normalizedApiUrl)
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`;

const apiFetch = async (path, options = {}, token) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers,
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error || `Request failed: ${response.status}`);
  }

  return body;
};

export const getCollections = async (token) => {
  return apiFetch("/collections", {}, token);
};

export const createCollection = async (name, token, isPublic = false) => {
  return apiFetch(
    "/collections",
    {
      method: "POST",
      body: JSON.stringify({ name, is_public: Boolean(isPublic) }),
    },
    token,
  );
};

export const updateCollection = async (id, payload, token) => {
  const body = typeof payload === "string" ? { name: payload } : payload;

  return apiFetch(
    `/collections/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
    token,
  );
};

export const deleteCollection = async (id, token) => {
  return apiFetch(
    `/collections/${id}`,
    {
      method: "DELETE",
    },
    token,
  );
};

export const shareCollection = async (id, payload, token) => {
  return apiFetch(
    `/collections/${id}/share`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token,
  );
};

export const getCollectionMembers = async (id, token) => {
  return apiFetch(`/collections/${id}/members`, {}, token);
};

export const removeCollectionMember = async (id, memberUserId, token) => {
  return apiFetch(
    `/collections/${id}/members/${memberUserId}`,
    {
      method: "DELETE",
    },
    token,
  );
};

export const getLinks = async (collectionId, token) => {
  return apiFetch(`/links/${collectionId}`, {}, token);
};

export const createLink = async (data, token) => {
  return apiFetch(
    "/links",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token,
  );
};

export const updateLink = async (id, data, token) => {
  return apiFetch(
    `/links/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    token,
  );
};

export const deleteLink = async (id, token) => {
  return apiFetch(
    `/links/${id}`,
    {
      method: "DELETE",
    },
    token,
  );
};

export const searchLinks = async (query, token) => {
  const encoded = encodeURIComponent(query);
  return apiFetch(`/links/search?q=${encoded}`, {}, token);
};

export const trackLinkClick = async (id, token) => {
  return apiFetch(
    `/links/${id}/click`,
    {
      method: "POST",
    },
    token,
  );
};

export const getAnalyticsOverview = async (token, days = 30) => {
  return apiFetch(`/analytics/overview?days=${days}`, {}, token);
};

// Public API endpoints (no auth required)
export const getPublicCollection = async (id) => {
  return apiFetch(`/public/collections/${id}`, {});
};

export const getPublicCollectionLinks = async (id) => {
  return apiFetch(`/public/collections/${id}/links`, {});
};

export const trackPublicLinkClick = async (id) => {
  return apiFetch(`/public/links/${id}/click`, { method: "POST" });
};
