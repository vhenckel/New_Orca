import { describe, it, expect } from "vitest";
import { hasPermission, hasModule, hasSubModule } from "./permissions";
import type { MeProfile } from "./types";

const profileWithModules: MeProfile = {
  id: "1",
  name: "Test",
  mask: "mask",
  isActive: true,
  isSystem: false,
  updatedByUserId: "",
  createdByUserId: "",
  createdAt: "",
  updatedAt: "",
  roleId: "",
  companyRoleId: "",
  companyUserId: "",
  profileId: "",
  businessAreaId: "",
  modules: [
    {
      name: "modA",
      label: "Mod A",
      enabled: true,
      subModules: [
        {
          name: "sub1",
          label: "Sub1",
          permissions: [
            { name: "read", label: "Read", enabled: true },
            { name: "write", label: "Write", enabled: false },
          ],
        },
      ],
    },
    {
      name: "modB",
      label: "Mod B",
      enabled: true,
      subModules: [
        {
          name: "sub2",
          label: "Sub2",
          permissions: [{ name: "admin", label: "Admin", enabled: true }],
        },
      ],
    },
  ],
};

describe("hasPermission", () => {
  it("returns false when profile is null or undefined", () => {
    expect(hasPermission(null, ["read"])).toBe(false);
    expect(hasPermission(undefined, ["read"])).toBe(false);
  });

  it("returns false when profile has no modules", () => {
    expect(hasPermission({ ...profileWithModules, modules: [] }, ["read"])).toBe(false);
  });

  it("returns true when any module has the permission enabled", () => {
    expect(hasPermission(profileWithModules, ["read"])).toBe(true);
    expect(hasPermission(profileWithModules, ["admin"])).toBe(true);
  });

  it("returns false when permission is disabled", () => {
    expect(hasPermission(profileWithModules, ["write"])).toBe(false);
  });

  it("returns true when scoped to module and subModule with that permission", () => {
    expect(hasPermission(profileWithModules, ["read"], "modA", "sub1")).toBe(true);
    expect(hasPermission(profileWithModules, ["admin"], "modB", "sub2")).toBe(true);
  });

  it("returns false when scoped to wrong module/subModule", () => {
    expect(hasPermission(profileWithModules, ["admin"], "modA", "sub1")).toBe(false);
    expect(hasPermission(profileWithModules, ["read"], "modB", "sub2")).toBe(false);
  });
});

describe("hasModule", () => {
  it("returns false when profile is null or has no modules", () => {
    expect(hasModule(null, "modA")).toBe(false);
    expect(hasModule({ ...profileWithModules, modules: [] }, "modA")).toBe(false);
  });

  it("returns true when module name exists", () => {
    expect(hasModule(profileWithModules, "modA")).toBe(true);
    expect(hasModule(profileWithModules, "modB")).toBe(true);
  });

  it("returns false when module name does not exist", () => {
    expect(hasModule(profileWithModules, "modC")).toBe(false);
  });
});

describe("hasSubModule", () => {
  it("returns false when profile is null or has no modules", () => {
    expect(hasSubModule(null, "modA", "sub1")).toBe(false);
  });

  it("returns true when module and subModule exist", () => {
    expect(hasSubModule(profileWithModules, "modA", "sub1")).toBe(true);
    expect(hasSubModule(profileWithModules, "modB", "sub2")).toBe(true);
  });

  it("returns false when subModule or module does not exist", () => {
    expect(hasSubModule(profileWithModules, "modA", "sub2")).toBe(false);
    expect(hasSubModule(profileWithModules, "modC", "sub1")).toBe(false);
  });
});
