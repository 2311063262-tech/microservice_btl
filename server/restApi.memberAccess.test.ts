import express from "express";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

type LoginPayload = { success: boolean; data: { token: string } };
type DataPayload<T> = { success: boolean; data: T };

let server: ReturnType<typeof app.listen>;
let baseUrl = "";
let memberToken = "";
let trainerToken = "";
let dataFile = "";
let GymStore: typeof import("./gymData").GymStore;
const originalDatabaseUrl = process.env.DATABASE_URL;

beforeAll(async () => {
  process.env.DATABASE_URL = "";
  dataFile = join(mkdtempSync(join(tmpdir(), "gymflow-persistence-test-")), "gymflow.json");
  process.env.GYMFLOW_DATA_FILE = dataFile;
  const [{ createGymApiRouter }, gymData] = await Promise.all([import("./restApi"), import("./gymData")]);
  GymStore = gymData.GymStore;
  const app = express();
  app.use(express.json());
  app.use("/api/v1", createGymApiRouter());
  server = app.listen(0);
  await new Promise<void>(resolve => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Could not start test server");
  baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "huy.pham@email.com", password: "demo123" }),
  });
  const payload = await response.json() as LoginPayload;
  memberToken = payload.data.token;
  const trainerResponse = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "trainer@gymflow.vn", password: "demo123" }),
  });
  trainerToken = (await trainerResponse.json() as LoginPayload).data.token;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  delete process.env.GYMFLOW_DATA_FILE;
  if (originalDatabaseUrl) process.env.DATABASE_URL = originalDatabaseUrl;
  else delete process.env.DATABASE_URL;
  rmSync(join(dataFile, ".."), { recursive: true, force: true });
});

async function memberGet<T>(path: string) {
  const response = await fetch(`${baseUrl}${path}`, { headers: { Authorization: `Bearer ${memberToken}` } });
  return { response, payload: await response.json() as DataPayload<T> };
}

