/**
 * Sidebar menus per role — same items and order as the Figma reference.
 * The sidebar chooses its menu from the authenticated user role.
 */
export const menus = {
  guest: {
    label: 'Discover the mall',
    items: [
      { to: '/', label: 'Mall feed', end: true },
      { to: '/directory', label: 'Vendor directory' },
      { to: '/login', label: 'Login / Sign up' },
    ],
  },
  visitor: {
    label: 'Visitor workspace',
    items: [
      { to: '/', label: 'Mall feed', end: true },
      { to: '/directory', label: 'Vendor directory' },
      { to: '/requests', label: 'My Requests' },
      { to: '/club-events', label: 'Club events' },
      { to: '/profile', label: 'Account profile' },
    ],
  },
  vendor: {
    label: 'Business workspace',
    items: [
      { to: '/vendor', label: 'Dashboard', end: true },
      { to: '/vendor/requests', label: 'Requests' },
      { to: '/vendor/profile', label: 'Business profile' },
      { to: '/vendor/offerings', label: 'Offerings' },
      { to: '/vendor/offers', label: 'Offers' },
      { to: '/profile', label: 'Account profile' },
    ],
  },
  admin: {
    label: 'Administration',
    items: [
      { to: '/admin', label: 'Dashboard', end: true },
      { to: '/admin/vendors', label: 'Vendors' },
      { to: '/admin/categories', label: 'Directory settings' },
      { to: '/admin/content', label: 'Official content' },
      { to: '/admin/club-permissions', label: 'Club permissions' },
      { to: '/admin/events', label: 'Event review' },
      { to: '/admin/offers', label: 'Offer moderation' },
      { to: '/profile', label: 'Account profile' },
    ],
  },
}

