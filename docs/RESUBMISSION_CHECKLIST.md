# Phase 4 resubmission checklist

Use the integrated code from main plus the resubmission fixes. The earlier dev branch does not contain Khaled's vendor implementations; merge this repair branch into dev, then merge dev into main. Preserve the original member commits.

## Code verification

Run these from the final checkout:

```sh
npm ci
npm run lint
npm test
npm run build
node scripts/verify-public-content.mjs
```

The resubmission fixes remove an unused admin import, retain the Page test component through createElement (removing the parameter would break tests), and validate service type, malformed appointment times and business availability during rescheduling.

The tests use the real App providers for cross-role order progress, public offering updates, immutable historical prices, club-event submission/approval/publication, private request access and confirmed laundry scheduling. They do not replace visual browser testing.

## Highest-priority submission requirements

- Complete the actual Figma reference file and add its view-only URL to README. Exported SVGs alone are not a Figma file link. The reference should reflect the delivered green theme.
- Complete AI_USAGE.md for every member. Khaled's row was still a placeholder in the reviewed repository; the member must confirm the tools and files rather than another person guessing.
- Update the declaration to include resubmission work on 16 November 2026 and its artifact. Every member verifies their own statement and signs the final version.
- Include the full, unedited conversations and intermediate artifacts from all members. This conversation spans the initial implementation and resubmission work; replace a shorter earlier export with the complete final export.
- Check each declaration evidence path against an actual file in the evidence ZIP. Keep signed statements accurate about what was done and tested.

Final Blackboard items:

1. The repository URL, with the final code on main and instructor access enabled.
2. `Team 8 SWE 363-02 - Phase 4 - AI Declaration.pdf`.
3. `Team 8 SWE 363-02 - Phase 4 - AI Evidence.zip`.
4. The actual view-only Figma reference URL in README and the relevant submission field.

## Browser checks and deployment

- Run the app in a real browser at 375, 768 and 1440 px. Check the feed, directory, request lists/details, vendor forms and admin dialogs for clipping or horizontal page scrolling.
- Use only Tab/Shift+Tab/Enter/Escape to navigate a form and modal. Check visible focus, labels and errors.
- Manually exercise restaurant ordering, barber booking/rescheduling, laundry scheduling, event approval and offer moderation across demo roles.
- Publish the integrated build with Netlify (build command `npm run build`, publish directory `dist`). The project includes a React Router fallback.
- Open the live URL and refresh `/directory` and a protected nested URL. Add the actual live URL to README.

A live deployment is part of the team's handoff plan; the supplied course instructions explicitly require the GitHub submission, Figma reference and AI declaration/evidence. Do not delay mandatory evidence to add unrelated features.

## Outside this check

The shared OneDrive declaration/evidence and any actual Figma/Netlify links were not available in the repository. Their completeness must be checked from the final files/links. A local DOM test is not a verified public deployment or a visual layout check.
