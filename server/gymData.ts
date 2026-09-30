import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

export type Role = "admin" | "member" | "trainer";
export type Status = "active" | "inactive" | "expired" | "cancelled" | "scheduled" | "completed";

export type GymUser = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
  memberId?: number;
  avatar: string;
  lastSignedIn?: string;
};

export type Member = {
  id: number;
  code: string;
  name: string;
  email: string;
  phone: string;
  gender: "Nam" | "Nữ" | "Khác";
  birthDate: string;
  address: string;
  status: "active" | "inactive";
  joinedAt: string;
  emergencyContact: string;
};

export type Plan = {
  id: number;
  name: string;
  description: string;
  durationDays: number;
  price: number;
  status: "active" | "inactive";
  popular?: boolean;
};

export type Membership = {
  id: number;
  memberId: number;
  planId: number;
  startDate: string;
  endDate: string;
  amount: number;
  status: "active" | "expired" | "cancelled";
};

export type Trainer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  experience: string;
  status: "active" | "inactive";
};

export type Schedule = {
  id: number;
  title: string;
  memberId: number;
  trainerId: number;
  startAt: string;
  endAt: string;
  type: "PT" | "Group";
  status: "scheduled" | "completed" | "cancelled";
  note: string;
};

export type Checkin = {
  id: number;
  memberId: number;
  checkInAt: string;
  checkOutAt?: string;
  durationMinutes?: number;
  recordedBy: number;
};

export type Payment = {
  id: number;
  memberId: number;
  membershipId?: number;
  amount: number;
  method: "cash" | "transfer" | "card";
  status: "paid" | "pending" | "refunded";
  reference: string;
  paidAt: string;
  createdBy: number;
};

export type AuditLog = {
  id: string;
  actorId: number;
  action: string;
  resource: string;
  resourceId?: number;
  createdAt: string;
};

const iso = (daysAgo = 0, hour = 8, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};
const dateOnly = (daysAgo = 0) => iso(daysAgo).slice(0, 10);

