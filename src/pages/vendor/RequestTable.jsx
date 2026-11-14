import { Link } from 'react-router-dom'
import { fmt } from '../../utils/format.js'
import { StatusBadge } from './VendorUi.jsx'
import { REQUEST_TYPE_SHORT, requestDate } from './vendorUtils.js'

/**
 * Requests table for the vendor dashboard (S12) and Customer requests (S15).
 * Columns: request (number + type), customer, date / time, status, action.
 * On phones it becomes stacked cards (vd-table in vendor.css).
 */
export default function RequestTable({ requests, users, caption }) {
  const customer = (id) => users.find((u) => u.id === id)?.name ?? 'Unknown customer'

  return (
    <div className="tablewrap vd-table">
      <table>
        <caption className="visuallyhidden">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Request</th>
            <th scope="col">Customer</th>
            <th scope="col">Date / time</th>
            <th scope="col">Status</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id}>
              <td data-label="Request">
                <span>
                  <span className="vd-cellmain">{r.id}</span>
                  <span className="vd-cellsub">{REQUEST_TYPE_SHORT[r.type]}</span>
                </span>
              </td>
              <td data-label="Customer">{customer(r.visitorId)}</td>
              <td data-label="Date / time">{fmt(requestDate(r))}</td>
              <td data-label="Status">
                <span>
                  <StatusBadge status={r.status} />
                </span>
              </td>
              <td data-label="Action">
                <span>
                  <Link className="button small" to={`/vendor/requests/${r.id}`} aria-label={`View details for ${r.id}`}>
                    View details
                  </Link>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
