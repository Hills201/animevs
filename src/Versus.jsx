// Versus: blind-draft rooms + live Auction. This whole file (and the Supabase
// client it pulls in) is code-split: it only downloads when someone opens
// Versus or follows a ?room= link, so it never slows down the home screen.
import React, { useState, useEffect, useRef } from "react";
import { supabase, supabaseConfigured } from "./supabaseClient.js";
import {
  AUCTION_BUDGET,
  AUCTION_MIN_BID,
  AbilityChip,
  CHARACTERS,
  HowToPlayButton,
  HowToPlayModal,
  MAX_REROLLS,
  MAX_REROLLS_SPIN,
  PICKS,
  ROLES,
  SignatureHint,
  SpinStage,
  Tag,
  TierBadge,
  auctionBid,
  auctionClockMs,
  auctionExpire,
  auctionFold,
  auctionJoin,
  auctionKey,
  auctionLock,
  auctionLot,
  auctionMaxBid,
  auctionNew,
  auctionNext,
  auctionOpen,
  auctionOther,
  auctionStart,
  auctionTeamValid,
  byId,
  decodeTeam,
  drawFrom,
  encodeTeam,
  fittedRating,
  playPlaceTone,
  resolvePvP,
  roleFit,
  useReel,
  useSeenModal
} from "./App.jsx";

// ─── SHARED ROOM HELPERS (live PvP) ──────────────────────────────────────────
function genRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

const ROOM_MAX_AGE_MS = 2 * 60 * 60 * 1000;

