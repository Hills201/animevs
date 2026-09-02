#!/usr/bin/env node
/**
 * animeVS health check
 * ---------------------------------------------------------------
 * Run from the repo root:   node healthcheck.mjs
 * Or point it at a file:    node healthcheck.mjs path/to/v1.jsx
 *
 * It slices the pure game-logic section out of App.jsx (everything between
 * the imports and the first UI constant), loads it as a module, and runs:
 *   1. data integrity  — dup ids, tier tag caps, bad signature roles,
 *                        unknown ability types, ladder references
 *   2. NaN sweep       — every character in every role against every rung
 *   3. ceiling         — can a strong legal team still clear 10/10?
 *   4. random average  — how far does an average legal team get?
 *   5. codec           — encode/decode roundtrips for team + result codes
 *   6. share-code drift— warns if the roster changed since a pinned snapshot
 *
 * Exits non-zero if anything fails, so it can gate a deploy.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";

const SRC = process.argv[2] || "src/App.jsx";
if (!fs.existsSync(SRC)) {
  console.error(`Can't find ${SRC}. Run from the repo root, or pass the path as an argument.`);
  process.exit(1);
}

// ── slice the pure logic out of the component file ────────────────────────
const raw = fs.readFileSync(SRC, "utf8");
const startIdx = raw.indexOf("const CHARACTERS");
const endIdx = raw.indexOf('const INK =');
if (startIdx < 0 || endIdx < 0 || endIdx <= startIdx) {
  console.error("Couldn't locate the logic section (expected `const CHARACTERS` ... `const INK =`).");
  console.error("If you renamed those, update the markers at the top of this script.");
  process.exit(1);
}
const logic = raw.slice(startIdx, endIdx) + `
export { CHARACTERS, LADDER, ROLES, BUDGET, PICKS, TIER_TAG_CAP, byId, roleFit,
  fittedRating, squadScore, autoAssign, resolveRung, resolvePvP, encodeTeam,
  decodeTeam, encodeResult, decodeResult, counterEdgesFor, tagCapFor };
`;
const tmp = path.join(os.tmpdir(), `animevs-logic-${Date.now()}.mjs`);
fs.writeFileSync(tmp, logic);
const G = await import(pathToFileURL(tmp).href);
fs.unlinkSync(tmp);

const { CHARACTERS, LADDER, ROLES, BUDGET, PICKS, byId, tagCapFor, fittedRating,
        resolveRung, encodeTeam, decodeTeam, encodeResult, decodeResult } = G;
const roleIds = ROLES.map((r) => r.id);
const MINCOST = Math.min(...CHARACTERS.map((c) => c.cost));
const ABILITY_TYPES = ["role_synergy","counter_immune","tag_projection","rival_bonus",
                       "adaptable","clutch","aura_buff","overwhelm"];
let problems = [];
const fail = (m) => problems.push(m);

// ── 1. data integrity ─────────────────────────────────────────────────────
const seen = new Set();
for (const c of CHARACTERS) {
  if (seen.has(c.id)) fail(`duplicate id: ${c.id}`);
  seen.add(c.id);
  if (!Number.isFinite(c.rating) || !Number.isFinite(c.cost)) fail(`non-numeric rating/cost: ${c.id}`);
  if (!roleIds.includes(c.role)) fail(`unknown signature role on ${c.id}: ${c.role}`);
  if (c.tags.length > tagCapFor(c.tier)) fail(`tag cap broken: ${c.id} has ${c.tags.length}, tier ${c.tier} allows ${tagCapFor(c.tier)}`);
  if (new Set(c.tags).size !== c.tags.length) fail(`duplicate tags on ${c.id}`);
  if (c.ability && !ABILITY_TYPES.includes(c.ability.type)) fail(`unknown ability type on ${c.id}: ${c.ability.type}`);
}
for (const rung of LADDER) {
  if (rung.team.length !== PICKS) fail(`rung ${rung.rung} (${rung.name}) has ${rung.team.length} members, expected ${PICKS}`);
  for (const id of rung.team) if (!byId(id)) fail(`rung ${rung.rung} references missing character: ${id}`);
}

// ── 2. NaN sweep ──────────────────────────────────────────────────────────
let combos = 0;
for (const c of CHARACTERS) for (const rid of roleIds) for (const rung of LADDER) {
  const r = resolveRung([{ character: c, roleId: rid }], rung);
  combos++;
  if (!Number.isFinite(r.me.total) || !Number.isFinite(r.them.total)) fail(`NaN score: ${c.id} / ${rid} / rung ${rung.rung}`);
}

// ── team builders ─────────────────────────────────────────────────────────
function randomLegalTeam() {
  for (let attempt = 0; attempt < 200; attempt++) {
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
function greedyBestTeam(iterations = 4000) {
  let best = null;
  for (let i = 0; i < iterations; i++) {
    const pool = [...CHARACTERS].sort(() => Math.random() - 0.5);
    const team = []; const used = new Set(); let spent = 0;
    for (const rid of roleIds) {
      let pick = null, bestVal = -1;
      for (const c of pool) {
        if (used.has(c.id)) continue;
        const reserve = (PICKS - team.length - 1) * MINCOST;
        if (spent + c.cost + reserve > BUDGET) continue;
        const v = fittedRating(c, rid);
        if (v > bestVal) { bestVal = v; pick = c; }
      }
      if (!pick) break;
      team.push({ character: pick, roleId: rid }); used.add(pick.id); spent += pick.cost;
    }
    if (team.length !== PICKS) continue;
    let cleared = 0;
    for (const rung of LADDER) if (resolveRung(team, rung).cleared) cleared++;
    if (!best || cleared > best.cleared) best = { cleared, spent, team };
    if (best.cleared === LADDER.length) break;
  }
  return best;
}

// ── 3 & 4. ceiling and random average ─────────────────────────────────────
const best = greedyBestTeam();
if (!best) fail("couldn't build any legal 7-fighter team within budget — check costs vs BUDGET");
else if (best.cleared < LADDER.length) fail(`ladder may be unbeatable: strongest team found clears only ${best.cleared}/${LADDER.length}`);

const N = 1200;
let sum = 0, n = 0, fullClears = 0;
const hist = new Array(LADDER.length + 1).fill(0);
for (let i = 0; i < N; i++) {
  const t = randomLegalTeam();
  if (!t) continue;
  let reached = 0;
  for (const rung of LADDER) { if (resolveRung(t, rung).cleared) reached++; else break; }
  sum += reached; n++; hist[reached]++;
  if (reached === LADDER.length) fullClears++;
}
const avg = n ? sum / n : 0;
if (n && fullClears / n > 0.05) fail(`ladder too easy: ${(100 * fullClears / n).toFixed(1)}% of random teams clear it (want under 5%)`);

// ── 5. codec roundtrips ───────────────────────────────────────────────────
let codecChecks = 0, codecFails = 0;
for (let i = 0; i < 400; i++) {
  const t = randomLegalTeam();
  if (!t) continue;
  const tc = decodeTeam(encodeTeam(t));
  codecChecks++;
  if (!tc || tc.error || tc.team.some((m, j) => m.character.id !== t[j].character.id || m.roleId !== t[j].roleId)) codecFails++;
  for (const reached of [0, 1, 7, 10]) {
    const rr = decodeResult(encodeResult(t, reached));
    codecChecks++;
    if (!rr || rr.error || rr.reached !== reached ||
        rr.team.some((m, j) => m.character.id !== t[j].character.id || m.roleId !== t[j].roleId)) codecFails++;
  }
}
if (codecFails) fail(`${codecFails}/${codecChecks} codec roundtrips failed`);
if (CHARACTERS.length > 256) fail(`roster is ${CHARACTERS.length} — the 8-bit character index in the codec only addresses 256`);

// ── 6. share-code drift ───────────────────────────────────────────────────
// The codec indexes into the roster ids sorted alphabetically, so ANY added,
// removed or renamed id shifts the indices and makes every previously shared
// link silently decode to different fighters. Pin a hash so that's visible.
const rosterHash = crypto.createHash("sha256")
  .update(CHARACTERS.map((c) => c.id).sort().join("|")).digest("hex").slice(0, 12);
const pinPath = ".roster-hash";
let drift = null;
if (fs.existsSync(pinPath)) {
  const pinned = fs.readFileSync(pinPath, "utf8").trim();
  if (pinned !== rosterHash) drift = pinned;
} else {
  fs.writeFileSync(pinPath, rosterHash + "\n");
}

// ── report ────────────────────────────────────────────────────────────────
const line = (s = "") => console.log(s);
line("animeVS health check — " + SRC);
line("─".repeat(58));
line(`roster            ${CHARACTERS.length} characters, ${new Set(CHARACTERS.map(c=>c.series)).size} series`);
line(`ladder            ${LADDER.length} rungs`);
line(`NaN sweep         ${combos.toLocaleString()} character × role × rung combos`);
line(`ceiling           ${best ? best.cleared + "/" + LADDER.length + " rungs, " + best.spent + "/" + BUDGET + " credits" : "n/a"}`);
if (best) line(`                  ${best.team.map(m => m.character.name + " (" + m.roleId + ")").join(", ")}`);
line(`random teams      avg ${avg.toFixed(2)} rungs over ${n} runs, ${fullClears} full clears (${(100*fullClears/Math.max(n,1)).toFixed(1)}%)`);
line(`                  distribution 0→${LADDER.length}: ${hist.join(" ")}`);
line(`codec             ${codecChecks - codecFails}/${codecChecks} roundtrips ok, ${256 - CHARACTERS.length} slots of index headroom`);
line(`roster hash       ${rosterHash}${drift ? "  (was " + drift + ")" : ""}`);
line();
if (drift) {
  line("⚠  Roster changed since the pinned hash.");
  line("   Every team/result link shared before this change now decodes to");
  line("   DIFFERENT fighters — silently, because the checksum still passes.");
  line("   Bump the code version tag (V2→V3, R1→R2) before deploying, then");
  line(`   run: echo ${rosterHash} > ${pinPath}`);
  line();
}
if (problems.length) {
  line(`✗ ${problems.length} problem${problems.length > 1 ? "s" : ""}:`);
  for (const p of problems) line("  · " + p);
  process.exit(1);
}
line("✓ all checks passed");
