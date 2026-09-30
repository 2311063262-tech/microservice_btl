import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Activity, ArrowUpRight, Check, CreditCard, Eye, FileCode2, MoreHorizontal, Pencil, Plus, Search, Sparkles, Trash2, TrendingUp, UsersRound, X, Zap } from "lucide-react";
import { apiFetch, formatDate, formatDateTime, formatVND, getStoredUser } from "@/lib/api";
import { toast } from "sonner";

type Dashboard = {
  totalMembers: number;
  activeMembers: number;
  todayCheckins: number;
  revenue: number;
  activeMemberships: number;
  revenueByMonth: { label: string; value: number }[];
  membershipBreakdown: { label: string; value: number }[];
};

type Member = {
  id: number;
  code: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  birthDate: string;
  address: string;
  emergencyContact?: string;
  status: string;
  joinedAt: string;
  membership?: { startDate?: string; endDate: string; status: string; plan?: { name: string } };
};

type Plan = { id: number; name: string; description: string; durationDays: number; price: number; status: string; popular?: boolean };
type Row = Record<string, any>;

const statusLabel: Record<string, string> = {
  active: "Đang hoạt động",
  inactive: "Tạm dừng",
  expired: "Đã hết hạn",
  cancelled: "Đã hủy",
  scheduled: "Sắp diễn ra",
  completed: "Hoàn thành",
  paid: "Đã thanh toán",
  pending: "Chờ xử lý",
  refunded: "Đã hoàn tiền",
};
const statusTone: Record<string, string> = { active: "success", paid: "success", completed: "success", scheduled: "info", pending: "warning", inactive: "neutral", expired: "danger", cancelled: "danger", refunded: "danger" };

const initials = (name = "") => name.split(" ").map(part => part[0]).slice(-2).join("").toUpperCase();

function PageIntro({ eyebrow, title, description, action, onAction }: { eyebrow?: string; title: string; description?: string; action?: string; onAction?: () => void }) {
  return <div className="page-intro"><div><div className="section-kicker">{eyebrow || "GYMFLOW OPERATIONS"}</div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action && <button className="button button-primary" onClick={onAction}><Plus size={17} />{action}</button>}</div>;
}

function StatusBadge({ value }: { value: string }) {
  return <span className={`status-badge ${statusTone[value] || "neutral"}`}><span className="status-dot" />{statusLabel[value] || value}</span>;
}

function LoadingBlock() {
  return <div className="loading-block"><div className="skeleton skeleton-title" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line short" /></div>;
}

function EmptyState({ title }: { title: string }) { return <div className="empty-state"><div className="empty-icon"><Sparkles size={20} /></div><strong>{title}</strong><span>Chưa có dữ liệu phù hợp với bộ lọc hiện tại.</span></div>; }

function TableToolbar({ search, setSearch, filter, setFilter, placeholder = "Tìm kiếm...", action, onAction, canCreate }: { search: string; setSearch: (value: string) => void; filter: string; setFilter: (value: string) => void; placeholder?: string; action: string; onAction: () => void; canCreate: boolean }) {
  return <div className="table-toolbar"><div className="table-search"><Search size={16}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder={placeholder}/></div><select className="filter-select" value={filter} onChange={event => setFilter(event.target.value)}><option value="">Tất cả trạng thái</option><option value="active">Đang hoạt động</option><option value="inactive">Tạm dừng</option><option value="expired">Đã hết hạn</option><option value="paid">Đã thanh toán</option><option value="pending">Chờ xử lý</option></select>{canCreate && <button className="button button-primary button-compact" onClick={onAction}><Plus size={16}/>{action}</button>}</div>;
}

function DataTable({ columns, rows, onRowClick, onEdit, onDelete, onCheckout, onRegister, canEdit = false, canDelete = false }: { columns: { key: string; label: string; render?: (row: Row) => React.ReactNode }[]; rows: Row[]; onRowClick?: (row: Row) => void; onEdit?: (row: Row) => void; onDelete?: (row: Row) => void; onCheckout?: (row: Row) => void; onRegister?: (row: Row) => void; canEdit?: boolean; canDelete?: boolean }) {
  return <div className="table-scroll"><table className="data-table"><thead><tr>{columns.map(column => <th key={column.key}>{column.label}</th>)}<th aria-label="Thao tác" /></tr></thead><tbody>{rows.length ? rows.map(row => <tr key={row.id} onClick={() => onRowClick?.(row)}>{columns.map(column => <td key={column.key}>{column.render ? column.render(row) : row[column.key] || "—"}</td>)}<td><div className="member-row-actions"><button className="member-row-action" onClick={event => { event.stopPropagation(); onRowClick?.(row); }}><Eye size={14}/>Xem</button>{onRegister && <button className="member-row-action" onClick={event => { event.stopPropagation(); onRegister(row); }}><Plus size={14}/>Đăng ký</button>}{canEdit && <button className="member-row-action" onClick={event => { event.stopPropagation(); onEdit?.(row); }}><Pencil size={14}/>Sửa</button>}{canDelete && <button className="member-row-action member-row-delete" onClick={event => { event.stopPropagation(); onDelete?.(row); }}><Trash2 size={14}/>Xóa</button>}{onCheckout && !row.checkOutAt && <button className="member-row-action" onClick={event => { event.stopPropagation(); onCheckout(row); }}>Check-out</button>}</div></td></tr>) : <tr><td colSpan={columns.length + 1}><EmptyState title="Không tìm thấy bản ghi" /></td></tr>}</tbody></table></div>;
}

