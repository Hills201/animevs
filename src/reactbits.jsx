/*
 * React Bits components used by animeVS.
 * Source: https://github.com/DavidHDev/react-bits  (c) David Haz
 * Licence: MIT + Commons Clause. These are used as part of this application and are
 * not resold or redistributed on their own.
 *
 *   SpotlightCard, ShinyText, Magnet  - used as published by React Bits
 *   CountUp                           - based on React Bits' CountUp, rewritten on GSAP
 *                                       so the site doesn't need a second animation library
 *   SplitText (see SplitText.jsx)     - used as published, loaded on demand
 */
import React, { useEffect, useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "./motion.js";
import "./reactbits.css";

const SpotlightCard = (() => {
const THEMES = {
  dark: {
    surface: '#111111',
    border: 'rgba(255, 255, 255, 0.08)',
    shadow: '0 24px 48px -24px rgba(0, 0, 0, 0.6)',
    light: '#ffffff',
    fill: 1,
    edge: 1
  },
  light: {
    surface: '#ffffff',
    border: 'rgba(24, 24, 27, 0.1)',
    shadow: '0 1px 2px rgba(24, 24, 27, 0.04), 0 18px 40px -20px rgba(24, 24, 27, 0.16)',
    light: '#18181b',
    fill: 0.28,
    edge: 0.7
  }
};

const SHAPES = ['circle', 'beam'];

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const falloff = (color, softness) => {
  const soft = clamp(softness, 0, 1);
  const core = (1 - soft) ** 1.5 * 0.85;
  const stop = (alpha, at) =>
    `color-mix(in srgb, ${color} ${(alpha * 100).toFixed(2)}%, transparent) ${(at * 100).toFixed(2)}%`;
  const list = [stop(1, 0)];
  for (let i = 0; i <= 14; i++) {
    const t = core + ((1 - core) * i) / 14;
    const g = (t - core) / (1 - core);
    const smooth = 1 - g * g * (3 - 2 * g);
    const glow = Math.exp(-4.6 * g * g) * (1 - g ** 6);
    list.push(stop(smooth + (glow - smooth) * soft, t));
  }
  return list.join(', ');
};

const SpotlightCard = ({
  children,
  className = '',
  style,
  spotlightColor,
  intensity = 0.15,
  spotlightSize = 240,
  softness = 0.7,
  shape = 'circle',
  borderGlow = 0.6,
  proximity = 80,
  smoothing = 0.3,
  ambient = false,
  flare = true,
  grain = 0,
  theme = 'dark',
  ...rest
}) => {
  const rootRef = useRef(null);
  const lightRef = useRef(null);
  const grainRef = useRef(null);
  const edgeRef = useRef(null);
  const wakeRef = useRef(null);
  const palette = THEMES[theme] ?? THEMES.dark;
  const color = spotlightColor ?? palette.light;
  const form = SHAPES.includes(shape) ? shape : 'circle';
  const settings = {
    shape: form,
    fill: falloff(color, softness),
    edge: falloff(color, 1),
    size: Math.max(20, spotlightSize),
    intensity: clamp(intensity, 0, 1) * palette.fill,
    borderGlow: clamp(borderGlow, 0, 1) * palette.edge,
    proximity: Math.max(0, proximity),
    smoothing: clamp(smoothing, 0, 1),
    ambient,
    flare,
    grain: clamp(grain, 0, 1)
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    wakeRef.current?.();
  });

  useEffect(() => {
    const root = rootRef.current;
    const light = lightRef.current;
    const noise = grainRef.current;
    const edge = edgeRef.current;
    if (!root || !light || !noise || !edge) return undefined;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const state = { x: 0, y: 0, presence: 0, flare: 0, time: Math.random() * 60, pressed: false, visible: true };
    const pointer = { x: 0, y: 0, active: false };
    const drawn = { light: '', edge: '', noise: '' };
    let focus = null;
    let raf = 0;
    let last = 0;
    let alive = true;

    const gradient = (s, size, x, y, stops) => {
      if (s.shape === 'beam') {
        const reach = Math.max(size * 0.6, y + size * 0.55);
        return `radial-gradient(${(size * 0.55).toFixed(1)}px ${reach.toFixed(1)}px at ${x.toFixed(1)}px 0px, ${stops})`;
      }
      return `radial-gradient(circle ${size.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px, ${stops})`;
    };

    const paint = s => {
      const size = s.size * (1 + 0.2 * state.flare);
      const boost = 1 + 0.7 * state.flare;
      const fill = gradient(s, size, state.x, state.y, s.fill);
      const rim = gradient(s, size * 0.6, state.x, s.shape === 'beam' ? 0 : state.y, s.edge);
      if (fill !== drawn.light) {
        drawn.light = fill;
        light.style.background = fill;
      }
      if (rim !== drawn.edge) {
        drawn.edge = rim;
        edge.style.background = rim;
      }
      light.style.opacity = String(Math.min(1, state.presence * s.intensity * boost));
      edge.style.opacity = String(Math.min(1, state.presence * s.borderGlow * boost));
      const grainy = s.grain > 0 ? gradient(s, size, state.x, state.y, '#000 0%, transparent 100%') : 'none';
      if (grainy !== drawn.noise) {
        drawn.noise = grainy;
        noise.style.webkitMaskImage = grainy;
        noise.style.maskImage = grainy;
      }
      noise.style.opacity = String(state.presence * s.grain);
    };

    const tick = now => {
      raf = 0;
      if (!alive) return;
      const s = settingsRef.current;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      const rect = root.getBoundingClientRect();
      let tx = state.x;
      let ty = state.y;
      let target = 0;
      if (focus && root.contains(focus)) {
        const box = focus.getBoundingClientRect();
        tx = box.left + box.width / 2 - rect.left;
        ty = box.top + box.height / 2 - rect.top;
        target = 1;
      } else if (pointer.active) {
        tx = pointer.x - rect.left;
        ty = pointer.y - rect.top;
        const gap = Math.hypot(Math.max(0, -tx, tx - rect.width), Math.max(0, -ty, ty - rect.height));
        if (gap === 0) target = 1;
        else if (s.proximity > 0) target = Math.max(0, 1 - gap / s.proximity) ** 2;
      }
      if (target < 0.6 && s.ambient && state.visible) {
        if (!reduce) state.time += dt;
        const drift = 0.6 - target;
        tx += (rect.width * (0.5 + 0.34 * Math.sin(state.time * 0.43)) - tx) * (drift / 0.6);
        ty += (rect.height * (0.5 + 0.3 * Math.sin(state.time * 0.61 + 1.3)) - ty) * (drift / 0.6);
        target = 0.6;
      }
      if (state.presence < 0.02 && target > 0 && !s.ambient) {
        state.x = tx;
        state.y = ty;
      }
      const follow = reduce || s.smoothing === 0 ? 1 : 1 - Math.exp(-dt / (0.015 + s.smoothing * 0.22));
      state.x += (tx - state.x) * follow;
      state.y += (ty - state.y) * follow;
      const fade = reduce ? 1 : 1 - Math.exp(-dt / (target > state.presence ? 0.1 : 0.32));
      state.presence += (target - state.presence) * fade;
      if (Math.abs(target - state.presence) < 0.002) state.presence = target;
      const press = state.pressed && s.flare && !reduce ? 1 : 0;
      state.flare += (press - state.flare) * (1 - Math.exp(-dt / (press ? 0.05 : 0.28)));
      if (Math.abs(press - state.flare) < 0.002) state.flare = press;
      paint(s);
      const moving = Math.abs(tx - state.x) > 0.1 || Math.abs(ty - state.y) > 0.1;
      const settled = !moving && state.presence === target && state.flare === press;
      if (!settled || (s.ambient && state.visible && !reduce)) raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (raf || !alive) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    wakeRef.current = wake;

    const onMove = event => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      if (state.presence > 0 || settingsRef.current.proximity > 0 || root.contains(event.target)) wake();
    };
    const onOut = event => {
      if (event.relatedTarget) return;
      pointer.active = false;
      wake();
    };
    const onDown = event => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      state.pressed = true;
      wake();
    };
    const onUp = event => {
      if (event.pointerType !== 'mouse') pointer.active = false;
      if (!state.pressed && event.pointerType === 'mouse') return;
      state.pressed = false;
      wake();
    };
    const onFocusIn = event => {
      if (!(event.target instanceof Element) || !event.target.matches(':focus-visible')) return;
      focus = event.target;
      wake();
    };
    const onFocusOut = event => {
      if (root.contains(event.relatedTarget)) return;
      focus = null;
      wake();
    };
    const onScroll = () => {
      if (pointer.active || state.presence > 0) wake();
    };

    const observer = new IntersectionObserver(entries => {
      state.visible = entries.some(entry => entry.isIntersecting);
      if (state.visible) wake();
    });
    observer.observe(root);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    document.addEventListener('pointerout', onOut);
    root.addEventListener('pointerdown', onDown);
    root.addEventListener('focusin', onFocusIn);
    root.addEventListener('focusout', onFocusOut);
    wake();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      window.removeEventListener('scroll', onScroll, { capture: true });
      document.removeEventListener('pointerout', onOut);
      root.removeEventListener('pointerdown', onDown);
      root.removeEventListener('focusin', onFocusIn);
      root.removeEventListener('focusout', onFocusOut);
      wakeRef.current = null;
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`spotlight-card${className ? ` ${className}` : ''}`}
      style={{
        '--spotlight-card-surface': palette.surface,
        '--spotlight-card-border': palette.border,
        '--spotlight-card-shadow': palette.shadow,
        ...style
      }}
      {...rest}
    >
      <span ref={lightRef} className="spotlight-card__light" aria-hidden="true" />
      <span ref={grainRef} className="spotlight-card__grain" style={{ backgroundImage: NOISE }} aria-hidden="true" />
      {children}
      <span className="spotlight-card__border" aria-hidden="true" />
      <span ref={edgeRef} className="spotlight-card__edge" aria-hidden="true" />
    </div>
  );
};
  return SpotlightCard;
})();

