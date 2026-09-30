import "dotenv/config";
import { describe, expect, it } from "vitest";
import { getDb } from "./db";
import { auditLogs, checkins, members, memberships, payments, plans, schedules, trainers, users } from "../drizzle/schema";
import { initializeGymStoreFromDatabase, persistGymStoreToDatabase } from "./gymSqlPersistence";

const integrationEnabled = process.env.RUN_MARIADB_INTEGRATION === "1";

(integrationEnabled ? describe : describe.skip)("MariaDB persistence integration", () => {
  it("loads and writes the existing GymFlow snapshot without changing row counts", async () => {
    const db = await getDb();
    expect(db).toBeTruthy();

    await initializeGymStoreFromDatabase();
    const tables = [users, members, plans, memberships, trainers, schedules, checkins, payments, auditLogs] as const;
    const readCounts = async () => Promise.all(tables.map(async table => (await db!.select().from(table)).length));
    const before = await readCounts();

    await persistGymStoreToDatabase();

    expect(await readCounts()).toEqual(before);
  });
});
