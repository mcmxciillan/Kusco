import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

// Mock bcryptjs
vi.mock("bcryptjs", () => {
  return {
    default: {
      compare: vi.fn().mockResolvedValue(true),
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
            limit: vi
              .fn()
              .mockResolvedValue([
                { id: 99, email: "doc@hospital.org", password: "hashed_password" },
              ]),
          }),
        }),
      }),
    },
  };
});

// Mock JWT signing
vi.mock("@/lib/jwt", () => {
  return {
    signJwt: vi.fn().mockReturnValue("mocked_jwt_token"),
  };
});

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 if credentials are empty", async () => {
    const req = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({}),
    }) as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should successfully log in and set cookie", async () => {
    const req = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "doc@hospital.org", password: "password123" }),
    }) as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
