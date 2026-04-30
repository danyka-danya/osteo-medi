/* =========================================================================
   orb.js — медитативный неоновый orb-фейт на canvas
   Дышащий шар с переливами фиолетовый ↔ розовый ↔ бирюзовый и плавающие частицы.
   ========================================================================= */
(function () {
  const STAR_COUNT = 38;

  function createOrb(canvas) {
    const ctx = canvas.getContext("2d");
    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let w = 0, h = 0;
    let stars = [];
    let raf = null;
    let isPlaying = false;
    let phase = 0;        // основной фазовый счётчик (для пульса/цвета)
    let breathT = 0;      // дыхание 0..1..0

    function resize() {
      const r = canvas.getBoundingClientRect();
      w = Math.max(200, Math.floor(r.width));
      h = Math.max(200, Math.floor(r.height || r.width));
      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedStars();
    }

    function seedStars() {
      stars = [];
      const cx = w / 2, cy = h / 2;
      const R  = Math.min(w, h) * 0.45;
      for (let i = 0; i < STAR_COUNT; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * R + R * 0.2;
        stars.push({
          a, r,
          ox: cx + Math.cos(a) * r,
          oy: cy + Math.sin(a) * r,
          size: Math.random() * 1.6 + 0.5,
          speed: Math.random() * 0.0008 + 0.0002,
          twinkle: Math.random() * Math.PI * 2,
          hue: Math.random(),
        });
      }
    }

    function lerp(a, b, t) { return a + (b - a) * t; }

    function tick(ts) {
      raf = requestAnimationFrame(tick);

      // время — медленнее, когда пауза, чтобы было живо но спокойно
      phase += isPlaying ? 0.012 : 0.005;

      // breathing 0..1 на цикле 8 секунд
      breathT = (Math.sin(phase * 0.55) + 1) / 2;

      const cx = w / 2, cy = h / 2;
      const baseR = Math.min(w, h) * 0.30;
      const breathR = baseR * (0.92 + breathT * 0.18);

      // ---- ОЧИСТКА: лёгкий хвост (motion blur) ----
      ctx.fillStyle = "rgba(13, 11, 31, 0.18)";
      ctx.fillRect(0, 0, w, h);

      // ---- Внешнее свечение (soft halo) ----
      const haloR = breathR * 2.4;
      const halo = ctx.createRadialGradient(cx, cy, breathR * 0.4, cx, cy, haloR);
      halo.addColorStop(0,    "rgba(167,139,250, 0.35)");
      halo.addColorStop(0.45, "rgba(244,114,182, 0.18)");
      halo.addColorStop(0.85, "rgba(34,211,238, 0.05)");
      halo.addColorStop(1,    "rgba(0,0,0,0)");
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
      ctx.fill();

      // ---- Звёзды (плавающие частицы) ----
      for (const s of stars) {
        s.a += s.speed * (isPlaying ? 1 : 0.4);
        // лёгкий drift по радиусу
        const r = s.r + Math.sin(phase * 0.4 + s.twinkle) * 4;
        const x = cx + Math.cos(s.a) * r;
        const y = cy + Math.sin(s.a) * r;
        const alpha = 0.4 + 0.6 * (Math.sin(phase + s.twinkle) * 0.5 + 0.5);
        // переливы: hue растёт со временем
        const hue = (phase * 12 + s.hue * 360) % 360;
        ctx.fillStyle = `hsla(${hue}, 90%, 75%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ---- Основной orb (3 цветных слоя со смещением, эффект «неона») ----
      const colors = [
        { h: 270 + Math.sin(phase) * 25, dx: -breathR * 0.08, dy: 0, r: breathR * 0.95 },  // фиолет
        { h: 320 + Math.sin(phase + 1) * 25, dx: breathR * 0.08, dy: -breathR * 0.04, r: breathR * 0.85 }, // розовый
        { h: 190 + Math.sin(phase + 2) * 25, dx: 0, dy: breathR * 0.06, r: breathR * 0.75 }, // бирюза
      ];
      for (const c of colors) {
        const grad = ctx.createRadialGradient(cx + c.dx, cy + c.dy, 0, cx + c.dx, cy + c.dy, c.r);
        grad.addColorStop(0,   `hsla(${c.h}, 95%, 70%, 0.55)`);
        grad.addColorStop(0.6, `hsla(${c.h}, 80%, 55%, 0.18)`);
        grad.addColorStop(1,   `hsla(${c.h}, 70%, 40%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx + c.dx, cy + c.dy, c.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // ---- Тонкое внутреннее ядро ----
      const core = ctx.createRadialGradient(cx, cy - breathR * 0.1, 0, cx, cy, breathR * 0.55);
      core.addColorStop(0,    "rgba(255,255,255, 0.55)");
      core.addColorStop(0.4,  "rgba(255,255,255, 0.10)");
      core.addColorStop(1,    "rgba(255,255,255, 0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, breathR * 0.55, 0, Math.PI * 2);
      ctx.fill();

      // ---- Ободок-сияние ----
      ctx.lineWidth = 2;
      ctx.strokeStyle = `hsla(${280 + Math.sin(phase * 0.7) * 40}, 90%, 70%, ${0.25 + breathT * 0.15})`;
      ctx.beginPath();
      ctx.arc(cx, cy, breathR * 1.05, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalCompositeOperation = "source-over";
    }

    function start() {
      if (raf) return;
      resize();
      raf = requestAnimationFrame(tick);
    }
    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    }
    function setPlaying(v) { isPlaying = !!v; }

    const ro = (window.ResizeObserver) ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(canvas);
    window.addEventListener("orientationchange", resize);
    window.addEventListener("resize", resize);

    return { start, stop, setPlaying, resize };
  }

  window.Orb = { create: createOrb };
})();
