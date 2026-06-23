import { useState, useEffect, useRef, useCallback } from "react";
import inviteCoverImage from "./assets/invite-cover.jpg";
import portraitImage from "./assets/portrait.jpg";
import backgroundAImage from "./assets/background-a.jpg";
import backgroundBImage from "./assets/background-b.jpg";
import backgroundCImage from "./assets/background-c.jpg";
import backgroundDImage from "./assets/background-d.jpg";
import mandapImage from "./assets/mandap.jpg";
import weddingThemeAudio from "./assets/wedding-theme.mp3";

/* ═══════════════════════════════════════════════════════════
   PRASHANTH & LISHA — Editorial Invitation
   Sabyasachi aesthetic · Cormorant Garamond · large negative space
   Flow: Seal → Family → Portrait → Save the Date → Order of the Day → Venue → Forever
   ═══════════════════════════════════════════════════════════ */

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Ganeshbagh+Jain+Sthanak+Infantry+Road+Shivajinagar+Bengaluru";
const MUSIC_START = 10;
const MUSIC_END = 70;

const SLIDES = [
  { id: "family",     dur: 6500 },
  { id: "portrait",   dur: 3500 },
  { id: "date",       dur: 3500 },
  { id: "order",      dur: 9000 },
  { id: "venue",      dur: 3500 },
  { id: "forever",    dur: 8000 },
];

const CEREMONIES = [
  { t: "8:00 AM",  name: "Alpahaar", sub: "Morning Breakfast", desc: "Breakfast followed by the traditional safa draping ceremony as family and friends gather before the celebrations begin." },
  { t: "9:00 AM",  name: "Baraat Prasthan", sub: "The Baraat", desc: "Join the baraat as we make our way to the venue with music, dancing, and celebration." },
  { t: "10:30 AM", name: "Varmala", sub: "The Exchange of Garlands", desc: "Amid showers of petals and cheers, Prashanth and Lisha choose each other before all." },
  { t: "11:00 AM", name: "Paanigrahan · Saat Phere", sub: "Seven Vows Around the Fire", desc: "The sacred pheras — seven promises, one lifetime, witnessed by Agni and everyone they love." },
  { t: "12:00 PM", name: "Pratibhoj", sub: "A Feast to Remember", desc: "Blessings, embraces, and a celebratory lunch shared with family and friends." },
];


