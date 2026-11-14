/**
 * Mock data for the Phase 4 front-end (T05).
 * Same records as the Phase 3 prototype, so the walkthroughs in the requirements report still work.
 * Field names follow the team task doc (the schema Ibrahim's admin screens were built on).
 *
 * Dates are generated relative to today, so "upcoming" events and offers stay upcoming
 * whenever the app is opened. Call createSeedData() to get a fresh copy.
 * Every date-time is an ISO string in UTC; show it with fmt() from utils/format.js.
 *
 * Pages never import this file directly — read and change data through useData() and useAuth().
 *
 * ─── Record shapes ───────────────────────────────────────────────────────────────
 * users          { id, name, email, password, role: 'visitor'|'vendor'|'admin', club, vendorId? }
 *                  club = '' for normal visitors, or the club name for club representatives
 * vendors        { id, name, type: 'restaurant'|'barber'|'laundry'|'store', categoryId, description,
 *                  location, email, phone, isOpen: boolean,
 *                  accountStatus: 'pending'|'active'|'suspended'|'archived',
 *                  weeklyHours: [{ day, open: 'HH:MM', close: 'HH:MM', closed }] (Sunday first) }
 * categories     { id, name }
 * offerings      { id, vendorId, name, description, price: number|null, available, removed }
 * offers         { id, vendorId, title, description, startAt, endAt, removed, removedReason }
 * announcements  { id, title, message, publishAt, removed }
 * matches        { id, teamA, teamB, matchAt, location, publishAt, removed }
 * events         { id, club, submittedBy, title, description, location, startAt, endAt,
 *                  status: 'pending'|'approved'|'rejected', rejectReason, createdAt }
 * requests       common: { id, type: 'restaurant'|'barber'|'laundry', vendorId, visitorId, status, createdAt,
 *                          history: [{ status, at, by, reason }] }
 *                restaurant: items [{ id, name, price, qty }], total   (name and price copied at order time)
 *                barber:     serviceId, serviceName, price, slot   (slot = ISO start of the 30-minute slot)
 *                laundry:    serviceId, serviceName, pickupLocation, preferredAt, confirmedAt, notes
 *                Request statuses keep their display spelling ('Pending', 'Ready for pickup', ...);
 *                the rules live in utils/requestStatus.js.
 * activity       { id, at, actor, text } newest first (admin dashboard)
 * ─────────────────────────────────────────────────────────────────────────────────
 */
import { DAYS, dt, stamp } from '../utils/format.js'

const DEMO_PASSWORD = 'Demo1234'

const defaultHours = () => DAYS.map((day) => ({ day, open: '10:00', close: '22:00', closed: false }))

/** One history entry. */
const hist = (status, by = 'System', reason = '') => ({ status, at: stamp(), by, reason })

