/** The shared heading block used by every screen. */
export default function PageHeader({ id, screenId, screenName, eyebrow = 'KFUPM Mall Hub', title, subtitle, actions }) {
  return <header className="pagehead"><div>
    {(id || screenId) && <div className="screenid">{id || screenId} / {screenName || title}</div>}
    <div className="eyebrow">{eyebrow}</div><h1>{title}</h1>
    {subtitle && <p className="subtitle">{subtitle}</p>}
  </div>{actions && <div className="actions row">{actions}</div>}</header>
}
