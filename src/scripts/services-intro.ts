/**
 * Služby intro — organic field reveal ("liquid ink").
 *
 * The finished PHOTO covers the hero; the technical BLUEPRINT of the
 * same house shows through a large, ORGANIC FIELD — flowing, marbled
 * shapes with islands and tendrils, like ink spreading through paper.
 * The field is a domain-warped fbm noise (fbm of fbm of fbm — the
 * classic award-site technique) thresholded with a CRISP edge, so the
 * boundary reads as cut paper / poured liquid, never a glow. The
 * revealed drawing is NOT distorted.
 *
 * Polish details:
 *   - A thin "ink contour" darkens the blueprint right at the cut —
 *     the boundary itself reads as a drawn line (on-concept).
 *   - A faint shadow on the photo side gives the tear subtle depth.
 *   - The field evolves slowly on its own (self-animating); the cursor
 *     makes it BLOOM locally (a bias in the field, not a dragged
 *     circle) so the shape always stays organic.
 *   - On enter, coverage eases up from nothing — an organic bloom-in.
 *
 * Raw WebGL, no dependency. Fallback (no WebGL / reduced motion): the
 * plain photo stays. Touch: the field animates on its own.
 */
export function initServicesIntro(): void {
  if (typeof window === "undefined") return;
  const section = document.querySelector<HTMLElement>(".sintro");
  if (!section) return;

  initNavTheme(section);
  initReveal(section);
}

