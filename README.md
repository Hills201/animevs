# animeVS

A deterministic anime team-drafting game. Spin or draft a squad of five, slot them into roles, and climb a ten-rung ladder of anime dynasties. Challenge friends head-to-head with shareable team codes.

Built with React + Vite. Fully static — no backend, no database.

---

## Run it locally

You need [Node.js](https://nodejs.org) installed (version 18 or newer).

```bash
npm install      # install dependencies (first time only)
npm run dev      # start the local dev server
```

Then open the URL it prints (usually http://localhost:5173).

To make a production build:

```bash
npm run build    # outputs static files into /dist
npm run preview  # preview that build locally
```

---

## Deploy it publicly (free)

### Option A — Vercel (recommended, auto-deploys on every push)

1. Push this folder to a new GitHub repository (see below).
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
3. Click **Add New → Project**, pick your repo, and click **Import**.
4. Vercel auto-detects Vite. Leave the defaults:
   - Build command: `npm run build`
   - Output directory: `dist`
5. Click **Deploy**. You'll get a public URL like `animevs.vercel.app`.

Every time you `git push`, Vercel rebuilds and updates the live site automatically.

### Option B — Netlify

Same idea: sign in at [netlify.com](https://netlify.com) with GitHub, import the repo, and it detects Vite. Build command `npm run build`, publish directory `dist`.

### Option C — GitHub Pages

Works too, but needs a small base-path tweak in `vite.config.js`. Vercel/Netlify are simpler; use one of those unless you specifically want Pages.

---

## Push to GitHub

From inside this folder:

```bash
git init
git add .
git commit -m "Initial commit — animeVS"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Replace `YOUR_USERNAME/YOUR_REPO` with your actual repo (create an empty one first at [github.com/new](https://github.com/new)).

---

## Editing the roster

All 150 characters live in the `CHARACTERS` array at the top of `src/App.jsx`. The in-app **Roster Editor** lets you tune values live and **Export** the full roster as code — paste that back over the `CHARACTERS` array to make changes permanent, then push to redeploy.

## Notes

- Roster edits made in the live app are per-session (they reset on refresh) until pasted back into `src/App.jsx`. Persisting edits per-visitor would require adding storage (e.g. localStorage or a backend) — not included here.
- PvP works with no server: a team is encoded into a short code you share. Both players need the same roster version for codes to resolve identically.
