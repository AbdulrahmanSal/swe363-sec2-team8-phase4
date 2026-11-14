import { describe, it, expect } from "vitest";
import {
  validateVendor,
  blankVendor,
  validateOfficial,
  validateEvent,
  future,
  localTime,
  toISO,
  offerState,
  publicationState,
  transitionAllowed,
  dashboardStats,
} from "../src/features/admin/rules";
import { seed } from "../src/demo/seed";
describe("Admin validation and derived states", () => {
  const valid = () => ({
    ...blankVendor(),
    representative: "Test Rep",
    loginEmail: "new@demo.test",
    password: "Demo1234",
    name: "New Business",
    categoryId: "c1",
    description: "A student service.",
    location: "Unit 12",
  });
  it("validates vendor required fields", () => {
    expect(Object.keys(validateVendor(blankVendor())).length).toBeGreaterThan(
      4,
    );
  });
  it("accepts a valid new account", () => {
    expect(validateVendor(valid())).toEqual({});
  });
  it("rejects duplicate email ignoring case", () => {
    expect(
      validateVendor(
        { ...valid(), loginEmail: "ADMIN@DEMO.TEST" },
        seed().users,
      ).loginEmail,
    ).toBeTruthy();
  });
  it("does not require a new password when editing", () => {
    expect(
      validateVendor({ ...valid(), password: "" }, [], "old-id").password,
    ).toBeUndefined();
  });
  it.each(["abc", "abcdefgh", "12345678"])(
    "rejects a weak password: %s",
    (password) => {
      expect(validateVendor({ ...valid(), password }).password).toBeTruthy();
    },
  );
  it("checks opening and closing times", () => {
    const v = valid();
    v.weeklyHours[0].close = "07:00";
    expect(validateVendor(v).hours0).toBeTruthy();
    v.weeklyHours[0].closed = true;
    expect(validateVendor(v).hours0).toBeUndefined();
  });
  it("rejects invalid phone and contact email", () => {
    const e = validateVendor({ ...valid(), phone: "wrong", email: "bad" });
    expect(e.phone).toBeTruthy();
    expect(e.email).toBeTruthy();
  });
  it("preserves Riyadh datetime-local meaning across host timezones", () => {
    expect(toISO("2026-11-20T15:00")).toBe("2026-11-20T12:00:00.000Z");
    expect(localTime("2026-11-20T12:00:00.000Z")).toBe("2026-11-20T15:00");
  });
  it("checks match publication before kick-off", () => {
    expect(
      validateOfficial(
        {
          teamA: "A",
          teamB: "B",
          location: "Mall",
          matchAt: "2026-11-20T15:00",
          publishAt: "2026-11-20T16:00",
        },
        "matches",
      ).publishAt,
    ).toBeTruthy();
  });
  it("requires announcement title, message, and time", () => {
    expect(Object.keys(validateOfficial({}, "announcements"))).toHaveLength(3);
  });
  it("derives scheduled and published announcement state", () => {
    expect(publicationState({ publishAt: future(2) })).toBe("scheduled");
    expect(publicationState({ publishAt: future(-2) })).toBe("published");
    expect(publicationState({ removed: true })).toBe("removed");
  });
  it("derives all offer states at exact boundaries", () => {
    const base = {
      startAt: "2026-11-20T12:00:00Z",
      endAt: "2026-11-21T12:00:00Z",
    };
    expect(offerState(base, Date.parse("2026-11-19T12:00:00Z"))).toBe(
      "scheduled",
    );
    expect(offerState(base, Date.parse(base.startAt))).toBe("active");
    expect(offerState(base, Date.parse(base.endAt))).toBe("expired");
    expect(offerState({ ...base, removed: true })).toBe("removed");
  });
  it("prevents approval of already-started events", () => {
    const e = {
      title: "Event",
      description: "Description",
      location: "Mall",
      startAt: localTime(future(-1)),
      endAt: localTime(future(1)),
    };
    expect(validateEvent(e, true).startAt).toBeTruthy();
    expect(validateEvent(e, false).startAt).toBeUndefined();
  });
  it("rejects end-before-start and blank event fields", () => {
    const e = validateEvent({
      title: "",
      description: "",
      location: "",
      startAt: localTime(future(3)),
      endAt: localTime(future(2)),
    });
    expect(e.endAt).toBeTruthy();
    expect(e.title).toBeTruthy();
  });
  it("locks archived vendors and rejects lifecycle skips", () => {
    expect(transitionAllowed("archived", "active")).toBe(false);
    expect(transitionAllowed("pending", "suspended")).toBe(false);
    expect(transitionAllowed("suspended", "active")).toBe(true);
  });
  it("derives dashboard totals from records", () => {
    const d = seed(),
      s = dashboardStats(d);
    expect(s.vendors.find((v) => v.status === "active").count).toBe(5);
    expect(s.pendingEvents).toBe(1);
    expect(s.requests.reduce((n, r) => n + r.count, 0)).toBe(d.requests.length);
  });
});