export class GymStore {
  private readonly dataFile: string;
  users: GymUser[] = [
    { id: 1, name: "Nguyễn Minh Anh", email: "admin@gymflow.vn", password: "demo123", role: "admin", avatar: "MA", lastSignedIn: iso(0, 7, 45) },
    { id: 2, name: "Phạm Gia Huy", email: "huy.pham@email.com", password: "demo123", role: "member", memberId: 1, avatar: "GH", lastSignedIn: iso(0, 7, 30) },
    { id: 3, name: "Lê Hoàng Nam", email: "trainer@gymflow.vn", password: "demo123", role: "trainer", avatar: "LN", lastSignedIn: iso(1, 9, 15) },
  ];
  members: Member[] = [
    { id: 1, code: "GYM-001", name: "Phạm Gia Huy", email: "huy.pham@email.com", phone: "0901234567", gender: "Nam", birthDate: "1998-03-15", address: "Quận 1, TP. Hồ Chí Minh", status: "active", joinedAt: dateOnly(96), emergencyContact: "Phạm Thị Lan — 0909876543" },
    { id: 2, code: "GYM-002", name: "Nguyễn Khánh Linh", email: "linh.nguyen@email.com", phone: "0912345678", gender: "Nữ", birthDate: "2000-07-22", address: "Quận 3, TP. Hồ Chí Minh", status: "active", joinedAt: dateOnly(82), emergencyContact: "Nguyễn Văn Bình — 0911112222" },
    { id: 3, code: "GYM-003", name: "Đỗ Minh Quân", email: "quan.do@email.com", phone: "0987654321", gender: "Nam", birthDate: "1995-11-02", address: "Bình Thạnh, TP. Hồ Chí Minh", status: "active", joinedAt: dateOnly(67), emergencyContact: "Đỗ Thị Mai — 0988889999" },
    { id: 4, code: "GYM-004", name: "Trần Ngọc Mai", email: "mai.tran@email.com", phone: "0934567890", gender: "Nữ", birthDate: "1997-01-30", address: "Phú Nhuận, TP. Hồ Chí Minh", status: "active", joinedAt: dateOnly(54), emergencyContact: "Trần Minh — 0933334444" },
    { id: 5, code: "GYM-005", name: "Vũ Thành Long", email: "long.vu@email.com", phone: "0978123456", gender: "Nam", birthDate: "1992-08-18", address: "Quận 10, TP. Hồ Chí Minh", status: "inactive", joinedAt: dateOnly(120), emergencyContact: "Vũ Thị Hạnh — 0977001100" },
    { id: 6, code: "GYM-006", name: "Lý Thu Hà", email: "ha.ly@email.com", phone: "0965432109", gender: "Nữ", birthDate: "2001-05-09", address: "Tân Bình, TP. Hồ Chí Minh", status: "active", joinedAt: dateOnly(41), emergencyContact: "Lý Văn Tùng — 0965002200" },
    { id: 7, code: "GYM-007", name: "Bùi Đức Anh", email: "anh.bui@email.com", phone: "0943210987", gender: "Nam", birthDate: "1999-12-26", address: "Thủ Đức, TP. Hồ Chí Minh", status: "active", joinedAt: dateOnly(25), emergencyContact: "Bùi Thị Hương — 0943003300" },
    { id: 8, code: "GYM-008", name: "Hoàng Yến Nhi", email: "nhi.hoang@email.com", phone: "0923456781", gender: "Nữ", birthDate: "1996-09-12", address: "Gò Vấp, TP. Hồ Chí Minh", status: "active", joinedAt: dateOnly(16), emergencyContact: "Hoàng Văn Sơn — 0923004400" },
    { id: 9, code: "GYM-009", name: "Mai Tuấn Kiệt", email: "kiet.mai@email.com", phone: "0907654321", gender: "Nam", birthDate: "1994-04-03", address: "Quận 7, TP. Hồ Chí Minh", status: "active", joinedAt: dateOnly(9), emergencyContact: "Mai Ngọc — 0907005500" },
  ];
  plans: Plan[] = [
    { id: 1, name: "Flex 1 tháng", description: "Tự do tập luyện không giới hạn trong 30 ngày.", durationDays: 30, price: 599000, status: "active" },
    { id: 2, name: "Power 3 tháng", description: "Gói tiết kiệm cho người tập đều đặn.", durationDays: 90, price: 1499000, status: "active", popular: true },
    { id: 3, name: "Elite 6 tháng", description: "Tập luyện chuyên sâu kèm ưu đãi PT.", durationDays: 180, price: 2699000, status: "active" },
    { id: 4, name: "Annual Pro", description: "Một năm bứt phá với quyền lợi cao cấp.", durationDays: 365, price: 4499000, status: "active" },
  ];
  memberships: Membership[] = [
    { id: 1, memberId: 1, planId: 2, startDate: dateOnly(30), endDate: dateOnly(-60), amount: 1499000, status: "active" },
    { id: 2, memberId: 2, planId: 3, startDate: dateOnly(20), endDate: dateOnly(-160), amount: 2699000, status: "active" },
    { id: 3, memberId: 3, planId: 1, startDate: dateOnly(18), endDate: dateOnly(-12), amount: 599000, status: "active" },
    { id: 4, memberId: 4, planId: 2, startDate: dateOnly(70), endDate: dateOnly(20), amount: 1499000, status: "active" },
    { id: 5, memberId: 5, planId: 1, startDate: dateOnly(120), endDate: dateOnly(90), amount: 599000, status: "expired" },
    { id: 6, memberId: 6, planId: 4, startDate: dateOnly(5), endDate: dateOnly(-360), amount: 4499000, status: "active" },
    { id: 7, memberId: 7, planId: 1, startDate: dateOnly(20), endDate: dateOnly(10), amount: 599000, status: "active" },
    { id: 8, memberId: 8, planId: 2, startDate: dateOnly(14), endDate: dateOnly(-76), amount: 1499000, status: "active" },
  ];
  trainers: Trainer[] = [
    { id: 1, name: "Lê Hoàng Nam", email: "trainer@gymflow.vn", phone: "0909988776", specialty: "Strength & Conditioning", experience: "8 năm", status: "active" },
    { id: 2, name: "Nguyễn Thảo Vy", email: "vy.trainer@gymflow.vn", phone: "0911223344", specialty: "Yoga & Mobility", experience: "5 năm", status: "active" },
    { id: 3, name: "Phan Quốc Hưng", email: "hung.trainer@gymflow.vn", phone: "0922334455", specialty: "Bodybuilding", experience: "6 năm", status: "active" },
  ];
  schedules: Schedule[] = [
    { id: 1, title: "Strength Basics", memberId: 1, trainerId: 1, startAt: iso(0, 9, 0), endAt: iso(0, 10, 0), type: "PT", status: "completed", note: "Tập trung compound lifts" },
    { id: 2, title: "Mobility Flow", memberId: 2, trainerId: 2, startAt: iso(0, 14, 30), endAt: iso(0, 15, 30), type: "Group", status: "scheduled", note: "Phòng Studio B" },
    { id: 3, title: "Body Recomp", memberId: 3, trainerId: 3, startAt: iso(0, 17, 0), endAt: iso(0, 18, 0), type: "PT", status: "scheduled", note: "Đo chỉ số trước buổi tập" },
    { id: 4, title: "Power Session", memberId: 4, trainerId: 1, startAt: iso(1, 18, 0), endAt: iso(1, 19, 0), type: "PT", status: "completed", note: "Lower body" },
    { id: 5, title: "Yoga Reset", memberId: 6, trainerId: 2, startAt: iso(-1, 7, 30), endAt: iso(-1, 8, 30), type: "Group", status: "scheduled", note: "Mang khăn cá nhân" },
  ];
  checkins: Checkin[] = [
    { id: 1, memberId: 1, checkInAt: iso(0, 6, 42), recordedBy: 1 },
    { id: 2, memberId: 2, checkInAt: iso(0, 7, 5), checkOutAt: iso(0, 8, 22), durationMinutes: 77, recordedBy: 1 },
    { id: 3, memberId: 3, checkInAt: iso(0, 7, 30), checkOutAt: iso(0, 8, 45), durationMinutes: 75, recordedBy: 1 },
    { id: 4, memberId: 4, checkInAt: iso(0, 8, 10), recordedBy: 1 },
    { id: 5, memberId: 6, checkInAt: iso(0, 6, 18), checkOutAt: iso(0, 7, 31), durationMinutes: 73, recordedBy: 2 },
    { id: 6, memberId: 7, checkInAt: iso(1, 17, 45), checkOutAt: iso(1, 19, 10), durationMinutes: 85, recordedBy: 2 },
    { id: 7, memberId: 8, checkInAt: iso(1, 18, 5), checkOutAt: iso(1, 19, 2), durationMinutes: 57, recordedBy: 2 },
    { id: 8, memberId: 9, checkInAt: iso(2, 18, 15), checkOutAt: iso(2, 19, 35), durationMinutes: 80, recordedBy: 2 },
  ];
  payments: Payment[] = [
    { id: 1, memberId: 1, membershipId: 1, amount: 1499000, method: "transfer", status: "paid", reference: "GF-2026-0001", paidAt: iso(30, 10, 20), createdBy: 1 },
    { id: 2, memberId: 2, membershipId: 2, amount: 2699000, method: "card", status: "paid", reference: "GF-2026-0002", paidAt: iso(20, 11, 5), createdBy: 1 },
    { id: 3, memberId: 3, membershipId: 3, amount: 599000, method: "cash", status: "paid", reference: "GF-2026-0003", paidAt: iso(18, 8, 40), createdBy: 1 },
    { id: 4, memberId: 4, membershipId: 4, amount: 1499000, method: "transfer", status: "paid", reference: "GF-2026-0004", paidAt: iso(70, 16, 10), createdBy: 1 },
    { id: 5, memberId: 6, membershipId: 6, amount: 4499000, method: "card", status: "paid", reference: "GF-2026-0005", paidAt: iso(5, 12, 15), createdBy: 1 },
    { id: 6, memberId: 7, membershipId: 7, amount: 599000, method: "cash", status: "paid", reference: "GF-2026-0006", paidAt: iso(20, 9, 25), createdBy: 1 },
    { id: 7, memberId: 8, membershipId: 8, amount: 1499000, method: "transfer", status: "paid", reference: "GF-2026-0007", paidAt: iso(14, 10, 45), createdBy: 1 },
  ];
  auditLogs: AuditLog[] = [];
  nextIds: Record<string, number> = { members: 10, plans: 5, memberships: 9, trainers: 4, schedules: 6, checkins: 9, payments: 8, users: 4 };

