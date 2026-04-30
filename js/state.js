/* =========================================================================
   state.js — единый стейт + localStorage + утилиты
   ========================================================================= */
(function () {
  const KEY = "osteo_state_v1";

  const defaults = {
    name: "Гость",
    points: 0,
    completedMeditations: 0,
    minutesPracticed: 0,
    streakDays: 0,
    lastPracticeDay: null,            // YYYY-MM-DD
    practiceDays: {},                 // { "YYYY-MM-DD": количество_практик }
    storiesViewed: [],
    lastMood: null,
    lastVisit: null,
    isPro: false,
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...defaults };
      const parsed = JSON.parse(raw);
      return { ...defaults, ...parsed };
    } catch (_) {
      return { ...defaults };
    }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state.data)); } catch (_) {}
  }

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  function daysBetween(a, b) {
    if (!a || !b) return Infinity;
    const da = new Date(a + "T00:00:00");
    const db = new Date(b + "T00:00:00");
    return Math.round((db - da) / (1000 * 60 * 60 * 24));
  }

  // Полный объект-апи
  const state = {
    data: load(),

    save,

    setName(name) {
      this.data.name = (name || "Гость").trim().slice(0, 30) || "Гость";
      save();
    },

    markStoryViewed(id) {
      if (!this.data.storiesViewed.includes(id)) {
        this.data.storiesViewed.push(id);
        save();
      }
    },

    setMood(moodId) {
      this.data.lastMood = moodId;
      save();
    },

    completeMeditation(meditation) {
      const today = todayKey();
      const last = this.data.lastPracticeDay;

      // streak
      if (last === today) {
        // already practiced today — streak unchanged
      } else if (daysBetween(last, today) === 1) {
        this.data.streakDays += 1;
      } else {
        this.data.streakDays = 1;
      }

      this.data.lastPracticeDay = today;
      this.data.practiceDays[today] = (this.data.practiceDays[today] || 0) + 1;
      this.data.completedMeditations += 1;
      this.data.minutesPracticed += (meditation?.duration || 0);
      this.data.points += 10;

      save();
    },

    resetAll() {
      this.data = { ...defaults };
      save();
    },

    todayKey,
    daysBetween,
  };

  // ----- Помощники UI -----
  window.OS = {
    state,

    // Тосты
    toast(msg, ms = 1800) {
      const el = document.getElementById("toast");
      if (!el) return;
      el.textContent = msg;
      el.hidden = false;
      clearTimeout(el._t);
      el._t = setTimeout(() => { el.hidden = true; }, ms);
    },

    formatTime(secs) {
      secs = Math.max(0, Math.floor(secs || 0));
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return `${m}:${s.toString().padStart(2, "0")}`;
    },

    greetingByHour() {
      const h = new Date().getHours();
      if (h < 5)  return { text: "Доброй ночи 🌙", sub: "Тихая практика поможет уснуть" };
      if (h < 12) return { text: "Доброе утро ✨", sub: "Новое состояние начинается с одной практики" };
      if (h < 17) return { text: "Добрый день 🌤", sub: "5 минут — и тело снова с тобой" };
      if (h < 22) return { text: "Добрый вечер 🌒", sub: "Время отпустить день" };
      return        { text: "Поздний вечер 🌙", sub: "Помоги телу расслабиться" };
    },

    pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; },

    findMeditation(id) { return window.MEDITATIONS.find(m => m.id === id); },
    findGroup(id) { return window.GROUPS.find(g => g.id === id); },
    meditationsForGroup(gid) { return window.MEDITATIONS.filter(m => m.group === gid); },

    // ----- Кастомные диалоги (вместо нативных confirm/prompt) -----
    dialog({ title, message, input = null, confirmText = "ОК", cancelText = "Отмена", danger = false }) {
      return new Promise((resolve) => {
        const root  = document.getElementById("dialog");
        const t     = document.getElementById("dialog-title");
        const m     = document.getElementById("dialog-msg");
        const i     = document.getElementById("dialog-input");
        const ok    = document.getElementById("dialog-ok");
        const cancel= document.getElementById("dialog-cancel");

        t.textContent = title;
        if (message) { m.textContent = message; m.hidden = false; } else { m.hidden = true; }
        if (input !== null) {
          i.hidden = false;
          i.value = input;
          setTimeout(() => i.focus(), 50);
        } else {
          i.hidden = true;
        }
        ok.textContent = confirmText;
        cancel.textContent = cancelText;
        ok.classList.toggle("dialog__btn--danger", !!danger);
        ok.classList.toggle("dialog__btn--primary", !danger);
        root.hidden = false;

        const cleanup = (val) => {
          root.hidden = true;
          ok.onclick = null; cancel.onclick = null; i.onkeydown = null;
          root.querySelector("[data-close-dialog]").onclick = null;
          resolve(val);
        };
        ok.onclick     = () => cleanup(input !== null ? i.value : true);
        cancel.onclick = () => cleanup(null);
        root.querySelector("[data-close-dialog]").onclick = () => cleanup(null);
        if (input !== null) {
          i.onkeydown = (e) => {
            if (e.key === "Enter") cleanup(i.value);
            if (e.key === "Escape") cleanup(null);
          };
        }
      });
    },

    confirm(title, message, opts = {}) {
      return this.dialog({ title, message, confirmText: opts.confirmText || "Да", cancelText: opts.cancelText || "Отмена", danger: !!opts.danger })
        .then(v => v === true);
    },
    prompt(title, message, defaultValue = "") {
      return this.dialog({ title, message, input: defaultValue, confirmText: "Сохранить" });
    },
  };
})();
