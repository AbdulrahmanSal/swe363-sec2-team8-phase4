/**
 * Mock data for the Phase 4 front-end (T05).
 * Same records as the Phase 3 prototype, so the walkthroughs in the requirements report still work.
 *
 * Dates are generated relative to today, so "upcoming" events and offers stay upcoming
 * whenever the app is opened. Call createSeedData() to get a fresh copy.
 *
 * Pages never import this file directly — read and change data through useData() and useAuth().
 *
 * ─── Record shapes ───────────────────────────────────────────────────────────────
 * users          { id, name, email, password, role: 'visitor'|'vendor'|'admin', club, vendorId? }
 *                  club = '' for normal visitors, or the club name for club representatives
 * vendors        { id, name, type: 'restaurant'|'barber'|'laundry'|'store', category, description,
 *                  location, contact, phone, status: 'Pending'|'Active'|'Suspended'|'Archived',
 *                  operating: 'Open'|'Closed', hours: [{ day, open, close, closed }] (Sunday first) }
 * categories     ['Restaurants', ...]  (names; a vendor's `category` holds one of them)
 * offerings      { id, vendorId, name, description, price: number|null, available }
 * offers         { id, vendorId, title, description, start, end, removed, removedReason? }
 * announcements  { id, title, message, publication, removed }
 * matches        { id, team1, team2, start, location, publication, removed }
 * events         { id, owner, club, title, description, location, start, end,
 *                  status: 'Pending review'|'Approved'|'Rejected', reason, created }
 * requests       common: { id, type: 'restaurant'|'barber'|'laundry', vendorId, owner, status, created,
 *                          history: [{ status, at, actor, reason }] }
 *                restaurant: items [{ id, name, price, qty }], total   (name and price copied at order time)
 *                barber:     service, serviceId, price, slot
 *                laundry:    service, serviceId, location, preferred, confirmed?, notes
 * activity       [{ at, text }] newest first (admin dashboard)
 * ─────────────────────────────────────────────────────────────────────────────────
 */
import { DAYS, dt, stamp } from '../utils/format.js'

const DEMO_PASSWORD = 'Demo1234'

const defaultHours = () => DAYS.map((day) => ({ day, open: '10:00', close: '22:00', closed: false }))

/** Build one history entry. */
const hist = (status, actor = 'System', reason = '') => ({ status, at: stamp(), actor, reason })