  constructor(dataFile = process.env.GYMFLOW_DATA_FILE || resolve(process.cwd(), ".gymflow-data", "gymflow.json")) {
    this.dataFile = dataFile;
    for (const member of this.members) {
      if (this.users.some(user => user.memberId === member.id)) continue;
      this.users.push({ id: this.nextIds.users++, name: member.name, email: member.email, password: "demo123", role: "member", memberId: member.id, avatar: member.name.split(" ").map(part => part[0]).slice(-2).join("").toUpperCase() });
    }
    this.load();
  }

  private load() {
    try {
      const saved = JSON.parse(readFileSync(this.dataFile, "utf8")) as Partial<GymStore>;
      if (Array.isArray(saved.members)) this.members = saved.members;
      if (Array.isArray(saved.plans)) this.plans = saved.plans;
      if (Array.isArray(saved.memberships)) this.memberships = saved.memberships;
      if (Array.isArray(saved.trainers)) this.trainers = saved.trainers;
      if (Array.isArray(saved.schedules)) this.schedules = saved.schedules;
      if (Array.isArray(saved.checkins)) this.checkins = saved.checkins;
      if (Array.isArray(saved.payments)) this.payments = saved.payments;
      if (Array.isArray(saved.auditLogs)) this.auditLogs = saved.auditLogs;
      if (Array.isArray(saved.users)) {
        this.users = saved.users.map(user => ({
          ...user,
          role: user.role,
          memberId: user.role === "member" ? user.memberId ?? this.members.find(member => member.email.toLowerCase() === user.email.toLowerCase())?.id : undefined,
        }));
      }
      if (saved.nextIds) this.nextIds = { ...this.nextIds, ...saved.nextIds };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") console.error("[Store] Could not load saved data:", error);
    }
  }

