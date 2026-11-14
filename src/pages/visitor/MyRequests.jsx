import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { PageHeader, FormField, StatusBadge, DataTable, EmptyState } from '../../components/common/index.js'
import { fmt, ms } from '../../utils/format.js'
import { statusGroup } from '../../utils/requestStatus.js'
import { SHORT_TYPE_LABEL, STATUS_OPTIONS, TYPE_OPTIONS, requestTime } from './requestHelpers.js'

/**
 * S09 · My Requests (VIS07)
 * The signed-in visitor's own orders, appointments and laundry requests, newest first.
 * Only their own records are listed (NFR03); filters combine type and status.
 */
export default function MyRequests() {
  const { user } = useAuth()
  const { data } = useData()
  const [type, setType] = useState('All')
  const [status, setStatus] = useState('All')

  const own = data.requests
    .filter((r) => r.visitorId === user.id)
    .sort((a, b) => ms(b.createdAt) - ms(a.createdAt))
  const shown = own.filter((r) => (type === 'All' || r.type === type) && (status === 'All' || r.status === status))
  const count = (group) => own.filter((r) => statusGroup(r.status) === group).length
  const vendorName = (id) => data.vendors.find((v) => v.id === id)?.name ?? 'Unknown business'

  const columns = [
    {
      key: 'id',
      label: 'Request',
      render: (r) => (
        <>
          <strong>{r.id}</strong>
          <div className="tiny muted">{SHORT_TYPE_LABEL[r.type]}</div>
        </>
      ),
    },
    { key: 'vendor', label: 'Business', render: (r) => vendorName(r.vendorId) },
    { key: 'time', label: 'Date / time', render: (r) => fmt(requestTime(r)) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'action',
      label: 'Action',
      render: (r) => (
        <Link to={`/requests/${r.id}`} className="button small" aria-label={`View details for ${r.id}`}>
          View details
        </Link>
      ),
    },
  ]

  return (
    <>
      <PageHeader id="S09" screenName="Visitor dashboard and requests" title="My Requests" subtitle="Track your pickup orders, appointments, and laundry requests." />

      <div className="metrics">
        <div className="metric">
          <span className="muted tiny">Pending</span>
          <strong>{count('pending')}</strong>
          <span className="tiny">Awaiting vendor response</span>
        </div>
        <div className="metric">
          <span className="muted tiny">Active</span>
          <strong>{count('active')}</strong>
          <span className="tiny">Accepted or in progress</span>
        </div>
        <div className="metric">
          <span className="muted tiny">Completed</span>
          <strong>{count('completed')}</strong>
          <span className="tiny">Finished requests</span>
        </div>
      </div>

      <section className="panel">
        {own.length === 0 ? (
          <EmptyState
            title="No requests yet"
            message="Find a business to submit your first request."
            action={
              <Link to="/directory" className="button primary">
                Browse businesses
              </Link>
            }
          />
        ) : (
          <>
            <div className="filters">
              <FormField label="Request type" as="select" value={type} onChange={(e) => setType(e.target.value)} options={TYPE_OPTIONS} />
              <FormField label="Status" as="select" value={status} onChange={(e) => setStatus(e.target.value)} options={['All', ...STATUS_OPTIONS]} />
            </div>
            <p className="tiny muted" role="status">
              Showing {shown.length} of {own.length} requests
            </p>
            <DataTable
              columns={columns}
              rows={shown}
              caption="Your requests"
              emptyTitle="No matching requests"
              emptyMessage="Try another request type or status."
            />
          </>
        )}
      </section>
    </>
  )
}
