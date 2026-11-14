import { useState } from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { AdminModuleProvider } from "../src/features/admin/AdminBridge";
import { adminRoutes } from "../src/features/admin/AdminRoutes";
import { seed } from "../src/demo/seed";
import { future } from "../src/features/admin/rules";
import { DemoProvider, useDemo } from "../src/demo/DemoContext";
function Harness({
  Page,
  initial = seed(),
  role = "admin",
  navigate = vi.fn(),
}) {
  const [data, setData] = useState(initial);
  const actions = {
    add: async (c, item) => {
      setData((d) => ({ ...d, [c]: [...d[c], item] }));
      return { ok: true };
    },
    update: async (c, id, changes) => {
      setData((d) => ({
        ...d,
        [c]: d[c].map((x) => (x.id === id ? { ...x, ...changes } : x)),
      }));
      return { ok: true };
    },
    remove: async (c, id) => {
      setData((d) => ({ ...d, [c]: d[c].filter((x) => x.id !== id) }));
      return { ok: true };
    },
  };
  return (
    <AdminModuleProvider
      auth={{ user: { id: "a1", name: "Admin", role } }}
      data={{ ...data, ...actions }}
      navigate={navigate}
    >
      <Page />
      <output data-testid="snapshot" hidden>
        {JSON.stringify(data)}
      </output>
    </AdminModuleProvider>
  );
}
const page = (id) => adminRoutes.find((r) => r.screen === id).Component;
const state = () => JSON.parse(screen.getByTestId("snapshot").textContent);
describe("Owned admin screens", () => {
  it.each(adminRoutes)("renders $screen", (r) => {
    render(<Harness Page={r.Component} />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
  it("hides admin content from a visitor", () => {
    render(<Harness Page={page("S18")} role="visitor" />);
    expect(
      screen.getByRole("heading", { name: "Access restricted" }),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Create vendor" })).toBeNull();
  });
  it("combines vendor search and account state", () => {
    render(<Harness Page={page("S18")} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Search" }), {
      target: { value: "Campus" },
    });
    fireEvent.change(screen.getByLabelText("Account status"), {
      target: { value: "pending" },
    });
    expect(screen.getByText("No matching records")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByText("New Snack Corner")).toBeTruthy();
  });
  it("shows required vendor field errors and retains non-password input", async () => {
    render(<Harness Page={page("S18")} />);
    fireEvent.click(screen.getByRole("button", { name: "Create vendor" }));
    fireEvent.change(screen.getByLabelText(/Business name/), {
      target: { value: "Keep this name" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Create pending account" }),
    );
    await screen.findByRole("alert");
    expect(screen.getByLabelText(/Business name/).value).toBe("Keep this name");
    expect(
      screen.getByLabelText(/Representative name/).getAttribute("aria-invalid"),
    ).toBe("true");
  });
  it("creates one pending vendor plus one linked representative", async () => {
    render(<Harness Page={page("S18")} />);
    fireEvent.click(screen.getByRole("button", { name: "Create vendor" }));
    for (const [name, value] of [
      ["Representative name", "Demo Rep"],
      ["Login email", "created@demo.test"],
      ["Initial demo password", "Demo1234"],
      ["Business name", "Created Business"],
      ["Written location", "Unit 30"],
      ["Description", "A newly created demo business."],
    ])
      fireEvent.change(screen.getByLabelText(new RegExp(name)), {
        target: { value },
      });
    const submit = screen.getByRole("button", {
      name: "Create pending account",
    });
    fireEvent.click(submit);
    fireEvent.click(submit);
    await waitFor(() =>
      expect(
        state().vendors.filter((v) => v.name === "Created Business"),
      ).toHaveLength(1),
    );
    const vendor = state().vendors.find((v) => v.name === "Created Business");
    expect(vendor.accountStatus).toBe("pending");
    expect(state().users.filter((u) => u.vendorId === vendor.id)).toHaveLength(
      1,
    );
  });
  it("archives only after confirmation and preserves requests", async () => {
    render(<Harness Page={page("S18")} />);
    const row = screen.getByText("Campus Bites").closest("tr");
    fireEvent.click(within(row).getByRole("button", { name: "Archive" }));
    expect(state().vendors.find((v) => v.id === "v1").accountStatus).toBe(
      "active",
    );
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Archive",
        exact: true,
      }),
    );
    await waitFor(() =>
      expect(state().vendors.find((v) => v.id === "v1").accountStatus).toBe(
        "archived",
      ),
    );
    expect(state().requests).toHaveLength(19);
  });
  it("rejects a match whose publication is after kick-off", async () => {
    render(<Harness Page={page("S20")} />);
    fireEvent.click(screen.getByRole("button", { name: /Match screenings/ }));
    fireEvent.click(screen.getByRole("button", { name: "New match" }));
    for (const [name, value] of [
      ["First team", "A"],
      ["Second team", "B"],
      ["Screening location", "Atrium"],
      ["Match date and time (Riyadh)", "2026-12-10T18:00"],
      ["Publication date and time (Riyadh)", "2026-12-10T19:00"],
    ])
      fireEvent.change(
        screen.getByLabelText(new RegExp(name.replace(/[()]/g, "\\$&"))),
        { target: { value } },
      );
    fireEvent.click(screen.getByRole("button", { name: "Save content" }));
    await screen.findByText("Publication cannot be after kick-off.", {
      selector: ".mh-field-error",
    });
    expect(state().matches).toHaveLength(1);
  });
  it("grants and revokes club permission without changing event snapshots", async () => {
    render(<Harness Page={page("S21")} />);
    fireEvent.click(screen.getByRole("button", { name: "Grant permission" }));
    fireEvent.change(screen.getByLabelText(/Assigned club/), {
      target: { value: "Design Club" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save permission" }));
    await waitFor(() =>
      expect(state().users.find((u) => u.id === "u1").club).toBe("Design Club"),
    );
    const row = screen.getByText("Ahmed Al Omar").closest("tr");
    fireEvent.click(within(row).getByRole("button", { name: "Revoke" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Revoke permission", exact: true }),
    );
    await waitFor(() =>
      expect(state().users.find((u) => u.id === "u1").club).toBe(""),
    );
    expect(state().events[0].club).toBe("Computing Club");
    expect(state().events).toHaveLength(3);
  });
  it("saves event edits without approval", async () => {
    render(<Harness Page={page("S22")} />);
    const row = screen.getByText("Project showcase").closest("tr");
    fireEvent.click(within(row).getByRole("button", { name: "Review / Edit" }));
    fireEvent.change(screen.getByLabelText(/Event title/), {
      target: { value: "Revised showcase" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save edits" }));
    await waitFor(() =>
      expect(state().events.find((e) => e.id === "e2").title).toBe(
        "Revised showcase",
      ),
    );
    expect(state().events.find((e) => e.id === "e2").status).toBe("pending");
  });
  it("blocks approval for an already-started event", async () => {
    const initial = seed();
    initial.events[1].startAt = future(-1);
    render(<Harness Page={page("S22")} initial={initial} />);
    const row = screen.getByText("Project showcase").closest("tr");
    fireEvent.click(within(row).getByRole("button", { name: "Review / Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Approve event" }));
    await screen.findByText("Events that have started cannot be approved.", {
      selector: ".mh-field-error",
    });
    expect(state().events[1].status).toBe("pending");
  });
  it("records an offer removal reason while preserving the content", async () => {
    render(<Harness Page={page("S23")} />);
    const row = screen.getByText("Sandwich and drink offer").closest("tr");
    fireEvent.click(
      within(row).getByRole("button", { name: "Review / Remove" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Remove offer", exact: true }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Remove offer", exact: true }),
    );
    await screen.findByRole("alert");
    fireEvent.change(screen.getByLabelText(/Reason/), {
      target: { value: "Promotion information is incomplete." },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Remove offer", exact: true }),
    );
    await waitFor(() => expect(state().offers[0].removed).toBe(true));
    expect(state().offers[0].removedReason).toBe(
      "Promotion information is incomplete.",
    );
    expect(state().offers[0].title).toBe("Sandwich and drink offer");
  });
  it("keeps typing focus and closes a modal with Escape", async () => {
    const user = userEvent.setup();
    render(<Harness Page={page("S18")} />);
    await user.click(screen.getByRole("button", { name: "Create vendor" }));
    const field = screen.getByLabelText(/Business name/);
    await user.click(field);
    await user.type(field, "Continuous typing");
    expect(field.value).toBe("Continuous typing");
    expect(document.activeElement).toBe(field);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("traps keyboard focus in the dialog", async () => {
    const user = userEvent.setup();
    render(<Harness Page={page("S18")} />);
    await user.click(screen.getByRole("button", { name: "Create vendor" }));
    const dialog = screen.getByRole("dialog"),
      last = within(dialog).getByRole("button", {
        name: "Create pending account",
      });
    last.focus();
    await user.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).toBe(
      within(dialog).getByRole("button", { name: "Close dialog" }),
    );
  });
});
function Probe() {
  const { data, switchAccount, sessionError } = useDemo();
  return (
    <>
      <button
        onClick={() => data.update("vendors", "v1", { name: "Saved name" })}
      >
        Save
      </button>
      <button onClick={() => switchAccount("user-v7")}>Blocked vendor</button>
      <output data-testid="stored">{data.vendors[0].name}</output>
      <p>{sessionError}</p>
    </>
  );
}
describe("Isolated preview context", () => {
  it("persists changes across remounts", async () => {
    const view = render(
      <DemoProvider>
        <Probe />
      </DemoProvider>,
    );
    fireEvent.click(screen.getByText("Save"));
    await waitFor(() =>
      expect(screen.getByTestId("stored").textContent).toBe("Saved name"),
    );
    view.unmount();
    render(
      <DemoProvider>
        <Probe />
      </DemoProvider>,
    );
    expect(screen.getByTestId("stored").textContent).toBe("Saved name");
  });
  it("blocks suspended vendor demo login", async () => {
    render(
      <DemoProvider>
        <Probe />
      </DemoProvider>,
    );
    fireEvent.click(screen.getByText("Blocked vendor"));
    expect(
      screen.getByText("Unable to sign in with these credentials."),
    ).toBeTruthy();
  });
});
