import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  COLUMNS, GUESSES, compare, factsFor, dailyCharacter, dayNumber, msUntilTomorrow,
} from "./animeFacts.js";

const RED = "#ff2d35";
const HIT = "#22c55e";
const NEAR = "#fbbf24";
const MISS = "#57534e";

// ── per-browser save. Today's progress plus the streak. ─────────────────────
const KEY = "animevs-daily-v1";
function loadSave() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
}
function persist(save) {
  try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) {}
}

function stateColor(state) {
  return state === "hit" ? HIT : state === "miss" ? MISS : NEAR;
}
function stateGlyph(state) {
  return state === "hit" ? "🟩" : state === "miss" ? "⬛" : "🟨";
}

// ── one row of the grid ─────────────────────────────────────────────────────
function GuessRow({ guess, answer, index }) {
  const cells = compare(guess, answer);
  return (
    <div style={{ display:"grid", gridTemplateColumns:`minmax(88px,1.2fr) repeat(${COLUMNS.length},minmax(64px,1fr))`,
      gap:4, marginBottom:4 }}>
      <div style={{ display:"flex", alignItems:"center", padding:"8px 8px", borderRadius:8,
        background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.10)", minWidth:0 }}>
        <span className="c" style={{ fontWeight:700, fontSize:13, color:"#f5f5f4",
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{guess.name}</span>
      </div>
      {cells.map((c) => (
        <div key={c.key}
          className="dailyCell"
          style={{ animationDelay:`${index * 40}ms`,
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
            padding:"6px 4px", borderRadius:8, minHeight:46, textAlign:"center",
            background:`${stateColor(c.state)}22`, border:`1px solid ${stateColor(c.state)}66` }}>
          <span className="c" style={{ fontSize:11, fontWeight:700, lineHeight:1.15, color:"#f5f5f4",
            overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
            {c.value}
          </span>
          {(c.state === "up" || c.state === "down") && (
            <span className="a" style={{ fontSize:13, color:NEAR, lineHeight:1 }}>
              {c.state === "up" ? "▲" : "▼"}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function HeaderRow() {
  return (
    <div style={{ display:"grid", gridTemplateColumns:`minmax(88px,1.2fr) repeat(${COLUMNS.length},minmax(64px,1fr))`,
      gap:4, marginBottom:6 }}>
      <div />
      {COLUMNS.map((c) => (
        <div key={c.key} className="c"
          style={{ fontSize:9.5, textTransform:"uppercase", letterSpacing:"0.08em",
            color:"#78716c", textAlign:"center", fontWeight:700 }}>
          {c.label}
        </div>
      ))}
    </div>
  );
}

// ── type-ahead so nobody has to spell "Neferpitou" ──────────────────────────
function GuessInput({ characters, guessed, onGuess, disabled }) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const boxRef = useRef(null);

  const matches = useMemo(() => {
    const q = text.trim().toLowerCase();
    if (!q) return [];
    return characters
      .filter((c) => !guessed.has(c.id))
      .filter((c) => c.name.toLowerCase().includes(q) || c.series.toLowerCase().includes(q))
      .sort((a, b) => {
        const ai = a.name.toLowerCase().startsWith(q) ? 0 : 1;
        const bi = b.name.toLowerCase().startsWith(q) ? 0 : 1;
        return ai - bi || a.name.localeCompare(b.name);
      })
      .slice(0, 6);
  }, [text, characters, guessed]);

  useEffect(() => { setHighlight(0); }, [text]);
  useEffect(() => {
    const away = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, []);

  const submit = (c) => {
    if (!c || disabled) return;
    onGuess(c);
    setText(""); setOpen(false);
  };

  return (
    <div ref={boxRef} style={{ position:"relative" }}>
      <input
        value={text}
        disabled={disabled}
        onChange={(e) => { setText(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setHighlight((h) => Math.min(h + 1, matches.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setHighlight((h) => Math.max(h - 1, 0)); }
          else if (e.key === "Enter") { e.preventDefault(); submit(matches[highlight]); }
          else if (e.key === "Escape") setOpen(false);
        }}
        placeholder={disabled ? "Come back tomorrow" : "Name any fighter…"}
        className="c"
        style={{ width:"100%", padding:"13px 14px", borderRadius:10, fontSize:15, fontWeight:600,
          background:"rgba(255,255,255,0.05)", color:"#f5f5f4", outline:"none",
          border:`1px solid ${open && matches.length ? RED : "rgba(255,255,255,0.16)"}`,
          opacity: disabled ? 0.5 : 1 }}
      />
      {open && matches.length > 0 && (
        <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:30,
          borderRadius:10, overflow:"hidden", background:"#141519",
          border:"1px solid rgba(255,255,255,0.16)", boxShadow:"0 14px 40px -12px rgba(0,0,0,0.8)" }}>
          {matches.map((c, i) => (
            <button key={c.id} onClick={() => submit(c)} onMouseEnter={() => setHighlight(i)}
              style={{ display:"flex", width:"100%", alignItems:"center", justifyContent:"space-between",
                gap:10, padding:"10px 12px", cursor:"pointer", border:"none", textAlign:"left",
                background: i === highlight ? "rgba(255,45,53,0.14)" : "transparent" }}>
              <span className="c" style={{ fontWeight:700, fontSize:14, color:"#f5f5f4" }}>{c.name}</span>
              <span className="c" style={{ fontSize:11, color:"#78716c" }}>{c.series}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── countdown to the next puzzle ────────────────────────────────────────────
function NextPuzzle() {
  const [left, setLeft] = useState(msUntilTomorrow());
  useEffect(() => {
    const t = setInterval(() => setLeft(msUntilTomorrow()), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(left / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    <div className="c" style={{ fontSize:12, color:"#78716c", textTransform:"uppercase", letterSpacing:"0.15em" }}>
      Next puzzle in <span className="a" style={{ color:"#d6d3d1", fontSize:15 }}>{pad(h)}:{pad(m)}:{pad(s)}</span>
    </div>
  );
}

export default function DailyGame({ characters }) {
  const today = dayNumber();
  const answer = useMemo(() => dailyCharacter(characters), [characters]);

  const [save, setSave] = useState(loadSave);
  const sameDay = save.day === today;
  const [guessIds, setGuessIds] = useState(() => (sameDay && Array.isArray(save.guesses) ? save.guesses : []));
  const [copied, setCopied] = useState(false);

  const guesses = guessIds.map((id) => characters.find((c) => c.id === id)).filter(Boolean);
  const guessedSet = new Set(guessIds);
  const won = guesses.some((g) => g.id === answer.id);
  const out = !won && guesses.length >= GUESSES;
  const done = won || out;

  const commit = (nextIds) => {
    setGuessIds(nextIds);
    const finishedNow = nextIds[nextIds.length - 1] === answer.id;
    const outNow = !finishedNow && nextIds.length >= GUESSES;
    let next = { ...save, day: today, guesses: nextIds };
    if (finishedNow || outNow) {
      const continuing = save.lastResultDay === today - 1;
      const streak = finishedNow ? (continuing ? (save.streak || 0) + 1 : 1) : 0;
      next = { ...next, lastResultDay: today, streak, best: Math.max(save.best || 0, streak) };
    }
    setSave(next);
    persist(next);
  };

  const shareText = useMemo(() => {
    const head = `animeVS Daily #${today} ${won ? guesses.length : "X"}/${GUESSES}`;
    const grid = guesses.map((g) => compare(g, answer).map((c) => stateGlyph(c.state)).join("")).join("\n");
    return `${head}\n${grid}\nanimevs.vercel.app`;
  }, [guesses, answer, won, today]);

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ text: shareText });
      else { await navigator.clipboard.writeText(shareText); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    } catch (e) {
      try { await navigator.clipboard.writeText(shareText); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch (e2) {}
    }
  };

  const left = GUESSES - guesses.length;

  return (
    <div className="tIn">
      <style>{`
        @keyframes dailyPop { from { opacity:0; transform:translateY(-6px) scale(0.96) } to { opacity:1; transform:none } }
        .dailyCell { animation: dailyPop .28s ease both }
        .dailyScroll { overflow-x:auto; -webkit-overflow-scrolling:touch }
      `}</style>

      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, marginBottom:6 }}>
        <div>
          <div className="c" style={{ color:RED, letterSpacing:"0.25em", fontSize:12, textTransform:"uppercase" }}>
            Daily · Puzzle #{today}
          </div>
          <div className="c" style={{ fontSize:13, color:"#a8a29e", marginTop:2 }}>
            One character. {GUESSES} guesses. Everyone gets the same one.
          </div>
        </div>
        <div style={{ textAlign:"right", flexShrink:0 }}>
          <div className="a" style={{ fontSize:26, color: save.streak ? NEAR : "#57534e", lineHeight:1 }}>
            {save.streak || 0}
          </div>
          <div className="c" style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.15em", color:"#78716c" }}>
            streak{save.best ? ` · best ${save.best}` : ""}
          </div>
        </div>
      </div>

      {!done && (
        <p className="c" style={{ fontSize:12, color:"#78716c", margin:"0 0 14px", lineHeight:1.5 }}>
          Green means exact. Grey means no. On <b style={{ color:"#a8a29e" }}>Debut</b>, ▲ means the answer's anime
          is newer than your guess. Hair is always the character's <b style={{ color:"#a8a29e" }}>debut form</b>.
        </p>
      )}

      {!done && (
        <div style={{ marginBottom:16 }}>
          <GuessInput characters={characters} guessed={guessedSet} onGuess={(c) => commit([...guessIds, c.id])} />
          <div className="c" style={{ marginTop:8, fontSize:12, color:"#78716c" }}>
            {left} {left === 1 ? "guess" : "guesses"} left
          </div>
        </div>
      )}

      {guesses.length > 0 && (
        <div className="dailyScroll">
          <div style={{ minWidth:520 }}>
            <HeaderRow />
            {guesses.map((g, i) => <GuessRow key={g.id} guess={g} answer={answer} index={i} />)}
          </div>
        </div>
      )}

      {guesses.length === 0 && (
        <div style={{ padding:"28px 18px", borderRadius:14, textAlign:"center",
          border:"1px dashed rgba(255,255,255,0.16)", background:"rgba(255,255,255,0.02)" }}>
          <div className="c" style={{ fontSize:14, color:"#a8a29e" }}>
            Name any fighter to start. Even a wrong one tells you something.
          </div>
        </div>
      )}

      {done && (
        <div style={{ marginTop:18, padding:18, borderRadius:14,
          border:`1px solid ${won ? `${HIT}55` : "rgba(255,255,255,0.14)"}`,
          background: won ? `${HIT}12` : "rgba(255,255,255,0.03)" }}>
          <div className="a" style={{ fontSize:24, color: won ? HIT : RED, marginBottom:4 }}>
            {won ? "SOLVED" : "OUT OF GUESSES"}
          </div>
          <div className="c" style={{ fontSize:14, color:"#d6d3d1", marginBottom:14 }}>
            {won
              ? `${answer.name} in ${guesses.length} ${guesses.length === 1 ? "guess" : "guesses"}.`
              : `It was ${answer.name} — ${answer.series}.`}
          </div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
            <button onClick={share} className="c"
              style={{ padding:"11px 20px", borderRadius:10, fontSize:13, fontWeight:700,
                textTransform:"uppercase", letterSpacing:"0.12em", cursor:"pointer", border:"none",
                background:RED, color:"#fff" }}>
              {copied ? "Copied ✓" : "Share result"}
            </button>
            <NextPuzzle />
          </div>
        </div>
      )}
    </div>
  );
}
