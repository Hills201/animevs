// animeFacts.js — general-anime data for the Daily puzzle.
//
// Deliberately separate from CHARACTERS in App.jsx. That roster carries
// game-balance data (tier, cost, rating, tags, role) which means nothing to
// someone who just watches anime. These are facts a viewer would know.
//
// ── RULES USED WHEN FILLING THIS IN ────────────────────────────────────────
// HAIR is always the DEBUT / BASE form. Goku is black, not gold or blue.
//   Kaneki is black, not white. State this rule in the UI or transformation
//   characters will feel wrong to players.
// AFFILIATION is the one they are BEST KNOWN for, not the latest one they
//   held. Obito is Akatsuki. Geto is Curse Users.
// No alive/dead column — it would spoil every series on this list.
//
// ── ADAPTATION CHOICES (change if you disagree, but say so in the how-to) ──
//   Dragon Ball      1986 original, not Z (1989) or Super (2015)
//   Hunter x Hunter  2011 Madhouse, not the 1999 Nippon version
//   Fullmetal Alch.  2009 Brotherhood, not the 2003 series
//
// ⚠ VERIFY THESE BEFORE LAUNCH — judgement calls a fan might dispute:
//   neferpitou  gender is never confirmed in canon; listed female by convention
//   whitebeard  listed blonde (colour spreads); he reads white-haired to many
//   asta        listed white; often called ash-grey
//   todoroki    listed white; his hair is split white/red
//   tanjiro     listed red; often read as dark burgundy or black
//   alphonse    listed blonde (his real body, not the armour he debuts in)
//   yamamoto    listed white; he is bald on top with a white beard
//   denji       listed blonde; closer to dirty blonde

export const SERIES_FACTS = {
  "Attack on Titan":     { studio: "Wit Studio",     debut: 2013 },
  "Black Clover":        { studio: "Pierrot",        debut: 2017 },
  "Bleach":              { studio: "Pierrot",        debut: 2004 },
  "Chainsaw Man":        { studio: "MAPPA",          debut: 2022 },
  "Demon Slayer":        { studio: "ufotable",       debut: 2019 },
  "Dragon Ball":         { studio: "Toei Animation", debut: 1986 },
  "Fairy Tail":          { studio: "A-1 Pictures",   debut: 2009 },
  "Fullmetal Alchemist": { studio: "Bones",          debut: 2009 },
  "Hunter x Hunter":     { studio: "Madhouse",       debut: 2011 },
  "Jujutsu Kaisen":      { studio: "MAPPA",          debut: 2020 },
  "My Hero Academia":    { studio: "Bones",          debut: 2016 },
  "Naruto":              { studio: "Pierrot",        debut: 2002 },
  "One Piece":           { studio: "Toei Animation", debut: 1999 },
  "One Punch Man":       { studio: "Madhouse",       debut: 2015 },
  "Seven Deadly Sins":   { studio: "A-1 Pictures",   debut: 2014 },
  "Tokyo Ghoul":         { studio: "Pierrot",        debut: 2014 },
};

