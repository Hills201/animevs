# Changelog

## Motion + speed pass
- Added **GSAP** (entrances, battle/results sequences, scroll reveals, parallax), **Lenis** (smooth wheel scrolling, desktop mouse/trackpad only) and **React Bits** components (SpotlightCard, ShinyText, Magnet, SplitText, CountUp). Licence: React Bits is MIT + Commons Clause, (c) David Haz; attribution kept in `src/reactbits.jsx` and `src/SplitText.jsx`.
- All motion is skipped for `prefers-reduced-motion`; phones keep native scrolling.
- Speed: Versus (and the Supabase client), the Daily puzzle, SplitText, Lenis, Analytics and Speed Insights are now loaded on demand. The first screen loads about 124 KB gzipped instead of 154 KB, and the live-play code is only fetched when someone opens Versus.
- React and GSAP are split into their own cached chunks, so a normal deploy only makes returning players re-download the small app file.
- Fonts now load from `index.html` (preconnect + `display=swap`) instead of after React starts; built files under `/assets` are cached for a year (`vercel.json`).
- Versus code moved from `App.jsx` into `src/Versus.jsx`; game logic is unchanged.

## Auction mode (Versus)
- Versus now opens on a format picker: **Auction** (new) or **Blind Draft** (the original).
- Auction: a live ascending auction for two players. A reel spins up one fighter at a time and both players bid against a clock. Each starts with $50; the winner pays their bid and the fighter is gone from the other player for good.
- Bids reset a 7s clock, a fresh lot gives 12s to open, and either player can pass or concede. If a rival can't afford to raise, the lot sells immediately.
- $1 is always reserved per empty slot, so nobody can be stranded short of a full team. If lots go unsold four times running, empty slots are filled with the cheapest unclaimed fighters.
- A fighter must be placed into a role right after it is won, with one-tap role buttons showing the fit bonus. Teams lock in and reveal through the existing PvP scoring.
- State lives in a new `auction_rooms` table (`supabase-auction.sql`); writes are compare-and-set on a version number so simultaneous actions can't corrupt a room.
- `healthcheck.mjs` now plays 770 bot-vs-bot auctions and checks money, reserve rule, termination, auto-fill, seat bias and result integrity.

## Counter system pass
- Counter rewards now scale with tag advantage and counter tier, capped at +20 per edge.
- Counter relationships are categorized as situational, core, or strong.
- Counter Immunity now removes the strongest active enemy counter rather than the first hard-coded edge.
- Projected tags remain virtual for counter math only and are surfaced as projected in the team Counter Profile.
- Added an in-build Counter Profile showing direct/projected tags and counter coverage.
- Updated the Guide to explain the revised counter rules and show counter tiers.

## Content pages (AdSense fix)
- Removed the sticky ad bar and "advertisement" placeholder from all game screens.
- New `build-content.mjs` (runs before every build) generates crawlable pages: guides, character database, About, Privacy, Contact, sitemap.xml, robots.txt.
- `index.html` now carries real intro text and links; Home links to the guides.
- `vercel.json` gained `cleanUrls`.

## Home hub
- New home screen: rank/XP profile strip, daily streak, ladder hero card with 10-rung path and next opponent's squad, Versus banner, Daily card, "Your record" tiles, daily fighter spotlight, bottom tab bar.
- Solo Spin/Draft runs now save rank, XP, best rung and averages to this browser (localStorage key `animevs-profile-v1`). Nothing leaves the device.

## Game screens
- Spin, Draft, Versus and Auction share a new header card: role progress pips, plus a credit meter in Draft.
- One-tap "Place X in…" row under the reel (phones/tablets) with each role's fit; Auction keeps its own.
- Role slots hide tag chips on phones to cut scrolling; 3D spin buttons; Draft pick card now shows tier and ability.
- Overflow fixes: Daily search box (box-sizing) and flex room-code inputs (min-width).
