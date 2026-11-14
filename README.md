# KFUPM Mall Hub

**Mall activities, vendor information, and services in one place.**

KFUPM Mall Hub is a web application for students and faculty visiting the KFUPM Mall. It brings mall announcements, student club events, vendor offers, and the match schedule for the mall's central screen into one searchable feed. It also connects visitors with selected mall services: restaurant pickup orders, barbershop appointments, and laundry pickup requests, each with status tracking.

Vendor representatives keep their business information, offerings, and offers up to date and manage incoming requests. Mall administrators manage vendors, publish official content and match schedules, and review club event submissions.

> **Course:** SWE 363 – Web Engineering, Section 02 · **Team 8** · King Fahd University of Petroleum & Minerals
> **Phase 4:** Front-end prototype (React). All data is mock data stored in the browser; the real backend comes in Phase 5.

- **Live demo:** _add the deployed link here (T37)_
- **Figma design:** _add the view-only Figma link here_ (exported screens are also in [`design/screens`](./design/screens))

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Usage](#usage)
- [Project structure](#project-structure)
- [Team](#team)
- [Contributing workflow](#contributing-workflow)
- [AI usage](#ai-usage)

---

## Features

| User | What they can do |
|---|---|
| **Guest** | Browse the mall feed, search the vendor directory, view vendor profiles |
| **Mall visitor** | Everything a guest can do, plus place restaurant pickup orders, book barber appointments, request laundry pickup, and track requests in My Requests |
| **Club representative** | Submit club events for administrator review and track their status |
| **Vendor representative** | Manage the business profile, open/closed status, offerings, offers, and customer requests |
| **Mall administrator** | Manage vendor accounts and categories, publish announcements and match schedules, assign club permissions, review club events, moderate offers |

The app has 23 screens (S01–S23), matching the wireframes from Phase 3. Open `/screens` in the running app to see all of them with direct links.

## Tech stack

| Tool | Purpose |
|---|---|
| [React 19](https://react.dev/) | UI library |
| [Vite](https://vite.dev/) | Development server and build tool |
| [React Router](https://reactrouter.com/) | Page routing |
| Plain CSS with CSS variables | Styling and responsive layout (class names match the Figma reference) |
| [ESLint](https://eslint.org/) | Code linting |

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer (includes npm)
- Git

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<owner>/swe363-sec2-team8-phase4.git
cd swe363-sec2-team8-phase4

# 2. Install dependencies
npm install

# 3. (Optional) Create your local environment file
cp .env.example .env

# 4. Start the development server
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

### Environment variables

Phase 4 runs entirely on mock data, so no variables are required. `.env.example` lists the variables the app will use later. Copy it to `.env` and fill in your own values; `.env` is ignored by Git and must never be committed.

### Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the development server with hot reload |
| `npm run build` | Builds the production version into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Checks the code with ESLint |

## Usage

### Demo accounts

All accounts are fictional. The password for every account is `Demo1234`.

| Role | Email | Try this |
|---|---|---|
| Visitor | `visitor@demo.test` | Feed, directory, ordering, booking, laundry, My Requests |
| Visitor + club rep. | `club@demo.test` | Club event submission and tracking |
| Vendor (restaurant) | `v1@demo.test` | Dashboard, requests, profile, offerings, offers |
| Vendor (barber / laundry / store) | `v3@` / `v4@` / `v5@demo.test` | Type-specific vendor features |
| Administrator | `admin@demo.test` | All administration screens |

### Example walkthrough: restaurant order

1. Log in as the visitor and open **Directory → Campus Bites → Start pickup order**.
2. Add items, select **Review order**, then **Submit order**.
3. Log in as `v1@demo.test`, open **Requests**, open the order and select **Accept request**, then **Mark Ready for pickup**.
4. Log back in as the visitor and open **My Requests** to see the updated status.

_More walkthroughs (barber booking, laundry, club events, offers, vendor accounts) will be added as the screens are completed._

## Project structure

```
├── design/                  # Figma reference: desktop SVGs, mobile SVGs, Phase 3 prototype
├── public/                  # Static files served as-is (favicon)
├── src/
│   ├── assets/              # Images and icons imported by components
│   ├── components/
│   │   ├── common/          # Reusable UI pieces (buttons, modals, form fields…)
│   │   └── layout/          # Top bar, side menu, demo controls, per-role menus
│   ├── context/             # AuthContext (useAuth) and DataContext (useData)
│   ├── data/                # Mock data + request/account rules (plain JS, no React)
│   ├── hooks/               # Custom React hooks
│   ├── layouts/             # Page layouts (AppLayout)
│   ├── pages/
│   │   ├── public/          # S01–S05: login, profile, feed, directory, vendor profile
│   │   ├── visitor/         # S06–S11: services, My Requests, request detail, club events
│   │   ├── vendor/          # S12–S16: vendor dashboard and management
│   │   └── admin/           # S17–S23: administration screens
│   ├── styles/              # index.css (theme + content classes), layout.css (frame)
│   ├── utils/               # Status rules, booking slots, date/money formatting, validation
│   ├── routes.jsx           # One list of every screen and its URL
│   ├── App.jsx              # Router setup
│   └── main.jsx             # Entry point
├── .env.example             # Environment variable template
├── AI_USAGE.md              # AI usage declaration
└── README.md
```

## Design reference

The team uses the KFUPM green theme from Ibrahim's design: a white top bar with the "MH" mark, a dark green side menu that changes per role, and white rounded cards on a light green-gray page. Desktop screens are in `design/screens/` (one SVG per screen) and phone layouts in `design/mobile/`. Below 767 px the side menu turns into a slide-out drawer and grids stack into one column.

When building a screen, reuse the class names from `src/styles/index.css` (`panel`, `card`, `metrics`, `chips`, `badge good|warn|bad`, `formgrid`, `errorbox`, `timeline`, `modal`, and so on) instead of writing new CSS. The frame (top bar, side menu, breadcrumb bar) is styled in `src/styles/layout.css`.

The admin screens (S17, S18, S20–S23) live in `src/features/admin/` and `src/pages/admin/` and carry their own `mh-` styles.

## Working with data

Pages never import mock data directly. Use the two hooks:

```jsx
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'

const { user, role, ownVendor } = useAuth()          // role: 'guest' | 'visitor' | 'vendor' | 'admin'
const { data, update, add, logActivity } = useData() // data.vendors, data.requests, data.offers, ...

update('vendors', ownVendor.id, { isOpen: false })
```

Changes are saved in the browser (`localStorage`), so they survive a refresh. The record shapes are documented at the top of `src/data/mockData.js`; the request status rules are in `src/utils/requestStatus.js`.

## Team

| Member | Student ID | Role | Responsible for |
|---|---|---|---|
| Mohammed Shublaq | 202339150 | Frontend Developer | App shell, routing, shared components, S01–S05 |
| Abdulrahman Maashi | 202356070 | Backend Developer | Mock data, app state, status rules, S06–S11 |
| Khaled Alanazi | 202338530 | QA Tester | S12–S16, S19, testing and accessibility |
| Ibrahim Alrashaid | 202357190 | UI/UX Designer | Figma design, theme, S17–S18, S20–S23 |

## Contributing workflow

1. Pull the latest `dev` branch: `git checkout dev && git pull`
2. Create a branch for your task: `git checkout -b feature/s06-order`
3. Commit small, clear changes from your own GitHub account.
4. Push and open a pull request into `dev`; another member reviews it.
5. `dev` is merged into `main` for the final submission.

## AI usage

See [AI_USAGE.md](./AI_USAGE.md) for the tools used and the files they affected.