function PresenceDot({ label, ready }) {
  return (
    <div style={{ flex: 1, textAlign: "center", padding: 12, borderRadius: 10, background: ready ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${ready ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.1)"}` }}>
      <div style={{ fontSize: 20 }}>{ready ? "🟢" : "⚪"}</div>
      <div className="c" style={{ fontSize: 12, color: ready ? "#4ade80" : "#78716c", marginTop: 4 }}>{label}{ready ? " ready" : " waiting…"}</div>
    </div>
  );
}

// ─── PVP MODE ────────────────────────────────────────────────────────────────
// Flow: choose to Host (build first, get code) or Challenge (paste code, build blind),
// then both teams reveal and higher total wins. Uses spin-to-build for the team.
function PvpMode() {
  const [stage, setStage] = useState("menu"); // menu | build | reveal
  const [oppCode, setOppCode] = useState("");
  const [oppTeam, setOppTeam] = useState(null); // decoded opponent (challenge mode) or null (host)
  const [oppError, setOppError] = useState("");
  const [myTeam, setMyTeam] = useState({});     // roleId -> {character, roleId}
  const [myCode, setMyCode] = useState("");
  const [pvpLocked, setPvpLocked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [pasteResult, setPasteResult] = useState("");
  const [fromLink, setFromLink] = useState(false); // did opponent arrive via a challenge link?
  const [roomCode, setRoomCode] = useState(""); // live Supabase room code
  const [roomRole, setRoomRole] = useState(null); // "a" | "b"
  const [roomState, setRoomState] = useState(null); // current public room row
  const [roomError, setRoomError] = useState("");
  const [opponentOnline, setOpponentOnline] = useState(null);

  const [seed] = useState(() => (Math.random()*1e9)|0);
  const [current, setCurrent] = useState(null);
  const [spinCount, setSpinCount] = useState(0);
  const [rerollsUsed, setRerollsUsed] = useState(0);
  const { spinning, reelFace, settleKey, run } = useReel(seed);

  // Live room subscription. Team codes are kept in Supabase but are only
  // decoded into the UI after BOTH ready flags are true.
  React.useEffect(() => {
    if (!roomCode || !supabaseConfigured) return undefined;
    let channel;
    let cancelled = false;
    setOpponentOnline(null);
    // Keep the local side stable across remounts/reloads so Player B never
    // falls back to Player A in the result screen.
    try {
      const savedRole = sessionStorage.getItem(`animevs:room-role:${roomCode}`);
      if ((savedRole === "a" || savedRole === "b") && !roomRole) setRoomRole(savedRole);
    } catch (e) {}

    supabase.from("rooms").select("*").eq("code", roomCode).single().then(async ({ data, error }) => {
      if (cancelled) return;
      if (error || !data) { setRoomError("This room no longer exists."); return; }
      const createdAt = data.created_at ? new Date(data.created_at).getTime() : 0;
      if (createdAt && Date.now() - createdAt > ROOM_MAX_AGE_MS) {
        setRoomError("This room has expired. Create a new room to play.");
        return;
      }
      setRoomState(data);

      channel = supabase.channel(`pvp-room:${roomCode}`, { config: { presence: { key: roomRole || "unknown" } } })
        .on("postgres_changes", { event: "*", schema: "public", table: "rooms", filter: `code=eq.${roomCode}` },
          (payload) => { if (payload.new) setRoomState(payload.new); })
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          const keys = Object.keys(state);
          setOpponentOnline(keys.some((key) => key !== roomRole));
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel.track({ role: roomRole || "unknown", at: Date.now() });
          }
        });
    });

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
      setOpponentOnline(null);
    };
  }, [roomCode, roomRole]);

  // When both sides have locked, reveal exactly once and hand the teams to the
  // existing resolvePvP/results UI.
  React.useEffect(() => {
    if (!roomCode || !roomRole || !roomState) return;
    const bothLocked = !!roomState.player_a_ready && !!roomState.player_b_ready;
    if (!bothLocked) return;

    const myRoomCode = roomRole === "a" ? roomState.player_a_team : roomState.player_b_team;
    const otherRoomCode = roomRole === "a" ? roomState.player_b_team : roomState.player_a_team;
    if (!myRoomCode || !otherRoomCode || myRoomCode === "__JOINED__" || otherRoomCode === "__JOINED__") return;

    const mine = decodeTeam(myRoomCode);
    const theirs = decodeTeam(otherRoomCode);
    if (mine.error || theirs.error) {
      setRoomError(mine.error || theirs.error);
      return;
    }

    // Keep the local view authoritative, but fall back to the encoded room
    // team if a player reloads after locking in.
    setMyCode(myRoomCode);
    if (JSON.stringify(myTeam) !== JSON.stringify(mine.team)) setMyTeam(mine.team.reduce((acc, m) => ({ ...acc, [m.roleId]: m }), {}));
    setOppTeam(theirs.team);
    setOppCode(otherRoomCode);
    setRoomError("");
    setStage("reveal");
  }, [roomCode, roomRole, roomState]);

  async function createLiveRoom() {
    if (!supabaseConfigured) { setRoomError("Supabase is not configured in this deployment."); return; }
    setRoomError("");
    const code = genRoomCode();
    const { error } = await supabase.from("rooms").insert({ code, player_a_ready:false, player_b_ready:false, player_a_team:null, player_b_team:null });
    if (error) { setRoomError(error.message); return; }
    setRoomCode(code);
    setRoomRole("a");
    try { sessionStorage.setItem(`animevs:room-role:${code}`, "a"); } catch (e) {}
    setStage("build");
  }

  async function joinLiveRoom(rawCode) {
    if (!supabaseConfigured) { setRoomError("Supabase is not configured in this deployment."); return; }
    const code = rawCode.trim().toUpperCase();
    if (!code) return;
    setRoomError("");
    const { data, error } = await supabase.from("rooms").select("*").eq("code", code).single();
    if (error || !data) { setRoomError("Room not found — check the code."); return; }
    const createdAt = data.created_at ? new Date(data.created_at).getTime() : 0;
    if (createdAt && Date.now() - createdAt > ROOM_MAX_AGE_MS) { setRoomError("That room has expired. Create a new room."); return; }
    if (data.player_b_team && data.player_b_team !== "__JOINED__") { setRoomError("That room already has two players."); return; }
    // Mark the second seat as occupied immediately. This produces a realtime
    // row update for the host even though Player B has not locked a team yet.
    const { error: joinError } = await supabase.from("rooms").update({ player_b_team: "__JOINED__", player_b_ready: false }).eq("code", code).is("player_b_team", null);
    if (joinError) { setRoomError(joinError.message); return; }
    setRoomCode(code);
    setRoomRole("b");
    try { sessionStorage.setItem(`animevs:room-role:${code}`, "b"); } catch (e) {}
    setStage("build");
  }

  // On mount: if the URL carries a challenge (?vs=CODE), auto-load the opponent
  // and drop the player straight into building their team.
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const room = params.get("room");
      if (room) {
        joinLiveRoom(room);
        return;
      }
    } catch (e) {}
  }, []);

  const takenIds = Object.values(myTeam).map((m) => m.character.id);
  const filledCount = Object.keys(myTeam).length;
  const allFilled = filledCount === ROLES.length;
  const MAX_REROLLS = MAX_REROLLS_SPIN;
  const rerollsLeft = MAX_REROLLS - rerollsUsed;
  const [seenHelp, markSeenHelp] = useSeenModal("animevs_seen_help_pvp");
  const [helpOpen, setHelpOpen] = useState(!seenHelp);

  // Build a full shareable challenge URL from a team code.
  function challengeLink(code) {
    try {
      const base = window.location.origin + window.location.pathname;
      return `${base}?vs=${code}`;
    } catch (e) { return code; }
  }

  function spin() {
    if (current || allFilled) return;
    const pool = CHARACTERS.filter((c) => !takenIds.includes(c.id));
    run(pool, () => {
      const chosen = drawFrom(pool, 1, seed ^ (spinCount*2654435761) ^ (Date.now()&0xffff))[0];
      setCurrent(chosen); setSpinCount((n)=>n+1);
    });
  }
  function discardAndReroll() {
    if (!current || spinning) return;
    if (rerollsUsed >= MAX_REROLLS) return;
    const pool = CHARACTERS.filter((c) => !takenIds.includes(c.id));
    setRerollsUsed((r) => r + 1);
    setCurrent(null);
    run(pool, () => {
      const chosen = drawFrom(pool, 1, seed ^ (spinCount*2654435761) ^ (Date.now()&0xffff))[0];
      setCurrent(chosen); setSpinCount((n)=>n+1);
    });
  }
  function placeInto(roleId){ if(!current) return; setMyTeam((t)=>({ ...t, [roleId]:{ character:current, roleId } })); playPlaceTone(); setCurrent(null); }

  async function lockIn() {
    const teamArr = ROLES.map((r) => myTeam[r.id]);
    const code = encodeTeam(teamArr);
    if (!code) return;
    setMyCode(code);

    if (roomCode && roomRole) {
      const fields = roomRole === "a"
        ? { player_a_team: code, player_a_ready: true }
        : { player_b_team: code, player_b_ready: true };
      const { error } = await supabase.from("rooms").update(fields).eq("code", roomCode);
      if (error) { setRoomError(error.message); setPvpLocked(false); return; }
      setPvpLocked(true);
      // Do not reveal here. The realtime effect waits for BOTH ready flags.
      return;
    }

    setStage("reveal");
  }

  function tryDecodeOpponent() {
    // accept either a raw code OR a pasted challenge link
    let val = oppCode.trim();
    const m = val.match(/[?&]vs=([^&\s]+)/);
    if (m) val = decodeURIComponent(m[1]);
    const res = decodeTeam(val);
    if (res.error) { setOppError(res.error); setOppTeam(null); return false; }
    setOppError(""); setOppTeam(res.team); return true;
  }

  function reset() {
    try { if (roomCode) sessionStorage.removeItem(`animevs:room-role:${roomCode}`); } catch (e) {}
    setStage("menu"); setOppCode(""); setOppTeam(null); setOppError(""); setFromLink(false);
    setMyTeam({}); setMyCode(""); setCurrent(null); setSpinCount(0); setRerollsUsed(0); setPasteResult("");
    setRoomCode(""); setRoomRole(null); setRoomState(null); setRoomError(""); setPvpLocked(false);
    try { window.history.replaceState({}, "", window.location.pathname); } catch (e) {}
  }

  // ── MENU: live room only ──
  if (stage === "menu") {
    return (
      <div className="tIn" style={{ maxWidth:560, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10, marginBottom:6 }}>
          <div className="a" style={{ fontSize:28, color:"#f5f5f4" }}>VERSUS</div>
          <HowToPlayButton onClick={() => setHelpOpen(true)} />
        </div>
        <p className="c" style={{ fontSize:15, color:"#a8a29e", marginBottom:24 }}>
          Create a live room or join a friend. Build privately, then reveal both teams together.
        </p>
        {helpOpen && <HowToPlayModal modeId="pvp" onClose={() => { setHelpOpen(false); markSeenHelp(); }} />}

        {!supabaseConfigured ? (
          <div style={{ padding:18, borderRadius:14, border:"1px solid rgba(248,113,113,0.25)", background:"rgba(248,113,113,0.05)" }}>
            <div className="a" style={{ fontSize:20, color:"#fca5a5", marginBottom:5 }}>LIVE ROOMS UNAVAILABLE</div>
            <div className="c" style={{ fontSize:13, color:"#a8a29e" }}>This deployment is missing its Supabase configuration. Add the required environment variables and redeploy.</div>
          </div>
        ) : (
          <div style={{ padding:20, borderRadius:14, border:"1px solid rgba(34,197,94,0.28)", background:"linear-gradient(160deg,rgba(34,197,94,0.08),rgba(255,255,255,0.02) 70%)" }}>
            <div className="a" style={{ fontSize:22, color:"#f5f5f4", marginBottom:5 }}>LIVE ROOM</div>
            <div className="c" style={{ fontSize:13, color:"#a8a29e", marginBottom:14 }}>Share the room code with your opponent. Your teams stay hidden until both players lock in.</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <button onClick={createLiveRoom} className="a" style={{ padding:14, borderRadius:10, background:"#22c55e", color:"#07130a", border:"none", cursor:"pointer", fontSize:16 }}>CREATE ROOM</button>
              <div style={{ display:"flex", gap:8 }}>
                <input id="pvp-room-join" placeholder="ROOM CODE" className="c"
                  style={{ minWidth:0, flex:1, padding:"12px", borderRadius:9, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.14)", color:"#f5f5f4", fontSize:15, textTransform:"uppercase", outline:"none", letterSpacing:"0.12em" }}
                  onKeyDown={(e)=>{ if(e.key === "Enter") joinLiveRoom(e.currentTarget.value); }} />
                <button onClick={()=>joinLiveRoom(document.getElementById("pvp-room-join")?.value || "")} className="c" style={{ padding:"11px 16px", borderRadius:9, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.14)", color:"#e7e5e4", cursor:"pointer", fontWeight:700 }}>JOIN</button>
              </div>
            </div>
            {roomError && <div className="c" style={{ marginTop:8, fontSize:12, color:"#f87171" }}>{roomError}</div>}
          </div>
        )}
      </div>
    );
  }

  // ── BUILD: spin to fill 5 roles (opponent hidden) ──
  if (stage === "build") {
    const reelArea = (
      <div className={`spinReel ${spinning ? "spinReelActive" : ""}`} style={{ borderRadius:16, padding:20, border:"1px solid rgba(255,255,255,0.12)", background:"linear-gradient(160deg,rgba(168,85,247,0.12),rgba(255,255,255,0.02) 60%)", textAlign:"center", minHeight:210, display:"flex", flexDirection:"column", justifyContent:"center" }}>
        {current ? (
          <div key={settleKey} className="spinPop spinLand">
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <TierBadge tier={current.tier} />
              <div className="a" style={{ fontSize:40, lineHeight:1, color:"#f5f5f4" }}>{current.rating}</div>
            </div>
            <div className="c" style={{ fontWeight:700, fontSize:22, color:"#f5f5f4", marginTop:4 }}>{current.name}</div>
            <div className="c" style={{ fontSize:12, textTransform:"uppercase", letterSpacing:"0.08em", color:"#a8a29e", marginBottom:8 }}>{current.series}</div>
            <div style={{ display:"flex", gap:5, justifyContent:"center", flexWrap:"wrap", marginBottom:8 }}>{current.tags.map((t)=><Tag key={t} t={t} />)}</div>
            <AbilityChip ability={current.ability} />
            <div className="c" style={{ marginTop:10, fontSize:13, color:"#a855f7", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em" }}>Pick a role → to place</div>
          </div>
        ) : reelFace ? (
          <div className="reel reelRolling">
            <div className="a" style={{ fontSize:40, lineHeight:1, color:"#78716c" }}>{reelFace.rating}</div>
            <div className="c" style={{ fontWeight:700, fontSize:22, color:"#78716c", marginTop:4 }}>{reelFace.name}</div>
          </div>
        ) : (
          <div><div className="a" style={{ fontSize:30, color:"#57534e" }}>READY</div>
            <div className="c" style={{ fontSize:14, color:"#a8a29e", marginTop:6 }}>Spin to summon a fighter</div></div>
        )}
      </div>
    );
    const belowReel = (
      <>
        {!current && (
          <button onClick={spin} disabled={spinning||allFilled} className="a"
            style={{ marginTop:14, width:"100%", fontSize:26, letterSpacing:"0.05em", padding:"16px", borderRadius:12,
              background:(spinning||allFilled)?"#3a1a5c":"#a855f7", color:"#fff", border:"none",
              cursor:(spinning||allFilled)?"not-allowed":"pointer" }}>
            {allFilled?"TEAM FULL":spinning?"SPINNING…":"SPIN"}
          </button>
        )}
        {current && (
          <button onClick={discardAndReroll} disabled={rerollsUsed>=MAX_REROLLS || spinning} className="c"
            style={{ marginTop:14, width:"100%", textTransform:"uppercase", letterSpacing:"0.15em", fontSize:14, fontWeight:700, padding:"14px", borderRadius:12, background:"transparent",
              border: rerollsUsed>=MAX_REROLLS?"1px solid rgba(255,255,255,0.08)":"1px solid #a855f766",
              color: rerollsUsed>=MAX_REROLLS?"#57534e":"#c084fc", cursor:(rerollsUsed>=MAX_REROLLS||spinning)?"not-allowed":"pointer" }}>
            {rerollsUsed>=MAX_REROLLS ? "No rerolls left — place this fighter" : `↻ Discard & reroll · ${rerollsLeft} left`}
          </button>
        )}
        {roomCode ? (
          <div className="c" style={{ marginTop:12, fontSize:12, color:"#a8a29e", textAlign:"center" }}>
            Your team is only shared when you press LOCK IN. The match reveals automatically once both players lock.
          </div>
        ) : oppTeam && <div className="c" style={{ marginTop:12, fontSize:12, color:"#22c55e", textAlign:"center" }}>Opponent loaded — reveal when your team is full.</div>}
      </>
    );
    return (
      <div className="tIn">
        {roomCode && (
          <div style={{ marginBottom:12, padding:"12px 14px", borderRadius:10, border:"1px solid rgba(34,197,94,0.25)", background:"rgba(34,197,94,0.06)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", gap:10, alignItems:"center" }}>
              <div>
                <div className="c" style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.14em", color:"#86efac", fontWeight:700 }}>LIVE ROOM · PLAYER {roomRole?.toUpperCase()}</div>
                <div className="a" style={{ fontSize:22, color:"#f5f5f4", letterSpacing:"0.12em" }}>{roomCode}</div>
              </div>
              <div className="c" style={{ fontSize:12, color:"#a8a29e", textAlign:"right" }}>
                {roomRole === "a" && !roomState?.player_b_team ? "Waiting for opponent to join" : roomRole === "b" && roomState?.player_b_team === "__JOINED__" ? "Joined — build your team" : "Your picks stay hidden"}
                {roomState?.player_b_team && opponentOnline === false ? " · Opponent offline" : opponentOnline ? " · Opponent online" : ""}
              </div>
            </div>
            <div style={{ display:"flex", gap:6, marginTop:8, fontSize:11 }} className="c">
              <span style={{ color:roomState?.player_a_ready?"#4ade80":"#78716c" }}>● A {roomState?.player_a_ready?"LOCKED":"BUILDING"}</span>
              <span style={{ color:roomState?.player_b_ready?"#4ade80":"#78716c" }}>● B {roomState?.player_b_ready?"LOCKED":"BUILDING"}</span>
              {roomState?.player_b_team && <span style={{ color:opponentOnline===false?"#f59e0b":"#60a5fa", marginLeft:4 }}>● {opponentOnline===false?"OFFLINE":"LIVE"}</span>}
            </div>
            {roomError && <div className="c" style={{ marginTop:7, fontSize:12, color:"#f87171" }}>{roomError}</div>}
          </div>
        )}
        <SpinStage
          title="Versus — build hidden" subtitle="Your opponent can't see your picks." accent="#a855f7"
          team={myTeam} activeChar={current} onPlace={placeInto}
          allFilled={allFilled} onClimb={lockIn} lockedIn={pvpLocked || !!(roomRole === "a" ? roomState?.player_a_ready : roomRole === "b" ? roomState?.player_b_ready : false)}
          reelArea={reelArea} belowReel={belowReel}
          filledCount={filledCount}
          footNote={`Rerolls left: ${rerollsLeft}/${MAX_REROLLS} · Roles filled: ${filledCount}/${ROLES.length}`}
          onHelp={() => setHelpOpen(true)}
        />
        {helpOpen && <HowToPlayModal modeId="pvp" onClose={() => { setHelpOpen(false); markSeenHelp(); }} />}
      </div>
    );
  }

  // ── REVEAL: live room only ──
  if (!roomCode) {
    return <div className="tIn" style={{ maxWidth:560, margin:"0 auto" }}><div className="a" style={{ fontSize:28, color:"#f5f5f4", marginBottom:8 }}>ROOM REQUIRED</div><div className="c" style={{ color:"#a8a29e" }}>Start or join a live room to play Versus.</div><button onClick={reset} className="c" style={{ marginTop:16, padding:"11px 16px", borderRadius:9, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.14)", color:"#e7e5e4", cursor:"pointer" }}>BACK TO ROOMS</button></div>;
  }
  const myTeamArr = ROLES.map((r) => myTeam[r.id]);
  // resolvePvP is intentionally called with the local team first on BOTH clients.
  // Therefore result.a is always YOUR TEAM and result.b is always OPPONENT,
  // regardless of whether this browser owns room seat A or B.
  const result = oppTeam ? resolvePvP(myTeamArr, oppTeam) : null;
  const iWon = result && result.winner === "a";
  const tie = result && result.winner === "tie";
  const localTeamScore = result ? result.a : null;
  const opponentScore = result ? result.b : null;

  function copyMyCode(){ navigator.clipboard?.writeText(myCode).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),1800); }); }
  function copyMyLink(){ navigator.clipboard?.writeText(challengeLink(myCode)).then(()=>{ setLinkCopied(true); setTimeout(()=>setLinkCopied(false),1800); }); }

  return (
    <div className="tIn" style={{ maxWidth:680, margin:"0 auto" }}>
      {roomCode ? (
        <div style={{ borderRadius:14, padding:18, marginBottom:18, border:"1px solid rgba(34,197,94,0.35)", background:"rgba(34,197,94,0.07)" }}>
          <div className="a" style={{ fontSize:24, color:"#f5f5f4" }}>MATCH REVEALED</div>
          <div className="c" style={{ fontSize:13, color:"#a8a29e", marginTop:4 }}>Room {roomCode} · both teams were locked before either side was revealed.</div>
        </div>
      ) : (
      <>
      {/* My code to share */}
      <div style={{ borderRadius:14, padding:20, marginBottom:18, border:"1px solid rgba(168,85,247,0.4)", background:"rgba(168,85,247,0.08)" }}>
        <div className="c" style={{ fontSize:12, textTransform:"uppercase", letterSpacing:"0.2em", color:"#c084fc", fontWeight:700, marginBottom:8 }}>Challenge link — send it to a friend</div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <div style={{ flex:1, padding:"12px 14px", borderRadius:8, background:"rgba(0,0,0,0.4)", border:"1px solid rgba(255,255,255,0.14)", color:"#c4b5fd", fontSize:13, fontFamily:"monospace", overflowX:"auto", whiteSpace:"nowrap" }}>{challengeLink(myCode)}</div>
          <button onClick={copyMyLink} className="a" style={{ padding:"12px 18px", borderRadius:8, background:"#a855f7", color:"#fff", border:"none", cursor:"pointer", fontSize:15, flexShrink:0 }}>
            {linkCopied?"✓ COPIED":"COPY LINK"}
          </button>
        </div>
        <div className="c" style={{ fontSize:12, color:"#a8a29e", marginTop:8 }}>
          When they open it, they'll build their team and the match resolves instantly — no codes to paste.
        </div>
        {/* raw code fallback */}
        <details style={{ marginTop:12 }}>
          <summary className="c" style={{ fontSize:12, color:"#78716c", cursor:"pointer", letterSpacing:"0.05em" }}>Prefer a plain code instead?</summary>
          <div style={{ display:"flex", gap:8, alignItems:"center", marginTop:8 }}>
            <code style={{ flex:1, padding:"10px 12px", borderRadius:8, background:"rgba(0,0,0,0.4)", border:"1px solid rgba(255,255,255,0.14)", color:"#f5f5f4", fontSize:16, letterSpacing:"0.1em", fontFamily:"monospace", overflowX:"auto" }}>{myCode}</code>
            <button onClick={copyMyCode} className="c" style={{ padding:"10px 16px", borderRadius:8, background:"rgba(255,255,255,0.08)", color:"#e7e5e4", border:"1px solid rgba(255,255,255,0.14)", cursor:"pointer", fontSize:14, flexShrink:0 }}>
              {copied?"✓":"COPY"}
            </button>
          </div>
        </details>
      </div>

      {/* If no opponent yet, offer to paste one */}
      {!oppTeam && (
        <div style={{ borderRadius:14, padding:20, marginBottom:18, border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.02)" }}>
          <div className="c" style={{ fontSize:13, color:"#a8a29e", marginBottom:10 }}>
            Waiting on your opponent. Paste their code or challenge link here to see who wins — or send yours and let them run the match.
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <input value={oppCode} onChange={(e)=>{ setOppCode(e.target.value); setOppError(""); }}
              placeholder="Paste opponent's code or link…" className="c"
              style={{ minWidth:0, flex:1, padding:"10px 12px", borderRadius:8, background:"rgba(255,255,255,0.05)", border:`1px solid ${oppError?"#ef4444":"rgba(255,255,255,0.14)"}`, color:"#f5f5f4", fontSize:14, outline:"none" }} />
            <button onClick={tryDecodeOpponent} className="c" style={{ padding:"10px 18px", borderRadius:8, background:"#a855f7", color:"#fff", border:"none", cursor:"pointer", fontWeight:700, fontSize:14 }}>REVEAL</button>
          </div>
          {oppError && <div className="c" style={{ fontSize:12, color:"#ef4444", marginTop:6 }}>{oppError}</div>}
        </div>
      )}

      </>
      )}

      {/* Result */}
      {result && (
        <div className="slam" style={{ borderRadius:16, overflow:"hidden", marginBottom:18, border:tie?"1px solid rgba(255,255,255,0.2)":`1px solid ${iWon?"#22c55e":"#ef4444"}` }}>
          <div style={{ textAlign:"center", padding:"24px 20px", background: tie?"rgba(255,255,255,0.03)":iWon?"linear-gradient(160deg,#0f3d2e,#0b0c10 60%)":"linear-gradient(160deg,#3d0f14,#0b0c10 60%)" }}>
            <div className="a" style={{ fontSize:48, lineHeight:1, color: tie?"#e7e5e4":iWon?"#4ade80":"#f87171" }}>
              {tie?"DEAD HEAT":iWon?"VICTORY":"DEFEAT"}
            </div>
            <div className="c" style={{ fontSize:16, color:"#a8a29e", marginTop:8 }}>
              You {localTeamScore.total.toFixed(0)} · {opponentScore.total.toFixed(0)} Opponent
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0 }}>
            <TeamColumn label="YOUR TEAM" team={myTeamArr} score={localTeamScore} side="a" win={iWon} />
            <TeamColumn label="OPPONENT" team={oppTeam} score={opponentScore} side="b" win={result.winner==="b"} />
          </div>
        </div>
      )}

      <div style={{ display:"flex", gap:12 }}>
        <button onClick={reset} className="c" style={{ flex:1, textTransform:"uppercase", letterSpacing:"0.15em", fontSize:14, fontWeight:700, padding:12, borderRadius:10, border:"1px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.05)", color:"#e7e5e4", cursor:"pointer" }}>
          New match
        </button>
      </div>
    </div>
  );
}

