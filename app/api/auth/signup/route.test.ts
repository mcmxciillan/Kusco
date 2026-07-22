import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

// Mock bcryptjs
vi.mock("bcryptjs", () => {
  return {
    default: {
      hash: vi.fn().mockResolvedValue("hashed_password"),
    },
  };
});

// Mock database
vi.mock("@/lib/db", () => {
  return {
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]), // No existing clinician
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 100, email: "new@hospital.org" }]),
        }),
      }),
    },
  };
});

// Mock Stripe
vi.mock("stripe", () => {
  class StripeMock {
    customers = {
      create: vi.fn().mockResolvedValue({ id: "cust_123" }),
    };
  }
  return {
    default: StripeMock,
  };
});

// Mock JWT signing
vi.mock("@/lib/jwt", () => {
  return {
    signJwt: vi.fn().mockReturnValue("mocked_jwt_token"),
  };
});

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 if credentials are empty", async () => {
    const req = new Request("http://localhost:3000/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({}),
    }) as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should successfully register clinician and create stripe customer", async () => {
    const req = new Request("http://localhost:3000/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email: "new@hospital.org", password: "password123" }),
    }) as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
