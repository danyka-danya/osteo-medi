/* =========================================================================
   app.js — рендер всех экранов и роутинг табов
   ========================================================================= */
(function () {
  let currentTab = "home";
  let currentGroup = window.GROUPS[0].id;

  // ---------- Tabs ----------
  function switchTab(name) {
    currentTab = name;
    document.querySelectorAll(".screen").forEach(el => {
      el.hidden = el.dataset.tab !== name;
    });
    document.querySelectorAll(".tabbar__btn").forEach(btn => {
      const active = btn.dataset.go === name;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  // ---------- HOME ----------
  function renderHome() {
    const g = OS.greetingByHour();
    document.getElementById("greeting-time").textContent = g.text;
    document.querySelector(".greeting__sub").textContent = g.sub;
    document.getElementById("streak-num").textContent = OS.state.data.streakDays || 0;

    // Mood
    const moodRow = document.getElementById("mood-row");
    moodRow.innerHTML = "";
    window.MOODS.forEach(m => {
      const btn = document.createElement("button");
      btn.className = "mood__btn" + (OS.state.data.lastMood === m.id ? " is-selected" : "");
      btn.innerHTML = `<span class="mood__btn-emoji">${m.emoji}</span><span class="mood__btn-lbl">${m.label}</span>`;
      btn.addEventListener("click", () => {
        OS.state.setMood(m.id);
        renderHome();
        if (m.suggest) {
          OS.toast(`Подобрал: ${OS.findMeditation(m.suggest)?.title || "практика"}`);
          setTimeout(() => window.Player.open(m.suggest), 700);
        }
      });
      moodRow.appendChild(btn);
    });

    // Daily tip — детерминированный по дате (стабильный за день)
    const day = new Date().toISOString().slice(0,10);
    const tipIdx = day.split("").reduce((a,c) => a + c.charCodeAt(0), 0) % window.DAILY_TIPS.length;
    document.getElementById("daily-tip-text").textContent = window.DAILY_TIPS[tipIdx];

    // Видео-карусель
    const vs = document.getElementById("videos-scroll");
    vs.innerHTML = "";
    window.VIDEOS.forEach(v => {
      const a = document.createElement("a");
      a.className = "video-card";
      a.href = `https://www.youtube.com/watch?v=${v.id}`;
      a.target = "_blank";
      a.rel = "noopener";
      a.innerHTML = `
        <div class="video-card__thumb">
          <img src="https://img.youtube.com/vi/${v.id}/mqdefault.jpg" alt="" loading="lazy">
          <div class="video-card__play">▶</div>
        </div>
        <div class="video-card__body">
          <div class="video-card__title">${escapeHtml(v.title)}</div>
          <div class="video-card__author">${escapeHtml(v.author)}</div>
        </div>
      `;
      vs.appendChild(a);
    });

    // Рекомендация — случайная не-Pro
    const free = window.MEDITATIONS.filter(m => !m.isPro);
    const rec = free[Math.floor(Math.random() * free.length)];
    document.getElementById("recommended-slot").innerHTML = "";
    document.getElementById("recommended-slot").appendChild(buildBigCard(rec));

    // Утренняя практика
    const morning = OS.findMeditation("m-realization-1") || free[0];
    document.getElementById("morning-slot").innerHTML = "";
    document.getElementById("morning-slot").appendChild(buildBigCard(morning, "Утро"));

    // Быстрый доступ
    const quick = document.getElementById("quick-list");
    quick.innerHTML = "";
    window.MEDITATIONS.slice(3, 7).forEach(m => quick.appendChild(buildQuickRow(m)));
  }

  function buildBigCard(m, chipText) {
    if (!m) return document.createElement("div");
    const el = document.createElement("button");
    el.className = "med-card";
    el.innerHTML = `
      ${m.isPro ? `<span class="med-card__pro">PRO</span>` : ""}
      <span class="med-card__chip">${escapeHtml(chipText || m.posture || "Практика")}</span>
      <h3 class="med-card__title">${escapeHtml(m.title)}</h3>
      <p class="med-card__desc">${escapeHtml(m.desc)}</p>
      <div class="med-card__meta">
        <span>${m.duration} мин</span><span class="dot"></span>
        <span>${escapeHtml(OS.findGroup(m.group)?.title || "")}</span>
      </div>
    `;
    el.addEventListener("click", () => window.Player.open(m.id));
    return el;
  }
  function buildQuickRow(m) {
    const el = document.createElement("button");
    el.className = "quick-row";
    el.innerHTML = `
      <div style="flex:1; min-width:0">
        <div class="quick-row__title">${escapeHtml(m.title)}</div>
        <div class="quick-row__sub">${m.duration} мин · ${escapeHtml(OS.findGroup(m.group)?.title || "")}</div>
      </div>
      <span class="quick-row__chev">›</span>
    `;
    el.addEventListener("click", () => window.Player.open(m.id));
    return el;
  }

  // ---------- MEDITATIONS TAB ----------
  function renderMeditationsTab() {
    const chips = document.getElementById("groups-chips");
    chips.innerHTML = "";
    window.GROUPS.forEach(g => {
      const b = document.createElement("button");
      b.className = "group-chip" + (g.id === currentGroup ? " is-active" : "");
      b.innerHTML = `<span>${g.emoji}</span><span>${escapeHtml(g.title)}</span>`;
      b.addEventListener("click", () => {
        currentGroup = g.id;
        document.getElementById("search-input").value = "";
        renderMeditationsTab();
        // прокрутка чипса в видимую область
        b.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      });
      chips.appendChild(b);
    });

    const cont = document.getElementById("meditations-content");
    cont.innerHTML = "";

    const search = document.getElementById("search-input").value.trim().toLowerCase();
    let list;
    if (search) {
      list = window.MEDITATIONS.filter(m =>
        m.title.toLowerCase().includes(search) ||
        (m.desc || "").toLowerCase().includes(search)
      );
      if (list.length === 0) {
        cont.appendChild(emptyState("Ничего не нашлось", "🔍"));
        return;
      }
      list.forEach(m => cont.appendChild(buildBigCard(m)));
      return;
    }

    const group = OS.findGroup(currentGroup);
    if (group) {
      const hero = document.createElement("div");
      hero.className = "group-hero";
      hero.innerHTML = `
        <div class="group-hero__title">${group.emoji} ${escapeHtml(group.title)}</div>
        <div class="group-hero__sub">${escapeHtml(group.subtitle)}</div>
      `;
      cont.appendChild(hero);
    }

    list = OS.meditationsForGroup(currentGroup);
    if (list.length === 0) {
      cont.appendChild(emptyState("Здесь пока пусто", "✨", "Скоро появятся новые практики в этой группе"));
      return;
    }
    list.forEach(m => cont.appendChild(buildBigCard(m)));
  }

  function emptyState(title, emoji, sub) {
    const el = document.createElement("div");
    el.className = "empty-state";
    el.innerHTML = `
      <span class="empty-state__emoji">${emoji}</span>
      <strong>${escapeHtml(title)}</strong>
      ${sub ? `<div style="margin-top:6px; font-size:13px;">${escapeHtml(sub)}</div>` : ""}
    `;
    return el;
  }

  // ---------- PROGRESS TAB ----------
  function renderProgressTab() {
    const d = OS.state.data;
    document.getElementById("stat-streak").textContent    = d.streakDays || 0;
    document.getElementById("stat-completed").textContent = d.completedMeditations || 0;
    document.getElementById("stat-points").textContent    = d.points || 0;
    document.getElementById("stat-minutes").textContent   = d.minutesPracticed || 0;

    const report = (d.completedMeditations || 0) > 0
      ? `За месяц вы завершили ${d.completedMeditations} ${plural(d.completedMeditations, "практику", "практики", "практик")}, накопили ${d.points} баллов и провели ${d.minutesPracticed} ${plural(d.minutesPracticed, "минуту", "минуты", "минут")} в тишине с собой. Ваше тело стало откликаться быстрее.`
      : "Скоро появится — пройдите несколько практик, чтобы мы могли построить отчёт.";
    document.getElementById("month-report").textContent = report;

    // Heatmap последние 14 недель × 7 дней? Сделаю последние 56 дней (8 недель × 7) → 56 квадратиков
    const heatmap = document.getElementById("heatmap");
    heatmap.innerHTML = "";
    const today = new Date(); today.setHours(0,0,0,0);
    const days = 56;
    for (let i = days - 1; i >= 0; i--) {
      const d2 = new Date(today); d2.setDate(today.getDate() - i);
      const k = `${d2.getFullYear()}-${String(d2.getMonth()+1).padStart(2,"0")}-${String(d2.getDate()).padStart(2,"0")}`;
      const count = d.practiceDays[k] || 0;
      const cell = document.createElement("div");
      cell.className = "heatmap__cell" + (count >= 3 ? " heatmap__cell--l3" : count === 2 ? " heatmap__cell--l2" : count === 1 ? " heatmap__cell--l1" : "");
      cell.title = `${k}: ${count}`;
      heatmap.appendChild(cell);
    }

    // Awareness states
    const list = document.getElementById("awareness-list");
    list.innerHTML = "";
    window.AWARENESS_STATES.forEach(s => {
      const unlocked = d.points >= s.requiredPoints;
      const progress = s.requiredPoints === 0 ? 1 : Math.min(1, d.points / s.requiredPoints);
      const el = document.createElement("div");
      el.className = "state-card" + (unlocked ? "" : " is-locked");
      el.innerHTML = `
        <span class="state-card__icon">${s.icon}</span>
        <div style="flex:1; min-width:0">
          <div class="state-card__name">${unlocked ? "" : "🔒 "}${escapeHtml(s.name)}</div>
          <div class="state-card__bar"><div class="state-card__fill" style="width:${progress*100}%"></div></div>
          <div class="state-card__meta">${unlocked ? "Открыто!" : `${d.points}/${s.requiredPoints} баллов`}</div>
        </div>
      `;
      list.appendChild(el);
    });
  }

  // ---------- PROFILE TAB ----------
  function renderProfileTab() {
    const d = OS.state.data;
    document.getElementById("profile-name").textContent = d.name || "Гость";
    const av = document.getElementById("avatar");
    av.textContent = (d.name || "?").charAt(0).toUpperCase();

    document.getElementById("edit-name-btn").onclick = async () => {
      const next = await OS.prompt("Как вас зовут?", "Имя будет видно только вам", d.name === "Гость" ? "" : d.name);
      if (next !== null && next.trim()) {
        OS.state.setName(next);
        renderProfileTab();
        OS.toast("Имя обновлено ✨");
      }
    };

    document.getElementById("reset-progress-btn").onclick = async () => {
      const ok = await OS.confirm(
        "Сбросить прогресс?",
        "Все ваши практики, баллы и состояния осознанности будут удалены. Действие необратимо.",
        { confirmText: "Сбросить", danger: true }
      );
      if (ok) {
        OS.state.resetAll();
        OS.toast("Прогресс сброшен");
        renderHome(); renderProgressTab(); renderProfileTab(); window.Stories?.renderBar();
      }
    };
  }

  // ---------- helpers ----------
  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }
  function plural(n, one, few, many) {
    n = Math.abs(n) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return many;
    if (n1 > 1 && n1 < 5)  return few;
    if (n1 === 1)           return one;
    return many;
  }

  // ---------- INIT ----------
  document.addEventListener("DOMContentLoaded", () => {
    // Tabs
    document.querySelectorAll(".tabbar__btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const t = btn.dataset.go;
        switchTab(t);
        if (t === "home") renderHome();
        if (t === "meditations") renderMeditationsTab();
        if (t === "progress") renderProgressTab();
        if (t === "profile") renderProfileTab();
      });
    });

    // Search
    document.getElementById("search-input").addEventListener("input", renderMeditationsTab);

    // Initial
    renderHome();
    renderMeditationsTab();
    renderProgressTab();
    renderProfileTab();

    // Service Worker (PWA)
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch(() => {/* file:// — это нормально, что не зарегается */});
      });
    }
  });

  // экспорт для отладки
  window.App = { switchTab, renderHome, renderMeditationsTab, renderProgressTab, renderProfileTab };
})();
