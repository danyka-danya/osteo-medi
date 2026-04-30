/* =========================================================================
   player.js — медиаплеер медитаций
   Особенности:
     - ±15 сек перемотка (как в Apple Podcasts)
     - скраббер с тач-перемоткой
     - sleep-timer с плавным fade-out
     - MediaSession API (управление с lock-screen iOS)
     - неоновый orb-фейт вместо обложки
     - если у медитации нет audioUrl — работает в режиме «таймера»
   ========================================================================= */
(function () {
  let currentMed = null;
  let audio = null;
  let orb = null;

  // Виртуальный таймер (используется, когда audioUrl == null)
  let virtualMode = false;
  let virtElapsed = 0;
  let virtTotal   = 0;
  let virtTickRaf = null;
  let virtLastTs  = 0;

  // Sleep timer
  let sleepDeadline = null;     // performance.now() + ms
  let sleepFadeStarted = false;
  let sleepRaf = null;

  // ========================== PUBLIC ==========================
  function open(meditationId) {
    const m = OS.findMeditation(meditationId);
    if (!m) { OS.toast("Медитация не найдена"); return; }
    currentMed = m;

    document.getElementById("player").hidden = false;
    document.body.style.overflow = "hidden";

    const groupName = OS.findGroup(m.group)?.title || "";
    document.getElementById("player-group").textContent = groupName;
    document.getElementById("player-title").textContent = m.title;
    document.getElementById("player-posture").textContent = m.posture || "";
    document.getElementById("player-elapsed").textContent = "0:00";
    document.getElementById("player-total").textContent = OS.formatTime((m.duration || 0) * 60);
    setProgress(0);
    setSleepLabel(null);
    setPlayIcon(false);
    document.getElementById("player").classList.remove("is-playing");

    // orb
    if (!orb) orb = window.Orb.create(document.getElementById("orb-canvas"));
    orb.start();
    orb.setPlaying(false);

    // audio
    teardownAudio();
    if (m.audioUrl) {
      virtualMode = false;
      audio = document.getElementById("player-audio");
      audio.src = m.audioUrl;
      audio.currentTime = 0;
      audio.volume = 1;
      audio.addEventListener("timeupdate", onTimeUpdate);
      audio.addEventListener("loadedmetadata", () => {
        document.getElementById("player-total").textContent = OS.formatTime(audio.duration || 0);
      });
      audio.addEventListener("ended", onEnded);
    } else {
      virtualMode = true;
      virtElapsed = 0;
      virtTotal   = (m.duration || 10) * 60;
    }

    setupMediaSession();
  }

  function close() {
    pause();
    teardownAudio();
    cancelVirtualTick();
    cancelSleep();
    if (orb) orb.stop();
    document.getElementById("player").hidden = true;
    document.body.style.overflow = "";
    currentMed = null;
  }

  // ========================== AUDIO/VIRTUAL ==========================
  function play() {
    if (!currentMed) return;
    if (virtualMode) {
      if (virtElapsed >= virtTotal) virtElapsed = 0;
      virtLastTs = performance.now();
      virtualTick();
    } else if (audio) {
      audio.play().catch(() => {/* iOS может блокировать без жеста — но play по кнопке должен работать */});
    }
    setPlayIcon(true);
    if (orb) orb.setPlaying(true);
    document.getElementById("player").classList.add("is-playing");
  }

  function pause() {
    if (virtualMode) cancelVirtualTick();
    else if (audio) audio.pause();
    setPlayIcon(false);
    if (orb) orb.setPlaying(false);
    document.getElementById("player").classList.remove("is-playing");
  }

  function toggle() {
    if (!currentMed) return;
    if (virtualMode) {
      virtTickRaf ? pause() : play();
    } else if (audio) {
      audio.paused ? play() : pause();
    }
  }

  function virtualTick() {
    virtTickRaf = requestAnimationFrame(virtualTick);
    const now = performance.now();
    const dt = (now - virtLastTs) / 1000;
    virtLastTs = now;
    virtElapsed = Math.min(virtTotal, virtElapsed + dt);
    onTimeUpdate();
    if (virtElapsed >= virtTotal) {
      cancelVirtualTick();
      onEnded();
    }
  }
  function cancelVirtualTick() {
    if (virtTickRaf) cancelAnimationFrame(virtTickRaf);
    virtTickRaf = null;
  }

  function teardownAudio() {
    if (audio) {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeAttribute("src");
      audio.load?.();
    }
    audio = null;
  }

  // ========================== EVENTS / UI ==========================
  function onTimeUpdate() {
    const cur = virtualMode ? virtElapsed : (audio?.currentTime || 0);
    const total = virtualMode ? virtTotal : (audio?.duration || (currentMed.duration * 60));
    document.getElementById("player-elapsed").textContent = OS.formatTime(cur);
    if (total) document.getElementById("player-total").textContent = OS.formatTime(total);
    setProgress(total ? cur / total : 0);
  }

  function onEnded() {
    setPlayIcon(false);
    if (orb) orb.setPlaying(false);
    OS.state.completeMeditation(currentMed);
    OS.toast("+10 баллов · практика завершена ✨");
    // обновим хедер «огонёк»
    document.getElementById("streak-num").textContent = OS.state.data.streakDays;
  }

  function seekDelta(delta) {
    if (virtualMode) {
      virtElapsed = Math.min(virtTotal, Math.max(0, virtElapsed + delta));
      onTimeUpdate();
    } else if (audio) {
      audio.currentTime = Math.min(audio.duration || 0, Math.max(0, (audio.currentTime || 0) + delta));
    }
  }

  function seekToFraction(f) {
    f = Math.min(1, Math.max(0, f));
    if (virtualMode) {
      virtElapsed = virtTotal * f;
      onTimeUpdate();
    } else if (audio) {
      const dur = audio.duration || (currentMed.duration * 60);
      audio.currentTime = dur * f;
    }
  }

  function restart() {
    if (virtualMode) virtElapsed = 0;
    else if (audio) audio.currentTime = 0;
    onTimeUpdate();
  }

  function setProgress(f) {
    document.getElementById("player-progress-fill").style.width = (f * 100) + "%";
    const seek = document.getElementById("player-seek");
    if (seek && document.activeElement !== seek) seek.value = String(f * 100);
  }

  function setPlayIcon(playing) {
    document.getElementById("player-play-icon").textContent = playing ? "⏸" : "▶";
  }

  // ========================== SLEEP TIMER ==========================
  function openSleepSheet() {
    document.getElementById("sleep-sheet").hidden = false;
  }
  function closeSleepSheet() {
    document.getElementById("sleep-sheet").hidden = true;
  }
  function setSleep(value) {
    cancelSleep();
    if (value === "0") {
      setSleepLabel(null);
      OS.toast("Таймер сна выключен");
      closeSleepSheet();
      return;
    }
    let ms;
    if (value === "end") {
      const total = virtualMode ? virtTotal : (audio?.duration || currentMed.duration * 60);
      const cur   = virtualMode ? virtElapsed : (audio?.currentTime || 0);
      ms = Math.max(1000, (total - cur) * 1000);
      setSleepLabel("До конца");
    } else {
      ms = parseInt(value, 10) * 60 * 1000;
      setSleepLabel(`${value} мин`);
    }
    sleepDeadline = performance.now() + ms;
    sleepFadeStarted = false;
    sleepLoop();
    closeSleepSheet();
    OS.toast("Таймер сна установлен 🌙");
  }
  function setSleepLabel(text) {
    const el = document.getElementById("sleep-timer-label");
    const btn = document.getElementById("sleep-timer-btn");
    if (text) {
      el.textContent = text;
      btn.classList.add("is-active");
    } else {
      el.textContent = "Таймер сна";
      btn.classList.remove("is-active");
    }
  }
  function cancelSleep() {
    if (sleepRaf) cancelAnimationFrame(sleepRaf);
    sleepRaf = null;
    sleepDeadline = null;
    sleepFadeStarted = false;
    if (audio) audio.volume = 1;
  }
  function sleepLoop() {
    sleepRaf = requestAnimationFrame(sleepLoop);
    if (!sleepDeadline) return;
    const remain = sleepDeadline - performance.now();
    const FADE = 8000; // 8 секунд плавного затухания
    if (remain <= 0) {
      pause();
      setSleepLabel(null);
      cancelSleep();
      OS.toast("🌙 Таймер сна сработал");
    } else if (remain <= FADE) {
      if (!sleepFadeStarted) sleepFadeStarted = true;
      const k = Math.max(0, remain / FADE);
      if (audio) audio.volume = k;
    }
  }

  // ========================== MEDIA SESSION ==========================
  function setupMediaSession() {
    if (!("mediaSession" in navigator) || !currentMed) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentMed.title,
        artist: OS.findGroup(currentMed.group)?.title || "Остеопатия Души",
        album: "Остеопатия Души · Медитации",
      });
      navigator.mediaSession.setActionHandler("play", () => play());
      navigator.mediaSession.setActionHandler("pause", () => pause());
      navigator.mediaSession.setActionHandler("seekbackward", () => seekDelta(-15));
      navigator.mediaSession.setActionHandler("seekforward", () => seekDelta(+15));
      navigator.mediaSession.setActionHandler("seekto", (d) => {
        if (d.fastSeek && audio?.fastSeek) audio.fastSeek(d.seekTime);
        else if (audio) audio.currentTime = d.seekTime;
      });
    } catch (_) {}
  }

  // ========================== WIRE-UP ==========================
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("player-close").addEventListener("click", close);
    document.getElementById("player-play").addEventListener("click", toggle);
    document.getElementById("player-back15").addEventListener("click", () => seekDelta(-15));
    document.getElementById("player-fwd15").addEventListener("click", () => seekDelta(+15));
    document.getElementById("restart-btn").addEventListener("click", restart);
    document.getElementById("sleep-timer-btn").addEventListener("click", openSleepSheet);

    document.getElementById("player-seek").addEventListener("input", (e) => {
      seekToFraction(parseFloat(e.target.value) / 100);
    });

    // Sheet
    document.querySelectorAll("[data-close-sheet]").forEach(el => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-close-sheet");
        document.getElementById(id).hidden = true;
      });
    });
    document.querySelectorAll("[data-sleep]").forEach(btn => {
      btn.addEventListener("click", () => setSleep(btn.getAttribute("data-sleep")));
    });

    // Hotkeys (для тестов на десктопе)
    document.addEventListener("keydown", (e) => {
      const playerOpen = !document.getElementById("player").hidden;
      if (!playerOpen) return;
      if (e.code === "Space") { e.preventDefault(); toggle(); }
      if (e.code === "ArrowLeft")  seekDelta(-15);
      if (e.code === "ArrowRight") seekDelta(+15);
      if (e.key === "Escape") close();
    });
  });

  window.Player = { open, close };
})();
