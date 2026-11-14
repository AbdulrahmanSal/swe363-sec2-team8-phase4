import AdminDashboard from "../../pages/admin/AdminDashboard";
import VendorAccounts from "../../pages/admin/VendorAccounts";
import OfficialContent from "../../pages/admin/OfficialContent";
import ClubPermissions from "../../pages/admin/ClubPermissions";
import EventReview from "../../pages/admin/EventReview";
import OfferModeration from "../../pages/admin/OfferModeration";
export const adminRoutes = [
  {
    path: "/admin",
    screen: "S17",
    label: "Overview",
    icon: "grid",
    Component: AdminDashboard,
  },
  {
    path: "/admin/vendors",
    screen: "S18",
    label: "Vendor accounts",
    icon: "store",
    Component: VendorAccounts,
  },
  {
    path: "/admin/content",
    screen: "S20",
    label: "Official content",
    icon: "news",
    Component: OfficialContent,
  },
  {
    path: "/admin/permissions",
    screen: "S21",
    label: "Club permissions",
    icon: "users",
    Component: ClubPermissions,
  },
  {
    path: "/admin/events",
    screen: "S22",
    label: "Event review",
    icon: "calendar",
    Component: EventReview,
  },
  {
    path: "/admin/offers",
    screen: "S23",
    label: "Offer moderation",
    icon: "tag",
    Component: OfferModeration,
  },
];
