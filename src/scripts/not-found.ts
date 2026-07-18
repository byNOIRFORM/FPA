import type * as M from "matter-js";

/**
 * 404 — "Architektonický Tetris" (see NotFound.astro for the layout).
 *
 * Matter.js runs HEADLESS — it only computes physics; all drawing is
 * ours, straight to a 2D canvas in CAD/blueprint style (hairline
 * strokes, dotted centroid crosshairs, tiny dimension figures). The
 * default Matter renderer can't produce that look.
 *
 *   - 12–14 building pieces (7–8 on phones) drop from above the viewport
 *     on load and settle by gravity. Five LARGE kinds only — foundation
 *     slab, column, I-beam, roof truss, wall panel — one of each
 *     guaranteed, sizes jittered per piece, so a little house is always
 *     buildable just for fun. The small fillers (masonry block, lintel
 *     plank, window frame) were cut as clutter (Michal, 2026-07-18).
 *   - Interaction = the official Matter demos (mixed/concave), NOTHING
 *     more: pieces rest until clicked, MouseConstraint drags them. The
 *     earlier cursor-pusher disc was removed (Michal, 2026-07-18) — it
 *     shoved pieces away from an approaching pointer, which made them
 *     impossible to aim and grab. Push and grab cannot coexist.
 *   - Floor and side walls are static bodies just off-screen. Pure play —
 *     nothing is scored or certified (Michal, 2026-07-18; the earlier
 *     "Statika: Skolaudované" easter egg was removed with the Figma pass).
 *   - Outlines are 1px solid --line (#A3A3A3), the site's hairline
 *     (Michal, 2026-07-18) — crosshair + dimension figures stay --ink-mute.
 *
 * Matter.js is imported DYNAMICALLY after the .nf guard: BaseLayout
 * bundles one script for the whole site, and ~80 kB of physics must not
 * ride along on every regular page. Vite splits it into its own chunk
 * fetched only on the 404.
 *
 * Colors are read from the design tokens at runtime and re-read when
 * the theme toggle flips [data-theme], so the drawing follows dark mode.
 */

type PieceKind = "foundation" | "column" | "beam" | "truss" | "panel";

interface PieceMeta {
  kind: PieceKind;
  w: number;
  h: number;
  /** Local-space Y of the piece's bottom edge (truss centroid ≠ h/2). */
  bottom: number;
}

export function initNotFound(): void {
  if (typeof window === "undefined") return;
  const section = document.querySelector<HTMLElement>(".nf");
  if (!section) return;
  void boot(section);
}

