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
// The answer cycles through a FROZEN order, one fighter per day. The order is
// written out below instead of being shuffled from the roster at runtime, so
// editing the roster can never reshuffle it:
//
//   · Reordering, re-rating or renaming fighters in CHARACTERS changes nothing.
//   · A new fighter goes in DAILY_ADDED with the date it was added. It waits for
//     the cycle that is running to finish, then joins the end of every cycle
//     after that. Nobody already scheduled moves, so no answer repeats early.
//   · A fighter that is in the roster but in neither list is simply never the
//     answer (and healthcheck.mjs fails until it is listed).
//
//   *** Never reorder or insert into DAILY_DECK. Add new fighters to DAILY_ADDED. ***
//
// Repeats land a full cycle apart. The order is deliberately not reshuffled per
// cycle: reshuffling lets a character land near the seam twice in a fortnight.
export const DAILY_DECK = [
  "zeke-attack-on-titan", "mavis-fairy-tail", "beerus-dragon-ball", "shanks-one-piece",
  "alphonse-fullmetal-alchemist", "giyu-demon-slayer", "touka-tokyo-ghoul", "toshiro-bleach",
  "metal-bat-one-punch-man", "trunks-dragon-ball", "kaneki-tokyo-ghoul", "yuno-black-clover",
  "todo-jujutsu-kaisen", "reiner-titan-attack-on-titan", "sasuke-naruto", "noelle-black-clover",
  "garou-one-punch-man", "nobara-jujutsu-kaisen", "byakuya-bleach", "luffy-one-piece",
  "gojo-satoru-jujutsu-kaisen", "gohan-dragon-ball", "beam-chainsaw-man", "meruem-hunter-x-hunter",
  "ace-one-piece", "hakari-jujutsu-kaisen", "goku-dragon-ball", "nanami-jujutsu-kaisen",
  "meliodas-seven-deadly-sins", "crocodile-one-piece", "aizawa-my-hero-academia", "shinobu-demon-slayer",
  "kurapika-hunter-x-hunter", "gremmy-bleach", "zagred-black-clover", "bakugo-my-hero-academia",
  "boros-one-punch-man", "doma-demon-slayer", "jiren-dragon-ball", "kenpachi-bleach",
  "naruto-naruto", "escanor-seven-deadly-sins", "yoruichi-bleach", "roy-mustang-fullmetal-alchemist",
  "pain-naruto", "akaza-demon-slayer", "mereoleona-black-clover", "broly-dragon-ball",
  "olivier-fullmetal-alchemist", "kokushibo-demon-slayer", "yuji-itadori-jujutsu-kaisen", "hashirama-naruto",
  "natsu-fairy-tail", "orochimaru-naruto", "erza-fairy-tail", "feitan-hunter-x-hunter",
  "obito-naruto", "minato-naruto", "vegeta-dragon-ball", "greed-fullmetal-alchemist",
  "merlin-seven-deadly-sins", "scar-fullmetal-alchemist", "tatsumaki-one-punch-man", "aizen-bleach",
  "makima-chainsaw-man", "edward-elric-fullmetal-alchemist", "gon-hunter-x-hunter", "levi-attack-on-titan",
  "power-chainsaw-man", "laxus-fairy-tail", "todoroki-my-hero-academia", "hisoka-hunter-x-hunter",
  "whitebeard-one-piece", "genos-one-punch-man", "jiraiya-naruto", "rengoku-demon-slayer",
  "law-one-piece", "gran-torino-my-hero-academia", "blast-one-punch-man", "asta-black-clover",
  "tsunade-naruto", "gyomei-demon-slayer", "muzan-demon-slayer", "ulquiorra-bleach",
  "erwin-attack-on-titan", "megumi-jujutsu-kaisen", "mikasa-attack-on-titan", "mihawk-one-piece",
  "piccolo-dragon-ball", "roger-one-piece", "mirko-my-hero-academia", "zoro-one-piece",
  "maki-jujutsu-kaisen", "chrollo-hunter-x-hunter", "dabi-my-hero-academia", "killua-hunter-x-hunter",
  "nozel-black-clover", "armin-attack-on-titan", "cell-dragon-ball", "kishibe-chainsaw-man",
  "netero-hunter-x-hunter", "atomic-samurai-one-punch-man", "yami-black-clover", "gowther-seven-deadly-sins",
  "endeavor-my-hero-academia", "biscuit-hunter-x-hunter", "might-guy-naruto", "tanjiro-demon-slayer",
  "gaara-naruto", "doflamingo-one-piece", "bang-one-punch-man", "itachi-naruto",
  "zenitsu-demon-slayer", "father-fullmetal-alchemist", "gray-fairy-tail", "julius-black-clover",
  "ban-seven-deadly-sins", "yuta-jujutsu-kaisen", "eren-titan-attack-on-titan", "shigaraki-my-hero-academia",
  "kakashi-naruto", "overhaul-my-hero-academia", "inosuke-demon-slayer", "geto-jujutsu-kaisen",
  "tengen-demon-slayer", "denji-chainsaw-man", "deku-my-hero-academia", "kaido-one-piece",
  "choso-jujutsu-kaisen", "estarossa-seven-deadly-sins", "orihime-bleach", "jean-attack-on-titan",
  "zeldris-seven-deadly-sins", "katana-man-chainsaw-man", "jellal-fairy-tail", "android-18-dragon-ball",
  "saitama-one-punch-man", "ichigo-bleach", "sanji-one-piece", "neferpitou-hunter-x-hunter",
  "aki-chainsaw-man", "king-bradley-fullmetal-alchemist", "sakura-naruto", "majin-buu-dragon-ball",
  "yamamoto-bleach", "reze-chainsaw-man", "renji-bleach", "sukuna-jujutsu-kaisen",
  "historia-attack-on-titan", "illumi-hunter-x-hunter", "kisuke-bleach", "mahito-jujutsu-kaisen",
  "gildarts-fairy-tail", "madara-naruto", "yhwach-bleach", "zeref-fairy-tail",
];

