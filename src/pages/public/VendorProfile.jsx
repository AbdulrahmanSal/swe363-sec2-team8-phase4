import { Link, useParams } from 'react-router-dom'
import { useData } from '../../context/DataContext.jsx'
import useNow from '../../hooks/useNow.js'
import { fmt, money } from '../../utils/format.js'
import { isActiveOffer } from '../../utils/publicContent.js'
import { PageHeader, StatusBadge, EmptyState } from '../../components/common/index.js'
/** S05/S05b–d · VIS03. All four business types share the profile layout. */
export default function VendorProfile() {
  const { vendorId } = useParams()
  const { data } = useData()
  const now = useNow()
  const vendor = data.vendors.find(item => item.id === vendorId)
  if (!vendor) return <><PageHeader id="S05" title="Business unavailable" /><EmptyState title="Business not found" message="This business could not be found. Browse another business." action={<Link className="button" to="/directory">Back to directory</Link>} /></>
  const offerings = data.offerings.filter(item => item.vendorId === vendor.id && !item.removed)
  const category = data.categories.find(item => item.id === vendor.categoryId)?.name ?? ''
  const offers = data.offers.filter(item => item.vendorId === vendor.id && vendor.accountStatus === 'active' && isActiveOffer(item, now))
  const action = { restaurant: ['Start pickup order', 'order'], barber: ['Book appointment', 'book'], laundry: ['Request laundry pickup', 'laundry'] }[vendor.type]
  const blockedReason = vendor.accountStatus !== 'active' ? `This business is ${vendor.accountStatus} and is not accepting new requests.` : !vendor.isOpen ? 'This business is closed and is not accepting new requests.' : ''
  return <><PageHeader id="S05" screenName="Public vendor profile" title={vendor.name} subtitle={category} actions={<Link className="button small" to="/directory">← Directory</Link>} />
    <section className="panel"><div className="vendorhero"><div className="placeholder" aria-hidden="true">IMAGE</div><div><div className="row"><StatusBadge status={vendor.isOpen ? 'Open' : 'Closed'} />{vendor.accountStatus !== 'active' && <StatusBadge status={vendor.accountStatus} />}<span className="tiny muted">{vendor.location}</span></div><p style={{ marginTop: 10 }}>{vendor.description}</p>
      {action ? blockedReason ? <><button type="button" className="primary" disabled aria-describedby="vendor-blocked">{action[0]}</button><p id="vendor-blocked" className="tiny muted sectiongap">{blockedReason}</p></> : <Link className="button primary" to={`/vendors/${vendor.id}/${action[1]}`}>{action[0]}</Link> : <p className="tiny muted">Browse offerings · Purchasing takes place in store</p>}
    </div></div></section>
    <div className="grid"><section className="panel"><h2>Business information</h2><dl className="info"><dt>Location</dt><dd>{vendor.location}</dd><dt>Contact</dt><dd><a href={`mailto:${vendor.email}`}>{vendor.email}</a>{vendor.phone && <><br /><a href={`tel:${vendor.phone}`}>{vendor.phone}</a></>}</dd><dt>Hours</dt><dd>{vendor.weeklyHours.map(day => <div key={day.day}>{day.day}: {day.closed ? 'Closed' : `${day.open}–${day.close}`}</div>)}</dd></dl><p className="tiny muted">Open/Closed is set by the vendor; weekly hours are shown for planning. Times: Asia/Riyadh.</p></section>
      <section className="panel"><h2>{vendor.type === 'restaurant' ? 'Menu' : 'Offerings'}</h2>{offerings.length ? offerings.map(item => <div className="listitem" key={item.id}><div><strong>{item.name}</strong><div className="tiny muted">{item.description}</div></div><div className="stack">{item.price == null ? 'Quote offline' : money(item.price)}{!item.available && <StatusBadge status="Unavailable" />}</div></div>) : <EmptyState title="No offerings yet" message="This vendor has not listed offerings." />}</section></div>
    <section className="panel"><h2>Current offers</h2>{offers.length ? offers.map(offer => <div className="listitem" key={offer.id}><div><strong>{offer.title}</strong><p className="tiny muted" style={{ margin: '4px 0' }}>{offer.description}</p><span className="tiny">Until {fmt(offer.endAt)}</span></div></div>) : <p className="muted">No active offers.</p>}</section>
  </>
}
