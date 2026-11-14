# Integrating Ibrahim's pages without overwriting team work

The actual team starter repository was not supplied. This is a working, isolated React preview plus drop-in page modules, NOT a replacement for the team repository and NOT a claim that anything has been merged.

## Copy only the owned modules first

- `src/pages/admin/AdminDashboard.jsx` (S17)
- `src/pages/admin/VendorAccounts.jsx` (S18)
- `src/pages/admin/OfficialContent.jsx` (S20)
- `src/pages/admin/ClubPermissions.jsx` (S21)
- `src/pages/admin/EventReview.jsx` (S22)
- `src/pages/admin/OfferModeration.jsx` (S23)
- `src/features/admin/` contains the isolated adapter, reusable admin UI, validators, style, and route list.

Do not copy `src/demo/` over the team's data, authentication, top bar, sidebar, or router. Do not overwrite `src/styles/index.css`, `src/context`, `src/data`, or `src/components/common`.

## Connect to the real T06 hooks

Ask the owners of the shared files to add a wrapper in the app frame:

```jsx
import { useAuth } from "./context/AuthContext";
import { useData } from "./context/DataContext";
import { AdminModuleProvider } from "./features/admin/AdminBridge";

function AdminWorkspace({ children }) {
  const auth = useAuth();
  const data = useData();
  const navigate = useNavigate(); // If the team router is React Router.
  return (
    <AdminModuleProvider auth={auth} data={data} navigate={navigate}>
      {children}
    </AdminModuleProvider>
  );
}
```

`useNavigate` must be imported from the team's installed router package. It is deliberately not a dependency of these six pages. Use the team's existing navigation function instead if different.

The pages never import demo records. Their only data input is the provider receiving the actual `useAuth()` and `useData()` return values.

Register the six paths listed in `src/features/admin/AdminRoutes.jsx` through Mohammed's route-protection layer. Adapt paths there if the team's router uses different ones. Vendor/event query filters are supported via URL search or hash-query values.

## Data contract (from the task distribution)

- Collections: `users`, `vendors`, `categories`, `requests`, `offers`, `announcements`, `matches`, `events`, `activity`.
- Mutations: `add(collection,item)`, `update(collection,id,changes)`, `remove(collection,id)`; sync or async is accepted. Throw errors or return `{ok:false,errors:{field:message}}` for failure.
- Users: `{id,name,email,password,role,vendorId?,club}`. Club is one string or empty. Administrator role is `admin`.
- Vendors: `{id,name,type,categoryId,description,location,phone,email,weeklyHours,isOpen,accountStatus}`. Hours contain `{day,open,close,closed}`. Account states are lowercase `pending`, `active`, `suspended`, `archived`.
- Events: `{id,club,submittedBy,title,description,location,startAt,endAt,status,rejectReason}`; status is lowercase `pending`, `approved`, `rejected`.
- Official content: `publishAt`; matches also use `teamA`, `teamB`, `matchAt`, `location`.
- Offers: `startAt`, `endAt`, `removed`, `removedReason`.

If the team still uses older HTML names such as `owner`, `publication`, `status` on vendors, or `start`, normalize those once in the shared data layer or adapter. Do not mix both schemas silently.

New-vendor creation adds a linked user then a pending business. The UI compensates by removing the newly created user if business creation fails. For stronger cross-tab guarantees, ask the T06 owner for an atomic `createVendorAccount` action. Front-end checks are not a server-side authorization boundary.

The preview's vendor login switch blocks inactive accounts. The real login function still needs to enforce the same rule in T06. The public feed must derive visibility from updated content, event, offer and vendor records; it is outside this package.

## Shared components and styling

The fallback components in `src/features/admin/components.jsx` exist because Mohammed's exact T09 component props were not provided. Coordinate replacement of these local implementations with the shared T09 components after confirming their props; do not modify his components without agreement. All admin CSS uses `mh-` names to avoid unrelated global changes.

`src/demo/demo.css` and the portal frame in `src/demo/App.jsx` are a demonstration of the requested KFUPM-inspired look. Mohammed owns the actual top bar and sidebar. Give him these as a style reference, not as an overwrite.

## Work distribution and Git

Use one branch and one real reviewed PR per task, into `dev`, under your own account. Do not import this package as a fabricated history of small past commits. Start from the actual current `dev` branch. Khaled reviews Ibrahim according to the sheet. No remote commits, pushes, issues, PRs, or access changes were performed by this task.

## Handoff checks

1. Confirm all six routes are still administrator-only in the team router.
2. Approve/suspend/reactivate/archive a demo vendor; verify real team login and public visibility change while request history survives.
3. Save scheduled official content and check feed timing.
4. Grant/revoke a club permission; verify Visitor event creation and historical submissions.
5. Edit/approve/reject an event; verify the public feed and submitter's view.
6. Remove an offer with a reason; verify the vendor's S16 and public views.
7. Compare the final merged UI with the updated Figma design at 1440 px, then check 375 and 768 px.