function CreateDialog({ kind, title, endpoint, onClose, onCreated }: { kind: string; title: string; endpoint: string; onClose: () => void; onCreated: () => void }) {
  const fieldSets: Record<string, { key: string; label: string; type?: string; placeholder?: string }[]> = {
    members: [{ key: "name", label: "Họ và tên", placeholder: "Nguyễn Văn A" }, { key: "email", label: "Email", type: "email" }, { key: "password", label: "Mật khẩu đăng nhập", type: "password" }, { key: "phone", label: "Số điện thoại" }, { key: "gender", label: "Giới tính", type: "select" }, { key: "birthDate", label: "Ngày sinh", type: "date" }, { key: "address", label: "Địa chỉ" }, { key: "emergencyContact", label: "Liên hệ khẩn cấp" }],
    plans: [{ key: "name", label: "Tên gói" }, { key: "description", label: "Mô tả" }, { key: "durationDays", label: "Thời hạn (ngày)", type: "number" }, { key: "price", label: "Giá (VND)", type: "number" }],
    trainers: [{ key: "name", label: "Họ và tên" }, { key: "email", label: "Email", type: "email" }, { key: "phone", label: "Số điện thoại" }, { key: "specialty", label: "Chuyên môn" }, { key: "experience", label: "Kinh nghiệm", placeholder: "5 năm" }],
    checkins: [{ key: "memberId", label: "ID hội viên", type: "number", placeholder: "Ví dụ: 1" }],
    payments: [{ key: "memberId", label: "ID hội viên", type: "number" }, { key: "amount", label: "Số tiền (VND)", type: "number" }, { key: "method", label: "Phương thức", type: "select" }],
    memberships: [{ key: "memberId", label: "ID hội viên", type: "number" }, { key: "planId", label: "ID gói tập", type: "number" }, { key: "startDate", label: "Ngày bắt đầu", type: "date" }],
    schedules: [{ key: "title", label: "Tên buổi tập" }, { key: "memberId", label: "ID hội viên", type: "number" }, { key: "trainerId", label: "ID huấn luyện viên", type: "number" }, { key: "startAt", label: "Bắt đầu", type: "datetime-local" }, { key: "endAt", label: "Kết thúc", type: "datetime-local" }, { key: "note", label: "Ghi chú" }],
    users: [{ key: "name", label: "Họ và tên" }, { key: "email", label: "Email", type: "email" }, { key: "password", label: "Mật khẩu", type: "password" }, { key: "role", label: "Vai trò", type: "select" }],
  };

  const fields = fieldSets[kind] || fieldSets.members;
  const [values, setValues] = useState<Record<string, string>>({ gender: "Nam", method: "cash", role: "trainer", startDate: new Date().toISOString().slice(0, 10) });
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const payload: Record<string, unknown> = { ...values };
    for (const key of ["memberId", "planId", "trainerId", "durationDays", "price", "amount"]) {
      if (payload[key] !== undefined && payload[key] !== "") payload[key] = Number(payload[key]);
    }
    if (kind === "plans") payload.status = "active";
    if (kind === "members") payload.status = "active";
    if (kind === "trainers") payload.status = "active";
    if (kind === "memberships") payload.status = "active";
    if (kind === "payments") payload.status = "paid";
    if (kind === "schedules") { payload.type = "PT"; payload.status = "scheduled"; }

    try {
      await apiFetch(endpoint, { method: "POST", body: JSON.stringify(payload) });
      toast.success(`${title} đã được tạo thành công`);
      onCreated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tạo bản ghi");
    } finally {
      setSaving(false);
    }
  };

  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><form className="create-modal" onSubmit={submit}><div className="modal-head"><div><div className="panel-kicker">NEW RECORD / REST POST</div><h3>{title}</h3></div><button type="button" className="icon-button" onClick={onClose}><X size={19}/></button></div><div className="modal-grid">{fields.map(field => <label className="form-field" key={field.key}><span>{field.label}</span>{field.type === "select" ? <select value={values[field.key] || ""} onChange={event => setValues({ ...values, [field.key]: event.target.value })}>{field.key === "gender" && <><option>Nam</option><option>Nữ</option><option>Khác</option></>}{field.key === "method" && <><option value="cash">Tiền mặt</option><option value="transfer">Chuyển khoản</option><option value="card">Thẻ</option></>}{field.key === "role" && <><option value="trainer">Trainer</option><option value="admin">Admin</option></>}</select> : <input required={field.key !== "note"} type={field.type || "text"} placeholder={field.placeholder} value={values[field.key] || ""} onChange={event => setValues({ ...values, [field.key]: event.target.value })}/>}</label>)}</div><div className="modal-foot"><button type="button" className="button button-secondary" onClick={onClose}>Hủy</button><button className="button button-primary" disabled={saving}>{saving ? "Đang lưu..." : "Lưu bản ghi"}<ArrowUpRight size={15}/></button></div></form></div>;
}

function EditMemberDialog({ member, onClose, onSaved }: { member: Row; onClose: () => void; onSaved: () => void }) {
  const [values, setValues] = useState<Record<string, string>>({ name: member.name || "", email: member.email || "", phone: member.phone || "", gender: member.gender || "Nam", birthDate: member.birthDate?.slice(0, 10) || "", address: member.address || "", emergencyContact: member.emergencyContact || "", status: member.status || "active" });
  const [saving, setSaving] = useState(false);

  const update = (key: string, value: string) => setValues(current => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await apiFetch(`/members/${member.id}`, { method: "PATCH", body: JSON.stringify(values) });
      toast.success("Đã cập nhật hồ sơ hội viên");
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật hội viên");
    } finally {
      setSaving(false);
    }
  };

  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><form className="create-modal" onSubmit={submit}><div className="modal-head"><div><div className="panel-kicker">CẬP NHẬT HỘI VIÊN</div><h3>{member.name}</h3></div><button type="button" className="icon-button" onClick={onClose}><X size={19}/></button></div><div className="modal-grid"><label className="form-field"><span>Họ và tên</span><input required minLength={2} value={values.name} onChange={event => update("name", event.target.value)}/></label><label className="form-field"><span>Email</span><input required type="email" value={values.email} onChange={event => update("email", event.target.value)}/></label><label className="form-field"><span>Số điện thoại</span><input required minLength={9} value={values.phone} onChange={event => update("phone", event.target.value)}/></label><label className="form-field"><span>Giới tính</span><select value={values.gender} onChange={event => update("gender", event.target.value)}><option>Nam</option><option>Nữ</option><option>Khác</option></select></label><label className="form-field"><span>Ngày sinh</span><input type="date" value={values.birthDate} onChange={event => update("birthDate", event.target.value)}/></label><label className="form-field"><span>Trạng thái</span><select value={values.status} onChange={event => update("status", event.target.value)}><option value="active">Đang hoạt động</option><option value="inactive">Tạm dừng</option></select></label><label className="form-field"><span>Địa chỉ</span><input required minLength={3} value={values.address} onChange={event => update("address", event.target.value)}/></label><label className="form-field"><span>Liên hệ khẩn cấp</span><input required minLength={3} value={values.emergencyContact} onChange={event => update("emergencyContact", event.target.value)}/></label></div><div className="modal-foot"><button type="button" className="button button-secondary" onClick={onClose}>Hủy</button><button className="button button-primary" disabled={saving}>{saving ? "Đang lưu..." : "Lưu thay đổi"}<Check size={15}/></button></div></form></div>;
}

