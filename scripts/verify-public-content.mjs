import assert from 'node:assert/strict'
import { createSeedData } from '../src/data/mockData.js'
import { getFeedItems, isActiveOffer } from '../src/utils/publicContent.js'
import { ms } from '../src/utils/format.js'

// Boundary checks for published/active feed content, including Riyadh-local date strings.
const now = ms('2026-11-14T12:00')
const data = createSeedData()
data.announcements = [
  { id: 'published', publication: '2026-11-14T12:00' },
  { id: 'scheduled', publication: '2026-11-14T12:01' },
  { id: 'removed', publication: '2026-11-14T11:00', removed: true },
]
data.events = [
  { id: 'approved', status: 'Approved', start: '2026-11-15T10:00', end: '2026-11-15T11:00' },
  { id: 'pending', status: 'Pending review', start: '2026-11-15T10:00', end: '2026-11-15T11:00' },
  { id: 'ended', status: 'Approved', start: '2026-11-14T10:00', end: '2026-11-14T12:00' },
]
data.matches = []
data.offers = [
  { id: 'active-offer', vendorId: 'v1', start: '2026-11-14T12:00', end: '2026-11-14T13:00' },
  { id: 'expired-offer', vendorId: 'v1', start: '2026-11-14T10:00', end: '2026-11-14T12:00' },
  { id: 'inactive-business', vendorId: 'v7', start: '2026-11-14T10:00', end: '2026-11-14T13:00' },
]
assert.deepEqual(new Set(getFeedItems(data, now).map(item => item.id)), new Set(['published', 'approved', 'active-offer']))
assert.equal(isActiveOffer(data.offers[0], now), true)
assert.equal(isActiveOffer(data.offers[1], now), false)
assert.equal(ms('2026-11-14T12:00'), Date.parse('2026-11-14T09:00:00Z'))
console.log('PASS: feed publication boundaries, approval, expiry, vendor eligibility, Riyadh dates')