describe("member API access", () => {
  it("keeps saved records after creating a new store instance", () => {
    const store = new GymStore(dataFile);
    store.plans.push({ id: 99, name: "Persistent Plan", description: "Saved plan", durationDays: 30, price: 123000, status: "active" });
    store.save();

    const restartedStore = new GymStore(dataFile);
    expect(restartedStore.plans.find(plan => plan.id === 99)?.name).toBe("Persistent Plan");
    expect(restartedStore.users.find(user => user.email === "huy.pham@email.com")?.memberId).toBe(1);
  });

  it("creates a member login linked to the new profile", async () => {
    const adminLogin = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@gymflow.vn", password: "demo123" }),
    });
    const adminPayload = await adminLogin.json() as LoginPayload;
    const createResponse = await fetch(`${baseUrl}/members`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminPayload.data.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Member", email: "new-member@gymflow.test", password: "member123", phone: "0901111222", gender: "Nam", birthDate: "1997-06-01", address: "Quận 1", emergencyContact: "Test Contact 0903333444" }),
    });
    const created = await createResponse.json() as DataPayload<{ id: number }>;
    expect(createResponse.status).toBe(201);

    const memberLogin = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "new-member@gymflow.test", password: "member123" }),
    });
    const memberPayload = await memberLogin.json() as LoginPayload;
    const ownProfile = await fetch(`${baseUrl}/members/me`, { headers: { Authorization: `Bearer ${memberPayload.data.token}` } });
    const profilePayload = await ownProfile.json() as DataPayload<{ id: number; email: string }>;
    const restartedStore = new GymStore(dataFile);

    expect(memberLogin.status).toBe(200);
    expect(profilePayload.data).toMatchObject({ id: created.data.id, email: "new-member@gymflow.test" });
    expect(restartedStore.members.some(member => member.id === created.data.id)).toBe(true);
    expect(restartedStore.users.some(user => user.email === "new-member@gymflow.test" && user.role === "member")).toBe(true);
  });

  it("returns only the signed-in member's records", async () => {
    const [members, memberships, checkins, schedules, payments] = await Promise.all([
      memberGet<{ id: number }[]>("/members"),
      memberGet<{ memberId: number }[]>("/memberships"),
      memberGet<{ memberId: number }[]>("/checkins"),
      memberGet<{ memberId: number }[]>("/schedules"),
      memberGet<{ memberId: number }[]>("/payments"),
    ]);

    expect(members.payload.data.map(item => item.id)).toEqual([1]);
    for (const result of [memberships, checkins, schedules, payments]) {
      expect(result.payload.data.every(item => item.memberId === 1)).toBe(true);
    }
  });

  it("lets a Member register a non-overlapping package only for their own account", async () => {
    const profile = await memberGet<{ membership?: { endDate: string } }>("/members/me");
    const nextStart = new Date(`${profile.payload.data.membership!.endDate}T00:00:00.000Z`);
    nextStart.setUTCDate(nextStart.getUTCDate() + 1);
    const startDate = nextStart.toISOString().slice(0, 10);
    const headers = { Authorization: `Bearer ${memberToken}`, "Content-Type": "application/json" };
    const response = await fetch(`${baseUrl}/memberships`, { method: "POST", headers, body: JSON.stringify({ memberId: 2, planId: 1, startDate, status: "cancelled" }) });
    const payload = await response.json() as DataPayload<{ memberId: number; status: string }>;
    const overlapResponse = await fetch(`${baseUrl}/memberships`, { method: "POST", headers, body: JSON.stringify({ planId: 1, startDate }) });

    expect(response.status).toBe(201);
    expect(payload.data).toMatchObject({ memberId: 1, status: "active" });
    expect(overlapResponse.status).toBe(409);
  });

  it("provides linked logins for the other seeded member profiles", async () => {
    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "linh.nguyen@email.com", password: "demo123" }),
    });
    const loginPayload = await loginResponse.json() as LoginPayload;
    const profileResponse = await fetch(`${baseUrl}/members/me`, { headers: { Authorization: `Bearer ${loginPayload.data.token}` } });
    const profilePayload = await profileResponse.json() as DataPayload<{ id: number; email: string }>;

    expect(loginResponse.status).toBe(200);
    expect(profilePayload.data).toMatchObject({ id: 2, email: "linh.nguyen@email.com" });
  });

  it("blocks access to another member profile and aggregate dashboard data", async () => {
    const [otherProfile, dashboard] = await Promise.all([
      memberGet<unknown>("/members/2"),
      memberGet<unknown>("/dashboard/summary"),
    ]);

    expect(otherProfile.response.status).toBe(403);
    expect(dashboard.response.status).toBe(403);
  });

  it("limits Trainers to assigned members and schedules", async () => {
    const headers = { Authorization: `Bearer ${trainerToken}` };
    const [schedulesResponse, membersResponse, membershipsResponse, dashboardResponse, checkinsResponse, paymentsResponse, otherMemberResponse, otherTrainerScheduleResponse] = await Promise.all([
      fetch(`${baseUrl}/schedules`, { headers }),
      fetch(`${baseUrl}/members`, { headers }),
      fetch(`${baseUrl}/memberships`, { headers }),
      fetch(`${baseUrl}/dashboard/summary`, { headers }),
      fetch(`${baseUrl}/checkins`, { headers }),
      fetch(`${baseUrl}/payments`, { headers }),
      fetch(`${baseUrl}/members/2`, { headers }),
      fetch(`${baseUrl}/schedules`, { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ title: "Other Trainer Session", memberId: 2, trainerId: 2, startAt: "2030-06-01T10:00:00.000Z", endAt: "2030-06-01T11:00:00.000Z", type: "PT", note: "" }) }),
    ]);
    const schedules = (await schedulesResponse.json() as DataPayload<{ trainerId: number; member?: { email?: string; emergencyContact?: string } }[]>).data;
    const assignedMembers = (await membersResponse.json() as DataPayload<{ id: number; email?: string; emergencyContact?: string }[]>).data;
    const assignedMemberships = (await membershipsResponse.json() as DataPayload<{ memberId: number }[]>).data;

    expect(schedules.length).toBeGreaterThan(0);
    expect(schedules.every(schedule => schedule.trainerId === 1)).toBe(true);
    expect(schedules.every(schedule => !schedule.member?.email && !schedule.member?.emergencyContact)).toBe(true);
    expect(assignedMembers.map(member => member.id).sort()).toEqual([1, 4]);
    expect(assignedMembers.every(member => !member.email && !member.emergencyContact)).toBe(true);
    expect(assignedMemberships.every(membership => [1, 4].includes(membership.memberId))).toBe(true);
    expect(dashboardResponse.status).toBe(403);
    expect(checkinsResponse.status).toBe(403);
    expect(paymentsResponse.status).toBe(403);
    expect(otherMemberResponse.status).toBe(403);
    expect(otherTrainerScheduleResponse.status).toBe(403);
  });
});
