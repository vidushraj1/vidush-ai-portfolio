# CLAUDE.md

## Notes for Claude Code

- Read `AGENTS.md` first; the rules there apply to every change.
- The owner is not a frontend specialist. When you change something, say which files changed and how to check it in the browser.
- Prefer small edits to existing components over rewrites, and keep the existing visual style (graphite background, electric-blue and cyan accents, Geist and Geist Mono fonts).
- Before editing `profile.json`, read it fully so nothing is dropped. Keep project `demo`, `repo` and `image` fields intact.
- If a task touches `apps-script/Code.gs`, remind the user that it lives outside the repo build and needs a New version deploy.
- Don't add third-party services (Calendly, Formspree, analytics) unless asked. Booking and contact are meant to stay Google-only.
- If the CV sync files still exist, treat `ANTHROPIC_API_KEY` as a GitHub Actions secret only. Never write it into code or `.env.example`.