/** Light nav over the photo → dark-on-cream once the hero leaves. */
function initNavTheme(section: HTMLElement): void {
  const nav = document.querySelector<HTMLElement>(".snav");
  if (!nav) return;

  if (typeof IntersectionObserver === "undefined") {
    nav.classList.add("is-scrolled");
    return;
  }
  const observer = new IntersectionObserver(
    ([entry]) => nav.classList.toggle("is-scrolled", !entry.isIntersecting),
    { rootMargin: "-60px 0px 0px 0px", threshold: 0 },
  );
  observer.observe(section);
}

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const makeFrag = (deriv: boolean) => `
${deriv ? "#extension GL_OES_standard_derivatives : enable" : ""}
precision highp float;
varying vec2 v_uv;
uniform vec2 u_res;
uniform vec2 u_img;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_progress;
uniform float u_hover;
uniform sampler2D u_photo;
uniform sampler2D u_blueprint;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++){ v += a * noise(p); p = p * 2.03 + 19.7; a *= 0.5; }
  return v;
}

void main() {
  float ratio = u_res.x / u_res.y;
  float iratio = u_img.x / u_img.y;

  // Cover-fit UV — content sampled undistorted.
  vec2 uvc = v_uv;
  if (ratio > iratio) uvc.y = (v_uv.y - 0.5) * (iratio / ratio) + 0.5;
  else uvc.x = (v_uv.x - 0.5) * (ratio / iratio) + 0.5;

  // ---- Calm liquid field: LOW-frequency noise, gentle flow warp ----
  // Few LARGE, smooth, rounded forms sweeping across the frame (the
  // reference look) — not turbulent marble. Smoothness comes from the
  // low base frequency + only a soft single-octave warp.
  vec2 p = vec2(v_uv.x * ratio, v_uv.y) * 0.8;
  float t = u_time * 0.05;
  vec2 q = vec2(
    noise(p * 1.2 + vec2(0.0, t)),
    noise(p * 1.2 + vec2(4.3, 2.1) - t)
  ) - 0.5;
  float f = fbm(p + q * 1.6);

  // Cursor bias — the field BLOOMS locally around the pointer (the
  // shape still comes from the noise, never a dragged circle).
  vec2 dm = v_uv - u_mouse; dm.x *= ratio;
  f += exp(-dot(dm, dm) / 0.08) * 0.26 * u_hover;

  // Boundary crispness — screen-space derivative keeps the edge a
  // constant ~1.5px regardless of how flat the field is locally
  // (fixes the wide grey smear where the low-freq field is shallow).
  float th = mix(0.80, 0.28, u_progress);
  ${deriv ? "float E = max(fwidth(f) * 1.4, 0.002);" : "float E = 0.02;"}
  float m = smoothstep(th - E, th + E, f);

  vec3 photo = texture2D(u_photo, uvc).rgb;
  vec3 bp = texture2D(u_blueprint, uvc).rgb;
  bp = clamp((bp - 0.5) * 1.16 + 0.5, 0.0, 1.0) * 0.985;

  // Subtle ink contour at the cut + a NARROW soft shadow just outside
  // it — both sized from E so they stay thin, consistent lines
  // everywhere (no broad grey halo in flat regions).
  float ink = smoothstep(th - E * 4.0, th, f) * smoothstep(th + E * 4.0, th, f);
  float shadow = smoothstep(th - E * 8.0, th, f) * (1.0 - m);

  vec3 col = mix(photo - shadow * 0.08, bp - ink * 0.12, m);
  gl_FragColor = vec4(col, 1.0);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    // eslint-disable-next-line no-console
    console.warn("shader compile failed:", gl.getShaderInfoLog(sh));
    return null;
  }
  return sh;
}

function texture(gl: WebGLRenderingContext, img: HTMLImageElement) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return tex;
}

function initReveal(section: HTMLElement): void {
  const stage = section.querySelector<HTMLElement>(".sintro-stage");
  const photo = stage?.querySelector<HTMLImageElement>(".sintro-photo");
  const blueprint = stage?.querySelector<HTMLImageElement>(".sintro-blueprint");
  const canvas = stage?.querySelector<HTMLCanvasElement>(".sintro-canvas");
  if (!stage || !photo || !blueprint || !canvas) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return; // photo stays

  const gl = (canvas.getContext("webgl", { alpha: true, antialias: true }) ||
    canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
  if (!gl) return; // photo stays

  // Derivative-based edge needs this (near-universal on WebGL1);
  // without it we fall back to a fixed-width edge.
  const hasDeriv = !!gl.getExtension("OES_standard_derivatives");

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, makeFrag(hasDeriv));
  if (!vs || !fs) return;
  const prog = gl.createProgram();
  if (!prog) return;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const aPos = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const U = {
    res: gl.getUniformLocation(prog, "u_res"),
    img: gl.getUniformLocation(prog, "u_img"),
    mouse: gl.getUniformLocation(prog, "u_mouse"),
    time: gl.getUniformLocation(prog, "u_time"),
    progress: gl.getUniformLocation(prog, "u_progress"),
    hover: gl.getUniformLocation(prog, "u_hover"),
    photo: gl.getUniformLocation(prog, "u_photo"),
    blueprint: gl.getUniformLocation(prog, "u_blueprint"),
  };

  // ----- tunables -----
  const BASE = 0.56; // resting coverage (refs show a generous reveal)
  const BREATHE = 0.05; // slow coverage breathing
  const HOVER_LIFT = 0.08; // extra global coverage while hovering

  const canHover = window.matchMedia("(hover: hover)").matches;
  let texReady = false;
  let mx = 0.5, my = 0.5;
  let tmx = 0.5, tmy = 0.5;
  let progress = 0;
  let hoverAmt = 0;
  let hover = false;
  let running = false;
  let rafId = 0;
  let started = 0;

  const resize = () => {
    const rect = stage.getBoundingClientRect();
    // 1.5 dpr cap — a mask field needs no retina precision and the
    // domain-warped fbm is the heaviest thing on the page.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };

  const setup = () => {
    if (!blueprint.naturalWidth || !photo.naturalWidth) return;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture(gl, photo));
    gl.uniform1i(U.photo, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture(gl, blueprint));
    gl.uniform1i(U.blueprint, 1);
    gl.uniform2f(U.img, blueprint.naturalWidth, blueprint.naturalHeight);
    resize();
    texReady = true;
    started = performance.now();
    canvas.classList.add("is-ready");
  };

  const render = () => {
    rafId = requestAnimationFrame(render);
    if (!texReady) return;
    const t = (performance.now() - started) * 0.001;

    mx += (tmx - mx) * 0.09;
    my += (tmy - my) * 0.09;
    hoverAmt += ((hover ? 1 : 0) - hoverAmt) * 0.06;
    const target =
      BASE + BREATHE * Math.sin(t * 0.07) + HOVER_LIFT * hoverAmt;
    progress += (target - progress) * 0.028; // slow organic bloom-in

    gl.uniform2f(U.res, canvas.width, canvas.height);
    gl.uniform2f(U.mouse, mx, my);
    gl.uniform1f(U.time, t);
    gl.uniform1f(U.progress, progress);
    gl.uniform1f(U.hover, hoverAmt);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  const start = () => {
    if (running) return;
    running = true;
    render();
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(rafId);
  };

  const io = new IntersectionObserver(
    ([entry]) => (entry.isIntersecting ? start() : stop()),
    { threshold: 0.01 },
  );
  io.observe(stage);

  if (canHover) {
    const cursorEl = document.getElementById("cursor");
    const nav = document.querySelector<HTMLElement>(".snav");

    // Cursor ↔ effect handoff, ANTICIPATORY: the handoff isn't at the
    // nav's edge but begins APPROACH px below it — as the pointer
    // nears the menu the custom cursor is already back and the bloom
    // is releasing, so the menu always greets you click-ready. Driven
    // from pointermove proximity (not nav enter/leave), so it also
    // covers moves that start inside the zone.
    const APPROACH = 90;
    let cursorLeads = false;

    const setLead = (lead: boolean) => {
      if (lead === cursorLeads) return;
      cursorLeads = lead;
      hover = !lead;
      if (cursorEl) cursorEl.style.opacity = lead ? "" : "0";
    };

    const nearNav = (clientY: number) => {
      const navBottom = nav ? nav.getBoundingClientRect().bottom : 0;
      return clientY < navBottom + APPROACH;
    };

    stage.addEventListener("pointermove", (e) => {
      const rect = stage.getBoundingClientRect();
      tmx = (e.clientX - rect.left) / rect.width;
      tmy = 1 - (e.clientY - rect.top) / rect.height;
      setLead(nearNav(e.clientY));
    });
    stage.addEventListener("pointerenter", (e) => {
      // Force-apply on entry (setLead early-returns on equal state,
      // but after pointerleave the visual state is "cursor visible").
      const lead = nearNav(e.clientY);
      cursorLeads = !lead;
      setLead(lead);
    });
    stage.addEventListener("pointerleave", () => {
      hover = false;
      cursorLeads = false;
      if (cursorEl) cursorEl.style.opacity = "";
    });
  }

  if (blueprint.complete && photo.complete && blueprint.naturalWidth) setup();
  else {
    let pending = 2;
    const onLoad = () => {
      if (--pending <= 0) setup();
    };
    blueprint.addEventListener("load", onLoad, { once: true });
    photo.addEventListener("load", onLoad, { once: true });
  }

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 150);
  });
}
