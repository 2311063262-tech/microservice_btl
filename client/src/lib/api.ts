export type ApiResponse<T> = { success: boolean; data: T; meta?: { page: number; limit: number; total: number; totalPages: number }; error?: { code: string; message: string; details?: unknown[] } };

const TOKEN_KEY = "gymflow_token";
const USER_KEY = "gymflow_user";
const MANUAL_LOGOUT_KEY = "gymflow_manual_logout";

export type SessionUser = { id: number; name: string; email: string; role: "admin" | "member" | "trainer"; memberId?: number; avatar: string };

export function getToken() { return localStorage.getItem(TOKEN_KEY); }
export function getStoredUser(): SessionUser | null { try { const user = JSON.parse(localStorage.getItem(USER_KEY) || "null") as SessionUser | null; if (user && !["admin", "member", "trainer"].includes(user.role)) { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); return null; } return user; } catch { return null; } }
export function canAutoLogin() { return localStorage.getItem(MANUAL_LOGOUT_KEY) !== "1"; }
export function setSession(token: string, user: SessionUser) { localStorage.removeItem(MANUAL_LOGOUT_KEY); localStorage.setItem(TOKEN_KEY, token); localStorage.setItem(USER_KEY, JSON.stringify(user)); }
export function clearSession() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); localStorage.setItem(MANUAL_LOGOUT_KEY, "1"); }

export async function loginWithCredentials(email: string, password: string) {
  const response = await fetch("/api/v1/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
  const payload = await response.json() as ApiResponse<{ token: string; user: SessionUser }>;
  if (!response.ok || !payload.success) throw new Error(payload.error?.message || "Không thể đăng nhập");
  setSession(payload.data.token, payload.data.user);
  return payload.data.user;
}

export async function loginDemo() {
  return loginWithCredentials("admin@gymflow.vn", "demo123");
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`/api/v1${path}`, { ...init, headers });
  const payload = await response.json().catch(() => ({ success: false, error: { message: "Phản hồi không hợp lệ" } })) as ApiResponse<T>;
  if (response.status === 401) { clearSession(); window.dispatchEvent(new Event("gymflow:logout")); }
  if (!response.ok || !payload.success) throw new Error(payload.error?.message || "Có lỗi xảy ra");
  return payload;
}

export function formatVND(amount = 0) { return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount); }
export function formatDate(date?: string) { if (!date) return "—"; return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(date)); }
export function formatDateTime(date?: string) { if (!date) return "—"; return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(date)); }
