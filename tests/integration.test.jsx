import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import App from '../src/App.jsx'
import { DataProvider } from '../src/context/DataContext.jsx'
import { AuthProvider } from '../src/context/AuthContext.jsx'
import { ToastProvider } from '../src/components/common/Toast.jsx'

const saved = () => JSON.parse(localStorage.getItem('mallhub-demo'))
function open(path, userId) {
  if (userId) localStorage.setItem('mallhub-session', userId)
  else localStorage.removeItem('mallhub-session')
  window.history.replaceState({}, '', path)
  return render(<BrowserRouter><DataProvider><AuthProvider><ToastProvider><App /></ToastProvider></AuthProvider></DataProvider></BrowserRouter>)
}
const click = (user, name, scope = screen) => user.click(scope.getByRole('button', { name, exact: true }))

// These use the actual App, DataContext, AuthContext and admin adapter together.
// The earlier admin tests exercise a separate harness; this suite checks the merged application.
describe('combined app workflows', () => {
  it('carries a restaurant order through vendor progress and back to the visitor', async () => {
    const user = userEvent.setup()
    let app = open('/vendors/v1/order', 'u1')
    await click(user, 'Add one Chicken sandwich')
    await click(user, 'Review order')
    await click(user, 'Submit order', within(screen.getByRole('dialog')))
    await screen.findByRole('heading', { name: 'Order submitted' })
    const order = saved().requests.find(item => item.id === 'ORD-1008')
    expect(order.total).toBe(15)
    expect(order.visitorId).toBe('u1')
    app.unmount()
    app = open(`/vendor/requests/${order.id}`, 'user-v1')
    for (const [label, status] of [['Accept request', 'Preparing'], ['Mark Ready for pickup', 'Ready for pickup'], ['Mark Completed', 'Completed']]) {
      await click(user, label)
      await click(user, label, within(screen.getByRole('dialog')))
      await waitFor(() => expect(saved().requests.find(item => item.id === order.id).status).toBe(status))
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    }
    expect(saved().requests.find(item => item.id === order.id).history).toHaveLength(4)
    app.unmount()
    open(`/requests/${order.id}`, 'u1')
    expect(screen.getByText('This request is closed and can no longer change.')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Cancel request' })).toBeNull()
  })

  it('keeps vendor offering changes visible publicly without rewriting old orders', async () => {
    const user = userEvent.setup()
    const app = open('/vendor/offerings', 'user-v1')
    await user.click(screen.getByRole('button', { name: 'Edit Chicken sandwich' }))
    const dialog = within(screen.getByRole('dialog'))
    await user.clear(dialog.getByLabelText('Listed price in SAR', { exact: false }))
    await user.type(dialog.getByLabelText('Listed price in SAR', { exact: false }), '19')
    await click(user, 'Save offering', dialog)
    await waitFor(() => expect(saved().offerings.find(item => item.id === 'o1').price).toBe(19))
    expect(saved().requests.find(item => item.id === 'ORD-1001').items[0].price).toBe(15)
    app.unmount()
    open('/vendors/v1', null)
    expect(screen.getByText('SAR 19.00')).toBeTruthy()
  })

  it('publishes a club submission through the real admin adapter into the public feed', async () => {
    const user = userEvent.setup()
    let app = open('/club-events', 'u2')
    await click(user, 'New submission')
    const form = within(screen.getByRole('dialog'))
    await user.type(form.getByLabelText('Event title', { exact: false }), 'Resubmission meetup')
    await user.type(form.getByLabelText('Description', { exact: false }), 'A new campus event for integration testing.')
    await user.type(form.getByLabelText('Location', { exact: false }), 'Mall central area')
    await click(user, 'Submit for review', form)
    await waitFor(() => expect(saved().events.find(item => item.title === 'Resubmission meetup')?.status).toBe('pending'))
    const event = saved().events.find(item => item.title === 'Resubmission meetup')
    app.unmount()
    app = open('/admin/events', 'a1')
    const row = screen.getByText('Resubmission meetup').closest('tr')
    await click(user, 'Review / Edit', within(row))
    await click(user, 'Approve event', within(screen.getByRole('dialog')))
    await waitFor(() => expect(saved().events.find(item => item.id === event.id).status).toBe('approved'))
    app.unmount()
    open('/', null)
    expect(screen.getByRole('heading', { name: 'Resubmission meetup' })).toBeTruthy()
  })

  it('rejects access to another visitor request and prevents vendor access to admin pages', () => {
    const app = open('/requests/ORD-1002', 'u1')
    expect(screen.getByRole('heading', { name: 'Request not found' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Cancel request' })).toBeNull()
    app.unmount()
    open('/admin/vendors', 'user-v1')
    expect(screen.getByRole('heading', { name: 'Access restricted' })).toBeTruthy()
  })

  it('requires a future confirmed laundry pickup time and saves it for the visitor', async () => {
    const user = userEvent.setup()
    const app = open('/vendor/requests/LAU-1005', 'user-v4')
    await click(user, 'Accept request')
    const dialog = within(screen.getByRole('dialog'))
    const input = dialog.getByLabelText('Confirmed pickup date and time', { exact: false })
    await user.clear(input)
    await click(user, 'Accept and schedule', dialog)
    await screen.findByText('Choose the confirmed pickup time.')
    expect(saved().requests.find(item => item.id === 'LAU-1005').status).toBe('Pending')
    // Native datetime-local values need no keyboard formatting in different browsers.
    const { fireEvent } = await import('@testing-library/react')
    const future = new Date(Date.now() + 86400000 + 3 * 3600000).toISOString().slice(0, 16)
    fireEvent.change(input, { target: { value: future } })
    await click(user, 'Accept and schedule', dialog)
    await waitFor(() => expect(saved().requests.find(item => item.id === 'LAU-1005').status).toBe('Scheduled'))
    expect(saved().requests.find(item => item.id === 'LAU-1005').confirmedAt).toBeTruthy()
    app.unmount()
    open('/requests/LAU-1005', 'u2')
    expect(screen.queryByText('Awaiting vendor confirmation')).toBeNull()
  })
})
