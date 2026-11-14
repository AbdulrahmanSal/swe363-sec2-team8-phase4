import { useState, useEffect } from "react";
import { useAdmin, AdminGuard } from "../../features/admin/AdminBridge";
import {
  PageHeader,
  Badge,
  Table,
  Modal,
  Field,
  ConfirmDialog,
  Notice,
} from "../../features/admin/components";
import { offerState, fmt, label } from "../../features/admin/rules";
export default function OfferModeration() {
  const a = useAdmin(),
    [vendor, setVendor] = useState("all"),
    [state, setState] = useState("all"),
    [selected, setSelected] = useState(null),
    [remove, setRemove] = useState(null),
    [clock, setClock] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const rows = a.offers.filter(
    (o) =>
      (vendor === "all" || o.vendorId === vendor) &&
      (state === "all" || offerState(o, clock) === state),
  );
  async function moderate(reason) {
    const live = a.offers.find((o) => o.id === remove.id);
    if (!live || live.removed)
      throw new Error("This offer has already been removed.");
    await a.update("offers", live.id, { removed: true, removedReason: reason });
    await a.audit(`Removed offer: ${live.title}`);
    a.notify("Offer removed. The reason is visible in the vendor workspace.");
    setRemove(null);
  }
  return (
    <AdminGuard>
      <PageHeader
        id="S23 · ADM08"
        title="Offer moderation"
        description="Review vendor promotions and remove inappropriate or outdated content."
      />
      <section className="mh-panel">
        <div className="mh-toolbar">
          <Field
            label="Vendor"
            value={vendor}
            onChange={setVendor}
            options={[
              { value: "all", label: "All vendors" },
              ...a.vendors.map((v) => ({ value: v.id, label: v.name })),
            ]}
          />
          <Field
            label="Offer state"
            value={state}
            onChange={setState}
            options={["all", "scheduled", "active", "expired", "removed"].map(
              (x) => ({
                value: x,
                label: x === "all" ? "All states" : label(x),
              }),
            )}
          />
          <button
            className="mh-textbtn"
            onClick={() => {
              setVendor("all");
              setState("all");
            }}
          >
            Clear filters
          </button>
        </div>
        <Table
          rows={rows}
          columns={[
            {
              label: "Offer",
              render: (o) => (
                <div>
                  <b>{o.title}</b>
                  <small className="mh-subline mh-clamp">{o.description}</small>
                  {o.removedReason && (
                    <small className="mh-reason">
                      Reason: {o.removedReason}
                    </small>
                  )}
                </div>
              ),
            },
            {
              label: "Vendor",
              render: (o) =>
                a.vendors.find((v) => v.id === o.vendorId)?.name ||
                "Archived business",
            },
            {
              label: "Schedule (Riyadh)",
              render: (o) => (
                <div>
                  {fmt(o.startAt)}
                  <small className="mh-subline">to {fmt(o.endAt)}</small>
                </div>
              ),
            },
            {
              label: "State",
              render: (o) => <Badge status={offerState(o, clock)} />,
            },
            {
              label: "Action",
              render: (o) => (
                <button className="mh-action" onClick={() => setSelected(o)}>
                  {o.removed ? "View record" : "Review / Remove"}
                </button>
              ),
            },
          ]}
        />
        <div className="mh-panelnote">
          Offers do not have an approval queue. Active offers publish
          automatically; removal hides them from public views.
        </div>
      </section>
      {selected && (
        <Modal title="Review vendor offer" onClose={() => setSelected(null)}>
          <div className="mh-modalbody mh-formstack">
            <div className="mh-between">
              <b>
                {a.vendors.find((v) => v.id === selected.vendorId)?.name ||
                  "Archived business"}
              </b>
              <Badge status={offerState(selected, clock)} />
            </div>
            <h3>{selected.title}</h3>
            <p>{selected.description}</p>
            <dl className="mh-details">
              <dt>Starts</dt>
              <dd>{fmt(selected.startAt)}</dd>
              <dt>Ends</dt>
              <dd>{fmt(selected.endAt)}</dd>
            </dl>
            {selected.removedReason && (
              <Notice>Removal reason: {selected.removedReason}</Notice>
            )}
          </div>
          <footer className="mh-modalfoot">
            <button
              className="mh-btn mh-btn-secondary"
              onClick={() => setSelected(null)}
            >
              Close
            </button>
            {!selected.removed && (
              <button
                className="mh-btn mh-btn-danger"
                onClick={() => {
                  setRemove(selected);
                  setSelected(null);
                }}
              >
                Remove offer
              </button>
            )}
          </footer>
        </Modal>
      )}
      {remove && (
        <ConfirmDialog
          title="Remove vendor offer?"
          message={`“${remove.title}” will disappear from the mall feed and vendor profile. The vendor will see your reason.`}
          reason
          confirmLabel="Remove offer"
          onConfirm={moderate}
          onClose={() => setRemove(null)}
        />
      )}
    </AdminGuard>
  );
}
