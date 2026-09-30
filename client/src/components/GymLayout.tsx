import { Link, useLocation } from "wouter";
import { Bell, ChevronDown, Dumbbell, LayoutDashboard, UsersRound, CreditCard, CalendarDays, ClipboardCheck, Package, UserCog, FileCode2, Search, Menu, X, LogOut, CircleHelp } from "lucide-react";
import { useState } from "react";
import { clearSession, type SessionUser } from "@/lib/api";

const navItems = [
  { href: "/", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/members", label: "Hội viên", icon: UsersRound },
  { href: "/plans", label: "Gói tập", icon: Package },
  { href: "/memberships", label: "Đăng ký gói", icon: CreditCard },
  { href: "/checkins", label: "Check-in", icon: ClipboardCheck },
  { href: "/schedules", label: "Lịch tập", icon: CalendarDays },
  { href: "/trainers", label: "Huấn luyện viên", icon: Dumbbell },
  { href: "/payments", label: "Thanh toán", icon: CreditCard },
  { href: "/users", label: "Người dùng", icon: UserCog },
  { href: "/api-docs", label: "REST API Docs", icon: FileCode2 },
];

export default function GymLayout({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const visibleNavItems = user.role === "member" ? navItems.filter(item => ["/", "/plans", "/memberships", "/checkins", "/schedules", "/payments"].includes(item.href)) : user.role === "trainer" ? navItems.filter(item => ["/", "/members", "/plans", "/memberships", "/schedules"].includes(item.href)) : navItems;
  const workspaceItems = visibleNavItems.filter(item => item.href !== "/users" && item.href !== "/api-docs");
  const systemItems = visibleNavItems.filter(item => item.href === "/users" || item.href === "/api-docs");
  const current = visibleNavItems.find(item => item.href === location) || visibleNavItems[0];
  const currentLabel = user.role === "member" && current.href === "/" ? "Trang của tôi" : user.role === "trainer" ? "Lịch của tôi" : current.label;
  return (
    <div className="app-shell">
      {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Đóng menu" />}
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand-lockup">
          <img src="/logo-mark.svg" alt="GymFlow" className="brand-mark" />
          <div><div className="brand-name">Gym<span>Flow</span></div><div className="brand-caption">FITNESS OPERATIONS</div></div>
          <button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Đóng menu"><X size={18} /></button>
        </div>
        <div className="workspace-pill"><span className="status-dot" /> <span>GymFlow Studio</span><ChevronDown size={14} /></div>
        <nav className="sidebar-nav" aria-label="Điều hướng chính">
          <div className="nav-label">WORKSPACE</div>
          {workspaceItems.map(item => { const Icon = item.icon; const active = current.href === item.href; const label = user.role === "member" && item.href === "/" ? "Trang của tôi" : item.label; return <Link key={item.href} href={item.href} className={`nav-item ${active ? "active" : ""}`} onClick={() => setMobileOpen(false)}><Icon size={18} strokeWidth={active ? 2.5 : 2} /><span>{label}</span>{item.href === "/checkins" && user.role === "admin" && <span className="nav-count">5</span>}</Link>; })}
          {systemItems.length > 0 && <><div className="nav-label nav-label-spaced">SYSTEM</div>{systemItems.map(item => { const Icon = item.icon; const active = current.href === item.href; return <Link key={item.href} href={item.href} className={`nav-item ${active ? "active" : ""}`} onClick={() => setMobileOpen(false)}><Icon size={18} /><span>{item.label}</span></Link>; })}</>}
        </nav>
        <div className="sidebar-bottom"><div className="help-card"><CircleHelp size={18} /><div><strong>Cần hỗ trợ?</strong><span>Xem tài liệu vận hành</span></div></div><div className="sidebar-foot">v1.0.0 · RESTful edition</div></div>
      </aside>
      <main className="main-shell">
        <header className="topbar">
          <div className="topbar-left"><button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Mở menu"><Menu size={21} /></button><div><div className="eyebrow">GYMFLOW / {currentLabel.toUpperCase()}</div><h1>{currentLabel}</h1></div></div>
          <div className="topbar-actions"><div className="global-search"><Search size={16} /><input placeholder="Tìm nhanh..." aria-label="Tìm nhanh" /></div><button className="icon-button notification-button" aria-label="Thông báo"><Bell size={18} /><span /></button><div className="profile-menu"><div className="avatar avatar-lime">{user.avatar}</div><div className="profile-copy"><strong>{user.name}</strong><span>{user.role === "admin" ? "Administrator" : user.role === "member" ? "Hội viên" : "Huấn luyện viên"}</span></div><ChevronDown size={15} className="profile-chevron" /><button className="logout-button" onClick={() => { clearSession(); window.location.href = "/"; }} title="Đăng xuất"><LogOut size={16} /></button></div></div>
        </header>
        <div className="content-area">{children}</div>
      </main>
    </div>
  );
}
