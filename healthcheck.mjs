#!/usr/bin/env node
/**
 * animeVS health check
 * ---------------------------------------------------------------
 * From the repo root:   node healthcheck.mjs
 * Or a specific file:   node healthcheck.mjs path/to/v1.jsx
 *
 * Slices the pure game-logic section out of App.jsx and runs:
 *   1. data integrity   — dup ids, tier tag caps, signature roles, ladder refs
 *   2. codec table      — every character registered, append-only order intact,
 *                         no duplicates, within the 256-slot index
 *   3. synergy          — duo ids real, same-series, no duplicate pairs,
 *                         ladder opponents earn zero synergy
 *   4. NaN sweep        — every character in every role against every rung
 *   5. ceiling          — hill-climbs a real team; the ladder must stay clearable
 *   6. random average   — how far an average legal team gets (must stay hard)
 *   7. codec roundtrip  — team + result codes survive encode/decode
 *
 * Exits non-zero on failure, so it can gate a deploy.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { pathToFileURL } from "node:url";

const SRC = process.argv[2] || "src/App.jsx";
if (!fs.existsSync(SRC)) {
  console.error(`Can't find ${SRC}. Run from the repo root, or pass a path.`);
  process.exit(1);
}

const raw = fs.readFileSync(SRC, "utf8");
const a = raw.indexOf("const CHARACTERS");
const b = raw.indexOf("const INK =");
if (a < 0 || b <= a) {
  console.error("Couldn't locate the logic section (`const CHARACTERS` ... `const INK =`).");
  process.exit(1);
}
const tmp = path.join(os.tmpdir(), `animevs-${Date.now()}.mjs`);
fs.writeFileSync(tmp, raw.slice(a, b) + `
export { CHARACTERS, LADDER, ROLES, BUDGET, PICKS, DUOS, DUO_BONUS, CODEC_IDS,
  byId, tagCapFor, roleFit, fittedRating, squadScore, autoAssign, resolveRung,
  resolvePvP, activeDuos, encodeTeam, decodeTeam, encodeResult, decodeResult };
`);
const G = await import(pathToFileURL(tmp).href);
fs.unlinkSync(tmp);

// The Daily puzzle's data lives beside App.jsx and is checked too when present.
let FACTS = null;
const factsPath = path.join(path.dirname(SRC), "animeFacts.js");
if (fs.existsSync(factsPath)) {
  try { FACTS = await import(pathToFileURL(factsPath).href); }
  catch (e) { console.error("animeFacts.js exists but failed to load: " + e.message); process.exit(1); }
}

const { CHARACTERS, LADDER, ROLES, BUDGET, PICKS, DUOS, DUO_BONUS, CODEC_IDS,
        byId, tagCapFor, fittedRating, resolveRung, autoAssign, activeDuos,
        encodeTeam, decodeTeam, encodeResult, decodeResult } = G;

const roleIds = ROLES.map((r) => r.id);
const MINCOST = Math.min(...CHARACTERS.map((c) => c.cost));
const ABILITY_TYPES = ["role_synergy","counter_immune","tag_projection","rival_bonus",
                       "adaptable","clutch","aura_buff","overwhelm"];
const problems = [];
const fail = (m) => problems.push(m);

// ── 1. data integrity ─────────────────────────────────────────────────────
const seen = new Set();
for (const c of CHARACTERS) {
  if (seen.has(c.id)) fail(`duplicate character id: ${c.id}`);
  seen.add(c.id);
  if (!Number.isFinite(c.rating) || !Number.isFinite(c.cost)) fail(`non-numeric rating/cost: ${c.id}`);
  if (!roleIds.includes(c.role)) fail(`unknown signature role on ${c.id}: ${c.role}`);
  if (c.tags.length > tagCapFor(c.tier)) fail(`tag cap broken: ${c.id} has ${c.tags.length}, tier ${c.tier} allows ${tagCapFor(c.tier)}`);
  if (new Set(c.tags).size !== c.tags.length) fail(`duplicate tags on ${c.id}`);
  if (c.ability && !ABILITY_TYPES.includes(c.ability.type)) fail(`unknown ability type on ${c.id}: ${c.ability.type}`);
}
for (const rung of LADDER) {
  if (rung.team.length !== PICKS) fail(`rung ${rung.rung} (${rung.title}) has ${rung.team.length} members, expected ${PICKS}`);
  for (const id of rung.team) if (!byId(id)) fail(`rung ${rung.rung} references missing character: ${id}`);
}

// ── 2. codec table ────────────────────────────────────────────────────────
// Share links index into CODEC_IDS. It is append-only: anything that reorders
// or inserts silently repoints every link already in the wild.
if (new Set(CODEC_IDS).size !== CODEC_IDS.length) fail("CODEC_IDS contains duplicate ids");
const unregistered = CHARACTERS.filter((c) => !CODEC_IDS.includes(c.id)).map((c) => c.id);
if (unregistered.length) fail(`not in CODEC_IDS (APPEND to the end, never insert): ${unregistered.join(", ")}`);
if (CODEC_IDS.length > 256) fail(`CODEC_IDS has ${CODEC_IDS.length} entries; the 8-bit index addresses only 256`);
// The first 148 entries are the original alphabetical seed. Everything after is
// an append. If the seed ever stops being sorted, someone inserted into it.
const SEED = 148;
const seed = CODEC_IDS.slice(0, Math.min(SEED, CODEC_IDS.length));
for (let i = 1; i < seed.length; i++) {
  if (seed[i] < seed[i - 1]) {
    fail(`CODEC_IDS seed block is no longer sorted at index ${i} ("${seed[i - 1]}" then "${seed[i]}") — something was inserted instead of appended, which repoints every existing share link`);
    break;
  }
}
const tombstones = CODEC_IDS.filter((id) => !byId(id));

// ── 3. synergy ────────────────────────────────────────────────────────────
const pairSeen = new Set();
for (const [x, y, label, kind] of DUOS) {
  const cx = byId(x), cy = byId(y);
  if (!cx) fail(`duo references unknown id: ${x}`);
  if (!cy) fail(`duo references unknown id: ${y}`);
  if (x === y) fail(`duo pairs a character with itself: ${x}`);
  if (!label) fail(`duo ${x} + ${y} has no label`);
  const key = [x, y].sort().join("~");
  if (pairSeen.has(key)) fail(`duplicate duo pair: ${x} + ${y}`);
  pairSeen.add(key);
  if (cx && cy && cx.series !== cy.series) fail(`cross-series duo: ${x} (${cx.series}) + ${y} (${cy.series})`);
}
// Ladder opponents must never earn synergy — that's what keeps the curve honest.
for (const rung of LADDER) {
  const opp = autoAssign(rung.team.map(byId));
  const r = resolveRung(opp, rung);
  if (r.them.duoBonus !== 0) fail(`rung ${rung.rung} opponent earned synergy +${r.them.duoBonus}`);
}

// ── 3b. daily puzzle facts ────────────────────────────────────────────────
let dailyLine = "not present";
if (FACTS) {
  for (const p of FACTS.validateFacts(CHARACTERS)) fail("daily facts: " + p);
  // Every character must be reachable as an answer, and the cycle must not
  // repeat anyone inside one full rotation.
  const seen = new Set();
  let repeats = 0;
  for (let d = 0; d < CHARACTERS.length; d++) {
    const c = FACTS.dailyCharacter(CHARACTERS, new Date(Date.now() + d * 86400000));
    if (seen.has(c.id)) repeats++;
    seen.add(c.id);
  }
  if (repeats) fail(`daily: ${repeats} repeat(s) inside one ${CHARACTERS.length}-day cycle`);
  if (seen.size !== CHARACTERS.length) fail(`daily: only ${seen.size}/${CHARACTERS.length} characters can ever be the answer`);
  // Solve rate, played the way a clue-tracking person plays.
  const playOnce = (ans) => {
    let pool = [...CHARACTERS];
    for (let n = 1; n <= FACTS.GUESSES; n++) {
      const g = pool[Math.floor(Math.random() * pool.length)];
      if (g.id === ans.id) return n;
      const k = FACTS.compare(g, ans).map((x) => x.state).join("|");
      pool = pool.filter((p) => FACTS.compare(g, p).map((x) => x.state).join("|") === k && p.id !== g.id);
      if (!pool.length) return null;
    }
    return null;
  };
  let solved = 0, plays = 0, total = 0;
  for (const c of CHARACTERS) for (let r = 0; r < 8; r++) {
    const n = playOnce(c); plays++;
    if (n) { solved++; total += n; }
  }
  const rate = 100 * solved / plays;
  dailyLine = `${Object.keys(FACTS.CHARACTER_FACTS).length} fact rows, ${FACTS.COLUMNS.length} columns, ${FACTS.GUESSES} guesses — ${rate.toFixed(1)}% solved, avg ${(total / solved).toFixed(2)}`;
  if (rate < 80) fail(`daily too hard: only ${rate.toFixed(1)}% solved within ${FACTS.GUESSES} guesses`);
  if (rate > 99.5) fail(`daily too easy: ${rate.toFixed(1)}% solved — consider removing a column`);
}

// ── 4. NaN sweep ──────────────────────────────────────────────────────────
let combos = 0;
for (const c of CHARACTERS) for (const rid of roleIds) for (const rung of LADDER) {
  const r = resolveRung([{ character: c, roleId: rid }], rung);
  combos++;
  if (!Number.isFinite(r.me.total) || !Number.isFinite(r.them.total)) fail(`NaN score: ${c.id} / ${rid} / rung ${rung.rung}`);
}

// ── team helpers ──────────────────────────────────────────────────────────
const cost = (t) => t.reduce((s, m) => s + m.character.cost, 0);
function randomLegalTeam() {
  for (let attempt = 0; attempt < 300; attempt++) {
    const pool = [...CHARACTERS].sort(() => Math.random() - 0.5);
    const team = []; const used = new Set(); let spent = 0;
    for (const rid of roleIds) {
      const reserve = (PICKS - team.length - 1) * MINCOST;
      const cands = pool.filter((c) => !used.has(c.id) && spent + c.cost + reserve <= BUDGET);
      if (!cands.length) break;
      const c = cands[Math.floor(Math.random() * cands.length)];
      team.push({ character: c, roleId: rid }); used.add(c.id); spent += c.cost;
    }
    if (team.length === PICKS) return team;
  }
  return null;
}
// Objective: rungs cleared, tie-broken on margin so hill-climbing has a gradient.
// A plain greedy on fitted rating is duo-blind and understates the real ceiling.
const objective = (t) => {
  let cl = 0, margin = 0;
  for (const r of LADDER) { const s = resolveRung(t, r); margin += s.me.total - s.them.total; if (s.cleared) cl++; }
  return cl * 1e5 + margin;
};
const rungsCleared = (t) => LADDER.reduce((n, r) => n + (resolveRung(t, r).cleared ? 1 : 0), 0);
function climb(start) {
  let cur = start, best = objective(start), improved = true;
  while (improved) {
    improved = false;
    for (let i = 0; i < PICKS; i++) {
      const others = cur.filter((_, j) => j !== i);
      const used = new Set(others.map((m) => m.character.id));
      const left = BUDGET - cost(others);
      for (const c of CHARACTERS) {
        if (used.has(c.id) || c.cost > left) continue;
        const cand = cur.map((m, j) => (j === i ? { character: c, roleId: m.roleId } : m));
        const s = objective(cand);
        if (s > best) { best = s; cur = cand; improved = true; }
      }
      for (let j = i + 1; j < PICKS; j++) {
        const cand = cur.map((m, k) =>
          k === i ? { character: m.character, roleId: cur[j].roleId } :
          k === j ? { character: m.character, roleId: cur[i].roleId } : m);
        const s = objective(cand);
        if (s > best) { best = s; cur = cand; improved = true; }
      }
    }
  }
  return { team: cur, cleared: rungsCleared(cur), spent: cost(cur) };
}

// ── 5. ceiling ────────────────────────────────────────────────────────────
let top = null;
for (let r = 0; r < 30; r++) {
  const t = randomLegalTeam();
  if (!t) continue;
  const res = climb(t);
  if (!top || res.cleared > top.cleared) top = res;
  if (top.cleared === LADDER.length) break;
}
if (!top) fail("couldn't build any legal team within budget — check costs vs BUDGET");
else if (top.cleared < LADDER.length) fail(`ladder looks unbeatable: best team found clears ${top.cleared}/${LADDER.length}`);

// ── 6. random average ─────────────────────────────────────────────────────
let sum = 0, n = 0, full = 0, withDuo = 0;
const hist = new Array(LADDER.length + 1).fill(0);
for (let i = 0; i < 1500; i++) {
  const t = randomLegalTeam();
  if (!t) continue;
  let reached = 0;
  for (const rung of LADDER) { if (resolveRung(t, rung).cleared) reached++; else break; }
  sum += reached; n++; hist[reached]++;
  if (reached === LADDER.length) full++;
  if (activeDuos(t).length) withDuo++;
}
if (n && full / n > 0.05) fail(`ladder too easy: ${(100 * full / n).toFixed(1)}% of random teams clear it (want under 5%)`);

// ── 7. codec roundtrip ────────────────────────────────────────────────────
let checks = 0, broken = 0;
for (let i = 0; i < 400; i++) {
  const t = randomLegalTeam();
  if (!t) continue;
  const tc = decodeTeam(encodeTeam(t));
  checks++;
  if (!tc || tc.error || tc.team.some((m, j) => m.character.id !== t[j].character.id || m.roleId !== t[j].roleId)) broken++;
  for (const reached of [0, 1, 7, 10]) {
    const rr = decodeResult(encodeResult(t, reached));
    checks++;
    if (!rr || rr.error || rr.reached !== reached ||
        rr.team.some((m, j) => m.character.id !== t[j].character.id || m.roleId !== t[j].roleId)) broken++;
  }
}
if (broken) fail(`${broken}/${checks} codec roundtrips failed`);

// ── report ────────────────────────────────────────────────────────────────
const L = (s = "") => console.log(s);
L(`animeVS health check — ${SRC}`);
L("─".repeat(60));
L(`roster       ${CHARACTERS.length} characters, ${new Set(CHARACTERS.map((c) => c.series)).size} series`);
L(`codec table  ${CODEC_IDS.length}/256 slots used, ${256 - CODEC_IDS.length} free${tombstones.length ? `, ${tombstones.length} tombstone(s)` : ""}`);
L(`synergy      ${DUOS.length} duos at +${DUO_BONUS} each, opponents +0 on every rung`);
L(`NaN sweep    ${combos.toLocaleString()} character × role × rung combos`);
L(`ceiling      ${top ? `${top.cleared}/${LADDER.length} rungs, ${top.spent}/${BUDGET} credits` : "n/a"}`);
if (top) {
  L(`             ${top.team.map((m) => m.character.name).join(", ")}`);
  const d = activeDuos(top.team);
  if (d.length) L(`             duos: ${d.length} (+${d.length * DUO_BONUS}) — ${d.map((x) => x.label).join(", ")}`);
}
L(`random teams avg ${(sum / Math.max(n, 1)).toFixed(2)} rungs over ${n} runs, ${full} full clears (${(100 * full / Math.max(n, 1)).toFixed(1)}%)`);
L(`             ${(100 * withDuo / Math.max(n, 1)).toFixed(1)}% land at least one duo by chance`);
L(`             distribution 0→${LADDER.length}: ${hist.join(" ")}`);
L(`codec        ${checks - broken}/${checks} roundtrips ok`);
L(`daily        ${dailyLine}`);
L();
if (problems.length) {
  L(`✗ ${problems.length} problem${problems.length > 1 ? "s" : ""}:`);
  for (const p of problems) L("  · " + p);
  process.exit(1);
}
L("✓ all checks passed");
