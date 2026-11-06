import React, { useEffect, useState } from "react";

// Ko-fi support popup. variant "entry" = first visit, "run" = after a finished run.
// Caps: entry at most once a week; a run popup at most once per 10 min across all
// popups; 14 days of quiet after someone taps through to Ko-fi. Never shown to bots.
const RED = "#ff2d35";
const K_ENTRY = "avs_support_entry_until";
const K_LAST = "avs_support_last_shown";
const K_CLICK = "avs_support_click_until";
const DAY = 864e5;

function read(k) { try { return Number(localStorage.getItem(k) || 0); } catch (e) { return 0; } }
function write(k, v) { try { localStorage.setItem(k, String(v)); } catch (e) {} }
function isBot() {
  try {
    return !!navigator.webdriver || /bot|crawl|spider|slurp|adsbot|mediapartners|lighthouse|headless|prerender/i.test(navigator.userAgent || "");
  } catch (e) { return false; }
}

const COPY = {
  entry: {
    emoji: "👋",
    title: "Welcome to animeVS",
    body: "It's free to play and built by one person. There are so many ideas and improvements still coming, so if you enjoy it, a small tip on Ko-fi helps keep it going.",
    delay: 3500,
  },
  run: {
    emoji: "☕",
    title: "Enjoying animeVS?",
    body: "It's free and built by one person, and there are so many ideas and improvements still coming: new characters, modes and more. If you can, a small tip helps keep it going. Thank you!",
    delay: 1600,
  },
};

export default function SupportPopup({ variant = "run" }) {
  const c = COPY[variant] || COPY.run;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const now = Date.now();
    if (isBot() || now < read(K_CLICK)) return undefined;
    if (variant === "entry" && now < read(K_ENTRY)) return undefined;
    if (now - read(K_LAST) < 10 * 60 * 1000) return undefined;
    const t = setTimeout(() => { write(K_LAST, Date.now()); setOpen(true); }, c.delay);
    return () => clearTimeout(t);
  }, [variant, c.delay]);

  function close(clicked) {
    setOpen(false);
    if (variant === "entry") write(K_ENTRY, Date.now() + 7 * DAY);
    if (clicked) write(K_CLICK, Date.now() + 14 * DAY);
  }

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") close(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;
  return (
    <div onClick={() => close(false)} style={{ position:"fixed", inset:0, zIndex:80, display:"flex", alignItems:"center", justifyContent:"center", padding:16, background:"rgba(5,5,8,0.72)", backdropFilter:"blur(4px)" }}>
      <div role="dialog" aria-modal="true" aria-label="Support animeVS" onClick={(e) => e.stopPropagation()} className="slam"
        style={{ position:"relative", width:"100%", maxWidth:380, boxSizing:"border-box", textAlign:"center", borderRadius:16, padding:"28px 22px 20px",
          border:"1px solid rgba(255,45,53,0.4)", background:"linear-gradient(160deg,#1f1013,#0b0c10 65%)", boxShadow:"0 24px 70px -20px rgba(255,45,53,0.45)" }}>
        <button onClick={() => close(false)} aria-label="Close" style={{ position:"absolute", top:8, right:10, width:32, height:32, border:"none", background:"transparent", color:"#78716c", fontSize:22, cursor:"pointer" }}>×</button>
        <div style={{ fontSize:34, marginBottom:6 }}>{c.emoji}</div>
        <div className="a" style={{ fontSize:26, color:"#f5f5f4", marginBottom:8 }}>{c.title}</div>
        <p className="c" style={{ color:"#a8a29e", fontSize:15, lineHeight:1.5, margin:"0 0 18px" }}>{c.body}</p>
        <a href="https://ko-fi.com/animevs" target="_blank" rel="noopener noreferrer" onClick={() => close(true)} className="a redBtn"
          style={{ display:"block", padding:"13px 16px", borderRadius:10, background:RED, color:"#fff", textDecoration:"none", fontSize:18, letterSpacing:"0.03em" }}>
          Support on Ko-fi
        </a>
        <button onClick={() => close(false)} className="c" style={{ marginTop:10, padding:"8px 12px", border:"none", background:"transparent", color:"#78716c", fontSize:14, cursor:"pointer" }}>
          Maybe later
        </button>
      </div>
    </div>
  );
}
