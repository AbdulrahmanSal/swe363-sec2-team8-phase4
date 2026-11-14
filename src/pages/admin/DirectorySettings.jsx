import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { uid } from '../../utils/format.js'
import useToastMessage from '../vendor/useToastMessage.js'
import { AccessRestricted, ConfirmDialog, EmptyState, ErrorSummary, FormField, Modal, PageHeader, Toast } from '../vendor/VendorUi.jsx'
import { validateCategory } from '../vendor/vendorUtils.js'
import '../vendor/vendor.css'

/** S19 · Directory settings (ADM03) */
export default function DirectorySettings() {
  const { user, role } = useAuth()
  const { data, add, update, remove, logActivity } = useData()
  const [editing, setEditing] = useState(null) // null | 'new' | category record
  const [removing, setRemoving] = useState(null)
  const [toast, showToast] = useToastMessage()

  if (role !== 'admin') {
    return <AccessRestricted message="Only the mall administrator can manage directory categories." />
  }

  const vendorCount = (categoryId) => data.vendors.filter((v) => v.categoryId === categoryId).length

  function saveCategory(name) {
    const clean = name.trim()
    if (editing === 'new') {
      add('categories', { id: uid('c'), name: clean })
      logActivity(`Category added: ${clean}`, user.name)
    } else {
      // Vendors point at the category id, so renaming updates every vendor at once.
      update('categories', editing.id, { name: clean })
      logActivity(`Category renamed: ${editing.name} → ${clean}`, user.name)
    }
    setEditing(null)
    showToast('Category saved.')
  }

  function removeCategory(category) {
    remove('categories', category.id)
    logActivity(`Category removed: ${category.name}`, user.name)
    showToast('Category removed.')
  }

  return (
    <section>
      <PageHeader
        id="S19"
        screenName="Directory settings"
        eyebrow="Administration"
        title="Directory settings"
        subtitle="Manage category labels. Vendor locations and other profile fields are edited in Vendor management."
        actions={
          <button type="button" className="primary" onClick={() => setEditing('new')}>
            Add category
          </button>
        }
      />

      <section className="panel">
        {data.categories.length ? (
          <div className="tablewrap vd-table">
            <table>
              <caption className="visuallyhidden">Directory categories</caption>
              <thead>
                <tr>
                  <th scope="col">Category</th>
                  <th scope="col">Assigned vendors</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.categories.map((c) => (
                  <tr key={c.id}>
                    <td data-label="Category">
                      <span className="vd-cellmain">{c.name}</span>
                    </td>
                    <td data-label="Assigned vendors">{vendorCount(c.id)}</td>
                    <td data-label="Actions">
                      <div className="vd-actions">
                        <button type="button" className="small" onClick={() => setEditing(c)} aria-label={`Edit ${c.name}`}>
                          Edit
                        </button>
                        <button type="button" className="small danger" onClick={() => setRemoving(c)} aria-label={`Remove ${c.name}`}>
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No categories" message="Add a category so vendors can be grouped in the directory." />
        )}

        <div className="notice sectiongap">
          Categories organize search results. Business type controls restaurant, barber, laundry, or informational store workflows.
        </div>
        <Link className="button" to="/admin/vendors">
          Edit vendor information
        </Link>
      </section>

      {editing && (
        <CategoryForm
          category={editing === 'new' ? null : editing}
          categories={data.categories}
          onSave={saveCategory}
          onClose={() => setEditing(null)}
        />
      )}

      {removing && vendorCount(removing.id) > 0 && (
        <Modal title="Category in use" onClose={() => setRemoving(null)}>
          <div className="errorbox" role="alert">
            {removing.name} cannot be removed while {vendorCount(removing.id)}{' '}
            {vendorCount(removing.id) === 1 ? 'vendor uses' : 'vendors use'} it. Move those vendors to another category first.
          </div>
          <div className="actions">
            <button type="button" onClick={() => setRemoving(null)}>
              Close
            </button>
            <Link className="button primary" to="/admin/vendors">
              Vendor management
            </Link>
          </div>
        </Modal>
      )}
      {removing && vendorCount(removing.id) === 0 && (
        <ConfirmDialog
          title="Remove category"
          message={`Remove ${removing.name}? It will no longer appear in the directory filter.`}
          confirmLabel="Remove"
          danger
          onConfirm={() => removeCategory(removing)}
          onClose={() => setRemoving(null)}
        />
      )}
      <Toast message={toast} />
    </section>
  )
}

function CategoryForm({ category, categories, onSave, onClose }) {
  const [name, setName] = useState(category?.name ?? '')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  function submit(e) {
    e.preventDefault()
    const found = validateCategory(name, categories, category?.id ?? null)
    setErrors(found)
    if (Object.keys(found).length) return
    setSaving(true)
    onSave(name)
  }

  return (
    <Modal title={category ? 'Edit category' : 'Add category'} onClose={onClose} busy={saving}>
      <form onSubmit={submit} noValidate>
        <ErrorSummary errors={errors} />
        <FormField label="Category name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
        <div className="actions">
          <button type="button" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save category'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
