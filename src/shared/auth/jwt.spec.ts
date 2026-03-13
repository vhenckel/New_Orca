import { describe, it, expect } from "vitest";
import { decodeTokenPayload, getCompanyIdFromToken } from "./jwt";

// Minimal JWT: header.payload.signature (payload base64 of {"cmpid":316,"sub":"user1"})
const payloadObj = { cmpid: 316, sub: "user1", exp: 9999999999 };
const payloadB64 = btoa(JSON.stringify(payloadObj));
const fakeToken = `eyJhbGciOiJIUzI1NiJ9.${payloadB64}.sig`;

describe("decodeTokenPayload", () => {
  it("returns null for invalid token", () => {
    expect(decodeTokenPayload("")).toBe(null);
    expect(decodeTokenPayload("abc")).toBe(null);
    expect(decodeTokenPayload("a.b")).toBe(null);
  });

  it("returns payload object for valid-looking token", () => {
    const decoded = decodeTokenPayload(fakeToken);
    expect(decoded).not.toBe(null);
    expect(decoded?.cmpid).toBe(316);
    expect(decoded?.sub).toBe("user1");
  });
});

describe("getCompanyIdFromToken", () => {
  it("returns null for invalid or missing token", () => {
    expect(getCompanyIdFromToken("")).toBe(null);
    expect(getCompanyIdFromToken("a.b.c")).toBe(null);
  });

  it("returns companyId from payload", () => {
    expect(getCompanyIdFromToken(fakeToken)).toBe(316);
  });

  it("returns null when cmpid is missing in payload", () => {
    const noCmpId = btoa(JSON.stringify({ sub: "u" }));
    expect(getCompanyIdFromToken(`e.${noCmpId}.s`)).toBe(null);
  });
});
