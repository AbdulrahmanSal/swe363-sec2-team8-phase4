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
import { norm } from "../../features/admin/rules";
function PermissionEditor({ visitor, onClose }) {
  const a = useAdmin(),
    [club, setClub] = useState(visitor.club || ""),
    [errors, setErrors] = useState({}),
    { busy, run } = useSaving();
  async function save() {
    if (!club.trim()) {
      setErrors({ club: "A club name is required." });
      return;
    }
    const u = a.users.find((x) => x.id === visitor.id);
    if (!u || u.role !== "visitor")
      throw new Error("Only Visitor accounts can receive this permission.");
    await a.update("users", u.id, { club: club.trim() });
    await a.audit(`Assigned ${club.trim()} permission to ${u.name}`);
    a.notify("Club permission saved. The account remains a Visitor.");
    onClose();
  }
  return (
    <Modal
      title={visitor.club ? "Update club permission" : "Grant club permission"}
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
        <div className="mh-modalbody mh-formstack">
          <ErrorSummary errors={errors} />
          <div className="mh-person">
            <span className="mh-avatar">{visitor.name.slice(0, 1)}</span>
            <div>
              <b>{visitor.name}</b>
              <small>{visitor.email}</small>
            </div>
          </div>
          <Field
            label="Assigned club"
            value={club}
            onChange={setClub}
            error={errors.club}
            required
          />
          <Notice>
            This adds one club permission. It does not create a new account role
            or change historical submissions.
          </Notice>
        </div>
        <footer className="mh-modalfoot">
          <button
            className="mh-btn mh-btn-secondary"
            type="button"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button className="mh-btn" disabled={busy}>
            {busy ? "Saving…" : "Save permission"}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
export default function ClubPermissions() {
  const a = useAdmin(),
    [q, setQ] = useState(""),
    [editor, setEditor] = useState(null),
    [revoking, setRevoking] = useState(null),
    rows = a.users.filter(
      (u) =>
        u.role === "visitor" && norm(u.name + " " + u.email).includes(norm(q)),
    );
  async function revoke() {
    const u = a.users.find((x) => x.id === revoking.id);
    if (!u || u.role !== "visitor" || !u.club)
      throw new Error("This permission has already changed.");
    await a.update("users", u.id, { club: "" });
    await a.audit(`Revoked club permission for ${u.name}`);
    a.notify("Permission revoked. Historical submissions were preserved.");
    setRevoking(null);
  }
  return (
    <AdminGuard>
      <PageHeader
        id="S21 · ADM06"
        title="Club permissions"
        description="Let designated visitors submit events on behalf of their student club."
      />
      <section className="mh-panel">
        <div className="mh-toolbar">
          <Search
            value={q}
            onChange={setQ}
            placeholder="Search visitors by name or email"
          />
          <span className="mh-muted">{rows.length} visitor accounts</span>
        </div>
        <Table
          rows={rows}
          columns={[
            {
              label: "Visitor",
              render: (u) => (
                <div className="mh-cell-main">
                  <span className="mh-avatar">{u.name[0]}</span>
                  <div>
                    <b>{u.name}</b>
                    <small>{u.email}</small>
                  </div>
                </div>
              ),
            },
            { label: "Main role", render: () => <Badge status="visitor" /> },
            {
              label: "Assigned club",
              render: (u) =>
                u.club ? (
                  <span className="mh-club">
                    <Icon name="users" size={16} />
                    {u.club}
                  </span>
                ) : (
                  <span className="mh-muted">Not assigned</span>
                ),
            },
            {
              label: "Submissions",
              render: (u) =>
                a.events.filter((e) => e.submittedBy === u.id).length,
            },
            {
              label: "Actions",
              render: (u) => (
                <div className="mh-rowactions">
                  <button className="mh-action" onClick={() => setEditor(u)}>
                    {u.club ? "Update" : "Grant permission"}
                  </button>
                  {u.club && (
                    <button
                      className="mh-action mh-action-danger"
                      onClick={() => setRevoking(u)}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ),
            },
          ]}
        />
        <div className="mh-panelnote">
          Revocation prevents new events. Existing submissions and their club
          names remain unchanged.
        </div>
      </section>
      {editor && (
        <PermissionEditor visitor={editor} onClose={() => setEditor(null)} />
      )}{" "}
      {revoking && (
        <ConfirmDialog
          title="Revoke club permission?"
          message={`${revoking.name} will no longer be able to submit new club events. All previous submissions remain available.`}
          confirmLabel="Revoke permission"
          onConfirm={revoke}
          onClose={() => setRevoking(null)}
        />
      )}
    </AdminGuard>
  );
}
