// The dated log of what changed, newest first. One list, used in two places:
// build-content.mjs turns it into the /updates page, and the home screen shows
// the latest entries under "What's new". Add new entries at the TOP.
//
// Each entry: [date, title, [items]]. Items may contain simple HTML (<a>, <b>);
// the home screen strips the tags and shows plain text.
export const UPDATES = [
  ["21 November 2026", "Fixes, zoom and a steadier Daily", [
    "Four new guides: <a href=\"/guides/first-run\">a full run worked through step by step</a>, <a href=\"/guides/common-mistakes\">six mistakes that end runs early</a>, <a href=\"/guides/daily-strategy\">Daily puzzle strategy with the best opening guesses</a> and <a href=\"/guides/design-notes\">design notes</a> on why the rules are what they are.",
    "You can now pinch to zoom the game on phones and tablets.",
    "The Daily puzzle keeps a fixed order of answers, so adding new fighters no longer reshuffles upcoming puzzles. The streak counter also resets correctly when a streak lapses.",
    "Blind Draft rooms: a full room can no longer be entered by a third player, and reloading the page puts you back in your seat.",
    "Discard and reroll never hands back the fighter you just threw away.",
    "The home page now explains how a run works and how a team is scored, and mistyped addresses show a proper not-found page.",
  ]],
  ["7 November 2026", "Signature roles are always a perfect fit", [
    "A fighter placed in their signature role now always counts as a <a href=\"/guides/scoring\">perfect fit</a>, plus the +10 signature bonus. Before, 56 of the 156 fighters only got a good fit or no tag match there, which looked wrong for their best role.",
    "Opponent teams on the ladder benefit too, since they are placed in the roles that suit them best.",
  ]],
  ["2 November 2026", "New strategy guides", [
    "Added a <a href=\"/guides/tier-list\">tier list with the best picks for every role</a>, including budget picks and clutch fighters for rungs 6 to 10.",
    "Added a <a href=\"/guides/synergy\">synergy guide</a> covering every pair, the groups of three, and a test of single-anime teams on the ladder.",
    "Added an <a href=\"/guides/auction-strategy\">Auction strategy guide</a> with fair prices by tier from simulated auctions.",
    "Every guide now shows when it was last updated.",
  ]],
  ["27 October 2026", "Smoother and faster", [
    "New animations on the home screen, battles and results, with smooth scrolling on desktop. Everything respects your device's reduced-motion setting.",
    "The game now loads less on first visit; Versus and the Daily puzzle download only when you open them.",
  ]],
  ["15 October 2026", "New home screen and game screens", [
    "Redesigned home screen with your rank, XP, best rung and daily streak, all saved on your device.",
    "Spin and Draft screens show your role progress, and you can place a fighter with one tap right under the reel.",
    "Fixed the Daily puzzle search box spilling off narrow phone screens.",
  ]],
  ["13 October 2026", "Guides and character database", [
    "Launched the <a href=\"/guides\">guides</a> and the searchable <a href=\"/characters\">character database</a>.",
    "Removed the advertising bar from game screens.",
  ]],
  ["11 October 2026", "Auction mode", [
    "Versus now has a live <b>Auction</b>: fighters come up one at a time and you bid against your rival with $50.",
  ]],
];
