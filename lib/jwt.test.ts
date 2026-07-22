import { describe, expect, it } from "vitest";
import { signJwt, verifyJwt } from "./jwt";

describe("JWT Utility", () => {
  it("should sign and verify a payload successfully", () => {
    const payload = { userId: 123, role: "admin" };
    const token = signJwt(payload, 3600);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    const decoded = verifyJwt(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(123);
    expect(decoded?.role).toBe("admin");
  });

  it("should return null for invalid token signature", () => {
    const token = signJwt({ userId: 123 }, 3600);
    const brokenToken = `${token}invalid`;
    const decoded = verifyJwt(brokenToken);
    expect(decoded).toBeNull();
  });

  it("should return null for expired token", () => {
    // Sign with negative expiration (expired in the past)
    const token = signJwt({ userId: 123 }, -100);
    const decoded = verifyJwt(token);
    expect(decoded).toBeNull();
  });
});
