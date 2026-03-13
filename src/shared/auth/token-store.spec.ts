import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getStoredToken,
  setStoredToken,
  clearStoredToken,
} from "./token-store";

describe("token-store", () => {
  beforeEach(() => {
    clearStoredToken();
    try {
      localStorage.removeItem("o2ospot_access_token");
    } catch {
      // ignore
    }
  });

  afterEach(() => {
    clearStoredToken();
  });

  it("returns null when no token set", () => {
    expect(getStoredToken()).toBe(null);
  });

  it("returns token after setStoredToken", () => {
    setStoredToken("abc123");
    expect(getStoredToken()).toBe("abc123");
  });

  it("clears token after clearStoredToken", () => {
    setStoredToken("abc123");
    clearStoredToken();
    expect(getStoredToken()).toBe(null);
  });

  it("persists to localStorage when available", () => {
    setStoredToken("persisted");
    expect(localStorage.getItem("o2ospot_access_token")).toBe("persisted");
    clearStoredToken();
    expect(localStorage.getItem("o2ospot_access_token")).toBe(null);
  });
});
