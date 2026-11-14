import { useState } from "react";
import { useAdmin, AdminGuard } from "../../features/admin/AdminBridge";
import {
  PageHeader,
  Icon,
  Badge,
  Search,
  Table,
  Modal,
  Field,
  ErrorSummary,
  ConfirmDialog,
  Notice,
  useSaving,
} from "../../features/admin/components";
import {
  blankVendor,
  validateVendor,
  norm,
  label,
  uid,
  hoursDefault,
  transitionAllowed,
} from "../../features/admin/rules";

function VendorEditor({ vendor, account, onClose }) {
  const a = useAdmin(),
    editing = !!vendor,
    [v, set] = useState(() =>
      vendor
        ? {
            representative: account?.name || "",
            loginEmail: account?.email || "",
            password: "",
            name: vendor.name,
            type: vendor.type,
            categoryId: vendor.categoryId,
            description: vendor.description || "",
            location: vendor.location || "",
            email: vendor.email || "",
            phone: vendor.phone || "",
            weeklyHours:
              vendor.weeklyHours?.length === 7
                ? vendor.weeklyHours.map((h) => ({ ...h }))
                : hoursDefault(),
          }
        : { ...blankVendor(), categoryId: a.categories[0]?.id || "" },
    ),
    [errors, setErrors] = useState({}),
    { busy, run } = useSaving();
  const change = (k, value) => set((x) => ({ ...x, [k]: value }));
  async function save() {
    const current = a.vendors.find((x) => x.id === vendor?.id),
      linked = a.users.find((x) => x.id === account?.id);
    if (editing && (!current || !linked))
      throw new Error("The vendor account is no longer available.");
    const issues = validateVendor(v, a.users, editing ? account.id : null);
    if (!a.categories.some((c) => c.id === v.categoryId))
      issues.categoryId = "Choose an existing category.";
    if (Object.keys(issues).length) {
      setErrors(issues);
      return;
    }
    const data = {
      name: v.name.trim(),
      type: v.type,
      categoryId: v.categoryId,
      description: v.description.trim(),
      location: v.location.trim(),
      phone: v.phone.trim(),
      email: v.email.trim(),
      weeklyHours: v.weeklyHours,
    };
    if (editing) {
      await a.update("vendors", vendor.id, data);
      await a.update("users", account.id, { name: v.representative.trim() });
    } else {
      const vendorId = uid("VEN"),
        userId = uid("USR");
      await a.add("users", {
        id: userId,
        name: v.representative.trim(),
        email: v.loginEmail.trim().toLowerCase(),
        password: v.password,
        role: "vendor",
        vendorId,
        club: "",
      });
      try {
        await a.add("vendors", {
          id: vendorId,
          ...data,
          accountStatus: "pending",
          isOpen: false,
        });
      } catch (error) {
        try {
          await a.remove("users", userId);
        } catch {
          throw new Error(
            "Vendor creation failed and the account rollback failed. Ask the data-layer owner to resolve this demo account.",
          );
        }
        throw error;
      }
    }
    await a.audit(
      `${editing ? "Updated" : "Created pending vendor"}: ${v.name.trim()}`,
    );
    a.notify(
      editing ? "Vendor profile updated." : "Pending vendor account created.",
    );
    onClose();
  }
  const field = (k, title, props = {}) => (
    <Field
      name={k}
      label={title}
      value={v[k]}
      onChange={(value) => change(k, value)}
      error={errors[k]}
      {...props}
    />
  );
  return (
    <Modal
      wide
      title={editing ? "Edit vendor account" : "Create vendor account"}
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          run(save, (message) => setErrors({ save: message }));
        }}
      >
        <div className="mh-modalbody">
          <ErrorSummary errors={errors} />
          <h3 className="mh-form-section">Representative account</h3>
          <div className="mh-formgrid">
            {field("representative", "Representative name", { required: true })}
            {field("loginEmail", "Login email", {
              type: "email",
              readOnly: editing,
              required: true,
            })}
            {!editing &&
              field("password", "Initial demo password", {
                type: "password",
                autoComplete: "new-password",
                required: true,
              })}
          </div>
          {!editing && (
            <Notice>
              Demo accounts only. Use 8+ characters with letters and numbers.
              Never enter a real university password.
            </Notice>
          )}
          <h3 className="mh-form-section">Business information</h3>
          <div className="mh-formgrid">
            {field("name", "Business name", { required: true })}
            {field("type", "Business type", {
              options: ["restaurant", "barber", "laundry", "store"],
              readOnly: editing,
              required: true,
            })}
            {field("categoryId", "Category", {
              options: [
                { value: "", label: "Choose category" },
                ...a.categories.map((c) => ({ value: c.id, label: c.name })),
              ],
              required: true,
            })}
            {field("location", "Written location", { required: true })}
            {field("email", "Public contact email", { type: "email" })}
            {field("phone", "Phone number", { type: "tel" })}
            <div className="mh-full">
              {field("description", "Description", {
                type: "textarea",
                required: true,
              })}
            </div>
          </div>
          <h3 className="mh-form-section">Weekly opening hours</h3>
          <p className="mh-muted">
            Display hours are separate from the vendor's manual Open / Closed
            status.
          </p>
          <div className="mh-hourlabels">
            <span>Day</span>
            <span>Opens</span>
            <span>Closes</span>
            <span>Closed</span>
          </div>
          {v.weeklyHours.map((h, i) => (
            <div key={h.day} className="mh-hourwrap">
              <div className="mh-hours">
                <strong>{h.day.slice(0, 3)}</strong>
                <label>
                  <span className="mh-sr">{h.day} opening time</span>
                  <input
                    type="time"
                    value={h.open}
                    disabled={h.closed}
                    aria-invalid={!!errors[`hours${i}`]}
                    onChange={(e) =>
                      change(
                        "weeklyHours",
                        v.weeklyHours.map((x, n) =>
                          n === i ? { ...x, open: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  <span className="mh-sr">{h.day} closing time</span>
                  <input
                    type="time"
                    value={h.close}
                    disabled={h.closed}
                    aria-invalid={!!errors[`hours${i}`]}
                    onChange={(e) =>
                      change(
                        "weeklyHours",
                        v.weeklyHours.map((x, n) =>
                          n === i ? { ...x, close: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </label>
                <label className="mh-checkbox">
                  <input
                    type="checkbox"
                    checked={h.closed}
                    aria-label={`${h.day} closed`}
                    onChange={(e) =>
                      change(
                        "weeklyHours",
                        v.weeklyHours.map((x, n) =>
                          n === i ? { ...x, closed: e.target.checked } : x,
                        ),
                      )
                    }
                  />
                  <span className="mh-sr">Closed</span>
                </label>
              </div>
              {errors[`hours${i}`] && (
                <small className="mh-field-error">{errors[`hours${i}`]}</small>
              )}
            </div>
          ))}
        </div>
        <footer className="mh-modalfoot">
          <button
            type="button"
            className="mh-btn mh-btn-secondary"
            disabled={busy}
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="mh-btn" disabled={busy}>
            {busy
              ? "Saving…"
              : editing
                ? "Save changes"
                : "Create pending account"}
          </button>
        </footer>
      </form>
    </Modal>
  );
}

export default function VendorAccounts() {
  const a = useAdmin(),
    [q, setQ] = useState(""),
    [status, setStatus] = useState(
      () =>
        new URLSearchParams(
          window.location.hash.split("?")[1] || window.location.search,
        ).get("status") || "all",
    ),
    [editor, setEditor] = useState(null),
    [confirmation, setConfirmation] = useState(null),
    list = a.vendors.filter(
      (v) =>
        (!q ||
          norm(
            v.name +
              " " +
              a.users.find((u) => u.vendorId === v.id)?.name +
              " " +
              a.users.find((u) => u.vendorId === v.id)?.email,
          ).includes(norm(q))) &&
        (status === "all" || norm(v.accountStatus) === status),
    );
  async function changeStatus() {
    const { id, next } = confirmation,
      v = a.vendors.find((x) => x.id === id);
    if (!v || !transitionAllowed(v.accountStatus, next))
      throw new Error(
        "This status action is no longer available. Refresh the list.",
      );
    await a.update("vendors", id, { accountStatus: next });
    await a.audit(`${v.name}: ${v.accountStatus} → ${next}`);
    a.notify(`${v.name} is now ${next}.`);
    setConfirmation(null);
  }
  return (
    <AdminGuard>
      <PageHeader
        id="S18 · ADM02"
        title="Vendor accounts"
        description="Manage business access without losing service-request history."
        actions={
          <button className="mh-btn" onClick={() => setEditor({})}>
            <Icon name="plus" size={17} />
            Create vendor
          </button>
        }
      />
      <section className="mh-panel">
        <div className="mh-toolbar">
          <Search
            value={q}
            onChange={setQ}
            placeholder="Search business, representative, or email"
          />
          <Field
            label="Account status"
            value={status}
            onChange={setStatus}
            options={["all", "pending", "active", "suspended", "archived"].map(
              (x) => ({
                value: x,
                label: x === "all" ? "All statuses" : label(x),
              }),
            )}
          />
          <button
            className="mh-textbtn"
            onClick={() => {
              setQ("");
              setStatus("all");
            }}
          >
            Clear filters
          </button>
        </div>
        <Table
          rows={list}
          columns={[
            {
              label: "Business",
              render: (v) => (
                <div className="mh-cell-main">
                  <span className="mh-business-mark">
                    {v.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <b>{v.name}</b>
                    <small>{v.location}</small>
                  </div>
                </div>
              ),
            },
            {
              label: "Representative",
              render: (v) => {
                const u = a.users.find((u) => u.vendorId === v.id);
                return (
                  <div>
                    <b>{u?.name || "Not linked"}</b>
                    <small className="mh-subline">
                      {u?.email || "No account"}
                    </small>
                  </div>
                );
              },
            },
            {
              label: "Type / category",
              render: (v) => (
                <div>
                  {label(v.type)}
                  <small className="mh-subline">
                    {a.categories.find((c) => c.id === v.categoryId)?.name ||
                      "Unassigned"}
                  </small>
                </div>
              ),
            },
            {
              label: "Account status",
              render: (v) => <Badge status={v.accountStatus} />,
            },
            {
              label: "Actions",
              render: (v) => (
                <div className="mh-rowactions">
                  <button
                    className="mh-action"
                    onClick={() =>
                      setEditor({
                        vendor: v,
                        account: a.users.find((u) => u.vendorId === v.id),
                      })
                    }
                  >
                    Edit
                  </button>
                  {norm(v.accountStatus) === "pending" && (
                    <button
                      className="mh-action"
                      onClick={() =>
                        setConfirmation({
                          id: v.id,
                          next: "active",
                          verb: "Approve",
                        })
                      }
                    >
                      Approve
                    </button>
                  )}
                  {norm(v.accountStatus) === "active" && (
                    <button
                      className="mh-action mh-action-danger"
                      onClick={() =>
                        setConfirmation({
                          id: v.id,
                          next: "suspended",
                          verb: "Suspend",
                        })
                      }
                    >
                      Suspend
                    </button>
                  )}
                  {norm(v.accountStatus) === "suspended" && (
                    <button
                      className="mh-action"
                      onClick={() =>
                        setConfirmation({
                          id: v.id,
                          next: "active",
                          verb: "Reactivate",
                        })
                      }
                    >
                      Reactivate
                    </button>
                  )}
                  {norm(v.accountStatus) !== "archived" && (
                    <button
                      className="mh-action mh-action-danger"
                      onClick={() =>
                        setConfirmation({
                          id: v.id,
                          next: "archived",
                          verb: "Archive",
                        })
                      }
                    >
                      Archive
                    </button>
                  )}
                </div>
              ),
            },
          ]}
        />
        <div className="mh-panelnote">
          Suspended and archived vendors cannot sign in or receive new requests.
          Existing records remain unchanged.
        </div>
      </section>
      {editor && <VendorEditor {...editor} onClose={() => setEditor(null)} />}{" "}
      {confirmation && (
        <ConfirmDialog
          title={`${confirmation.verb} vendor?`}
          message={`${a.vendors.find((v) => v.id === confirmation.id)?.name} will become ${confirmation.next}. Historical requests will be preserved. ${["suspended", "archived"].includes(confirmation.next) ? "Access and new activity will be blocked." : ""}`}
          confirmLabel={confirmation.verb}
          onConfirm={changeStatus}
          onClose={() => setConfirmation(null)}
        />
      )}
    </AdminGuard>
  );
}