// ─── VERSUS: pick a format ───────────────────────────────────────────────────
// Both formats are live two-player rooms. "Blind" is the original spin-and-hide
// build. "Auction" is the bidding draft below. A shared ?room=CODE link carries
// &m=auction for auction rooms so it opens in the right place.
function VersusMode() {
  const [variant, setVariant] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      if (p.get("room")) return p.get("m") === "auction" ? "auction" : "blind";
    } catch (e) {}
    return null;
  });
  if (variant === "blind") return <PvpMode />;
  if (variant === "auction") return <AuctionMode onExit={() => setVariant(null)} />;
  const cards = [
    { id:"auction", title:"AUCTION", accent:"#f59e0b", tag:"NEW",
      tagline:`Fighters come up one at a time. Bid against your rival with $${AUCTION_BUDGET}. Every fighter you win is gone from their reach.` },
    { id:"blind", title:"BLIND DRAFT", accent:"#a855f7", tag:"",
      tagline:"Spin and build your seven in secret. Both teams are revealed together once you both lock in." },
  ];
  return (
    <div className="tIn" style={{ maxWidth:640, margin:"0 auto" }}>
      <div className="a" style={{ fontSize:28, color:"#f5f5f4", marginBottom:6 }}>VERSUS</div>
      <p className="c" style={{ fontSize:15, color:"#a8a29e", marginBottom:20 }}>Two players, one live room. Choose how you want to build.</p>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {cards.map((c) => (
          <button key={c.id} onClick={() => setVariant(c.id)} className="hov"
            style={{ textAlign:"left", padding:22, borderRadius:16, cursor:"pointer", color:"#e7e5e4",
              border:`1px solid ${c.accent}55`, background:`linear-gradient(160deg, ${c.accent}22, rgba(255,255,255,0.02) 60%)` }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <div className="a" style={{ fontSize:28, color:"#f5f5f4", lineHeight:1 }}>{c.title}</div>
              {c.tag && <span className="c" style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", padding:"2px 8px", borderRadius:999, background:c.accent, color:"#0b0c10" }}>{c.tag}</span>}
            </div>
            <p className="c" style={{ fontSize:15, color:"#a8a29e", margin:0, lineHeight:1.4 }}>{c.tagline}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── AUCTION MODE ────────────────────────────────────────────────────────────
// Room state lives in ONE jsonb row (auction_rooms.state) shaped by the pure
// auction* functions in the logic section. Every write is a compare-and-set on
// the row's `version`, so when both clients act at once exactly one write wins
// and the loser re-reads and tries again (or finds it's too late). Clocks are
// local: each client starts its own countdown when it first sees a state, and
// whichever client's clock runs out first asks the database to advance. Because
// the advance is keyed on the exact state it saw, a stale attempt is a no-op.
const AUCTION_GOLD = "#f59e0b";

function auctionBidOptions(s, who) {
  const min = s.hi + AUCTION_MIN_BID, max = auctionMaxBid(s, who);
  if (max < min) return [];
  const vals = [...new Set([min, s.hi + 3, s.hi + 5, s.hi + 10].filter((v) => v <= max))].sort((x, y) => x - y);
  if (max > min && !vals.includes(max)) vals.push(max);
  return vals.length > 4 ? [...vals.slice(0, 3), max] : vals;
}

function AuctionMode({ onExit }) {
  const [code, setCode] = useState("");
  const [me, setMe] = useState(null);            // "a" (host) | "b"
  const [row, setRow] = useState(null);          // { code, state, version, created_at }
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [online, setOnline] = useState(null);
  const [placed, setPlaced] = useState({});      // roleId -> character id (private until lock)
  const [, setTick] = useState(0);
  const [reelDone, setReelDone] = useState("");
  const [copied, setCopied] = useState(false);
  const [seenHelp, markSeenHelp] = useSeenModal("animevs_seen_help_auction");
  const [helpOpen, setHelpOpen] = useState(!seenHelp);
  const rowRef = React.useRef(null);
  const clockRef = React.useRef({ key: "", deadline: 0, total: 0 });
  const noteTimer = React.useRef(null);
  const { spinning, reelFace, settleKey, run } = useReel(7);

  const s = row ? row.state : null;
  const other = me ? auctionOther(me) : null;
  const key = s ? auctionKey(s) : "";

  function flash(msg) {
    setNote(msg);
    clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => setNote(""), 2200);
  }

  // ── entering / leaving a room ──
  function enter(c, role, data) {
    rowRef.current = data;
    setRow(data); setCode(c); setMe(role); setErr("");
    let saved = {};
    try { saved = JSON.parse(sessionStorage.getItem(`animevs:auction-team:${c}:${role}`)) || {}; } catch (e) {}
    setPlaced(saved);
    try { sessionStorage.setItem(`animevs:auction-role:${c}`, role); } catch (e) {}
    try { window.history.replaceState({}, "", `?room=${c}&m=auction`); } catch (e) {}
  }
  function leave() {
    try { if (code) { sessionStorage.removeItem(`animevs:auction-role:${code}`); sessionStorage.removeItem(`animevs:auction-team:${code}:${me}`); } } catch (e) {}
    try { window.history.replaceState({}, "", window.location.pathname); } catch (e) {}
    rowRef.current = null;
    setRow(null); setCode(""); setMe(null); setPlaced({}); setErr(""); setOnline(null);
  }
  async function createRoom() {
    if (!supabaseConfigured) { setErr("Supabase is not configured in this deployment."); return; }
    const c = genRoomCode();
    const { data, error } = await supabase.from("auction_rooms").insert({ code: c, state: auctionNew((Math.random() * 1e9) | 0), version: 0 }).select().single();
    if (error) { setErr(error.message.includes("auction_rooms") ? "The auction table hasn't been created yet — run the SQL in supabase-auction.sql." : error.message); return; }
    enter(c, "a", data);
  }
  async function joinRoom(raw, attempt = 0) {
    if (!supabaseConfigured) { setErr("Supabase is not configured in this deployment."); return; }
    const c = String(raw || "").trim().toUpperCase();
    if (!c) return;
    const { data, error } = await supabase.from("auction_rooms").select("*").eq("code", c).single();
    if (error || !data) { setErr("Auction room not found — check the code."); return; }
    const made = data.created_at ? new Date(data.created_at).getTime() : 0;
    if (made && Date.now() - made > ROOM_MAX_AGE_MS) { setErr("That room has expired. Create a new one."); return; }
    let saved = null;
    try { saved = sessionStorage.getItem(`animevs:auction-role:${c}`); } catch (e) {}
    if (saved === "a" || saved === "b") { enter(c, saved, data); return; } // reload / reconnect
    const next = auctionJoin(data.state);
    if (!next) { setErr("That room already has two players."); return; }
    const { data: upd, error: e2 } = await supabase.from("auction_rooms").update({ state: next, version: data.version + 1 }).eq("code", c).eq("version", data.version).select();
    if (e2) { setErr(e2.message); return; }
    if (!upd || !upd.length) { if (attempt < 3) return joinRoom(raw, attempt + 1); setErr("Couldn't take the seat — try again."); return; }
    enter(c, "b", upd[0]);
  }
  React.useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      if (p.get("room") && p.get("m") === "auction") joinRoom(p.get("room"));
    } catch (e) {}
  }, []);

  // ── live sync: realtime push + a slow poll as a safety net ──
  React.useEffect(() => {
    if (!code || !me || !supabaseConfigured) return undefined;
    let alive = true;
    const apply = (r) => {
      if (!alive || !r || !r.state) return;
      const cur = rowRef.current;
      if (!cur || r.version >= cur.version) { rowRef.current = r; setRow(r); }
    };
    const channel = supabase.channel(`auction:${code}`, { config: { presence: { key: me } } })
      .on("postgres_changes", { event: "*", schema: "public", table: "auction_rooms", filter: `code=eq.${code}` }, (p) => apply(p.new))
      .on("presence", { event: "sync" }, () => setOnline(Object.keys(channel.presenceState()).some((k) => k !== me)))
      .subscribe(async (status) => { if (status === "SUBSCRIBED") await channel.track({ role: me, at: Date.now() }); });
    const poll = setInterval(async () => {
      const { data } = await supabase.from("auction_rooms").select("*").eq("code", code).single();
      apply(data);
    }, 2500);
    return () => { alive = false; clearInterval(poll); supabase.removeChannel(channel); };
  }, [code, me]);

  // ── compare-and-set write. fn(freshState) -> nextState | null ──
  async function commit(fn) {
    for (let i = 0; i < 5; i++) {
      const cur = rowRef.current;
      if (!cur) return false;
      const next = fn(cur.state);
      if (!next) return false;
      const { data, error } = await supabase.from("auction_rooms").update({ state: next, version: cur.version + 1 }).eq("code", cur.code).eq("version", cur.version).select();
      if (error) { setErr(error.message); return false; }
      if (data && data.length) { rowRef.current = data[0]; setRow(data[0]); return true; }
      const { data: fresh } = await supabase.from("auction_rooms").select("*").eq("code", cur.code).single();
      if (fresh && fresh.version > cur.version) { rowRef.current = fresh; setRow(fresh); }
    }
    return false;
  }

  // ── clocks ──
  if (s && clockRef.current.key !== key) {
    const ms = auctionClockMs(s);
    clockRef.current = { key, total: ms || 0, deadline: ms ? Date.now() + ms : 0 };
  }
  const clock = clockRef.current;
  const remaining = s && clock.deadline ? Math.max(0, clock.deadline - Date.now()) : 0;
  const timed = !!s && ["spin", "bid", "sold"].includes(s.phase);
  React.useEffect(() => {
    if (!timed) return undefined;
    const iv = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(iv);
  }, [timed]);
  // Whoever's clock expires first asks for the advance. The host goes first, the
  // guest a beat later, and a late retry covers a player who has gone offline.
  React.useEffect(() => {
    if (!timed || !me || !clock.deadline) return undefined;
    const k = key;
    const go = () => commit((f) => {
      if (auctionKey(f) !== k) return null;
      return f.phase === "spin" ? auctionOpen(f) : f.phase === "bid" ? auctionExpire(f) : f.phase === "sold" ? auctionNext(f) : null;
    });
    const grace = me === "a" ? 350 : 1000;
    const t1 = setTimeout(go, Math.max(0, clock.deadline + grace - Date.now()));
    const t2 = setTimeout(go, Math.max(0, clock.deadline + grace + 3000 - Date.now()));
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [key, me]);
  // The reel spins on every new lot, then reveals the fighter.
  React.useEffect(() => {
    if (!s || s.phase !== "spin") return;
    const k = key;
    run(CHARACTERS, () => setReelDone(k));
  }, [key]);
  React.useEffect(() => {
    if (!code || !me) return;
    try { sessionStorage.setItem(`animevs:auction-team:${code}:${me}`, JSON.stringify(placed)); } catch (e) {}
  }, [placed, code, me]);

  // ── derived ──
  const mine = s && me ? s[me] : null;
  const theirs = s && other ? s[other] : null;
  const placedIds = Object.values(placed);
  const pendingList = mine ? mine.won.filter((w) => !placedIds.includes(w.id)) : [];
  const pendingChar = pendingList[0] ? byId(pendingList[0].id) : null;
  const myTeam = {};
  if (mine) for (const [rid, id] of Object.entries(placed)) { if (mine.won.some((w) => w.id === id) && byId(id)) myTeam[rid] = { character: byId(id), roleId: rid }; }
  const filled = Object.keys(myTeam).length;
  const allPlaced = filled === ROLES.length;

  function placeInto(roleId) {
    if (!pendingChar || placed[roleId]) return;
    setPlaced((p) => ({ ...p, [roleId]: pendingChar.id }));
    playPlaceTone();
  }
  function autoPlaceRest() {
    const next = { ...placed };
    for (const w of pendingList) {
      const c = byId(w.id);
      let best = null, bestFit = -1;
      for (const r of ROLES) { if (next[r.id]) continue; const f = roleFit(c, r.id).bonus; if (f > bestFit) { bestFit = f; best = r.id; } }
      if (best) next[best] = c.id;
    }
    setPlaced(next);
  }
  async function bid(amount) {
    const lot = s.lot;
    const ok = await commit((f) => (f.lot === lot ? auctionBid(f, me, amount) : null));
    if (!ok) flash("Too late — the price moved.");
  }
  async function fold() {
    const lot = s.lot;
    await commit((f) => (f.lot === lot ? auctionFold(f, me) : null));
  }
  async function lockIn() {
    const arr = ROLES.map((r) => myTeam[r.id]);
    if (arr.some((m) => !m)) return;
    const c = encodeTeam(arr);
    if (c) await commit((f) => auctionLock(f, me, c));
  }
  function inviteLink() {
    try { return `${window.location.origin}${window.location.pathname}?room=${code}&m=auction`; } catch (e) { return code; }
  }
  function copyInvite() {
    navigator.clipboard?.writeText(inviteLink()).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
  }

  const help = helpOpen ? <HowToPlayModal modeId="auction" onClose={() => { setHelpOpen(false); markSeenHelp(); }} /> : null;
  const panel = { borderRadius: 14, border: `1px solid ${AUCTION_GOLD}44`, background: `linear-gradient(160deg, ${AUCTION_GOLD}14, rgba(255,255,255,0.02) 65%)` };

  // ── MENU ──
  if (!code || !s) {
    return (
      <div className="tIn" style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
          <div className="a" style={{ fontSize: 28, color: "#f5f5f4" }}>AUCTION</div>
          <HowToPlayButton onClick={() => setHelpOpen(true)} />
        </div>
        <p className="c" style={{ fontSize: 15, color: "#a8a29e", marginBottom: 20 }}>
          One fighter at a time. ${AUCTION_BUDGET} each. Outbid your rival for the ones you want.
        </p>
        {help}
        {!supabaseConfigured ? (
          <div style={{ padding: 18, borderRadius: 14, border: "1px solid rgba(248,113,113,0.25)", background: "rgba(248,113,113,0.05)" }}>
            <div className="a" style={{ fontSize: 20, color: "#fca5a5", marginBottom: 5 }}>LIVE ROOMS UNAVAILABLE</div>
            <div className="c" style={{ fontSize: 13, color: "#a8a29e" }}>This deployment is missing its Supabase configuration.</div>
          </div>
        ) : (
          <div style={{ ...panel, padding: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={createRoom} className="a" style={{ padding: 14, borderRadius: 10, background: AUCTION_GOLD, color: "#1a1004", border: "none", cursor: "pointer", fontSize: 16 }}>CREATE AUCTION ROOM</button>
              <div style={{ display: "flex", gap: 8 }}>
                <input id="auction-room-join" placeholder="ROOM CODE" className="c"
                  style={{ minWidth:0, flex: 1, padding: 12, borderRadius: 9, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.14)", color: "#f5f5f4", fontSize: 15, textTransform: "uppercase", outline: "none", letterSpacing: "0.12em" }}
                  onKeyDown={(e) => { if (e.key === "Enter") joinRoom(e.currentTarget.value); }} />
                <button onClick={() => joinRoom(document.getElementById("auction-room-join")?.value || "")} className="c"
                  style={{ padding: "11px 16px", borderRadius: 9, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", color: "#e7e5e4", cursor: "pointer", fontWeight: 700 }}>JOIN</button>
              </div>
            </div>
            {err && <div className="c" style={{ marginTop: 8, fontSize: 12, color: "#f87171" }}>{err}</div>}
          </div>
        )}
        <button onClick={onExit} className="c" style={{ marginTop: 16, background: "transparent", border: "none", color: "#78716c", cursor: "pointer", fontSize: 13 }}>← Back to Versus</button>
      </div>
    );
  }

  // ── LOBBY ──
  if (s.phase === "lobby") {
    const guestIn = s.joined.b;
    return (
      <div className="tIn" style={{ maxWidth: 560, margin: "0 auto" }}>
        <div className="a" style={{ fontSize: 28, color: "#f5f5f4", marginBottom: 14 }}>AUCTION ROOM</div>
        {help}
        <div style={{ ...panel, padding: 20 }}>
          <div className="c" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.16em", color: AUCTION_GOLD, fontWeight: 700 }}>Room code · you are player {me.toUpperCase()}</div>
          <div className="a" style={{ fontSize: 44, color: "#f5f5f4", letterSpacing: "0.16em", margin: "4px 0 12px" }}>{code}</div>
          {me === "a" && (
            <button onClick={copyInvite} className="c" style={{ width: "100%", padding: "11px 14px", borderRadius: 9, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", color: "#e7e5e4", cursor: "pointer", fontWeight: 700, marginBottom: 12 }}>
              {copied ? "✓ INVITE LINK COPIED" : "COPY INVITE LINK"}
            </button>
          )}
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <PresenceDot label="You" ready={true} />
            <PresenceDot label="Opponent" ready={guestIn && online !== false} />
          </div>
          {me === "a" ? (
            <button onClick={() => commit((f) => auctionStart(f))} disabled={!guestIn} className="a"
              style={{ width: "100%", padding: 14, borderRadius: 10, fontSize: 18, border: "none", cursor: guestIn ? "pointer" : "not-allowed", background: guestIn ? AUCTION_GOLD : "#44331a", color: guestIn ? "#1a1004" : "#8a7350" }}>
              {guestIn ? "START AUCTION" : "WAITING FOR OPPONENT…"}
            </button>
          ) : (
            <div className="c" style={{ textAlign: "center", fontSize: 14, color: "#a8a29e" }}>You're in. Waiting for the host to start…</div>
          )}
          {err && <div className="c" style={{ marginTop: 8, fontSize: 12, color: "#f87171" }}>{err}</div>}
        </div>
        <button onClick={leave} className="c" style={{ marginTop: 16, background: "transparent", border: "none", color: "#78716c", cursor: "pointer", fontSize: 13 }}>Leave room</button>
      </div>
    );
  }

  // ── RESULT ──
  if (s.phase === "done") {
    const a = s.teams[me] ? decodeTeam(s.teams[me]) : { error: "missing" };
    const b = s.teams[other] ? decodeTeam(s.teams[other]) : { error: "missing" };
    if (a.error || b.error) {
      return <div className="tIn" style={{ maxWidth: 560, margin: "0 auto" }}><div className="a" style={{ fontSize: 26, color: "#f5f5f4" }}>COULDN'T READ A TEAM</div><button onClick={leave} className="c" style={{ marginTop: 14, padding: "11px 16px", borderRadius: 9, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", color: "#e7e5e4", cursor: "pointer" }}>BACK</button></div>;
    }
    const okTheirs = auctionTeamValid(s, other, b.team);
    const result = resolvePvP(a.team, b.team);
    const forfeit = !okTheirs;
    const iWon = forfeit || result.winner === "a";
    const tie = !forfeit && result.winner === "tie";
    return (
      <div className="tIn" style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ ...panel, padding: 18, marginBottom: 18 }}>
          <div className="a" style={{ fontSize: 24, color: "#f5f5f4" }}>AUCTION COMPLETE</div>
          <div className="c" style={{ fontSize: 13, color: "#a8a29e", marginTop: 4 }}>
            Room {code} · you spent ${AUCTION_BUDGET - mine.money} and kept ${mine.money} · they spent ${AUCTION_BUDGET - theirs.money}
          </div>
        </div>
        {forfeit && <div className="c" style={{ marginBottom: 12, fontSize: 13, color: "#fbbf24" }}>Your opponent's lineup didn't match the fighters they won, so the match is awarded to you.</div>}
        <div className="slam" style={{ borderRadius: 16, overflow: "hidden", marginBottom: 18, border: tie ? "1px solid rgba(255,255,255,0.2)" : `1px solid ${iWon ? "#22c55e" : "#ef4444"}` }}>
          <div style={{ textAlign: "center", padding: "24px 20px", background: tie ? "rgba(255,255,255,0.03)" : iWon ? "linear-gradient(160deg,#0f3d2e,#0b0c10 60%)" : "linear-gradient(160deg,#3d0f14,#0b0c10 60%)" }}>
            <div className="a" style={{ fontSize: 48, lineHeight: 1, color: tie ? "#e7e5e4" : iWon ? "#4ade80" : "#f87171" }}>{tie ? "DEAD HEAT" : iWon ? "VICTORY" : "DEFEAT"}</div>
            <div className="c" style={{ fontSize: 16, color: "#a8a29e", marginTop: 8 }}>You {result.a.total.toFixed(0)} · {result.b.total.toFixed(0)} Opponent</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <TeamColumn label="YOUR TEAM" team={a.team} score={result.a} side="a" win={iWon && !tie} />
            <TeamColumn label="OPPONENT" team={b.team} score={result.b} side="b" win={!iWon && !tie} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
          {[["WHAT YOU PAID", mine.won], ["WHAT THEY PAID", theirs.won]].map(([label, won]) => (
            <div key={label} style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}>
              <div className="c" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.16em", color: AUCTION_GOLD, fontWeight: 700, marginBottom: 6 }}>{label}</div>
              {won.map((w) => (
                <div key={w.id} className="c" style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#d6d3d1" }}>
                  <span>{byId(w.id).name}</span><span style={{ color: w.auto ? "#78716c" : AUCTION_GOLD, fontWeight: 700 }}>{w.auto ? "auto" : `$${w.price}`}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <button onClick={leave} className="c" style={{ width: "100%", textTransform: "uppercase", letterSpacing: "0.15em", fontSize: 14, fontWeight: 700, padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "#e7e5e4", cursor: "pointer" }}>New auction</button>
      </div>
    );
  }

  // ── LIVE AUCTION (spin · bid · sold · lock) ──
  const lot = s.phase === "lock" ? null : auctionLot(s);
  const lotVisible = !!lot && (s.phase !== "spin" || reelDone === key);
  const live = s.phase === "bid";
  const myMax = auctionMaxBid(s, me);
  const mustPlace = !!pendingChar && s.phase !== "lock";
  const iLead = s.hiBy === me, theyLead = s.hiBy === other;
  const barPct = clock.total ? Math.min(100, (remaining / clock.total) * 100) : 0;
  const urgent = live && remaining < 3000;
  const options = live && !mustPlace && !iLead ? auctionBidOptions(s, me) : [];
  const last = s.last;
  const soldBanner = s.phase === "sold" && last ? (
    last.by === null ? { text: "UNSOLD", sub: `${byId(last.id).name} goes back unclaimed`, col: "#a8a29e" }
    : last.by === me ? { text: "SOLD TO YOU", sub: `${byId(last.id).name} for $${last.price}`, col: "#4ade80" }
    : { text: "SOLD TO RIVAL", sub: `${byId(last.id).name} for $${last.price}`, col: "#f87171" }
  ) : null;

  const wallet = (label, side, isMe) => (
    <div style={{ flex: 1, padding: "8px 10px", borderRadius: 10, background: "rgba(0,0,0,0.3)", border: `1px solid ${isMe ? AUCTION_GOLD + "66" : "rgba(255,255,255,0.1)"}` }}>
      <div className="c" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", color: isMe ? AUCTION_GOLD : "#a8a29e", fontWeight: 700 }}>
        {label}{!isMe && online === false ? " · offline" : ""}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <span className="a" style={{ fontSize: 26, color: "#f5f5f4" }}>${s[side].money}</span>
        <span className="c" style={{ fontSize: 12, color: "#a8a29e" }}>{s[side].won.length}/{PICKS}</span>
      </div>
    </div>
  );

  const reelArea = (
    <div style={{ ...panel, padding: 14 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>{wallet("You", me, true)}{wallet("Rival", other, false)}</div>
      <div className={`spinReel ${spinning ? "spinReelActive" : ""}`} style={{ borderRadius: 12, padding: 14, textAlign: "center", minHeight: 190, display: "flex", flexDirection: "column", justifyContent: "center", background: "rgba(0,0,0,0.28)", border: "1px solid rgba(255,255,255,0.08)" }}>
        {s.phase === "lock" ? (
          <div>
            <div className="a" style={{ fontSize: 28, color: AUCTION_GOLD }}>AUCTION OVER</div>
            <div className="c" style={{ fontSize: 13, color: "#a8a29e", marginTop: 6 }}>
              {pendingChar ? "Place your last fighters, then lock in." : allPlaced ? (s.teams[me] ? "Locked. Waiting for your rival…" : "Every role is set — lock in your team.") : "Place your fighters, then lock in."}
            </div>
          </div>
        ) : lotVisible ? (
          <div key={`${s.lot}:${settleKey}`} className="spinPop spinLand">
            <div className="c" style={{ fontSize: 11, letterSpacing: "0.2em", color: "#78716c", textTransform: "uppercase" }}>Lot {s.lot + 1}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <TierBadge tier={lot.tier} />
              <div className="a" style={{ fontSize: 38, lineHeight: 1, color: "#f5f5f4" }}>{lot.rating}</div>
            </div>
            <div className="c" style={{ fontWeight: 700, fontSize: 22, color: "#f5f5f4", marginTop: 2 }}>{lot.name}</div>
            <div className="c" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: "#a8a29e", marginBottom: 8 }}>{lot.series}</div>
            <div style={{ display: "flex", gap: 5, justifyContent: "center", flexWrap: "wrap", marginBottom: 8 }}>{lot.tags.map((t) => <Tag key={t} t={t} small />)}</div>
            <AbilityChip ability={lot.ability} small />
            <SignatureHint character={lot} />
            <div className="c" style={{ marginTop: 6, fontSize: 12, color: "#78716c" }}>Draft value ${lot.cost}</div>
          </div>
        ) : reelFace ? (
          <div className="reel reelRolling">
            <div className="a" style={{ fontSize: 38, lineHeight: 1, color: "#78716c" }}>{reelFace.rating}</div>
            <div className="c" style={{ fontWeight: 700, fontSize: 22, color: "#78716c", marginTop: 4 }}>{reelFace.name}</div>
          </div>
        ) : (
          <div className="a" style={{ fontSize: 28, color: "#57534e" }}>NEXT FIGHTER…</div>
        )}
      </div>

      {live && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div>
              <div className="c" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.16em", color: "#a8a29e" }}>{s.hiBy ? "Current bid" : "No bids yet"}</div>
              <div className="a" style={{ fontSize: 40, lineHeight: 1, color: s.hiBy ? (iLead ? "#4ade80" : "#f87171") : "#57534e" }}>{s.hiBy ? `$${s.hi}` : "—"}</div>
            </div>
            <div className="c" style={{ textAlign: "right", fontSize: 13, fontWeight: 700, color: iLead ? "#4ade80" : theyLead ? "#f87171" : "#78716c" }}>
              {iLead ? "You're leading" : theyLead ? "Rival leads" : s.folded ? (s.folded === me ? "You passed" : "Rival passed") : "Open for bids"}
              <div className="a" style={{ fontSize: 22, color: urgent ? "#ef4444" : "#e7e5e4" }}>{(remaining / 1000).toFixed(1)}s</div>
            </div>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.08)", marginTop: 8, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${barPct}%`, background: urgent ? "#ef4444" : AUCTION_GOLD, transition: "width .1s linear" }} />
          </div>
        </div>
      )}
      {soldBanner && (
        <div className="slam" key={key} style={{ marginTop: 12, textAlign: "center", padding: 12, borderRadius: 10, border: `1px solid ${soldBanner.col}66`, background: `${soldBanner.col}14` }}>
          <div className="a" style={{ fontSize: 26, color: soldBanner.col }}>{soldBanner.text}</div>
          <div className="c" style={{ fontSize: 13, color: "#d6d3d1" }}>{soldBanner.sub}</div>
        </div>
      )}
    </div>
  );

  const bidBtn = { padding: "12px 6px", borderRadius: 10, border: `1px solid ${AUCTION_GOLD}`, background: `${AUCTION_GOLD}22`, color: "#fde68a", cursor: "pointer", textAlign: "center" };
  const belowReel = (
    <>
      {pendingChar && (
        <div style={{ marginTop: 12, padding: 10, borderRadius: 10, border: `1px solid ${AUCTION_GOLD}66`, background: `${AUCTION_GOLD}10` }}>
          <div className="c" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: AUCTION_GOLD, fontWeight: 700, marginBottom: 7 }}>
            Place {pendingChar.name}{pendingList.length > 1 ? ` (+${pendingList.length - 1} more waiting)` : ""}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {ROLES.filter((r) => !placed[r.id]).map((r) => {
              const f = roleFit(pendingChar, r.id);
              const col = f.tone === "great" ? "#22c55e" : f.tone === "good" ? "#eab308" : "#ef4444";
              return (
                <button key={r.id} data-act="place" onClick={() => placeInto(r.id)} className="c"
                  style={{ padding: "7px 10px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, color: "#f5f5f4", background: "rgba(0,0,0,0.35)", border: `1px solid ${r.color}88` }}>
                  {r.name} <span style={{ color: col }}>{f.bonus > 0 ? `+${f.bonus}` : "+0"}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div style={{ marginTop: 12 }}>
        {s.phase === "lock" && pendingChar && (
          <button onClick={autoPlaceRest} className="c" style={{ width: "100%", padding: 13, borderRadius: 10, background: `${AUCTION_GOLD}22`, border: `1px solid ${AUCTION_GOLD}`, color: "#fde68a", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>Auto-place the rest</button>
        )}
        {live && mine.won.length >= PICKS && <div className="c" style={{ textAlign: "center", fontSize: 13, color: "#a8a29e" }}>Your squad is full — you're watching the rest.</div>}
        {live && mine.won.length < PICKS && mustPlace && (
          <div className="c" style={{ textAlign: "center", fontSize: 13, color: "#fbbf24", padding: 10, borderRadius: 10, border: "1px solid rgba(251,191,36,0.4)", background: "rgba(251,191,36,0.08)" }}>
            Place <b>{pendingChar.name}</b> in a role before you can bid again.
          </div>
        )}
        {live && mine.won.length < PICKS && !mustPlace && iLead && (
          <div className="c" style={{ textAlign: "center", fontSize: 13, color: "#4ade80" }}>You're ahead at ${s.hi}. If the clock runs out, {lot.name} is yours.</div>
        )}
        {options.length > 0 && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${options.length}, 1fr)`, gap: 8 }}>
              {options.map((v) => (
                <button key={v} data-act="bid" onClick={() => bid(v)} style={bidBtn}>
                  <div className="a" style={{ fontSize: 22, lineHeight: 1 }}>${v}</div>
                  <div className="c" style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 3, color: "#d6a756" }}>{v === myMax && v > s.hi + 1 ? "all in" : `+${v - s.hi}`}</div>
                </button>
              ))}
            </div>
            <button data-act="fold" onClick={fold} className="c" style={{ marginTop: 8, width: "100%", padding: 13, borderRadius: 10, background: "rgba(239,68,68,0.18)", border: "2px solid #ef4444", color: "#fecaca", cursor: "pointer", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", fontSize: 14, boxShadow: "0 0 0 3px rgba(239,68,68,0.10)" }}>
              {theyLead ? `Let go · rival wins at $${s.hi}` : s.folded === me ? "Passed" : "Pass on this fighter"}
            </button>
            <div className="c" style={{ marginTop: 6, fontSize: 11, color: "#78716c", textAlign: "center" }}>
              You can bid up to ${myMax} ({PICKS - mine.won.length - 1 > 0 ? `$${PICKS - mine.won.length - 1} kept back for your other empty slots` : "last slot"}).
            </div>
          </>
        )}
        {s.phase === "spin" && <div className="c" style={{ textAlign: "center", fontSize: 13, color: "#78716c" }}>Bidding opens in a moment…</div>}
        {note && <div className="c" style={{ marginTop: 8, textAlign: "center", fontSize: 12, color: "#f87171" }}>{note}</div>}
        {err && <div className="c" style={{ marginTop: 8, textAlign: "center", fontSize: 12, color: "#f87171" }}>{err}</div>}
      </div>
      {theirs.won.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div className="c" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.16em", color: "#78716c", marginBottom: 5 }}>Rival's squad (roles hidden)</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {theirs.won.map((w) => (
              <span key={w.id} className="c" style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#d6d3d1" }}>
                {byId(w.id).name} · {w.auto ? "auto" : `$${w.price}`}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="tIn">
      <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div className="c" style={{ fontSize: 12, color: "#a8a29e" }}>Room <b style={{ color: "#f5f5f4", letterSpacing: "0.1em" }}>{code}</b> · player {me.toUpperCase()}</div>
        <button onClick={leave} className="c" style={{ background: "transparent", border: "none", color: "#78716c", cursor: "pointer", fontSize: 12 }}>Leave</button>
      </div>
      <SpinStage
        title="Auction" subtitle="Win a fighter, then slot them into a role." accent="#a855f7" quickPlace={false}
        team={myTeam} activeChar={pendingChar} onPlace={placeInto}
        allFilled={allPlaced && s.phase === "lock"} onClimb={lockIn} lockedIn={!!s.teams[me]}
        reelArea={reelArea} belowReel={belowReel}
        filledCount={filled}
        footNote={`Roles filled: ${filled}/${ROLES.length} · Bought: ${mine.won.length}/${PICKS}`}
        onHelp={() => setHelpOpen(true)}
      />
      {help}
    </div>
  );
}

function TeamColumn({ label, team, score, side, win }) {
  return (
    <div style={{ padding:16, background: win?"rgba(34,197,94,0.05)":"transparent", borderLeft: side==="b"?"1px solid rgba(255,255,255,0.08)":"none" }}>
      <div className="c" style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.2em", color: win?"#4ade80":"#a8a29e", fontWeight:700, marginBottom:10 }}>{label}</div>
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {ROLES.map((role) => {
          const m = team.find((x) => x.roleId === role.id);
          if (!m) return null;
          const fr = fittedRating(m.character, role.id);
          return (
            <div key={role.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
              <div style={{ minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ height:7, width:7, borderRadius:99, background:role.color, flexShrink:0 }} />
                  <span className="c" style={{ fontWeight:700, fontSize:13, color:"#f5f5f4", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.character.name}</span>
                </div>
                <div className="c" style={{ fontSize:10, color:"#78716c", marginLeft:12 }}>{role.name}</div>
              </div>
              <span className="a" style={{ fontSize:16, color:"#e7e5e4", flexShrink:0 }}>{fr}</span>
            </div>
          );
        })}
      </div>
      {score.edges.length > 0 && (
        <div className="c" style={{ fontSize:10, color:"#6ee7b7", marginTop:8, lineHeight:1.3 }}>+{score.bonus} {score.edgeDetails.map((e) => `${e.label} (+${e.bonus})`).join(", ")}</div>
      )}
      {score.duoDetails && score.duoDetails.length > 0 && (
        <div className="c" style={{ fontSize:10, color:"#fbbf24", marginTop:4, lineHeight:1.3 }}>+{score.duoBonus} {score.duoDetails.map((d) => `${d.label} (+${d.bonus})`).join(", ")}</div>
      )}
    </div>
  );
}

export default VersusMode;
