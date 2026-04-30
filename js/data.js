/* =========================================================================
   data.js — статичные данные приложения
   Все идентификаторы строковые, чтобы можно было хранить в localStorage.
   ========================================================================= */

// ----- 12 групп медитаций -----
// id используется в URL-хеше, иконка — emoji, accent — основной неон-цвет
window.GROUPS = [
  { id: "money",        title: "Деньги",                   emoji: "💎", accent: "#fbbf24", subtitle: "Денежный поток и достаток" },
  { id: "goals",        title: "Целеполагание",            emoji: "🎯", accent: "#a78bfa", subtitle: "Видение, фокус, стратегия" },
  { id: "realization",  title: "Реализация",               emoji: "🚀", accent: "#60a5fa", subtitle: "Действие и проявление силы" },
  { id: "emotions",     title: "Эмоции",                   emoji: "💜", accent: "#f472b6", subtitle: "Страх, гнев, обида, тревога" },
  { id: "pleasure",     title: "Центры удовольствия",      emoji: "🌸", accent: "#fb7185", subtitle: "Чувственность и радость тела" },
  { id: "support",      title: "Внутренняя опора",         emoji: "🪨", accent: "#a3e635", subtitle: "Уверенность, заземление, корни" },
  { id: "relations",    title: "Отношения",                emoji: "❤️‍🔥", accent: "#fb923c", subtitle: "Любовь, границы, близость" },
  { id: "manifest",     title: "Проявленность",            emoji: "✨", accent: "#c4b5fd", subtitle: "Голос и видимость в мире" },
  { id: "health",       title: "Здоровье",                 emoji: "🌿", accent: "#34d399", subtitle: "Тело, дыхание, восстановление" },
  { id: "dimension",    title: "Измерение",                emoji: "🌌", accent: "#22d3ee", subtitle: "Трансцендентное и тонкие планы" },
  { id: "centers",      title: "Центры",                   emoji: "🔮", accent: "#e879f9", subtitle: "Энергоцентры и внутренние оси" },
  { id: "parents",      title: "Родители",                 emoji: "🌳", accent: "#facc15", subtitle: "Род, семья, детские травмы" },
];

