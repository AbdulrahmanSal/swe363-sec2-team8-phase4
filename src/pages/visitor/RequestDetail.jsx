import PagePlaceholder from '../../components/common/PagePlaceholder.jsx'

/**
 * S10 · Shared request detail (VIS04–VIS07, VEN05) — owner: Abdulrahman
 * Used by both roles: mode="visitor" from My Requests, mode="vendor" from Customer requests.
 */
export default function RequestDetail({ mode = 'visitor' }) {
  return (
    <PagePlaceholder
      id="S10"
      title={`Request detail (${mode})`}
      owner="Abdulrahman"
      requirements="VIS04–VIS07, VEN05"
    />
  )
}
