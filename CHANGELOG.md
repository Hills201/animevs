# Changelog

## Readable home page (21 November 2026)
- The home screen now has plain text under the play cards: what animeVS is, how a run works, how a team is scored, the other modes and the latest updates. The numbers in it are read from the game data, so they stay correct when the roster, counters or ladder change.
- The static intro in `index.html` (what search engines and slow connections see before the game loads) carries the same explanations.
- The update log moved to `src/updates.js` so the `/updates` page and the home screen's "What's new" share one list. New entry for 21 November.
- The Daily puzzle's facts database no longer loads with the home screen (`src/dailyClock.js` holds the two small things the home screen needs). First load is slightly smaller than before, even with the new text.

## Real "not found" page (21 November 2026)
- `vercel.json` no longer rewrites every unknown address to the home page. Mistyped or made-up URLs used to return the game as if they were real pages; they now return a proper 404.
- New generated `404.html` with links back to the game and the guides. It is marked `noindex`, carries no ad script and is left out of the sitemap.
- Game links are unaffected: rooms, shared results and the Daily all use `/?...` on the home page.
- Shared result links and auction invite links are now always built on the home page address, and an address with a trailing slash (such as `/guides/`) redirects to the page without it.
- Known edge case: a result link that was copied while the game was open at a wrong address (for example `/play?result=...`) used to work by accident and now shows the not-found page.

## Pinch-zoom enabled (20 November 2026)
- `index.html` no longer sets `maximum-scale=1.0, user-scalable=no`, so players can pinch to zoom the game on phones and tablets.
- Text fields are 16px on touch screens, which stops iOS from zooming the page in by itself when a field is tapped.

## Daily rotation no longer reshuffles (20 November 2026)
- The Daily answer order is now a frozen list (`DAILY_DECK` in `src/animeFacts.js`) instead of a shuffle of the roster done at runtime. The list is today's order, so the schedule that was already running is unchanged.
- Before, adding one character (or even reordering `CHARACTERS`) reshuffled every upcoming puzzle and could bring back an answer from a few days earlier.
- New characters go in `DAILY_ADDED` with the date they were added. They wait for the current cycle to end, then join the end of every later cycle.
- `healthcheck.mjs` fails if a character is in neither list, and proves that adding one leaves the running cycle untouched.

## Bug-fix pass (20 November 2026)
- **Blind Draft rooms:** a third person entering a room code could take over the "Player B" seat of a room that was already full (the seat claim never checked that it had actually won the seat). The claim is now checked, and a full room says so.
- **Blind Draft rooms:** the room code is now kept in the URL, so reloading the page puts you back in the same room and seat, with your locked team restored.
- **Team and result codes:** codes that are too short, repeat a fighter or a role, or point at a role that doesn't exist are now rejected. Before, a hand-edited code could field the same fighter seven times in Versus, or crash the shared-result page.
- **Spin and Blind Draft:** "Discard & reroll" can no longer hand back the fighter you just threw away.
- **Daily:** the streak counter on the puzzle screen now shows 0 once a streak has lapsed (the home screen already did). A puzzle left open past midnight UTC stays on the day it was opened instead of mixing two days' guesses.
- Leaving a screen mid-spin now stops the reel and its sounds.
- Added the missing `supabase-auction.sql` that the README and the in-game error message point to.
- `public/updates.html` is generated at build time and is now git-ignored like the other generated pages.
- Removed the unreachable code-paste flow left over in `src/Versus.jsx`.

## Signature roles always perfect fit (7 November 2026)
- `roleFit` now treats a fighter's signature role as at least 2 matching tags, so it is always "Perfect fit · Signature" (+25). 56 of 156 fighters were only a good fit or no match before.
- Guide text (in-game and generated pages) updated to match.
- Ladder boosts are back at their original values (0.714 up to 1.012). The 7% ladder reduction was removed again.

## New guides (2 November 2026)
- Three new generated guides: `/guides/tier-list` (best picks per role, clutch picks), `/guides/synergy` (every pair, groups of three, single-anime ladder test) and `/guides/auction-strategy` (exact rules, fair prices from 400 seeded simulated auctions).
- New dated `/updates` page; every guide shows an "Updated" date (edit `PAGE_DATES` in `build-content.mjs` when you change a page).
- New pages linked from the home screen, the crawlable intro in `index.html`, the guides hub, the footer and the sitemap.

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
