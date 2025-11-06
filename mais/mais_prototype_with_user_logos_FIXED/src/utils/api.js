const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function isJsonBody(body) {
  if (!body) {
    return false;
  }
  if (typeof body === "string") {
    return false;
  }
  if (body instanceof FormData || body instanceof Blob || body instanceof ArrayBuffer) {
    return false;
  }
  return true;
}

export async function apiFetch(path, options = {}) {
  const { token, headers, body, ...rest } = options;
  const finalHeaders = { ...(headers || {}) };
  let finalBody = body;

  if (isJsonBody(body)) {
    finalHeaders["Content-Type"] = "application/json";
    finalBody = JSON.stringify(body);
  }

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: finalBody,
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      data = null;
    }
  }

  if (!response.ok) {
    const message = data && typeof data === "object" && data.error
      ? data.error
      : `Request failed with status ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export { API_URL };
