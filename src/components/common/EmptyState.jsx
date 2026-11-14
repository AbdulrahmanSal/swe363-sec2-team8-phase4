export default function EmptyState({ title, message, action, children }) {
  return <div className="empty"><h3>{title}</h3>{message && <p className="muted">{message}</p>}{action}{children}</div>
}