const ShinyText = (() => {
const EASINGS = {
  linear: t => t,
  smooth: t => 0.5 - Math.cos(Math.PI * t) / 2,
  snappy: t => (t < 0.5 ? 16 * Math.pow(t, 5) : 1 - Math.pow(-2 * t + 2, 5) / 2)
};
const TRIGGERS = ['loop', 'hover', 'view'];
const FALLOFF = [0, 0.2, 0.4, 0.6, 0.8, 1];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

let paint = null;

const parseColor = value => {
  if (typeof document === 'undefined') return null;
  if (!paint) paint = document.createElement('canvas').getContext('2d');
  if (!paint) return null;
  paint.fillStyle = '#000000';
  paint.fillStyle = value;
  const resolved = String(paint.fillStyle);
  if (resolved.startsWith('#')) {
    return [1, 3, 5].map(i => parseInt(resolved.slice(i, i + 2), 16)).concat(1);
  }
  const parts = resolved.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return null;
  return [Number(parts[0]), Number(parts[1]), Number(parts[2]), parts.length > 3 ? Number(parts[3]) : 1];
};

const blend = (from, to, amount) => {
  const channel = (a, b) =>
    Math.round(Math.pow(Math.pow(a / 255, 2.2) * (1 - amount) + Math.pow(b / 255, 2.2) * amount, 1 / 2.2) * 255);
  const alpha = from[3] * (1 - amount) + to[3] * amount;
  if (alpha <= 0) return 'rgba(0, 0, 0, 0)';
  const weigh = (a, b) => (a * from[3] * (1 - amount) + b * to[3] * amount) / alpha;
  const r = from[3] === to[3] ? channel(from[0], to[0]) : Math.round(weigh(from[0], to[0]));
  const g = from[3] === to[3] ? channel(from[1], to[1]) : Math.round(weigh(from[1], to[1]));
  const b = from[3] === to[3] ? channel(from[2], to[2]) : Math.round(weigh(from[2], to[2]));
  return `rgba(${r}, ${g}, ${b}, ${Math.round(alpha * 1000) / 1000})`;
};

const ShinyText = ({
  text,
  children,
  color = '#b5b5b5',
  shineColor = '#ffffff',
  speed = 2,
  delay = 0,
  angle = 120,
  shineWidth = 40,
  softness = 0.8,
  bands = 1,
  glow = 0,
  direction = 'left',
  easing = 'smooth',
  trigger = 'loop',
  yoyo = false,
  followPointer = false,
  pauseOnHover = false,
  disabled = false,
  className = '',
  style
}) => {
  const rootRef = useRef(null);
  const glowRef = useRef(null);
  const settingsRef = useRef(null);
  const syncRef = useRef(null);
  const content = children ?? text;

  settingsRef.current = {
    color,
    shineColor,
    speed: Math.max(0.1, speed),
    delay: Math.max(0, delay),
    angle,
    shineWidth: clamp(shineWidth, 2, 200),
    softness: clamp(softness, 0, 1),
    bands: clamp(Math.round(bands), 1, 3),
    glow: clamp(glow, 0, 1),
    sign: direction === 'right' ? 1 : -1,
    ease: EASINGS[easing] ?? EASINGS.smooth,
    trigger: TRIGGERS.includes(trigger) ? trigger : 'loop',
    yoyo,
    followPointer,
    pauseOnHover,
    disabled
  };

  useEffect(() => {
    syncRef.current?.();
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const state = {
      pos: null,
      vel: 0,
      phase: 'idle',
      from: 0,
      to: 0,
      start: 0,
      duration: 1,
      resume: 0,
      flip: false,
      inside: false,
      target: 0,
      visible: true,
      seen: false,
      colors: ''
    };
    let base = null;
    let shine = null;
    let clear = null;
    let raf = 0;
    let timer = 0;
    let last = 0;
    let alive = true;

    const extent = () => {
      const s = settingsRef.current;
      return s.shineWidth / 2 + (s.bands - 1) * s.shineWidth * 1.3 + 2;
    };
    const entry = () => (settingsRef.current.sign > 0 ? -extent() : 100 + extent());
    const exit = () => (settingsRef.current.sign > 0 ? 100 + extent() : -extent());
    const nearest = () => (state.target < 50 ? -extent() : 100 + extent());

    const gradient = (pos, fill) => {
      const s = settingsRef.current;
      const half = s.shineWidth / 2;
      const core = half * (1 - s.softness);
      const fade = half - core;
      const stops = [];
      for (let band = 0; band < s.bands; band++) {
        const center = pos - s.sign * band * s.shineWidth * 1.3;
        const strength = 1 - band * 0.28;
        for (const side of [-1, 1]) {
          for (const f of FALLOFF) {
            const at = center + side * (core + fade * (1 - f));
            const amount = f * f * (3 - 2 * f) * strength;
            stops.push([at, amount]);
          }
        }
      }
      stops.sort((a, b) => a[0] - b[0]);
      const list = stops.map(([at, amount]) => `${blend(fill, shine, amount)} ${at.toFixed(2)}%`);
      return `linear-gradient(${s.angle}deg, ${blend(fill, shine, 0)} 0%, ${list.join(', ')}, ${blend(fill, shine, 0)} 100%)`;
    };

    const draw = () => {
      const s = settingsRef.current;
      const key = `${s.color}|${s.shineColor}`;
      if (key !== state.colors) {
        state.colors = key;
        base = parseColor(s.color);
        shine = parseColor(s.shineColor);
        clear = shine ? [shine[0], shine[1], shine[2], 0] : null;
      }
      if (!base || !shine) {
        root.style.backgroundImage = `linear-gradient(${s.color}, ${s.color})`;
        return;
      }
      if (state.pos === null || s.disabled) {
        root.style.backgroundImage = `linear-gradient(${s.color}, ${s.color})`;
        if (glowRef.current) glowRef.current.style.backgroundImage = 'none';
        return;
      }
      root.style.backgroundImage = gradient(state.pos, base);
      if (glowRef.current) {
        glowRef.current.style.backgroundImage = gradient(state.pos, clear);
        glowRef.current.style.opacity = String(s.glow);
      }
    };

    const sweep = (from, to, now) => {
      const s = settingsRef.current;
      const span = Math.abs(exit() - entry()) || 1;
      state.phase = 'sweep';
      state.from = from;
      state.to = to;
      state.start = now;
      state.duration = s.speed * 1000 * Math.max(0.15, Math.abs(to - from) / span);
    };

    const wake = () => {
      if (raf || !alive) return;
      window.clearTimeout(timer);
      timer = 0;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const tick = now => {
      raf = 0;
      if (!alive) return;
      const s = settingsRef.current;
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      if (s.disabled) {
        state.pos = null;
        state.phase = 'idle';
        draw();
        return;
      }
      const following = s.followPointer && state.inside;
      if (following) {
        if (state.pos === null) state.pos = nearest();
        const stiffness = 220;
        state.vel += ((state.target - state.pos) * stiffness - state.vel * 2 * Math.sqrt(stiffness)) * dt;
        state.pos += state.vel * dt;
        state.phase = 'follow';
        draw();
        raf = requestAnimationFrame(tick);
        return;
      }
      if (state.phase === 'follow') {
        state.vel = 0;
        sweep(state.pos ?? nearest(), nearest(), now);
      }
      if (state.phase === 'sweep') {
        if (s.pauseOnHover && state.inside) {
          state.start += dt * 1000;
          raf = requestAnimationFrame(tick);
          return;
        }
        const t = clamp((now - state.start) / state.duration, 0, 1);
        state.pos = state.from + (state.to - state.from) * s.ease(t);
        draw();
        if (t < 1) {
          raf = requestAnimationFrame(tick);
          return;
        }
        if (s.trigger !== 'loop' || reduce) {
          state.phase = 'idle';
          state.pos = null;
          draw();
          return;
        }
        state.phase = 'wait';
        state.resume = now + s.delay * 1000;
      }
      if (state.phase === 'wait') {
        if (!state.visible) return;
        if (now < state.resume) {
          window.clearTimeout(timer);
          timer = window.setTimeout(wake, state.resume - now);
          return;
        }
        if (s.yoyo) {
          state.flip = !state.flip;
          sweep(state.flip ? exit() : entry(), state.flip ? entry() : exit(), now);
        } else {
          sweep(entry(), exit(), now);
        }
        raf = requestAnimationFrame(tick);
        return;
      }
      if (state.phase === 'idle' && s.trigger === 'loop' && !reduce && state.visible) {
        state.flip = false;
        sweep(entry(), exit(), now);
        raf = requestAnimationFrame(tick);
      }
    };

    const locate = event => {
      const s = settingsRef.current;
      const rect = root.getBoundingClientRect();
      const radians = (s.angle * Math.PI) / 180;
      const dx = Math.sin(radians);
      const dy = -Math.cos(radians);
      const length = Math.abs(rect.width * dx) + Math.abs(rect.height * dy) || 1;
      const along =
        (event.clientX - rect.left - rect.width / 2) * dx + (event.clientY - rect.top - rect.height / 2) * dy;
      return 50 + (along / length) * 100;
    };

    const onEnter = event => {
      const s = settingsRef.current;
      state.inside = true;
      state.target = locate(event);
      if (s.disabled) return;
      if (s.followPointer) {
        if (state.pos === null) state.pos = nearest();
      } else if (s.trigger === 'hover' && state.phase === 'idle' && !reduce) {
        sweep(entry(), exit(), performance.now());
      }
      wake();
    };
    const onMove = event => {
      state.target = locate(event);
      if (settingsRef.current.followPointer) wake();
    };
    const onLeave = () => {
      state.inside = false;
      wake();
    };

    const observer = new IntersectionObserver(entries => {
      const visible = entries.some(item => item.isIntersecting);
      state.visible = visible;
      const s = settingsRef.current;
      if (!visible) return;
      if (s.trigger === 'view' && !state.seen && !reduce && !s.disabled) {
        state.seen = true;
        sweep(entry(), exit(), performance.now());
      }
      wake();
    });
    observer.observe(root);

    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);

    syncRef.current = () => {
      const s = settingsRef.current;
      if (s.disabled) {
        state.pos = null;
        state.phase = 'idle';
      } else if (s.trigger !== 'loop' && state.phase === 'wait') {
        state.phase = 'idle';
        state.pos = null;
      }
      draw();
      wake();
    };
    draw();
    wake();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      observer.disconnect();
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      syncRef.current = null;
    };
  }, []);

  return (
    <span
      ref={rootRef}
      className={`shiny-text${className ? ` ${className}` : ''}`}
      style={{ backgroundImage: `linear-gradient(${color}, ${color})`, ...style }}
    >
      {content}
      {glow > 0 ? (
        <span ref={glowRef} className="shiny-text__glow" aria-hidden="true">
          {content}
        </span>
      ) : null}
    </span>
  );
};
  return ShinyText;
})();

