import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext.jsx'
import useNow from '../../hooks/useNow.js'
import { fmt } from '../../utils/format.js'
import { getFeedItems } from '../../utils/publicContent.js'
import { PageHeader, FilterChips, Modal, StatusBadge, EmptyState } from '../../components/common/index.js'
/** S03 · VIS01. Public browsing; content changes immediately with shared data. */
export default function Feed() {
  const { data } = useData()
  const now = useNow()
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const allItems = getFeedItems(data, now)
  const items = allItems.filter(item => filter === 'All' || item.kind === filter)
  const detail = selected && allItems.find(item => item.id === selected.id && item.kind === selected.kind)
  const source = item => item.club || data.vendors.find(vendor => vendor.id === item.vendorId)?.name || 'Mall management'
  return <><PageHeader id="S03" screenName="Mall feed" title="What’s happening at the mall" subtitle="Discover announcements, club activities, vendor offers, and upcoming screenings." />
    <FilterChips options={['All', 'Announcements', 'Club events', 'Offers', 'Matches']} value={filter} onChange={setFilter} />
    {items.length ? <div className="grid">{items.map(item => <article className="card" key={`${item.kind}-${item.id}`}>
      <div className="row between"><StatusBadge status={item.kind} /><span className="tiny muted">{source(item)}</span></div>
      <h2 style={{ marginTop: 15 }}>{item.title}</h2><p className="muted">{item.text}</p>
      <div className="cardfooter"><span className="tiny muted">{fmt(item.date)}</span><button type="button" className="small" onClick={() => setSelected({ id: item.id, kind: item.kind })} aria-label={`View details: ${item.title}`}>View details</button></div>
    </article>)}</div> : <EmptyState title="No content to show" message="There are no published items for this filter." action={<button type="button" onClick={() => setFilter('All')}>Show all</button>} />}
    {detail && <Modal title={detail.title} onClose={() => setSelected(null)} actions={<><button type="button" onClick={() => setSelected(null)}>Close</button>{detail.kind === 'Offers' && <Link className="button primary" to={`/vendors/${detail.vendorId}`} onClick={() => setSelected(null)}>View vendor</Link>}</>}>
      <p><StatusBadge status={detail.kind} /> <span className="muted">{source(detail)}</span></p><p className="preserve-lines">{detail.text}</p>
      <dl className="info">{detail.kind === 'Announcements' ? <><dt>Published</dt><dd>{fmt(detail.publication)}</dd></> : <><dt>{detail.kind === 'Matches' ? 'Kick-off' : 'Starts'}</dt><dd>{fmt(detail.start)}</dd>{detail.end && <><dt>Ends</dt><dd>{fmt(detail.end)}</dd></>}{detail.location && <><dt>Location</dt><dd>{detail.location}</dd></>}</>}</dl>
      <p className="tiny muted">Times shown in Asia/Riyadh.</p>
    </Modal>}
  </>
}
