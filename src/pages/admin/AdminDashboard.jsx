import { useState } from "react";
import { useAdmin, AdminGuard } from "../../features/admin/AdminBridge";
import {
  PageHeader,
  Icon,
  Badge,
  Empty,
  Modal,
  Table,
} from "../../features/admin/components";
import {
  dashboardStats,
  fmt,
  label,
} from "../../features/admin/rules";
export default function AdminDashboard() {
  const a = useAdmin(),
    s = dashboardStats(a),
    [summary, setSummary] = useState(null);
  return (
    <AdminGuard>
      <PageHeader
        id="S17 · ADM01"
        title="Administration overview"
        description="A clear view of the businesses, services, and activity across your mall."
        actions={
          <button
            className="mh-btn mh-btn-secondary"
            onClick={() => a.navigate("/admin/vendors")}
          >
            Manage vendors <Icon name="chevron" size={16} />
          </button>
        }
      />
      <section className="mh-welcome">
        <div>
          <span>OPERATIONS WORKSPACE</span>
          <h2>Your mall. At a glance.</h2>
          <p>Keep businesses connected and the campus community informed.</p>
        </div>
        <div className="mh-welcome-date">
          <Icon name="calendar" />
          <span>
            {new Intl.DateTimeFormat("en-GB", {
              timeZone: "Asia/Riyadh",
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date())}
            <small>All times in Asia/Riyadh</small>
          </span>
        </div>
      </section>
      <section className="mh-metrics" aria-label="Vendor account summaries">
        {s.vendors.map((v) => (
          <button
            className="mh-metric"
            key={v.status}
            onClick={() => a.navigate(`/admin/vendors?status=${v.status}`)}
          >
            <span>
              <Icon name="store" />
              <i>
                <Icon name="arrow" size={16} />
              </i>
            </span>
            <strong>{v.count}</strong>
            <p>{label(v.status)} vendors</p>
            <small>View accounts</small>
          </button>
        ))}
      </section>
      <div className="mh-dashboard-grid">
        <section className="mh-panel">
          <div className="mh-panelhead">
            <div>
              <h2>Service requests</h2>
              <p>All stored demo records, grouped by service.</p>
            </div>
            <span className="mh-count">{a.requests.length} total</span>
          </div>
          <Table
            rows={s.requests}
            columns={[
              { label: "Service", render: (r) => <b>{label(r.type)}</b> },
              { label: "Requests", render: (r) => r.count },
              {
                label: "Summary",
                render: (r) => (
                  <div className="mh-mini-statuses">
                    {r.statuses.length
                      ? r.statuses.map(([status, n]) => (
                          <span key={status}>
                            {status} <b>{n}</b>
                          </span>
                        ))
                      : "No requests"}
                  </div>
                ),
              },
              {
                label: "Action",
                render: (r) => (
                  <button className="mh-textbtn" onClick={() => setSummary(r)}>
                    View <Icon name="chevron" size={14} />
                  </button>
                ),
              },
            ]}
          />
          <div className="mh-panelnote">
            Request processing belongs to the visitor and vendor workspaces.
          </div>
        </section>
        <section className="mh-panel mh-review-card">
          <span className="mh-icon-tile">
            <Icon name="calendar" size={26} />
          </span>
          <div className="mh-kicker">CLUB ACTIVITY</div>
          <strong>{s.pendingEvents}</strong>
          <h2>Events awaiting review</h2>
          <p>Review submissions before they appear in the public mall feed.</p>
          <button
            className="mh-btn"
            onClick={() => a.navigate("/admin/events?status=pending")}
          >
            Review events <Icon name="chevron" size={16} />
          </button>
        </section>
      </div>
      <section className="mh-panel">
        <div className="mh-panelhead">
          <div>
            <h2>Recent activity</h2>
            <p>The latest administrative updates.</p>
          </div>
          <Icon name="clock" />
        </div>
        {a.activity.length ? (
          <ul className="mh-activity">
            {a.activity
              .slice()
              .sort((x, y) => new Date(y.at) - new Date(x.at))
              .slice(0, 8)
              .map((x, i) => (
                <li key={x.id || i}>
                  <span className="mh-activity-dot" />
                  <div>
                    <b>{x.text}</b>
                    <small>{x.actor || "System"}</small>
                  </div>
                  <time>{fmt(x.at)}</time>
                </li>
              ))}
          </ul>
        ) : (
          <Empty title="No activity yet">
            Administrative updates will appear here after the first change.
          </Empty>
        )}
      </section>
      {summary && (
        <Modal
          title={`${label(summary.type)} request summary`}
          onClose={() => setSummary(null)}
        >
          <div className="mh-modalbody">
            <Table
              rows={summary.statuses.map(([status, count]) => ({
                id: status,
                status,
                count,
              }))}
              columns={[
                { label: "Status", render: (r) => <Badge status={r.status} /> },
                { label: "Count", render: (r) => r.count },
              ]}
            />
            {!summary.statuses.length && <p>No requests of this type.</p>}
          </div>
        </Modal>
      )}
    </AdminGuard>
  );
}
