/* =========================================================================
   stories.js — Stories bar + полноэкранный viewer с прогресс-барами и тапами
   ========================================================================= */
(function () {
  const VIEWER_DURATION = 5000; // мс на слайд

  let activeStoryIdx = null;
  let activeSlideIdx = 0;
  let progressTimer = null;
  let progressStartTs = 0;
  let progressElapsed = 0;
  let isPaused = false;
  let lastDir = "next";   // направление последнего перехода: "next" | "prev"

  // ----- Bar -----
  function renderBar() {
    const bar = document.getElementById("stories-bar");
    if (!bar) return;
    bar.innerHTML = "";
    const viewed = new Set(OS.state.data.storiesViewed);

    window.STORIES.forEach((story, idx) => {
      const el = document.createElement("button");
      el.className = "story" + (viewed.has(story.id) ? " is-viewed" : "");
      el.innerHTML = `
        <div class="story__ring"><div class="story__inner">${story.emoji}</div></div>
        <span class="story__lbl">${escapeHtml(story.title)}</span>
      `;
      el.addEventListener("click", () => open(idx));
      bar.appendChild(el);
    });
  }

  // ----- Viewer -----
  function open(idx, dir = "next") {
    lastDir = dir;
    activeStoryIdx = idx;
    activeSlideIdx = 0;
    isPaused = false;
    OS.state.markStoryViewed(window.STORIES[idx].id);
    document.getElementById("story-viewer").hidden = false;
    document.body.style.overflow = "hidden";
    renderViewer();
    startProgress();
    renderBar(); // обновить «просмотрено»
  }

  function close() {
    activeStoryIdx = null;
    document.getElementById("story-viewer").hidden = true;
    document.body.style.overflow = "";
    stopProgress();
  }

  function renderViewer() {
    if (activeStoryIdx === null) return;
    const story = window.STORIES[activeStoryIdx];
    const slide = story.slides[activeSlideIdx];

    document.getElementById("story-emoji").textContent = story.emoji;
    document.getElementById("story-title").textContent = story.title;
    document.getElementById("story-big-emoji").textContent = slide.emoji || story.emoji;
    document.getElementById("story-h").textContent = slide.title || "";
    document.getElementById("story-p").textContent = slide.text || "";

    const viewer = document.getElementById("story-viewer");
    viewer.style.background = slide.bg || "#111";

    // Slide-анимация контента в нужном направлении (перезапуск через reflow)
    const content = viewer.querySelector(".story-viewer__content");
    if (content) {
      content.classList.remove("dir-next", "dir-prev");
      // force reflow
      void content.offsetWidth;
      content.classList.add(lastDir === "prev" ? "dir-prev" : "dir-next");
    }

    const prog = document.getElementById("story-progress");
    prog.innerHTML = "";
    story.slides.forEach((_, i) => {
      const span = document.createElement("span");
      const bar = document.createElement("i");
      if (i < activeSlideIdx) bar.style.width = "100%";
      else if (i === activeSlideIdx) bar.style.width = "0%";
      else bar.style.width = "0%";
      span.appendChild(bar);
      prog.appendChild(span);
    });
  }

  function startProgress() {
    stopProgress();
    progressElapsed = 0;
    progressStartTs = performance.now();
    isPaused = false;
    tick();
  }

  function stopProgress() {
    if (progressTimer) cancelAnimationFrame(progressTimer);
    progressTimer = null;
  }

  function tick() {
    progressTimer = requestAnimationFrame(tick);
    if (isPaused) {
      progressStartTs = performance.now() - progressElapsed;
      return;
    }
    progressElapsed = performance.now() - progressStartTs;
    const pct = Math.min(1, progressElapsed / VIEWER_DURATION);

    const prog = document.getElementById("story-progress");
    const active = prog?.children?.[activeSlideIdx]?.firstElementChild;
    if (active) active.style.width = (pct * 100) + "%";

    if (pct >= 1) advance(+1);
  }

  function advance(dir) {
    if (activeStoryIdx === null) return;
    lastDir = dir > 0 ? "next" : "prev";
    const story = window.STORIES[activeStoryIdx];
    const next = activeSlideIdx + dir;
    if (next >= story.slides.length) {
      // следующий стори
      if (activeStoryIdx < window.STORIES.length - 1) {
        open(activeStoryIdx + 1, "next");
      } else {
        close();
      }
    } else if (next < 0) {
      // предыдущий стори
      if (activeStoryIdx > 0) {
        open(activeStoryIdx - 1, "prev");
        // сразу на последний слайд
        activeSlideIdx = window.STORIES[activeStoryIdx].slides.length - 1;
        renderViewer();
        startProgress();
      }
    } else {
      activeSlideIdx = next;
      renderViewer();
      startProgress();
    }
  }

  // Прыжок к следующему/предыдущему стори (при свайпе)
  function jumpStory(dir) {
    if (activeStoryIdx === null) return;
    const next = activeStoryIdx + dir;
    if (next >= 0 && next < window.STORIES.length) {
      open(next, dir > 0 ? "next" : "prev");
    } else if (dir > 0) {
      close();
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  // ----- Wire up -----
  document.addEventListener("DOMContentLoaded", () => {
    renderBar();
    document.getElementById("story-close").addEventListener("click", close);
    document.getElementById("story-tap-l").addEventListener("click", () => advance(-1));
    document.getElementById("story-tap-r").addEventListener("click", () => advance(+1));

    // hold to pause + горизонтальный свайп для перехода между стори
    const viewer = document.getElementById("story-viewer");
    const setPaused = (v) => { isPaused = v; };
    let touchStartX = 0, touchStartY = 0, touchStartTs = 0;

    viewer.addEventListener("touchstart", (e) => {
      const t = e.touches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
      touchStartTs = performance.now();
      setPaused(true);
    }, { passive: true });

    viewer.addEventListener("touchend", (e) => {
      setPaused(false);
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;
      const dt = performance.now() - touchStartTs;
      const SWIPE_X = 60;     // мин. горизонтальное расстояние
      const SWIPE_Y_MAX = 80; // макс. вертикальное отклонение
      const SWIPE_DT = 600;   // макс. длительность для свайпа
      if (Math.abs(dx) > SWIPE_X && Math.abs(dy) < SWIPE_Y_MAX && dt < SWIPE_DT) {
        if (dx < 0) jumpStory(+1);  // свайп влево → следующий стори
        else        jumpStory(-1);  // свайп вправо → предыдущий
      }
    });
    viewer.addEventListener("touchcancel", () => setPaused(false));

    // Свайп вниз — закрыть (как в Instagram)
    viewer.addEventListener("touchend", (e) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;
      if (dy > 100 && Math.abs(dx) < 60) close();
    });

    viewer.addEventListener("mousedown", () => setPaused(true));
    viewer.addEventListener("mouseup", () => setPaused(false));
    viewer.addEventListener("mouseleave", () => setPaused(false));

    // ESC закрывает
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && activeStoryIdx !== null) close();
      if (e.key === "ArrowRight" && activeStoryIdx !== null) advance(+1);
      if (e.key === "ArrowLeft" && activeStoryIdx !== null) advance(-1);
    });
  });

  window.Stories = { renderBar };
})();
