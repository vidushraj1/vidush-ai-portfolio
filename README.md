# Vidush Raj Selvaraj | AI Engineer Portfolio

Personal portfolio built with Astro, React, Tailwind CSS v4 and Framer Motion.

**Live site:** https://vidushraj1.github.io/vidush-ai-portfolio/

## Features

- Futuristic UI: neural-network canvas background, custom cursor, 3D tilt portrait, animated navigation with scroll progress
- Dark and light theme, remembered between visits
- Meeting booking that reads free times from Google Calendar and creates an event with a Google Meet link
- Contact form that delivers straight to Gmail, with no third-party service
- Project cards with screenshots and filters
- All content lives in one file: `src/data/profile.json`

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Astro 7, React 19 |
| Styling | Tailwind CSS v4, CSS variables for theming |
| Animation | Framer Motion |
| Backend | Google Apps Script (Calendar, Meet, Mail) |
| Hosting | GitHub Pages via GitHub Actions |

## Quick start

```sh
npm install
cp .env.example .env     # then fill in the values
npm run dev
```

Open the URL the terminal prints. Because `base` is set, it ends with `/vidush-ai-portfolio/`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Build the site into `dist/` |
| `npm run preview` | Serve the last build |

## Project structure

```text
public/              CV.pdf, profile.jpg, projects/*.jpg, favicon
src/components/      Hero, Portrait, Nav, About, Experience, Projects, Contact, BookingModal, Background, Cursor
src/data/profile.json   All text content (edit this to change the site)
src/layouts/         Page shell
src/pages/index.astro   Page layout
src/styles/global.css   Theme colors and shared classes
apps-script/Code.gs  Backend code, pasted into script.google.com
```

## Editing content

- Text, projects, links, experience: edit `src/data/profile.json`.
- Downloadable CV: replace `public/CV.pdf`.
- Project screenshots: put 1200x750 JPGs in `public/projects/` and add `"image": "projects/name.jpg"` to the project.
- Colors: the variables at the top of `src/styles/global.css`.

## Deployment

Pushing to `main` builds and deploys through `.github/workflows/deploy.yml`. See [SETUP.md](SETUP.md) for the one-time setup.

## License

All rights reserved. Please don't reuse the content or photos.