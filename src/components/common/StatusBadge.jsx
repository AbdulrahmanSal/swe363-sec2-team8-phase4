const GOOD = ['open', 'active', 'approved', 'published', 'completed', 'ready for pickup', 'ready']
const WARN = ['pending', 'pending review', 'scheduled', 'preparing', 'accepted', 'collected', 'cleaning']
const BAD = ['closed', 'rejected', 'cancelled', 'suspended', 'archived', 'removed', 'expired', 'unavailable']

/** Status as text in a badge; the colour only repeats what the words say (NFR07). */
export default function StatusBadge({ status, children, className = '' }) {
  const key = String(status ?? '').toLowerCase()
  const tone = GOOD.includes(key) ? 'good' : WARN.includes(key) ? 'warn' : BAD.includes(key) ? 'bad' : ''
  return <span className={`badge ${tone} ${className}`.trim()}>{status || children}</span>
}