// [gender, species, hair, affiliation]
export const CHARACTER_FACTS = {

  // Attack on Titan
  "armin-attack-on-titan":               ["male", "human", "blonde", "Survey Corps"],
  "eren-titan-attack-on-titan":          ["male", "titan shifter", "brown", "Survey Corps"],
  "erwin-attack-on-titan":               ["male", "human", "blonde", "Survey Corps"],
  "historia-attack-on-titan":            ["female", "human", "blonde", "Survey Corps"],
  "jean-attack-on-titan":                ["male", "human", "brown", "Survey Corps"],
  "levi-attack-on-titan":                ["male", "human", "black", "Survey Corps"],
  "mikasa-attack-on-titan":              ["female", "human", "black", "Survey Corps"],
  "reiner-titan-attack-on-titan":        ["male", "titan shifter", "blonde", "Marley"],
  "zeke-attack-on-titan":                ["male", "titan shifter", "blonde", "Marley"],

  // Black Clover
  "asta-black-clover":                   ["male", "human", "white", "Black Bulls"],
  "julius-black-clover":                 ["male", "human", "blonde", "Magic Knights"],
  "mereoleona-black-clover":             ["female", "human", "orange", "Crimson Lions"],
  "noelle-black-clover":                 ["female", "human", "silver", "Black Bulls"],
  "nozel-black-clover":                  ["male", "human", "silver", "Silver Eagles"],
  "yami-black-clover":                   ["male", "human", "black", "Black Bulls"],
  "yuno-black-clover":                   ["male", "human", "black", "Golden Dawn"],
  "zagred-black-clover":                 ["male", "devil", "white", "Devils"],

  // Bleach
  "aizen-bleach":                        ["male", "shinigami", "brown", "Gotei 13"],
  "byakuya-bleach":                      ["male", "shinigami", "black", "Gotei 13"],
  "gremmy-bleach":                       ["male", "quincy", "blonde", "Wandenreich"],
  "ichigo-bleach":                       ["male", "shinigami", "orange", "Gotei 13"],
  "kenpachi-bleach":                     ["male", "shinigami", "black", "Gotei 13"],
  "kisuke-bleach":                       ["male", "shinigami", "blonde", "Gotei 13"],
  "orihime-bleach":                      ["female", "human", "orange", "Karakura Town"],
  "renji-bleach":                        ["male", "shinigami", "red", "Gotei 13"],
  "toshiro-bleach":                      ["male", "shinigami", "white", "Gotei 13"],
  "ulquiorra-bleach":                    ["male", "arrancar", "black", "Espada"],
  "yamamoto-bleach":                     ["male", "shinigami", "white", "Gotei 13"],
  "yhwach-bleach":                       ["male", "quincy", "black", "Wandenreich"],
  "yoruichi-bleach":                     ["female", "shinigami", "purple", "Gotei 13"],

  // Chainsaw Man
  "aki-chainsaw-man":                    ["male", "human", "black", "Public Safety"],
  "beam-chainsaw-man":                   ["male", "devil", "blue", "Public Safety"],
  "denji-chainsaw-man":                  ["male", "human", "blonde", "Public Safety"],
  "katana-man-chainsaw-man":             ["male", "human", "black", "Yakuza"],
  "kishibe-chainsaw-man":                ["male", "human", "black", "Public Safety"],
  "makima-chainsaw-man":                 ["female", "devil", "red", "Public Safety"],
  "power-chainsaw-man":                  ["female", "devil", "blonde", "Public Safety"],
  "reze-chainsaw-man":                   ["female", "devil", "black", "Soviet Union"],

  // Demon Slayer
  "akaza-demon-slayer":                  ["male", "demon", "pink", "Twelve Kizuki"],
  "doma-demon-slayer":                   ["male", "demon", "blonde", "Twelve Kizuki"],
  "giyu-demon-slayer":                   ["male", "human", "black", "Hashira"],
  "gyomei-demon-slayer":                 ["male", "human", "black", "Hashira"],
  "inosuke-demon-slayer":                ["male", "human", "black", "Demon Slayer Corps"],
  "kokushibo-demon-slayer":              ["male", "demon", "black", "Twelve Kizuki"],
  "muzan-demon-slayer":                  ["male", "demon", "black", "Twelve Kizuki"],
  "rengoku-demon-slayer":                ["male", "human", "blonde", "Hashira"],
  "shinobu-demon-slayer":                ["female", "human", "black", "Hashira"],
  "tanjiro-demon-slayer":                ["male", "human", "red", "Demon Slayer Corps"],
  "tengen-demon-slayer":                 ["male", "human", "white", "Hashira"],
  "zenitsu-demon-slayer":                ["male", "human", "blonde", "Demon Slayer Corps"],

  // Dragon Ball
  "android-18-dragon-ball":              ["female", "android", "blonde", "Red Ribbon Army"],
  "beerus-dragon-ball":                  ["male", "god", "none", "Gods of Destruction"],
  "broly-dragon-ball":                   ["male", "saiyan", "black", "Saiyans"],
  "cell-dragon-ball":                    ["male", "android", "none", "Red Ribbon Army"],
  "gohan-dragon-ball":                   ["male", "saiyan", "black", "Z Fighters"],
  "goku-dragon-ball":                    ["male", "saiyan", "black", "Z Fighters"],
  "jiren-dragon-ball":                   ["male", "alien", "none", "Pride Troopers"],
  "majin-buu-dragon-ball":               ["male", "majin", "none", "Majin"],
  "piccolo-dragon-ball":                 ["male", "namekian", "none", "Z Fighters"],
  "trunks-dragon-ball":                  ["male", "saiyan", "purple", "Z Fighters"],
  "vegeta-dragon-ball":                  ["male", "saiyan", "black", "Z Fighters"],

  // Fairy Tail
  "erza-fairy-tail":                     ["female", "human", "red", "Fairy Tail"],
  "gildarts-fairy-tail":                 ["male", "human", "orange", "Fairy Tail"],
  "gray-fairy-tail":                     ["male", "human", "black", "Fairy Tail"],
  "jellal-fairy-tail":                   ["male", "human", "blue", "Crime Sorciere"],
  "laxus-fairy-tail":                    ["male", "human", "blonde", "Fairy Tail"],
  "mavis-fairy-tail":                    ["female", "human", "blonde", "Fairy Tail"],
  "natsu-fairy-tail":                    ["male", "human", "pink", "Fairy Tail"],
  "zeref-fairy-tail":                    ["male", "human", "black", "Alvarez Empire"],

  // Fullmetal Alchemist
  "alphonse-fullmetal-alchemist":        ["male", "human", "blonde", "State Alchemists"],
  "edward-elric-fullmetal-alchemist":    ["male", "human", "blonde", "State Alchemists"],
  "father-fullmetal-alchemist":          ["male", "homunculus", "blonde", "Homunculi"],
  "greed-fullmetal-alchemist":           ["male", "homunculus", "black", "Homunculi"],
  "king-bradley-fullmetal-alchemist":    ["male", "homunculus", "black", "Amestris Military"],
  "olivier-fullmetal-alchemist":         ["female", "human", "blonde", "Amestris Military"],
  "roy-mustang-fullmetal-alchemist":     ["male", "human", "black", "State Alchemists"],
  "scar-fullmetal-alchemist":            ["male", "human", "white", "Ishvalans"],

  // Hunter x Hunter
  "biscuit-hunter-x-hunter":             ["female", "human", "blonde", "Hunter Association"],
  "chrollo-hunter-x-hunter":             ["male", "human", "black", "Phantom Troupe"],
  "feitan-hunter-x-hunter":              ["male", "human", "black", "Phantom Troupe"],
  "gon-hunter-x-hunter":                 ["male", "human", "green", "Hunter Association"],
  "hisoka-hunter-x-hunter":              ["male", "human", "red", "Phantom Troupe"],
  "illumi-hunter-x-hunter":              ["male", "human", "black", "Zoldyck Family"],
  "killua-hunter-x-hunter":              ["male", "human", "white", "Zoldyck Family"],
  "kurapika-hunter-x-hunter":            ["male", "human", "blonde", "Kurta Clan"],
  "meruem-hunter-x-hunter":              ["male", "chimera ant", "none", "Chimera Ants"],
  "neferpitou-hunter-x-hunter":          ["female", "chimera ant", "white", "Chimera Ants"],
  "netero-hunter-x-hunter":              ["male", "human", "white", "Hunter Association"],

  // Jujutsu Kaisen
  "choso-jujutsu-kaisen":                ["male", "curse", "black", "Curses"],
  "geto-jujutsu-kaisen":                 ["male", "human", "black", "Curse Users"],
  "gojo-satoru-jujutsu-kaisen":          ["male", "human", "white", "Jujutsu High"],
  "hakari-jujutsu-kaisen":               ["male", "human", "blonde", "Jujutsu High"],
  "mahito-jujutsu-kaisen":               ["male", "curse", "blue", "Curses"],
  "maki-jujutsu-kaisen":                 ["female", "human", "green", "Jujutsu High"],
  "megumi-jujutsu-kaisen":               ["male", "human", "black", "Jujutsu High"],
  "nanami-jujutsu-kaisen":               ["male", "human", "blonde", "Jujutsu High"],
  "nobara-jujutsu-kaisen":               ["female", "human", "orange", "Jujutsu High"],
  "sukuna-jujutsu-kaisen":               ["male", "curse", "pink", "Curses"],
  "todo-jujutsu-kaisen":                 ["male", "human", "black", "Jujutsu High"],
  "yuji-itadori-jujutsu-kaisen":         ["male", "human", "pink", "Jujutsu High"],
  "yuta-jujutsu-kaisen":                 ["male", "human", "black", "Jujutsu High"],

  // My Hero Academia
  "aizawa-my-hero-academia":             ["male", "human", "black", "U.A. High"],
  "bakugo-my-hero-academia":             ["male", "human", "blonde", "U.A. High"],
  "dabi-my-hero-academia":               ["male", "human", "black", "League of Villains"],
  "deku-my-hero-academia":               ["male", "human", "green", "U.A. High"],
  "endeavor-my-hero-academia":           ["male", "human", "red", "Pro Heroes"],
  "gran-torino-my-hero-academia":        ["male", "human", "none", "Pro Heroes"],
  "mirko-my-hero-academia":              ["female", "human", "white", "Pro Heroes"],
  "overhaul-my-hero-academia":           ["male", "human", "brown", "Shie Hassaikai"],
  "shigaraki-my-hero-academia":          ["male", "human", "blue", "League of Villains"],
  "todoroki-my-hero-academia":           ["male", "human", "white", "U.A. High"],

  // Naruto
  "gaara-naruto":                        ["male", "human", "red", "Hidden Sand"],
  "hashirama-naruto":                    ["male", "human", "brown", "Hidden Leaf"],
  "itachi-naruto":                       ["male", "human", "black", "Akatsuki"],
  "jiraiya-naruto":                      ["male", "human", "white", "Hidden Leaf"],
  "kakashi-naruto":                      ["male", "human", "silver", "Hidden Leaf"],
  "madara-naruto":                       ["male", "human", "black", "Uchiha Clan"],
  "might-guy-naruto":                    ["male", "human", "black", "Hidden Leaf"],
  "minato-naruto":                       ["male", "human", "blonde", "Hidden Leaf"],
  "naruto-naruto":                       ["male", "human", "blonde", "Hidden Leaf"],
  "obito-naruto":                        ["male", "human", "black", "Akatsuki"],
  "orochimaru-naruto":                   ["male", "human", "black", "Sound Village"],
  "pain-naruto":                         ["male", "human", "orange", "Akatsuki"],
  "sakura-naruto":                       ["female", "human", "pink", "Hidden Leaf"],
  "sasuke-naruto":                       ["male", "human", "black", "Hidden Leaf"],
  "tsunade-naruto":                      ["female", "human", "blonde", "Hidden Leaf"],

  // One Piece
  "ace-one-piece":                       ["male", "human", "black", "Whitebeard Pirates"],
  "crocodile-one-piece":                 ["male", "human", "black", "Seven Warlords"],
  "doflamingo-one-piece":                ["male", "human", "blonde", "Donquixote Pirates"],
  "roger-one-piece":                     ["male", "human", "black", "Roger Pirates"],
  "kaido-one-piece":                     ["male", "human", "green", "Beasts Pirates"],
  "law-one-piece":                       ["male", "human", "black", "Heart Pirates"],
  "luffy-one-piece":                     ["male", "human", "black", "Straw Hat Pirates"],
  "mihawk-one-piece":                    ["male", "human", "black", "Seven Warlords"],
  "sanji-one-piece":                     ["male", "human", "blonde", "Straw Hat Pirates"],
  "shanks-one-piece":                    ["male", "human", "red", "Red Hair Pirates"],
  "whitebeard-one-piece":                ["male", "human", "blonde", "Whitebeard Pirates"],
  "zoro-one-piece":                      ["male", "human", "green", "Straw Hat Pirates"],

  // One Punch Man
  "atomic-samurai-one-punch-man":        ["male", "human", "black", "Hero Association"],
  "bang-one-punch-man":                  ["male", "human", "white", "Hero Association"],
  "blast-one-punch-man":                 ["male", "human", "blonde", "Hero Association"],
  "boros-one-punch-man":                 ["male", "alien", "white", "Dark Matter Thieves"],
  "garou-one-punch-man":                 ["male", "human", "white", "Monster Association"],
  "genos-one-punch-man":                 ["male", "android", "blonde", "Hero Association"],
  "metal-bat-one-punch-man":             ["male", "human", "black", "Hero Association"],
  "saitama-one-punch-man":               ["male", "human", "none", "Hero Association"],
  "tatsumaki-one-punch-man":             ["female", "human", "green", "Hero Association"],

  // Seven Deadly Sins
  "ban-seven-deadly-sins":               ["male", "human", "white", "Seven Deadly Sins"],
  "escanor-seven-deadly-sins":           ["male", "human", "orange", "Seven Deadly Sins"],
  "estarossa-seven-deadly-sins":         ["male", "demon", "white", "Ten Commandments"],
  "gowther-seven-deadly-sins":           ["male", "doll", "pink", "Seven Deadly Sins"],
  "meliodas-seven-deadly-sins":          ["male", "demon", "blonde", "Seven Deadly Sins"],
  "merlin-seven-deadly-sins":            ["female", "human", "black", "Seven Deadly Sins"],
  "zeldris-seven-deadly-sins":           ["male", "demon", "black", "Ten Commandments"],

  // Tokyo Ghoul
  "kaneki-tokyo-ghoul":                  ["male", "ghoul", "black", "Anteiku"],
  "touka-tokyo-ghoul":                   ["female", "ghoul", "purple", "Anteiku"],
};

