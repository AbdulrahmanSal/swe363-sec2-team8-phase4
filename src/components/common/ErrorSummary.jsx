export default function ErrorSummary({ errors = {}, title = 'Please correct the following:' }) {
  const items = Array.isArray(errors) ? errors : Object.values(errors)
  if (!items.filter(Boolean).length) return null
  return <div className="errorbox" role="alert"><strong>{title}</strong><ul>{items.filter(Boolean).map((message, index) => <li key={index}>{message}</li>)}</ul></div>
}