function EditResourceDialog({ kind, row, onClose, onSaved }: { kind: string; row: Row; onClose: () => void; onSaved: () => void }) {
  const fields: Record<string, { key: string; label: string; type?: string; options?: [string, string][] }[]> = {
    plans: [{ key: "name", label: "Tên gói" }, { key: "description", label: "Mô tả", type: "textarea" }, { key: "durationDays", label: "Thời hạn (ngày)", type: "number" }, { key: "price", label: "Giá (VND)", type: "number" }, { key: "status", label: "Trạng thái", type: "select", options: [["active", "Đang hoạt động"], ["inactive", "Tạm dừng"]] }],
    memberships: [{ key: "status", label: "Trạng thái", type: "select", options: [["active", "Đang hoạt động"], ["expired", "Đã hết hạn"], ["cancelled", "Đã hủy"]] }],
    trainers: [{ key: "name", label: "Họ và tên" }, { key: "email", label: "Email", type: "email" }, { key: "phone", label: "Số điện thoại" }, { key: "specialty", label: "Chuyên môn" }, { key: "experience", label: "Kinh nghiệm" }, { key: "status", label: "Trạng thái", type: "select", options: [["active", "Đang hoạt động"], ["inactive", "Tạm dừng"]] }],
    schedules: [{ key: "title", label: "Tên buổi tập" }, { key: "memberId", label: "ID hội viên", type: "number" }, { key: "trainerId", label: "ID huấn luyện viên", type: "number" }, { key: "startAt", label: "Bắt đầu", type: "datetime-local" }, { key: "endAt", label: "Kết thúc", type: "datetime-local" }, { key: "type", label: "Loại lịch", type: "select", options: [["PT", "PT"], ["Group", "Lớp nhóm"]] }, { key: "status", label: "Trạng thái", type: "select", options: [["scheduled", "Sắp diễn ra"], ["completed", "Hoàn thành"], ["cancelled", "Đã hủy"]] }, { key: "note", label: "Ghi chú" }],
    payments: [{ key: "status", label: "Trạng thái", type: "select", options: [["paid", "Đã thanh toán"], ["pending", "Chờ xử lý"], ["refunded", "Đã hoàn tiền"]] }],
    users: [{ key: "name", label: "Họ và tên" }, { key: "email", label: "Email", type: "email" }, { key: "password", label: "Mật khẩu mới (để trống nếu không đổi)", type: "password" }, { key: "role", label: "Vai trò", type: "select", options: [["admin", "Admin"], ["trainer", "Trainer"]] }],
  };

  const resourceFields = kind === "users" && row.role === "member" ? fields.users.filter(field => field.key !== "role") : fields[kind] || [];
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(resourceFields.map(field => {
    const value = row[field.key];
    if (field.type === "datetime-local" && value) {
      const date = new Date(value);
      return [field.key, `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`];
    }
    return [field.key, value == null ? "" : String(value)];
  })));
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const payload: Record<string, unknown> = { ...values };
    for (const key of ["durationDays", "price", "memberId", "trainerId"]) if (payload[key] !== "") payload[key] = Number(payload[key]);
    if (kind === "users" && !payload.password) delete payload.password;
    try {
      await apiFetch(`/${kind}/${row.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      toast.success("Đã cập nhật dữ liệu");
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật dữ liệu");
    } finally {
      setSaving(false);
    }
  };

  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><form className="create-modal" onSubmit={submit}><div className="modal-head"><div><div className="panel-kicker">CẬP NHẬT DỮ LIỆU</div><h3>{row.name || row.title || row.reference || `Bản ghi #${row.id}`}</h3></div><button type="button" className="icon-button" onClick={onClose}><X size={19}/></button></div><div className="modal-grid">{resourceFields.map(field => <label className="form-field" key={field.key}><span>{field.label}</span>{field.type === "select" ? <select required value={values[field.key]} onChange={event => setValues(current => ({ ...current, [field.key]: event.target.value }))}>{field.options?.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select> : field.type === "textarea" ? <textarea required value={values[field.key]} onChange={event => setValues(current => ({ ...current, [field.key]: event.target.value }))}/> : <input required={field.key !== "password"} type={field.type || "text"} value={values[field.key]} onChange={event => setValues(current => ({ ...current, [field.key]: event.target.value }))}/>}</label>)}</div><div className="modal-foot"><button type="button" className="button button-secondary" onClick={onClose}>Hủy</button><button className="button button-primary" disabled={saving}>{saving ? "Đang lưu..." : "Lưu thay đổi"}<Check size={15}/></button></div></form></div>;
}

function MemberJoinDialog({ plan, onClose, onRegistered }: { plan?: Row; onClose: () => void; onRegistered: () => void }) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planId, setPlanId] = useState(plan ? String(plan.id) : "");
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([apiFetch<Plan[]>("/plans?status=active&limit=100"), apiFetch<Member>("/members/me")])
      .then(([planResult, profileResult]) => {
        setPlans(planResult.data);
        setPlanId(current => current || String(planResult.data[0]?.id || ""));
        const today = new Date().toISOString().slice(0, 10);
        const currentMembership = profileResult.data.membership;
        if (currentMembership?.status === "active" && currentMembership.endDate >= today) {
          const nextStart = new Date(`${currentMembership.endDate}T00:00:00.000Z`);
          nextStart.setUTCDate(nextStart.getUTCDate() + 1);
          setStartDate(nextStart.toISOString().slice(0, 10));
        } else {
          setStartDate(today);
        }
      })
      .catch(loadError => setError(loadError instanceof Error ? loadError.message : "Không thể tải gói tập"))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await apiFetch("/memberships", { method: "POST", body: JSON.stringify({ planId: Number(planId), startDate }) });
      toast.success("Đăng ký gói tập thành công");
      onRegistered();
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Không thể đăng ký gói tập";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const selectedPlan = plans.find(item => item.id === Number(planId));

  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><form className="create-modal" onSubmit={submit}><div className="modal-head"><div><div className="panel-kicker">HỘI VIÊN / ĐĂNG KÝ GÓI</div><h3>{plan ? `Đăng ký ${plan.name}` : "Chọn gói tập"}</h3></div><button type="button" className="icon-button" onClick={onClose}><X size={19}/></button></div>{loading ? <div className="table-loading"><LoadingBlock/></div> : plans.length === 0 ? <div className="empty-state"><strong>Hiện chưa có gói tập khả dụng</strong></div> : <div className="modal-grid"><label className="form-field"><span>Gói tập</span><select required value={planId} onChange={event => setPlanId(event.target.value)}>{plans.map(item => <option key={item.id} value={item.id}>{item.name} · {formatVND(item.price)}</option>)}</select></label><label className="form-field"><span>Ngày bắt đầu</span><input required type="date" value={startDate} onChange={event => setStartDate(event.target.value)}/></label>{selectedPlan && <div className="form-field"><span>Thời hạn và giá</span><strong>{selectedPlan.durationDays} ngày · {formatVND(selectedPlan.price)}</strong></div>}</div>}{error && <div className="login-error">{error}</div>}<div className="modal-foot"><button type="button" className="button button-secondary" onClick={onClose}>Hủy</button><button className="button button-primary" disabled={loading || saving || plans.length === 0}>{saving ? "Đang đăng ký..." : "Xác nhận đăng ký"}<Check size={15}/></button></div></form></div>;
}

