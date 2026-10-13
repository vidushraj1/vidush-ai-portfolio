# Setup

1. **Copy files** into your project (same paths). Delete `Skills.tsx`, `Education.tsx`, `ParticleBackground.tsx`; remove `@tsparticles/*` from package.json. Keep your existing `astro.config.mjs`.
2. **Photo:** put your picture at `public/profile.jpg` (initials show until then). CV stays at `public/CV.pdf`.
3. **Google Calendar booking:** Calendar > Create > Appointment schedule > set availability > Share > copy the booking page link into `PUBLIC_BOOKING_URL`.
4. **Messages to Gmail:** script.google.com > New project > paste `apps-script/Code.gs` > Deploy > Web app (Execute as *Me*, access *Anyone*) > authorize > copy the `/exec` URL into `PUBLIC_APPS_SCRIPT_URL`. Put both vars in `.env`; for GitHub Pages also add them as repo Actions variables and pass them in your deploy workflow's build step.
5. **CV auto-merge:** add `"sync-cv": "node scripts/sync-cv.mjs"` to package.json scripts, then `ANTHROPIC_API_KEY=sk-ant-... npm run sync-cv`. For automation add the key as a repo secret named ANTHROPIC_API_KEY; replacing `public/CV.pdf` then updates `src/data/profile.json` through the workflow. Review the diff; `profile.backup.json` holds the previous version.
6. Add real `demo` / `repo` URLs per project in `src/data/profile.json`.