  save() {
    mkdirSync(dirname(this.dataFile), { recursive: true });
    const temporaryFile = `${this.dataFile}.tmp`;
    const snapshot = {
      users: this.users,
      members: this.members,
      plans: this.plans,
      memberships: this.memberships,
      trainers: this.trainers,
      schedules: this.schedules,
      checkins: this.checkins,
      payments: this.payments,
      auditLogs: this.auditLogs,
      nextIds: this.nextIds,
    };
    writeFileSync(temporaryFile, JSON.stringify(snapshot, null, 2), "utf8");
    renameSync(temporaryFile, this.dataFile);
  }

  nextId(collection: keyof Pick<GymStore, "members" | "plans" | "memberships" | "trainers" | "schedules" | "checkins" | "payments" | "users">) {
    const id = this.nextIds[collection];
    this.nextIds[collection] += 1;
    return id;
  }
  log(actorId: number, action: string, resource: string, resourceId?: number) {
    this.auditLogs.unshift({ id: randomUUID(), actorId, action, resource, resourceId, createdAt: new Date().toISOString() });
  }
  getMemberMembership(memberId: number) {
    return this.memberships.find(item => item.memberId === memberId && item.status === "active") ?? this.memberships.find(item => item.memberId === memberId);
  }
  enrichMember(member: Member) {
    const membership = this.getMemberMembership(member.id);
    const plan = membership ? this.plans.find(item => item.id === membership.planId) : undefined;
    return { ...member, membership: membership ? { ...membership, plan } : undefined };
  }
  dashboard() {
    const activeMembers = this.members.filter(member => member.status === "active").length;
    const today = new Date().toISOString().slice(0, 10);
    const todayCheckins = this.checkins.filter(item => item.checkInAt.slice(0, 10) === today).length;
    const revenue = this.payments.filter(item => item.status === "paid").reduce((sum, item) => sum + item.amount, 0);
    const activeMemberships = this.memberships.filter(item => item.status === "active").length;
    const monthKeys = Array.from({ length: 6 }, (_, index) => { const month = new Date(); month.setDate(1); month.setMonth(month.getMonth() - (5 - index)); return month; });
    const revenueByMonth = monthKeys.map(month => ({ label: `T${month.getMonth() + 1}`, value: this.payments.filter(item => item.status === "paid" && new Date(item.paidAt).getFullYear() === month.getFullYear() && new Date(item.paidAt).getMonth() === month.getMonth()).reduce((sum, item) => sum + item.amount, 0) }));
    return { totalMembers: this.members.length, activeMembers, todayCheckins, revenue, activeMemberships, revenueByMonth, membershipBreakdown: [{ label: "Đang hoạt động", value: activeMemberships }, { label: "Sắp hết hạn", value: this.memberships.filter(item => item.status === "active" && item.endDate < dateOnly(-14)).length }, { label: "Đã hết hạn", value: this.memberships.filter(item => item.status === "expired").length }] };
  }
}

export const gymStore = new GymStore();
