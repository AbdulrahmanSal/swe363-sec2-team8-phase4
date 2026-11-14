import { useState } from "react";
import { useAdmin, AdminGuard } from "../../features/admin/AdminBridge";
import {
  PageHeader,
  Icon,
  Badge,
  Table,
  Modal,
  Field,
  ErrorSummary,
  ConfirmDialog,
  useSaving,
  useNow,
} from "../../features/admin/components";
import {
  future,
  localTime,
  toISO,
  validateOfficial,
  publicationState,
  fmt,
  uid,
} from "../../features/admin/rules";
function ContentEditor({ kind, item, onClose }) {
  const a = useAdmin(),
    [v, set] = useState(() => ({
      title: item?.title || "",
      message: item?.message || "",
      teamA: item?.teamA || "",
      teamB: item?.teamB || "",
      location: item?.location || "",
      publishAt: localTime(item?.publishAt || new Date().toISOString()),
      matchAt: localTime(item?.matchAt || future(3, 20)),
    })),
    [errors, setErrors] = useState({}),
    { busy, run } = useSaving();
  const field = (k, title, props = {}) => (
    <Field
      label={title}
      name={k}
      value={v[k]}
      onChange={(value) => set((x) => ({ ...x, [k]: value }))}
      error={errors[k]}
      required
      {...props}
    />
  );
  async function save() {
    const issues = validateOfficial(v, kind);
    if (Object.keys(issues).length) {
      setErrors(issues);
      return;
    }
    const data =
      kind === "announcements"
        ? {
            title: v.title.trim(),
            message: v.message.trim(),
            publishAt: toISO(v.publishAt),
          }
        : {
            teamA: v.teamA.trim(),
            teamB: v.teamB.trim(),
            location: v.location.trim(),
            matchAt: toISO(v.matchAt),
            publishAt: toISO(v.publishAt),
          };
    if (item) {
      const live = a[kind].find((x) => x.id === item.id);
      if (!live || live.removed)
        throw new Error("This item has been removed and cannot be edited.");
      await a.update(kind, item.id, data);
    } else
      await a.add(kind, {
        id: uid(kind === "matches" ? "MAT" : "ANN"),
        ...data,
        removed: false,
      });
    await a.audit(
      `${item ? "Updated" : "Created"} ${kind === "matches" ? "match screening" : "announcement"}: ${v.title || `${v.teamA} vs ${v.teamB}`}`,
    );
    a.notify("Official content saved. Publication follows its schedule.");
    onClose();
  }
  return (
    <Modal
      title={`${item ? "Edit" : "New"} ${kind === "matches" ? "match screening" : "announcement"}`}
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
          {kind === "announcements" ? (
            <>
              {field("title", "Title")}
              {field("message", "Message", { type: "textarea" })}
            </>
          ) : (
            <>
              <div className="mh-formgrid">
                {field("teamA", "First team")}
                {field("teamB", "Second team")}
              </div>
              {field("matchAt", "Match date and time (Riyadh)", {
                type: "datetime-local",
              })}
              {field("location", "Screening location")}
            </>
          )}
          {field("publishAt", "Publication date and time (Riyadh)", {
            type: "datetime-local",
          })}
          <p className="mh-muted">
            Future publication times create Scheduled content, hidden from the
            feed until publication.
          </p>
        </div>
        <footer className="mh-modalfoot">
          <button
            className="mh-btn mh-btn-secondary"
            type="button"
            disabled={busy}
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="mh-btn" disabled={busy}>
            {busy ? "Saving…" : "Save content"}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
export default function OfficialContent() {
  const clock = useNow();
  const a = useAdmin(),
    [tab, setTab] = useState("announcements"),
    [editor, setEditor] = useState(null),
    [removal, setRemoval] = useState(null),
    rows = a[tab];
  async function remove() {
    const item = a[removal.kind].find((x) => x.id === removal.item.id);
    if (!item || item.removed)
      throw new Error("This content is already removed.");
    await a.update(removal.kind, item.id, { removed: true });
    await a.audit(
      `Removed ${removal.kind === "matches" ? "match screening" : "announcement"}: ${item.title || `${item.teamA} vs ${item.teamB}`}`,
    );
    a.notify("Content removed from the public feed.");
    setRemoval(null);
  }
  return (
    <AdminGuard>
      <PageHeader
        id="S20 · ADM04 / ADM05"
        title="Official content"
        description="Keep the community informed with announcements and match screenings."
        actions={
          <button className="mh-btn" onClick={() => setEditor({ kind: tab })}>
            <Icon name="plus" size={17} />
            New {tab === "matches" ? "match" : "announcement"}
          </button>
        }
      />
      <div className="mh-tabs" role="group" aria-label="Content type">
        {["announcements", "matches"].map((x) => (
          <button
            key={x}
            aria-pressed={tab === x}
            className={tab === x ? "active" : ""}
            onClick={() => setTab(x)}
          >
            {x === "matches" ? "Match screenings" : "Announcements"}
            <span>{a[x].length}</span>
          </button>
        ))}
      </div>
      <section className="mh-panel">
        <Table
          rows={rows}
          columns={[
            {
              label: tab === "matches" ? "Match" : "Announcement",
              render: (x) => (
                <div>
                  <b>
                    {tab === "matches" ? `${x.teamA} vs ${x.teamB}` : x.title}
                  </b>
                  <small className="mh-subline mh-clamp">
                    {tab === "matches" ? x.location : x.message}
                  </small>
                </div>
              ),
            },
            { label: "Publication (Riyadh)", render: (x) => fmt(x.publishAt) },
            ...(tab === "matches"
              ? [{ label: "Kick-off (Riyadh)", render: (x) => fmt(x.matchAt) }]
              : []),
            {
              label: "State",
              render: (x) => <Badge status={publicationState(x, clock)} />,
            },
            {
              label: "Actions",
              render: (x) =>
                x.removed ? (
                  <span className="mh-muted">Retained for history</span>
                ) : (
                  <div className="mh-rowactions">
                    <button
                      className="mh-action"
                      onClick={() => setEditor({ kind: tab, item: x })}
                    >
                      Edit
                    </button>
                    <button
                      className="mh-action mh-action-danger"
                      onClick={() => setRemoval({ kind: tab, item: x })}
                    >
                      Remove
                    </button>
                  </div>
                ),
            },
          ]}
        />
      </section>
      {editor && <ContentEditor {...editor} onClose={() => setEditor(null)} />}{" "}
      {removal && (
        <ConfirmDialog
          title="Remove official content?"
          message="This item will disappear from the public feed. Its record will be retained."
          confirmLabel="Remove content"
          onConfirm={remove}
          onClose={() => setRemoval(null)}
        />
      )}
    </AdminGuard>
  );
}
