/**
 * Stand-in shown on screens that have not been built yet.
 * Uses the same page header as the Figma reference (screen ID, eyebrow, title).
 * Replace it with the real screen when you implement that page.
 */
export default function PagePlaceholder({ id, title, owner, requirements }) {
  return (
    <section>
      <div className="screenid">
        {id} / {title}
      </div>
      <div className="eyebrow">KFUPM Mall Hub</div>
      <h1>{title}</h1>
      <p className="subtitle">Requirements: {requirements}</p>
      <div className="empty">
        <h3>Not built yet</h3>
        <p className="muted">
          Owner: {owner}. Build this screen to match <code>design/screens/{id}_*.svg</code>.
        </p>
      </div>
    </section>
  )
}