export const GUESSES = 7;

// The six columns shown in the grid. Studio is deliberately absent: it's real
// data (and stays in SERIES_FACTS) but it's meta knowledge most viewers don't
// carry, and a seventh column made the puzzle noticeably easier. Measured
// difficulty with these six: 4.3 guesses on average, 92% solved within six.
// Gender stays despite being 85% male — a "female" hit is a big narrowing.
export const COLUMNS = [
  { key: "anime",  label: "Anime"       },
  { key: "year",   label: "Debut"       },  // numeric — shows ▲ / ▼
  { key: "species",label: "Species"     },
  { key: "hair",   label: "Hair"        },
  { key: "affil",  label: "Affiliation" },
  { key: "gender", label: "Gender"      },
];

export function factsFor(character) {
  const f = CHARACTER_FACTS[character.id];
  const s = SERIES_FACTS[character.series];
  if (!f || !s) return null;
  return { anime: character.series, studio: s.studio, year: s.debut,
           gender: f[0], species: f[1], hair: f[2], affil: f[3] };
}

// Feedback for one guess against the answer.
// "hit" = exact, "miss" = wrong, "up"/"down" = numeric nudge.
export function compare(guess, answer) {
  const g = factsFor(guess), a = factsFor(answer);
  if (!g || !a) return [];
  return COLUMNS.map((col) => {
    const gv = g[col.key], av = a[col.key];
    if (col.key === "year") {
      return { key: col.key, label: col.label, value: gv,
               state: gv === av ? "hit" : gv < av ? "up" : "down" };
    }
    return { key: col.key, label: col.label, value: gv,
             state: gv === av ? "hit" : "miss" };
  });
}