async function boot(section: HTMLElement): Promise<void> {
  // CJS module — vite interop puts the namespace on .default.
  const mod = (await import("matter-js")) as unknown as {
    default?: typeof import("matter-js");
  } & typeof import("matter-js");
  const Matter = mod.default ?? mod;
  const { Bodies, Body, Composite, Engine, Mouse, MouseConstraint } = Matter;

  const canvas = section.querySelector<HTMLCanvasElement>(".nf-canvas");
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx) return;

  /* ===== Design tokens → draw colors (kept in sync with the theme) ===== */
  let line = "#A3A3A3";
  let ink = "#222222";
  let inkMute = "#707070";
  let fill = "rgba(34,34,34,0.03)";
  const readTokens = (): void => {
    const s = getComputedStyle(document.documentElement);
    line = s.getPropertyValue("--line").trim() || line;
    ink = s.getPropertyValue("--ink").trim() || ink;
    inkMute = s.getPropertyValue("--ink-mute").trim() || inkMute;
    const m = ink.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    fill = m
      ? `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},0.03)`
      : "transparent";
  };
  readTokens();
  const themeWatch = new MutationObserver(readTokens);
  themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  /* ===== Canvas sizing (retina-aware; world units = CSS px) ===== */
  let vw = 0;
  let vh = 0;
  let dpr = 1;
  const size = (): void => {
    vw = section.clientWidth;
    vh = section.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();

  /* ===== Engine + static boundaries ===== */
  // No sleeping — same as the official Matter demos; ~11 bodies awake
  // cost nothing.
  const engine = Engine.create();
  const WALL = 120;
  let walls: M.Body[] = [];
  const buildWalls = (): void => {
    Composite.remove(engine.world, walls);
    walls = [
      // Floor at the viewport's bottom edge; side walls reach high above
      // it so thrown pieces bounce back instead of leaving the parcel.
      Bodies.rectangle(vw / 2, vh + WALL / 2, vw + WALL * 4, WALL, { isStatic: true }),
      Bodies.rectangle(-WALL / 2, vh / 2 - vh, WALL, vh * 4, { isStatic: true }),
      Bodies.rectangle(vw + WALL / 2, vh / 2 - vh, WALL, vh * 4, { isStatic: true }),
    ];
    Composite.add(engine.world, walls);
  };
  buildWalls();

  /* ===== Building pieces ===== */
  const meta = new Map<number, PieceMeta>();
  const pieces: M.Body[] = [];
  // Common surface: high friction so a careful stack actually holds,
  // no bounce — concrete on concrete, not rubber.
  const MAT = { friction: 0.9, frictionStatic: 1.1, restitution: 0.04 };

  const registerPiece = (b: M.Body, kind: PieceKind, w: number, h: number, bottom: number): M.Body => {
    meta.set(b.id, { kind, w, h, bottom });
    pieces.push(b);
    return b;
  };

  const makePiece = (kind: PieceKind, x: number, y: number, s: number): M.Body => {
    switch (kind) {
      case "foundation": {
        // Wide, heavy slab — 4× the default density anchors the stack.
        const w = 236 * s;
        const h = 46 * s;
        const b = Bodies.rectangle(x, y, w, h, { ...MAT, density: 0.004 });
        return registerPiece(b, kind, w, h, h / 2);
      }
      case "column": {
        const w = 34 * s;
        const h = 186 * s;
        const b = Bodies.rectangle(x, y, w, h, { ...MAT, density: 0.0012 });
        return registerPiece(b, kind, w, h, h / 2);
      }
      case "beam": {
        // I-profile: two flanges + web as one compound body — the parts
        // draw themselves as the technical raster inside the outline.
        const w = 198 * s;
        const h = 62 * s;
        const t = 12 * s;
        const top = Bodies.rectangle(x, y - (h - t) / 2, w, t, MAT);
        const web = Bodies.rectangle(x, y, 14 * s, h - 2 * t, MAT);
        const bot = Bodies.rectangle(x, y + (h - t) / 2, w, t, MAT);
        const b = Body.create({ parts: [top, web, bot], ...MAT, density: 0.002 });
        return registerPiece(b, kind, w, h, h / 2);
      }
      case "truss": {
        // Hollow-looking roof triangle (outline only — nothing is filled
        // heavily anyway). Matter centres the body on its centroid, so
        // the local bottom edge sits at +h/3, not +h/2.
        const w = 208 * s;
        const h = 112 * s;
        const b = Bodies.fromVertices(
          x,
          y,
          [[{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w / 2, y: -h }]],
          { ...MAT, density: 0.0015 },
        );
        return registerPiece(b, kind, w, h, h / 3);
      }
      case "panel": {
        // Wall panel — broad, stands well on a foundation.
        const w = 122 * s;
        const h = 158 * s;
        const b = Bodies.rectangle(x, y, w, h, { ...MAT, density: 0.0015 });
        return registerPiece(b, kind, w, h, h / 2);
      }
    }
  };

  const spawn = (): void => {
    // Scale pieces down with the viewport so a phone parcel stays
    // playable. (A ×0.85 shrink was tried and reverted — with the full
    // builder's palette on screen the pieces read too small; Michal,
    // 2026-07-18.)
    const s = Math.max(0.5, Math.min(1, vw / 1440));
    // Five LARGE kinds only — the small fillers (masonry block, lintel
    // plank, window frame) were cut (Michal, 2026-07-18): tiny pieces
    // read as clutter at full size.
    const kinds: PieceKind[] = ["foundation", "column", "beam", "truss", "panel"];
    // Full-size pieces need breathing room — fewer than the small-piece
    // era; a phone parcel takes fewer still.
    const count =
      vw < 768 ? 7 + Math.floor(Math.random() * 2) : 12 + Math.floor(Math.random() * 3);
    // First five = one of each type (guaranteed variety: a house is
    // always buildable), rest random.
    const order = [...kinds].sort(() => Math.random() - 0.5);
    while (order.length < count) {
      order.push(kinds[Math.floor(Math.random() * kinds.length)]);
    }
    order.slice(0, count).forEach((kind, i) => {
      const x = vw * (0.1 + Math.random() * 0.8);
      // Staggered heights above the viewport → natural one-by-one landing.
      // VERY tight stagger — the whole rain lands in ~a second.
      const y = -40 - i * 55 - Math.random() * 30;
      // Per-piece size jitter (±15 %) — two columns are never twins.
      const b = makePiece(kind, x, y, s * (0.85 + Math.random() * 0.3));
      Body.setAngle(b, (Math.random() - 0.5) * 0.5);
      // Enter ALREADY FALLING, fast — matches the snap of the original
      // 2×-speed look (Michal, 2026-07-18: two slower passes rejected)
      // without touching simulation speed: interactions stay
      // demo-accurate real-time. ~16–24 px/step ≈ 1000–1400 px/s at
      // entry, before gravity adds more.
      Body.setVelocity(b, { x: 0, y: 16 + Math.random() * 8 });
      Composite.add(engine.world, b);
    });
  };
  spawn();

  /* ===== Mouse / touch dragging ===== */
  const mouse = Mouse.create(canvas);
  // CRITICAL on retina: our world runs in CSS px, but Matter divides the
  // event position by clientWidth/bitmapWidth × pixelRatio. With the
  // default pixelRatio 1 that lands 2× off on a 2× display — the grab
  // point never hits a body and dragging feels dead. Matching pixelRatio
  // to the canvas DPR makes world = CSS px again.
  mouse.pixelRatio = dpr;
  // Grab feel = the official "mixed" demo exactly: stiffness 0.2, no
  // damping (damping was our addition — demos don't use it).
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.2 },
  });
  Composite.add(engine.world, mouseConstraint);
  // Matter hijacks the wheel to zoom its (unused) view — give it back
  // to the page.
  const m = mouse as unknown as { element: HTMLElement; mousewheel: EventListener };
  m.element.removeEventListener("mousewheel", m.mousewheel);
  m.element.removeEventListener("DOMMouseScroll", m.mousewheel);
  m.element.removeEventListener("wheel", m.mousewheel);

  /* ===== CAD drawing ===== */
  const MONO = '9px "JetBrains Mono", ui-monospace, monospace';

  const tracePart = (part: M.Body): void => {
    const v = part.vertices;
    ctx.beginPath();
    ctx.moveTo(v[0].x, v[0].y);
    for (let i = 1; i < v.length; i++) ctx.lineTo(v[i].x, v[i].y);
    ctx.closePath();
  };

  const drawPiece = (b: M.Body): void => {
    const info = meta.get(b.id);
    if (!info) return;

    // Outline (+ inner raster on compounds — parts[0] is the parent) —
    // 1px solid --line, the same hairline as everywhere on the site.
    const parts = b.parts.length > 1 ? b.parts.slice(1) : b.parts;
    ctx.strokeStyle = line;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    for (const part of parts) {
      tracePart(part);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.stroke();
    }

    // Local-space overlay — centroid crosshair + dimension figures
    // rotate with the piece like annotations on a lifted drawing.
    ctx.save();
    ctx.translate(b.position.x, b.position.y);
    ctx.rotate(b.angle);

    const arm = Math.min(info.w, info.h) * 0.32;
    ctx.strokeStyle = inkMute;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(-arm, 0);
    ctx.lineTo(arm, 0);
    ctx.moveTo(0, -arm);
    ctx.lineTo(0, arm);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(0, 0, 1.6, 0, Math.PI * 2);
    ctx.stroke();

    // Dimension figures in "mm" (px × 12.5 ≈ a plausible scale) — width
    // under the bottom edge, height beside the left edge.
    ctx.fillStyle = inkMute;
    ctx.font = MONO;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(String(Math.round(info.w * 12.5)), 0, info.bottom + 5);
    ctx.save();
    ctx.translate(-info.w / 2 - 5, info.bottom - info.h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textBaseline = "bottom";
    ctx.fillText(String(Math.round(info.h * 12.5)), 0, 0);
    ctx.restore();

    ctx.restore();
  };

  /* ===== Loop — real-time-locked fixed step + redraw =====
     One Engine.update per rAF frame runs the simulation at DISPLAY
     speed — on a 120 Hz ProMotion screen that's physics at 2×, and the
     over-driven mouse spring pumps energy into a grabbed piece until it
     spins. The official demos step through Matter.Runner, which locks
     steps to wall-clock time — this accumulator does the same. */
  const STEP = 1000 / 60;
  let raf = 0;
  let last = performance.now();
  let acc = 0;
  // Terminal velocity — a grabbed piece could be slung out of frame
  // like a jet (Michal, 2026-07-18): cap linear + angular speed after
  // every step. Throws stay playful (spawn rain enters at 16–24, so
  // the cap never blunts the intro), long falls get an air-drag feel.
  const MAX_SPEED = 32;
  const MAX_SPIN = 0.6;
  const clampVelocities = (): void => {
    for (const b of pieces) {
      if (b.speed > MAX_SPEED) {
        const f = MAX_SPEED / b.speed;
        Body.setVelocity(b, { x: b.velocity.x * f, y: b.velocity.y * f });
      }
      if (Math.abs(b.angularVelocity) > MAX_SPIN) {
        Body.setAngularVelocity(b, Math.sign(b.angularVelocity) * MAX_SPIN);
      }
    }
  };

  const frame = (now: number): void => {
    // Cap the backlog (tab switches) so we never spiral into a
    // catch-up storm.
    acc = Math.min(acc + (now - last), 100);
    last = now;
    while (acc >= STEP) {
      Engine.update(engine, STEP);
      clampVelocities();
      acc -= STEP;
    }
    ctx.clearRect(0, 0, vw, vh);
    for (const b of pieces) drawPiece(b);
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  /* ===== Resize — new parcel bounds, pieces pulled back inside ===== */
  let resizeT = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeT);
    resizeT = window.setTimeout(() => {
      size();
      mouse.pixelRatio = dpr; // the DPR can change when moving monitors
      buildWalls();
      for (const b of pieces) {
        const x = Math.min(Math.max(b.position.x, 40), vw - 40);
        const y = Math.min(b.position.y, vh - 20);
        if (x !== b.position.x || y !== b.position.y) {
          Body.setPosition(b, { x, y });
          Body.setVelocity(b, { x: 0, y: 0 });
        }
      }
    }, 150);
  });

  // Full page navigations tear the world down with the document; only
  // the rAF loop needs stopping if the section ever gets removed.
  window.addEventListener("pagehide", () => cancelAnimationFrame(raf));
}