// ----- Медитации -----
// audioUrl: null означает заглушку (плеер работает таймером, без звука)
// Когда у Даниила появятся файлы — кладём в /assets/audio/ и прописываем сюда.
window.MEDITATIONS = [
  // Деньги
  { id: "m-money-1", group: "money", title: "Денежный поток", desc: "Работа с блоками изобилия и страхом потери", duration: 15, isPro: false, audioUrl: null, posture: "Лёжа · С наушниками" },
  { id: "m-money-2", group: "money", title: "Внутренний достаток", desc: "Состояние «у меня всегда хватает»", duration: 12, isPro: false, audioUrl: null, posture: "Сидя или лёжа" },
  { id: "m-money-3", group: "money", title: "Деньги и достоинство", desc: "Снять стыд за желание получать больше", duration: 18, isPro: true, audioUrl: null, posture: "Лёжа · С наушниками" },

  // Целеполагание
  { id: "m-goals-1", group: "goals", title: "Видение года", desc: "Соединение с тем, кто вы через 12 месяцев", duration: 20, isPro: false, audioUrl: null, posture: "Лёжа · С наушниками" },
  { id: "m-goals-2", group: "goals", title: "Истинная цель", desc: "Отделить «надо» от «по-настоящему хочется»", duration: 15, isPro: false, audioUrl: null, posture: "Сидя" },
  { id: "m-goals-3", group: "goals", title: "Фокус на одном", desc: "Сжать энергию в главное и отбросить лишнее", duration: 10, isPro: true, audioUrl: null, posture: "Утро, сидя" },

  // Реализация
  { id: "m-realization-1", group: "realization", title: "Пробуждение силы", desc: "Утренняя практика для запуска энергии действия", duration: 10, isPro: false, audioUrl: null, posture: "Утро · стоя или сидя" },
  { id: "m-realization-2", group: "realization", title: "Решительность", desc: "Снять страх перед первым шагом", duration: 12, isPro: false, audioUrl: null, posture: "Сидя" },
  { id: "m-realization-3", group: "realization", title: "Поток дела", desc: "Войти в состояние, где работа делается сама", duration: 15, isPro: true, audioUrl: null, posture: "Перед работой" },

  // Эмоции
  { id: "m-emotions-1", group: "emotions", title: "Медитация на страх", desc: "Работа с подавленной тревогой", duration: 10, isPro: false, audioUrl: null, posture: "Лёжа · С наушниками" },
  { id: "m-emotions-2", group: "emotions", title: "Медитация на обиду", desc: "Проработка обиды через тело и дыхание", duration: 15, isPro: false, audioUrl: null, posture: "Лёжа" },
  { id: "m-emotions-3", group: "emotions", title: "Работа с гневом", desc: "Безопасное освобождение подавленного гнева", duration: 15, isPro: true, audioUrl: null, posture: "Сидя или лёжа" },
  { id: "m-emotions-4", group: "emotions", title: "Отпускание горя", desc: "Принятие и отпускание утрат", duration: 20, isPro: true, audioUrl: null, posture: "Лёжа · С наушниками" },

  // Центры удовольствия
  { id: "m-pleasure-1", group: "pleasure", title: "Раскрытие чувствительности", desc: "Возвращение к ощущению радости тела", duration: 18, isPro: false, audioUrl: null, posture: "Лёжа" },
  { id: "m-pleasure-2", group: "pleasure", title: "Поток наслаждения", desc: "Работа с внутренним «можно»", duration: 15, isPro: true, audioUrl: null, posture: "Лёжа · С наушниками" },

  // Внутренняя опора
  { id: "m-support-1", group: "support", title: "Заземление", desc: "Контакт со стопами, опорой, землёй", duration: 8, isPro: false, audioUrl: null, posture: "Стоя или сидя" },
  { id: "m-support-2", group: "support", title: "Я — у себя", desc: "Возвращение в свой центр", duration: 12, isPro: false, audioUrl: null, posture: "Сидя" },
  { id: "m-support-3", group: "support", title: "Ствол силы", desc: "Внутренняя ось, которая держит всё", duration: 20, isPro: true, audioUrl: null, posture: "Лёжа · С наушниками" },

  // Отношения
  { id: "m-relations-1", group: "relations", title: "Любовь к себе", desc: "Тёплое принятие себя через тело", duration: 15, isPro: false, audioUrl: null, posture: "Лёжа" },
  { id: "m-relations-2", group: "relations", title: "Здоровые границы", desc: "Где заканчиваюсь я и начинается другой", duration: 12, isPro: false, audioUrl: null, posture: "Сидя" },
  { id: "m-relations-3", group: "relations", title: "Отпустить партнёра", desc: "Освобождение от завершённой связи", duration: 20, isPro: true, audioUrl: null, posture: "Лёжа · С наушниками" },

  // Проявленность
  { id: "m-manifest-1", group: "manifest", title: "Право на голос", desc: "Снять зажим в горле и страх говорить", duration: 12, isPro: false, audioUrl: null, posture: "Сидя" },
  { id: "m-manifest-2", group: "manifest", title: "Видимость без страха", desc: "Быть на свету и не сжиматься", duration: 15, isPro: true, audioUrl: null, posture: "Сидя или лёжа" },

  // Здоровье
  { id: "m-health-1", group: "health", title: "Расслабление и контакт с телом", desc: "Базовая практика. Лучше с наушниками", duration: 15, isPro: false, audioUrl: null, posture: "Лёжа · С наушниками" },
  { id: "m-health-2", group: "health", title: "Дыхание восстановления", desc: "Парасимпатика и снижение напряжения", duration: 10, isPro: false, audioUrl: null, posture: "Лёжа" },
  { id: "m-health-3", group: "health", title: "Скан тела перед сном", desc: "Мягкая практика на засыпание", duration: 25, isPro: false, audioUrl: null, posture: "Лёжа · перед сном" },

  // Измерение
  { id: "m-dimension-1", group: "dimension", title: "Тонкое внимание", desc: "Расширение восприятия за пределы тела", duration: 18, isPro: true, audioUrl: null, posture: "Лёжа · С наушниками" },
  { id: "m-dimension-2", group: "dimension", title: "Тишина за умом", desc: "Состояние без мысли", duration: 20, isPro: true, audioUrl: null, posture: "Сидя или лёжа" },

  // Центры
  { id: "m-centers-1", group: "centers", title: "Сердечный центр", desc: "Раскрытие груди и тёплого присутствия", duration: 15, isPro: false, audioUrl: null, posture: "Лёжа" },
  { id: "m-centers-2", group: "centers", title: "Центр живота", desc: "Сила, воля, действие", duration: 12, isPro: false, audioUrl: null, posture: "Сидя или лёжа" },
  { id: "m-centers-3", group: "centers", title: "Сверхспособности тела", desc: "Продвинутый курс раскрытия потенциала", duration: 30, isPro: true, audioUrl: null, posture: "Лёжа · С наушниками" },

  // Родители
  { id: "m-parents-1", group: "parents", title: "Принятие матери", desc: "Возвращение тепла материнской линии", duration: 20, isPro: false, audioUrl: null, posture: "Лёжа · С наушниками" },
  { id: "m-parents-2", group: "parents", title: "Принятие отца", desc: "Возвращение силы отцовской линии", duration: 20, isPro: false, audioUrl: null, posture: "Лёжа · С наушниками" },
  { id: "m-parents-3", group: "parents", title: "Свобода от рода", desc: "Отделение «своего» от «семейного»", duration: 25, isPro: true, audioUrl: null, posture: "Лёжа · С наушниками" },
];