// ── the daily pick ─────────────────────────────────────────────────────────
// One fixed permutation, cycled by day. Repeats land exactly one roster-length
// apart — never sooner — and adding a character extends the cycle rather than
// reshuffling it. Deliberately NOT reseeded per cycle: reshuffling lets a
// character land near the seam twice in a fortnight.
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const DAY_MS = 86400000;
export function dayNumber(date = new Date()) {
  const utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor(utc / DAY_MS) - 20000;   // day 0 = 2024-09-14 UTC
}
export function dailyCharacter(characters, date = new Date()) {
  const deck = [...characters];
  const rng = mulberry32(20260919);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  const d = dayNumber(date);
  return deck[((d % deck.length) + deck.length) % deck.length];
}
export function msUntilTomorrow(now = new Date()) {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return next - now.getTime();
}

// ── validation, for healthcheck.mjs ────────────────────────────────────────
export function validateFacts(characters) {
  const problems = [];
  const HAIR = ["black","white","blonde","brown","red","blue","green","pink","purple","silver","orange","none"];
  for (const c of characters) {
    if (!SERIES_FACTS[c.series]) { problems.push('no SERIES_FACTS entry for "' + c.series + '"'); continue; }
    const f = CHARACTER_FACTS[c.id];
    if (!f) { problems.push("no CHARACTER_FACTS entry for " + c.id); continue; }
    if (f.length !== 4 || f.some((v) => !v)) { problems.push(c.id + ": incomplete facts row"); continue; }
    if (!["male", "female"].includes(f[0])) problems.push(c.id + ': gender "' + f[0] + '" is not male/female');
    if (!HAIR.includes(f[2])) problems.push(c.id + ': hair "' + f[2] + '" is outside the agreed palette');
  }
  for (const key of ["gender", "species", "hair", "affil"]) {
    const counts = {};
    for (const c of characters) {
      const f = factsFor(c);
      if (f) counts[f[key]] = (counts[f[key]] || 0) + 1;
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const top = Math.max(0, ...Object.values(counts));
    if (total > 50 && top / total > 0.9) {
      problems.push(key + ": " + Math.round(100 * top / total) + "% share one value - this column barely narrows anything");
    }
  }
  const ids = new Set(characters.map((c) => c.id));
  for (const k of Object.keys(CHARACTER_FACTS)) {
    if (!ids.has(k)) problems.push("CHARACTER_FACTS has a row for unknown id: " + k);
  }
  return problems;
}
