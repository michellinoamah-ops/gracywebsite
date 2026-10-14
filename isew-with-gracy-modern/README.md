# ISew with Gracy / The Fashion Academy

A complete redesign in warm cream, clay, chocolate, ochre, rose and sage, with Cormorant Garamond headings and DM Sans body text. The original course offers, Selar links, photographs, contact details and student screenshots are preserved. No invented sales figures, accreditation, reviews or star ratings were added.

## What is included

- 22 generated HTML pages, including home, classes, five course detail pages, academy story, learning process, student stories, journal, three introductory articles, resources, FAQs, contact, privacy, terms and two CMS fallback pages.
- Separate responsive admin workspace at `/admin.html` with courses, journal publishing, image uploads, student screenshots, review moderation, private enquiries, tags, announcement scheduling and contact/homepage settings.
- Search and category filters, keyboard navigation, native accessible dialogs and reduced-motion support.
- Sculpted section panels, layered photo frames, scroll reveals, gentle decorative motion and swipeable homepage student feedback.
- Dedicated article/course links, native sharing with copy-link/WhatsApp/email fallback, and moderated article comments.
- Rich blog composition with headings, emphasis, lists, quotes, links, colour presets, alignment, undo/redo, find/replace, expanded view and publication preview.
- Four announcement designs with live previews: The Atelier, Golden Hour, Studio Postcard and The Ribbon.
- A web app manifest, Android/iPhone icons, browser-aware installation prompts, iPhone instructions and a public-page offline cache.
- Unique page titles/descriptions, crawlable links and HTML, canonical URLs, social metadata, sitemap, robots rules and factual structured data.
- Firebase rules requiring a verified administrator custom claim; private enquiries; pending review privacy; validated submissions; safe text/link rendering; image size/type limits; session-only admin authentication and idle sign-out.
- Security headers for Firebase Hosting, Vercel and Apache, plus `_headers` for hosts that support that convention.

## Launch in VS Code

Extract the ZIP, open the folder containing `package.json` in VS Code, and run `npm run dev`. Open http://localhost:5173. No `npm install` is needed for this preview. See **OPEN-IN-VSCODE.md** for Windows instructions, F5, Live Server, checks and backend setup.

## Open the redesign

The private preview is hosted through Sites. It uses the included public content snapshot. The admin “Preview the workspace” button opens an in-memory design preview, clearly marked as such. Preview changes reset on reload and never affect the live academy.

This package is not connected to the original Firebase project. Live admin sign-in, saving, uploads and forms need the setup in **SETUP.md**. WhatsApp, email and the original Selar links work independently.

## Project layout

- `dist/` — upload/deploy this directory as the website root.
- `dist/admin.html` — the academy admin entry point.
- `dist/runtime-config.js` — intentionally empty public Firebase web configuration.
- `scripts/build.py` — generate crawlable pages from the catalog and journal content.
- `scripts/check.py` — static integrity and JavaScript security checks.
- `scripts/grant-admin.mjs` — trusted-machine administrator role helper.
- `firestore.rules`, `storage.rules` — backend permission boundaries.
- `tests/` — URL/HTML safety tests and Firebase Emulator permission tests.
- `RESEARCH-AND-SECURITY.md` — research rationale, security findings and verification limits.

## Quick verification

No package installation is needed for the static site or these checks:

```bash
python3 scripts/check.py
```

To rebuild for your own domain:

```bash
python3 scripts/build.py --origin https://your-domain.com
python3 scripts/check.py
```

Do not open HTML directly as `file://`: ES modules, service workers and Firebase need an HTTP(S) origin. Deploy the `dist` folder, or use a local development web server on your own computer.

## Updating SEO after using the CMS

Admin changes are saved to Firebase and reflected on public pages when connected. Search engines also benefit from matching static snapshots. After publishing, unpublishing or deleting a course or article:

1. In the admin workspace choose **Export content**. It excludes private enquiries and review submissions.
2. Keep the export outside `dist`.
3. Rebuild and deploy:

```bash
python3 scripts/build.py --origin https://your-domain.com --snapshot /path/to/isew-content-export.json
python3 scripts/check.py
```

The builder regenerates class/article HTML, removes obsolete generated class/article files, and updates the sitemap. Drafts are excluded. It does not copy the raw export into the public website. Existing source article/course paths are preserved; newly added cloud entries can open through the CMS fallback page until the next build. Submit the rebuilt sitemap to Search Console.

A PWA is a home-screen website, not an Android APK or App Store application. Browser support governs installation. Offline access is limited to pages and assets already cached; payments, forms, CMS changes and cloud data require connectivity.
