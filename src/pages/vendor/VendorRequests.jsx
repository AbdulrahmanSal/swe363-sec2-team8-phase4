import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import RequestTable from './RequestTable.jsx'
import { AccessRestricted, EmptyState, FormField, Metric, PageHeader } from './VendorUi.jsx'
import { REQUEST_TYPE_SHORT, countRequests, matchesStatus } from './vendorUtils.js'
import './vendor.css'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active (accepted or in progress)' },
  { value: 'completed', label: 'Completed' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Cancelled', label: 'Cancelled' },
]

const byNewest = (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || a.id.localeCompare(b.id)

/** S15 · Customer requests (VEN05). Filters live in the URL (?type=barber&status=pending) so S12's View links work. */
export default function VendorRequests() {
  const { role, ownVendor } = useAuth()
  const { data } = useData()
  const [params, setParams] = useSearchParams()

  if (role !== 'vendor' || !ownVendor) {
    return <AccessRestricted message="Sign in with a vendor representative account to see customer requests." />
  }

  const type = params.get('type') || 'all'
  const status = params.get('status') || 'all'

  const own = data.requests.filter((r) => r.vendorId === ownVendor.id)
  const counts = countRequests(own)
  const shown = own.filter((r) => (type === 'all' || r.type === type) && matchesStatus(r, status)).sort(byNewest)

  // An exact status from a shared link (e.g. ?status=Preparing) still appears in the dropdown.
  const statusOptions = STATUS_OPTIONS.some((o) => o.value === status)
    ? STATUS_OPTIONS
    : [...STATUS_OPTIONS, { value: status, label: status }]

  function setFilter(name, value) {
    const next = new URLSearchParams(params)
    if (value === 'all') next.delete(name)
    else next.set(name, value)
    setParams(next, { replace: true })
  }

  return (
    <section>
      <PageHeader
        id="S15"
        screenName="Vendor requests"
        eyebrow="Business workspace"
        title="Customer requests"
        subtitle="Review requests and update progress for your assigned business."
      />

      <div className="metrics">
        <Metric label="Pending" value={counts.pending} note="Awaiting vendor response" />
        <Metric label="Active" value={counts.active} note="Accepted or in progress" />
        <Metric label="Completed" value={counts.completed} note="Finished requests" />
      </div>

      <section className="panel">
        <div className="filters">
          <FormField as="select" label="Request type" value={type} onChange={(e) => setFilter('type', e.target.value)}>
            <option value="all">All types</option>
            {Object.entries(REQUEST_TYPE_SHORT).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FormField>
          <FormField as="select" label="Status" value={status} onChange={(e) => setFilter('status', e.target.value)}>
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </FormField>
        </div>

        <p className="visuallyhidden" role="status">
          {shown.length} {shown.length === 1 ? 'request' : 'requests'} shown
        </p>

        {shown.length ? (
          <RequestTable requests={shown} users={data.users} caption={`Customer requests for ${ownVendor.name}`} />
        ) : own.length ? (
          <EmptyState
            title="No requests match these filters"
            message="Try another request type or status."
            action={
              <button type="button" onClick={() => setParams({}, { replace: true })}>
                Clear filters
              </button>
            }
          />
        ) : (
          <EmptyState title="No customer requests yet" message="Orders, appointments and pickup requests for your business will appear here." />
        )}
      </section>
    </section>
  )
}