// Fighters added after the deck was frozen: [id, "YYYY-MM-DD" (UTC) it was added].
// Append only, oldest first. Use the real date: a date in the past rewrites the
// cycles since then and shifts the puzzles that follow.
export const DAILY_ADDED = [
  // ["new-fighter-id", "2026-12-01"],
];

const DAY_MS = 86400000;
export function dayNumber(date = new Date()) {
  const utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor(utc / DAY_MS) - 20000;   // day 0 = 2024-10-04 UTC
}
const addedDay = (iso) => (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? dayNumber(new Date(iso + "T00:00:00Z")) : NaN);

// The cycle that contains `date`: its first day, its fighters in order, and how
// far into it that date is. `added` is a parameter so healthcheck.mjs can try
// out a roster change without editing this file.
export function dailyCycle(characters, date = new Date(), added = DAILY_ADDED) {
  const byId = new Map(characters.map((c) => [c.id, c]));
  const inDeck = new Set(DAILY_DECK);
  const base = DAILY_DECK.filter((id) => byId.has(id));          // retired fighters drop out
  const late = added
    .filter(([id]) => byId.has(id) && !inDeck.has(id))
    .map(([id, iso]) => ({ id, day: addedDay(iso) }))
    .filter((x) => Number.isFinite(x.day));
  const orderFrom = (start) => [...base, ...late.filter((x) => x.day <= start).map((x) => x.id)];
  const d = dayNumber(date);
  let start = 0, order = orderFrom(0);
  if (!order.length) order = characters.map((c) => c.id);        // a roster the deck knows nothing about
  if (d < 0) start = Math.floor(d / order.length) * order.length;
  // Walk forward a cycle at a time. A cycle's line-up is fixed on its first day,
  // which is what makes a mid-cycle addition wait its turn.
  while (d >= start + order.length) { start += order.length; order = orderFrom(start); }
  return { start, index: d - start, order: order.map((id) => byId.get(id)) };
}
export function dailyCharacter(characters, date = new Date(), added = DAILY_ADDED) {
  const { order, index } = dailyCycle(characters, date, added);
  return order[index];
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
  // The rotation: a frozen deck plus dated additions (see DAILY_DECK above).
  const deck = new Set(DAILY_DECK);
  if (deck.size !== DAILY_DECK.length) problems.push("DAILY_DECK lists a fighter twice");
  const addedIds = new Set();
  let prev = -Infinity;
  for (const [id, iso] of DAILY_ADDED) {
    const day = addedDay(iso);
    if (!Number.isFinite(day)) problems.push("DAILY_ADDED: " + id + ' needs a "YYYY-MM-DD" date, got "' + iso + '"');
    else { if (day < prev) problems.push("DAILY_ADDED: " + id + " is dated before the entry above it - append only, oldest first"); prev = day; }
    if (deck.has(id)) problems.push("DAILY_ADDED: " + id + " is already in DAILY_DECK");
    if (addedIds.has(id)) problems.push("DAILY_ADDED lists " + id + " twice");
    addedIds.add(id);
  }
  for (const c of characters) {
    if (!deck.has(c.id) && !addedIds.has(c.id)) {
      problems.push(c.id + ' is not in the Daily rotation - append ["' + c.id + '", "<today, YYYY-MM-DD>"] to DAILY_ADDED');
    }
  }
  const ids = new Set(characters.map((c) => c.id));
  for (const k of Object.keys(CHARACTER_FACTS)) {
    if (!ids.has(k)) problems.push("CHARACTER_FACTS has a row for unknown id: " + k);
  }
  return problems;
}
