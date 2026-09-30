export {};

const base = process.env.BASE_URL || "http://localhost:3000";
const json = async (path: string, init?: RequestInit) => { const response = await fetch(`${base}${path}`, init); const body = await response.json(); if (!response.ok) throw new Error(`${path}: ${response.status} ${JSON.stringify(body)}`); return body; };
const login = await json("/api/v1/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "admin@gymflow.vn", password: "demo123" }) });
const headers = { Authorization: `Bearer ${login.data.token}` };
const summary = await json("/api/v1/dashboard/summary", { headers });
const members = await json("/api/v1/members?page=1&limit=3", { headers });
const plans = await json("/api/v1/plans", { headers });
const health = await json("/api/v1/health");
if (!summary.success || !members.success || !plans.success || health.data.status !== "ok") throw new Error("REST contract failed");
console.log(JSON.stringify({ passed: true, checks: ["login", "health", "dashboard/summary", "members pagination", "plans list"], memberCount: members.meta.total }, null, 2));
