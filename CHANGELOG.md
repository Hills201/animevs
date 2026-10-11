# Changelog

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