export function createSeedData() {
  const users = [
    { id: 'u1', name: 'Ahmed Al Omar', email: 'visitor@demo.test', password: DEMO_PASSWORD, role: 'visitor', club: '' },
    { id: 'u2', name: 'Sara Al Ali', email: 'club@demo.test', password: DEMO_PASSWORD, role: 'visitor', club: 'Computing Club' },
    { id: 'a1', name: 'Mall Administrator', email: 'admin@demo.test', password: DEMO_PASSWORD, role: 'admin', club: '' },
  ]

  const categories = [
    { id: 'c1', name: 'Restaurants' },
    { id: 'c2', name: 'Barbershops' },
    { id: 'c3', name: 'Laundry' },
    { id: 'c4', name: 'Stores' },
  ]

  const vendors = [
    { id: 'v1', name: 'Campus Bites', type: 'restaurant', categoryId: 'c1', description: 'Sandwiches, snacks, and drinks prepared for pickup.', location: 'Ground floor, Shop 12', email: 'bites@demo.test', phone: '0500000012', accountStatus: 'active', isOpen: true },
    { id: 'v2', name: 'Palm Coffee', type: 'restaurant', categoryId: 'c1', description: 'Coffee, pastries, and light snacks.', location: 'Ground floor, Shop 8', email: 'coffee@demo.test', phone: '0500000008', accountStatus: 'active', isOpen: true },
    { id: 'v3', name: 'Campus Barber', type: 'barber', categoryId: 'c2', description: 'Haircuts and grooming by appointment.', location: 'First floor, Shop 21', email: 'barber@demo.test', phone: '0500000021', accountStatus: 'active', isOpen: true },
    { id: 'v4', name: 'Fresh Laundry', type: 'laundry', categoryId: 'c3', description: 'Laundry collection and cleaning for the campus community.', location: 'Ground floor, Shop 4', email: 'laundry@demo.test', phone: '0500000004', accountStatus: 'active', isOpen: true },
    { id: 'v5', name: 'Campus Essentials', type: 'store', categoryId: 'c4', description: 'Stationery and everyday essentials.', location: 'First floor, Shop 19', email: 'store@demo.test', phone: '0500000019', accountStatus: 'active', isOpen: true },
    { id: 'v6', name: 'New Snack Corner', type: 'restaurant', categoryId: 'c1', description: 'New vendor awaiting administrator approval.', location: 'Ground floor, Shop 16', email: 'snacks@demo.test', phone: '', accountStatus: 'pending', isOpen: false },
    { id: 'v7', name: 'Former Cafe', type: 'restaurant', categoryId: 'c1', description: 'Business account temporarily suspended.', location: 'Ground floor, Shop 2', email: 'former@demo.test', phone: '', accountStatus: 'suspended', isOpen: false },
  ].map((v) => ({ ...v, weeklyHours: defaultHours() }))

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
  ].map((o) => ({ ...o, removed: false }))

  const offers = [
    { id: 'f1', vendorId: 'v1', title: 'Sandwich and drink offer', description: 'Ask for the sandwich and drink promotion when collecting. Promotional item prices are managed separately.', startAt: dt(-1), endAt: dt(7), removed: false, removedReason: '' },
    { id: 'f2', vendorId: 'v2', title: 'Coffee morning', description: 'Upcoming coffee promotion. Ask the vendor for details.', startAt: dt(2, '08:00'), endAt: dt(5, '12:00'), removed: false, removedReason: '' },
    { id: 'f3', vendorId: 'v4', title: 'Last week laundry offer', description: 'Expired sample offer.', startAt: dt(-10), endAt: dt(-3), removed: false, removedReason: '' },
    { id: 'f4', vendorId: 'v3', title: 'Grooming promotion', description: 'A sample offer removed by the administrator.', startAt: dt(-2), endAt: dt(5), removed: true, removedReason: 'The advertised service details were incomplete.' },
  ]

  const events = [
    { id: 'e1', club: 'Computing Club', submittedBy: 'u2', title: 'Web development meetup', description: 'A casual student meetup on building useful campus applications.', location: 'Mall seating area', startAt: dt(3, '18:00'), endAt: dt(3, '19:30'), status: 'approved', rejectReason: '', createdAt: stamp() },
    { id: 'e2', club: 'Computing Club', submittedBy: 'u2', title: 'Project showcase', description: 'Share your semester project with students and faculty.', location: 'Central mall area', startAt: dt(5, '18:00'), endAt: dt(5, '20:00'), status: 'pending', rejectReason: '', createdAt: stamp() },
    { id: 'e3', club: 'Computing Club', submittedBy: 'u2', title: 'Late night workshop', description: 'A sample rejected submission.', location: 'Mall seating area', startAt: dt(7, '22:00'), endAt: dt(7, '23:30'), status: 'rejected', rejectReason: 'Please choose a time within mall opening hours.', createdAt: stamp() },
  ]

  const announcements = [
    { id: 'n1', title: 'Welcome to KFUPM Mall Hub', message: 'Find businesses, discover activities, and request selected mall services in one place.', publishAt: dt(-1, '09:00'), removed: false },
    { id: 'n2', title: 'Weekend maintenance notice', message: 'A sample scheduled announcement.', publishAt: dt(2, '09:00'), removed: false },
  ]

  const matches = [
    { id: 'm1', teamA: 'Campus Team A', teamB: 'Campus Team B', matchAt: dt(2, '19:30'), location: 'Central mall screen', publishAt: dt(-1, '10:00'), removed: false },
  ]

  const requests = [
    { id: 'ORD-1001', type: 'restaurant', vendorId: 'v1', visitorId: 'u1', status: 'Pending', createdAt: stamp(), items: [{ id: 'o1', name: 'Chicken sandwich', price: 15, qty: 2 }], total: 30, history: [hist('Pending', 'Ahmed Al Omar')] },
    { id: 'ORD-1002', type: 'restaurant', vendorId: 'v1', visitorId: 'u2', status: 'Ready for pickup', createdAt: stamp(), items: [{ id: 'o2', name: 'Veggie wrap', price: 12, qty: 1 }], total: 12, history: [hist('Pending', 'Sara Al Ali'), hist('Preparing', 'Campus Bites Representative'), hist('Ready for pickup', 'Campus Bites Representative')] },
    { id: 'APT-1003', type: 'barber', vendorId: 'v3', visitorId: 'u1', status: 'Accepted', createdAt: stamp(), serviceId: 'o6', serviceName: 'Haircut', price: 30, slot: dt(1, '14:00'), history: [hist('Pending', 'Ahmed Al Omar'), hist('Accepted', 'Campus Barber Representative')] },
    { id: 'LAU-1004', type: 'laundry', vendorId: 'v4', visitorId: 'u1', status: 'Cleaning', createdAt: stamp(), serviceId: 'o8', serviceName: 'Wash and fold', pickupLocation: 'Building 22, reception', preferredAt: dt(-1, '12:00'), confirmedAt: dt(-1, '12:30'), notes: 'Call at reception.', history: [hist('Pending', 'Ahmed Al Omar'), hist('Scheduled', 'Fresh Laundry Representative'), hist('Collected', 'Fresh Laundry Representative'), hist('Cleaning', 'Fresh Laundry Representative')] },
    { id: 'LAU-1005', type: 'laundry', vendorId: 'v4', visitorId: 'u2', status: 'Pending', createdAt: stamp(), serviceId: 'o9', serviceName: 'Dry cleaning', pickupLocation: 'Building 10, lobby', preferredAt: dt(1, '16:00'), confirmedAt: null, notes: 'Two jackets.', history: [hist('Pending', 'Sara Al Ali')] },
    { id: 'ORD-1006', type: 'restaurant', vendorId: 'v2', visitorId: 'u1', status: 'Completed', createdAt: stamp(), items: [{ id: 'o4', name: 'Cappuccino', price: 12, qty: 1 }], total: 12, history: [hist('Pending'), hist('Preparing'), hist('Ready for pickup'), hist('Completed')] },
    { id: 'APT-1007', type: 'barber', vendorId: 'v3', visitorId: 'u2', status: 'Cancelled', createdAt: stamp(), serviceId: 'o7', serviceName: 'Beard trim', price: 15, slot: dt(2, '14:00'), history: [hist('Pending'), hist('Cancelled', 'Sara Al Ali', 'Plans changed.')] },
  ]

  return {
    version: 2,
    users,
    vendors,
    categories,
    offerings,
    offers,
    events,
    announcements,
    matches,
    requests,
    activity: [
      { id: 'act-1', at: stamp(), actor: 'System', text: 'Demo data initialized' },
      { id: 'act-2', at: dt(-1, '16:00'), actor: 'Mall Administrator', text: 'Approved Web development meetup' },
      { id: 'act-3', at: dt(-1, '14:00'), actor: 'Mall Administrator', text: 'Removed incomplete grooming promotion' },
    ],
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
