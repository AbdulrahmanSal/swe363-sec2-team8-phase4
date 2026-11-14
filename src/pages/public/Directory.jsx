import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext.jsx'
import { PageHeader, FormField, StatusBadge, EmptyState } from '../../components/common/index.js'
/** S04 · VIS02. Search and category filters combine, showing active businesses only. */
export default function Directory() {
  const { data } = useData()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const clear = () => { setSearch(''); setCategory('All') }
  const categoryName = vendor => data.categories.find(item => item.id === vendor.categoryId)?.name ?? ''
  const vendors = data.vendors.filter(vendor => vendor.accountStatus === 'active' && vendor.name.toLowerCase().includes(search.trim().toLowerCase()) && (category === 'All' || category === categoryName(vendor)))
  return <><PageHeader id="S04" title="Vendor directory" subtitle="Find a business and explore its offerings and available services." />
    <div className="filters"><FormField label="Search businesses" type="search" placeholder="Search by business name…" value={search} onChange={event => setSearch(event.target.value)} /><FormField label="Category" as="select" value={category} onChange={event => setCategory(event.target.value)} options={['All', ...data.categories.map(item => item.name)]} /><button type="button" className="small" onClick={clear}>Clear</button></div>
    <p className="tiny muted" role="status">{vendors.length} {vendors.length === 1 ? 'business' : 'businesses'} found</p>
    {vendors.length ? <div className="grid three">{vendors.map(vendor => <article className="card" key={vendor.id}><div className="placeholder" aria-hidden="true">BUSINESS IMAGE</div><div className="row between"><h2>{vendor.name}</h2><StatusBadge status={vendor.isOpen ? 'Open' : 'Closed'} /></div><p className="tiny muted">{categoryName(vendor)}</p><p>{vendor.description}</p><div className="cardfooter"><span className="tiny muted">{vendor.location}</span><Link to={`/vendors/${vendor.id}`} className="button small" aria-label={`View business: ${vendor.name}`}>View business</Link></div></article>)}</div> : <EmptyState title="No businesses found" message="Try a different name or category." action={<button type="button" onClick={clear}>Clear filters</button>} />}
  </>
}
