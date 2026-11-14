export default function StatusBadge({ status, children, className = '' }) {
  return <span className={`badge ${className}`}>{status || children}</span>
}
