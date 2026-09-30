import { auditLogs, checkins, members, memberships, payments, plans, schedules, trainers, users } from "../drizzle/schema";
import { getDb } from "./db";
import { gymStore, type Role } from "./gymData";

const toDate = (value: string | Date) => value instanceof Date ? value : new Date(value);
const toIso = (value: string | Date | null | undefined) => value == null ? undefined : toDate(value).toISOString();
const toDateOnly = (value: string | Date) => value instanceof Date ? value.toISOString().slice(0, 10) : value.slice(0, 10);
let writeQueue = Promise.resolve();

function snapshotStore() {
  return {
    users: gymStore.users.map(item => ({ ...item })),
    members: gymStore.members.map(item => ({ ...item })),
    plans: gymStore.plans.map(item => ({ ...item })),
    memberships: gymStore.memberships.map(item => ({ ...item })),
    trainers: gymStore.trainers.map(item => ({ ...item })),
    schedules: gymStore.schedules.map(item => ({ ...item })),
    checkins: gymStore.checkins.map(item => ({ ...item })),
    payments: gymStore.payments.map(item => ({ ...item })),
    auditLogs: gymStore.auditLogs.map(item => ({ ...item })),
  };
}

async function replaceDatabaseSnapshot() {
  const db = await getDb();
  if (!db) throw new Error("DATABASE_URL chưa được cấu hình");
  const snapshot = snapshotStore();

  await db.transaction(async tx => {
    await tx.delete(auditLogs);
    await tx.delete(payments);
    await tx.delete(checkins);
    await tx.delete(schedules);
    await tx.delete(memberships);
    await tx.delete(members);
    await tx.delete(trainers);
    await tx.delete(plans);
    await tx.delete(users);

    if (snapshot.users.length) await tx.insert(users).values(snapshot.users.map(user => ({ id: user.id, openId: user.email, name: user.name, email: user.email, loginMethod: "demo", role: user.role, password: user.password, memberId: user.memberId ?? null, avatar: user.avatar, lastSignedIn: toDate(user.lastSignedIn || new Date()) })));
    if (snapshot.members.length) await tx.insert(members).values(snapshot.members.map(member => ({ ...member, id: member.id, birthDate: toDate(`${toDateOnly(member.birthDate)}T00:00:00.000Z`), joinedAt: toDate(`${toDateOnly(member.joinedAt)}T00:00:00.000Z`) })));
    if (snapshot.plans.length) await tx.insert(plans).values(snapshot.plans.map(plan => ({ ...plan, id: plan.id, price: String(plan.price), popular: plan.popular ? 1 : 0 })));
    if (snapshot.trainers.length) await tx.insert(trainers).values(snapshot.trainers.map(trainer => ({ ...trainer, id: trainer.id })));
    if (snapshot.memberships.length) await tx.insert(memberships).values(snapshot.memberships.map(item => ({ ...item, id: item.id, startDate: toDate(`${toDateOnly(item.startDate)}T00:00:00.000Z`), endDate: toDate(`${toDateOnly(item.endDate)}T00:00:00.000Z`), amount: String(item.amount) })));
    if (snapshot.schedules.length) await tx.insert(schedules).values(snapshot.schedules.map(item => ({ ...item, id: item.id, startAt: toDate(item.startAt), endAt: toDate(item.endAt) })));
    if (snapshot.checkins.length) await tx.insert(checkins).values(snapshot.checkins.map(item => ({ ...item, id: item.id, checkInAt: toDate(item.checkInAt), checkOutAt: item.checkOutAt ? toDate(item.checkOutAt) : null, durationMinutes: item.durationMinutes ?? null })));
    if (snapshot.payments.length) await tx.insert(payments).values(snapshot.payments.map(item => ({ ...item, id: item.id, amount: String(item.amount), membershipId: item.membershipId ?? null, paidAt: toDate(item.paidAt) })));
    if (snapshot.auditLogs.length) await tx.insert(auditLogs).values(snapshot.auditLogs.map(item => ({ ...item, createdAt: toDate(item.createdAt) })));
  });
}

export function persistGymStoreToDatabase() {
  const operation = writeQueue.then(replaceDatabaseSnapshot);
  writeQueue = operation.then(() => undefined, () => undefined);
  return operation;
}

export async function initializeGymStoreFromDatabase() {
  const db = await getDb();
  if (!db) return false;

  const [dbUsers, dbMembers, dbPlans, dbMemberships, dbTrainers, dbSchedules, dbCheckins, dbPayments, dbAuditLogs] = await Promise.all([
    db.select().from(users),
    db.select().from(members),
    db.select().from(plans),
    db.select().from(memberships),
    db.select().from(trainers),
    db.select().from(schedules),
    db.select().from(checkins),
    db.select().from(payments),
    db.select().from(auditLogs),
  ]);

  const isEmpty = [dbUsers, dbMembers, dbPlans, dbMemberships, dbTrainers, dbSchedules, dbCheckins, dbPayments, dbAuditLogs].every(rows => rows.length === 0);
  if (isEmpty) {
    await persistGymStoreToDatabase();
    console.log("[Database] Imported the local GymFlow data into MariaDB");
    return true;
  }

  gymStore.users = dbUsers.filter(user => ["admin", "member", "trainer"].includes(user.role) && user.password).map(user => ({
    id: user.id,
    name: user.name || "",
    email: user.email || user.openId,
    password: user.password || "",
    role: user.role as Role,
    memberId: user.memberId ?? undefined,
    avatar: user.avatar || "",
    lastSignedIn: toIso(user.lastSignedIn),
  }));
  gymStore.members = dbMembers.map(member => ({ ...member, birthDate: toDateOnly(member.birthDate), joinedAt: toDateOnly(member.joinedAt) }));
  gymStore.plans = dbPlans.map(plan => ({ ...plan, price: Number(plan.price), popular: Boolean(plan.popular) }));
  gymStore.memberships = dbMemberships.map(item => ({ ...item, startDate: toDateOnly(item.startDate), endDate: toDateOnly(item.endDate), amount: Number(item.amount) }));
  gymStore.trainers = dbTrainers;
  gymStore.schedules = dbSchedules.map(item => ({ ...item, startAt: toIso(item.startAt)!, endAt: toIso(item.endAt)!, note: item.note || "" }));
  gymStore.checkins = dbCheckins.map(item => ({ ...item, checkInAt: toIso(item.checkInAt)!, checkOutAt: toIso(item.checkOutAt), durationMinutes: item.durationMinutes ?? undefined }));
  gymStore.payments = dbPayments.map(item => ({ ...item, amount: Number(item.amount), paidAt: toIso(item.paidAt)! , membershipId: item.membershipId ?? undefined }));
  gymStore.auditLogs = dbAuditLogs.map(item => ({ ...item, resourceId: item.resourceId ?? undefined, createdAt: toIso(item.createdAt)! }));

  const nextId = (rows: { id: number }[]) => Math.max(0, ...rows.map(item => item.id)) + 1;
  gymStore.nextIds = {
    users: nextId(gymStore.users),
    members: nextId(gymStore.members),
    plans: nextId(gymStore.plans),
    memberships: nextId(gymStore.memberships),
    trainers: nextId(gymStore.trainers),
    schedules: nextId(gymStore.schedules),
    checkins: nextId(gymStore.checkins),
    payments: nextId(gymStore.payments),
  };
  console.log("[Database] Loaded GymFlow data from MariaDB");
  return true;
}
