import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ existing: true, payload: undefined as any, owner: "owner-uuid" }));
vi.mock("./_core/env", () => ({ ENV: { supabaseUrl: "https://example.supabase.co", supabaseServerKey: "test", get ownerOpenId() { return mocks.owner; } } }));
vi.mock("./supabase", () => ({
  getSupabase: () => ({ from: () => ({
    select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: mocks.existing ? { id: 1 } : null, error: null }) }) }),
    update: (payload: any) => { mocks.payload = payload; return { eq: async () => ({ error: null }) }; },
    insert: async (payload: any) => { mocks.payload = payload; return { error: null }; },
  }) }),
  createAuthClient: vi.fn(),
}));
import { upsertUser } from "./db";
describe("session profile preservation", () => {
  beforeEach(() => { mocks.existing = true; mocks.payload = undefined; });
  it("does not erase a profile or demote an administrator on session refresh", async () => {
    await upsertUser({ openId: "existing-admin", lastSignedIn: new Date() });
    expect(mocks.payload).not.toHaveProperty("name");
    expect(mocks.payload).not.toHaveProperty("email");
    expect(mocks.payload).not.toHaveProperty("role");
  });
  it("grants the configured owner administration by immutable user id", async () => {
    await upsertUser({ openId: "owner-uuid" });
    expect(mocks.payload.role).toBe("admin");
  });
  it("creates ordinary accounts without administrative access", async () => {
    mocks.existing = false;
    await upsertUser({ openId: "new-user", name: "Pessoa" });
    expect(mocks.payload.role).toBe("user");
    expect(mocks.payload.name).toBe("Pessoa");
  });
});
