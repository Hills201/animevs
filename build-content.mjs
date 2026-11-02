#!/usr/bin/env node
/**
 * animeVS content-page generator
 * ---------------------------------------------------------------
 * Runs automatically before every `npm run build` (see "prebuild" in
 * package.json). It reads the game data out of src/App.jsx and writes real,
 * crawlable HTML pages into public/ — guides, the character database, About,
 * Privacy, Contact, plus sitemap.xml and robots.txt.
 *
 * Because every table and number is read from the game's own data, these pages
 * can never drift out of date when you re-rate a fighter or add a duo.
 *
 * Settings you may want to change are in SITE just below.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { pathToFileURL } from "node:url";

const SITE = {
  url: "https://www.animevs.app",   // your live custom domain (animevs.vercel.app redirects here)
  name: "animeVS",
  adClient: "ca-pub-1027225143628108", // AdSense publisher ID
  adSlot: "",                          // paste your ad-unit slot ID here once AdSense approves you. Empty = no ads anywhere.
  kofi: "https://ko-fi.com/animevs",
  contactEmail: "",                    // optional: shown on the Contact and Privacy pages when filled in
  updated: "13 October 2026",          // shown on the Privacy page
};

// ── load the game data ─────────────────────────────────────────────────────
const SRC = process.argv[2] || "src/App.jsx";
const raw = fs.readFileSync(SRC, "utf8");
const a = raw.indexOf("const CHARACTERS"), b = raw.indexOf("const INK =");
if (a < 0 || b <= a) { console.error("build-content: couldn't find the logic section in " + SRC); process.exit(1); }
const tmp = path.join(os.tmpdir(), `animevs-content-${Date.now()}.mjs`);
fs.writeFileSync(tmp, raw.slice(a, b) + `
export { CHARACTERS, LADDER, ROLES, COUNTERS, COUNTER_TIERS, DUOS, DUO_BONUS, TIER_TAG_CAP,
  BUDGET, PICKS, AUCTION_BUDGET, byId, roleFit, fittedRating, counterReward, abilityText,
  resolveRung, activeDuos, mulberry32, AUCTION_MIN_BID, AUCTION_OPEN_MS, AUCTION_RESET_MS, AUCTION_MAX_DRY,
  auctionNew, auctionJoin, auctionStart, auctionOpen, auctionBid, auctionFold, auctionExpire, auctionNext,
  auctionMaxBid, auctionOrder, resolvePvP };`);
const G = await import(pathToFileURL(tmp).href);
fs.unlinkSync(tmp);
const { CHARACTERS, LADDER, ROLES, COUNTERS, COUNTER_TIERS, DUOS, DUO_BONUS, TIER_TAG_CAP,
        BUDGET, PICKS, AUCTION_BUDGET, byId, roleFit, fittedRating, counterReward, abilityText,
        resolveRung, activeDuos, mulberry32, AUCTION_MIN_BID, AUCTION_OPEN_MS, AUCTION_RESET_MS, AUCTION_MAX_DRY,
        auctionNew, auctionJoin, auctionStart, auctionOpen, auctionBid, auctionFold, auctionExpire, auctionNext,
        auctionMaxBid, auctionOrder, resolvePvP } = G;

// ── helpers ────────────────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const roleName = (id) => (ROLES.find((r) => r.id === id) || { name: id }).name;
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const tagChip = (t) => `<span class="tag t-${t}">${esc(t)}</span>`;
const TIERS = ["SS", "S", "A", "B", "C"];
const TAGS = [...new Set(CHARACTERS.flatMap((c) => c.tags))].sort();
const MINCOST = Math.min(...CHARACTERS.map((c) => c.cost));
const MAXCOST = Math.max(...CHARACTERS.map((c) => c.cost));
const SERIES = [...new Set(CHARACTERS.map((c) => c.series))].sort();
const avg = (xs) => xs.reduce((s, x) => s + x, 0) / Math.max(xs.length, 1);
const OUT = "public";
const written = [];
const words = (html) => html.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>|<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

const TAG_MEANING = {
  melee: "Close-quarters fighters who win by reaching their target: swordsmen, brawlers, martial artists.",
  range: "Fighters who strike from a distance with beams, projectiles, blasts or thrown weapons.",
  mobility: "Fighters who control space: teleporters, fliers, and anyone who closes or opens distance at will.",
  barrier: "Defensive specialists: shields, walls, domains and anything that blocks incoming attacks.",
  element: "Elemental or element-like power such as fire, ice, lightning, water, earth and wind.",
  giant: "Fighters who win through sheer size, mass or durability.",
  aura: "Presence-based power: haki, spiritual pressure, killing intent and similar force of will.",
  summon: "Fighters who fight through other bodies: summons, familiars, clones, puppets and shikigami.",
  speed: "Raw speed and reflexes, separate from positioning. How fast they act rather than where they can go.",
  energy: "Deep reserves of ki, chakra, cursed energy or similar. The fighters who rarely run out.",
  stealth: "Concealment, ambush and misdirection.",
  psychic: "Mind and telekinetic powers, from mental attacks to moving things without touching them.",
  regen: "Fighters who recover from damage mid-fight, or can barely be killed.",
  transform: "Fighters with forms, awakenings or power-ups that change what they are.",
  heal: "Fighters who can restore others, not just themselves.",
};

// ── page shell ─────────────────────────────────────────────────────────────
const CSS = `
:root{--ink:#0b0c10;--panel:#14151a;--line:rgba(255,255,255,.12);--text:#e7e5e4;--muted:#a8a29e;--red:#ff2d35;--gold:#f59e0b}
*{box-sizing:border-box}html{background:var(--ink)}
body{margin:0;background:var(--ink);color:var(--text);font:17px/1.65 'Barlow',system-ui,sans-serif;-webkit-text-size-adjust:100%}
a{color:#ff8a8f;text-underline-offset:3px}a:hover{color:#fff}
.wrap{max-width:820px;margin:0 auto;padding:0 20px}
.wide{max-width:1100px}
header.site{border-bottom:1px solid var(--line);background:linear-gradient(180deg,rgba(255,45,53,.10),transparent)}
header.site .wrap{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-top:16px;padding-bottom:16px;flex-wrap:wrap}
.logo{font:400 30px/1 'Anton',Impact,sans-serif;color:#fff;text-decoration:none;letter-spacing:.01em}.logo b{color:var(--red);font-weight:400}
nav.site{display:flex;gap:6px;flex-wrap:wrap}
nav.site a{font:700 13px/1 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);text-decoration:none;padding:9px 12px;border:1px solid var(--line);border-radius:8px}
nav.site a:hover,nav.site a.on{color:#fff;border-color:var(--red)}
nav.site a.play{background:var(--red);border-color:var(--red);color:#fff}
main{padding:34px 0 60px}
h1{font:400 clamp(34px,6vw,52px)/1.05 'Anton',Impact,sans-serif;margin:0 0 12px;color:#fff}
h2{font:400 28px/1.15 'Anton',Impact,sans-serif;margin:42px 0 10px;color:#fff;letter-spacing:.01em}
h3{font:700 20px/1.25 'Barlow Condensed',sans-serif;margin:26px 0 6px;color:#fff;letter-spacing:.03em}
p{margin:0 0 14px}.lede{font-size:20px;color:#d6d3d1}.muted{color:var(--muted)}.small{font-size:14px}
ul,ol{padding-left:22px;margin:0 0 16px}li{margin:5px 0}
.crumbs{font:700 12px 'Barlow Condensed',sans-serif;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-bottom:14px}
.crumbs a{color:var(--muted)}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px;margin:18px 0}
.card{display:block;padding:18px;border:1px solid var(--line);border-radius:14px;background:linear-gradient(160deg,rgba(255,45,53,.10),rgba(255,255,255,.02) 60%);text-decoration:none;color:var(--text)}
.card:hover{border-color:var(--red)}.card h3{margin:0 0 6px;font-size:22px}.card p{margin:0;color:var(--muted);font-size:15px;line-height:1.5}
.box{padding:16px 18px;border:1px solid var(--line);border-radius:12px;background:rgba(255,255,255,.03);margin:16px 0}
.box.gold{border-color:rgba(245,158,11,.4);background:rgba(245,158,11,.06)}
.tablewrap{overflow-x:auto;border:1px solid var(--line);border-radius:12px;margin:14px 0}
table{border-collapse:collapse;width:100%;font-size:15px;line-height:1.4}
th,td{padding:9px 12px;text-align:left;border-bottom:1px solid rgba(255,255,255,.07);vertical-align:top}
th{font:700 12px 'Barlow Condensed',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);background:rgba(255,255,255,.04);position:sticky;top:0;white-space:nowrap}
tr:last-child td{border-bottom:none}td.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.tag{display:inline-block;margin:1px 3px 1px 0;padding:1px 8px;border-radius:99px;font:700 11px/1.5 'Barlow Condensed',sans-serif;letter-spacing:.08em;text-transform:uppercase;background:#292524;color:#d6d3d1;border:1px solid #57534e}
.t-range{background:#0e3a5c;color:#7dd3fc}.t-melee{background:#5c1620;color:#fda4af}.t-mobility{background:#0f3d2e;color:#6ee7b7}.t-barrier{background:#5c4410;color:#fcd34d}.t-element{background:#3b1e5c;color:#c4b5fd}.t-giant{background:#5c3410;color:#fdba74}.t-aura{background:#5c1550;color:#f0abfc}.t-summon{background:#0f4a4a;color:#5eead4}.t-speed{background:#0c4a4e;color:#67e8f9}.t-energy{background:#4a3410;color:#fde047}.t-stealth{background:#1e293b;color:#cbd5e1}.t-psychic{background:#4a1d4f;color:#f0abfc}.t-regen{background:#14432a;color:#86efac}.t-transform{background:#4a2410;color:#fdba74}.t-heal{background:#134e3a;color:#6ee7b7}
.tier{display:inline-block;min-width:26px;text-align:center;padding:0 6px;border-radius:4px;font:400 13px/1.5 'Anton',sans-serif;color:#0b0c10}
.tier-SS{background:#ff4d6d}.tier-S{background:#fbbf24}.tier-A{background:#f0abfc}.tier-B{background:#7dd3fc}.tier-C{background:#a8a29e}
.cta{display:inline-block;margin:6px 0 0;padding:13px 22px;border-radius:10px;background:var(--red);color:#fff;font:400 20px/1 'Anton',sans-serif;letter-spacing:.04em;text-decoration:none}
.cta:hover{color:#fff;filter:brightness(1.1)}
input[type=search],select{font:inherit;color:var(--text);background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:9px;padding:10px 12px}
input[type=search]{flex:1;min-width:200px}.filters{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0}
.jump{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 0}.jump a{font-size:13px;padding:4px 10px;border:1px solid var(--line);border-radius:99px;text-decoration:none;color:var(--muted)}
.adslot{margin:28px 0;text-align:center;min-height:90px}
footer.site{border-top:1px solid var(--line);padding:26px 0 40px;color:var(--muted);font-size:14px}
footer.site .links{display:flex;gap:6px 18px;flex-wrap:wrap;margin-bottom:12px}footer.site a{color:var(--muted)}footer.site a:hover{color:#fff}
@media(max-width:560px){body{font-size:16px}h2{font-size:25px}th,td{padding:8px 9px;font-size:14px}}
`;

const NAV = [["/guides", "Guides"], ["/characters", "Characters"], ["/about", "About"]];
function adUnit() {
  if (!SITE.adSlot) return "";
  return `<div class="adslot"><ins class="adsbygoogle" style="display:block" data-ad-client="${SITE.adClient}" data-ad-slot="${SITE.adSlot}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></div>`;
}
// Dates shown under each page title. Bump a page's date when you change its writing.
const PAGE_DATES = {
  "/guides": "2 November 2026", "/guides/how-to-play": "13 October 2026", "/guides/scoring": "13 October 2026",
  "/guides/counters": "13 October 2026", "/guides/ladder": "13 October 2026", "/guides/budget-strategy": "13 October 2026",
  "/guides/tier-list": "2 November 2026", "/guides/synergy": "2 November 2026", "/guides/auction-strategy": "2 November 2026",
  "/characters": "2 November 2026", "/updates": "2 November 2026",
};
function shell({ file, canonical, title, description, body, wide = false, active = "" }) {
  const dated = PAGE_DATES[canonical];
  if (dated) body = body.replace(/(<h1>[\s\S]*?<\/h1>)/, `$1\n<p class="small muted" style="margin-top:-6px">Updated ${dated}</p>`);
  const full = `${title} | ${SITE.name}`;
  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE.url}${canonical}">
<meta property="og:type" content="article"><meta property="og:site_name" content="${SITE.name}">
<meta property="og:title" content="${esc(full)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${SITE.url}${canonical}">
<meta name="theme-color" content="#0b0c10">
<link rel="icon" type="image/x-icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;600&display=swap">
<style>${CSS}</style>
${SITE.adClient ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adClient}" crossorigin="anonymous"></script>` : ""}
</head><body>
<header class="site"><div class="wrap${wide ? " wide" : ""}">
<a class="logo" href="/">ANIME<b>VS</b></a>
<nav class="site">${NAV.map(([h, l]) => `<a href="${h}"${active === h ? ' class="on"' : ""}>${l}</a>`).join("")}<a class="play" href="/">Play free</a></nav>
</div></header>
<main><div class="wrap${wide ? " wide" : ""}">
${body}
</div></main>
<footer class="site"><div class="wrap${wide ? " wide" : ""}">
<div class="links"><a href="/">Play</a><a href="/guides">Guides</a><a href="/characters">Characters</a><a href="/updates">Updates</a><a href="/about">About</a><a href="/privacy">Privacy</a><a href="/contact">Contact</a></div>
<div>${SITE.name} is a free, independent fan project. Character names and series belong to their respective creators and rights holders; this site is not affiliated with or endorsed by any of them. Ratings and rules are the game's own and are not official.</div>
</div></footer>
</body></html>`;
  const out = path.join(OUT, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  written.push({ file, canonical, words: words(body) });
}
const crumbs = (...items) => `<div class="crumbs">${items.map(([h, l]) => (h ? `<a href="${h}">${l}</a>` : l)).join(" / ")}</div>`;
const table = (head, rows, cls = []) => `<div class="tablewrap"><table><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td${cls[i] ? ` class="${cls[i]}"` : ""}>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
const tierBadge = (t) => `<span class="tier tier-${t}">${t}</span>`;

// ── derived data ───────────────────────────────────────────────────────────
const byTier = Object.fromEntries(TIERS.map((t) => [t, CHARACTERS.filter((c) => c.tier === t)]));
const tagCounts = Object.fromEntries(TAGS.map((t) => [t, CHARACTERS.filter((c) => c.tags.includes(t)).length]));
const edgesWhere = (tag, side) => COUNTERS.filter((c) => c[side] === tag);
const tierOrder = { strong: 0, core: 1, situational: 2 };
const label = (c) => `${cap(c.win)} &gt; ${cap(c.lose)}`;

// ════════════════════════════════════════════════════════════════════════════
// GUIDES HUB
// ════════════════════════════════════════════════════════════════════════════
const GUIDES = [
  ["/guides/how-to-play", "How to play animeVS", "Every mode explained: Spin, Draft, Versus (Blind and Auction) and the Daily puzzle, plus the seven roles."],
  ["/guides/scoring", "How scoring works", "The eight layers that turn a team of seven into a score: role fit, signature bonus, abilities, counters, synergy and the ladder boost."],
  ["/guides/counters", "The tag counter web", "All 13 counter relationships, what each tag beats and what beats it, and how big the reward gets."],
  ["/guides/ladder", "The 10-rung ladder", "Every opponent team on the ladder, what tags they lean on, and the counters worth building against them."],
  ["/guides/budget-strategy", "Budget strategy for Draft and Auction", "Which fighters give the most rating per credit, which cost more than they are worth, and how to bid."],
  ["/guides/tier-list", "Tier list and best picks by role", "Every tier ranked, the strongest fighter for each of the seven roles, and the clutch picks for the back half of the ladder."],
  ["/guides/synergy", "Synergy pairs and single-anime squads", "All the duo bonuses, the cheapest ways to stack them, and how far a team from just one anime gets up the ladder."],
  ["/guides/auction-strategy", "Auction strategy", "The live Auction's exact rules, what a fair price looks like by tier, and what hundreds of simulated auctions say about spending."],
];
shell({
  file: "guides.html", canonical: "/guides", active: "/guides",
  title: "Guides", description: "Guides to animeVS: how each mode works, how scoring is calculated, the counter system, every rung of the ladder, and budget strategy for Draft and Auction.",
  body: `${crumbs(["/", "Home"], [null, "Guides"])}
<h1>animeVS guides</h1>
<p class="lede">animeVS looks simple, since you pick seven fighters and put them in seven roles, but there is a lot of arithmetic underneath. These guides explain it, using the game's own live data so the numbers always match what you see in play.</p>
<div class="cards">${GUIDES.map(([h, t, d]) => `<a class="card" href="${h}"><h3>${t}</h3><p>${d}</p></a>`).join("")}
<a class="card" href="/characters"><h3>Character database</h3><p>All ${CHARACTERS.length} fighters across ${SERIES.length} series with tier, rating, cost, tags, signature role and ability. Searchable.</p></a></div>
<p>New to the game? Start with <a href="/guides/how-to-play">How to play</a>, then jump into a Spin run, which is the quickest way to learn how roles and tags interact. When you are ready to improve, <a href="/guides/scoring">How scoring works</a> and the <a href="/guides/ladder">ladder guide</a> are where the wins come from.</p>
<p><a class="cta" href="/">Play animeVS</a></p>`,
});

// ════════════════════════════════════════════════════════════════════════════
// HOW TO PLAY
// ════════════════════════════════════════════════════════════════════════════
shell({
  file: "guides/how-to-play.html", canonical: "/guides/how-to-play", active: "/guides",
  title: "How to play animeVS", description: "How to play animeVS: Spin, Draft, live Versus (Blind Draft and Auction) and the Daily puzzle, plus the seven roles and what each one wants.",
  body: `${crumbs(["/", "Home"], ["/guides", "Guides"], [null, "How to play"])}
<h1>How to play animeVS</h1>
<p class="lede">animeVS is a team-building game. You assemble seven anime fighters, place each into one of seven roles, and your team is scored against an opponent: ten ladder teams in solo play, or a real person in Versus. It is free, needs no account and runs in your browser.</p>
<h2>The goal</h2>
<p>Every fighter has a rating, a tier, a handful of tags and often a special ability. Your team's score is built from all of those, plus how well each fighter suits the role you put them in. Higher score wins. The skill is in <em>which</em> seven you choose and <em>where</em> you put them, which is why a well-built team of lower-rated fighters can beat a team of stars.</p>
<h2>The seven roles</h2>
<p>Every team has the same seven slots. Each role "wants" certain tags. A fighter placed in a role that wants their tags gets a bonus, covered in <a href="/guides/scoring">How scoring works</a>.</p>
${table(["Role", "What it is", "Tags it wants"], ROLES.map((r) => [`<b>${esc(r.name)}</b>`, esc(r.blurb), r.wants.map(tagChip).join(" ")]))}
<h2>Spin mode</h2>
<ol>
<li>Press <b>Spin</b>. A reel runs and one random fighter lands.</li>
<li>Either <b>place</b> them into an empty role, or <b>discard and reroll</b>. You get one reroll per run, so use it carefully.</li>
<li>Repeat until all seven roles are filled, then <b>climb the ladder</b>.</li>
</ol>
<p>Spin is pure luck of the draw softened by one choice: where to put each fighter. It is the best mode for learning how tags and roles interact.</p>
<h2>Draft mode</h2>
<ol>
<li>You have a budget of <b>${BUDGET} credits</b> to build all seven fighters. Stronger fighters cost more (from ${MINCOST} to ${MAXCOST} credits in the current roster).</li>
<li>Each draw shows <b>five options</b>. Pick one that fits your budget and an open role, or reroll the draw (two rerolls per run).</li>
<li>The game always keeps enough budget in reserve to finish your team. The most you can spend on a pick is your remaining budget minus the cheapest fighter's cost for every slot still empty after this one, so you can never get stuck.</li>
</ol>
<p>Draft is harder than Spin because you cannot simply take the best fighter on offer every time. The budget forces trade-offs. See the <a href="/guides/budget-strategy">budget strategy guide</a>.</p>
<h2>Versus: two live formats</h2>
<p>Versus is for two players in a shared room. One creates a room and shares a six-character code or invite link, the other joins, and there are two formats.</p>
<h3>Blind Draft</h3>
<p>Both players spin and build their seven in private, using the same rules as Spin mode. Neither sees the other's picks. When both lock in, the two teams are revealed together and scored head to head.</p>
<h3>Auction</h3>
<p>Fighters come up for sale one at a time. A reel spins, a fighter appears, and both players bid against a clock. Each player starts with <b>$${AUCTION_BUDGET}</b>. Every bid resets a short countdown, and when it runs out the top bidder pays what they bid and takes the fighter. A fighter you win can never be your rival's, so every purchase also takes something away from the other side. Winners place each fighter into a role immediately, and $1 per empty slot is always held back so nobody ends up short of a full team. Auction tactics are in the <a href="/guides/budget-strategy#auction">budget strategy guide</a>.</p>
<h2>Daily puzzle</h2>
<p>Each day has one mystery character, the same for everyone. You have seven guesses. After each guess you see how it compares to the answer across six clue columns (colour-coded green for a match, amber for close, grey for a miss, with arrows for higher or lower), so you can narrow it down. Your streak is saved in your browser.</p>
<h2>The ladder</h2>
<p>In Spin and Draft your finished team climbs a ladder of ten opponent teams, each built from one anime's strongest fighters and each tougher than the last. You keep climbing until you lose a fight or clear all ten. The full list, with what each opponent is weak to, is in the <a href="/guides/ladder">ladder guide</a>.</p>
<p><a class="cta" href="/">Start playing</a></p>
${adUnit()}`,
});

// ════════════════════════════════════════════════════════════════════════════
// SCORING
// ════════════════════════════════════════════════════════════════════════════
// Worked example, computed from real data so it can't go stale.
const exChar = byId("might-guy-naruto") || CHARACTERS.find((c) => c.tier === "A");
const exRoles = ROLES.map((r) => ({ r, fit: roleFit(exChar, r.id), total: fittedRating(exChar, r.id) }));
const exBest = exRoles.reduce((m, x) => (x.total > m.total ? x : m));
const exWorst = exRoles.reduce((m, x) => (x.total < m.total ? x : m));
const abilityKinds = [
  ["Role synergy", "A bonus to the fighter's own rating when placed in one specific role named on their ability, for example +5 as Tank."],
  ["Clutch", "A bonus that only applies on rungs 6 to 10 of the solo ladder. It does nothing in Versus, which has no rung number."],
  ["Overwhelm", "A bonus that applies only if this fighter has the highest base rating on your team."],
  ["Adaptable", "Guarantees at least a Good fit bonus (+5) even when none of the fighter's tags match the role."],
  ["Aura buff", "Gives a bonus to the fighters in the roles on either side of this one. Roles are ordered Captain, Vice-Captain, Tank, Damage, Support, Support II, Healer, so seating matters."],
  ["Tag projection", "Counts as an extra copy of a tag, for counter calculations only. It never changes the fighter's real tags or role fit."],
  ["Counter immunity", "Cancels the single strongest counter bonus the opponent would otherwise earn against you."],
  ["Rival bonus", "A flat bonus on the solo ladder when facing a specific anime's team."],
];
shell({
  file: "guides/scoring.html", canonical: "/guides/scoring", active: "/guides",
  title: "How scoring works in animeVS", description: "How animeVS calculates a team score: base rating, role fit, signature bonus, abilities, aura, counters, duo synergy and ladder boost, with a worked example.",
  body: `${crumbs(["/", "Home"], ["/guides", "Guides"], [null, "Scoring"])}
<h1>How scoring works</h1>
<p class="lede">A team's score is simple addition on top of each fighter's rating. There is no hidden multiplier on your side, so you can always work out where every point came from. This guide walks through each layer in the order the game applies them.</p>
<h2>1. Base rating</h2>
<p>Every fighter has a rating from roughly 55 to 99, set by how powerful they are in their own story. It sits next to their tier: <b>SS</b>, <b>S</b>, <b>A</b>, <b>B</b> or <b>C</b>. Currently there are ${TIERS.map((t) => `${byTier[t].length} ${t}`).join(", ")}. Tier also caps how many tags a fighter can carry (${TIERS.map((t) => `${t}: ${TIER_TAG_CAP[t]}`).join(", ")}), so the strongest fighters are also the most versatile.</p>
<h2>2. Role fit</h2>
<p>Each role wants certain tags. When you place a fighter, the game counts how many of their tags the role wants and adds a flat bonus.</p>
${table(["Matching tags", "Result", "Bonus"], [["2 or more", "Perfect fit", "+15"], ["1", "Good fit", "+5"], ["0", "Misfit", "+0"]], ["", "", "n"])}
<p>A misfit is never punished. It just misses out on the bonus.</p>
<h2>3. Signature role</h2>
<p>Every fighter has one role they are known for. Place them there and they earn a further <b>+10</b>, stacking with tag fit. Even a fighter whose tags don't match still gets the +10 in their signature role. A fighter in their signature role with two or more matching tags earns <b>+25</b> over their base rating.</p>
<div class="box"><b>Worked example: ${esc(exChar.name)}</b> (${esc(exChar.series)}, rating ${exChar.rating}, signature role ${esc(roleName(exChar.role))}).
<ul>
<li>In <b>${esc(exBest.r.name)}</b>: ${exBest.fit.label.toLowerCase()}, ${exBest.fit.bonus >= 0 ? "+" : ""}${exBest.fit.bonus} on top of ${exChar.rating} = <b>${exBest.total}</b>.</li>
<li>In <b>${esc(exWorst.r.name)}</b>: ${exWorst.fit.label.toLowerCase()}, +${exWorst.fit.bonus} on top of ${exChar.rating} = <b>${exWorst.total}</b>.</li>
</ul>
Same fighter, a ${exBest.total - exWorst.total}-point swing from where you seat them.</div>
<h2>4. Abilities</h2>
<p>Most fighters have one ability. There are eight kinds:</p>
${table(["Ability type", "What it does"], abilityKinds.map(([a, d]) => [`<b>${a}</b>`, d]))}
<h2>5. Counters</h2>
<p>Your whole team can earn a bonus by out-countering the opponent's tags. This is covered in detail in <a href="/guides/counters">the counter guide</a>. In short: each of 13 relationships, such as Barrier &gt; Element, pays a bonus when your team has more of the winning tag than the opponent has of the losing tag. Rewards start at ${COUNTER_TIERS.situational.one}, ${COUNTER_TIERS.core.one} or ${COUNTER_TIERS.strong.one}, grow by 5 for each extra tag of advantage, and cap at +20.</p>
<h2>6. Duo synergy</h2>
<p>Some fighters have history: parent and child, master and student, sworn rivals, lifelong partners. If both halves of a pairing are on your team, you earn a flat <b>+${DUO_BONUS}</b>, regardless of which roles they hold. The game has ${DUOS.length} pairings across ${new Set(DUOS.map((d) => byId(d[0])?.series)).size} series. Groups of three, like the Shiganshina Trio, count as three pairs and stack to +${DUO_BONUS * 3}.</p>
<p>On the solo ladder, synergy is yours alone, because the ladder teams are canon squads packed with duos and would otherwise run away with it. In Versus, both players get it.</p>
<h2>7. The ladder boost</h2>
<p>On the solo ladder, each opponent team's base score is multiplied by a boost that rises from <b>${Math.min(...LADDER.map((l) => l.boost))}</b> on rung 1 to <b>${Math.max(...LADDER.map((l) => l.boost))}</b> on rungs 9 and 10. This is what makes later rungs harder. Your team is never multiplied.</p>
<h2>8. The result</h2>
<p>Your total is the sum of every fighter's rating, fit and ability bonuses, plus any counter and synergy bonus. The higher total wins. In Versus both teams are scored the same way against each other with no boost.</p>
<p>Next: <a href="/guides/counters">the tag counter web</a> or the <a href="/guides/ladder">ladder guide</a>.</p>
${adUnit()}`,
});

// ════════════════════════════════════════════════════════════════════════════
// COUNTERS
// ════════════════════════════════════════════════════════════════════════════
const counterRows = [...COUNTERS].sort((x, y) => tierOrder[x.tier] - tierOrder[y.tier]).map((c) => [
  `<b>${label(c)}</b>`, `${tagChip(c.win)} beats ${tagChip(c.lose)}`, COUNTER_TIERS[c.tier].label, `+${counterReward(c, 1)}`, `+${counterReward(c, 2)}`, `+${counterReward(c, 3)}`,
]);
shell({
  file: "guides/counters.html", canonical: "/guides/counters", active: "/guides",
  title: "The animeVS tag counter web", description: "All 13 tag counter relationships in animeVS, what each tag beats and is weak to, how rewards scale with tag advantage, and what every tag means.",
  body: `${crumbs(["/", "Home"], ["/guides", "Guides"], [null, "Counters"])}
<h1>The tag counter web</h1>
<p class="lede">Every fighter carries tags such as melee, barrier or stealth. Tags are not just labels: 13 of them beat other tags, and a team that has more of the winning tag than the opponent has of the losing one earns a bonus. It is how a lower-rated team beats a stronger one.</p>
<h2>How a counter pays out</h2>
<p>For each relationship, the game compares your count of the winning tag against the opponent's count of the losing tag. If you have more, you earn the edge. Your <em>advantage</em> is the difference. The reward starts at a base set by the relationship's tier (${COUNTER_TIERS.situational.label} ${COUNTER_TIERS.situational.one}, ${COUNTER_TIERS.core.label} ${COUNTER_TIERS.core.one}, ${COUNTER_TIERS.strong.label} ${COUNTER_TIERS.strong.one}), then adds 5 for each extra point of advantage, capped at +20.</p>
${table(["Relationship", "Meaning", "Tier", "Advantage 1", "Advantage 2", "Advantage 3+"], counterRows, ["", "", "", "n", "n", "n"])}
<p class="small muted">Counter immunity abilities cancel the opponent's single strongest counter bonus. Tag projection abilities count as an extra copy of a tag for this calculation only.</p>
<h2>What each tag beats, and what beats it</h2>
<p>Use this as a cheat sheet when you can see what the opponent is carrying. The count column is how many of the ${CHARACTERS.length} fighters have the tag, which tells you how easy it is to stack.</p>
${table(["Tag", "Fighters", "Beats", "Weak to"], TAGS.map((t) => [
  tagChip(t), String(tagCounts[t]),
  edgesWhere(t, "win").map((c) => tagChip(c.lose)).join(" ") || '<span class="muted">nothing</span>',
  edgesWhere(t, "lose").map((c) => tagChip(c.win)).join(" ") || '<span class="muted">nothing</span>',
]), ["", "n", "", ""])}
<h2>What the tags mean</h2>
<ul>${TAGS.map((t) => `<li>${tagChip(t)} ${esc(TAG_MEANING[t] || "")}</li>`).join("")}</ul>
<h2>Using counters when you build</h2>
<ul>
<li><b>Count before you commit.</b> One extra copy of a strong-tier tag can be worth more than a handful of rating points. A single point of advantage on a Strong relationship pays +${COUNTER_TIERS.strong.one}.</li>
<li><b>Stacking beats spreading.</b> Because the reward grows with advantage, concentrating on one or two winning tags usually pays more than collecting a little of everything.</li>
<li><b>Mind your own weak spot.</b> If your whole team is melee, every opponent with range tags is earning Range &gt; Melee against you.</li>
<li><b>Check the ladder.</b> Each rung has a predictable tag profile, and the <a href="/guides/ladder">ladder guide</a> lists the counters worth chasing against each.</li>
</ul>
${adUnit()}`,
});

// ════════════════════════════════════════════════════════════════════════════
// LADDER
// ════════════════════════════════════════════════════════════════════════════
const rungHtml = LADDER.map((rung) => {
  const chars = rung.team.map(byId);
  const counts = {};
  chars.forEach((c) => c.tags.forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
  const top = Object.entries(counts).sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1)).slice(0, 4);
  const opps = COUNTERS.map((e) => ({ e, n: counts[e.lose] || 0 })).filter((x) => x.n > 0)
    .sort((x, y) => counterReward(y.e, 1) - counterReward(x.e, 1) || y.n - x.n).slice(0, 3);
  const bonus = rung.rung >= 6 ? " From this rung up, <b>clutch</b> abilities on your team switch on." : "";
  return `<h2 id="rung-${rung.rung}">Rung ${rung.rung}: ${esc(rung.title)}</h2>
<p><b>${esc(rung.universe)}</b> &middot; opponent boost <b>${rung.boost}</b> &middot; average rating <b>${avg(chars.map((c) => c.rating)).toFixed(1)}</b>.${bonus}</p>
${table(["Fighter", "Tier", "Rating", "Tags"], chars.map((c) => [`<b>${esc(c.name)}</b>`, tierBadge(c.tier), String(c.rating), c.tags.map(tagChip).join(" ")]), ["", "", "n", ""])}
<p><b>Their profile:</b> ${top.map(([t, n]) => `${n} &times; ${tagChip(t)}`).join(" ")}.</p>
<p><b>Counters worth building toward:</b></p>
<ul>${opps.map(({ e, n }) => `<li>${label(e)}: they field ${n} ${e.lose}-tagged fighter${n > 1 ? "s" : ""}. Bring more than ${n} ${e.win} tag${n > 0 ? "s" : ""} to earn +${counterReward(e, 1)}, rising to +${Math.min(20, counterReward(e, 1) + 5)} with one more.</li>`).join("")}</ul>`;
}).join("\n");
shell({
  file: "guides/ladder.html", canonical: "/guides/ladder", active: "/guides",
  title: "The animeVS 10-rung ladder", description: "Every opponent on the animeVS ladder: all ten teams, their fighters and tags, the boost each gets, and the tag counters worth building toward on each rung.",
  body: `${crumbs(["/", "Home"], ["/guides", "Guides"], [null, "Ladder"])}
<h1>The 10-rung ladder</h1>
<p class="lede">In Spin and Draft, your team climbs ten opponent teams in a fixed order. Each is the seven highest-rated fighters of a single anime, and each is boosted a little more than the last. You keep climbing until you lose a fight or clear the top.</p>
<p>The ladder is hard on purpose. In our own testing, 1,500 random legal teams reached an average of about four rungs, and none of them cleared all ten. A team built carefully inside the ${BUDGET}-credit Draft budget can clear every rung, so the top is reachable but earned.</p>
<div class="box gold"><b>How opponents are scored:</b> each ladder team is placed in the roles that suit it best, scored like yours, then its base score is multiplied by the rung's boost (shown below). Ladder teams do not earn duo synergy, but you do. Your team is never multiplied.</div>
${table(["Rung", "Opponent", "Anime", "Boost"], LADDER.map((r) => [String(r.rung), `<a href="#rung-${r.rung}">${esc(r.title)}</a>`, esc(r.universe), String(r.boost)]), ["n", "", "", "n"])}
${adUnit()}
${rungHtml}
<h2>General advice for the climb</h2>
<ul>
<li><b>Rungs 1 to 3 are the proving ground.</b> Most teams that fail early fail because they ignored role fit. Check every placement.</li>
<li><b>Rungs 4 to 5 punish stacking one tag.</b> Opponents here carry several relationships you may be weak to.</li>
<li><b>Rungs 6 to 10 reward clutch abilities</b> and duo synergy. These are the rungs where an extra +12 or +25 decides the fight.</li>
<li><b>The last two rungs share the highest boost.</b> There is no soft landing at the top.</li>
</ul>
<p><a class="cta" href="/">Climb the ladder</a></p>`,
});

// ════════════════════════════════════════════════════════════════════════════
// BUDGET STRATEGY
// ════════════════════════════════════════════════════════════════════════════
const tierStats = TIERS.map((t) => [tierBadge(t), String(byTier[t].length), avg(byTier[t].map((c) => c.cost)).toFixed(1), avg(byTier[t].map((c) => c.rating)).toFixed(1), (avg(byTier[t].map((c) => c.rating)) / avg(byTier[t].map((c) => c.cost))).toFixed(1)]);
const valueOf = (c) => c.rating / c.cost;
const bestValue = [...CHARACTERS].filter((c) => c.rating >= 80).sort((x, y) => valueOf(y) - valueOf(x) || y.rating - x.rating).slice(0, 15);
const priciest = [...CHARACTERS].sort((x, y) => valueOf(x) - valueOf(y) || x.rating - y.rating).slice(0, 12);
const vrow = (c) => [`<b>${esc(c.name)}</b><br><span class="muted small">${esc(c.series)}</span>`, tierBadge(c.tier), String(c.rating), String(c.cost), valueOf(c).toFixed(1), esc(roleName(c.role))];
shell({
  file: "guides/budget-strategy.html", canonical: "/guides/budget-strategy", active: "/guides",
  title: "Budget strategy for Draft and Auction", description: "Which animeVS fighters give the most rating per credit and which cost more than they are worth, plus practical strategy for Draft mode and live Auction bidding.",
  body: `${crumbs(["/", "Home"], ["/guides", "Guides"], [null, "Budget strategy"])}
<h1>Budget strategy for Draft and Auction</h1>
<p class="lede">Draft gives you ${BUDGET} credits for seven fighters. Auction gives you $${AUCTION_BUDGET}. They use the same scale, so a fighter's credit cost is a good guide to what they are worth in an auction too. This guide shows where the bargains are, using the game's real numbers.</p>
<h2>What each tier costs</h2>
${table(["Tier", "Fighters", "Average cost", "Average rating", "Rating per credit"], tierStats, ["", "n", "n", "n", "n"])}
<p>Seven fighters on ${BUDGET} credits works out to about ${(BUDGET / PICKS).toFixed(1)} each. You cannot afford seven SS-tier fighters. A winning team is a few stars surrounded by well-chosen, cheaper fighters who fit their roles.</p>
<h2>Best value: strong fighters for the price</h2>
<p>Fighters rated 80 or higher, ranked by rating per credit. These are the ones that let you spend elsewhere.</p>
${table(["Fighter", "Tier", "Rating", "Cost", "Per credit", "Signature role"], bestValue.map(vrow), ["", "", "n", "n", "n", ""])}
${adUnit()}
<h2>Priciest for what you get</h2>
<p>These cost the most relative to their rating. That is not a reason to avoid them, since abilities, tags and duo partners matter beyond the number, but they should have a clear job on your team.</p>
${table(["Fighter", "Tier", "Rating", "Cost", "Per credit", "Signature role"], priciest.map(vrow), ["", "", "n", "n", "n", ""])}
<h2>Draft tips</h2>
<ul>
<li><b>Fit is worth a star's price.</b> A perfect fit in the signature role adds +25. A cheaper fighter in the right seat can outscore a more expensive one in the wrong seat.</li>
<li><b>Plan for duos.</b> A pairing is worth +${DUO_BONUS}, which is more than the gap between many neighbouring fighters. If one half comes up cheaply, look for the other.</li>
<li><b>Don't blow the budget early.</b> The reserve rule stops you getting stuck, but the cheapest fighters are far weaker than average. Leave room for at least one or two mid-priced picks.</li>
<li><b>Use rerolls on bad boards, not good ones.</b> Two rerolls per run are for draws where nothing fits.</li>
</ul>
<h2 id="auction">Auction tips</h2>
<p>In the live Auction, a fighter is on offer to both players and only one can have them. That changes the maths in a few ways. For the full rules and prices from simulated auctions, see the <a href="/guides/auction-strategy">Auction strategy guide</a>.</p>
<ul>
<li><b>Anchor to the credit cost.</b> It is a fair-price guide on the same scale as your $${AUCTION_BUDGET}. Paying well over it for a fighter needs a reason, such as a perfect fit or a duo partner you already hold.</li>
<li><b>Every win is also a denial.</b> A fighter you buy is gone from your rival for good. Sometimes pushing the price up on a fighter you don't want hurts them by draining their money. Be careful: it can leave you holding the fighter.</li>
<li><b>The reserve rule shapes late bidding.</b> Each player always keeps $1 for every empty slot. Your cap per bid shrinks as you fill slots, so your cheap picks are best taken early or late, not by accident in the middle.</li>
<li><b>If your rival cannot raise, the lot sells at once.</b> A bid that exceeds what they can afford ends it immediately. Knowing their remaining money tells you when a modest bid is enough.</li>
<li><b>Passing is a move.</b> A rival who passes on a lot concedes it to you at the current bid, so you can pick up value when they are conserving money.</li>
<li><b>Think about roles as you win.</b> You must place each fighter straight away, so the role fit hints on the placement buttons are part of your decision to bid.</li>
</ul>
<p><a class="cta" href="/">Try a Draft run</a></p>`,
});

// ════════════════════════════════════════════════════════════════════════════
// CHARACTER DATABASE
// ════════════════════════════════════════════════════════════════════════════
const sections = SERIES.map((s) => {
  const list = CHARACTERS.filter((c) => c.series === s).sort((x, y) => y.rating - x.rating || (x.name < y.name ? -1 : 1));
  return `<section class="series" id="${slug(s)}"><h2>${esc(s)} <span class="muted small">${list.length} fighters</span></h2>
${table(["Fighter", "Tier", "Rating", "Cost", "Signature role", "Tags", "Ability"], list.map((c) => [
    `<b>${esc(c.name)}</b>`, tierBadge(c.tier), String(c.rating), String(c.cost), esc(roleName(c.role)), c.tags.map(tagChip).join(" "),
    c.ability ? `<b>${esc(c.ability.name)}</b><br><span class="muted small">${esc(abilityText(c.ability))}</span>` : "",
  ]), ["", "", "n", "n", "", "", ""]).replace("<tr>", "<tr class=\"hdr\">")}</section>`;
}).join("\n");
shell({
  file: "characters.html", canonical: "/characters", active: "/characters", wide: true,
  title: "Character database", description: `All ${CHARACTERS.length} fighters in animeVS across ${SERIES.length} anime: tier, rating, credit cost, tags, signature role and ability. Search and filter by name, series, tag or tier.`,
  body: `${crumbs(["/", "Home"], [null, "Characters"])}
<h1>Character database</h1>
<p class="lede">All ${CHARACTERS.length} fighters in animeVS, across ${SERIES.length} anime. Search by name, series or tag, or filter by tier.</p>
<p>Ratings come from each fighter's in-story power and feats, hand-tuned and then checked against the game's balance tests so that no single fighter breaks the ladder. They are judgement calls, not official rankings, and the roster is revised over time. Tags and signature roles follow how each fighter is best known. Cost is their price in Draft and a guide price in Auction. For how these numbers combine, see <a href="/guides/scoring">How scoring works</a>.</p>
<div class="filters">
<input type="search" id="q" placeholder="Search name, series or tag…" aria-label="Search fighters">
<select id="tier" aria-label="Filter by tier"><option value="">All tiers</option>${TIERS.map((t) => `<option>${t}</option>`).join("")}</select>
</div>
<div class="jump">${SERIES.map((s) => `<a href="#${slug(s)}">${esc(s)}</a>`).join("")}</div>
<p id="count" class="muted small" style="margin-top:14px"></p>
${adUnit()}
${sections}
<script>
(function(){
  var q=document.getElementById('q'),t=document.getElementById('tier'),c=document.getElementById('count');
  var rows=[].slice.call(document.querySelectorAll('section.series tbody tr'));
  function run(){
    var s=q.value.trim().toLowerCase(),tv=t.value,n=0;
    document.querySelectorAll('section.series').forEach(function(sec){
      var head=sec.querySelector('h2').textContent.toLowerCase(),any=false;
      sec.querySelectorAll('tbody tr').forEach(function(r){
        var ok=(!s||r.textContent.toLowerCase().indexOf(s)>-1||head.indexOf(s)>-1)&&(!tv||r.children[1].textContent.trim()===tv);
        r.style.display=ok?'':'none'; if(ok){any=true;n++;}
      });
      sec.style.display=any?'':'none';
    });
    c.textContent=n+' fighter'+(n===1?'':'s')+' shown';
  }
  q.addEventListener('input',run);t.addEventListener('change',run);run();
})();
</script>`,
});

// ════════════════════════════════════════════════════════════════════════════
// ABOUT / PRIVACY / CONTACT
// ════════════════════════════════════════════════════════════════════════════
shell({
  file: "about.html", canonical: "/about", active: "/about",
  title: "About animeVS", description: "About animeVS: a free, independent anime team-drafting game. What it is, how it is built, how the ratings are decided and how to support it.",
  body: `${crumbs(["/", "Home"], [null, "About"])}
<h1>About animeVS</h1>
<p class="lede">animeVS is a free browser game about building the best seven-fighter anime team. It is made and run by one independent developer, with no studio, no publisher and no account system.</p>
<h2>What it is</h2>
<p>You draft a squad from ${CHARACTERS.length} fighters across ${SERIES.length} series, place each into one of seven roles, and see how far the team climbs a ten-rung ladder of anime dynasties. You can also challenge a friend in a live room, either building blind or bidding against each other in an auction, or try the daily guess-the-character puzzle. The idea came from basketball's "82-0" team-building games: a deterministic game where the same team always gets the same result, so every win comes from your choices rather than dice.</p>
<h2>Deterministic by design</h2>
<p>There is no randomness in scoring. Randomness only appears when fighters are drawn. Once you have a team, the result is pure arithmetic that the <a href="/guides/scoring">scoring guide</a> lays out in full. That is what makes the game worth analysing: you can reason about why a team won.</p>
<h2>How the ratings are decided</h2>
<p>Ratings reflect each fighter's power in their own story. They are hand-tuned, then run through automated balance tests: thousands of simulated teams must stay unable to clear the full ladder by luck, a well-built team must still be able to, no calculation may produce an invalid number, and live auctions are simulated bot against bot to check they always finish fairly. These are judgement calls and fans will disagree. Tell us where you think a fighter is mis-rated through the Feedback button in the game.</p>
<h2>Built with</h2>
<p>animeVS is a React and Vite web app. Live rooms use a small Supabase database. The guides and character pages on this site are generated from the same data file the game runs on, so they always match the game.</p>
<h2>Fan project notice</h2>
<p>animeVS is an unofficial fan project made for enjoyment. All characters, names and series belong to their respective creators, studios and rights holders. This site is not affiliated with, endorsed by or sponsored by any of them. No official artwork is used. If you are a rights holder and have a concern, please get in touch through the <a href="/contact">contact page</a> and it will be looked at promptly.</p>
<h2>Supporting the project</h2>
<p>The game is free. If you enjoy it, you can <a href="${SITE.kofi}" rel="noopener">support the developer on Ko-fi</a>. Some content pages on this site may show advertising; the game screens never do.</p>
<p><a class="cta" href="/">Play animeVS</a></p>`,
});

shell({
  file: "privacy.html", canonical: "/privacy", active: "",
  title: "Privacy policy", description: "How animeVS handles data: no accounts, what is stored in your browser, what live rooms store, analytics, the feedback form and Google advertising.",
  body: `${crumbs(["/", "Home"], [null, "Privacy"])}
<h1>Privacy policy</h1>
<p class="muted">Last updated: ${SITE.updated}</p>
<p class="lede">The short version: animeVS has no accounts and does not ask for your name or email. This page explains everything that is stored or shared, so you can decide what you are comfortable with.</p>
<h2>What is stored in your browser</h2>
<p>The game saves a few things on your own device, using your browser's local storage and session storage, so it can remember you between visits. These are not sent to us:</p>
<ul>
<li>Whether you have already seen each mode's how-to-play pop-up.</li>
<li>Your Daily puzzle progress and streak.</li>
<li>While you are in a live room, which seat you hold and which fighters you have placed, so a page reload does not lose your place.</li>
</ul>
<p>You can clear all of this at any time from your browser's site-data settings.</p>
<h2>Live Versus rooms</h2>
<p>When you create or join a live room, the game stores a room record in a hosted database (Supabase). It contains a six-character room code, the state of the game (which fighters were bid on, the prices, the locked teams) and a timestamp. It contains no names, emails or other personal information. Rooms are intended to be short-lived and are removed periodically.</p>
<h2>Analytics</h2>
<p>We use Vercel Web Analytics and Vercel Speed Insights to understand how many people visit and how fast the site loads. These collect aggregated page-view and performance information such as the page visited, referrer, country, browser and device type. They are designed not to use cookies or to track individuals across sites.</p>
<h2>The feedback form</h2>
<p>If you use Feedback in the game, what you type is sent through the Web3Forms service to the developer's inbox, along with the mode you were in. Only include contact details if you want a reply.</p>
<h2>Advertising</h2>
<p>Some content pages on this site (guides and the character database) may show ads served by Google AdSense. Ads are never shown on the game screens themselves. Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this and other websites. Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and/or other sites on the internet.</p>
<ul>
<li>You can opt out of personalised advertising at <a href="https://adssettings.google.com" rel="noopener">Google Ads Settings</a>, or at <a href="https://www.aboutads.info" rel="noopener">aboutads.info</a>.</li>
<li>You can read how Google uses information from sites that use its services at <a href="https://policies.google.com/technologies/partner-sites" rel="noopener">policies.google.com/technologies/partner-sites</a>.</li>
<li>Where required, such as in the UK and EEA, a consent message lets you choose whether cookies are used for ads.</li>
</ul>
<h2>Children</h2>
<p>animeVS is a general-audience game and is not directed at children under 13. We do not knowingly collect personal information from children.</p>
<h2>Your rights</h2>
<p>If you are in the UK or EEA you have rights over personal data held about you, including access, correction and deletion. Because the game does not collect personal identifiers, there is usually nothing to look up, but you can ask through the <a href="/contact">contact page</a>.</p>
<h2>Changes</h2>
<p>If this policy changes, the date at the top will change with it.</p>`,
});

const faq = [
  ["Why is my favourite fighter rated so low?", "Ratings are the developer's judgement of in-story power, tuned so the ladder stays fair. Tell us your case through the Feedback button in the game; balance suggestions are read and often acted on."],
  ["Can you add a character or anime?", `Requests are welcome. Roster additions need tags, a signature role, an ability and a balanced rating, so they are added in batches. The roster currently has ${CHARACTERS.length} fighters across ${SERIES.length} series.`],
  ["Does the game save my progress?", "Spin and Draft runs are not saved between visits. The Daily puzzle remembers your streak in your browser. Your result can be shared as a link."],
  ["How do I play with a friend?", "Open Versus, choose Auction or Blind Draft, create a room and send them the invite link. They join on their own device."],
  ["Is it really free?", "Yes. There are no accounts, no paywalls and no in-game purchases. Optional support is through Ko-fi."],
  ["Is animeVS official?", "No. It is an independent fan project and is not affiliated with any anime studio, publisher or rights holder."],
];
shell({
  file: "contact.html", canonical: "/contact", active: "",
  title: "Contact", description: "How to contact the animeVS developer: bug reports, balance feedback, character requests and rights-holder enquiries. Plus answers to common questions.",
  body: `${crumbs(["/", "Home"], [null, "Contact"])}
<h1>Contact</h1>
<p class="lede">The quickest way to reach the developer is the <b>Feedback</b> button at the top of the game. It lets you send a bug report, a suggestion or a balance comment in a few taps.</p>
<ul>
<li><b>Bugs, suggestions and balance feedback:</b> open <a href="/">the game</a> and tap Feedback.</li>
<li><b>Support the project:</b> <a href="${SITE.kofi}" rel="noopener">Ko-fi</a>.</li>
${SITE.contactEmail ? `<li><b>Email:</b> <a href="mailto:${esc(SITE.contactEmail)}">${esc(SITE.contactEmail)}</a></li>` : ""}
<li><b>Rights holders and copyright concerns:</b> use Feedback and choose a category that fits, mentioning that it concerns content or rights. These are looked at promptly.</li>
</ul>
<h2>Frequently asked questions</h2>
${faq.map(([q, an]) => `<h3>${esc(q)}</h3><p>${esc(an)}</p>`).join("")}`,
});

// ════════════════════════════════════════════════════════════════════════════
// SHARED ANALYSIS HELPERS (used by the tier list, synergy and auction guides)
// ════════════════════════════════════════════════════════════════════════════
// A fighter's rating in a role, including the role-dependent abilities (adaptable,
// role synergy). Mirrors fittedRatingWithAbility in src/App.jsx.
function fitIn(c, rid) {
  const rf = roleFit(c, rid);
  let bonus = rf.bonus;
  const ab = c.ability || {};
  if (ab.type === "adaptable" && bonus < 5) bonus = rf.signature ? bonus + 5 : 5;
  let r = c.rating + bonus;
  if (ab.type === "role_synergy" && ab.role === rid) r += ab.x || 0;
  return r;
}
const ROLE_IDS = ROLES.map((r) => r.id);
const PERMS = (() => {
  const out = [];
  const go = (rest, acc) => { if (!rest.length) { out.push(acc); return; } rest.forEach((x, i) => go([...rest.slice(0, i), ...rest.slice(i + 1)], [...acc, x])); };
  go(ROLE_IDS, []);
  return out;
})();
// Best one-to-one role assignment for seven fighters (all 5,040 orders checked).
function assignRoles(chars) {
  let best = null, bestScore = -1;
  for (const perm of PERMS) {
    let sc = 0;
    for (let i = 0; i < 7; i++) sc += fitIn(chars[i], perm[i]);
    if (sc > bestScore) { bestScore = sc; best = perm; }
  }
  return chars.map((c, i) => ({ character: c, roleId: best[i] }));
}
function ladderReach(team) {
  let reached = 0, margin = 0;
  for (const r of LADDER) {
    const res = resolveRung(team, r);
    margin += res.me.total - res.them.total;
    if (res.cleared && reached === r.rung - 1) reached = r.rung;
  }
  return { reached, margin };
}
const seriesOf = (id) => byId(id)?.series;
const pairKey = (x, y) => [x, y].sort().join("~");
const PAIRS = new Set(DUOS.map(([x, y]) => pairKey(x, y)));
const nameList = (cs) => cs.map((c) => esc(c.name)).join(", ");
const fmt1 = (n) => (Math.round(n * 10) / 10).toFixed(1);

// ════════════════════════════════════════════════════════════════════════════
// TIER LIST + BEST BY ROLE
// ════════════════════════════════════════════════════════════════════════════
{
  const top10 = [...CHARACTERS].sort((x, y) => y.rating - x.rating || x.cost - y.cost || (x.name < y.name ? -1 : 1)).slice(0, 10);
  const roleTables = ROLES.map((r) => {
    const ranked = [...CHARACTERS].map((c) => ({ c, v: fitIn(c, r.id) })).sort((x, y) => y.v - x.v || x.c.cost - y.c.cost);
    const top = ranked.slice(0, 5);
    const budget = ranked.find((x) => x.c.cost <= 5);
    return `<h3 id="role-${r.id}">${esc(r.name)} <span class="muted small">wants ${r.wants.map(tagChip).join(" ")}</span></h3>
${table(["#", "Fighter", "Tier", "Base", "In this role", "Cost"], top.map((x, i) => [String(i + 1), `<b>${esc(x.c.name)}</b><br><span class="muted small">${esc(x.c.series)}</span>`, tierBadge(x.c.tier), String(x.c.rating), `<b>${x.v}</b>`, String(x.c.cost)]), ["n", "", "", "n", "n", "n"])}
${budget ? `<p class="small">Budget pick (5 credits or less): <b>${esc(budget.c.name)}</b> (${esc(budget.c.series)}) at <b>${budget.v}</b> in this role for ${budget.c.cost} credits.</p>` : ""}`;
  }).join("\n");
  const clutch = CHARACTERS.filter((c) => c.ability?.type === "clutch").sort((x, y) => (y.ability.x || 0) - (x.ability.x || 0) || y.rating - x.rating);
  const overwhelm = CHARACTERS.filter((c) => c.ability?.type === "overwhelm").sort((x, y) => y.rating - x.rating);
  const tierLists = TIERS.map((t) => {
    const list = [...byTier[t]].sort((x, y) => y.rating - x.rating || (x.name < y.name ? -1 : 1));
    return `<h3>${tierBadge(t)} tier <span class="muted small">${list.length} fighters, ratings ${Math.min(...list.map((c) => c.rating))}–${Math.max(...list.map((c) => c.rating))}, costs ${Math.min(...list.map((c) => c.cost))}–${Math.max(...list.map((c) => c.cost))}</span></h3>
<p>${list.map((c) => `${esc(c.name)} <span class="muted">${c.rating}</span>`).join(" · ")}</p>`;
  }).join("\n");
  const bigSwing = [...CHARACTERS].map((c) => {
    const vals = ROLE_IDS.map((rid) => fitIn(c, rid));
    return { c, best: Math.max(...vals), worst: Math.min(...vals) };
  }).sort((x, y) => (y.best - y.worst) - (x.best - x.worst) || y.c.rating - x.c.rating).slice(0, 6);
  shell({
    file: "guides/tier-list.html", canonical: "/guides/tier-list", active: "/guides",
    title: "animeVS tier list and best picks by role",
    description: `Every animeVS fighter ranked by tier, the five strongest picks for each of the seven roles once role fit is counted, budget picks, and the clutch fighters for rungs 6 to 10.`,
    body: `${crumbs(["/", "Home"], ["/guides", "Guides"], [null, "Tier list"])}
<h1>Tier list and best picks by role</h1>
<p class="lede">A raw tier list only tells you who is strongest on paper. In animeVS a fighter's real value depends on the seat you give them, so this page ranks fighters both ways: by base rating, and by what they actually score in each of the seven roles.</p>
<p>Every number here is calculated from the game's live data each time the site is built, so it always matches what you see in a run. For how role fit and signature bonuses are added, see <a href="/guides/scoring">How scoring works</a>.</p>
<h2>The top ten by base rating</h2>
${table(["#", "Fighter", "Series", "Tier", "Rating", "Cost", "Signature role"], top10.map((c, i) => [String(i + 1), `<b>${esc(c.name)}</b>`, esc(c.series), tierBadge(c.tier), String(c.rating), String(c.cost), esc(roleName(c.role))]), ["n", "", "", "", "n", "n", ""])}
<p>The top of the roster is crowded: several fighters share the highest ratings, and the gap between first and tenth is only ${top10[0].rating - top10[9].rating} points. Role placement alone is worth up to +25, so the order of this table is far less important than it looks.</p>
<h2>Best picks for each role</h2>
<p>"In this role" is base rating plus the role-fit bonus (+15 for two or more matching tags, +5 for one), the +10 signature bonus where it applies, and any ability that only works in that seat. Counters, duo synergy and ladder-only bonuses are left out because they depend on the rest of your team and the opponent.</p>
${roleTables}
${adUnit()}
<h2>Fighters whose seat matters most</h2>
<p>These fighters have the biggest gap between their best and worst role. Misplace them and you throw away more points than anyone else.</p>
${table(["Fighter", "Best role score", "Worst role score", "Swing"], bigSwing.map((x) => [`<b>${esc(x.c.name)}</b><br><span class="muted small">best as ${esc(roleName(x.c.role))}</span>`, String(x.best), String(x.worst), `+${x.best - x.worst}`]), ["", "n", "n", "n"])}
<h2>Clutch picks for rungs 6 to 10</h2>
<p>Clutch abilities add rating only on the hard half of the ladder (rungs 6 to 10), which is exactly where most runs end. If your team keeps falling at Cursed Elite or Soul Society, these are the fighters to look for.</p>
${table(["Fighter", "Tier", "Rating", "Clutch bonus", "Cost"], clutch.slice(0, 12).map((c) => [`<b>${esc(c.name)}</b><br><span class="muted small">${esc(c.ability.name)}</span>`, tierBadge(c.tier), String(c.rating), `+${c.ability.x || 0}`, String(c.cost)]), ["", "", "n", "n", "n"])}
${overwhelm.length ? `<p>A different kind of power spike: <b>overwhelm</b> abilities pay out only if that fighter is the highest-rated member of your team. ${overwhelm.length} fighters have one (${nameList(overwhelm.slice(0, 6))}${overwhelm.length > 6 ? " and others" : ""}), so they shine as the star of a budget team and do nothing beside a stronger captain.</p>` : ""}
<h2>Every tier at a glance</h2>
${tierLists}
<h2>How to use this list</h2>
<ul>
<li><b>In Spin</b>, you can't choose who lands, so use the role tables to decide where each fighter goes. The best seat is often not the obvious one.</li>
<li><b>In Draft</b>, a budget pick that fits its seat is often worth more than a star in the wrong one. Compare "In this role" against the cost.</li>
<li><b>In Auction</b>, use the role tables to judge how much a fighter is worth to <em>your</em> empty seats, not just their rating. See <a href="/guides/auction-strategy">Auction strategy</a>.</li>
</ul>
<p>Ratings are judgement calls based on each fighter's feats in their own story, tuned by automated balance tests. Disagree with one? Tell us through the Feedback button in the game. Full stats for every fighter are in the <a href="/characters">character database</a>.</p>
<p><a class="cta" href="/">Build a team</a></p>`,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SYNERGY PAIRS + SINGLE-ANIME SQUADS
// ════════════════════════════════════════════════════════════════════════════
{
  const pairs = DUOS.map(([x, y, lab, kind]) => ({ a: byId(x), b: byId(y), lab, kind })).filter((p) => p.a && p.b);
  const bySeries = SERIES.map((sr) => ({ sr, n: CHARACTERS.filter((c) => c.series === sr).length, p: pairs.filter((p) => p.a.series === sr).length })).sort((x, y) => y.p - x.p || (x.sr < y.sr ? -1 : 1));
  const cheap = [...pairs].sort((x, y) => (x.a.cost + x.b.cost) - (y.a.cost + y.b.cost) || (y.a.rating + y.b.rating) - (x.a.rating + x.b.rating)).slice(0, 12);
  const strong = [...pairs].sort((x, y) => (y.a.rating + y.b.rating) - (x.a.rating + x.b.rating)).slice(0, 10);
  const degree = {};
  for (const p of pairs) { degree[p.a.id] = (degree[p.a.id] || 0) + 1; degree[p.b.id] = (degree[p.b.id] || 0) + 1; }
  const hubs = Object.entries(degree).sort((x, y) => y[1] - x[1] || byId(y[0]).rating - byId(x[0]).rating).slice(0, 8).map(([id, n]) => ({ c: byId(id), n }));
  // groups of three where all three pairs exist (+36)
  const trios = [];
  const ids = [...new Set(pairs.flatMap((p) => [p.a.id, p.b.id]))].sort();
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    if (!PAIRS.has(pairKey(ids[i], ids[j]))) continue;
    for (let k = j + 1; k < ids.length; k++) {
      if (PAIRS.has(pairKey(ids[i], ids[k])) && PAIRS.has(pairKey(ids[j], ids[k]))) trios.push([ids[i], ids[j], ids[k]].map(byId));
    }
  }
  trios.sort((x, y) => x.reduce((s, c) => s + c.cost, 0) - y.reduce((s, c) => s + c.cost, 0));

  // Single-anime squads: for every series, the best seven it can field inside the Draft
  // budget (every legal combination is checked), seated optimally, then sent up the ladder.
  const mono = SERIES.map((sr) => {
    const pool = CHARACTERS.filter((c) => c.series === sr);
    if (pool.length < PICKS) return { sr, note: `only ${pool.length} fighter${pool.length === 1 ? "" : "s"} in the roster` };
    const cands = [];
    const pick = (start, chosen, cost) => {
      if (chosen.length === PICKS) {
        let duos = 0;
        for (let i = 0; i < PICKS; i++) for (let j = i + 1; j < PICKS; j++) if (PAIRS.has(pairKey(chosen[i].id, chosen[j].id))) duos++;
        cands.push({ chosen, cost, proxy: chosen.reduce((s2, c) => s2 + c.rating, 0) + duos * DUO_BONUS });
        return;
      }
      for (let i = start; i < pool.length; i++) {
        const c = pool[i];
        if (cost + c.cost > BUDGET) continue;
        pick(i + 1, [...chosen, c], cost + c.cost);
      }
    };
    pick(0, [], 0);
    if (!cands.length) return { sr, note: `its seven cheapest fighters cost ${pool.map((c) => c.cost).sort((x, y) => x - y).slice(0, 7).reduce((s2, x) => s2 + x, 0)} credits, over the ${BUDGET}-credit budget` };
    cands.sort((x, y) => y.proxy - x.proxy);
    let best = null;
    for (const cand of cands.slice(0, 30)) {
      const team = assignRoles(cand.chosen);
      const r = ladderReach(team);
      const score = r.reached * 1e5 + r.margin;
      if (!best || score > best.score) best = { team, cost: cand.cost, duos: activeDuos(team).length, ...r, score };
    }
    return { sr, ...best };
  });
  const ranked = mono.filter((m) => m.team).sort((x, y) => y.reached - x.reached || y.margin - x.margin);
  const blocked = mono.filter((m) => !m.team);
  const top = ranked[0];
  const fullClears = ranked.filter((m) => m.reached === LADDER.length);
  shell({
    file: "guides/synergy.html", canonical: "/guides/synergy", active: "/guides",
    title: "Synergy pairs and single-anime squads",
    description: `All ${pairs.length} animeVS duo synergies, the cheapest and strongest pairs, groups of three worth +${DUO_BONUS * 3}, and a test of how far a team from a single anime gets up the ladder.`,
    body: `${crumbs(["/", "Home"], ["/guides", "Guides"], [null, "Synergy"])}
<h1>Synergy pairs and single-anime squads</h1>
<p class="lede">Put both halves of a famous pairing on your team (family, master and student, rivals, partners) and the team earns a flat <b>+${DUO_BONUS}</b>. There are ${pairs.length} of these pairings across ${bySeries.filter((x) => x.p).length} series. This guide shows which ones are cheap, which ones stack, and whether building around one anime is a real strategy.</p>
<p>Seats don't matter for synergy: both fighters just have to be on the team. Ladder opponents never earn synergy, so on the solo ladder it is purely your advantage. Rules in full: <a href="/guides/scoring">How scoring works</a>.</p>
<h2>Which anime have the most pairs</h2>
${table(["Series", "Fighters", "Synergy pairs"], bySeries.map((x) => [esc(x.sr), String(x.n), String(x.p)]), ["", "n", "n"])}
<h2>The cheapest pairs</h2>
<p>A pair is worth +${DUO_BONUS} whatever it costs. Cheap pairs give you that bonus while leaving credits for stars elsewhere.</p>
${table(["Pair", "Bond", "Combined cost", "Combined rating"], cheap.map((p) => [`<b>${esc(p.a.name)}</b> + <b>${esc(p.b.name)}</b><br><span class="muted small">${esc(p.a.series)}</span>`, esc(p.lab), String(p.a.cost + p.b.cost), String(p.a.rating + p.b.rating)]), ["", "", "n", "n"])}
<h2>The strongest pairs</h2>
${table(["Pair", "Bond", "Combined rating", "Combined cost"], strong.map((p) => [`<b>${esc(p.a.name)}</b> + <b>${esc(p.b.name)}</b><br><span class="muted small">${esc(p.a.series)}</span>`, esc(p.lab), String(p.a.rating + p.b.rating), String(p.a.cost + p.b.cost)]), ["", "", "n", "n"])}
<p>Strong pairs cost a lot of credits: the top ten average ${fmt1(avg(strong.map((p) => p.a.cost + p.b.cost)))} credits for two of your seven slots, against ${fmt1(BUDGET / PICKS * 2)} for an average two picks. They work in Spin, where cost doesn't apply, and in Draft only if the rest of the team is cheap.</p>
${adUnit()}
<h2>Fighters who connect to the most partners</h2>
<p>Some fighters belong to several pairings. Draft one of them early and every later pick from the same series has a better chance of completing a pair.</p>
${table(["Fighter", "Series", "Pairs they belong to", "Cost"], hubs.map((h) => [`<b>${esc(h.c.name)}</b>`, esc(h.c.series), String(h.n), String(h.c.cost)]), ["", "", "n", "n"])}
<h2>Groups of three: +${DUO_BONUS * 3}</h2>
<p>When three fighters are all paired with each other, the team collects three bonuses. There are ${trios.length} such groups in the current roster, cheapest first:</p>
${table(["Group", "Series", "Total cost", "Bonus"], trios.slice(0, 12).map((t) => [`<b>${nameList(t)}</b>`, esc(t[0].series), String(t.reduce((s2, c) => s2 + c.cost, 0)), `+${DUO_BONUS * 3}`]), ["", "", "n", "n"])}
<h2>Can a team from one anime clear the ladder?</h2>
<p>Synergy pushes you towards picking from one series, so we tested it. For each anime we checked every possible seven-fighter team from that series that fits the ${BUDGET}-credit Draft budget, kept the strongest candidates, gave each fighter its best seat, and sent the team up the real ladder. The table shows each anime's best result.</p>
${table(["Series", "Best team found", "Cost", "Pairs", "Rungs cleared"], ranked.map((m) => [`<b>${esc(m.sr)}</b>`, `<span class="small">${nameList(m.team.map((x) => x.character))}</span>`, String(m.cost), String(m.duos), `<b>${m.reached}</b>/${LADDER.length}`]), ["", "", "n", "n", "n"])}
${blocked.length ? `<p class="small muted">Not in the table: ${blocked.map((m) => `${esc(m.sr)} (${m.note})`).join("; ")}.</p>` : ""}
<p><b>What it shows:</b> ${fullClears.length ? `${fullClears.length === 1 ? "One anime" : `${fullClears.length} of the ${ranked.length} anime tested`} can clear the whole ladder on their own (${fullClears.map((m) => esc(m.sr)).join(", ")}), so a single-series team is a real strategy, not just a fun theme.` : `No single anime clears the whole ladder by itself; ${top ? `${esc(top.sr)} gets furthest, reaching rung ${top.reached}` : ""}.`} ${(() => { const most = [...ranked].sort((x, y) => y.duos - x.duos)[0]; return most ? `${esc(most.sr)} stacks the most synergy: its best team holds ${most.duos} pairs, worth +${most.duos * DUO_BONUS} before a single role bonus is counted.` : ""; })()} ${(() => { const low = ranked.filter((m) => m.reached < 7); return low.length ? `It doesn't work for every anime: ${low.map((m) => esc(m.sr)).join(", ")} ${low.length === 1 ? "stalls" : "stall"} before rung 7, usually because the series has few pairs or can't fit its strongest fighters into the budget together.` : ""; })()} These are best-case teams found by searching every combination; in Spin or Draft you won't always be offered the pieces, so treat a single-anime run as something to steer towards when the draws allow it.</p>
<h2>Every pairing</h2>
${SERIES.filter((sr) => pairs.some((p) => p.a.series === sr)).map((sr) => `<h3>${esc(sr)}</h3><p>${pairs.filter((p) => p.a.series === sr).map((p) => `${esc(p.a.name)} + ${esc(p.b.name)} <span class="muted">(${esc(p.lab)})</span>`).join(" · ")}</p>`).join("\n")}
<p><a class="cta" href="/">Try a synergy team</a></p>`,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// AUCTION STRATEGY (with a seeded simulation so the numbers are stable)
// ════════════════════════════════════════════════════════════════════════════
{
  const GAMES = 400;
  const rng = mulberry32(20261102);
  const valueBot = (st, me) => {
    const c = byId(auctionOrder(st.seed)[st.lot]);
    const worth = Math.round(c.cost * (0.7 + rng() * 0.8));
    const next = st.hi + (rng() < 0.25 ? 2 : 1);
    return next <= Math.min(worth, auctionMaxBid(st, me)) ? { bid: next } : { fold: true };
  };
  const paidByTier = Object.fromEntries(TIERS.map((t) => [t, []]));
  let spent = 0, players = 0, lots = 0, autoFilled = 0, decided = 0, spenderWins = 0, leftover = 0;
  for (let g = 0; g < GAMES; g++) {
    let st = auctionStart(auctionJoin(auctionNew((rng() * 1e9) | 0)));
    let guard = 0;
    while (st.phase !== "lock" && guard++ < 5000) {
      if (st.phase === "spin") { st = auctionOpen(st); lots++; continue; }
      if (st.phase === "sold") { st = auctionNext(st); continue; }
      const first = rng() < 0.5 ? "a" : "b";
      let acted = false;
      for (const who of [first, first === "a" ? "b" : "a"]) {
        if (st.phase !== "bid" || st.hiBy === who) continue;
        const act = valueBot(st, who);
        const n = act.bid ? auctionBid(st, who, act.bid) : auctionFold(st, who);
        if (n) { st = n; acted = true; }
      }
      if (st.phase === "bid" && !acted) st = auctionExpire(st);
    }
    const teams = {};
    for (const w of ["a", "b"]) {
      players++;
      spent += AUCTION_BUDGET - st[w].money;
      leftover += st[w].money;
      if (st[w].won.some((x) => x.auto)) autoFilled++;
      for (const x of st[w].won) if (!x.auto) paidByTier[byId(x.id).tier].push(x.price);
      teams[w] = assignRoles(st[w].won.map((x) => byId(x.id)));
    }
    const res = resolvePvP(teams.a, teams.b);
    const spA = AUCTION_BUDGET - st.a.money, spB = AUCTION_BUDGET - st.b.money;
    if (res.winner !== "tie" && spA !== spB) { decided++; if ((res.winner === "a") === (spA > spB)) spenderWins++; }
  }
  const priceRows = TIERS.map((t) => [tierBadge(t), paidByTier[t].length ? `$${fmt1(avg(paidByTier[t]))}` : "–", fmt1(avg(byTier[t].map((c) => c.cost))), String(paidByTier[t].length)]);
  const spenderPct = decided ? Math.round(100 * spenderWins / decided) : 50;
  const maxBidRows = Array.from({ length: PICKS }, (_, k) => {
    const keep = (PICKS - k - 1) * AUCTION_MIN_BID;
    return [String(k), `$${keep}`, `$${Math.max(0, 30 - keep)}`, `$${Math.max(0, 15 - keep)}`];
  });
  shell({
    file: "guides/auction-strategy.html", canonical: "/guides/auction-strategy", active: "/guides",
    title: "animeVS Auction strategy",
    description: `How the animeVS live Auction works: the $${AUCTION_BUDGET} budget, the bid clock, the reserve rule, fair prices by tier, and what ${GAMES} simulated auctions say about spending big.`,
    body: `${crumbs(["/", "Home"], ["/guides", "Guides"], [null, "Auction strategy"])}
<h1>Auction strategy</h1>
<p class="lede">Auction is the two-player mode where every fighter is up for sale and only one of you can have them. It rewards a different kind of thinking from Draft: you are not just building your team, you are deciding what your rival is allowed to have.</p>
<h2>The exact rules</h2>
<ul>
<li>Both players start with <b>$${AUCTION_BUDGET}</b> and need seven fighters.</li>
<li>A reel spins and one fighter goes up for sale. Bidding opens with a <b>${AUCTION_OPEN_MS / 1000}-second</b> clock; every bid resets it to <b>${AUCTION_RESET_MS / 1000} seconds</b>. The minimum raise is $${AUCTION_MIN_BID}.</li>
<li>When the clock runs out, the top bidder pays their bid and takes the fighter. Nobody else can ever have that fighter in this match.</li>
<li>You can pass. If your rival has already bid, passing concedes the fighter to them at their price. If neither of you bids, the fighter goes unsold.</li>
<li>If your rival can no longer afford to raise, your bid wins at once without waiting for the clock.</li>
<li>You must place each fighter you win into a role before you can bid again.</li>
<li>If ${AUCTION_MAX_DRY} fighters in a row go unsold, any empty slots are filled with the cheapest fighters nobody bought, so the match always finishes.</li>
<li>Money left at the end is worth nothing. Both teams are scored head to head exactly like Blind Draft.</li>
</ul>
<h2>The reserve rule: how much you can really bid</h2>
<p>The game always keeps <b>$1 back for every empty slot after this one</b>, so nobody can spend themselves into an unfinishable team. Your real maximum bid is your money minus that reserve. The table shows what that means in practice:</p>
${table(["Fighters you already own", "Held back", "Max bid with $30 left", "Max bid with $15 left"], maxBidRows, ["n", "n", "n", "n"])}
<p>Early on, $6 of your money is untouchable. Watch your rival's money and fighter count: you can work out the most they can bid, and a bid one dollar above that ends the lot immediately.</p>
${adUnit()}
<h2>What a fair price looks like</h2>
<p>To see where prices settle, we ran ${GAMES} complete auctions between two simple bots that each value a fighter at roughly their Draft cost (with some randomness either way) and stop bidding once the price passes that. These are not real players, but they show the shape of the market.</p>
${table(["Tier", "Average price paid", "Average Draft cost", "Fighters sold"], priceRows, ["", "n", "n", "n"])}
<ul>
<li>On average each bot spent <b>$${fmt1(spent / players)}</b> of its $${AUCTION_BUDGET} and finished with $${fmt1(leftover / players)} unspent.</li>
<li>A match took about <b>${Math.round(lots / GAMES)}</b> fighters going up for sale.</li>
${autoFilled ? `<li>${Math.round(100 * autoFilled / players)}% of players ended with at least one slot auto-filled after a run of unsold fighters.</li>` : `<li>No simulated match needed the auto-fill: there is always someone willing to bid a dollar.</li>`}
<li>In matches where one bot spent more than the other, <b>the bigger spender won ${spenderPct}%</b> of the time.</li>
</ul>
<p>${spenderPct >= 65 ? "Spending your money matters: the player who leaves cash unspent usually loses." : spenderPct >= 55 ? "Spending more helps a little, but far from always. What you buy and where you seat it matters more than how much you spend." : spenderPct >= 45 ? "Spending more is close to a coin flip. What you buy and where you seat it matters more than how much you spend." : "Spending more does not reliably win. Bargains and good seats matter more than outbidding your rival on every star."} Money left at the end is wasted, so plan to finish close to $0.</p>
<h2>Tactics that work</h2>
<ul>
<li><b>Price fighters by your empty seats, not their rating.</b> A fighter who scores a perfect fit plus signature in one of your open roles is worth more to you than a higher-rated fighter with nowhere good to sit. The <a href="/guides/tier-list">tier list</a> shows each fighter's score in every role.</li>
<li><b>Count synergy before you bid.</b> If you already own one half of a pair, the other half is worth an extra +${DUO_BONUS} to you and nothing extra to your rival. The <a href="/guides/synergy">synergy guide</a> lists every pair.</li>
<li><b>Deny, carefully.</b> Raising the price of a fighter your rival needs drains their money, but if they pass you are left holding a fighter you didn't want.</li>
<li><b>Use the cheap middle of the match.</b> Prices tend to dip when both players are saving for a star. That is the time to pick up good-fit B and C tier fighters for a few dollars.</li>
<li><b>Don't finish with cash.</b> Unspent money scores nothing. In the last few slots, bid up to your maximum on anything that fits.</li>
</ul>
<p>New to the mode? Read <a href="/guides/how-to-play">How to play</a>, then challenge a friend from the Versus menu.</p>
<p><a class="cta" href="/">Start an auction</a></p>`,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// UPDATES (dated log of what changed: keep adding to the top)
// ════════════════════════════════════════════════════════════════════════════
{
  const UPDATES = [
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
  shell({
    file: "updates.html", canonical: "/updates", active: "",
    title: "Updates", description: "What's new in animeVS: a dated log of new modes, balance changes, guides and fixes.",
    body: `${crumbs(["/", "Home"], [null, "Updates"])}
<h1>Updates</h1>
<p class="lede">animeVS is built and maintained by one developer and changes often. This page lists what changed and when, newest first.</p>
<p>Today the game has ${CHARACTERS.length} fighters across ${SERIES.length} series, ${DUOS.length} synergy pairs and a ${LADDER.length}-rung ladder.</p>
${UPDATES.map(([d, t, items]) => `<h2>${esc(d)}: ${esc(t)}</h2><ul>${items.map((x) => `<li>${x}</li>`).join("")}</ul>`).join("\n")}
<p>Found a bug or want a fighter added? Use the Feedback button in the game, or see <a href="/contact">Contact</a>.</p>`,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// sitemap + robots
// ════════════════════════════════════════════════════════════════════════════
const urls = ["/", ...written.map((w) => w.canonical)];
fs.writeFileSync(path.join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE.url}${u === "/" ? "" : u}</loc></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);

const total = written.reduce((s, w) => s + w.words, 0);
console.log(`build-content: ${written.length} pages, ~${total.toLocaleString()} words of body text`);
for (const w of written) console.log(`  ${w.canonical.padEnd(26)} ${String(w.words).padStart(6)} words`);
