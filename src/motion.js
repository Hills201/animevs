// Motion layer: GSAP (animation) + Lenis (smooth wheel scrolling).
//
// Design rules, so it stays fast and never gets in the way of the game:
//  - GSAP core is the only animation code in the first-load bundle. Lenis is fetched
//    after the page is idle (startSmoothScroll), and only on desktop.
//  - Nothing animates for people who ask for reduced motion.
//  - Smooth scrolling is for mouse/trackpad users only. Phones and tablets keep
//    their native scrolling, which is already smooth and costs no JavaScript.
//  - Lenis only runs its animation frame loop while the page is actually moving,
//    and goes back to sleep afterwards, so an idle tab costs nothing.
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export { gsap, useGSAP };

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const hasFinePointer = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;

// ── Lenis ────────────────────────────────────────────────────────────────────
let lenis = null;
let starting = null;
let rafId = 0;
let lastWake = 0;

function loop(time) {
  rafId = 0;
  if (!lenis) return;
  lenis.raf(time);
  // keep ticking while Lenis is moving, plus a short tail after the last input
  if (lenis.isScrolling || time - lastWake < 1200) rafId = requestAnimationFrame(loop);
}
function wake() {
  lastWake = performance.now();
  if (lenis && !rafId) rafId = requestAnimationFrame(loop);
}

/** Start smooth wheel scrolling (desktop only). Safe to call more than once. */
export function startSmoothScroll() {
  if (starting) return starting;
  if (prefersReducedMotion() || !hasFinePointer()) return null;
  starting = import("lenis")
    .then(({ default: Lenis }) => {
      lenis = new Lenis({
        autoRaf: false,            // we drive it ourselves so it can sleep
        lerp: 0.1,
        smoothWheel: true,
        allowNestedScroll: true,   // lists and modals with their own scrollbar keep working
      });
      for (const ev of ["wheel", "keydown", "pointerdown", "touchstart"]) {
        window.addEventListener(ev, wake, { passive: true });
      }
      wake();
      return lenis;
    })
    .catch(() => null); // if the chunk fails to load, native scrolling just carries on
  return starting;
}

/** Jump to the top (used when switching screens). */
export function scrollToTop() {
  if (lenis) { lenis.scrollTo(0, { immediate: true }); wake(); } else { try { window.scrollTo(0, 0); } catch (e) { /* ignore */ } }
}

/** Smooth scroll to the top of the page. */
export function smoothScrollToTop() {
  if (lenis) { lenis.scrollTo(0, { duration: 1.1 }); wake(); } else { try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) { window.scrollTo(0, 0); } }
}

/** Resolves to the Lenis instance once smooth scrolling is running (null where it never starts). */
export function whenScrollReady() {
  return starting || Promise.resolve(null);
}

// ── Scroll reveal (no ScrollTrigger needed) ─────────────────────────────────
// Elements already on screen are left alone (they get the entrance animation).
// Elements below the fold start hidden and ease in the first time they appear.
// Returns a cleanup function that restores everything.
export function revealOnScroll(elements, { y = 28, duration = 0.7 } = {}) {
  if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") return () => {};
  const vh = window.innerHeight;
  const pending = Array.from(elements).filter((el) => el.getBoundingClientRect().top > vh * 0.92);
  if (!pending.length) return () => {};
  const tweens = [];
  gsap.set(pending, { opacity: 0, y });
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        tweens.push(gsap.to(e.target, { opacity: 1, y: 0, duration, ease: "power3.out", clearProps: "opacity,transform" }));
      }
    },
    { rootMargin: "0px 0px -8% 0px" }
  );
  pending.forEach((el) => io.observe(el));
  return () => {
    io.disconnect();
    tweens.forEach((t) => t.kill());
    gsap.set(pending, { clearProps: "opacity,transform" });
  };
}

// ── Parallax (desktop only) ──────────────────────────────────────────────────
// Drifts one element as the page scrolls. Driven by Lenis' scroll events and
// gsap.quickSetter, so there is no per-frame work while the page is still.
export function parallax(element, { speed = -0.08, rotate = 0 } = {}) {
  let off = null;
  let dead = false;
  whenScrollReady().then((l) => {
    if (dead || !l || !element) return;
    const setY = gsap.quickSetter(element, "y", "px");
    const setR = gsap.quickSetter(element, "rotation", "deg");
    const onScroll = ({ scroll }) => { setY(scroll * speed); if (rotate) setR(scroll * rotate); };
    l.on("scroll", onScroll);
    off = () => l.off("scroll", onScroll);
  });
  return () => { dead = true; if (off) off(); };
}
