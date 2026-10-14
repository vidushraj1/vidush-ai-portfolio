# Setup guide

## 1. Local setup

```sh
npm install
cp .env.example .env
npm run dev
```

Requires Node 22.12 or newer.

## 2. Environment variables

| Variable | Used for | Secret? |
| --- | --- | --- |
| `PUBLIC_APPS_SCRIPT_URL` | Booking popup and contact form (your Apps Script `/exec` URL) | No, it ships in the page |

Astro only reads `.env` when the dev server starts, so restart after changing it.
Never put real secrets in a `PUBLIC_` variable.

## 3. Required files you add yourself

- `public/profile.jpg`: portrait photo, about 800x1000
- `public/CV.pdf`: your current CV (must not be empty)
- `public/projects/*.jpg`: optional project screenshots, 1200x750, under 200 KB each

File names are case-sensitive once deployed, so keep them lowercase.

## 4. Google Apps Script (booking and contact form)

1. Go to https://script.google.com and create a new project named "Portfolio contact".
2. Paste the full contents of `apps-script/Code.gs`.
3. Left sidebar: Services (+), choose Google Calendar API, click Add. Keep the identifier `Calendar`.
4. Run `setupAvailabilityCalendar` once. It creates a calendar called **Portfolio Availability** with a weekly Mon-Fri "Available" event.
5. Run `authorizeOnce` and approve the permissions. You should get a test email.
6. Deploy, New deployment, Web app. Execute as **Me**, access **Anyone**.
7. Copy the `/exec` URL into `PUBLIC_APPS_SCRIPT_URL`.
8. Check it: open `YOUR_EXEC_URL?action=availability` in a private window. You should see JSON with a list of slots.

After any later edit to `Code.gs`: Deploy, Manage deployments, pencil, Version: New version, Deploy.

### Changing your availability

Edit the **Portfolio Availability** calendar in Google Calendar. Events on it are your open hours. Events on your main calendar block slots. No code changes or redeploys are needed.
Do not rename the calendar unless you also change `AVAIL_CALENDAR` in `Code.gs`.

## 5. Deploying to GitHub Pages

1. Repo: `vidushraj1/vidush-ai-portfolio`. In `astro.config.mjs`, set `site: "https://vidushraj1.github.io"` and `base: "/vidush-ai-portfolio"`.
2. Settings, Pages, Source: **GitHub Actions**.
3. Settings, Secrets and variables, Actions, **Variables** tab: add `PUBLIC_APPS_SCRIPT_URL` with your `/exec` URL.
4. Make sure `.github/workflows/deploy.yml` passes the variable to the build step.
5. Push to `main`. Watch the Actions tab for a green run.

The variable is read at build time, so after changing it, re-run the deploy workflow.

## 6. Optional: AI CV sync

`scripts/sync-cv.mjs` reads `public/CV.pdf` and merges it into `src/data/profile.json`. It runs through `.github/workflows/sync-cv.yml` and needs an `ANTHROPIC_API_KEY` repository **secret**.

If you don't want it, delete both files. Otherwise:

1. Create a dedicated key in the Anthropic Console and set a low spend limit.
2. Add it under Settings, Secrets and variables, Actions, **Secrets** as `ANTHROPIC_API_KEY`.
3. Always review `git diff src/data/profile.json` after a sync, since an AI merge can get a detail wrong.

## 7. Troubleshooting

| Problem | Likely cause |
| --- | --- |
| Live site is blank or unstyled | `base` doesn't match the repo name |
| Booking says "isn't configured" | `PUBLIC_APPS_SCRIPT_URL` is missing as an Actions variable, or the site wasn't rebuilt |
| "Couldn't load availability" | Script not redeployed as a New version, access not set to Anyone, or Calendar API service not added |
| Images or CV return 404 | File name or case doesn't match the path |
| Sync CV workflow fails | `ANTHROPIC_API_KEY` secret is not set |