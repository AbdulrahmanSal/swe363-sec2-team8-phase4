import { describe, it, expect } from 'vitest'
import { createSeedData } from '../src/data/mockData.js'
import { bookAppointment, rescheduleAppointment, requestLaundry } from '../src/data/requestService.js'
import { slotsFor } from '../src/utils/booking.js'
import { dt, riyadhDate } from '../src/utils/format.js'

const setup = () => { const data = createSeedData(); return { data, user: data.users.find(u => u.id === 'u1'), barber: data.vendors.find(v => v.id === 'v3') } }
describe('request rules across business types and availability changes', () => {
  it('holds a Pending barber slot immediately and rejects a second booking', () => {
    const { data, user, barber } = setup()
    const slot = slotsFor(barber, riyadhDate(2))[0]
    const first = bookAppointment(data, { user, vendorId: barber.id, serviceId: 'o6', slot })
    expect(first.ok).toBe(true)
    const second = bookAppointment(first.data, { user, vendorId: barber.id, serviceId: 'o6', slot })
    expect(second.ok).toBe(false)
    expect(first.data.requests.filter(r => r.slot === slot)).toHaveLength(1)
  })
  it('preserves the original appointment when a reschedule conflicts', () => {
    const { data, user } = setup()
    const original = data.requests.find(r => r.id === 'APT-1003')
    data.requests.push({ ...original, id: 'APT-9999', slot: dt(2, '14:00') })
    const result = rescheduleAppointment(data, { user, requestId: original.id, slot: dt(2, '14:00') })
    expect(result.ok).toBe(false)
    expect(data.requests.find(r => r.id === original.id)).toEqual(original)
  })
  it('rejects a reschedule when the business becomes closed or suspended', () => {
    for (const change of [{ isOpen: false }, { accountStatus: 'suspended' }]) {
      const { data, user, barber } = setup()
      Object.assign(barber, change)
      expect(rescheduleAppointment(data, { user, requestId: 'APT-1003', slot: dt(2, '15:00') }).ok).toBe(false)
    }
  })
  it('rejects barber bookings at a restaurant and laundry requests at a barber', () => {
    const { data, user } = setup()
    expect(bookAppointment(data, { user, vendorId: 'v1', serviceId: 'o1', slot: dt(2, '15:00') }).ok).toBe(false)
    expect(requestLaundry(data, { user, vendorId: 'v3', serviceId: 'o6', pickupLocation: 'Reception', preferredAt: dt(2, '15:00') }).ok).toBe(false)
  })
  it('returns field errors for malformed slot strings without throwing', () => {
    const { data, user } = setup()
    const result = bookAppointment(data, { user, vendorId: 'v3', serviceId: 'o6', slot: 'invalid' })
    expect(result.ok).toBe(false)
    expect(result.errors.slot).toBeTruthy()
  })
})
