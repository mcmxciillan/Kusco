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
          where: vi.fn().mockImplementation((_condition) => {
            // Mock returning a patient if query contains clinician check, or list of goals
            return {
              orderBy: vi.fn().mockResolvedValue([{ id: 1, description: "Do meditation" }]),
              limit: vi.fn().mockResolvedValue([{ id: 1, name: "Alice", clinicianId: 99 }]),
            };
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 2, description: "Sleep 8 hours" }]),
        }),
      }),
    },
  };
});

describe("GET /api/patients/:id/goals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return the patient's goals", async () => {
    const req = new Request("http://localhost:3000/api/patients/1/goals") as unknown as NextRequest;
    const res = await GET(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body[0].description).toBe("Do meditation");
  });
});

describe("POST /api/patients/:id/goals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create goal successfully", async () => {
    const req = new Request("http://localhost:3000/api/patients/1/goals", {
      method: "POST",
      body: JSON.stringify({ description: "Sleep 8 hours" }),
    }) as unknown as NextRequest;
    const res = await POST(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.description).toBe("Sleep 8 hours");
  });
});
