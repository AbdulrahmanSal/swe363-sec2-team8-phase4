import { useState } from "react";
import { useAdmin, AdminGuard } from "../../features/admin/AdminBridge";
import {
  PageHeader,
  Badge,
  Table,
  Modal,
  Field,
  ErrorSummary,
  ConfirmDialog,
  Notice,
  useSaving,
} from "../../features/admin/components";
import {
  eventState,
  fmt,
  localTime,
  toISO,
  validateEvent,
} from "../../features/admin/rules";
function EventEditor({ event, onClose, onDecision }) {
  const a = useAdmin(),
    [v, set] = useState({
      ...event,
      startAt: localTime(event.startAt),
      endAt: localTime(event.endAt),
    }),
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
  async function submit(kind) {
    const issues = validateEvent(
      v,
      kind === "approve" ||
        (kind === "save" && eventState(event) === "approved"),
    );
    if (Object.keys(issues).length) {
      setErrors(issues);
      return;
    }
    const live = a.events.find((x) => x.id === event.id);
    if (!live) throw new Error("This event is no longer available.");
    const changes = {
      title: v.title.trim(),
      description: v.description.trim(),
      location: v.location.trim(),
      startAt: toISO(v.startAt),
      endAt: toISO(v.endAt),
    };
    if (kind === "reject") {
      onDecision({ event, changes });
      return;
    }
    await a.update("events", event.id, {
      ...changes,
      status: kind === "approve" ? "approved" : live.status,
      ...(kind === "approve" ? { rejectReason: "" } : {}),
    });
    await a.audit(
      `${kind === "approve" ? "Approved" : "Edited"} club event: ${changes.title}`,
    );
    a.notify(
      kind === "approve"
        ? "Event approved and published to the feed."
        : `Edits saved; event remains ${eventState(live) === "pending" ? "Pending review" : live.status}.`,
    );
    onClose();
  }
  return (
    <Modal
      wide
      title="Review club event"
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          run(
            () => submit("save"),
            (message) => setErrors({ save: message }),
          );
        }}
      >
        <div className="mh-modalbody mh-formstack">
          <div className="mh-between">
            <span className="mh-muted">
              Submitted by{" "}
              {a.users.find((u) => u.id === event.submittedBy)?.name ||
                "Visitor"}
            </span>
            <Badge
              status={eventState(event)}
              display={
                eventState(event) === "pending" ? "Pending review" : undefined
              }
            />
          </div>
          <ErrorSummary errors={errors} />
          <Field label="Club at submission" value={event.club} readOnly />
          {field("title", "Event title")}
          {field("description", "Description", { type: "textarea" })}
          {field("location", "Location")}
          <div className="mh-formgrid">
            {field("startAt", "Start (Riyadh)", { type: "datetime-local" })}
            {field("endAt", "End (Riyadh)", { type: "datetime-local" })}
          </div>
          {event.rejectReason && (
            <Notice>Previous rejection reason: {event.rejectReason}</Notice>
          )}
          <p className="mh-muted">
            Saving edits keeps the current status. Approving publishes the
            event; rejecting requires a reason and confirmation.
          </p>
        </div>
        <footer className="mh-modalfoot mh-wrap">
          <button
            className="mh-btn mh-btn-secondary"
            type="button"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            className="mh-btn mh-btn-danger"
            type="button"
            disabled={busy}
            onClick={() =>
              run(
                () => submit("reject"),
                (message) => setErrors({ save: message }),
              )
            }
          >
            Reject
          </button>
          <button className="mh-btn mh-btn-secondary" disabled={busy}>
            {busy ? "Saving…" : "Save edits"}
          </button>
          <button
            className="mh-btn"
            type="button"
            disabled={busy}
            onClick={() =>
              run(
                () => submit("approve"),
                (message) => setErrors({ save: message }),
              )
            }
          >
            Approve event
          </button>
        </footer>
      </form>
    </Modal>
  );
}
export default function EventReview() {
  const a = useAdmin(),
    [filter, setFilter] = useState(
      () =>
        new URLSearchParams(
          window.location.hash.split("?")[1] || window.location.search,
        ).get("status") || "all",
    ),
    [editor, setEditor] = useState(null),
    [rejecting, setRejecting] = useState(null),
    rows = a.events.filter((e) => filter === "all" || eventState(e) === filter);
  async function reject(reason) {
    const ev = a.events.find((x) => x.id === rejecting.event.id);
    if (!ev) throw new Error("Event is no longer available.");
    await a.update("events", ev.id, {
      ...rejecting.changes,
      status: "rejected",
      rejectReason: reason,
    });
    await a.audit(`Rejected club event: ${rejecting.changes.title}`);
    a.notify("Event rejected; the submitter can see the reason.");
    setRejecting(null);
  }
  return (
    <AdminGuard>
      <PageHeader
        id="S22 · ADM07"
        title="Club event review"
        description="Help student activities reach the mall community with clear review decisions."
      />
      <div className="mh-chips" role="group" aria-label="Event status">
        {[
          ["all", "All"],
          ["pending", "Pending review"],
          ["approved", "Approved"],
          ["rejected", "Rejected"],
        ].map(([key, text]) => (
          <button
            key={key}
            aria-pressed={filter === key}
            className={filter === key ? "active" : ""}
            onClick={() => setFilter(key)}
          >
            {text}
            <span>
              {
                a.events.filter((e) => key === "all" || eventState(e) === key)
                  .length
              }
            </span>
          </button>
        ))}
      </div>
      <section className="mh-panel">
        <Table
          rows={rows}
          columns={[
            {
              label: "Event",
              render: (e) => (
                <div>
                  <b>{e.title}</b>
                  <small className="mh-subline">{e.location}</small>
                </div>
              ),
            },
            {
              label: "Club / submitter",
              render: (e) => (
                <div>
                  {e.club}
                  <small className="mh-subline">
                    {a.users.find((u) => u.id === e.submittedBy)?.name ||
                      "Visitor"}
                  </small>
                </div>
              ),
            },
            { label: "Start (Riyadh)", render: (e) => fmt(e.startAt) },
            {
              label: "Status",
              render: (e) => (
                <Badge
                  status={eventState(e)}
                  display={
                    eventState(e) === "pending" ? "Pending review" : undefined
                  }
                />
              ),
            },
            {
              label: "Action",
              render: (e) => (
                <button className="mh-action" onClick={() => setEditor(e)}>
                  Review / Edit
                </button>
              ),
            },
          ]}
        />
      </section>
      {editor && (
        <EventEditor
          event={editor}
          onClose={() => setEditor(null)}
          onDecision={(decision) => {
            setEditor(null);
            setRejecting(decision);
          }}
        />
      )}{" "}
      {rejecting && (
        <ConfirmDialog
          title="Reject event?"
          message={`Reject “${rejecting.changes.title}”? The reason will be visible to the submitting visitor.`}
          reason
          confirmLabel="Reject event"
          onConfirm={reject}
          onClose={() => {
            setEditor({ ...rejecting.event, ...rejecting.changes });
            setRejecting(null);
          }}
        />
      )}
    </AdminGuard>
  );
}