// ----- Stories на главной (как в Instagram) -----
window.STORIES = [
  {
    id: "s-breath",
    title: "Дыхание",
    emoji: "🌬",
    color: "#7c5cbf",
    slides: [
      { title: "Техника 4-7-8", text: "Вдох 4 сек · Задержка 7 сек · Выдох 8 сек", emoji: "🌬", bg: "#2d1b69" },
      { title: "Дышите через нос", text: "Это активирует парасимпатику и снижает тревогу", emoji: "👃", bg: "#1b3a69" },
      { title: "Попробуйте сейчас", text: "Закройте глаза и сделайте 3 цикла", emoji: "✨", bg: "#1b6953" },
    ],
  },
  {
    id: "s-tip",
    title: "Совет дня",
    emoji: "💡",
    color: "#f472b6",
    slides: [
      { title: "Тело помнит всё", text: "Напряжение в плечах часто связано с грузом ответственности", emoji: "💡", bg: "#4a1942" },
      { title: "Заметьте", text: "Где прямо сейчас вы чувствуете напряжение?", emoji: "🔍", bg: "#42194a" },
    ],
  },
  {
    id: "s-practice",
    title: "Практика",
    emoji: "🧘",
    color: "#14ffec",
    slides: [
      { title: "Мини-практика на 2 минуты", text: "Положите руку на грудь. Почувствуйте тепло ладони", emoji: "🧘", bg: "#0d3d3e" },
      { title: "Спросите себя", text: "«Что я сейчас чувствую?» — и просто послушайте ответ тела", emoji: "💜", bg: "#1a2a4a" },
    ],
  },
  {
    id: "s-emotion",
    title: "Эмоции",
    emoji: "🔥",
    color: "#ff9800",
    slides: [
      { title: "Гнев живёт в животе", text: "Если чувствуете жар или сжатие — это нормально", emoji: "🔥", bg: "#4a1a0a" },
      { title: "Не подавляйте", text: "Позвольте чувству быть. Наблюдайте, как оно меняется", emoji: "🌊", bg: "#0a2a4a" },
    ],
  },
  {
    id: "s-sleep",
    title: "Сон",
    emoji: "🌙",
    color: "#4a3a8e",
    slides: [
      { title: "Ритуал перед сном", text: "Сканируйте тело от макушки до стоп, расслабляя каждый участок", emoji: "🌙", bg: "#12122e" },
      { title: "Отпустите день", text: "Представьте, что каждый выдох уносит одну мысль", emoji: "💤", bg: "#1a1a3e" },
    ],
  },
  {
    id: "s-new",
    title: "Новое",
    emoji: "🆕",
    color: "#34d399",
    slides: [
      { title: "Новая медитация", text: "«Сверхспособности тела» — 30 минут глубокой работы", emoji: "🆕", bg: "#0a3a2a" },
      { title: "Откройте Pro", text: "Попробуйте 7 дней бесплатно", emoji: "✨", bg: "#0d3d3e" },
    ],
  },
];

// ----- Видео для карусели на главной -----
// thumb берётся автоматически с img.youtube.com, по клику открывается YouTube
window.VIDEOS = [
  { id: "5H36azOCNfE", title: "Введение в практики Остеопатии Души", author: "Остеопатия Души" },
  { id: "5H36azOCNfE", title: "Как тело хранит эмоции", author: "Остеопатия Души" },
  { id: "5H36azOCNfE", title: "Практика возвращения в тело", author: "Остеопатия Души" },
  { id: "5H36azOCNfE", title: "Деньги и тело — что общего?", author: "Остеопатия Души" },
];

// ----- Состояния осознанности (геймификация) -----
window.AWARENESS_STATES = [
  { id: "as-1", name: "Лёгкость", icon: "🕊", requiredPoints: 0 },
  { id: "as-2", name: "Видение", icon: "👁", requiredPoints: 50 },
  { id: "as-3", name: "Тёплое принятие себя", icon: "💛", requiredPoints: 120 },
  { id: "as-4", name: "Глубина", icon: "🌊", requiredPoints: 200 },
  { id: "as-5", name: "Сила", icon: "⚡", requiredPoints: 350 },
  { id: "as-6", name: "Тишина", icon: "🌌", requiredPoints: 500 },
];

// ----- Мини-инсайты «Совет дня» (рандомно на главной) -----
window.DAILY_TIPS = [
  "Напряжение в плечах — часто это груз чужих ожиданий.",
  "Ком в горле — то, что вы не позволили себе сказать.",
  "Тяжесть в груди — невыплаканное.",
  "Боль в животе — подавленная тревога или гнев.",
  "Слабые ноги — нет ощущения опоры в жизни.",
  "Зажатый таз — заблокированная радость и чувственность.",
  "Холодные руки — недоверие к близости.",
];

// ----- Эмодзи-настроение (виджет «как ты сейчас») -----
window.MOODS = [
  { id: "calm",   emoji: "😌", label: "Спокойно",  suggest: "m-health-1" },
  { id: "anxious",emoji: "😰", label: "Тревожно",  suggest: "m-emotions-1" },
  { id: "angry",  emoji: "😤", label: "Злюсь",     suggest: "m-emotions-3" },
  { id: "sad",    emoji: "😔", label: "Грустно",   suggest: "m-emotions-4" },
  { id: "tired",  emoji: "😮‍💨", label: "Устал",   suggest: "m-health-2" },
];
