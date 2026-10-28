// Tiny fetch wrapper for the Industryhead API (proxied to :4000 in dev, same origin in production).
function makeSession() {
  const rand = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36) + "xxxxxxxx");
  try {
    let s = localStorage.getItem("ih-demo-session");
    if (!s) { s = rand(); localStorage.setItem("ih-demo-session", s); }
    return s;
  } catch { return rand(); }
}
export const sessionId = makeSession();

async function request(path, { method = "GET", body, token } = {}) {
  const res = await fetch("/api" + path, {
    method,
    headers: { "Content-Type": "application/json", "X-Demo-Session": sessionId, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  let data = null;
  try { data = await res.json(); } catch { /* non-JSON body */ }
  if (!res.ok) {
    const err = new Error(data?.error || res.statusText || "Request failed");
    err.status = res.status; err.errors = data?.errors;
    throw err;
  }
  return data;
}

export const api = {
  content: () => request("/content"),
  cost: () => request("/cost"),
  tour: () => request("/tour"),
  setReason: (machineId, reason) => request(`/tour/machines/${encodeURIComponent(machineId)}/reason`, { method: "POST", body: { reason } }),
  addAction: (machineId) => request("/tour/actions", { method: "POST", body: { machineId } }),
  setStage: (id, stage) => request(`/tour/actions/${id}`, { method: "PATCH", body: { stage } }),
  enquiry: (data) => request("/enquiries", { method: "POST", body: data }),
  admin: {
    list: (token, status) => request("/admin/enquiries" + (status ? `?status=${status}` : ""), { token }),
    setStatus: (token, id, status) => request(`/admin/enquiries/${id}`, { method: "PATCH", body: { status }, token }),
    csv: async (token) => {
      const res = await fetch("/api/admin/enquiries.csv", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Could not export");
      return res.blob();
    }
  }
};