export function createSeedData() {
  const users = [
    { id: 'u1', name: 'Ahmed Al Omar', email: 'visitor@demo.test', password: DEMO_PASSWORD, role: 'visitor', club: '' },
    { id: 'u2', name: 'Sara Al Ali', email: 'club@demo.test', password: DEMO_PASSWORD, role: 'visitor', club: 'Computing Club' },
    { id: 'a1', name: 'Mall Administrator', email: 'admin@demo.test', password: DEMO_PASSWORD, role: 'admin', club: '' },
  ]

  const vendors = [
    { id: 'v1', name: 'Campus Bites', type: 'restaurant', category: 'Restaurants', description: 'Sandwiches, snacks, and drinks prepared for pickup.', location: 'Ground floor, Shop 12', contact: 'bites@demo.test', phone: '0500000012', status: 'Active', operating: 'Open', hours: defaultHours() },
    { id: 'v2', name: 'Palm Coffee', type: 'restaurant', category: 'Restaurants', description: 'Coffee, pastries, and light snacks.', location: 'Ground floor, Shop 8', contact: 'coffee@demo.test', phone: '0500000008', status: 'Active', operating: 'Open', hours: defaultHours() },
    { id: 'v3', name: 'Campus Barber', type: 'barber', category: 'Barbershops', description: 'Haircuts and grooming by appointment.', location: 'First floor, Shop 21', contact: 'barber@demo.test', phone: '0500000021', status: 'Active', operating: 'Open', hours: defaultHours() },
    { id: 'v4', name: 'Fresh Laundry', type: 'laundry', category: 'Laundry', description: 'Laundry collection and cleaning for the campus community.', location: 'Ground floor, Shop 4', contact: 'laundry@demo.test', phone: '0500000004', status: 'Active', operating: 'Open', hours: defaultHours() },
    { id: 'v5', name: 'Campus Essentials', type: 'store', category: 'Stores', description: 'Stationery and everyday essentials.', location: 'First floor, Shop 19', contact: 'store@demo.test', phone: '0500000019', status: 'Active', operating: 'Open', hours: defaultHours() },
    { id: 'v6', name: 'New Snack Corner', type: 'restaurant', category: 'Restaurants', description: 'New vendor awaiting administrator approval.', location: 'Ground floor, Shop 16', contact: 'snacks@demo.test', phone: '', status: 'Pending', operating: 'Closed', hours: defaultHours() },
    { id: 'v7', name: 'Former Cafe', type: 'restaurant', category: 'Restaurants', description: 'Demo suspended business.', location: 'Ground floor, Shop 2', contact: 'former@demo.test', phone: '', status: 'Suspended', operating: 'Closed', hours: defaultHours() },
  ]

  // One representative account per vendor: v1@demo.test, v2@demo.test, ...
  vendors.forEach((v) =>
    users.push({
      id: `user-${v.id}`,
      name: `${v.name} Representative`,
      email: `${v.id}@demo.test`,
      password: DEMO_PASSWORD,
      role: 'vendor',
      vendorId: v.id,
      club: '',
    }),
  )

  const offerings = [
    { id: 'o1', vendorId: 'v1', name: 'Chicken sandwich', description: 'Grilled chicken with salad.', price: 15, available: true },
    { id: 'o2', vendorId: 'v1', name: 'Veggie wrap', description: 'Vegetables and hummus.', price: 12, available: true },
    { id: 'o3', vendorId: 'v1', name: 'Fresh orange juice', description: 'Freshly squeezed orange juice.', price: 8, available: false },
    { id: 'o4', vendorId: 'v2', name: 'Cappuccino', description: 'Espresso with steamed milk.', price: 12, available: true },
    { id: 'o5', vendorId: 'v2', name: 'Plain croissant', description: 'Freshly baked pastry.', price: 9, available: true },
    { id: 'o6', vendorId: 'v3', name: 'Haircut', description: 'Standard haircut. One 30-minute slot.', price: 30, available: true },
    { id: 'o7', vendorId: 'v3', name: 'Beard trim', description: 'Beard shaping. One 30-minute slot.', price: 15, available: true },
    { id: 'o8', vendorId: 'v4', name: 'Wash and fold', description: 'Listed rate per kg; final amount confirmed offline.', price: 8, available: true },
    { id: 'o9', vendorId: 'v4', name: 'Dry cleaning', description: 'Prices depend on item; confirm with the vendor.', price: null, available: true },
    { id: 'o10', vendorId: 'v5', name: 'A4 notebook', description: 'Stationery available in store.', price: 10, available: true },
  ]

  const offers = [
    { id: 'f1', vendorId: 'v1', title: 'Sandwich and drink offer', description: 'Ask for the sandwich and drink promotion when collecting. Promotional item prices are managed separately.', start: dt(-1), end: dt(7), removed: false },
    { id: 'f2', vendorId: 'v2', title: 'Coffee morning', description: 'Upcoming coffee promotion. Ask the vendor for details.', start: dt(2, '08:00'), end: dt(5, '12:00'), removed: false },
    { id: 'f3', vendorId: 'v4', title: 'Last week laundry offer', description: 'Expired sample offer.', start: dt(-10), end: dt(-3), removed: false },
  ]

  const events = [
    { id: 'e1', owner: 'u2', club: 'Computing Club', title: 'Web development meetup', description: 'A casual student meetup on building useful campus applications.', location: 'Mall seating area', start: dt(3, '18:00'), end: dt(3, '19:30'), status: 'Approved', reason: '', created: stamp() },
    { id: 'e2', owner: 'u2', club: 'Computing Club', title: 'Project showcase', description: 'Share your semester project with students and faculty.', location: 'Central mall area', start: dt(5, '18:00'), end: dt(5, '20:00'), status: 'Pending review', reason: '', created: stamp() },
    { id: 'e3', owner: 'u2', club: 'Computing Club', title: 'Late night workshop', description: 'A sample rejected submission.', location: 'Mall seating area', start: dt(7, '23:00'), end: dt(8, '01:00'), status: 'Rejected', reason: 'Please choose a time within mall opening hours.', created: stamp() },
  ]

  const announcements = [
    { id: 'n1', title: 'Welcome to KFUPM Mall Hub', message: 'Find businesses, discover activities, and request selected mall services in one place.', publication: dt(-1, '09:00'), removed: false },
    { id: 'n2', title: 'Weekend maintenance notice', message: 'A sample scheduled announcement.', publication: dt(2, '09:00'), removed: false },
  ]

  const matches = [
    { id: 'm1', team1: 'Campus Team A', team2: 'Campus Team B', start: dt(2, '19:30'), location: 'Central mall screen', publication: dt(-1, '10:00'), removed: false },
  ]

  const requests = [
    { id: 'ORD-1001', type: 'restaurant', vendorId: 'v1', owner: 'u1', status: 'Pending', created: stamp(), items: [{ id: 'o1', name: 'Chicken sandwich', price: 15, qty: 2 }], total: 30, history: [hist('Pending', 'Ahmed Al Omar')] },
    { id: 'ORD-1002', type: 'restaurant', vendorId: 'v1', owner: 'u2', status: 'Ready for pickup', created: stamp(), items: [{ id: 'o2', name: 'Veggie wrap', price: 12, qty: 1 }], total: 12, history: [hist('Pending', 'Sara Al Ali'), hist('Preparing', 'Campus Bites Representative'), hist('Ready for pickup', 'Campus Bites Representative')] },
    { id: 'APT-1003', type: 'barber', vendorId: 'v3', owner: 'u1', status: 'Accepted', created: stamp(), service: 'Haircut', serviceId: 'o6', price: 30, slot: dt(1, '14:00'), history: [hist('Pending', 'Ahmed Al Omar'), hist('Accepted', 'Campus Barber Representative')] },
    { id: 'LND-1004', type: 'laundry', vendorId: 'v4', owner: 'u1', status: 'Cleaning', created: stamp(), service: 'Wash and fold', serviceId: 'o8', location: 'Building 22, reception', preferred: dt(-1, '12:00'), confirmed: dt(-1, '12:30'), notes: 'Call at reception.', history: [hist('Pending', 'Ahmed Al Omar'), hist('Scheduled', 'Fresh Laundry Representative'), hist('Collected', 'Fresh Laundry Representative'), hist('Cleaning', 'Fresh Laundry Representative')] },
    { id: 'LND-1005', type: 'laundry', vendorId: 'v4', owner: 'u2', status: 'Pending', created: stamp(), service: 'Dry cleaning', serviceId: 'o9', location: 'Building 10, lobby', preferred: dt(1, '16:00'), notes: 'Two jackets.', history: [hist('Pending', 'Sara Al Ali')] },
    { id: 'ORD-1006', type: 'restaurant', vendorId: 'v2', owner: 'u1', status: 'Completed', created: stamp(), items: [{ id: 'o4', name: 'Cappuccino', price: 12, qty: 1 }], total: 12, history: [hist('Pending'), hist('Preparing'), hist('Ready for pickup'), hist('Completed')] },
    { id: 'APT-1007', type: 'barber', vendorId: 'v3', owner: 'u2', status: 'Cancelled', created: stamp(), service: 'Beard trim', serviceId: 'o7', price: 15, slot: dt(2, '14:00'), history: [hist('Pending'), hist('Cancelled', 'Sara Al Ali', 'Plans changed.')] },
  ]

  return {
    version: 1,
    users,
    vendors,
    categories: ['Restaurants', 'Barbershops', 'Laundry', 'Stores'],
    offerings,
    offers,
    events,
    announcements,
    matches,
    requests,
    activity: [{ at: stamp(), text: 'Demo data initialized' }],
  }
}

/** Demo accounts shown on the login screen and in the demo account switcher. */
export const DEMO_ACCOUNTS = [
  { email: 'visitor@demo.test', label: 'Visitor — Ahmed' },
  { email: 'club@demo.test', label: 'Visitor + club rep. — Sara' },
  { email: 'v1@demo.test', label: 'Vendor — Campus Bites (restaurant)' },
  { email: 'v3@demo.test', label: 'Vendor — Campus Barber' },
  { email: 'v4@demo.test', label: 'Vendor — Fresh Laundry' },
  { email: 'v5@demo.test', label: 'Vendor — Campus Essentials (store)' },
  { email: 'admin@demo.test', label: 'Administrator' },
]

export { DEMO_PASSWORD }
