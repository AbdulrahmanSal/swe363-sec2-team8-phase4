import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import RequestTable from './RequestTable.jsx'
import useToastMessage from './useToastMessage.js'
import { AccessRestricted, ConfirmDialog, EmptyState, Metric, PageHeader, StatusBadge, Toast } from './VendorUi.jsx'
import { countRequests } from './vendorUtils.js'
import './vendor.css'

/** Newest requests first; requests created at the same moment fall back to the higher number. */
const byNewest = (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.id.localeCompare(a.id)

/** S12 · Vendor dashboard (VEN01, VEN03) */
export default function VendorDashboard() {
  const { user, role, ownVendor } = useAuth()
  const { data, update, logActivity } = useData()
  const [confirming, setConfirming] = useState(false)
  const [toast, showToast] = useToastMessage()

  if (role !== 'vendor' || !ownVendor) {
    return <AccessRestricted message="Sign in with a vendor representative account to open the business dashboard." />
  }

  const requests = data.requests.filter((r) => r.vendorId === ownVendor.id)
  const counts = countRequests(requests)
  const recent = [...requests].sort(byNewest).slice(0, 5)
  const isOpen = ownVendor.isOpen

  function toggleOpen() {
    update('vendors', ownVendor.id, { isOpen: !isOpen })
    logActivity(`${ownVendor.name} set ${isOpen ? 'Closed' : 'Open'}`, user.name)
    showToast(isOpen ? 'Business set to Closed. New orders are blocked.' : 'Business set to Open.')
  }

  return (
    <section>
      <PageHeader
        id="S12"
        screenName="Vendor dashboard"
        eyebrow="Business workspace"
        title={ownVendor.name}
        subtitle="Your business activity and shortcuts in one workspace."
      />

      <div className="metrics">
        <Metric label="Pending requests" value={counts.pending} note="Needs your response" to="/vendor/requests?status=pending" />
        <Metric label="Active requests" value={counts.active} note="Accepted or in progress" to="/vendor/requests?status=active" />
        <Metric label="Completed" value={counts.completed} note="Finished requests" to="/vendor/requests?status=completed" />
      </div>

      <section className="panel vd-statuscard" aria-labelledby="business-status">
        <div className="panelhead">
          <h2 id="business-status">Business status</h2>
          <div className="row">
            <StatusBadge status={isOpen ? 'Open' : 'Closed'} />
            <button type="button" className="small" onClick={() => setConfirming(true)}>
              {isOpen ? 'Set Closed' : 'Set Open'}
            </button>
          </div>
        </div>
        <p className="muted">Closing blocks new restaurant orders. Existing requests remain available.</p>
        <nav className="row vd-shortcuts" aria-label="Business shortcuts">
          <Link className="button" to="/vendor/profile">
            Edit business profile
          </Link>
          <Link className="button" to="/vendor/offerings">
            Manage offerings
          </Link>
          <Link className="button" to="/vendor/offers">
            Manage offers
          </Link>
        </nav>
      </section>

      <section className="panel" aria-labelledby="recent-requests">
        <div className="panelhead">
          <h2 id="recent-requests">Recent requests</h2>
          <Link className="button small" to="/vendor/requests">
            View all
          </Link>
        </div>
        {recent.length ? (
          <RequestTable requests={recent} users={data.users} caption="Most recent requests" />
        ) : (
          <EmptyState title="No requests yet" message="New orders, appointments and pickups for your business will appear here." />
        )}
      </section>

      {confirming && (
        <ConfirmDialog
          title={isOpen ? 'Set business to Closed?' : 'Set business to Open?'}
          message={
            isOpen
              ? `${ownVendor.name} will stop accepting new orders and bookings. Existing requests are not changed.`
              : `${ownVendor.name} will accept new orders and bookings again.`
          }
          confirmLabel={isOpen ? 'Set Closed' : 'Set Open'}
          danger={isOpen}
          onConfirm={toggleOpen}
          onClose={() => setConfirming(false)}
        />
      )}
      <Toast message={toast} />
    </section>
  )
}
