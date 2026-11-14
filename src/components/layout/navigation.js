/**
 * Sidebar menus per role. The signed-in user's role (useAuth) picks the menu.
 * `clubOnly` items show only to visitors with a club permission (VIS08).
 */
export const menus = {
  guest: {
    label: 'Discover the mall',
    roleLine: 'GUEST',
    items: [
      { to: '/', label: 'Mall feed', icon: 'news', end: true },
      { to: '/directory', label: 'Vendor directory', icon: 'store' },
      { to: '/login', label: 'Login / Sign up', icon: 'login' },
    ],
  },
  visitor: {
    label: 'Visitor workspace',
    roleLine: 'MALL VISITOR',
    items: [
      { to: '/', label: 'Mall feed', icon: 'news', end: true },
      { to: '/directory', label: 'Vendor directory', icon: 'store' },
      { to: '/requests', label: 'My Requests', icon: 'clock' },
      { to: '/club-events', label: 'Club events', icon: 'calendar', clubOnly: true },
      { to: '/profile', label: 'Account profile', icon: 'user' },
    ],
  },
  vendor: {
    label: 'Business workspace',
    roleLine: 'VENDOR REPRESENTATIVE',
    items: [
      { to: '/vendor', label: 'Dashboard', icon: 'grid', end: true },
      { to: '/vendor/requests', label: 'Requests', icon: 'clock' },
      { to: '/vendor/profile', label: 'Business profile', icon: 'store' },
      { to: '/vendor/offerings', label: 'Offerings', icon: 'box' },
      { to: '/vendor/offers', label: 'Offers', icon: 'tag' },
      { to: '/profile', label: 'Account profile', icon: 'user' },
    ],
  },
  admin: {
    label: 'Mall workspace',
    roleLine: 'ADMINISTRATION',
    items: [
      { to: '/admin', label: 'Overview', icon: 'grid', end: true },
      { to: '/admin/vendors', label: 'Vendor accounts', icon: 'store' },
      { to: '/admin/categories', label: 'Directory settings', icon: 'folder' },
      { to: '/admin/content', label: 'Official content', icon: 'news' },
      { to: '/admin/permissions', label: 'Club permissions', icon: 'users' },
      { to: '/admin/events', label: 'Event review', icon: 'calendar' },
      { to: '/admin/offers', label: 'Offer moderation', icon: 'tag' },
      { to: '/profile', label: 'Account profile', icon: 'user' },
    ],
  },
}

/** Role line under the user's name in the top bar. */
export function roleDescription(user, ownVendor) {
  if (!user) return 'Signed out'
  if (user.role === 'admin') return 'Mall administrator'
  if (user.role === 'vendor') return ownVendor?.name ?? 'Vendor representative'
  return user.club ? `Visitor · ${user.club} representative` : 'Mall visitor'
}
