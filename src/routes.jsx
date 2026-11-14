/**
 * Single list of every screen in the app (IDs match the Phase 3 wireframes, S01–S23).
 * Used by App.jsx for routing and by ScreenIndex.jsx for the demo screen list.
 *
 * role: who the screen is for — 'public' | 'visitor' | 'vendor' | 'admin'.
 * ProtectedRoute checks these roles before rendering a screen.
 */

// Public & account
import Login from './pages/public/Login.jsx'
import AccountProfile from './pages/public/AccountProfile.jsx'
import Feed from './pages/public/Feed.jsx'
import Directory from './pages/public/Directory.jsx'
import VendorProfile from './pages/public/VendorProfile.jsx'

// Visitor services
import RestaurantOrder from './pages/visitor/RestaurantOrder.jsx'
import BarberBooking from './pages/visitor/BarberBooking.jsx'
import LaundryRequest from './pages/visitor/LaundryRequest.jsx'
import MyRequests from './pages/visitor/MyRequests.jsx'
import RequestDetail from './pages/visitor/RequestDetail.jsx'
import ClubEvents from './pages/visitor/ClubEvents.jsx'

// Vendor representative
import VendorDashboard from './pages/vendor/VendorDashboard.jsx'
import BusinessProfile from './pages/vendor/BusinessProfile.jsx'
import Offerings from './pages/vendor/Offerings.jsx'
import VendorRequests from './pages/vendor/VendorRequests.jsx'
import VendorOffers from './pages/vendor/VendorOffers.jsx'

// Mall administrator
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import VendorAccounts from './pages/admin/VendorAccounts.jsx'
import DirectorySettings from './pages/admin/DirectorySettings.jsx'
import OfficialContent from './pages/admin/OfficialContent.jsx'
import ClubPermissions from './pages/admin/ClubPermissions.jsx'
import EventReview from './pages/admin/EventReview.jsx'
import OfferModeration from './pages/admin/OfferModeration.jsx'
import AdminWorkspace from './features/admin/AdminWorkspace.jsx'

/** Ibrahim's admin pages read data through his AdminModuleProvider. */
const admin = (page) => <AdminWorkspace>{page}</AdminWorkspace>

export const screens = [
  { id: 'S01', name: 'Login and sign up', path: '/login', role: 'public', element: <Login /> },
  { id: 'S02', name: 'Account profile', path: '/profile', role: 'authenticated', element: <AccountProfile /> },
  { id: 'S03', name: 'Mall feed', path: '/', role: 'public', element: <Feed /> },
  { id: 'S04', name: 'Vendor directory', path: '/directory', role: 'public', element: <Directory /> },
  { id: 'S05', name: 'Public vendor profile', path: '/vendors/:vendorId', role: 'public', element: <VendorProfile /> },

  { id: 'S06', name: 'Restaurant order', path: '/vendors/:vendorId/order', role: 'visitor', element: <RestaurantOrder /> },
  { id: 'S07', name: 'Barber booking', path: '/vendors/:vendorId/book', role: 'visitor', element: <BarberBooking /> },
  { id: 'S08', name: 'Laundry request', path: '/vendors/:vendorId/laundry', role: 'visitor', element: <LaundryRequest /> },
  { id: 'S09', name: 'My Requests', path: '/requests', role: 'visitor', element: <MyRequests /> },
  { id: 'S10', name: 'Request detail (visitor)', path: '/requests/:requestId', role: 'visitor', element: <RequestDetail mode="visitor" /> },
  { id: 'S11', name: 'Club events', path: '/club-events', role: 'visitor', clubOnly: true, element: <ClubEvents /> },

  { id: 'S12', name: 'Vendor dashboard', path: '/vendor', role: 'vendor', element: <VendorDashboard /> },
  { id: 'S13', name: 'Business profile editor', path: '/vendor/profile', role: 'vendor', element: <BusinessProfile /> },
  { id: 'S14', name: 'Offerings manager', path: '/vendor/offerings', role: 'vendor', element: <Offerings /> },
  { id: 'S15', name: 'Customer requests', path: '/vendor/requests', role: 'vendor', element: <VendorRequests /> },
  { id: 'S10', name: 'Request detail (vendor)', path: '/vendor/requests/:requestId', role: 'vendor', element: <RequestDetail mode="vendor" /> },
  { id: 'S16', name: 'Vendor offers', path: '/vendor/offers', role: 'vendor', element: <VendorOffers /> },

  { id: 'S17', name: 'Administration dashboard', path: '/admin', role: 'admin', element: admin(<AdminDashboard />) },
  { id: 'S18', name: 'Vendor account management', path: '/admin/vendors', role: 'admin', element: admin(<VendorAccounts />) },
  { id: 'S19', name: 'Directory settings', path: '/admin/categories', role: 'admin', element: <DirectorySettings /> },
  { id: 'S20', name: 'Official content', path: '/admin/content', role: 'admin', element: admin(<OfficialContent />) },
  { id: 'S21', name: 'Club permissions', path: '/admin/permissions', role: 'admin', element: admin(<ClubPermissions />) },
  { id: 'S22', name: 'Club event review', path: '/admin/events', role: 'admin', element: admin(<EventReview />) },
  { id: 'S23', name: 'Offer moderation', path: '/admin/offers', role: 'admin', element: admin(<OfferModeration />) },
]