export function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [activity, setActivity] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([apiFetch<Dashboard>("/dashboard/summary"), apiFetch<Row[]>("/dashboard/activity")])
      .then(([summary, recent]) => {
        setData(summary.data);
        setActivity(recent.data);
      })
      .catch(err => setError(err instanceof Error ? err.message : "Không thể tải dashboard"))
      .finally(() => setLoading(false));
  }, [requestKey]);

  if (loading) return <><PageIntro title="Tổng quan vận hành" description="Theo dõi sức khỏe phòng tập theo thời gian thực." /><div className="kpi-grid">{[1,2,3,4].map(i => <LoadingBlock key={i} />)}</div></>;
  if (error || !data) return <><PageIntro title="Không thể tải dashboard" description="API đang không phản hồi dữ liệu tổng quan." /><div className="panel empty-state"><div className="empty-icon"><Activity size={20} /></div><strong>{error || "Chưa có dữ liệu"}</strong><button className="button button-primary" onClick={() => setRequestKey(value => value + 1)}>Thử lại</button></div></>;

  return <div className="dashboard-page"><PageIntro eyebrow={new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date()).toUpperCase()} title="Tổng quan vận hành" description="Hiển thị nhanh dữ liệu vận hành của GymFlow." /><div className="kpi-grid"><div className="kpi-card"><div className="kpi-icon lime"><UsersRound size={20} /></div><div className="kpi-label">Tổng hội viên</div><div className="kpi-value">{data.totalMembers.toLocaleString("vi-VN")}</div><div className="kpi-detail"><span className="trend-up"><TrendingUp size={13} />Live</span> {data.activeMembers} đang hoạt động</div></div><div className="kpi-card"><div className="kpi-icon violet"><CreditCard size={20} /></div><div className="kpi-label">Doanh thu</div><div className="kpi-value">{formatVND(data.revenue)}</div><div className="kpi-detail">{data.activeMemberships} gói hoạt động</div></div><div className="kpi-card"><div className="kpi-icon blue"><Activity size={20} /></div><div className="kpi-label">Check-in hôm nay</div><div className="kpi-value">{String(data.todayCheckins).padStart(2, "0")}</div><div className="kpi-detail">Lượt vào phòng tập</div></div><div className="kpi-card"><div className="kpi-icon orange"><Zap size={20} /></div><div className="kpi-label">Gói đang hoạt động</div><div className="kpi-value">{data.activeMemberships.toString()}</div><div className="kpi-detail">Quyền truy cập hiện hành</div></div></div><div className="dashboard-grid"><section className="panel chart-panel"><div className="panel-header"><div><div className="panel-kicker">DOANH THU</div><h3>Hiệu suất doanh thu</h3></div></div><div className="chart-total">{formatVND(data.revenue)} <span className="trend-up"><TrendingUp size={13}/> API live</span></div><div className="chart-wrap"><div className="chart-sparkline">{data.revenueByMonth.map(item => <span key={item.label} style={{ height: `${Math.max(20, (item.value / Math.max(...data.revenueByMonth.map(v => v.value), 1)) * 100)}%` }} />)}</div></div></section><section className="panel"><div className="panel-header"><div><div className="panel-kicker">HOẠT ĐỘNG GẦN ĐÂY</div><h3>Log hệ thống</h3></div></div><div className="activity-list">{activity.slice(0, 6).map(item => <div key={item.id} className="activity-row"><div className="avatar avatar-soft">{initials(item.user?.name || item.member?.name || "System")}</div><div><strong>{item.message || item.action || "Cập nhật"}</strong><span>{item.createdAt ? formatDateTime(item.createdAt) : "Mới"}</span></div></div>)}</div></section></div></div>;
}

