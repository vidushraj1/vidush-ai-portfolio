# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project

Personal portfolio for Vidush Raj Selvaraj, an AI engineer. Static site built with Astro 7, React 19, Tailwind CSS v4 and Framer Motion, deployed to GitHub Pages.

## Commands

- `npm install`: install dependencies
- `npm run dev`: dev server
- `npm run build`: production build (run this to verify changes compile)
- `npm run preview`: serve the last build

## Layout

- `src/data/profile.json`: single source of truth for all text content
- `src/components/`: React components, hydrated from `src/pages/index.astro`
- `src/styles/global.css`: theme variables and shared classes
- `apps-script/Code.gs`: Google Apps Script backend; it is pasted into script.google.com and is not part of the Astro build

## Rules

1. **Base path:** the site is served under `base: "/vidush-ai-portfolio"`. Build asset URLs with `import.meta.env.BASE_URL.replace(/\/?$/, "/")` so there is always a trailing slash. Never hard-code `/profile.jpg`.
2. **Content:** change text, projects and links in `profile.json`, not inside components.
3. **Secrets:** anything prefixed `PUBLIC_` ships to every visitor. Never put API keys in it, in `.env.example`, or in committed files.
4. **Theming:** use the CSS variables (`--bg`, `--s`, `--s2`, `--ln`, `--tx`, `--mu`, `--ac`, `--ac2`, `--glow`). Don't hard-code colors. Support both dark and light.
5. **Component classes:** `.card`, `.chip`, `.btn`, `.btn-p` and `.field` must stay inside `@layer components` in `global.css`, so Tailwind utilities like `md:hidden` can override them.
6. **Motion:** respect `prefers-reduced-motion`. The cursor effect should only run on devices with a mouse.
7. **Accessibility:** keep aria labels on icon buttons, keep focus visible, keep the booking dialog closable with Escape.
8. **Apps Script:** after editing `Code.gs`, tell the user to redeploy as a New version, because saving alone doesn't update the live URL. Keep the honeypot, length caps and rate limits.
9. **Project links:** never blank an existing `demo`, `repo` or `image` value in `profile.json`.

## Before finishing

Run `npm run build` and fix any errors. Don't claim something works in a browser unless it was actually run.