const Magnet = (() => {
const DEFAULT_SPRING = { stiffness: 170, damping: 16, mass: 1 };

const smoothstep = (edge0, edge1, value) => {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

const registry = new Set();
const field = { pointer: null, owner: null };
let detach = null;

const reach = (rect, pointer) => {
  const dx = pointer.x - (rect.left + rect.width / 2);
  const dy = pointer.y - (rect.top + rect.height / 2);
  const outside = Math.hypot(Math.max(0, Math.abs(dx) - rect.width / 2), Math.max(0, Math.abs(dy) - rect.height / 2));
  return { dx, dy, outside };
};

const arbitrate = () => {
  let winner = null;
  let nearest = Infinity;
  let closest = Infinity;
  for (const entry of registry) {
    const s = entry.settings.current;
    let near = null;
    if (field.pointer && !s.disabled && !entry.reduce) {
      near = reach(entry.wrapper.getBoundingClientRect(), field.pointer);
      if (near.outside > s.padding) near = null;
    }
    if (!s.exclusive) {
      if (near || entry.active) entry.wake();
      continue;
    }
    if (!near) continue;
    const center = Math.hypot(near.dx, near.dy);
    if (near.outside < nearest || (near.outside === nearest && center < closest)) {
      winner = entry;
      nearest = near.outside;
      closest = center;
    }
  }
  const previous = field.owner;
  field.owner = winner;
  if (previous && previous !== winner) previous.wake();
  if (winner) winner.wake();
};

const attach = () => {
  const onPointerMove = event => {
    if (event.pointerType === 'touch') return;
    field.pointer = { x: event.clientX, y: event.clientY };
    arbitrate();
  };
  const onLeave = () => {
    field.pointer = null;
    arbitrate();
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('scroll', arbitrate, { passive: true, capture: true });
  document.documentElement.addEventListener('pointerleave', onLeave);
  window.addEventListener('blur', onLeave);
  return () => {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('scroll', arbitrate, { capture: true });
    document.documentElement.removeEventListener('pointerleave', onLeave);
    window.removeEventListener('blur', onLeave);
  };
};

const Magnet = ({
  children,
  padding = 100,
  disabled = false,
  magnetStrength = 2,
  maxOffset,
  exclusive = true,
  axis = 'both',
  tilt = 0,
  scale = 1,
  spring,
  onActiveChange,
  wrapperClassName = '',
  innerClassName = '',
  style,
  ...props
}) => {
  const wrapperRef = useRef(null);
  const innerRef = useRef(null);
  const wakeRef = useRef(null);
  const settings = {
    padding: Math.max(0, padding),
    disabled,
    strength: Math.max(0.1, magnetStrength),
    maxOffset,
    exclusive,
    axis,
    tilt,
    scale,
    stiffness: Math.max(1, spring?.stiffness ?? DEFAULT_SPRING.stiffness),
    damping: Math.max(0, spring?.damping ?? DEFAULT_SPRING.damping),
    mass: Math.max(0.01, spring?.mass ?? DEFAULT_SPRING.mass),
    onActiveChange
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const inner = innerRef.current;
    if (!wrapper || !inner) return undefined;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const current = { x: 0, y: 0, tiltX: 0, tiltY: 0, scale: 1 };
    const velocity = { x: 0, y: 0, tiltX: 0, tiltY: 0, scale: 0 };
    let active = false;
    let raf = 0;
    let last = 0;

    const solve = (target, dt) => {
      const s = settingsRef.current;
      let resting = true;
      Object.keys(current).forEach(key => {
        const force = s.stiffness * (target[key] - current[key]) - s.damping * velocity[key];
        velocity[key] += (force / s.mass) * dt;
        current[key] += velocity[key] * dt;
        const epsilon = key === 'scale' ? 0.001 : 0.05;
        if (Math.abs(target[key] - current[key]) > epsilon || Math.abs(velocity[key]) > epsilon) resting = false;
      });
      return resting;
    };

    const measure = () => {
      const s = settingsRef.current;
      const target = { x: 0, y: 0, tiltX: 0, tiltY: 0, scale: 1 };
      if (s.disabled || reduce || !field.pointer) return { target, engaged: false };
      if (s.exclusive && field.owner !== entry) return { target, engaged: false };
      const rect = wrapper.getBoundingClientRect();
      const { dx, dy, outside } = reach(rect, field.pointer);
      if (outside > s.padding) return { target, engaged: false };
      const pull = s.padding > 0 ? 1 - smoothstep(s.padding * 0.5, s.padding, outside) : 1;
      let x = s.axis === 'y' ? 0 : (dx / s.strength) * pull;
      let y = s.axis === 'x' ? 0 : (dy / s.strength) * pull;
      if (s.maxOffset !== undefined && s.maxOffset !== null) {
        const length = Math.hypot(x, y);
        if (length > s.maxOffset) {
          x *= s.maxOffset / length;
          y *= s.maxOffset / length;
        }
      }
      const nx = Math.max(-1, Math.min(1, dx / Math.max(rect.width / 2, 1)));
      const ny = Math.max(-1, Math.min(1, dy / Math.max(rect.height / 2, 1)));
      target.x = x;
      target.y = y;
      target.tiltX = -ny * s.tilt * pull;
      target.tiltY = nx * s.tilt * pull;
      target.scale = 1 + (s.scale - 1) * pull;
      return { target, engaged: true };
    };

    const apply = () => {
      const { x, y, tiltX, tiltY, scale } = current;
      const turned = Math.abs(tiltX) > 0.01 || Math.abs(tiltY) > 0.01;
      inner.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)${
        turned ? ` perspective(800px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)` : ''
      }${Math.abs(scale - 1) > 0.0005 ? ` scale(${scale.toFixed(4)})` : ''}`;
    };

    const frame = now => {
      raf = 0;
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
      last = now;
      const { target, engaged } = measure();
      if (engaged !== active) {
        active = engaged;
        entry.active = engaged;
        if (engaged) wrapper.setAttribute('data-magnet-active', '');
        else wrapper.removeAttribute('data-magnet-active');
        settingsRef.current.onActiveChange?.(engaged);
      }
      const steps = Math.ceil(dt / (1 / 120));
      let resting = true;
      for (let i = 0; i < steps; i++) resting = solve(target, dt / steps);
      if (resting) {
        Object.keys(current).forEach(key => {
          current[key] = target[key];
          velocity[key] = 0;
        });
      }
      apply();
      if (!resting) raf = requestAnimationFrame(frame);
      else last = 0;
    };

    function wake() {
      if (!raf) raf = requestAnimationFrame(frame);
    }

    const entry = { wrapper, settings: settingsRef, reduce, wake, active: false };
    registry.add(entry);
    if (!detach) detach = attach();
    wakeRef.current = () => {
      arbitrate();
      wake();
    };

    return () => {
      cancelAnimationFrame(raf);
      wakeRef.current = null;
      registry.delete(entry);
      if (field.owner === entry) field.owner = null;
      if (!registry.size && detach) {
        detach();
        detach = null;
      }
    };
  }, []);

  useEffect(() => {
    wakeRef.current?.();
  });

  return (
    <div
      ref={wrapperRef}
      className={wrapperClassName}
      style={{ position: 'relative', display: 'inline-block', ...style }}
      {...props}
    >
      <div ref={innerRef} className={innerClassName} style={{ willChange: 'transform' }}>
        {children}
      </div>
    </div>
  );
};
  return Magnet;
})();

// ── CountUp (GSAP) ───────────────────────────────────────────────────────────
// Counts from `from` to `to` the first time it scrolls into view. The final value is
// always in the markup, so it reads correctly with no JS, to screen readers, and with
// reduced motion.
export function CountUp({ to, from = 0, duration = 1.2, delay = 0, decimals = 0, prefix = "", suffix = "", className, style }) {
  const ref = useRef(null);
  const fmt = (n) => prefix + (decimals > 0 ? n.toFixed(decimals) : String(Math.round(n))) + suffix;
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || from === to) return undefined;
    const state = { v: from };
    let tween = null;
    el.textContent = fmt(from);
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      tween = gsap.to(state, { v: to, duration, delay, ease: "power2.out", onUpdate: () => { el.textContent = fmt(state.v); }, onComplete: () => { el.textContent = fmt(to); } });
    });
    io.observe(el);
    return () => { io.disconnect(); if (tween) tween.kill(); el.textContent = fmt(to); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, from, duration, delay, decimals, prefix, suffix]);
  return <span ref={ref} className={className} style={style} aria-label={fmt(to)}>{fmt(to)}</span>;
}

export { SpotlightCard, ShinyText, Magnet };