export function ResourcePage({ kind }: { kind: string }) {
  const demoUser = getStoredUser();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageMeta, setPageMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);
  const [editingRow, setEditingRow] = useState<Row | null>(null);
  const [showMemberJoin, setShowMemberJoin] = useState(false);
  const [joiningPlan, setJoiningPlan] = useState<Row | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const config: Record<string, { title: string; description: string; endpoint: string; action: string; columns: any[] }> = {
    members: { title: "Quản lý hội viên", description: "Theo dõi hồ sơ, trạng thái và quyền truy cập của hội viên.", endpoint: "/members", action: "Thêm hội viên", columns: [{ key: "name", label: "HỘI VIÊN", render: (row: Row) => <div className="person-cell"><div className="avatar avatar-soft">{initials(row.name)}</div><div><strong>{row.name}</strong><span>{row.code} · {row.email}</span></div></div> }, { key: "phone", label: "SỐ ĐIỆN THOẠI" }, { key: "membership", label: "GÓI ĐANG DÙNG", render: (row: Row) => <span>{row.membership?.plan?.name || "Chưa đăng ký"}</span> }, { key: "status", label: "TRẠNG THÁI", render: (row: Row) => <StatusBadge value={row.status}/> }, { key: "joinedAt", label: "NGÀY THAM GIA", render: (row: Row) => formatDate(row.joinedAt) }] },
    plans: { title: "Gói tập", description: "Thiết kế và quản lý các sản phẩm membership của GymFlow.", endpoint: "/plans", action: "Tạo gói tập", columns: [{ key: "name", label: "TÊN GÓI", render: (row: Row) => <div><strong>{row.name}</strong>{row.popular && <span className="mini-tag">Phổ biến</span>}<span className="cell-sub">{row.description}</span></div> }, { key: "durationDays", label: "THỜI HẠN", render: (row: Row) => `${row.durationDays} ngày` }, { key: "price", label: "GIÁ", render: (row: Row) => <strong>{formatVND(row.price)}</strong> }, { key: "status", label: "TRẠNG THÁI", render: (row: Row) => <StatusBadge value={row.status}/> }] },
    memberships: { title: "Đăng ký gói", description: "Quản lý thời hạn và vòng đời quyền truy cập của hội viên.", endpoint: "/memberships", action: "Tạo đăng ký", columns: [{ key: "member", label: "HỘI VIÊN", render: (row: Row) => <div className="person-cell"><div className="avatar avatar-soft">{initials(row.member?.name)}</div><strong>{row.member?.name}</strong></div> }, { key: "plan", label: "GÓI TẬP", render: (row: Row) => row.plan?.name }, { key: "startDate", label: "BẮT ĐẦU", render: (row: Row) => formatDate(row.startDate) }, { key: "endDate", label: "HẾT HẠN", render: (row: Row) => formatDate(row.endDate) }, { key: "status", label: "TRẠNG THÁI", render: (row: Row) => <StatusBadge value={row.status}/> }] },
    trainers: { title: "Huấn luyện viên", description: "Lịch làm việc, chuyên môn và hồ sơ đội ngũ PT.", endpoint: "/trainers", action: "Thêm huấn luyện viên", columns: [{ key: "name", label: "HUẤN LUYỆN VIÊN", render: (row: Row) => <div className="person-cell"><div className="avatar avatar-violet">{initials(row.name)}</div><div><strong>{row.name}</strong><span>{row.email}</span></div></div> }, { key: "specialty", label: "CHUYÊN MÔN" }, { key: "experience", label: "KINH NGHIỆM" }, { key: "phone", label: "LIÊN HỆ" }, { key: "status", label: "TRẠNG THÁI", render: (row: Row) => <StatusBadge value={row.status}/> }] },
    schedules: { title: "Lịch tập", description: "Sắp xếp lịch PT và lớp nhóm, tránh trùng lịch huấn luyện viên.", endpoint: "/schedules", action: "Tạo lịch tập", columns: [{ key: "title", label: "BUỔI TẬP", render: (row: Row) => <div><strong>{row.title}</strong><span className="cell-sub">{row.type} · {row.note}</span></div> }, { key: "member", label: "HỘI VIÊN", render: (row: Row) => row.member?.name }, { key: "trainer", label: "HUẤN LUYỆN VIÊN", render: (row: Row) => row.trainer?.name }, { key: "startAt", label: "THỜI GIAN", render: (row: Row) => formatDateTime(row.startAt) }, { key: "status", label: "TRẠNG THÁI", render: (row: Row) => <StatusBadge value={row.status}/> }] },
    checkins: { title: "Check-in / check-out", description: "Nắm nhịp ra vào phòng tập theo thời gian thực.", endpoint: "/checkins", action: "Ghi nhận check-in", columns: [{ key: "member", label: "HỘI VIÊN", render: (row: Row) => <div className="person-cell"><div className="avatar avatar-lime">{initials(row.member?.name)}</div><strong>{row.member?.name}</strong></div> }, { key: "checkInAt", label: "CHECK-IN", render: (row: Row) => formatDateTime(row.checkInAt) }, { key: "checkOutAt", label: "CHECK-OUT", render: (row: Row) => row.checkOutAt ? formatDateTime(row.checkOutAt) : <span className="live-pill"><span />Đang tập</span> }, { key: "durationMinutes", label: "THỜI LƯỢNG", render: (row: Row) => row.durationMinutes ? `${row.durationMinutes} phút` : "—" }] },
    payments: { title: "Thanh toán & doanh thu", description: "Ghi nhận dòng tiền và kiểm soát các giao dịch membership.", endpoint: "/payments", action: "Tạo thanh toán", columns: [{ key: "reference", label: "MÃ GIAO DỊCH", render: (row: Row) => <div><strong>{row.reference}</strong><span className="cell-sub">{formatDateTime(row.paidAt)}</span></div> }, { key: "member", label: "HỘI VIÊN", render: (row: Row) => row.member?.name }, { key: "amount", label: "SỐ TIỀN", render: (row: Row) => <strong>{formatVND(row.amount)}</strong> }, { key: "method", label: "PHƯƠNG THỨC", render: (row: Row) => (({ cash: "Tiền mặt", transfer: "Chuyển khoản", card: "Thẻ" } as Record<string, string>)[row.method] || row.method) }, { key: "status", label: "TRẠNG THÁI", render: (row: Row) => <StatusBadge value={row.status}/> }] },
    users: { title: "Người dùng & phân quyền", description: "Quản lý tài khoản truy cập theo vai trò vận hành.", endpoint: "/users", action: "Thêm người dùng", columns: [{ key: "name", label: "NGƯỜI DÙNG", render: (row: Row) => <div className="person-cell"><div className="avatar avatar-soft">{row.avatar || initials(row.name)}</div><div><strong>{row.name}</strong><span>{row.email}</span></div></div> }, { key: "role", label: "VAI TRÒ", render: (row: Row) => <span className="role-pill">{row.role === "admin" ? "Administrator" : row.role === "member" ? "Hội viên" : "Huấn luyện viên"}</span> }, { key: "lastSignedIn", label: "ĐĂNG NHẬP CUỐI", render: (row: Row) => formatDateTime(row.lastSignedIn) }] },
  };

  const meta = config[kind] || config.members;
  const canCreate = demoUser?.role === "admin" || (demoUser?.role === "trainer" && kind === "schedules");
  const role = demoUser?.role;
  const canEditRow = role === "admin" || (role === "trainer" && kind === "schedules");
  const canDeleteRow = (role === "admin" && ["members", "plans", "trainers", "schedules", "users"].includes(kind)) || (role === "trainer" && kind === "schedules");

  const deleteRow = async (item: Row) => {
    if (!window.confirm(`Xóa ${item.name || item.title || item.reference || "bản ghi này"}? Hành động không thể hoàn tác.`)) return;
    try {
      await apiFetch(`${meta.endpoint}/${item.id}`, { method: "DELETE" });
      toast.success("Đã xóa bản ghi");
      setRefreshKey(value => value + 1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xóa bản ghi");
    }
  };

  const checkoutRow = async (item: Row) => {
    try {
      await apiFetch(`/checkins/${item.id}/checkout`, { method: "PATCH" });
      toast.success("Đã ghi nhận check-out");
      setRefreshKey(value => value + 1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể check-out");
    }
  };

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), limit: "10", ...(search ? { search } : {}), ...(filter ? { status: filter } : {}) });
    apiFetch<Row[]>(`${meta.endpoint}?${params}`)
      .then(result => {
        setRows(result.data);
        setPageMeta(result.meta || { page, limit: 10, total: result.data.length, totalPages: 1 });
      })
      .catch(error => setError(error instanceof Error ? error.message : "Không thể tải dữ liệu"))
      .finally(() => setLoading(false));
  }, [kind, search, filter, page, meta.endpoint, refreshKey]);

  useEffect(() => { setPage(1); }, [kind, search, filter]);

  return <div className="resource-page"><PageIntro eyebrow="OPERATIONS / DATA" title={meta.title} description={meta.description} /><div className="panel table-panel"><TableToolbar search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} action={meta.action} onAction={() => setShowCreate(true)} canCreate={canCreate} placeholder={`Tìm trong ${meta.title.toLowerCase()}...`} />{loading ? <div className="table-loading"><LoadingBlock /><LoadingBlock /></div> : error ? <div className="empty-state"><div className="empty-icon"><Activity size={20}/></div><strong>{error}</strong><button className="button button-primary" onClick={() => setRefreshKey(value => value + 1)}>Thử lại</button></div> : <DataTable columns={meta.columns} rows={rows} onRowClick={row => setSelected(row)} canEdit={canEditRow} canDelete={canDeleteRow} onEdit={setEditingRow} onDelete={deleteRow} onCheckout={kind === "checkins" && role === "admin" ? checkoutRow : undefined} onRegister={kind === "plans" && role === "member" ? plan => { setJoiningPlan(plan); setShowMemberJoin(true); } : undefined}/>}<div className="table-footer"><span>Hiển thị <strong>{rows.length}</strong> / {pageMeta.total} bản ghi</span><span className="pagination-controls"><button className="icon-button" disabled={page <= 1} onClick={() => setPage(value => Math.max(1, value - 1))}>←</button><span>Trang {page} / {pageMeta.totalPages}</span><button className="icon-button" disabled={page >= pageMeta.totalPages} onClick={() => setPage(value => value + 1)}>→</button><span className="footer-note"><Check size={14}/> REST API live</span></span></div></div>{showCreate && canCreate && <CreateDialog kind={kind} title={meta.action} endpoint={meta.endpoint} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); setRefreshKey(value => value + 1); }} />}{editingRow && kind === "members" && <EditMemberDialog member={editingRow} onClose={() => setEditingRow(null)} onSaved={() => { setEditingRow(null); setRefreshKey(value => value + 1); }} />}{editingRow && kind !== "members" && <EditResourceDialog kind={kind} row={editingRow} onClose={() => setEditingRow(null)} onSaved={() => { setEditingRow(null); setRefreshKey(value => value + 1); }} />}{showMemberJoin && joiningPlan && <MemberJoinDialog plan={joiningPlan} onClose={() => { setShowMemberJoin(false); setJoiningPlan(null); }} onRegistered={() => { setShowMemberJoin(false); setJoiningPlan(null); setRefreshKey(value => value + 1); }} />}</div>;
}

