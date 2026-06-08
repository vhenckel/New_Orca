import { describe, expect, it } from "vitest";

import {
  localDateInputToIso,
  parseLocalDateInput,
  startOfTomorrowLocal,
} from "@/modules/supplier/quotation/lib/local-date-input";

describe("local-date-input", () => {
  it("parses YYYY-MM-DD as local midnight", () => {
    const date = parseLocalDateInput("2026-06-10");
    expect(date).not.toBeNull();
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(5);
    expect(date?.getDate()).toBe(10);
    expect(date?.getHours()).toBe(0);
  });

  it("rejects invalid date input", () => {
    expect(parseLocalDateInput("2026-02-30")).toBeNull();
    expect(parseLocalDateInput("invalid")).toBeNull();
  });

  it("serializes local date input without shifting the calendar day", () => {
    const iso = localDateInputToIso("2026-06-10");
    expect(iso).not.toBeNull();
    const parsed = new Date(iso!);
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(5);
    expect(parsed.getDate()).toBe(10);
  });

  it("treats tomorrow as valid relative to startOfTomorrowLocal", () => {
    const tomorrow = startOfTomorrowLocal();
    const value = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
    const parsed = parseLocalDateInput(value);
    expect(parsed).not.toBeNull();
    expect(parsed! >= tomorrow).toBe(true);
  });
});
