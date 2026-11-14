export const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export const norm = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();
export const label = (value) =>
  String(value ?? "").replace(/(^|\s)\w/g, (c) => c.toUpperCase());
export const future = (days = 1, hour = 12) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(hour - 3, 0, 0, 0);
  return d.toISOString();
};
export const uid = (prefix) =>
  `${prefix}-${globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2, 8)}`;
export function fmt(value) {
  if (!value) return "Not set";
  const d = new Date(value);
  return Number.isFinite(+d)
    ? new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Riyadh",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(d)
    : "Invalid date";
}
export function localTime(value) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isFinite(+d)
    ? new Date(+d + 10800000).toISOString().slice(0, 16)
    : "";
}
export function toISO(value) {
  if (!value) return "";
  const d = new Date(value.length === 16 ? value + ":00+03:00" : value);
  return Number.isFinite(+d) ? d.toISOString() : "";
}
export function offerState(o, at = Date.now()) {
  return o.removed
    ? "removed"
    : new Date(o.startAt) > at
      ? "scheduled"
      : new Date(o.endAt) <= at
        ? "expired"
        : "active";
}
export function publicationState(o, at = Date.now()) {
  return o.removed
    ? "removed"
    : new Date(o.publishAt) > at
      ? "scheduled"
      : "published";
}
export const eventState = (e) =>
  norm(e.status) === "pending review" ? "pending" : norm(e.status);
export const passwordOK = (p) =>
  p.length >= 8 && /[a-z]/i.test(p) && /\d/.test(p);
export const emailOK = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
export const hoursDefault = () =>
  DAYS.map((day) => ({ day, open: "09:00", close: "21:00", closed: false }));
export const blankVendor = () => ({
  representative: "",
  loginEmail: "",
  password: "",
  name: "",
  type: "restaurant",
  categoryId: "",
  description: "",
  location: "",
  email: "",
  phone: "",
  weeklyHours: hoursDefault(),
});
export function validateVendor(v, users = [], editingId = null) {
  const e = {};
  for (const [k, l] of [
    ["representative", "Representative name"],
    ["name", "Business name"],
    ["description", "Description"],
    ["location", "Location"],
    ["categoryId", "Category"],
  ])
    if (!String(v[k] || "").trim()) e[k] = `${l} is required.`;
  if (!emailOK(v.loginEmail)) e.loginEmail = "Enter a valid login email.";
  if (
    users.some(
      (u) => u.id !== editingId && norm(u.email) === norm(v.loginEmail),
    )
  )
    e.loginEmail = "This email is already registered.";
  if (!editingId && !passwordOK(v.password))
    e.password = "Use at least 8 characters, including a letter and a number.";
  if (v.email && !emailOK(v.email))
    e.email = "Enter a valid public contact email.";
  if (v.phone && !/^[+\d ()-]{7,20}$/.test(v.phone))
    e.phone = "Enter a valid phone number.";
  if (!["restaurant", "barber", "laundry", "store"].includes(v.type))
    e.type = "Choose a supported business type.";
  if (v.weeklyHours.length !== 7) e.hours = "All seven days are required.";
  v.weeklyHours.forEach((h, i) => {
    if (
      !h.closed &&
      (!/^\d{2}:\d{2}$/.test(h.open) ||
        !/^\d{2}:\d{2}$/.test(h.close) ||
        h.close <= h.open)
    )
      e[`hours${i}`] = `${h.day}: closing time must be after opening time.`;
  });
  return e;
}
export function validateOfficial(v, kind) {
  const e = {};
  const keys =
    kind === "announcements"
      ? ["title", "message"]
      : ["teamA", "teamB", "location"];
  keys.forEach((k) => {
    if (!String(v[k] || "").trim())
      e[k] = `${label(k.replace(/([A-Z])/g, " $1"))} is required.`;
  });
  if (!toISO(v.publishAt))
    e.publishAt = "A valid publication time is required.";
  if (kind === "matches") {
    if (!toISO(v.matchAt)) e.matchAt = "A valid match time is required.";
    if (
      toISO(v.publishAt) &&
      toISO(v.matchAt) &&
      new Date(toISO(v.publishAt)) > new Date(toISO(v.matchAt))
    )
      e.publishAt = "Publication cannot be after kick-off.";
  }
  return e;
}
export function validateEvent(v, approve = false, at = Date.now()) {
  const e = {};
  ["title", "description", "location"].forEach((k) => {
    if (!String(v[k] || "").trim()) e[k] = `${label(k)} is required.`;
  });
  if (!toISO(v.startAt)) e.startAt = "Enter a valid start time.";
  if (!toISO(v.endAt) || new Date(toISO(v.endAt)) <= new Date(toISO(v.startAt)))
    e.endAt = "End time must be after the start.";
  if (approve && new Date(toISO(v.startAt)) <= at)
    e.startAt = "Events that have started cannot be approved.";
  return e;
}
export function dashboardStats(data) {
  return {
    vendors: ["pending", "active", "suspended", "archived"].map((status) => ({
      status,
      count: data.vendors.filter((v) => norm(v.accountStatus) === status)
        .length,
    })),
    pendingEvents: data.events.filter((e) => eventState(e) === "pending")
      .length,
    requests: ["restaurant", "barber", "laundry"].map((type) => ({
      type,
      count: data.requests.filter((r) => r.type === type).length,
      statuses: Object.entries(
        data.requests
          .filter((r) => r.type === type)
          .reduce((a, r) => ((a[r.status] = (a[r.status] || 0) + 1), a), {}),
      ),
    })),
  };
}
export function transitionAllowed(current, next) {
  return (
    {
      pending: ["active", "archived"],
      active: ["suspended", "archived"],
      suspended: ["active", "archived"],
      archived: [],
    }[norm(current)]?.includes(next) || false
  );
}
