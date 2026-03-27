import { describe, expect, it } from "vitest";

import {
  formatContactDetailConversationDate,
  formatContactListDate,
} from "./format-contact-list-date";

describe("formatContactListDate", () => {
  it("returns dash for null, empty, or placeholder", () => {
    expect(formatContactListDate(null, "pt-BR")).toBe("-");
    expect(formatContactListDate(undefined, "pt-BR")).toBe("-");
    expect(formatContactListDate("", "pt-BR")).toBe("-");
    expect(formatContactListDate("-", "en-US")).toBe("-");
  });

  it("returns dash for invalid date string", () => {
    expect(formatContactListDate("not-a-date", "pt-BR")).toBe("-");
  });

  it("formats pt-BR with weekday (short) and month without trailing dot on abbrev", () => {
    const s = formatContactListDate("2026-06-15T12:00:00.000Z", "pt-BR");
    expect(s).toMatch(/segunda|terça|quarta|quinta|sexta|sábado|domingo/);
    expect(s).toContain("2026");
    expect(s).toContain("jun");
    expect(s).not.toMatch(/jun\.\s/);
  });

  it("formats en-US with weekday and month", () => {
    const s = formatContactListDate("2026-06-15T12:00:00.000Z", "en-US");
    expect(s).toMatch(/Mon|Tue|Wed|Thu|Fri|Sat|Sun/);
    expect(s).toContain("2026");
    expect(s).toMatch(/Jun/i);
  });
});

describe("formatContactDetailConversationDate", () => {
  it("returns dash for empty or invalid", () => {
    expect(formatContactDetailConversationDate(null, "pt-BR")).toBe("-");
    expect(formatContactDetailConversationDate("bad", "pt-BR")).toBe("-");
  });

  it("formats pt-BR with weekday, long date and 24h time", () => {
    const s = formatContactDetailConversationDate("2026-03-04T13:30:00.000Z", "pt-BR");
    expect(s).toMatch(
      /^(segunda|terça|quarta|quinta|sexta|sábado|domingo), \d{2} de \p{L}+ \d{4} - \d{2}:\d{2}$/u,
    );
    expect(s).toContain("2026");
    expect(s).toContain(" - ");
  });

  it("formats en-US with long weekday, date and 24h time", () => {
    const s = formatContactDetailConversationDate("2026-03-04T13:30:00.000Z", "en-US");
    expect(s).toMatch(/^[A-Za-z]+, \d{2} [A-Za-z]+ \d{4} - \d{2}:\d{2}$/);
    expect(s).toContain("2026");
  });
});
