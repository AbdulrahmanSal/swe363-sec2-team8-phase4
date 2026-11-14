import { useState } from 'react'
import { PageHeader, Modal, ConfirmDialog, SuccessModal, FormField, ErrorSummary, StatusBadge, EmptyState, FilterChips, DataTable, useToast } from '../components/common/index.js'
/** T09: a live example of every shared component for the team. */
export default function ComponentsDemo() {
  const [dialog, setDialog] = useState('')
  const [chip, setChip] = useState('All')
  const toast = useToast()
  return <><PageHeader id="T09" title="Shared components" subtitle="Reusable interface components and live examples for the team." />
    <section className="panel"><h2>Dialogs and feedback</h2><div className="row">
      <button onClick={() => setDialog('modal')}>Open modal</button><button onClick={() => setDialog('confirm')}>Confirm with reason</button><button onClick={() => setDialog('success')}>Success modal</button><button onClick={() => toast('Changes saved.')}>Show toast</button><StatusBadge status="Pending" />
    </div></section>
    <section className="panel"><h2>Forms and filters</h2><FormField label="Example name" defaultValue="Ahmed" help="An associated label and help text." /><FormField label="Example field with error" error="Enter a value." /><ErrorSummary errors={{ name: 'Name is required.' }} /><FilterChips options={['All', 'Open', 'Closed']} value={chip} onChange={setChip} /></section>
    <DataTable caption="Example businesses" columns={[{ key: 'name', label: 'Business' }, { key: 'status', label: 'Status', render: row => <StatusBadge status={row.status} /> }]} rows={[{ id: 1, name: 'Campus Bites', status: 'Open' }]} />
    <EmptyState title="No records" message="Try changing your filters." action={<button onClick={() => toast('Filters cleared.')}>Clear filters</button>} />
    <Modal open={dialog === 'modal'} title="Example modal" onClose={() => setDialog('')} actions={<button onClick={() => setDialog('')}>Close</button>}><p>Focus stays inside this dialog. Press Escape or click the backdrop to close.</p></Modal>
    <ConfirmDialog open={dialog === 'confirm'} title="Remove example?" message="A reason is required for this example." requireReason onClose={() => setDialog('')} onConfirm={reason => toast(`Confirmed: ${reason}`)} />
    <SuccessModal open={dialog === 'success'} message="Your request has been submitted." detailsTo="/directory" onClose={() => setDialog('')} />
  </>
}