export function ApiDocsPage() {
  const endpoints = [
    { method: "GET", path: "/api/v1/health", desc: "Health check public" },
    { method: "POST", path: "/api/v1/auth/login", desc: "Nhận JWT token" },
    { method: "GET", path: "/api/v1/auth/me", desc: "User hiện tại" },
    { method: "GET", path: "/api/v1/dashboard/summary", desc: "KPI và revenue chart" },
    { method: "GET", path: "/api/v1/members", desc: "Member list + search/filter/page" },
    { method: "POST", path: "/api/v1/members", desc: "Tạo hội viên" },
    { method: "PATCH", path: "/api/v1/members/:id", desc: "Cập nhật hội viên" },
    { method: "DELETE", path: "/api/v1/members/:id", desc: "Xóa hội viên" },
    { method: "GET", path: "/api/v1/plans", desc: "Gói tập" },
    { method: "POST", path: "/api/v1/memberships", desc: "Đăng ký membership" },
    { method: "GET", path: "/api/v1/trainers", desc: "Huấn luyện viên" },
    { method: "POST", path: "/api/v1/schedules", desc: "Tạo lịch tập + overlap check" },
    { method: "DELETE", path: "/api/v1/schedules/:id", desc: "Xóa lịch tập" },
    { method: "POST", path: "/api/v1/checkins", desc: "Ghi nhận check-in" },
    { method: "PATCH", path: "/api/v1/checkins/:id/checkout", desc: "Ghi nhận check-out" },
    { method: "POST", path: "/api/v1/payments", desc: "Tạo thanh toán" },
    { method: "GET", path: "/api/v1/audit-logs", desc: "Audit log admin" },
  ];

  return <div className="resource-page"><PageIntro eyebrow="DEVELOPER EXPERIENCE" title="REST API documentation" description="Hợp đồng API nhất quán cho frontend, mobile và các dịch vụ tích hợp." action="Tải OpenAPI" onAction={() => window.open("/openapi.json", "_blank", "noopener,noreferrer")}/><div className="docs-layout"><section className="panel docs-intro"><div className="api-badge"><FileCode2 size={20}/>REST API v1</div><h3>Được xây cho tích hợp dịch vụ</h3><p>GymFlow cung cấp RESTful API có JWT authentication, role-based authorization, Zod validation, pagination, business rules và error shape thống nhất.</p><div className="api-badges"><span><Check size={14}/> JWT auth</span><span><MoreHorizontal size={14}/> Role-based</span><span><Sparkles size={14}/> Zod validation</span></div></section><section className="panel endpoint-panel"><div className="panel-header"><div><div className="panel-kicker">ENDPOINTS</div><h3>Resource catalog</h3></div><span className="endpoint-count">{endpoints.length} endpoints</span></div><div className="endpoint-list">{endpoints.map((endpoint, index) => <div className="endpoint-row" key={`${endpoint.method}-${endpoint.path}-${index}`}><span className={`method-pill ${endpoint.method.toLowerCase()}`}>{endpoint.method}</span><code>{endpoint.path}</code><span>{endpoint.desc}</span><ArrowUpRight size={15}/></div>)}</div></section></div></div>;
}

