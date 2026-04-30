# Остеопатия Души · Медитации (web)

Премиум-приложение для медитаций — чистый HTML/CSS/JS, без сборки.
Работает локально через `file://` (Safari, Chrome) и на GitHub Pages.

## Запуск локально
Просто открой `index.html` в Safari / Chrome / Firefox.

> Service Worker и установка как PWA («Добавить на главный экран»)
> требуют HTTPS или http://localhost. На `file://` SW не зарегается —
> это нормально, приложение всё равно работает.

## Запуск через локальный сервер (рекомендуется)
```bash
# из папки web/
python3 -m http.server 8080
# или
npx serve .
```
Открыть `http://localhost:8080` → можно установить как PWA.

## Деплой на GitHub Pages
1. Закоммить папку `web/` в репозиторий.
2. В настройках репо: Pages → Source = Deploy from a branch → `main` → `/web` (или корень).
3. Открыть выданный URL на iPhone.
4. Safari → Поделиться → «Добавить на главный экран».

## Структура
```
web/
├── index.html
├── manifest.webmanifest
├── sw.js
├── assets/
│   └── favicon.svg
├── css/
│   └── styles.css
└── js/
    ├── data.js     — все группы, медитации, stories, видео
    ├── state.js    — стейт + localStorage
    ├── orb.js      — неоновый orb-фейт на canvas
    ├── stories.js  — Stories bar + viewer
    ├── player.js   — плеер с ±15с, sleep timer, MediaSession
    └── app.js      — роутер табов + рендер всех экранов
```

## Что добавить далее
- [ ] Аудио-файлы медитаций → `assets/audio/`, прописать `audioUrl` в `data.js`.
- [ ] PNG-иконки 192/512 для `manifest.webmanifest`.
- [ ] Реальная Telegram-ссылка в Профиле.
- [ ] Stripe / ЮKassa для PRO-подписки.
- [ ] Оффлайн-загрузка аудио через Cache API.
