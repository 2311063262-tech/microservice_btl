import { relations } from "drizzle-orm";
import { auditLogs, checkins, members, memberships, payments, plans, schedules, trainers, users } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({ checkins: many(checkins), payments: many(payments), auditLogs: many(auditLogs) }));
export const membersRelations = relations(members, ({ many }) => ({ memberships: many(memberships), schedules: many(schedules), checkins: many(checkins), payments: many(payments) }));
export const plansRelations = relations(plans, ({ many }) => ({ memberships: many(memberships) }));
export const membershipsRelations = relations(memberships, ({ one, many }) => ({ member: one(members, { fields: [memberships.memberId], references: [members.id] }), plan: one(plans, { fields: [memberships.planId], references: [plans.id] }), payments: many(payments) }));
export const trainersRelations = relations(trainers, ({ many }) => ({ schedules: many(schedules) }));
export const schedulesRelations = relations(schedules, ({ one }) => ({ member: one(members, { fields: [schedules.memberId], references: [members.id] }), trainer: one(trainers, { fields: [schedules.trainerId], references: [trainers.id] }) }));
export const checkinsRelations = relations(checkins, ({ one }) => ({ member: one(members, { fields: [checkins.memberId], references: [members.id] }), recorder: one(users, { fields: [checkins.recordedBy], references: [users.id] }) }));
export const paymentsRelations = relations(payments, ({ one }) => ({ member: one(members, { fields: [payments.memberId], references: [members.id] }), membership: one(memberships, { fields: [payments.membershipId], references: [memberships.id] }), creator: one(users, { fields: [payments.createdBy], references: [users.id] }) }));
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({ actor: one(users, { fields: [auditLogs.actorId], references: [users.id] }) }));