function MemberHomePage() {
  const [member, setMember] = useState<Member | null>(null);
  const [error, setError] = useState("");
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    apiFetch<Member>("/members/me")
      .then(result => setMember(result.data))
      .catch(loadError => setError(loadError instanceof Error ? loadError.message : "Không thể tải hồ sơ hội viên"));
  }, [refreshKey]);

  if (error) return <><PageIntro title="Không thể tải hồ sơ" description={error}/><div className="panel empty-state"><strong>{error}</strong></div></>;
  if (!member) return <><PageIntro title="Đang tải hồ sơ của bạn"/><div className="table-loading"><LoadingBlock/></div></>;

  const endDate = member.membership?.endDate ? new Date(`${member.membership.endDate}T00:00:00`) : null;
  const today = new Date();
  const daysRemaining = endDate ? Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))) : 0;
  const status = member.membership?.status || "inactive";

  return <div className="resource-page member-home-page"><PageIntro eyebrow="GYMFLOW / HỘI VIÊN" title={`Xin chào, ${member.name}`} description={`${member.code} · Tham gia từ ${formatDate(member.joinedAt)}`}/><section className="panel member-hero"><div className="member-hero-main"><div className="member-hero-avatar">{initials(member.name)}</div><div><div className="member-hero-kicker">TÀI KHOẢN HỘI VIÊN</div><h3>{member.name}</h3><p>{member.email} · {member.phone}</p></div></div><div className="member-hero-actions"><button className="button button-primary" onClick={() => setShowJoinDialog(true)}><Plus size={15}/>Đăng ký gói</button><Link href="/plans" className="member-plan-link">Xem gói tập</Link></div></section><div className="kpi-grid member-kpi-grid"><div className="kpi-card"><div className="kpi-icon lime"><CreditCard size={18}/></div><div className="kpi-label">Gói hiện tại</div><div className="kpi-value">{member.membership?.plan?.name || "Chưa có"}</div><div className="kpi-detail">{member.membership?.plan ? `${member.membership.plan.name} · ${formatDate(member.membership.endDate)}` : "Chưa đăng ký bất kỳ gói nào"}</div></div><div className="kpi-card"><div className="kpi-icon blue"><Activity size={18}/></div><div className="kpi-label">Ngày còn lại</div><div className="kpi-value">{daysRemaining}</div><div className="kpi-detail">ngày tính từ hôm nay</div></div><div className="kpi-card"><div className="kpi-icon violet"><TrendingUp size={18}/></div><div className="kpi-label">Trạng thái</div><div className="kpi-value"><StatusBadge value={status}/></div><div className="kpi-detail">{status === "active" ? "Quyền truy cập đang hoạt động" : "Cần cập nhật hoặc gia hạn"}</div></div><div className="kpi-card"><div className="kpi-icon orange"><Zap size={18}/></div><div className="kpi-label">Ngày tham gia</div><div className="kpi-value">{new Date(member.joinedAt).getFullYear()}</div><div className="kpi-detail">{formatDate(member.joinedAt)}</div></div></div><div className="dashboard-grid"><section className="panel member-profile-panel"><div className="panel-header"><div><div className="panel-kicker">HỒ SƠ CỦA TÔI</div><h3>Thông tin cá nhân</h3></div></div><div className="member-detail-grid">{[["Email", member.email], ["Số điện thoại", member.phone], ["Giới tính", member.gender], ["Ngày sinh", formatDate(member.birthDate)], ["Địa chỉ", member.address], ["Mã hội viên", member.code]].map(([label, value]) => <div className="member-detail-field" key={label}><span>{label}</span><strong>{value || "—"}</strong></div>)}</div></section><section className="panel member-membership-panel"><div className="panel-kicker">GÓI TẬP HIỆN TẠI</div><div className="member-membership-header"><div><h3>{member.membership?.plan?.name || "Chưa đăng ký gói"}</h3><p className="cell-sub">Hết hạn: {formatDate(member.membership?.endDate) || "Chưa xác định"}</p></div><StatusBadge value={status}/></div><div className="member-membership-metrics"><div className="member-metric"><span>Ngày bắt đầu</span><strong>{formatDate(member.membership?.startDate) || "—"}</strong></div><div className="member-metric"><span>Ngày kết thúc</span><strong>{formatDate(member.membership?.endDate) || "—"}</strong></div><div className="member-metric"><span>Còn lại</span><strong>{daysRemaining} ngày</strong></div></div><div className="member-membership-note"><Check size={15}/> {status === "active" ? "Bạn đang trong giai đoạn quyền truy cập đang hoạt động." : "Bạn đang chưa có gói tập đang hoạt động. Hãy chọn gói phù hợp ngay."}</div><div className="member-home-actions"><button className="button button-primary" onClick={() => setShowJoinDialog(true)}><Plus size={15}/>Đăng ký gói</button><Link href="/plans" className="member-plan-link">Xem các gói tập</Link></div></section></div><section className="panel member-next-steps"><div className="panel-header"><div><div className="panel-kicker">BƯỚC TIẾP THEO</div><h3>Chuẩn bị cho hành trình tập luyện</h3></div></div><ul className="member-checklist"><li><div className="member-check-icon"><Check size={13}/></div><div><strong>Chọn gói phù hợp</strong><span>Đăng ký gói chính xác với mục tiêu và lịch tập của bạn.</span></div></li><li><div className="member-check-icon"><Check size={13}/></div><div><strong>Đặt lịch PT</strong><span>Liên hệ huấn luyện viên hoặc lên lịch tập ngay trong phần lịch học.</span></div></li><li><div className="member-check-icon"><Check size={13}/></div><div><strong>Track tiến độ</strong><span>Theo dõi quá trình tập luyện, check-in và dữ liệu vận động của hệ thống.</span></div></li></ul></section>{showJoinDialog && <MemberJoinDialog onClose={() => setShowJoinDialog(false)} onRegistered={() => { setShowJoinDialog(false); setRefreshKey(value => value + 1); }}/>}</div>;
}

