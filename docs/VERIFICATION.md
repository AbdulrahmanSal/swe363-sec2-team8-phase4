# Verification performed

- `npm run lint`: passed.
- `npm test`: 38 tests passed across two test files.
- `npm run build`: passed; React bundled locally with Vite.
- `node scripts/make-preview.js`: created the single-file `Preview_Admin.html` from the same final build.
- All six page headings were confirmed in the Chromium preview at 375, 768 and 1440 pixel iframe viewports. At each width the document scroll width did not exceed its client width (18 checks).
- The create-vendor dialog was also checked at the 375 px viewport: 336 px content width and 336 px scroll width, with no sideways overflow.
- The final dashboard was visually inspected in the browser.

The browser iframe helper timed out when attempting to scroll-click the bottom of the tall mobile create-vendor dialog. Therefore a successful manual mobile form submission is NOT claimed. Form submission/validation, preserved field values, duplicate-submit prevention, modal typing, Escape and focus wrapping were verified by the React integration tests instead. Recheck touch scrolling and footer reachability on a real phone or a normal browser device toolbar after integration.

## Automated coverage

Tests cover all six page renders, access restrictions, combined vendor filters, invalid required fields, account creation and linking, duplicate click prevention, confirmed archival with unchanged request history, invalid match timing, club grant/revoke without event rewrite, edits preserving event status, blocking approval of started events, offer-removal reasons, keyboard focus/typing/Escape/trapping, demo persistence and inactive-vendor login blocking. Pure rules also check password, duplicate email, contact details, hours, Riyadh conversions, publication and offer boundaries, lifecycle restrictions and data-derived counts.

## Not verified / not completed

- Firefox or Edge was not exercised; the local browser checks used Chromium.
- No backend is included. The team T06 contract is documented but the actual shared contexts were not supplied, so full integration is still required.
- The real visitor feed, vendor S16 and live team login were not connected to these pages. Cross-role propagation must be checked in the merged project.
- The live Figma file, prototype connections and sharing link were not created, and the full-team T36 comparison was not performed.
- No GitHub commits, pushes, PRs, issues, deployment or submission was performed.
- Signed declarations and original full-chat evidence must be reviewed/prepared by the team. The earlier reconstructed transcript must not be treated as unedited evidence.
