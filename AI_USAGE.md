# AI Usage Declaration

This file lists the AI tools used on this project and the files they affected, as required by the course AI Usage Guidelines. Full conversations are included in the AI Evidence zip submitted on Blackboard.

## Phase 1 – 3

_Fill in per the earlier submissions._

## Phase 4 – Front-End

| Member | AI tool | Used for | Files affected |
|---|---|---|---|
| Abdulrahman Maashi | Claude (claude.ai) | Planning the Phase 4 task split; generating the initial project setup (Vite + React config, folder structure, routing for all 23 screens, placeholder pages, top bar and sidebar layout, and the global stylesheet ported from the Figma reference with added mobile rules) and first drafts of the README and this file. T05–T07: mock data ported from the Phase 3 prototype, request/auth service functions, status rules, booking helpers, AuthContext and DataContext; logic verified with a Node test script and a browser check. Later: renamed data fields to the team schema used by Ibrahim's admin module, switched the shared stylesheet and app frame (top bar, side menu, breadcrumb bar, demo account switcher) to the KFUPM green theme ported from Ibrahim's preview, and wrote the AdminWorkspace connector (committed by Ibrahim with his admin pages); verified in Chromium at 1440 px and 390 px | `package.json`, `vite.config.js`, `eslint.config.js`, `index.html`, `.gitignore`, `.env.example`, `public/favicon.svg`, `src/main.jsx`, `src/App.jsx`, `src/routes.jsx`, `src/layouts/AppLayout.jsx`, `src/components/layout/Topbar.jsx`, `src/components/layout/Sidebar.jsx`, `src/components/layout/navigation.js`, `src/components/common/PagePlaceholder.jsx`, `src/pages/**` (placeholders), `src/styles/index.css`, `README.md`, `AI_USAGE.md`, `src/data/mockData.js`, `src/data/requestService.js`, `src/data/authService.js`, `src/context/DataContext.jsx`, `src/context/AuthContext.jsx`, `src/utils/requestStatus.js`, `src/utils/booking.js`, `src/utils/format.js`, `src/utils/validation.js`, `src/styles/layout.css`, `src/components/common/Icon.jsx`, `src/components/layout/DemoControls.jsx` |
| Mohammed Shublaq | _Tool name, or "No AI tools used"_ | | |
| Khaled Alanazi | _Tool name, or "No AI tools used"_ | | |
| Ibrahim Alrashaid | _Tool name, or "No AI tools used"_ | | |

> Each member adds their own row. AI coding assistants (GitHub Copilot, Cursor, Claude Code, etc.), including autocomplete suggestions, must be declared. Every member must be able to explain the code they committed.
