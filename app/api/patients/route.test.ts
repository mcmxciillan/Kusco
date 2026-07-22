import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "./route";

// Mock auth session
vi.mock("@/lib/auth", () => {
  return {
    getSessionClinician: vi.fn().mockResolvedValue({ id: 99, email: "doc@hospital.org" }),
  };
});

// Mock database
vi.mock("@/lib/db", () => {
  return {
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([{ id: 1, name: "Alice", clinicianId: 99 }]),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 2, name: "Bob", clinicianId: 99 }]),
        }),
      }),
    },
  };
});

describe("GET /api/patients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return the clinician's patients", async () => {
    const req = new Request("http://localhost:3000/api/patients") as unknown as NextRequest;
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toBeInstanceOf(Array);
    expect(body[0].name).toBe("Alice");
  });
});

describe("POST /api/patients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fail if patient name is missing", async () => {
    const req = new Request("http://localhost:3000/api/patients", {
      method: "POST",
      body: JSON.stringify({}),
    }) as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should create new patient successfully", async () => {
    const req = new Request("http://localhost:3000/api/patients", {
      method: "POST",
      body: JSON.stringify({ name: "Bob" }),
    }) as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe("Bob");
  });
});
