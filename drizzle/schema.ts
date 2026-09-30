import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, date, datetime, index } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 320 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "member", "trainer"]).default("user").notNull(),
  password: varchar("password", { length: 255 }),
  memberId: int("memberId"),
  avatar: varchar("avatar", { length: 16 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const members = mysqlTable("members", {
  id: int("id").autoincrement().primaryKey(), code: varchar("code", { length: 32 }).notNull().unique(), name: varchar("name", { length: 150 }).notNull(), email: varchar("email", { length: 320 }).notNull(), phone: varchar("phone", { length: 20 }).notNull(), gender: mysqlEnum("gender", ["Nam", "Nữ", "Khác"]).notNull(), birthDate: date("birthDate").notNull(), address: text("address").notNull(), status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(), joinedAt: date("joinedAt").notNull(), emergencyContact: varchar("emergencyContact", { length: 255 }).notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ searchIdx: index("members_search_idx").on(table.name, table.email, table.phone), statusIdx: index("members_status_idx").on(table.status) }));

export const plans = mysqlTable("plans", {
  id: int("id").autoincrement().primaryKey(), name: varchar("name", { length: 120 }).notNull(), description: text("description").notNull(), durationDays: int("durationDays").notNull(), price: decimal("price", { precision: 12, scale: 0 }).notNull(), status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(), popular: int("popular").default(0).notNull(),
});

export const memberships = mysqlTable("memberships", {
  id: int("id").autoincrement().primaryKey(), memberId: int("memberId").notNull().references(() => members.id), planId: int("planId").notNull().references(() => plans.id), startDate: date("startDate").notNull(), endDate: date("endDate").notNull(), amount: decimal("amount", { precision: 12, scale: 0 }).notNull(), status: mysqlEnum("status", ["active", "expired", "cancelled"]).default("active").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const trainers = mysqlTable("trainers", {
  id: int("id").autoincrement().primaryKey(), name: varchar("name", { length: 150 }).notNull(), email: varchar("email", { length: 320 }).notNull(), phone: varchar("phone", { length: 20 }).notNull(), specialty: varchar("specialty", { length: 150 }).notNull(), experience: varchar("experience", { length: 50 }).notNull(), status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
});

export const schedules = mysqlTable("schedules", {
  id: int("id").autoincrement().primaryKey(), title: varchar("title", { length: 150 }).notNull(), memberId: int("memberId").notNull().references(() => members.id), trainerId: int("trainerId").notNull().references(() => trainers.id), startAt: datetime("startAt").notNull(), endAt: datetime("endAt").notNull(), type: mysqlEnum("type", ["PT", "Group"]).notNull(), status: mysqlEnum("status", ["scheduled", "completed", "cancelled"]).default("scheduled").notNull(), note: text("note"),
});

export const checkins = mysqlTable("checkins", {
  id: int("id").autoincrement().primaryKey(), memberId: int("memberId").notNull().references(() => members.id), checkInAt: timestamp("checkInAt").notNull(), checkOutAt: timestamp("checkOutAt"), durationMinutes: int("durationMinutes"), recordedBy: int("recordedBy").notNull().references(() => users.id),
});

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(), memberId: int("memberId").notNull().references(() => members.id), membershipId: int("membershipId").references(() => memberships.id), amount: decimal("amount", { precision: 12, scale: 0 }).notNull(), method: mysqlEnum("method", ["cash", "transfer", "card"]).notNull(), status: mysqlEnum("status", ["paid", "pending", "refunded"]).default("paid").notNull(), reference: varchar("reference", { length: 64 }).notNull().unique(), paidAt: timestamp("paidAt").notNull(), createdBy: int("createdBy").notNull().references(() => users.id),
});

export const auditLogs = mysqlTable("auditLogs", {
  id: varchar("id", { length: 64 }).primaryKey(), actorId: int("actorId").notNull().references(() => users.id), action: varchar("action", { length: 32 }).notNull(), resource: varchar("resource", { length: 64 }).notNull(), resourceId: int("resourceId"), createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