function MemberDetailPage({ id }: { id: string }) {
  const [member, setMember] = useState<Member | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { apiFetch<Member>(`/members/${id}`).then(result => setMember(result.data)).catch(error => setError(error instanceof Error ? error.message : "Không thể tải hội viên")); }, [id]);

  if (error) return <><PageIntro title="Không thể tải hội viên" description={error}/><div className="panel empty-state"><button className="button button-primary" onClick={() => window.history.back()}>Quay lại</button></div></>;
  if (!member) return <><PageIntro title="Đang tải hồ sơ hội viên"/><div className="table-loading"><LoadingBlock/></div></>;

  return <div className="resource-page"><PageIntro eyebrow="MEMBER DETAIL / REST GET" title={member.name} description={`${member.code} · ${member.email}`}/><div className="dashboard-grid"><section className="panel docs-intro"><div className="person-cell"><div className="avatar avatar-lime">{initials(member.name)}</div><div><strong>{member.name}</strong><span>{member.phone}</span></div></div><div className="detail-json" style={{ marginTop: 18 }}>{JSON.stringify(member, null, 2)}</div></section><section className="panel mix-panel"><div className="panel-kicker">MEMBERSHIP</div><h3>{member.membership?.plan?.name || "Chưa đăng ký gói"}</h3><p className="cell-sub">Hết hạn: {formatDate(member.membership?.endDate)}</p><StatusBadge value={member.membership?.status || "inactive"}/></section></div></div>;
}

export default function Home() {
  const [location] = useLocation();
  const currentUser = getStoredUser();
  const path = location.split("/").filter(Boolean);
  const memberPages = ["plans", "memberships", "checkins", "schedules", "payments"];

  if (currentUser?.role === "member" && (!path[0] || !memberPages.includes(path[0]))) return <MemberHomePage/>;
  if (currentUser?.role === "trainer") return <ResourcePage kind="schedules"/>;
  if (path[0] === "api-docs") return <ApiDocsPage/>;
  if (path[0] === "members" && path[1]) return <MemberDetailPage id={path[1]}/>;
  if (path[0] && ["members", "plans", "memberships", "checkins", "trainers", "schedules", "payments", "users"].includes(path[0])) return <ResourcePage kind={path[0]}/>;
  return <DashboardPage/>;
}
