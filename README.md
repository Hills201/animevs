# animeVS

A deterministic anime team-drafting game. Spin or draft a squad of seven, slot them into roles, and climb a ten-rung ladder of anime dynasties. Challenge a friend in a live room: build blind, or bid against each other in an auction. There's also a daily guess-the-character puzzle.

Built with React + Vite. The solo modes and the Daily puzzle are fully static. Live Versus rooms use a small Supabase database (see below).

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

## Live Versus rooms (Supabase)

Versus has two formats and each uses its own table:

| Format | Table | Setup |
|---|---|---|
| Blind Draft | `rooms` | created earlier; see the SQL in your Supabase project |
| Auction | `auction_rooms` | run `supabase-auction.sql` once in the Supabase SQL Editor |

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` locally in `.env.local` and in Vercel's Environment Variables (see `.env.example`). Without them the Versus screens show "live rooms unavailable".

### How Auction mode works

- The whole auction is one JSON object in one row. Pure functions (`auction*` in `src/App.jsx`) are the only code that changes it.
- Every write is a compare-and-set on the row's `version`, so if both players act at the same instant exactly one write lands and the other re-reads.
- Each player's browser runs its own countdown. When one runs out it asks the database to advance, keyed on the exact state it saw, so a stale attempt does nothing.
- Each player must keep $1 back for every empty slot, so nobody can be left unable to finish a team.

## Health check

```bash
node healthcheck.mjs
```

Checks roster data, share-link codec order, duo synergies, NaN safety, ladder difficulty, the Daily puzzle, and plays hundreds of bot-vs-bot auctions. It exits non-zero on any failure, so it can gate a deploy.

## Editing the roster

All characters live in the `CHARACTERS` array at the top of `src/App.jsx`. Edit them there, then run `node healthcheck.mjs` before you push. New characters must be appended to the end of `CODEC_IDS`, never inserted, or existing share links will point at the wrong fighters.

## Notes

- Both players in a Blind Draft need the same roster version for team codes to resolve identically. Auction rooms are always consistent because both clients derive the lot order from the same seed in the room.