export default function EditorialInvite() {
  const [started, setStarted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const timerRef = useRef(null);
  const startRef = useRef(0);
  const remainRef = useRef(0);
  const audioRef = useRef(null);

  const clear = () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } };
  const schedule = useCallback((idx, ms) => {
    clear(); startRef.current = Date.now(); remainRef.current = ms;
    timerRef.current = setTimeout(() => {
      if (idx < SLIDES.length - 1) setSlide(idx + 1); else setEnded(true);
    }, ms);
  }, []);

  useEffect(() => {
    if (!started || ended || paused) return;
    schedule(slide, SLIDES[slide].dur);
    return clear;
    // paused intentionally omitted — togglePause handles resume scheduling directly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, slide, ended, schedule]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const syncState = () => {
      setMusicPlaying(!audio.paused);
    };

    const loopSegment = () => {
      if (audio.currentTime >= MUSIC_END) {
        audio.currentTime = MUSIC_START;
        if (!audio.paused) {
          void audio.play().catch(() => {});
        }
      }
    };

    audio.addEventListener("play", syncState);
    audio.addEventListener("pause", syncState);
    audio.addEventListener("timeupdate", loopSegment);

    return () => {
      audio.removeEventListener("play", syncState);
      audio.removeEventListener("pause", syncState);
      audio.removeEventListener("timeupdate", loopSegment);
    };
  }, []);

  const startMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.volume = 0.85;
      if (audio.currentTime < MUSIC_START || audio.currentTime >= MUSIC_END) {
        audio.currentTime = MUSIC_START;
      }
      await audio.play();
      setMusicPlaying(true);
    } catch {
      setMusicPlaying(false);
    }
  };

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        if (audio.currentTime < MUSIC_START || audio.currentTime >= MUSIC_END) {
          audio.currentTime = MUSIC_START;
        }
        await audio.play();
        setMusicPlaying(true);
      } catch {
        setMusicPlaying(false);
      }
      return;
    }
    audio.pause();
    setMusicPlaying(false);
  };

  const begin = () => { void startMusic(); setLeaving(true); setTimeout(() => { setStarted(true); setSlide(0); }, 1100); };
  const togglePause = () => {
    if (ended) return;
    setPaused((p) => {
      if (!p) { clear(); remainRef.current = Math.max(800, remainRef.current - (Date.now() - startRef.current)); }
      else schedule(slide, remainRef.current);
      return !p;
    });
  };
  const go = (d) => { clear(); setPaused(false); setEnded(false); setSlide((s) => Math.min(SLIDES.length - 1, Math.max(0, s + d))); };
  const replay = () => { clear(); setEnded(false); setPaused(false); setSlide(0); };

  useEffect(() => {
    let lastTap = 0, lastX = 0, lastY = 0;
    const spawnHeart = (x, y) => {
      [{ s: 44, dx: 0, dy: 0, d: 0 }, { s: 26, dx: -22, dy: 8, d: 55 }, { s: 22, dx: 20, dy: -4, d: 100 }, { s: 18, dx: -6, dy: -18, d: 150 }]
        .forEach(({ s, dx, dy, d }) => {
          const el = document.createElement("div");
          el.className = "tap-heart";
          el.style.cssText = `left:${x + dx}px;top:${y + dy}px;font-size:${s}px;animation-delay:${d}ms`;
          el.textContent = "♥";
          document.body.appendChild(el);
          setTimeout(() => el.remove(), 1200 + d);
        });
    };
    const onTouch = (e) => {
      const t = e.changedTouches?.[0]; if (!t) return;
      const now = Date.now(), x = t.clientX, y = t.clientY;
      if (now - lastTap < 320 && Math.abs(x - lastX) < 70 && Math.abs(y - lastY) < 70) {
        spawnHeart(x, y); lastTap = 0;
      } else { lastTap = now; }
      lastX = x; lastY = y;
    };
    document.addEventListener("touchend", onTouch);
    return () => document.removeEventListener("touchend", onTouch);
  }, []);

  const cur = SLIDES[slide].id;

  return (
    <div className="ed">
      <audio ref={audioRef} src={weddingThemeAudio} preload="metadata" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Cinzel:wght@400;500&family=Pinyon+Script&display=swap');
        :root {
          --cream: #F1E7D6; --mandap-bg: #F6EDDF; --ink: #4A3B2A; --maroon: #7A2E2E;
          --gold: #B08D4C; --gold-deep: #8A6A2E; --gold-text: #684819; --muted: #6E5634;
        }
        * { box-sizing: border-box; margin: 0; }
        .ed {
          position: relative; width: 100%; height: 100svh; min-height: 560px; overflow: hidden;
          font-family: 'Cormorant Garamond', serif; color: var(--ink); background: var(--cream);
          user-select: none; -webkit-tap-highlight-color: transparent;
        }

        /* ===== OPENER (designed envelope image) ===== */
        .opener { position: absolute; inset: 0; z-index: 40; cursor: pointer; border: none; padding: 0;
          background: var(--cream); transition: opacity 1.1s ease, transform 1.1s ease; overflow: hidden; }
        .opener img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 50%; display: block; }
        .opener .shine { position: absolute; inset: 0; background: linear-gradient(115deg, transparent 40%, #FFFFFF55 50%, transparent 60%);
          transform: translateX(-100%); animation: shine 5.5s ease-in-out infinite; pointer-events: none; }
        @keyframes shine { 0% { transform: translateX(-100%);} 55%,100% { transform: translateX(100%);} }
        .opener.leaving { opacity: 0; transform: scale(1.05); pointer-events: none; }

        /* ===== SLIDE STAGE ===== */
        .stage { position: absolute; inset: 0; z-index: 5; }
        .slide { position: absolute; inset: 0; opacity: 0; pointer-events: none;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; padding: 64px 30px 92px; background-size: cover; background-position: center; }
        .slide.active { opacity: 1; pointer-events: auto; }
        .slide[style*="url"]::before { content: ""; position: absolute; inset: 0;
          background: radial-gradient(120% 80% at 50% 42%, rgba(248,240,228,.55) 0%, rgba(248,240,228,.18) 55%, transparent 100%); pointer-events: none; }
        .slide[style*="url"] > * { position: relative; z-index: 1; }

        /* per-slide entrance animations (distinct) */
        .slide.active.anim-fade { animation: fadeIn 1.3s ease both; }
        .slide.active.anim-rise > * { animation: riseIn 1.2s ease both; }
        .slide.active.anim-rise > *:nth-child(2) { animation-delay: .25s; }
        .slide.active.anim-rise > *:nth-child(3) { animation-delay: .45s; }
        .slide.active.anim-rise > *:nth-child(4) { animation-delay: .65s; }
        .slide.active.anim-rise > *:nth-child(5) { animation-delay: .85s; }
        .slide.active.anim-rise > *:nth-child(6) { animation-delay: 1.05s; }
        .slide.active.anim-rise > *:nth-child(7) { animation-delay: 1.2s; }
        .slide.active.anim-rise > *:nth-child(8) { animation-delay: 1.32s; }
        .slide.active.anim-rise > *:nth-child(9) { animation-delay: 1.44s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes riseIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }

        .eyebrow { font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: .4em; text-transform: uppercase; color: var(--gold-text); }
        .ornament { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 20px 0; color: var(--gold); }
        .ornament::before, .ornament::after { content: ""; width: 46px; height: 1px; background: var(--gold); opacity: .6; }
        .ornament svg { width: 14px; height: 14px; }

        /* FAMILY */
        .slide-family { gap: 0; background-size: 115% !important; background-position: center center !important; }
        .fam-topmark { color: var(--gold); opacity: .72; margin: 0 0 6px; display: flex; justify-content: center; }
        .fam-house { font-family: 'Cormorant Garamond', serif; font-weight: 700; font-size: clamp(19px, 5.2vw, 27px);
          letter-spacing: .34em; text-transform: uppercase; color: var(--gold-deep); }
        .fam-invite { font-family: 'Cinzel', serif; font-size: clamp(9px,2.4vw,11.5px); letter-spacing: .26em;
          text-transform: uppercase; color: var(--gold-text); margin: 8px 0 12px; line-height: 1.8; }
        .nm-block { display: flex; flex-direction: column; align-items: center; }
        .nm-script { font-family: 'Pinyon Script', cursive; font-size: clamp(54px, 14vw, 100px); color: var(--maroon); line-height: .92; }
        .nm-parent { font-style: italic; font-size: clamp(12.5px,3.3vw,15px); color: var(--muted); margin-top: 2px; letter-spacing: .01em; }
        .nm-weds { font-family: 'Pinyon Script', cursive; font-size: clamp(38px,10vw,58px); color: var(--gold); display: flex; align-items: center; gap: 10px; margin: 6px 0; }
        .nm-leaf { width: 46px; height: 14px; color: var(--gold); opacity: .7; display: block; flex-shrink: 0; }
        .nm-leaf-r { transform: scaleX(-1); }
        .fam-bless { font-family: 'Cinzel', serif; font-size: clamp(9px,2.3vw,11px); letter-spacing: .3em; text-transform: uppercase; color: var(--gold-text); margin-top: 6px; max-width: 220px; line-height: 1.9; opacity: .8; }

        /* PORTRAIT — full bleed */
        .slide-portrait { padding: 0; }
        .portrait-img { position: absolute; inset: 0; }
        .portrait-img img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 38%; transform: scale(1.2); }
        .slide-portrait.active .portrait-img img { animation: ken 8s ease-out both; }
        @keyframes ken { from { transform: scale(1.2); } to { transform: scale(1.38); } }
        .portrait-cap { position: absolute; left: 0; right: 0; bottom: 11%; z-index: 2; }
        .portrait-cap .pc-t { font-family: 'Cormorant Garamond', serif; font-weight: 500; font-style: italic; font-size: clamp(28px,6.8vw,42px); color: #FBF3E6; text-shadow: 0 2px 16px rgba(60,30,20,.6); }
        .portrait-cap .pc-s { font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: .32em; text-transform: uppercase; color: #EAD4A6; margin-top: 8px; }
        .portrait-veil { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(18,8,4,.75) 0%, rgba(18,8,4,.30) 28%, transparent 48%, transparent 56%, rgba(30,14,8,.68) 100%); }

        /* SAVE THE DATE */
        .slide-date { background-color: #F7D8D2; background-size: 115% !important; background-position: center center !important; }
        .slide-date::before { display: none; }
        .dt-heart { display: flex; align-items: center; gap: 10px; color: var(--maroon); font-size: 11px; margin: 6px 0; }
        .dt-heart::before, .dt-heart::after { content: ""; display: block; width: 44px; height: 1px; background: var(--gold); opacity: .55; }
        .dt-morning { font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 400; font-size: clamp(32px,8vw,48px); color: var(--maroon); line-height: 1.1; margin: 2px 0 6px; }
        .dt-full { font-family: 'Cinzel', serif; font-weight: 700; font-size: clamp(32px,9vw,60px); letter-spacing: .04em; text-transform: uppercase; white-space: nowrap; color: var(--maroon); margin: 4px 0; line-height: 1; }
        .dt-num { color: var(--gold-deep); }

        /* ORDER OF THE DAY */
        .slide-order { justify-content: flex-start; padding-top: 50px; }
        .order-head { font-weight: 600; font-size: clamp(26px,6.5vw,42px); color: var(--maroon); }
        .order-list { max-width: 560px; width: 100%; margin: 6px auto 0; display: flex; flex-direction: column;
          overflow-y: auto; max-height: calc(100vh - 224px); scrollbar-width: none; }
        .order-list::-webkit-scrollbar { display: none; }
        .ord-row { display: flex; gap: 12px; align-items: flex-start; text-align: left; padding: 8px 12px; margin-bottom: 5px;
          border: 1px solid #CFBC9348; border-radius: 14px;
          background: linear-gradient(90deg, rgba(246,237,223,.88) 0%, rgba(246,237,223,.72) 52%, rgba(246,237,223,.18) 100%);
          box-shadow: 0 8px 18px rgba(122,46,46,.06); opacity: 0; }
        .ord-row:last-child { margin-bottom: 0; }
        .slide-order.active .ord-row { animation: riseIn .7s ease forwards; }
        .slide-order.active .ord-row:nth-child(1){animation-delay:.5s}
        .slide-order.active .ord-row:nth-child(2){animation-delay:1.0s}
        .slide-order.active .ord-row:nth-child(3){animation-delay:1.5s}
        .slide-order.active .ord-row:nth-child(4){animation-delay:2.0s}
        .slide-order.active .ord-row:nth-child(5){animation-delay:2.5s}
        .ord-time { flex: 0 0 72px; font-family: 'Cinzel', serif; font-size: 11px; font-weight: 600; letter-spacing: .06em; color: var(--gold-text); padding-top: 4px; }
        .ord-name { font-weight: 600; font-size: 17px; color: var(--maroon); line-height: 1.15; }
        .ord-sub { font-family: 'Cinzel', serif; font-size: 9px; letter-spacing: .2em; text-transform: uppercase; color: var(--gold-text); margin: 1px 0 2px; }
        .ord-desc { font-style: italic; font-size: 12.5px; color: var(--muted); line-height: 1.4; font-weight: 300; }

        /* VENUE */
        .slide-venue { padding: 0; justify-content: flex-start; background: linear-gradient(180deg, #F8F0E4 0%, #F3E6D6 52%, #E9D7BB 100%); overflow: hidden; }
        .slide-venue::before { content: ""; position: absolute; inset: 0;
          background:
            radial-gradient(70% 46% at 50% 18%, rgba(255,250,242,.92) 0%, rgba(255,250,242,.38) 58%, transparent 100%),
            linear-gradient(180deg, rgba(246,237,223,.22) 0%, rgba(246,237,223,0) 34%, rgba(169,128,61,.10) 100%);
          pointer-events: none; }
        .venue-content { position: relative; z-index: 2; padding: 11vh 30px 0; display: flex; flex-direction: column; align-items: center; }
        .venue-mandap { position: absolute; left: -8%; right: -8%; bottom: -4%; height: 74%; z-index: 1;
          background-repeat: no-repeat; background-position: center bottom; background-size: cover;
          mix-blend-mode: multiply; opacity: .96; filter: saturate(.98) contrast(1.02); pointer-events: none;
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,.75) 14%, #000 28%, #000 100%);
          mask-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,.75) 14%, #000 28%, #000 100%); }
        .vn-name { font-weight: 600; font-size: clamp(32px,8vw,56px); color: var(--maroon); line-height: 1.05; }
        .vn-addr { font-style: italic; font-size: clamp(15px,4vw,19px); color: var(--muted); margin-top: 10px; }
        .btn-line { display: inline-block; margin-top: 26px; border: 1px solid var(--gold); color: var(--gold-text);
          background: transparent; border-radius: 0; padding: 12px 30px; font-family: 'Cinzel', serif; font-size: 11px;
          letter-spacing: .24em; text-transform: uppercase; cursor: pointer; text-decoration: none; transition: all .25s; }
        .btn-line:hover { background: var(--gold); color: #FBF3E6; }
        .btn-line:disabled { opacity: .5; cursor: default; }

        /* FOREVER */
        .slide-forever { justify-content: center; padding: 72px 36px 100px; }
        .slide-forever::before { background: rgba(248,242,230,.62) !important; }
        .fvr-hero { text-align: center; margin-bottom: 22px; }
        .fvr-heading { font-family: 'Cinzel', serif; font-weight: 700; font-size: clamp(19px,5.2vw,34px);
          letter-spacing: .32em; text-transform: uppercase; color: var(--maroon); line-height: 1.1; }
        .fvr-script { font-family: 'Pinyon Script', cursive; font-size: clamp(44px,11.5vw,64px);
          color: var(--gold-deep); line-height: 1.0; margin-top: -2px; }
        .fvr-divider { display: flex; align-items: center; gap: 0; justify-content: center;
          margin: 0 auto 22px; width: 200px; }
        .fvr-divider-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, var(--gold) 40%, var(--gold) 60%, transparent); }
        .fvr-divider-icon { display: flex; align-items: center; gap: 5px; padding: 0 10px; }
        .fvr-divider-icon svg { display: block; }
        .fvr-quote { font-style: italic; font-size: clamp(13px,3.5vw,15.5px); color: var(--ink);
          line-height: 1.65; font-weight: 400; max-width: 248px; margin: 0 auto 26px; }
        .fvr-closer { text-align: center; }
        .fvr-nm { font-family: 'Cinzel', serif; font-weight: 500; font-size: clamp(13px,3.5vw,17px);
          letter-spacing: .22em; text-transform: uppercase; color: var(--maroon); opacity: .75; line-height: 1.3; }
        .fvr-weds { display: flex; align-items: center; gap: 7px; justify-content: center; margin: 1px 0; }
        .fvr-rl { flex: 1; max-width: 36px; height: 1px; background: var(--gold); opacity: .6; }
        .fvr-weds-txt { font-family: 'Pinyon Script', cursive; font-size: clamp(18px,4.8vw,24px);
          color: var(--gold-deep); opacity: .8; line-height: 1; }
        .fvr-date { font-family: 'Cinzel', serif; font-size: clamp(9px,2.4vw,12px);
          letter-spacing: .18em; color: var(--maroon); opacity: .6; margin-top: 5px; white-space: nowrap; }

        /* DOUBLE-TAP HEART */
        .tap-heart { position: fixed; pointer-events: none; z-index: 9999;
          transform: translate(-50%,-50%); color: #C0392B; line-height: 1;
          animation: heartFloat 1.1s ease-out forwards; }
        @keyframes heartFloat {
          0%   { opacity: 0; transform: translate(-50%,-50%) scale(.4); }
          25%  { opacity: 1; transform: translate(-50%,-65%) scale(1.2); }
          75%  { opacity: .85; transform: translate(-50%,-130%) scale(.95); }
          100% { opacity: 0; transform: translate(-50%,-175%) scale(.7); }
        }

        /* ===== PROGRESS + CONTROLS ===== */
        .progress { position: absolute; top: 16px; left: 18px; right: 18px; z-index: 30; display: flex; gap: 6px; }
        .pbar { flex: 1; height: 2px; background: #7A2E2E22; overflow: hidden; }
        .pbar i { display: block; height: 100%; width: 0; background: var(--gold); }
        .pbar.done i { width: 100%; }
        .pbar.live i { animation: fill linear forwards; }
        .pbar.paused i { animation-play-state: paused; }
        @keyframes fill { from { width: 0; } to { width: 100%; } }
        .controls { position: absolute; bottom: 22px; left: 0; right: 0; z-index: 30; display: flex; justify-content: center; gap: 18px; }
        .ctrl { width: 38px; height: 38px; border-radius: 50%; border: 1px solid var(--gold); background: #FBF6ECCC;
          color: var(--maroon); display: flex; align-items: center; justify-content: center; cursor: pointer;
          backdrop-filter: blur(3px); transition: transform .15s; }
        .ctrl.is-on { background: rgba(176,141,76,.24); }
        .ctrl:hover { transform: scale(1.08); }
        .ctrl:focus-visible { outline: 2px solid var(--maroon); outline-offset: 2px; }
        .ctrl-music { width: auto; min-width: 92px; border-radius: 999px; padding: 0 14px; gap: 8px;
          font-family: 'Cinzel', serif; font-size: 9px; letter-spacing: .18em; text-transform: uppercase; }
        .ctrl-label { line-height: 1; }
        .tapzone { position: absolute; top: 60px; bottom: 72px; width: 30%; z-index: 20; background: transparent; border: none; cursor: pointer; }
        .tapzone.left { left: 0; } .tapzone.right { right: 0; }

        @media (prefers-reduced-motion: reduce) {
          .opener .shine { animation: none; display: none; }
          .slide.active, .slide.active.anim-rise > *, .slide-order.active .ord-row, .slide-portrait.active .portrait-img img { animation: none !important; opacity: 1 !important; transform: none !important; }
          .pbar.live i { animation: none; width: 100%; }
        }
      `}</style>

      {/* OPENER — designed envelope */}
      {!started && (
        <button className={`opener ${leaving ? "leaving" : ""}`} onClick={begin} aria-label="Tap to open the invitation">
          <img src={inviteCoverImage} alt="Prashanth and Lisha — wedding invitation, tap to open" />
          <span className="shine" aria-hidden="true" />
        </button>
      )}

      {started && (
        <>
          <div className="progress" aria-hidden="true">
            {SLIDES.map((s, i) => (
              <div key={s.id} className={`pbar ${i < slide ? "done" : ""} ${i === slide && !ended ? "live" : ""} ${paused ? "paused" : ""}`}>
                <i style={i === slide && !ended ? { animationDuration: `${SLIDES[i].dur}ms` } : undefined} />
              </div>
            ))}
          </div>

          <button className="tapzone left" aria-label="Previous" onClick={() => go(-1)} />
          <button className="tapzone right" aria-label="Next" onClick={() => go(1)} />

          <div className="stage">
            {/* FAMILY INVITATION */}
            <section className={`slide slide-family anim-rise ${cur === "family" ? "active" : ""}`} style={{ backgroundImage: `url(${backgroundAImage})` }}>
              <div className="fam-topmark">
                <svg viewBox="0 0 70 22" width="70" height="22" fill="none" stroke="currentColor" strokeLinecap="round">
                  <path d="M35,3 C31,3 28,6 30,10 C32,13 35,12 35,9" strokeWidth="0.9"/>
                  <path d="M35,3 C39,3 42,6 40,10 C38,13 35,12 35,9" strokeWidth="0.9"/>
                  <path d="M30,10 C25,10 21,7 23,4 C25,2 28,4 27,8" strokeWidth="0.8"/>
                  <path d="M40,10 C45,10 49,7 47,4 C45,2 42,4 43,8" strokeWidth="0.8"/>
                  <path d="M21,6 C15,7 11,11 13,15 C15,18 19,16 18,12" strokeWidth="0.7"/>
                  <path d="M49,6 C55,7 59,11 57,15 C55,18 51,16 52,12" strokeWidth="0.7"/>
                </svg>
              </div>
              <p className="fam-house">DAGA family</p>
              <p className="fam-invite">cordially invites you to celebrate the wedding ceremony of</p>
              <div className="ornament"><svg viewBox="0 0 14 14"><path d="M7,1 L8,6 L13,7 L8,8 L7,13 L6,8 L1,7 L6,6 Z" fill="currentColor"/></svg></div>
              <div className="nm-block">
                <div className="nm-script">Prashanth</div>
                <p className="nm-parent">S/o Smt. Madhubala &amp; Shri Norathmalji Daga</p>
              </div>
              <div className="nm-weds">
                <svg className="nm-leaf" viewBox="0 0 56 16" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round">
                  <path d="M2,12 C18,11 38,10 54,9"/><path d="M11,12 Q15,6 22,10"/><path d="M28,11 Q32,5 39,9"/><path d="M43,10 Q47,5 53,9"/>
                </svg>
                &amp;
                <svg className="nm-leaf nm-leaf-r" viewBox="0 0 56 16" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round">
                  <path d="M2,12 C18,11 38,10 54,9"/><path d="M11,12 Q15,6 22,10"/><path d="M28,11 Q32,5 39,9"/><path d="M43,10 Q47,5 53,9"/>
                </svg>
              </div>
              <div className="nm-block">
                <div className="nm-script">Lisha</div>
                <p className="nm-parent">D/o Smt. Indrabai &amp; Lt. Shri Bherulalji Girya</p>
              </div>
              <div className="ornament"><svg viewBox="0 0 14 14"><path d="M7,1 L8,6 L13,7 L8,8 L7,13 L6,8 L1,7 L6,6 Z" fill="currentColor"/></svg></div>
              <p className="fam-bless">We look forward to your presence and blessings</p>
            </section>

            {/* COUPLE PORTRAIT */}
            <section className={`slide slide-portrait ${cur === "portrait" ? "active" : ""}`}>
              <div className="portrait-img">
                <img src={portraitImage} alt="Prashanth and Lisha" loading="lazy" />
                <div className="portrait-veil" />
              </div>
              <div className="portrait-cap">
                <div className="pc-t">A Beautiful Beginning</div>
                <div className="pc-s">Of a lifetime of love, laughter, and togetherness.</div>
              </div>
            </section>

            {/* SAVE THE DATE */}
            <section className={`slide slide-date anim-rise ${cur === "date" ? "active" : ""}`} style={{ backgroundImage: `url(${backgroundBImage})` }}>
              <div className="ornament"><svg viewBox="0 0 14 14"><path d="M7,1 L8,6 L13,7 L8,8 L7,13 L6,8 L1,7 L6,6 Z" fill="currentColor"/></svg></div>
              <p className="eyebrow">Save the Date</p>
              <div className="dt-heart">♥</div>
              <p className="dt-morning">Sunday Morning</p>
              <div className="ornament"><svg viewBox="0 0 14 14"><path d="M7,1 L8,6 L13,7 L8,8 L7,13 L6,8 L1,7 L6,6 Z" fill="currentColor"/></svg></div>
              <p className="dt-full"><span className="dt-num">12</span> July <span className="dt-num">2026</span></p>
              <div className="ornament"><svg viewBox="0 0 14 14"><path d="M7,1 L8,6 L13,7 L8,8 L7,13 L6,8 L1,7 L6,6 Z" fill="currentColor"/></svg></div>
            </section>

            {/* ORDER OF THE DAY */}
            <section className={`slide slide-order ${cur === "order" ? "active" : ""}`} style={{ backgroundImage: `url(${backgroundCImage})` }}>
              <p className="eyebrow">Sunday · 12 July 2026</p>
              <h2 className="order-head">A Day of Celebrations</h2>
              <div className="ornament"><svg viewBox="0 0 14 14"><path d="M7,1 L8,6 L13,7 L8,8 L7,13 L6,8 L1,7 L6,6 Z" fill="currentColor"/></svg></div>
              <div className="order-list">
                {CEREMONIES.map((c) => (
                  <div className="ord-row" key={c.name}>
                    <div className="ord-time">{c.t}</div>
                    <div>
                      <p className="ord-name">{c.name}</p>
                      <p className="ord-sub">{c.sub}</p>
                      <p className="ord-desc">{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* VENUE — mandap painted seamlessly into the slide */}
            <section className={`slide slide-venue ${cur === "venue" ? "active" : ""}`}>
              <div className="venue-content anim-rise">
                <p className="eyebrow">The Venue</p>
                <div className="ornament"><svg viewBox="0 0 14 14"><path d="M7,1 L8,6 L13,7 L8,8 L7,13 L6,8 L1,7 L6,6 Z" fill="currentColor"/></svg></div>
                <p className="vn-name">Ganeshbagh Jain Sthanak</p>
                <p className="vn-addr">Infantry Road · Shivajinagar · Bengaluru 560001</p>
                <a className="btn-line" href={MAPS_URL} target="_blank" rel="noreferrer">Open in Maps</a>
              </div>
              <div className="venue-mandap" style={{ backgroundImage: `url(${mandapImage})` }} aria-hidden="true" />
            </section>

            {/* FOREVER */}
            <section className={`slide slide-forever anim-rise ${cur === "forever" ? "active" : ""}`} style={{ backgroundImage: `url(${backgroundDImage})` }}>
              <div className="fvr-hero">
                <h2 className="fvr-heading">The Beginning</h2>
                <p className="fvr-script">of forever</p>
              </div>
              <div className="fvr-divider">
                <span className="fvr-divider-line" />
                <span className="fvr-divider-icon">
                  <svg width="7" height="7" viewBox="0 0 8 8"><polygon points="4,0 8,4 4,8 0,4" fill="none" stroke="#B08D4C" strokeWidth="1"/></svg>
                  <svg width="10" height="10" viewBox="0 0 10 10"><polygon points="5,0 10,5 5,10 0,5" fill="#B08D4C"/></svg>
                  <svg width="7" height="7" viewBox="0 0 8 8"><polygon points="4,0 8,4 4,8 0,4" fill="none" stroke="#B08D4C" strokeWidth="1"/></svg>
                </span>
                <span className="fvr-divider-line" />
              </div>
              <p className="fvr-quote">Among blessings, laughter, and cherished traditions,<br />we look forward to celebrating this joyful day with you.</p>
              <div className="fvr-closer">
                <p className="fvr-nm">Prashanth</p>
                <div className="fvr-weds">
                  <span className="fvr-rl" /><span className="fvr-weds-txt">weds</span><span className="fvr-rl" />
                </div>
                <p className="fvr-nm">Lisha</p>
                <p className="fvr-date">✦ 12 July 2026 ✦</p>
              </div>
            </section>
          </div>

          <div className="controls">
            <button className="ctrl" onClick={() => go(-1)} aria-label="Previous">
              <svg width="15" height="15" viewBox="0 0 16 16"><path d="M10,3 L5,8 L10,13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {ended ? (
              <button className="ctrl" onClick={replay} aria-label="Replay">
                <svg width="15" height="15" viewBox="0 0 16 16"><path d="M3,8 a5,5 0 1 1 1.5,3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M3,5 L3,8 L6,8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            ) : (
              <button className={`ctrl ctrl-music ${musicPlaying ? "is-on" : ""}`} onClick={() => { togglePause(); void toggleMusic(); }} aria-label={paused ? "Play" : "Pause"}>
                {paused
                  ? <svg width="15" height="15" viewBox="0 0 16 16"><path d="M5,3 L12,8 L5,13 Z" fill="currentColor"/></svg>
                  : <svg width="15" height="15" viewBox="0 0 16 16"><rect x="4.5" y="3.5" width="2.5" height="9" fill="currentColor"/><rect x="9" y="3.5" width="2.5" height="9" fill="currentColor"/></svg>}
                <span className="ctrl-label">Music</span>
              </button>
            )}
            <button className="ctrl" onClick={() => go(1)} aria-label="Next">
              <svg width="15" height="15" viewBox="0 0 16 16"><path d="M6,3 L11,8 L6,13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
