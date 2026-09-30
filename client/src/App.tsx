import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import GymLayout from "./components/GymLayout";
import Home from "./pages/Home";
import { getStoredUser, loginWithCredentials, type SessionUser } from "@/lib/api";
import { useState } from "react";

function Router() { return <Switch><Route path="/" component={Home}/><Route path="/members/:id" component={Home}/><Route path="/members" component={Home}/><Route path="/plans" component={Home}/><Route path="/memberships" component={Home}/><Route path="/checkins" component={Home}/><Route path="/trainers" component={Home}/><Route path="/schedules" component={Home}/><Route path="/payments" component={Home}/><Route path="/users" component={Home}/><Route path="/api-docs" component={Home}/><Route path="/404" component={NotFound}/><Route component={NotFound}/></Switch>; }

function LoginScreen({ onLogin }: { onLogin: (user: SessionUser) => void }) {
  const [email, setEmail] = useState("admin@gymflow.vn");
  const [password, setPassword] = useState("demo123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const user = await loginWithCredentials(email.trim(), password);
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đăng nhập");
    } finally {
      setLoading(false);
    }
  };

  return <div className="login-screen"><div className="login-card"><div className="brand-lockup"><img src="/logo-mark.svg" alt="GymFlow" className="brand-mark"/><div><div className="brand-name">Gym<span>Flow</span></div><div className="brand-caption">FITNESS OPERATIONS</div></div></div><div className="login-copy"><div className="section-kicker">WELCOME BACK</div><h1>Vận hành khỏe hơn,<br/><em>mỗi ngày.</em></h1><p>Đăng nhập bằng tài khoản phòng gym để quản lý hội viên, lịch tập và doanh thu.</p></div><div className="demo-credentials" style={{ display: "grid", gap: 8, textAlign: "left" }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@gymflow.vn" style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(15,23,42,0.6)", color: "#fff" }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Mật khẩu</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="demo123" style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(15,23,42,0.6)", color: "#fff" }} />
          </label>
        </div><button className="button button-primary login-button" onClick={submit} disabled={loading || !email.trim() || !password}>{loading ? "Đang kết nối..." : "Đăng nhập"}<ArrowIcon/></button>{error && <div className="login-error">{error}</div>}</div><div className="login-art"><div className="art-glow"/><img src="/logo-mark.svg" alt=""/><div className="art-quote">“Small steps.<br/><strong>Big momentum.</strong>”</div><div className="art-stat"><span>WORKING DAYS</span><strong>7</strong><b>+14%</b></div></div></div>;
}
function ArrowIcon() { return <span className="button-arrow">↗</span>; }

export default function App() { const [user, setUser] = useState<SessionUser | null>(getStoredUser()); if (user) return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster richColors/><GymLayout user={user}><Router/></GymLayout></TooltipProvider></ThemeProvider></ErrorBoundary>; return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster richColors/><LoginScreen onLogin={setUser}/></TooltipProvider></ThemeProvider></ErrorBoundary>; }
