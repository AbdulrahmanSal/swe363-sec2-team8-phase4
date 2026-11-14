# KFUPM Mall Hub — Ibrahim's Phase 4 admin module

A React implementation of Ibrahim Alrashaid's six assigned admin screens: **S17, S18, S20, S21, S22 and S23**. It follows the supplied Team 8 task distribution with a green-and-white KFUPM portal-inspired visual direction. It is a student project, not an official university service.

## Run locally

For the quickest look, double-click **Preview_Admin.html**. It is a self-contained compiled copy of the React preview, with no external scripts or styles. If your browser restricts local files/storage, use the development setup below. The editable React source is in `src/`, not in that compiled preview.

Install Node.js 22.12+ (or Node 24), extract this folder, open a terminal in it, then run:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Start on the admin Overview, use the six sidebar links, and use the labelled demo-account selector to test restricted access. Reset demo restores fictional records. There are no real payments, notifications, external APIs or production login services.

```sh
npm run lint
npm test
npm run build
node scripts/make-preview.js
npm run preview
```

For a real iframe-based 375/768/1440 width check, open `/responsive-check.html` on the local dev or preview server. Test the page and forms at each size; this QA harness is not one of the coursework screens.

## Implemented screens

- S17: live counts by account status, event review queue, request summaries, timestamped activity.
- S18: vendor search/status filters; account create/edit, unique email/password/hour validation; approve/suspend/reactivate/archive with confirmations and preserved history.
- S20: announcement/match tabs; create/edit/schedule/remove; Riyadh times and publication-not-after-kickoff validation.
- S21: searchable Visitors; grant/update/revoke one club permission without rewriting historical events.
- S22: status filters; event editor; edits preserve status; approval blocks started events; rejection has a confirmed reason.
- S23: vendor/state filters; derived offer states; review and confirmed removal with reason, retaining metadata.

## Structure and ownership

`src/pages/admin/` contains the six owned page files. `src/features/admin/` holds namespaced helper UI, styling, validators, the provider adapter and a route list. `src/demo/` is an isolated demonstration shell/data store only. `tests/` contains rule and React interaction tests. `design/mobile/` contains the four requested 390 px mobile references and a navigation-drawer state. `docs/` explains integration and remaining task obligations.

The actual team's starter, shared hooks and components were not supplied. Do NOT replace teammates' shared files with this preview. Follow [docs/INTEGRATION.md](docs/INTEGRATION.md) to plug these pages into actual `useAuth()` and `useData()` hooks. Coordinate fallback UI replacement with Mohammed's shared T09 components. The standalone preview stores records under `mallhub-ibrahim-admin-preview-v1`, not the team's `mallhub-demo` key.

## Your remaining tasks

- Import/review the mobile and existing desktop references in the actual Figma file; connect frames; share the real view-only link. See `design/FIGMA_HANDOFF.md`.
- Update admin design references to the requested green style; do the full T36 comparison after the whole app is merged.
- Integrate with the actual data/router/common-component owners and check cross-role propagation.
- Work from `dev`, commit your own real work under your account, and obtain Khaled's review. Nothing has been pushed or merged by the assistant.
- Add your accurate AI entry to the team file, preserve original conversation evidence, and sign the declaration only after reviewing it.

## Limitations

See [docs/VERIFICATION.md](docs/VERIFICATION.md) for the exact test results and verification limits, including the iframe automation limit on a tall mobile dialog.

This is front-end demo authentication, not a secure backend. It deliberately uses fictional accounts and demo passwords in local storage. A real service must enforce authorization and account lifecycle on a server. Browser-wide simultaneous writes are not transactional. The preview can check isolated admin interactions but cannot prove the full team's login, visitor feed, vendor workspace, deployment, or final design match.

## Dependencies

React, React DOM, Vite and the React plugin; Vitest, Testing Library, jsdom, ESLint and React Hooks lint rules for development. Runtime styling and SVG icons are local; no third-party design assets or network fonts are required.

Design sources: the supplied HTML wireframe and task distribution. Palette reference: [official KFUPM style board](https://mediacenter.kfupm.edu.sa/documents/15/KFUPM_Style_Board.pdf). Original grayscale structure and key labels are retained, while styling is intentionally changed to the user's requested portal-inspired direction.

Developer: Ibrahim Alrashaid — UI/UX and assigned admin screens. This package does not claim teammates authored its AI-generated files. See `AI_USAGE.md`.
