(function () {
  const THEME_STORAGE_KEY = "tg_archiver_theme";
  const USER_ID_STORAGE_KEY = "tg_archiver_user_id";
  function setStoredAdminToken(tok) {
    try {
      if (tok) localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, tok);
      else localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    } catch {}
  }
  const FALLBACK_SERVER_URL = "http://78.154.103.37:14370";
  const DAYS_SHORT = {
    Понеділок: "Пн",
    Вівторок: "Вт",
    Середа: "Ср",
    Четвер: "Чт",
    "П'ятниця": "Пт",
    Субота: "Сб",
  };
  const DAYS_ORDER = ["Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота"];
  const DEFAULT_LESSON_TYPES = [
    "Лекція",
    "Практика",
    "Лабораторна",
    "Семінар",
    "Консультація",
    "Залік",
    "Диференційований залік",
    "Екзамен",
    "Курсова робота",
    "Спец. заняття",
  ];
  const KPI_PAIR_TIMES = {
    1: { start: "08:30", end: "10:05" },
    2: { start: "10:25", end: "12:00" },
    3: { start: "12:20", end: "13:55" },
    4: { start: "14:15", end: "15:50" },
    5: { start: "16:10", end: "17:45" },
    6: { start: "18:30", end: "20:05" },
  };
  const APP_ROUTES = new Set(["/home", "/schedule", "/tasks", "/articles", "/users", "/profile", "/ai"]);

  const ICONS = {
    user: '<svg class="tg-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    pin: '<svg class="tg-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    link: '<svg class="tg-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    clock: '<svg class="tg-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    file: '<svg class="tg-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    upload: '<svg class="tg-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
    archive: '<svg class="tg-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>',
    trash: '<svg class="tg-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    edit: '<svg class="tg-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
    camera: '<svg class="tg-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
    check: '<svg class="tg-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    calendar: '<svg class="tg-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  };

  const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
  if (tg) {
    try {
      tg.ready();
      tg.expand();
    } catch {}
  }

  const state = {
    theme: document.documentElement.getAttribute("data-theme") || "dark",
    selectedWeek: "1",
    selectedDay: "Понеділок",
    schedule: null,
    tasks: [],
    articles: [],
    profiles: { subjects: {}, lecturers: {} },
    users: [],
    pendingUsers: [],
    blacklistedUsers: [],
    usersTab: "verified",
    tasksSubjectFilter: "",
    articlesSubjectFilter: "",
    user: null,
    isAdmin: false,
    isVerified: false,
    userStatus: "guest",
    authMode: "guest",
    botUsername: "ES61bot",
    activeArticleId: null,
    activeEntity: null,
    activeTaskSubjectId: null,
    bootstrapped: false,
    navStack: [],
  };

  let resolvedApiBase = "";
  let slowLoaderTimer = null;

  function haptic(type = "light") {
    try {
      if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred(type);
    } catch {}
  }

  function showToast(msg, durationMs = 2600) {
    const el = document.getElementById("toastEl");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      el.hidden = true;
    }, durationMs);
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, "&#39;");
  }

  function isTelegramMiniApp() {
    return Boolean(tg && tg.initData && String(tg.initData).trim().length > 0);
  }

  function extractInternalRoute(raw) {
    const s = String(raw || "").trim();
    if (!s) return "";
    if (s.startsWith("/") && !s.startsWith("//") && !s.startsWith("/api/")) {
      return s.length > 1 ? s.replace(/\/+$/, "") : "/";
    }
    if (/^https?:\/\/\/[^/]/i.test(s)) {
      const pathPart = s.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
      if (pathPart && !pathPart.startsWith("/api/")) return pathPart;
    }
    return "";
  }

  function resolveSmartRouteUrl(route) {
    const clean = extractInternalRoute(route) || "/";
    if (isTelegramMiniApp()) {
      const bot = state.botUsername || "ES61bot";
      const seg = clean.replace(/^\/+/, "").trim() || "home";
      return `https://t.me/${bot}?startapp=${encodeURIComponent(seg)}`;
    }
    return `${window.location.origin}${clean}`;
  }

  function hydrateSmartLinks(container) {
    if (!container) return;
    container.querySelectorAll("a[href], a[data-internal-route]").forEach((a) => {
      const rawHref = a.getAttribute("data-internal-route") || a.getAttribute("href") || "";
      const route = extractInternalRoute(rawHref);
      if (!route) return;
      a.setAttribute("data-internal-route", route);
      a.setAttribute("href", resolveSmartRouteUrl(route));
      a.removeAttribute("target");
      a.removeAttribute("rel");
    });
  }

  function normalizeUserUrl(raw) {
    const s = String(raw || "").trim();
    if (!s) return "";
    if (s.startsWith("/") && !s.startsWith("//")) {
      return s.length > 1 ? s.replace(/\/+$/, "") : "/";
    }
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s)) return s;
    if (s.startsWith("//")) return `https:${s}`;
    return `https://${s}`;
  }

  function resolveMediaUrl(url) {
    if (!url) return "";
    if (/^https?:\/\//i.test(url) || url.startsWith("data:")) return url;
    if (resolvedApiBase && url.startsWith("/api/")) {
      return `${resolvedApiBase}${url}`;
    }
    return url;
  }

  function renderAvatarInto(el, userObj) {
    if (!el) return;
    const initials =
      (((userObj?.lastName || "")[0] || "") + ((userObj?.firstName || "")[0] || "")).toUpperCase() || "?";
    if (userObj?.avatarUrl) {
      el.innerHTML = `<img src="${escapeAttr(resolveMediaUrl(userObj.avatarUrl))}" alt="${escapeAttr(initials)}" onerror="this.remove();this.parentNode.textContent='${escapeAttr(initials)}';" />`;
    } else {
      el.textContent = initials;
    }
  }

  function openBotDeepLink(startParam) {
    const bot = state.botUsername || "ES61bot";
    const url = startParam
      ? `https://t.me/${bot}?start=${encodeURIComponent(startParam)}`
      : `https://t.me/${bot}`;
    if (tg && typeof tg.openTelegramLink === "function") {
      try {
        tg.openTelegramLink(url);
        return;
      } catch {}
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function applyTheme(theme, { persistLocal = true, persistServer = false } = {}) {
    const next = theme === "dark" ? "dark" : "light";
    state.theme = next;
    document.documentElement.setAttribute("data-theme", next);

    if (persistLocal) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {}
    }

    document.querySelectorAll("[data-set-theme]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-set-theme") === next);
    });

    if (tg) {
      try {
        const bg = next === "dark" ? "#17212b" : "#f4f4f5";
        const hdr = next === "dark" ? "#232e3c" : "#ffffff";
        if (typeof tg.setBackgroundColor === "function") tg.setBackgroundColor(bg);
        if (typeof tg.setHeaderColor === "function") tg.setHeaderColor(hdr);
      } catch {}
    }

    if (persistServer) {
      apiFetch("/api/theme", {
        method: "POST",
        body: JSON.stringify({ theme: next }),
      }).catch(() => {});
    }
  }

  function getSavedManualUserId() {
    const urlParams = new URLSearchParams(window.location.search);
    const fromUrl = urlParams.get("userId");
    if (fromUrl && /^\d+$/.test(fromUrl)) {
      try {
        localStorage.setItem(USER_ID_STORAGE_KEY, fromUrl);
      } catch {}
      return fromUrl;
    }
    try {
      const stored = localStorage.getItem(USER_ID_STORAGE_KEY);
      if (stored && /^\d+$/.test(stored)) return stored;
    } catch {}
    return "";
  }

  function getAuthHeaders(hasBody = false) {
    const headers = {};
    if (hasBody) headers["Content-Type"] = "application/json";
    if (tg && tg.initData) {
      headers["X-Telegram-Init-Data"] = tg.initData;
    }
    return headers;
  }

  async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: ctrl.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  function getApiBasesToTry() {
    const bases = [];
    if (resolvedApiBase) bases.push(resolvedApiBase);
    if (window.location.protocol !== "file:" && !bases.includes("")) bases.push("");
    if (
      window.location.protocol !== "https:" &&
      window.location.origin !== FALLBACK_SERVER_URL &&
      !bases.includes(FALLBACK_SERVER_URL)
    ) {
      bases.push(FALLBACK_SERVER_URL);
    }
    return bases;
  }

  async function apiFetch(path, options = {}) {
    const bases = getApiBasesToTry();
    const hasBody = Boolean(options.body);
    let lastErr = null;
    for (const base of bases) {
      try {
        const res = await fetchWithTimeout(
          `${base}${path}`,
          {
            ...options,
            headers: {
              ...getAuthHeaders(hasBody),
              ...(options.headers || {}),
            },
          },
          path.startsWith("/api/ai/") ? 35000 : 18000,
        );
        if (res.status === 404 && base === "" && bases.length > 1) {
          continue;
        }
        const data = await res.json().catch(() => ({}));
        if (!res.ok && !data.error) {
          throw new Error(`HTTP ${res.status}`);
        }
        resolvedApiBase = base;
        return data;
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr || new Error("Немає зв'язку з сервером");
  }

  function compressImageFile(file, maxSize = 1280, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Помилка читання файлу"));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error("Некоректне зображення"));
        img.onload = () => {
          let w = img.naturalWidth || img.width;
          let h = img.naturalHeight || img.height;
          if (w > maxSize || h > maxSize) {
            if (w >= h) {
              h = Math.round((h * maxSize) / w);
              w = maxSize;
            } else {
              w = Math.round((w * maxSize) / h);
              h = maxSize;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          const out = canvas.toDataURL("image/jpeg", quality);
          resolve(out);
        };
        img.src = String(reader.result || "");
      };
      reader.readAsDataURL(file);
    });
  }

  function formatCountdown(deadlineMs, status) {
    if (status === "closed") return "Закрито";
    if (!deadlineMs) return "Без дедлайну";
    const diff = deadlineMs - Date.now();
    if (diff <= 0) return "Дедлайн минув";
    const mins = Math.floor(diff / 60000);
    const days = Math.floor(mins / 1440);
    const hours = Math.floor((mins % 1440) / 60);
    const remMins = mins % 60;
    if (days > 0) return `Залишилось ${days} дн. ${hours} год.`;
    if (hours > 0) return `Залишилось ${hours} год. ${remMins} хв.`;
    return `Залишилось ${remMins} хв.`;
  }

  function formatUkDate(isoDate) {
    const m = String(isoDate || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return isoDate || "";
    const months = ["січ", "лют", "бер", "кві", "тра", "чер", "лип", "сер", "вер", "жов", "лис", "гру"];
    return `${m[3]} ${months[Number(m[2]) - 1] || m[2]} ${m[1]}`;
  }

  function getAllSubjectNames() {
    const set = new Set();
    Object.keys(state.profiles?.subjects || {}).forEach((k) => k && set.add(k.trim()));
    const weeks = state.schedule?.weeks || {};
    for (const wk of Object.values(weeks)) {
      for (const dayLessons of Object.values(wk || {})) {
        for (const l of dayLessons || []) {
          if (l.name && l.name.trim()) set.add(l.name.trim());
        }
      }
    }
    for (const e of state.schedule?.oneTimeEvents || []) {
      if (e.name && e.name.trim()) set.add(e.name.trim());
    }
    for (const a of state.articles || []) {
      if (a.subject && a.subject.trim()) set.add(a.subject.trim());
    }
    for (const t of state.tasks || []) {
      if (t.subject && t.subject.trim()) set.add(t.subject.trim());
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "uk"));
  }

  function populateSubjectSelect(selectEl, selectedValue = "", emptyLabel = "— Без предмета —") {
    if (!selectEl) return;
    const subjects = getAllSubjectNames();
    selectEl.innerHTML = `<option value="">${escapeHtml(emptyLabel)}</option>`;
    for (const s of subjects) {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      if (s === selectedValue) opt.selected = true;
      selectEl.appendChild(opt);
    }
  }

  function populateLessonTypeSelect(selectEl, selectedValue = "Лекція") {
    if (!selectEl) return;
    const types = state.schedule?.lessonTypes || DEFAULT_LESSON_TYPES;
    selectEl.innerHTML = "";
    for (const t of types) {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      if (t === selectedValue) opt.selected = true;
      selectEl.appendChild(opt);
    }
  }

  // ==================== LOADING OVERLAY ====================
  function showLoader(isLoading) {
    const loader = document.getElementById("appLoader");
    const warn = document.getElementById("loaderSlowWarning");
    if (isLoading) {
      loader.hidden = false;
      warn.hidden = true;
      clearTimeout(slowLoaderTimer);
      slowLoaderTimer = setTimeout(() => {
        if (!loader.hidden) {
          warn.hidden = false;
        }
      }, 10000);
    } else {
      clearTimeout(slowLoaderTimer);
      loader.hidden = true;
      warn.hidden = true;
    }
  }

  // ==================== ROUTING ====================
  function getNormalizedPath() {
    let p = window.location.pathname || "/";
    if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
    return p;
  }

  function navigateTo(path, replace = false, opts = {}) {
    const target = path.startsWith("/") ? path : `/${path}`;
    const prev = getNormalizedPath();
    if (prev !== target) {
      if (!replace && !opts.isBack && prev) {
        state.navStack.push(prev);
        if (state.navStack.length > 40) state.navStack.shift();
      }
      if (replace) history.replaceState({}, "", target);
      else history.pushState({}, "", target);
    }
    renderCurrentRoute();
  }

  function hideAllTopLevelViews() {
    document.getElementById("appShell").hidden = true;
    document.getElementById("guestGateView").hidden = true;
    document.getElementById("articleReaderPage").hidden = true;
    document.getElementById("articleEditorPage").hidden = true;
    const aiPage = document.getElementById("aiChatPage");
    if (aiPage) aiPage.hidden = true;
  }

  function showMainTab(tabName) {
    hideAllTopLevelViews();
    const shell = document.getElementById("appShell");
    shell.hidden = false;
    const bottomNav = document.querySelector(".tg-bottom-nav");
    const isGuestCatalog = !state.isVerified && tabName === "articles";
    shell.classList.toggle("guest-articles-mode", isGuestCatalog);
    if (bottomNav) bottomNav.hidden = isGuestCatalog;
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === `tab-${tabName}`);
    });
    document.querySelectorAll(".tg-tab-item").forEach((pill) => {
      pill.classList.toggle("active", pill.getAttribute("data-route") === `/${tabName}`);
    });
    window.scrollTo(0, 0);
  }

  function renderGuestGate() {
    hideAllTopLevelViews();
    document.getElementById("guestGateView").hidden = false;

    const titleEl = document.getElementById("guestGateTitle");
    const descEl = document.getElementById("guestGateDesc");
    const browserBlock = document.getElementById("guestBrowserBlock");
    const regForm = document.getElementById("guestRegisterForm");
    const statusNotice = document.getElementById("guestStatusNotice");

    if (browserBlock) browserBlock.hidden = true;
    regForm.hidden = true;
    statusNotice.hidden = true;
    statusNotice.className = "guest-status-pill";

    const st = state.userStatus;
    if (st === "blacklisted") {
      titleEl.textContent = "Доступ заблоковано";
      descEl.textContent = "Ваш обліковий запис внесено до чорного списку адміністрацією.";
      statusNotice.textContent = "Ви можете переглядати лише окремі артиклі за прямим посиланням.";
      statusNotice.classList.add("error");
      statusNotice.hidden = false;
    } else if (st === "pending") {
      titleEl.textContent = "Заявка на розгляді";
      descEl.textContent = "Вашу форму реєстрації надіслано. Очікуйте підтвердження адміністратором.";
      statusNotice.textContent = `Подано: ${state.user?.lastName || ""} ${state.user?.firstName || ""}`.trim();
      statusNotice.hidden = false;
    } else if (st === "rejected") {
      titleEl.textContent = "Заявку відхилено";
      descEl.textContent = "Адміністратор відхилив попередню заявку. Ви можете заповнити форму ще раз.";
      regForm.hidden = false;
      document.getElementById("regLastName").value = state.user?.lastName || "";
      document.getElementById("regFirstName").value = state.user?.firstName || "";
      const rb = document.getElementById("regBirthday"); if (rb) rb.value = state.user?.birthday || "";
    } else if (st === "unregistered") {
      titleEl.textContent = "Реєстрація учасника";
      descEl.textContent = "Заповніть Прізвище та Ім'я для підтвердження доступу адміністратором. Після верифікації відкриється повний функціонал.";
      regForm.hidden = false;
      document.getElementById("regLastName").value = state.user?.lastName || "";
      document.getElementById("regFirstName").value = state.user?.firstName || "";
      const rb = document.getElementById("regBirthday"); if (rb) rb.value = state.user?.birthday || "";
    } else {
      if (state.authReason === "wrong_bot_signature") {
        titleEl.textContent = "Відкрито через іншого бота";
        descEl.textContent = "Підпис Telegram належить іншому боту. Відкрийте додаток через основного бота @ES61bot (кнопка меню «ЕС-61 App»).";
      } else {
        titleEl.textContent = "Вхід через браузер заборонено";
        descEl.textContent = "Авторизація та реєстрація доступні лише всередині Telegram-бота. У браузері можна переглядати тільки окремі артиклі за прямим посиланням.";
      }
      if (browserBlock) {
        const tgLink = document.getElementById("guestOpenTgLink");
        if (tgLink && state.botUsername) {
          tgLink.href = `https://t.me/${state.botUsername}`;
          tgLink.textContent = `Відкрити в Telegram (@${state.botUsername})`;
        }
        browserBlock.hidden = false;
      }
    }
  }

  async function openStandaloneArticleBySlug(slug) {
    hideAllTopLevelViews();
    const readerPage = document.getElementById("articleReaderPage");
    const homeBtn = document.getElementById("articleHomeBtn");
    const subjEl = document.getElementById("readArticleSubject");
    const titleEl = document.getElementById("readArticleTitle");
    const metaEl = document.getElementById("readArticleMeta");
    const bodyEl = document.getElementById("readArticleBody");

    // Back button is always visible (returns to previous article or public catalog)
    homeBtn.hidden = false;
    const backTitle = state.navStack.length > 0 ? "Назад" : "До каталогу артиклів";
    homeBtn.setAttribute("title", backTitle);
    homeBtn.setAttribute("aria-label", backTitle);

    let art = (state.articles || []).find(
      (a) => a && ((a.slug && a.slug.toLowerCase() === slug.toLowerCase()) || a.id === slug),
    );
    let privateBlocked = false;

    if (!art) {
      showLoader(true);
      try {
        const res = await apiFetch(`/api/article?slug=${encodeURIComponent(slug)}`);
        if (res.ok && res.article) {
          art = res.article;
          if (typeof res.isVerified === "boolean") {
            state.isVerified = res.isVerified;
          }
        } else if (res && res.error === "private_article") {
          privateBlocked = true;
        }
      } catch {} finally {
        showLoader(false);
      }
    }

    if (privateBlocked) {
      readerPage.hidden = false;
      subjEl.hidden = true;
      titleEl.textContent = "Закритий артикль";
      metaEl.textContent = "Доступ лише для зареєстрованих учасників групи";
      const bot = state.botUsername || "ES61bot";
      bodyEl.innerHTML = `
        <div class="article-private-notice">
          <p>Цей артикль закритий і доступний лише зареєстрованим учасникам групи ЕС-61 у Telegram Mini App.</p>
          <a class="tg-btn tg-btn-primary" href="https://t.me/${escapeAttr(bot)}?startapp=${escapeAttr(slug)}" target="_blank" rel="noopener noreferrer">Відкрити в Telegram (@${escapeHtml(bot)})</a>
        </div>
      `;
      window.scrollTo(0, 0);
      return;
    }

    if (!art) {
      if (state.isVerified) {
        showToast("Артикль не знайдено");
        navigateTo("/articles", true);
      } else {
        readerPage.hidden = false;
        subjEl.hidden = true;
        titleEl.textContent = "Артикль не знайдено";
        metaEl.textContent = "";
        bodyEl.innerHTML = "<p>Перевірте правильність посилання або поверніться до каталогу публічних артиклів.</p>";
      }
      return;
    }

    document.title = `${art.title} · ЕС-61`;
    if (art.subject) {
      subjEl.textContent = art.subject;
      subjEl.hidden = false;
    } else {
      subjEl.hidden = true;
    }

    const dateStr = art.updatedAt ? new Date(art.updatedAt).toLocaleDateString("uk-UA") : "";
    titleEl.textContent = art.title;
    metaEl.textContent = `${art.author || "Адміністратор"}${dateStr ? ` · ${dateStr}` : ""}`;
    bodyEl.innerHTML = art.contentHtml || "<i>Текст порожній</i>";

    // Security: strip any raw <script> tags from article body HTML
    bodyEl.querySelectorAll("script").forEach((s) => s.remove());

    // Hydrate smart internal route links (e.g. /tasks, /slug -> Mini App or Browser URL)
    hydrateSmartLinks(bodyEl);

    // Hydrate Wikipedia-style collapsible blocks (div-based + legacy details)
    bodyEl.querySelectorAll("details.tg-article-spoiler").forEach((det) => {
      if (det.getAttribute("data-default-closed") === "1") det.removeAttribute("open");
    });
    bodyEl.querySelectorAll(".tg-spoiler-block").forEach((blk) => {
      blk.querySelectorAll(".tg-spoiler-del-btn").forEach((b) => b.remove());
      if (blk.getAttribute("data-default-closed") === "1") {
        blk.classList.add("is-collapsed");
      } else {
        blk.classList.remove("is-collapsed");
      }
      const hdr = blk.querySelector(".tg-spoiler-header");
      if (hdr) {
        hdr.addEventListener("click", () => {
          haptic("light");
          blk.classList.toggle("is-collapsed");
        });
      }
    });

    // Hydrate sandboxed live code embeds ONLY inside standalone article reader
    bodyEl.querySelectorAll(".article-code-embed[data-embed-code]").forEach((box) => {
      const b64 = box.getAttribute("data-embed-code") || "";
      const h = Math.max(120, Math.min(1200, Number(box.getAttribute("data-embed-height")) || 320));
      let codeStr = "";
      try {
        codeStr = decodeURIComponent(escape(atob(b64)));
      } catch {
        try { codeStr = atob(b64); } catch {}
      }
      box.innerHTML = "";
      const iframe = document.createElement("iframe");
      iframe.className = "article-code-iframe";
      iframe.style.height = `${h}px`;
      // Strict sandbox: allow-scripts ONLY (opaque null origin -> NO cookies, NO localStorage, NO parent DOM, NO API auth)
      iframe.setAttribute("sandbox", "allow-scripts");
      iframe.setAttribute("referrerpolicy", "no-referrer");
      iframe.srcdoc = codeStr;
      box.appendChild(iframe);
    });

    // Fix relative /api/media/ image URLs if using fallback backend host
    bodyEl.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (src.startsWith("/api/media/")) {
        img.src = resolveMediaUrl(src);
      }
    });

    readerPage.hidden = false;
    window.scrollTo(0, 0);
  }

  function openArticleEditorBySlug(slug = null) {
    if (!state.isAdmin) {
      navigateTo("/articles", true);
      return;
    }
    const art = slug
      ? (state.articles || []).find(
          (a) => a && ((a.slug && a.slug.toLowerCase() === slug.toLowerCase()) || a.id === slug),
        )
      : null;

    state.activeArticleId = art ? art.id : null;
    hideAllTopLevelViews();
    document.getElementById("articleEditorPage").hidden = false;
    document.getElementById("deleteArticleEditorBtn").hidden = !art;

    const defaultAuthor =
      `${state.user?.lastName || ""} ${state.user?.firstName || ""}`.trim() || "Адміністратор";
    document.getElementById("editArticleTitle").value = art ? art.title : "";
    document.getElementById("editArticleAuthor").value = art ? art.author || "" : defaultAuthor;
    populateSubjectSelect(document.getElementById("editArticleSubject"), art ? art.subject || "" : "");
    const pinCb = document.getElementById("editArticlePinned");
    const pubCb = document.getElementById("editArticlePublic");
    if (pinCb) pinCb.checked = Boolean(art && art.isPinned);
    if (pubCb) {
      pubCb.checked = art ? art.isPublic !== false : true;
      updateArticlePublicToggleLabel();
    }

    const bodyEl = document.getElementById("editArticleBody");
    bodyEl.innerHTML = art ? art.contentHtml || "" : "";
    bodyEl.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (src.startsWith("/api/media/")) img.src = resolveMediaUrl(src);
    });
    selectEditorPhoto(null);
    window.scrollTo(0, 0);
  }

  function renderCurrentRoute() {
    const pathname = getNormalizedPath();

    // Admin article editor routes
    if (pathname === "/articles/new") {
      if (!state.isVerified) return renderGuestGate();
      return openArticleEditorBySlug(null);
    }
    if (pathname.startsWith("/articles/edit/")) {
      if (!state.isVerified) return renderGuestGate();
      const slug = decodeURIComponent(pathname.slice("/articles/edit/".length));
      return openArticleEditorBySlug(slug);
    }

    // Root route
    if (pathname === "/") {
      if (!state.isVerified) return renderGuestGate();
      return navigateTo("/home", true);
    }

    // Public articles catalog is accessible to unregistered guests too (public articles only)
    if (pathname === "/articles") {
      document.title = state.isVerified ? "ЕС-61 · Веб-додаток" : "Артиклі · ЕС-61";
      showMainTab("articles");
      renderArticles();
      return;
    }

    // Standard verified app routes
    if (APP_ROUTES.has(pathname)) {
      if (!state.isVerified) return renderGuestGate();
      const tab = pathname.slice(1);
      document.title = "ЕС-61 · Веб-додаток";
      showMainTab(tab);
      if (tab === "home") renderHome();
      else if (tab === "schedule") renderSchedule();
      else if (tab === "tasks") renderTasks();
      else if (tab === "users") { if (!state.isAdmin) { navigateTo("/home", true); return; } renderUsers(); }
      else if (tab === "profile") renderProfile();
      else if (tab === "ai") openAiChatPage();
      return;
    }

    // Any other single-segment path (e.g. /Kartoplya) -> Standalone Telegraph Article Reader!
    const slug = decodeURIComponent(pathname.slice(1));
    openStandaloneArticleBySlug(slug);
  }

  // ==================== /home DASHBOARD ====================
  function renderHome() {
    const u = state.user || {};
    const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Учасник";
    renderAvatarInto(document.getElementById("homeUserAvatar"), u);
    document.getElementById("homeGreeting").textContent = `Привіт, ${u.firstName || name}!`;
    const homePill = document.getElementById("homeAdminPill");
    if (homePill) {
      const rLabel = u.roleLabel || (state.isAdmin ? "Адміністратор" : "");
      const rColor = u.roleColor || "yellow";
      homePill.hidden = !rLabel;
      homePill.textContent = rLabel;
      homePill.className = `admin-crown-pill${rColor ? ` role-badge-${rColor}` : ""}`;
    }


    const sched = state.schedule;
    document.getElementById("homeDateMeta").textContent = sched
      ? `${sched.todayDayName || ""} · ${sched.currentWeek || 1}-й тиждень`
      : "";

    const openTasks = (state.tasks || []).filter((t) => t.status !== "closed");
    document.getElementById("homeTileTasksSub").textContent = `${openTasks.length} відкритих`;
    document.getElementById("homeTileArticlesSub").textContent = `${(state.articles || []).length} публікацій`;
    document.getElementById("homeTileUsersSub").textContent = `${(state.users || []).length} верифікованих`;

    // Today's effective lessons (respecting special dates + one-time events)
    const todayDateStr = sched?.todayDateKyiv || "";
    let todayLessons = Array.isArray(sched?.todayLessons) ? sched.todayLessons : null;
    if (!todayLessons) {
      const rawToday =
        sched && sched.weeks && sched.weeks[String(sched.currentWeek || 1)]?.[sched.todayDayName]
          ? sched.weeks[String(sched.currentWeek || 1)][sched.todayDayName]
          : [];
      todayLessons = rawToday.filter((l) => {
        if (l.hasSpecialDates || (Array.isArray(l.dates) && l.dates.length > 0)) {
          return todayDateStr && Array.isArray(l.dates) && l.dates.includes(todayDateStr);
        }
        return true;
      });
      for (const ev of sched?.oneTimeEvents || []) {
        if (todayDateStr && ev.date === todayDateStr) todayLessons.push(ev);
      }
    }
    const groupedToday = groupLessonsBySlotAndSubject(todayLessons);
    document.getElementById("homeTileScheduleSub").textContent =
      groupedToday.length > 0 ? `Сьогодні пар: ${groupedToday.length}` : "Сьогодні пар немає";

    const nextWrap = document.getElementById("homeNextLessonWrap");
    const nowMin = getKyivNowMinutes();
    const parseMin = (t) => {
      const m = String(t || "").match(/(\d{1,2}):(\d{2})/);
      return m ? Number(m[1]) * 60 + Number(m[2]) : null;
    };

    if (groupedToday.length > 0) {
      let currentLesson = null;
      let upcomingLesson = null;
      for (const grp of groupedToday) {
        const sMin = parseMin(grp.timeStart);
        const eMin = parseMin(grp.timeEnd);
        if (sMin !== null && eMin !== null) {
          if (nowMin >= sMin && nowMin < eMin) {
            currentLesson = grp;
            break;
          }
          if (nowMin < sMin && !upcomingLesson) {
            upcomingLesson = grp;
          }
        } else if (!upcomingLesson) {
          upcomingLesson = grp;
        }
      }

      if (currentLesson) {
        const linksHtml = renderLessonLinksHtml(currentLesson);
        nextWrap.innerHTML = `
          <div class="tg-section-card next-lesson-card">
            <div class="home-status-badge live"><span class="home-live-dot"></span><span>Зараз йде пара · ${escapeHtml(currentLesson.timeStart || "")}${currentLesson.timeEnd ? `–${escapeHtml(currentLesson.timeEnd)}` : ""}</span></div>
            <div class="meta-value" style="margin-top:4px;">${escapeHtml(currentLesson.name)} <span class="meta-sub">(${escapeHtml(currentLesson.type || "Пара")})</span></div>
            ${linksHtml ? `<div class="lesson-links-row" style="margin-top:8px;">${linksHtml}</div>` : ""}
          </div>
        `;
      } else if (upcomingLesson) {
        const linksHtml = renderLessonLinksHtml(upcomingLesson);
        nextWrap.innerHTML = `
          <div class="tg-section-card next-lesson-card">
            <div class="home-status-badge"><span>Наступна пара · ${escapeHtml(upcomingLesson.timeStart || "")}${upcomingLesson.timeEnd ? `–${escapeHtml(upcomingLesson.timeEnd)}` : ""}</span></div>
            <div class="meta-value" style="margin-top:4px;">${escapeHtml(upcomingLesson.name)} <span class="meta-sub">(${escapeHtml(upcomingLesson.type || "Пара")})</span></div>
            ${linksHtml ? `<div class="lesson-links-row" style="margin-top:8px;">${linksHtml}</div>` : ""}
          </div>
        `;
      } else {
        nextWrap.innerHTML = `
          <div class="tg-section-card next-lesson-card">
            <div class="home-status-badge ended"><span>Розклад на сьогодні</span></div>
            <div class="meta-value" style="margin-top:4px;">Пари на сьогодні закінчились</div>
          </div>
        `;
      }
    } else {
      nextWrap.innerHTML = `
        <div class="tg-section-card next-lesson-card">
          <div class="home-status-badge ended"><span>Розклад на сьогодні</span></div>
          <div class="meta-value" style="margin-top:4px;">Сьогодні пар немає</div>
        </div>
      `;
    }

    const recentEl = document.getElementById("homeRecentSection");
    const recentHtml = [];
    if (openTasks.length > 0) {
      const t = openTasks[0];
      recentHtml.push(`
        <div class="tg-section-header"><span>Актуальне завдання</span></div>
        <div class="tg-section-card" style="cursor:pointer;" id="homeQuickTaskCard">
          <div class="task-top">
            <div class="task-title">${escapeHtml(t.title)}</div>
            <span class="task-status-pill open">Відкрито</span>
          </div>
          <div class="meta-sub" style="margin-top:4px;">${escapeHtml(formatCountdown(t.deadlineMs, t.status))}</div>
        </div>
      `);
    }
    recentEl.innerHTML = recentHtml.join("");
    const quickTask = document.getElementById("homeQuickTaskCard");
    if (quickTask) quickTask.addEventListener("click", () => navigateTo("/tasks"));
  }

  // ==================== SCHEDULE ====================
  function groupLessonsBySlotAndSubject(lessons) {
    const groups = [];
    const map = new Map();
    for (const l of lessons || []) {
      const key = `${l.pair || ""}|${l.timeStart || ""}|${(l.name || "").trim()}|${(l.type || "").trim()}`;
      if (!map.has(key)) {
        const grp = {
          pair: l.pair,
          timeStart: l.timeStart,
          timeEnd: l.timeEnd,
          name: l.name,
          type: l.type,
          description: l.description || "",
          dates: Array.isArray(l.dates) ? [...l.dates] : [],
          subgroups: Array.isArray(l.subgroups) ? [...l.subgroups] : [],
          isCustom: Boolean(l.isCustom),
          id: l.id || null,
          sourceKey: l.sourceKey || null,
          items: [],
        };
        map.set(key, grp);
        groups.push(grp);
      }
      const grp = map.get(key);
      if (l.description && !grp.description) grp.description = l.description;
      if (Array.isArray(l.dates)) {
        for (const d of l.dates) if (!grp.dates.includes(d)) grp.dates.push(d);
      }
      if (Array.isArray(l.subgroups) && l.subgroups.length > 0 && grp.subgroups.length === 0) {
        grp.subgroups = [...l.subgroups];
      }
      const dup = grp.items.some((x) => x.lecturer === l.lecturer && x.room === l.room && x.link === l.link);
      if (!dup) grp.items.push(l);
    }
    return groups;
  }

  function getKyivNowMinutes() {
    try {
      const fmt = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Kyiv",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const parts = fmt.formatToParts(new Date());
      const h = Number(parts.find((p) => p.type === "hour")?.value || 0);
      const m = Number(parts.find((p) => p.type === "minute")?.value || 0);
      return h * 60 + m;
    } catch {
      const d = new Date();
      return d.getHours() * 60 + d.getMinutes();
    }
  }

  function getCalendarDateForWeekDay(sched, selectedWeek, selectedDay) {
    if (!sched || !sched.todayDateKyiv) return null;
    const m = String(sched.todayDateKyiv).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const todayUtc = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0));
    const todayDow = (todayUtc.getUTCDay() + 6) % 7; // 0=Mon..6=Sun
    const targetDow = DAYS_ORDER.indexOf(selectedDay);
    if (targetDow < 0) return null;
    const curWeek = Number(sched.currentWeek || 1);
    const selWeek = Number(selectedWeek || 1);
    const weekOffsetDays = selWeek === curWeek ? 0 : 7;
    const diffDays = targetDow - todayDow + weekOffsetDays;
    const targetUtc = new Date(todayUtc.getTime() + diffDays * 86400000);
    const y = targetUtc.getUTCFullYear();
    const mo = String(targetUtc.getUTCMonth() + 1).padStart(2, "0");
    const da = String(targetUtc.getUTCDate()).padStart(2, "0");
    return `${y}-${mo}-${da}`;
  }

  function buildLessonLinkAnchor(rawUrl, label) {
    const internalRoute = extractInternalRoute(rawUrl);
    if (internalRoute) {
      const resolved = resolveSmartRouteUrl(internalRoute);
      return `<a href="${escapeAttr(resolved)}" data-internal-route="${escapeAttr(internalRoute)}" class="lesson-join-btn">${ICONS.link}<span>${escapeHtml(label)}</span></a>`;
    }
    return `<a href="${escapeAttr(rawUrl)}" target="_blank" rel="noopener noreferrer" class="lesson-join-btn">${ICONS.link}<span>${escapeHtml(label)}</span></a>`;
  }

  function renderLessonLinksHtml(grp) {
    if (grp.subgroups && grp.subgroups.length > 0) {
      return grp.subgroups
        .filter((sg) => sg && sg.link)
        .map((sg) => buildLessonLinkAnchor(sg.link, sg.name || "Підгрупа"))
        .join("");
    }
    const links = Array.from(new Set((grp.items || []).map((i) => i.link).filter(Boolean)));
    return links
      .map((lnk, idx) => buildLessonLinkAnchor(lnk, links.length > 1 ? `Пара (${idx + 1})` : "Перейти на пару"))
      .join("");
  }

  function getLessonTypeClass(type) {
    const t = String(type || "").toLowerCase();
    if (t.includes("лек")) return "type-lec";
    if (t.includes("лаб")) return "type-lab";
    if (t.includes("прак") || t.includes("сем")) return "type-prac";
    if (t.includes("екз") || t.includes("зал")) return "type-exam";
    return "type-other";
  }

  function renderSchedule() {
    const sched = state.schedule;
    if (!sched) return;

    document.getElementById("scheduleAdminBar").hidden = !state.isAdmin;
    const notifBtn = document.getElementById("openNotifSettingsBtn");
    if (notifBtn) {
      const grpOn = Boolean(sched.notificationSettings?.enabled);
      notifBtn.textContent = grpOn ? "Сповіщення в чат: Увімк" : "Сповіщення в чат: Вимк";
    }
    document.getElementById("week1Badge").hidden = Number(sched.currentWeek) !== 1;
    document.getElementById("week2Badge").hidden = Number(sched.currentWeek) !== 2;

    document.querySelectorAll("#tab-schedule .week-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-week") === String(state.selectedWeek));
    });

    const daysStrip = document.getElementById("daysStrip");
    daysStrip.innerHTML = "";
    for (const day of DAYS_ORDER) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "day-pill";
      if (day === sched.todayDayName) btn.classList.add("today");
      if (day === state.selectedDay) btn.classList.add("active");
      btn.textContent = DAYS_SHORT[day] || day;
      btn.addEventListener("click", () => {
        haptic("light");
        state.selectedDay = day;
        renderSchedule();
      });
      daysStrip.appendChild(btn);
    }

    // One-time upcoming events section
    const oneTimeWrap = document.getElementById("oneTimeEventsWrap");
    const oneTimeList = (sched.oneTimeEvents || []).filter(
      (e) => !e.date || !sched.todayDateKyiv || e.date >= sched.todayDateKyiv,
    );
    if (oneTimeList.length > 0) {
      oneTimeWrap.innerHTML = `
        <div class="tg-section-header" style="margin-bottom:6px;"><span>Одноразові події</span></div>
        <div class="lessons-list">
          ${oneTimeList
            .map(
              (ev) => `
            <div class="lesson-card">
              <div class="lesson-time-col">
                <div class="lesson-pair-num">${escapeHtml(formatUkDate(ev.date))}</div>
                <div class="lesson-time-start">${escapeHtml(ev.timeStart || "")}</div>
                <div class="lesson-time-end">${escapeHtml(ev.timeEnd || "")}</div>
              </div>
              <div class="lesson-body">
                <div class="lesson-top-row">
                  <div class="lesson-badges">
                    <span class="lesson-badge ${getLessonTypeClass(ev.type)}">${escapeHtml(ev.type)}</span>
                    <span class="lesson-badge count-pill">Одноразова</span>
                  </div>
                  ${
                    state.isAdmin
                      ? `<div class="lesson-admin-mini">
                          <button type="button" class="mini-icon-btn" data-edit-custom="${escapeAttr(ev.id)}" title="Редагувати">${ICONS.edit}</button>
                          <button type="button" class="mini-icon-btn danger" data-del-custom="${escapeAttr(ev.id)}" title="Видалити">${ICONS.trash}</button>
                        </div>`
                      : ""
                  }
                </div>
                <div class="meta-value">${escapeHtml(ev.name)}</div>
                ${ev.lecturer ? `<div class="meta-sub">${escapeHtml(ev.lecturer)}</div>` : ""}
                ${ev.room ? `<div class="meta-sub">${ICONS.pin} ${escapeHtml(ev.room)}</div>` : ""}
                ${ev.description ? `<div class="lesson-desc">${escapeHtml(ev.description)}</div>` : ""}
                <div class="lesson-links-row">${renderLessonLinksHtml({ items: [ev], subgroups: ev.subgroups })}</div>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      `;
    } else {
      oneTimeWrap.innerHTML = "";
    }

    const selectedDateStr = getCalendarDateForWeekDay(sched, state.selectedWeek, state.selectedDay);
    const todayDateStr = sched.todayDateKyiv || "";
    const rawLessonsAll =
      (sched.weeks && sched.weeks[state.selectedWeek] && sched.weeks[state.selectedWeek][state.selectedDay]) || [];
    const rawLessons = rawLessonsAll
      .map((l) => {
        const futureDates = Array.isArray(l.dates)
          ? l.dates.filter((d) => !todayDateStr || String(d) >= todayDateStr)
          : [];
        return { ...l, dates: futureDates };
      })
      .filter((l) => {
        // Якщо у пари є спецдати — показувати її лише для відповідної дати
        if (l.hasSpecialDates || l.dates.length > 0) {
          if (!selectedDateStr) return l.dates.length > 0;
          return l.dates.includes(selectedDateStr);
        }
        return true;
      });
    const grouped = groupLessonsBySlotAndSubject(rawLessons);

    const container = document.getElementById("lessonsContainer");
    container.innerHTML = "";

    if (!grouped.length) {
      const empty = document.createElement("div");
      empty.className = "tg-empty-state";
      empty.textContent = sched.lastError
        ? `Немає пар або очікується оновлення (${sched.lastError})`
        : `На ${state.selectedDay.toLowerCase()} (${state.selectedWeek}-й тиждень) пар немає`;
      container.appendChild(empty);
    } else {
      for (const grp of grouped) {
        const card = document.createElement("div");
        card.className = "lesson-card";
        const typeClass = getLessonTypeClass(grp.type);
        const primaryItem = grp.items[0] || {};

        const subItemsHtml = grp.items
          .map((item, idx) => {
            const hasLecturer = Boolean(item.lecturer && item.lecturer.trim());
            const lecturerBtn = hasLecturer
              ? `<button type="button" class="entity-link-btn" data-open-entity="lecturer" data-entity-name="${escapeAttr(item.lecturer)}">${ICONS.user}<span>${escapeHtml(item.lecturer)}</span></button>`
              : "";
            const roomTag = item.room ? `<span class="lesson-room-tag">${ICONS.pin}<span>${escapeHtml(item.room)}</span></span>` : "";
            if (!hasLecturer && !roomTag) return "";
            const prefix = grp.items.length > 1 ? `<b>${idx + 1}.</b> ` : "";
            return `
              <div class="lesson-subitem">
                ${hasLecturer ? `<div class="lesson-subitem-row">${prefix}${lecturerBtn}</div>` : ""}
                ${roomTag ? `<div class="lesson-subitem-row">${!hasLecturer ? prefix : ""}${roomTag}</div>` : ""}
              </div>
            `;
          })
          .filter(Boolean)
          .join("");

        const linksHtml = renderLessonLinksHtml(grp);
        const datesHtml = "";

        card.innerHTML = `
          <div class="lesson-time-col">
            <div class="lesson-pair-num">${grp.pair || "—"} пара</div>
            <div class="lesson-time-start">${escapeHtml(grp.timeStart || "")}</div>
            <div class="lesson-time-end">${escapeHtml(grp.timeEnd || "")}</div>
          </div>
          <div class="lesson-body">
            <div class="lesson-top-row">
              <div class="lesson-badges">
                <span class="lesson-badge ${typeClass}">${escapeHtml(grp.type || "Пара")}</span>
                ${grp.isCustom ? `<span class="lesson-badge count-pill">Додано вручну</span>` : ""}
              </div>
              ${
                state.isAdmin
                  ? `<div class="lesson-admin-mini">
                      <button type="button" class="mini-icon-btn" data-edit-lesson="1" title="Редагувати">${ICONS.edit}</button>
                      <button type="button" class="mini-icon-btn danger" data-del-lesson="1" title="Видалити">${ICONS.trash}</button>
                    </div>`
                  : ""
              }
            </div>
            <button type="button" class="lesson-title-btn" data-open-entity="subject" data-entity-name="${escapeAttr(grp.name || "Дисципліна")}">
              ${escapeHtml(grp.name || "Дисципліна")}
            </button>
            ${grp.description ? `<div class="lesson-desc">${escapeHtml(grp.description)}</div>` : ""}
            <div class="lesson-subgroups">${subItemsHtml}</div>
            ${datesHtml}
            ${linksHtml ? `<div class="lesson-links-row">${linksHtml}</div>` : ""}
          </div>
        `;

        if (state.isAdmin) {
          const editBtn = card.querySelector("[data-edit-lesson]");
          const delBtn = card.querySelector("[data-del-lesson]");
          if (editBtn) {
            editBtn.addEventListener("click", () => {
              openScheduleEventModal({
                ...primaryItem,
                week: state.selectedWeek,
                day: state.selectedDay,
                subgroups: grp.subgroups,
                replacesSourceKey: grp.isCustom ? null : grp.sourceKey,
              });
            });
          }
          if (delBtn) {
            delBtn.addEventListener("click", async () => {
              if (!confirm(`Видалити "${grp.name}" з розкладу?`)) return;
              try {
                const res = await apiFetch("/api/schedule/event/delete", {
                  method: "POST",
                  body: JSON.stringify({
                    id: grp.isCustom ? grp.id : null,
                    sourceKey: grp.isCustom ? null : grp.sourceKey,
                  }),
                });
                if (!res.ok) throw new Error(res.error || "Помилка видалення");
                state.schedule = res.schedule;
                renderSchedule();
                showToast("Пару видалено з розкладу");
              } catch (err) {
                showToast(err.message);
              }
            });
          }
        }

        container.appendChild(card);
      }

      container.querySelectorAll("[data-open-entity]").forEach((btn) => {
        btn.addEventListener("click", () => {
          haptic("light");
          openEntityProfile(btn.getAttribute("data-open-entity"), btn.getAttribute("data-entity-name"));
        });
      });
    }

    // Bind one-time event edit/delete
    oneTimeWrap.querySelectorAll("[data-edit-custom]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-edit-custom");
        const ev = (sched.oneTimeEvents || []).find((x) => x.id === id);
        if (ev) openScheduleEventModal(ev);
      });
    });
    oneTimeWrap.querySelectorAll("[data-del-custom]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-del-custom");
        if (!confirm("Видалити одноразову подію?")) return;
        try {
          const res = await apiFetch("/api/schedule/event/delete", {
            method: "POST",
            body: JSON.stringify({ id }),
          });
          if (!res.ok) throw new Error(res.error || "Помилка");
          state.schedule = res.schedule;
          renderSchedule();
          showToast("Подію видалено");
        } catch (err) {
          showToast(err.message);
        }
      });
    });

    document.getElementById("lastSyncedText").textContent = sched.lastSyncedKyiv
      ? `Останнє оновлення: ${sched.lastSyncedKyiv}`
      : "Останнє оновлення: ще не виконано";
  }

  // ==================== TASKS (WITH SUBJECT BINDING & FILTER) ====================
  function renderSubjectFilterStrip(containerEl, items, activeSubject, onChange) {
    if (!containerEl) return;
    const subjects = Array.from(new Set(items.map((x) => x.subject).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, "uk"),
    );
    if (!subjects.length) {
      containerEl.innerHTML = "";
      return;
    }
    const all = [{ label: "Усі", val: "" }, ...subjects.map((s) => ({ label: s, val: s }))];
    containerEl.innerHTML = all
      .map(
        (c) =>
          `<button type="button" class="filter-chip ${activeSubject === c.val ? "active" : ""}" data-filter-val="${escapeAttr(c.val)}">${escapeHtml(c.label)}</button>`,
      )
      .join("");
    containerEl.querySelectorAll("[data-filter-val]").forEach((btn) => {
      btn.addEventListener("click", () => {
        haptic("light");
        onChange(btn.getAttribute("data-filter-val"));
      });
    });
  }

  function openTaskSubmissionsModal(task) {
    if (!task) return;
    const modal = document.getElementById("taskSubmissionsModal");
    const titleEl = document.getElementById("taskSubsTitle");
    const subjEl = document.getElementById("taskSubsSubjectLabel");
    const bodyEl = document.getElementById("taskSubsBody");
    if (!modal || !bodyEl) return;

    titleEl.textContent = task.title || "Завдання";
    if (task.subject) {
      subjEl.textContent = task.subject;
      subjEl.hidden = false;
    } else {
      subjEl.hidden = true;
    }

    const submitted = Array.isArray(task.submittedUsers) ? task.submittedUsers : [];
    const notSubmitted = Array.isArray(task.notSubmittedUsers) ? task.notSubmittedUsers : [];

    const doneListHtml = submitted.length
      ? submitted
          .map((u, i) => `<div class="task-subs-item">${i + 1}. ${escapeHtml(u.fullName)}</div>`)
          .join("")
      : '<div class="meta-sub">Поки ніхто не здав</div>';

    const missListHtml = notSubmitted.length
      ? notSubmitted
          .map((u, i) => `<div class="task-subs-item">${i + 1}. ${escapeHtml(u.fullName)}</div>`)
          .join("")
      : '<div class="meta-sub">Усі здали!</div>';

    bodyEl.innerHTML = `
      <div class="task-subs-section">
        <div class="task-subs-head done"><span>Здало: ${submitted.length}</span></div>
        <div class="task-subs-list">${doneListHtml}</div>
      </div>
      <div class="task-subs-section">
        <div class="task-subs-head missing"><span>Не здало: ${notSubmitted.length}</span></div>
        <div class="task-subs-list">${missListHtml}</div>
      </div>
    `;
    modal.hidden = false;
  }

  document.getElementById("closeTaskSubsModalBtn")?.addEventListener("click", () => {
    const m = document.getElementById("taskSubmissionsModal");
    if (m) m.hidden = true;
  });
  document.getElementById("taskSubmissionsModal")?.addEventListener("click", (e) => {
    if (e.target.id === "taskSubmissionsModal") e.target.hidden = true;
  });

  function renderTasks() {
    const allTasks = state.tasks || [];
    renderSubjectFilterStrip(
      document.getElementById("tasksSubjectFilter"),
      allTasks,
      state.tasksSubjectFilter,
      (val) => {
        state.tasksSubjectFilter = val;
        renderTasks();
      },
    );

    const tasks = state.tasksSubjectFilter
      ? allTasks.filter((t) => t.subject === state.tasksSubjectFilter)
      : allTasks;

    document.getElementById("tasksCountPill").textContent = String(tasks.length);
    const container = document.getElementById("tasksContainer");
    container.innerHTML = "";

    if (!tasks.length) {
      container.innerHTML = '<div class="tg-empty-state">Завдань поки немає</div>';
      return;
    }

    for (const task of tasks) {
      const card = document.createElement("div");
      const isClosed = task.status === "closed";
      const isSelected = state.isAdmin && state.selectedTaskId === task.id;
      card.className = `task-card${isSelected ? " task-card-selected" : ""}${isClosed ? " is-closed-task" : ""}`;
      card.setAttribute("data-task-id", task.id);

      const badges = [];
      badges.push(
        `<span class="task-status-pill ${isClosed ? "closed" : "open"}">${isClosed ? "Закрито" : "Відкрито"}</span>`,
      );
      if (task.isSubmittedByMe) {
        badges.push(`<span class="task-status-pill submitted">${ICONS.check} Здано</span>`);
      }

      const closeBtnHtml = isSelected
        ? `<button type="button" class="task-longpress-close-btn" data-task-close-del="${escapeAttr(task.id)}" title="${isClosed ? "Видалити завдання назавжди" : "Закрити завдання"}">✕</button>`
        : "";
      const selectedHintHtml = isSelected
        ? `<div class="task-longpress-hint">${isClosed ? "Натисніть ✕ щоб видалити назавжди" : "Натисніть ✕ щоб закрити завдання"}</div>`
        : "";

      card.innerHTML = `
        ${closeBtnHtml}
        ${task.subject ? `<span class="subject-tag-pill">${escapeHtml(task.subject)}</span>` : ""}
        <div class="task-top" style="${isSelected ? "padding-right:34px;" : ""}">
          <div class="task-title">${escapeHtml(task.title)}</div>
          <div style="display:flex; gap:5px; flex-wrap:wrap;">${badges.join("")}</div>
        </div>
        ${selectedHintHtml}
        <div class="meta-sub">
          <span class="meta-sub-inline">${ICONS.clock}<span>${escapeHtml(formatCountdown(task.deadlineMs, task.status))}</span></span> · <span class="meta-sub-inline">${ICONS.file}<span>Здано робіт: <b>${task.submissionsCount}</b></span></span>
        </div>
        ${
          task.mySubmission
            ? `<div class="meta-sub">Ваш файл: <code>${escapeHtml(task.mySubmission.renamedFileName)}</code></div>`
            : ""
        }
        <div class="task-actions">
          ${
            !isClosed
              ? `<button class="tg-btn tg-btn-primary tg-btn-sm" type="button" data-bot-task="${escapeAttr(task.id)}">${ICONS.upload}<span>Здати</span></button>`
              : ""
          }
          ${
            state.isAdmin && task.submissionsCount > 0
              ? `<button class="tg-btn tg-btn-secondary tg-btn-sm" type="button" data-bot-archive="${escapeAttr(task.id)}">${ICONS.archive}<span>Архів</span></button>`
              : ""
          }
          ${
            state.isAdmin
              ? `<button class="tg-btn tg-btn-secondary tg-btn-sm" type="button" data-bind-task-subject="${escapeAttr(task.id)}">Предмет</button>`
              : ""
          }
        </div>
      `;
      let didLongPress = false;
      if (state.isAdmin) {
        let pressTimer = null;
        let startX = 0;
        let startY = 0;
        const cancelPress = () => {
          if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
          }
        };
        card.addEventListener("pointerdown", (ev) => {
          if (ev.target.closest("button, a, input, select")) return;
          didLongPress = false;
          startX = ev.clientX;
          startY = ev.clientY;
          cancelPress();
          pressTimer = setTimeout(() => {
            pressTimer = null;
            didLongPress = true;
            haptic("medium");
            state.selectedTaskId = state.selectedTaskId === task.id ? null : task.id;
            renderTasks();
          }, 1000);
        });
        card.addEventListener("pointermove", (ev) => {
          if (!pressTimer) return;
          if (Math.abs(ev.clientX - startX) > 10 || Math.abs(ev.clientY - startY) > 10) {
            cancelPress();
          }
        });
        card.addEventListener("pointerup", cancelPress);
        card.addEventListener("pointercancel", cancelPress);
        card.addEventListener("pointerleave", cancelPress);
      }
      card.addEventListener("click", (ev) => {
        if (didLongPress) {
          didLongPress = false;
          return;
        }
        if (ev.target.closest("button, a, input, select")) return;
        haptic("light");
        openTaskSubmissionsModal(task);
      });
      container.appendChild(card);
    }

    container.querySelectorAll("[data-task-close-del]").forEach((btn) => {
      btn.addEventListener("click", async (ev) => {
        ev.stopPropagation();
        const tid = btn.getAttribute("data-task-close-del");
        btn.disabled = true;
        try {
          const res = await apiFetch("/api/tasks/close-or-delete", {
            method: "POST",
            body: JSON.stringify({ taskId: tid }),
          });
          if (!res.ok) throw new Error(res.error || "Помилка");
          state.tasks = res.tasks || [];
          state.selectedTaskId = null;
          renderTasks();
          renderHome();
          showToast(res.action === "deleted" ? "Завдання видалено назавжди" : "Завдання закрито");
        } catch (err) {
          btn.disabled = false;
          showToast(err.message);
        }
      });
    });

    container.querySelectorAll("[data-bot-task]").forEach((btn) => {
      btn.addEventListener("click", () => openBotDeepLink(`task_${btn.getAttribute("data-bot-task")}`));
    });
    container.querySelectorAll("[data-bot-archive]").forEach((btn) => {
      btn.addEventListener("click", () => openBotDeepLink(`archive_${btn.getAttribute("data-bot-archive")}`));
    });
    container.querySelectorAll("[data-bind-task-subject]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-bind-task-subject");
        const task = (state.tasks || []).find((t) => t.id === id);
        if (!task) return;
        state.activeTaskSubjectId = id;
        document.getElementById("taskSubjectTargetTitle").textContent = task.title;
        populateSubjectSelect(document.getElementById("taskSubjectSelect"), task.subject || "");
        document.getElementById("taskSubjectModal").hidden = false;
      });
    });
  }

  // ==================== ARTICLES LIST ====================
  function renderArticles() {
    document.getElementById("newArticleBtn").hidden = !state.isAdmin;
    const rawArticles = (state.articles || []).filter((a) => state.isVerified || (a && a.isPublic !== false));
    const allArticles = [...rawArticles].sort((a, b) => {
      const pinDiff = (b && b.isPinned ? 1 : 0) - (a && a.isPinned ? 1 : 0);
      if (pinDiff !== 0) return pinDiff;
      return Number((b && (b.updatedAt || b.createdAt)) || 0) - Number((a && (a.updatedAt || a.createdAt)) || 0);
    });

    renderSubjectFilterStrip(
      document.getElementById("articlesSubjectFilter"),
      allArticles,
      state.articlesSubjectFilter,
      (val) => {
        state.articlesSubjectFilter = val;
        renderArticles();
      },
    );

    const list = state.articlesSubjectFilter
      ? allArticles.filter((a) => a.subject === state.articlesSubjectFilter)
      : allArticles;

    const container = document.getElementById("articlesContainer");
    container.innerHTML = "";

    if (!list.length) {
      container.innerHTML = `<div class="tg-empty-state">${
        state.isAdmin
          ? "Артиклів ще немає. Натисніть «Створити»!"
          : state.isVerified
            ? "Артиклів поки немає."
            : "Публічних артиклів поки немає."
      }</div>`;
      return;
    }

    const pinSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>';
    const lockSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';

    for (const art of list) {
      const card = document.createElement("div");
      card.className = `article-card${art.isPinned ? " is-pinned" : ""}`;
      const tmp = document.createElement("div");
      tmp.innerHTML = art.contentHtml || "";
      const plain = (tmp.textContent || "").trim().slice(0, 140);
      const dateStr = art.updatedAt ? new Date(art.updatedAt).toLocaleDateString("uk-UA") : "";
      const slug = art.slug || art.id;
      const isPrivate = art.isPublic === false;

      const badges = [];
      if (art.isPinned) badges.push(`<span class="article-pin-badge">${pinSvg}<span>Закріплено</span></span>`);
      if (isPrivate) badges.push(`<span class="article-private-badge">${lockSvg}<span>Закритий</span></span>`);
      if (art.subject) badges.push(`<span class="subject-tag-pill">${escapeHtml(art.subject)}</span>`);

      card.innerHTML = `
        <div class="article-card-main" data-open-slug="${escapeAttr(slug)}">
          ${badges.length ? `<div class="article-badges-row">${badges.join("")}</div>` : ""}
          <div class="article-card-title">${escapeHtml(art.title)}</div>
          <div class="article-card-slug">/${escapeHtml(slug)}</div>
          <div class="meta-sub">${escapeHtml(art.author || "Адміністратор")}${dateStr ? ` · ${dateStr}` : ""}</div>
          ${plain ? `<div class="article-card-excerpt">${escapeHtml(plain)}${plain.length >= 140 ? "…" : ""}</div>` : ""}
        </div>
        <div class="article-card-actions">
          <button type="button" class="tg-btn tg-btn-secondary tg-btn-sm" data-copy-slug="${escapeAttr(slug)}">${ICONS.link}<span>Посилання</span></button>
          ${
            state.isAdmin
              ? `<button type="button" class="tg-btn tg-btn-secondary tg-btn-sm${art.isPinned ? " is-active-pin" : ""}" data-pin-article="${escapeAttr(art.id)}" title="${art.isPinned ? "Відкріпити" : "Закріпити зверху"}">${pinSvg}<span>${art.isPinned ? "Відкріпити" : "Закріпити"}</span></button>
                 <button type="button" class="tg-btn tg-btn-secondary tg-btn-sm" data-edit-slug="${escapeAttr(slug)}">${ICONS.edit}<span>Редагувати</span></button>
                 <button type="button" class="tg-btn tg-btn-danger tg-btn-sm" data-del-article="${escapeAttr(art.id)}">${ICONS.trash}<span>Видалити</span></button>`
              : ""
          }
        </div>
      `;
      container.appendChild(card);
    }

    container.querySelectorAll("[data-open-slug]").forEach((el) => {
      el.addEventListener("click", () => {
        haptic("light");
        navigateTo(`/${encodeURIComponent(el.getAttribute("data-open-slug"))}`);
      });
    });
    container.querySelectorAll("[data-copy-slug]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const slugVal = btn.getAttribute("data-copy-slug") || "";
        const url = resolveSmartRouteUrl(`/${slugVal}`);
        try {
          await navigator.clipboard.writeText(url);
          showToast(isTelegramMiniApp() ? "Telegram-посилання скопійовано!" : "Посилання скопійовано!");
        } catch {
          showToast(url);
        }
      });
    });
    container.querySelectorAll("[data-pin-article]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-pin-article");
        btn.disabled = true;
        try {
          const res = await apiFetch("/api/articles/toggle-pin", {
            method: "POST",
            body: JSON.stringify({ id }),
          });
          if (!res.ok) throw new Error(res.error || "Помилка");
          state.articles = res.articles || [];
          haptic("light");
          renderArticles();
          showToast(res.article?.isPinned ? "Артикль закріплено зверху" : "Артикль відкріплено");
        } catch (err) {
          btn.disabled = false;
          showToast(err.message);
        }
      });
    });
    container.querySelectorAll("[data-edit-slug]").forEach((btn) => {
      btn.addEventListener("click", () => {
        navigateTo(`/articles/edit/${encodeURIComponent(btn.getAttribute("data-edit-slug"))}`);
      });
    });
    container.querySelectorAll("[data-del-article]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("Видалити цей артикль?")) return;
        const id = btn.getAttribute("data-del-article");
        try {
          const res = await apiFetch("/api/articles/delete", {
            method: "POST",
            body: JSON.stringify({ id }),
          });
          if (!res.ok) throw new Error(res.error || "Помилка видалення");
          state.articles = res.articles || [];
          renderArticles();
          showToast("Артикль видалено");
        } catch (err) {
          showToast(err.message);
        }
      });
    });
  }

  // ==================== USERS DIRECTORY & MODERATION (/users) ====================
  function updatePendingIndicator() {
    document.querySelectorAll('[data-route="/users"]').forEach((el) => {
      el.hidden = !state.isAdmin;
    });
    const count = (state.pendingUsers || []).length;
    const dot = document.getElementById("pendingUsersDot");
    if (dot) dot.hidden = !(state.isAdmin && count > 0);
    const pPill = document.getElementById("pendingCountPill");
    if (pPill) pPill.textContent = String(count);
    const bPill = document.getElementById("blacklistCountPill");
    if (bPill) bPill.textContent = String((state.blacklistedUsers || []).length);
  }

  async function runUserAction(userId, action, confirmText = "") {
    if (confirmText && !confirm(confirmText)) return;
    try {
      const res = await apiFetch("/api/users/action", {
        method: "POST",
        body: JSON.stringify({ userId, action }),
      });
      if (!res.ok) throw new Error(res.error || "Помилка дії");
      state.users = res.users || [];
      state.pendingUsers = res.pendingUsers || [];
      state.blacklistedUsers = res.blacklistedUsers || [];
      updatePendingIndicator();
      renderUsers();
      showToast("Статус користувача оновлено");
    } catch (err) {
      showToast(err.message);
    }
  }

  function renderUsers() {
    const adminTabs = document.getElementById("usersAdminTabs");
    adminTabs.hidden = !state.isAdmin;
    if (!state.isAdmin) state.usersTab = "verified";

    adminTabs.querySelectorAll("[data-users-tab]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-users-tab") === state.usersTab);
    });

    updatePendingIndicator();

    const list =
      state.usersTab === "pending"
        ? state.pendingUsers || []
        : state.usersTab === "blacklisted"
          ? state.blacklistedUsers || []
          : state.users || [];

    document.getElementById("usersCountPill").textContent = String((state.users || []).length);
    const container = document.getElementById("usersContainer");
    container.innerHTML = "";

    if (!list.length) {
      const emptyMsgs = {
        verified: "Верифікованих учасників поки немає",
        pending: "Нових заявок на реєстрацію немає",
        blacklisted: "Чорний список порожній",
      };
      container.innerHTML = `<div class="tg-empty-state">${emptyMsgs[state.usersTab]}</div>`;
      return;
    }

    for (const u of list) {
      const card = document.createElement("div");
      card.className = "user-card";
      const fullName = `${u.lastName || ""} ${u.firstName || ""}`.trim() || `ID ${u.userId}`;
      const subParts = [];
      if (u.username) subParts.push(`@${u.username}`);
      subParts.push(`ID ${u.userId}`);
      const subText = subParts.join(" · ");

      const isSelf = String(u.userId) === String(state.user?.userId || "");
      const canEditProfile = state.isOwner || (state.isAdmin && (!u.isAdmin || isSelf));
      const canModerate = (state.isOwner && !isSelf && !u.isOwner) || (state.isAdmin && !u.isAdmin);

      let actionsHtml = "";
      let manageToggleHtml = "";
      if (state.usersTab === "verified" && (canEditProfile || canModerate)) {
        manageToggleHtml = `<button type="button" class="mini-icon-btn" data-toggle-u-menu="${escapeAttr(u.userId)}" title="Керувати">•••</button>`;
        actionsHtml = `
          <div class="user-card-actions" data-u-menu="${escapeAttr(u.userId)}" hidden>
            ${canEditProfile ? `<button type="button" class="tg-btn tg-btn-secondary tg-btn-sm" data-u-edit="${escapeAttr(u.userId)}">Редагувати</button>` : ""}
            ${canModerate ? `<button type="button" class="tg-btn tg-btn-danger tg-btn-sm" data-u-act="delete" data-u-id="${escapeAttr(u.userId)}" data-u-name="${escapeAttr(fullName)}">Видалити</button>` : ""}
            ${canModerate ? `<button type="button" class="tg-btn tg-btn-secondary tg-btn-sm" data-u-act="blacklist" data-u-id="${escapeAttr(u.userId)}" data-u-name="${escapeAttr(fullName)}">У ЧС</button>` : ""}
          </div>
        `;
      } else if (state.usersTab === "pending" && canModerate) {
        actionsHtml = `
          <div class="user-card-actions">
            <button type="button" class="tg-btn tg-btn-success tg-btn-sm" data-u-act="approve" data-u-id="${escapeAttr(u.userId)}" data-u-name="${escapeAttr(fullName)}">Підтвердити</button>
            <button type="button" class="tg-btn tg-btn-secondary tg-btn-sm" data-u-edit="${escapeAttr(u.userId)}">Редагувати</button>
            <button type="button" class="tg-btn tg-btn-secondary tg-btn-sm" data-u-act="reject" data-u-id="${escapeAttr(u.userId)}" data-u-name="${escapeAttr(fullName)}">Відхилити</button>
            <button type="button" class="tg-btn tg-btn-danger tg-btn-sm" data-u-act="blacklist" data-u-id="${escapeAttr(u.userId)}" data-u-name="${escapeAttr(fullName)}">У ЧС</button>
          </div>
        `;
      } else if (state.usersTab === "blacklisted" && canModerate) {
        actionsHtml = `
          <div class="user-card-actions">
            <button type="button" class="tg-btn tg-btn-secondary tg-btn-sm" data-u-act="unblacklist" data-u-id="${escapeAttr(u.userId)}" data-u-name="${escapeAttr(fullName)}">Винести з ЧС</button>
          </div>
        `;
      }

      const roleBadgeHtml = u.roleLabel
        ? `<span class="admin-crown-pill${u.roleColor ? ` role-badge-${escapeAttr(u.roleColor)}` : ""}">${escapeHtml(u.roleLabel)}</span>`
        : u.isAdmin
          ? '<span class="admin-crown-pill role-badge-yellow">Адміністратор</span>'
          : "";

      card.innerHTML = `
        <div class="user-card-row">
          <div class="avatar-circle avatar-md" data-user-avatar></div>
          <div class="user-card-info">
            <div class="user-card-name">
              <span>${escapeHtml(fullName)}</span>
              ${roleBadgeHtml}
            </div>
            <div class="meta-sub">${escapeHtml(subText)}</div>
          </div>
          ${manageToggleHtml}
        </div>
        ${actionsHtml}
      `;
      renderAvatarInto(card.querySelector("[data-user-avatar]"), u);
      container.appendChild(card);
    }

    container.querySelectorAll("[data-u-edit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const uid = btn.getAttribute("data-u-edit");
        const allList = [...(state.users || []), ...(state.pendingUsers || [])];
        const target = allList.find((x) => String(x.userId) === String(uid));
        if (!target) return;
        document.getElementById("editUserIdInput").value = target.userId;
        document.getElementById("editUserMetaInfo").textContent = `ID: ${target.userId}${target.roleLabel ? ` · ${target.roleLabel}` : ""}`;
        document.getElementById("editUserLastName").value = target.lastName || "";
        document.getElementById("editUserFirstName").value = target.firstName || "";
        document.getElementById("editUserBirthday").value = target.birthday || "";
        document.getElementById("editUserUsername").value = target.username || "";
        document.getElementById("editUserRemoveAvatar").checked = false;
        document.getElementById("editUserModal").hidden = false;
      });
    });

    container.querySelectorAll("[data-toggle-u-menu]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const uid = btn.getAttribute("data-toggle-u-menu");
        const menu = container.querySelector(`[data-u-menu="${uid}"]`);
        if (menu) menu.hidden = !menu.hidden;
      });
    });

    container.querySelectorAll("[data-u-act]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const uid = btn.getAttribute("data-u-id");
        const act = btn.getAttribute("data-u-act");
        const uName = btn.getAttribute("data-u-name") || `ID ${uid}`;
        if (act === "delete" || act === "blacklist") {
          openDestructiveConfirmModal({
            title: act === "delete" ? "Видалення верифікованого акаунта" : "Занесення в чорний список",
            target: `${uName} (ID: ${uid})`,
            desc:
              act === "delete"
                ? "Учасник втратить доступ до веб-додатку і буде видалений зі списку верифікованих."
                : "Користувач буде заблокований і не зможе повторно подати заявку на реєстрацію.",
            checkboxLabel:
              act === "delete"
                ? "Підтверджую видалення цього учасника"
                : "Підтверджую занесення користувача в чорний список",
            buttonText: act === "delete" ? "Видалити акаунт" : "Занести в ЧС",
            onConfirm: () => runUserAction(uid, act, ""),
          });
          return;
        }
        runUserAction(uid, act, "");
      });
    });
  }

  // ==================== PROFILE ====================
  function renderProfile() {
    const user = state.user || {};
    const fullName = `${user.lastName || ""} ${user.firstName || ""}`.trim() || "Користувач";
    renderAvatarInto(document.getElementById("profileAvatar"), user);
    document.getElementById("profileFullName").textContent = fullName;
    document.getElementById("profileUsername").textContent = user.username
      ? `@${user.username} · ID ${user.userId}`
      : `ID: ${user.userId || "—"}`;
    document.getElementById("inputLastName").value = user.lastName || "";
    document.getElementById("inputFirstName").value = user.firstName || "";
    const bdayInput = document.getElementById("inputBirthday");
    if (bdayInput) bdayInput.value = user.birthday || "";
    const notifOn = Boolean(user.classNotificationsEnabled);
    document.querySelectorAll("[data-set-class-notif]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-set-class-notif") === String(notifOn));
    });
  }

  // ==================== SUBJECT / LECTURER PROFILES ====================
  function openEntityProfile(type, name) {
    const bucket = type === "lecturer" ? "lecturers" : "subjects";
    const key = String(name || "").trim();
    const existing = (state.profiles && state.profiles[bucket] && state.profiles[bucket][key]) || null;

    state.activeEntity = {
      type,
      key,
      name: key,
      categories: existing ? JSON.parse(JSON.stringify(existing.categories || [])) : [],
    };

    document.getElementById("entityTypeLabel").textContent =
      type === "lecturer" ? "Профіль викладача" : "Профіль предмета";
    document.getElementById("entityProfileName").textContent = key;
    document.getElementById("entityAdminControls").hidden = !state.isAdmin;

    renderEntityCategories();

    // Show linked articles & tasks for subject profiles
    const linkedWrap = document.getElementById("entityLinkedWrap");
    if (type === "subject") {
      const linkedArticles = (state.articles || []).filter((a) => a.subject === key);
      const linkedTasks = (state.tasks || []).filter((t) => t.subject === key);
      const blocks = [];
      if (linkedArticles.length > 0) {
        blocks.push(`
          <div class="meta-label" style="margin:6px 0 4px;">Закріплені артиклі (${linkedArticles.length}):</div>
          <div class="directory-list">
            ${linkedArticles
              .map(
                (a) =>
                  `<button type="button" class="directory-item-btn" data-jump-slug="${escapeAttr(a.slug || a.id)}"><span>${escapeHtml(a.title)}</span><span class="meta-sub">/${escapeHtml(a.slug || a.id)}</span></button>`,
              )
              .join("")}
          </div>
        `);
      }
      if (linkedTasks.length > 0) {
        blocks.push(`
          <div class="meta-label" style="margin:8px 0 4px;">Закріплені завдання (${linkedTasks.length}):</div>
          <div class="directory-list">
            ${linkedTasks
              .map(
                (t) =>
                  `<button type="button" class="directory-item-btn" data-jump-tasks="${escapeAttr(key)}"><span>${escapeHtml(t.title)}</span><span class="meta-sub">${t.status === "closed" ? "Закрито" : "Відкрито"}</span></button>`,
              )
              .join("")}
          </div>
        `);
      }
      linkedWrap.innerHTML = blocks.join("");
      linkedWrap.querySelectorAll("[data-jump-slug]").forEach((b) => {
        b.addEventListener("click", () => {
          document.getElementById("entityProfileModal").hidden = true;
          navigateTo(`/${encodeURIComponent(b.getAttribute("data-jump-slug"))}`);
        });
      });
      linkedWrap.querySelectorAll("[data-jump-tasks]").forEach((b) => {
        b.addEventListener("click", () => {
          document.getElementById("entityProfileModal").hidden = true;
          state.tasksSubjectFilter = b.getAttribute("data-jump-tasks");
          navigateTo("/tasks");
        });
      });
    } else {
      linkedWrap.innerHTML = "";
    }

    document.getElementById("entityProfileModal").hidden = false;
  }

  function renderEntityCategories() {
    const listEl = document.getElementById("entityCategoriesList");
    listEl.innerHTML = "";
    const cats = state.activeEntity?.categories || [];

    if (!cats.length) {
      listEl.innerHTML = `<div class="tg-empty-state">${
        state.isAdmin
          ? "Додайте категорії нижче: Опис, Контакти, Фото або власну секцію."
          : "Адміністратор ще не додав інформацію до цього профілю."
      }</div>`;
      return;
    }

    cats.forEach((cat, idx) => {
      const card = document.createElement("div");
      card.className = "entity-cat-card";
      const imgSrc = cat.imageData ? resolveMediaUrl(cat.imageData) : "";

      if (state.isAdmin) {
        const isPhoto = cat.kind === "photo";
        card.innerHTML = `
          <div class="entity-cat-head">
            <input type="text" class="tg-input-box" style="font-weight:700; padding:4px 8px;" value="${escapeAttr(cat.title)}" data-cat-title="${idx}" placeholder="Назва категорії" />
            <button type="button" class="tg-btn tg-btn-danger tg-btn-sm" data-cat-del="${idx}" aria-label="Видалити">${ICONS.trash}</button>
          </div>
          ${
            isPhoto
              ? `
                ${imgSrc ? `<img src="${escapeAttr(imgSrc)}" class="entity-cat-photo" alt="Фото" />` : ""}
                <label class="tg-btn tg-btn-secondary tg-btn-sm" style="align-self:flex-start;">
                  ${ICONS.camera}<span>${imgSrc ? "Змінити фото" : "Завантажити фото"}</span>
                  <input type="file" accept="image/*" data-cat-photo="${idx}" hidden />
                </label>
                <textarea class="entity-cat-textarea" data-cat-text="${idx}" placeholder="Підпис до фото...">${escapeHtml(cat.contentHtml || "")}</textarea>
              `
              : `<textarea class="entity-cat-textarea" data-cat-text="${idx}" placeholder="Введіть інформацію...">${escapeHtml(cat.contentHtml || "")}</textarea>`
          }
        `;
      } else {
        card.innerHTML = `
          <div class="entity-cat-title">${escapeHtml(cat.title)}</div>
          ${imgSrc ? `<img src="${escapeAttr(imgSrc)}" class="entity-cat-photo" alt="${escapeAttr(cat.title)}" />` : ""}
          ${cat.contentHtml ? `<div style="white-space:pre-wrap; font-size:14px;">${escapeHtml(cat.contentHtml)}</div>` : ""}
        `;
      }
      listEl.appendChild(card);
    });

    if (state.isAdmin) {
      listEl.querySelectorAll("[data-cat-title]").forEach((inp) => {
        inp.addEventListener("input", () => {
          state.activeEntity.categories[Number(inp.getAttribute("data-cat-title"))].title = inp.value;
        });
      });
      listEl.querySelectorAll("[data-cat-text]").forEach((ta) => {
        ta.addEventListener("input", () => {
          state.activeEntity.categories[Number(ta.getAttribute("data-cat-text"))].contentHtml = ta.value;
        });
      });
      listEl.querySelectorAll("[data-cat-del]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.activeEntity.categories.splice(Number(btn.getAttribute("data-cat-del")), 1);
          renderEntityCategories();
        });
      });
      listEl.querySelectorAll("[data-cat-photo]").forEach((inp) => {
        inp.addEventListener("change", async (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          const i = Number(inp.getAttribute("data-cat-photo"));
          try {
            showToast("Завантаження фото...");
            const dataUrl = await compressImageFile(file, 1024, 0.82);
            const up = await apiFetch("/api/media/upload", {
              method: "POST",
              body: JSON.stringify({ dataUrl, folder: "profiles" }),
            });
            if (!up.ok || !up.url) throw new Error(up.error || "Помилка завантаження");
            state.activeEntity.categories[i].imageData = up.url;
            renderEntityCategories();
          } catch (err) {
            showToast(err.message);
          }
        });
      });
    }
  }

  // ==================== SCHEDULE ADMIN MODALS ====================
  function openScheduleEventModal(prefill = null) {
    const isEdit = Boolean(prefill && (prefill.id || prefill.replacesSourceKey));
    document.getElementById("scheduleEventModalTitle").textContent = isEdit
      ? "Редагувати пару / подію"
      : "Додати пару / подію";

    const dl = document.getElementById("subjectsDatalist");
    dl.innerHTML = getAllSubjectNames().map((s) => `<option value="${escapeAttr(s)}"></option>`).join("");

    populateLessonTypeSelect(document.getElementById("evtTypeSelect"), prefill?.type || "Лекція");

    document.getElementById("evtIdInput").value = prefill?.isCustom ? prefill.id || "" : "";
    document.getElementById("evtReplacesKeyInput").value = prefill?.replacesSourceKey || "";
    document.getElementById("evtNameInput").value = prefill?.name || "";
    const pairVal = String(prefill?.pair || 1);
    document.getElementById("evtPairSelect").value = pairVal;
    const slot = KPI_PAIR_TIMES[Number(pairVal)] || { start: "08:30", end: "10:05" };
    document.getElementById("evtStartInput").value = prefill?.timeStart || slot.start;
    document.getElementById("evtEndInput").value = prefill?.timeEnd || slot.end;

    const isOneTime = Boolean(prefill?.isOneTime);
    document.getElementById("evtOneTimeCheck").checked = isOneTime;
    document.getElementById("evtDateInput").value = prefill?.date || (prefill?.dates && prefill.dates[0]) || "";
    document.getElementById("evtWeekSelect").value = prefill?.week || state.selectedWeek || "1";
    document.getElementById("evtDaySelect").value = prefill?.day || state.selectedDay || "Понеділок";
    document.getElementById("evtRecurringRow").hidden = isOneTime;

    document.getElementById("evtLecturerInput").value = prefill?.lecturer || "";
    document.getElementById("evtRoomInput").value = prefill?.room || "";
    document.getElementById("evtDescInput").value = prefill?.description || "";

    const hasSgs = Array.isArray(prefill?.subgroups) && prefill.subgroups.length > 0;
    document.getElementById("evtSplitSubgroupsCheck").checked = hasSgs;
    document.getElementById("evtSingleLinkWrap").hidden = hasSgs;
    document.getElementById("evtSubgroupsWrap").hidden = !hasSgs;
    document.getElementById("evtLinkInput").value = prefill?.link || "";
    document.getElementById("evtSg1Name").value = prefill?.subgroups?.[0]?.name || "Підгрупа 1";
    document.getElementById("evtSg1Link").value = prefill?.subgroups?.[0]?.link || "";
    document.getElementById("evtSg2Name").value = prefill?.subgroups?.[1]?.name || "Підгрупа 2";
    document.getElementById("evtSg2Link").value = prefill?.subgroups?.[1]?.link || "";

    document.getElementById("scheduleEventModal").hidden = false;
  }

  function findSavedClassLink(subject, type) {
    const linksMap = state.schedule?.classLinks || {};
    const subjTrim = String(subject || "").trim();
    const typeTrim = String(type || "").trim();
    if (!subjTrim) return null;
    const directKey = `${subjTrim}|||${typeTrim}`;
    if (linksMap[directKey]) return { key: directKey, cfg: linksMap[directKey] };
    for (const [key, cfg] of Object.entries(linksMap)) {
      if (
        String(cfg?.subject || "").trim() === subjTrim &&
        String(cfg?.type || "").trim().toLowerCase() === typeTrim.toLowerCase()
      ) {
        return { key, cfg };
      }
    }
    return null;
  }

  function setClassLinkSplitUi(isSplit) {
    const chk = document.getElementById("clSplitCheck");
    if (chk) chk.checked = Boolean(isSplit);
    document.getElementById("clSingleWrap").hidden = Boolean(isSplit);
    document.getElementById("clSubgroupsWrap").hidden = !Boolean(isSplit);
    document.querySelectorAll("[data-cl-split]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-cl-split") === String(Boolean(isSplit)));
    });
  }

  function loadClassLinkIntoForm(subject, type) {
    const found = findSavedClassLink(subject, type);
    const banner = document.getElementById("clStatusBanner");
    const delBtn = document.getElementById("clDeleteCurrentBtn");

    if (found && found.cfg) {
      const cfg = found.cfg;
      document.getElementById("clRoomInput").value = cfg.room || "";
      setClassLinkSplitUi(Boolean(cfg.splitSubgroups));
      document.getElementById("clLinkInput").value = cfg.link || "";
      document.getElementById("clSg1Name").value = cfg.subgroup1Name || "Підгрупа 1";
      document.getElementById("clSg1Link").value = cfg.subgroup1Link || "";
      document.getElementById("clSg2Name").value = cfg.subgroup2Name || "Підгрупа 2";
      document.getElementById("clSg2Link").value = cfg.subgroup2Link || "";

      if (banner) {
        banner.hidden = false;
        banner.className = "cl-status-banner";
        banner.textContent = cfg.splitSubgroups
          ? `Налаштовано 2 підгрупи: «${cfg.subgroup1Name || "Підгрупа 1"}» та «${cfg.subgroup2Name || "Підгрупа 2"}»`
          : `Налаштовано посилання: ${cfg.link || "лише аудиторія"}`;
      }
      if (delBtn) {
        delBtn.hidden = false;
        delBtn.setAttribute("data-current-cl-key", found.key);
      }
    } else {
      document.getElementById("clRoomInput").value = "";
      setClassLinkSplitUi(false);
      document.getElementById("clLinkInput").value = "";
      document.getElementById("clSg1Name").value = "Підгрупа 1";
      document.getElementById("clSg1Link").value = "";
      document.getElementById("clSg2Name").value = "Підгрупа 2";
      document.getElementById("clSg2Link").value = "";

      if (banner) {
        banner.hidden = !subject;
        banner.className = "cl-status-banner empty";
        banner.textContent = "Для цього предмета й типу заняття посилання ще не задано";
      }
      if (delBtn) {
        delBtn.hidden = true;
        delBtn.removeAttribute("data-current-cl-key");
      }
    }
    renderClassLinksList();
  }

  async function deleteClassLinkByKey(key) {
    if (!key) return;
    if (!confirm("Видалити налаштоване посилання для цієї пари?")) return;
    try {
      const res = await apiFetch("/api/schedule/links/delete", {
        method: "POST",
        body: JSON.stringify({ key }),
      });
      if (!res.ok) throw new Error(res.error || "Помилка видалення");
      state.schedule = res.schedule;
      const curSubj = document.getElementById("clSubjectSelect").value;
      const curType = document.getElementById("clTypeSelect").value;
      loadClassLinkIntoForm(curSubj, curType);
      renderSchedule();
      renderHome();
      showToast("Посилання видалено");
    } catch (err) {
      showToast(err.message);
    }
  }

  function renderClassLinksList() {
    const listEl = document.getElementById("classLinksList");
    const linksMap = state.schedule?.classLinks || {};
    const entries = Object.entries(linksMap);
    const activeSubj = document.getElementById("clSubjectSelect")?.value || "";
    const activeType = document.getElementById("clTypeSelect")?.value || "";

    if (!entries.length) {
      listEl.innerHTML = '<div class="tg-empty-state">Посилань ще не додано</div>';
      return;
    }

    listEl.innerHTML = entries
      .map(([key, cfg]) => {
        const isCurrent =
          String(cfg.subject || "").trim() === activeSubj &&
          String(cfg.type || "").trim().toLowerCase() === activeType.toLowerCase();
        const typeCls = getLessonTypeClass(cfg.type);
        let linksBlock = "";
        if (cfg.splitSubgroups) {
          linksBlock = `
            <div class="cl-card-link-row"><b>${escapeHtml(cfg.subgroup1Name || "Підгрупа 1")}:</b> <span>${escapeHtml(cfg.subgroup1Link || "—")}</span></div>
            <div class="cl-card-link-row"><b>${escapeHtml(cfg.subgroup2Name || "Підгрупа 2")}:</b> <span>${escapeHtml(cfg.subgroup2Link || "—")}</span></div>
          `;
        } else {
          linksBlock = `<div class="cl-card-link-row"><b>Посилання:</b> <span>${escapeHtml(cfg.link || "—")}</span></div>`;
        }
        if (cfg.room) {
          linksBlock += `<div class="cl-card-link-row"><b>Місце:</b> <span>${escapeHtml(cfg.room)}</span></div>`;
        }
        return `
          <div class="cl-card${isCurrent ? " active-edit" : ""}">
            <div class="cl-card-head">
              <div class="cl-card-title">${escapeHtml(cfg.subject)}</div>
              <span class="lesson-badge ${typeCls}">${escapeHtml(cfg.type || "Пара")}</span>
            </div>
            <div class="cl-card-links">${linksBlock}</div>
            <div class="cl-card-actions">
              <button type="button" class="tg-btn tg-btn-secondary tg-btn-sm" style="flex:1;" data-edit-cl="${escapeAttr(key)}">${ICONS.edit}<span>Редагувати</span></button>
              <button type="button" class="tg-btn tg-btn-danger tg-btn-sm" data-del-cl="${escapeAttr(key)}">${ICONS.trash}<span>Видалити</span></button>
            </div>
          </div>
        `;
      })
      .join("");

    listEl.querySelectorAll("[data-edit-cl]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-edit-cl");
        const cfg = (state.schedule?.classLinks || {})[key];
        if (!cfg) return;
        haptic("light");
        populateSubjectSelect(document.getElementById("clSubjectSelect"), cfg.subject || "", "Оберіть предмет...");
        populateLessonTypeSelect(document.getElementById("clTypeSelect"), cfg.type || "Лекція");
        loadClassLinkIntoForm(cfg.subject, cfg.type);
        const modalCard = document.getElementById("classLinksModalCard");
        if (modalCard) modalCard.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    listEl.querySelectorAll("[data-del-cl]").forEach((btn) => {
      btn.addEventListener("click", () => deleteClassLinkByKey(btn.getAttribute("data-del-cl")));
    });
  }

  function openClassLinksModal() {
    populateSubjectSelect(document.getElementById("clSubjectSelect"), "", "Оберіть предмет...");
    populateLessonTypeSelect(document.getElementById("clTypeSelect"), "Лекція");
    loadClassLinkIntoForm("", "Лекція");
    document.getElementById("classLinksModal").hidden = false;
  }

  // ==================== DIRECTORY ====================
  let activeDirType = "lecturer";

  function collectEntitiesFromScheduleAndProfiles(type) {
    const names = new Set();
    const bucket = type === "lecturer" ? "lecturers" : "subjects";
    Object.keys((state.profiles && state.profiles[bucket]) || {}).forEach((k) => {
      if (k && k.trim()) names.add(k.trim());
    });
    const weeks = state.schedule?.weeks || {};
    for (const wk of Object.values(weeks)) {
      for (const dayLessons of Object.values(wk || {})) {
        for (const l of dayLessons || []) {
          const val = type === "lecturer" ? l.lecturer : l.name;
          if (val && String(val).trim()) names.add(String(val).trim());
        }
      }
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b, "uk"));
  }

  function renderDirectoryList() {
    document.getElementById("directoryAdminCreate").hidden = !state.isAdmin;

    const listEl = document.getElementById("directoryList");
    listEl.innerHTML = "";

    // Build subject -> Map(lecturerName -> Set(lessonType)) from schedule
    const subjectMap = new Map();
    const attachedLecturers = new Set();

    const ensureSubject = (subjName) => {
      const clean = String(subjName || "").trim();
      if (!clean) return null;
      if (!subjectMap.has(clean)) subjectMap.set(clean, new Map());
      return subjectMap.get(clean);
    };

    Object.keys(state.profiles?.subjects || {}).forEach((s) => ensureSubject(s));

    const allLessons = [];
    const weeks = state.schedule?.weeks || {};
    for (const wk of Object.values(weeks)) {
      for (const dayList of Object.values(wk || {})) {
        for (const l of dayList || []) allLessons.push(l);
      }
    }
    for (const ev of state.schedule?.oneTimeEvents || []) allLessons.push(ev);

    for (const l of allLessons) {
      const lectMap = ensureSubject(l?.name);
      if (!lectMap) continue;
      const rawLect = String(l?.lecturer || "").trim();
      if (!rawLect) continue;
      const lectNames = rawLect.split(",").map((x) => x.trim()).filter(Boolean);
      const lType = String(l?.type || "Пара").trim();
      for (const ln of lectNames) {
        attachedLecturers.add(ln);
        if (!lectMap.has(ln)) lectMap.set(ln, new Set());
        lectMap.get(ln).add(lType);
      }
    }

    const sortedSubjects = Array.from(subjectMap.keys()).sort((a, b) => a.localeCompare(b, "uk"));
    const orphanLecturers = Object.keys(state.profiles?.lecturers || {})
      .map((x) => x.trim())
      .filter((x) => x && !attachedLecturers.has(x))
      .sort((a, b) => a.localeCompare(b, "uk"));

    if (!sortedSubjects.length && !orphanLecturers.length) {
      listEl.innerHTML = '<div class="tg-empty-state">Список порожній</div>';
      return;
    }

    for (const subjName of sortedSubjects) {
      const lectMap = subjectMap.get(subjName);
      const subjProf = state.profiles?.subjects?.[subjName];
      const subjCatsCount = subjProf?.categories?.length || 0;

      const card = document.createElement("div");
      card.className = "dir-subject-card";

      const headBtn = document.createElement("button");
      headBtn.type = "button";
      headBtn.className = "dir-subject-head-btn";
      headBtn.innerHTML = `<span>${escapeHtml(subjName)}</span>${subjCatsCount > 0 ? `<span class="tg-pill">${subjCatsCount}</span>` : ""}`;
      headBtn.addEventListener("click", () => {
        haptic("light");
        document.getElementById("directoryModal").hidden = true;
        openEntityProfile("subject", subjName);
      });
      card.appendChild(headBtn);

      const lecturers = Array.from(lectMap.entries()).sort(([a], [b]) => a.localeCompare(b, "uk"));
      if (lecturers.length > 0) {
        const wrap = document.createElement("div");
        wrap.className = "dir-lecturers-wrap";

        for (const [lectName, typesSet] of lecturers) {
          const lectProf = state.profiles?.lecturers?.[lectName];
          const lectCatsCount = lectProf?.categories?.length || 0;
          const badgesHtml = Array.from(typesSet)
            .map((tp) => `<span class="lesson-badge ${getLessonTypeClass(tp)}">${escapeHtml(tp)}</span>`)
            .join("");

          const lBtn = document.createElement("button");
          lBtn.type = "button";
          lBtn.className = "dir-lecturer-btn";
          lBtn.innerHTML = `
            <div class="dir-lecturer-left">
              <span class="dir-lecturer-badges">${badgesHtml}</span>
              <span class="dir-lecturer-name">${escapeHtml(lectName)}</span>
            </div>
            ${lectCatsCount > 0 ? `<span class="tg-pill">${lectCatsCount}</span>` : ""}
          `;
          lBtn.addEventListener("click", () => {
            haptic("light");
            document.getElementById("directoryModal").hidden = true;
            openEntityProfile("lecturer", lectName);
          });
          wrap.appendChild(lBtn);
        }
        card.appendChild(wrap);
      }

      listEl.appendChild(card);
    }

    if (orphanLecturers.length > 0) {
      const card = document.createElement("div");
      card.className = "dir-subject-card";
      card.innerHTML = '<div class="meta-label">Інші викладачі</div>';
      const wrap = document.createElement("div");
      wrap.className = "dir-lecturers-wrap";
      for (const lectName of orphanLecturers) {
        const lectProf = state.profiles?.lecturers?.[lectName];
        const lectCatsCount = lectProf?.categories?.length || 0;
        const lBtn = document.createElement("button");
        lBtn.type = "button";
        lBtn.className = "dir-lecturer-btn";
        lBtn.innerHTML = `<span class="dir-lecturer-name">${escapeHtml(lectName)}</span>${lectCatsCount > 0 ? `<span class="tg-pill">${lectCatsCount}</span>` : ""}`;
        lBtn.addEventListener("click", () => {
          haptic("light");
          document.getElementById("directoryModal").hidden = true;
          openEntityProfile("lecturer", lectName);
        });
        wrap.appendChild(lBtn);
      }
      card.appendChild(wrap);
      listEl.appendChild(card);
    }
  }

  // ==================== ARTICLE EDITOR HELPERS ====================
  let selectedEditorImg = null;
  function selectEditorPhoto(img) {
    document.querySelectorAll("#editArticleBody img.selected-photo").forEach((x) => x.classList.remove("selected-photo"));
    selectedEditorImg = img || null;
    const bar = document.getElementById("articlePhotoControls");
    if (selectedEditorImg) {
      selectedEditorImg.classList.add("selected-photo");
      bar.hidden = false;
    } else {
      bar.hidden = true;
    }
  }

  function getClosestTagInEditor(tagNames) {
    const ed = document.getElementById("editArticleBody");
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return null;
    let node = sel.anchorNode;
    while (node && node !== ed) {
      if (node.nodeType === 1 && tagNames.includes(node.tagName)) return node;
      node = node.parentNode;
    }
    return null;
  }

  function unwrapElementKeepChildren(el) {
    if (!el || !el.parentNode) return;
    const p = document.createElement("p");
    while (el.firstChild) p.appendChild(el.firstChild);
    el.parentNode.replaceChild(p, el);
  }

  function getImageBlockNode(img) {
    const ed = document.getElementById("editArticleBody");
    let node = img;
    while (node && node.parentNode && node.parentNode !== ed) {
      node = node.parentNode;
    }
    return node;
  }

  function insertImageUrlIntoEditor(url) {
    const ed = document.getElementById("editArticleBody");
    ed.focus();
    const p = document.createElement("p");
    const img = document.createElement("img");
    img.src = resolveMediaUrl(url);
    img.setAttribute("data-orig-src", url);
    p.appendChild(img);
    ed.appendChild(p);
    selectEditorPhoto(img);
  }

  // ==================== BOOTSTRAP ====================
  async function bootstrap() {
    showLoader(true);
    try {
      const data = await apiFetch("/api/bootstrap");
      if (!data.ok) throw new Error(data.error || "Помилка завантаження");

      state.user = data.user;
      state.isAdmin = Boolean(data.isAdmin);
      state.isOwner = Boolean(data.isOwner);
      state.authReason = data.authReason || "";
      state.isVerified = Boolean(data.isVerified);
      state.userStatus = data.userStatus || (state.isVerified ? "verified" : "guest");
      state.authMode = data.authMode;
      state.botUsername = data.botUsername || "ES61bot";
      state.schedule = data.schedule || null;
      state.tasks = data.tasks || [];
      state.articles = data.articles || [];
      state.profiles = data.profiles || { subjects: {}, lecturers: {} };
      state.users = data.users || [];
      state.pendingUsers = data.pendingUsers || [];
      state.blacklistedUsers = data.blacklistedUsers || [];
      state.bootstrapped = true;

      if (data.user?.userId && data.user.userId !== "guest") {
        try {
          localStorage.setItem(USER_ID_STORAGE_KEY, String(data.user.userId));
        } catch {}
      }

      if (data.schedule) {
        state.selectedWeek = String(data.schedule.currentWeek || 1);
        if (DAYS_ORDER.includes(data.schedule.todayDayName)) {
          state.selectedDay = data.schedule.todayDayName;
        }
      }

      let localSaved = null;
      try {
        localSaved = localStorage.getItem(THEME_STORAGE_KEY);
      } catch {}

      if (localSaved === "light" || localSaved === "dark") {
        applyTheme(localSaved, { persistLocal: false, persistServer: data.theme !== localSaved });
      } else if (data.theme === "light" || data.theme === "dark") {
        applyTheme(data.theme, { persistLocal: true, persistServer: false });
      } else {
        applyTheme(state.theme, { persistLocal: false, persistServer: false });
      }

      updatePendingIndicator();
      showLoader(false);
      if (!state.startParamHandled) {
        state.startParamHandled = true;
        const urlQs = new URLSearchParams(window.location.search);
        const rawStartParam = String(
          (tg && tg.initDataUnsafe && tg.initDataUnsafe.start_param) ||
            urlQs.get("tgWebAppStartParam") ||
            urlQs.get("startapp") ||
            "",
        ).trim();
        if (rawStartParam) {
          const lowerParam = rawStartParam.toLowerCase();
          if (APP_ROUTES.has(`/${lowerParam}`)) {
            window.history.replaceState({}, "", `/${lowerParam}`);
          } else if (rawStartParam.startsWith("article_")) {
            const sl = rawStartParam.slice("article_".length).trim();
            if (sl) window.history.replaceState({}, "", `/${encodeURIComponent(sl)}`);
          } else {
            window.history.replaceState({}, "", `/${encodeURIComponent(rawStartParam)}`);
          }
        }
      }
      renderCurrentRoute();
    } catch (err) {
      // Keep loader visible with slow/error warning so user sees technical notice & retry
      const warn = document.getElementById("loaderSlowWarning");
      if (warn) warn.hidden = false;
      showToast(`Помилка з'єднання: ${err.message}`);
    }
  }

  // ==================== EVENT LISTENERS ====================
  window.addEventListener("popstate", renderCurrentRoute);

  document.getElementById("retryConnectBtn").addEventListener("click", () => {
    bootstrap();
  });

  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      haptic("light");
      const next = state.theme === "dark" ? "light" : "dark";
      applyTheme(next, { persistLocal: true, persistServer: true });
      showToast(next === "dark" ? "Темну тему збережено" : "Світлу тему збережено");
    });
  });

  document.querySelectorAll("[data-set-theme]").forEach((btn) => {
    btn.addEventListener("click", () => {
      haptic("light");
      const next = btn.getAttribute("data-set-theme");
      applyTheme(next, { persistLocal: true, persistServer: true });
      showToast(next === "dark" ? "Темну тему збережено" : "Світлу тему збережено");
    });
  });

  document.querySelectorAll("[data-route]").forEach((el) => {
    el.addEventListener("click", () => {
      haptic("light");
      navigateTo(el.getAttribute("data-route"));
    });
  });

  document.addEventListener("click", (e) => {
    const a = e.target && e.target.closest ? e.target.closest("a[data-internal-route]") : null;
    if (!a) return;
    if (a.closest("#editArticleBody")) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    const route = extractInternalRoute(a.getAttribute("data-internal-route") || "");
    if (!route) return;
    e.preventDefault();
    haptic("light");
    navigateTo(route);
  });

  document.getElementById("articleHomeBtn").addEventListener("click", () => {
    haptic("light");
    while (state.navStack.length > 0) {
      const prev = state.navStack.pop();
      if (!prev || prev === getNormalizedPath()) continue;
      // For unregistered guests, skip private app routes and go to public /articles or another article
      if (!state.isVerified && APP_ROUTES.has(prev) && prev !== "/articles") {
        continue;
      }
      navigateTo(prev, false, { isBack: true });
      return;
    }
    navigateTo("/articles", false, { isBack: true });
  });

  // Guest Gate Listeners

  document.getElementById("guestRegisterForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const lastName = document.getElementById("regLastName").value.trim();
    const firstName = document.getElementById("regFirstName").value.trim();
    const birthday = (document.getElementById("regBirthday")?.value || "").trim();
    if (!birthday) {
      showToast("Вкажіть дату народження");
      return;
    }
    const btn = document.getElementById("guestRegisterBtn");
    btn.disabled = true;
    try {
      const res = await apiFetch("/api/register", {
        method: "POST",
        body: JSON.stringify({ lastName, firstName, birthday }),
      });
      if (!res.ok) throw new Error(res.error || "Помилка реєстрації");
      showToast(res.status === "verified" ? "Верифіковано!" : "Заявку надіслано адміністраторам!");
      await bootstrap();
    } catch (err) {
      showToast(err.message);
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById("guestRefreshBtn").addEventListener("click", () => bootstrap());

  // Schedule Controls
  document.querySelectorAll("#tab-schedule .week-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      haptic("light");
      state.selectedWeek = btn.getAttribute("data-week");
      renderSchedule();
    });
  });

  document.getElementById("syncNowBtn").addEventListener("click", async () => {
    const btn = document.getElementById("syncNowBtn");
    btn.disabled = true;
    btn.textContent = "Оновлення...";
    try {
      const res = await apiFetch("/api/schedule/sync", { method: "POST" });
      if (res.schedule) {
        state.schedule = res.schedule;
        renderSchedule();
      }
      showToast(res.ok ? "Розклад синхронізовано!" : res.error || "Помилка оновлення");
    } catch (err) {
      showToast(err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = "Оновити";
    }
  });

  // Schedule Admin Modals
  document.getElementById("addScheduleEventBtn").addEventListener("click", () => openScheduleEventModal(null));
  document.getElementById("closeScheduleEventModalBtn").addEventListener("click", () => {
    document.getElementById("scheduleEventModal").hidden = true;
  });
  document.getElementById("cancelScheduleEventBtn").addEventListener("click", () => {
    document.getElementById("scheduleEventModal").hidden = true;
  });
  function findLessonTemplateForSubjectAndType(subject, type) {
    const subjTrim = String(subject || "").trim();
    const typeTrim = String(type || "").trim().toLowerCase();
    if (!subjTrim) return null;

    const savedLink = findSavedClassLink(subjTrim, type)?.cfg || null;

    const allLessons = [];
    const weeks = state.schedule?.weeks || {};
    for (const wk of Object.values(weeks)) {
      for (const dayList of Object.values(wk || {})) {
        for (const l of dayList || []) allLessons.push(l);
      }
    }
    for (const ev of state.schedule?.oneTimeEvents || []) allLessons.push(ev);

    const exactMatches = allLessons.filter(
      (l) =>
        String(l?.name || "").trim().toLowerCase() === subjTrim.toLowerCase() &&
        String(l?.type || "").trim().toLowerCase() === typeTrim,
    );
    const subjMatches = allLessons.filter(
      (l) => String(l?.name || "").trim().toLowerCase() === subjTrim.toLowerCase(),
    );
    const pool = exactMatches.length ? exactMatches : subjMatches;

    const lecturers = Array.from(
      new Set(pool.map((l) => String(l?.lecturer || "").trim()).filter(Boolean)),
    );
    const firstRoom =
      savedLink?.room ||
      pool.map((l) => String(l?.room || "").trim()).find(Boolean) ||
      "";

    let splitSubgroups = false;
    let link = "";
    let sg1Name = "Підгрупа 1";
    let sg1Link = "";
    let sg2Name = "Підгрупа 2";
    let sg2Link = "";

    if (savedLink) {
      splitSubgroups = Boolean(savedLink.splitSubgroups);
      link = savedLink.link || "";
      sg1Name = savedLink.subgroup1Name || "Підгрупа 1";
      sg1Link = savedLink.subgroup1Link || "";
      sg2Name = savedLink.subgroup2Name || "Підгрупа 2";
      sg2Link = savedLink.subgroup2Link || "";
    } else {
      const withSg = pool.find((l) => Array.isArray(l?.subgroups) && l.subgroups.length > 0);
      if (withSg) {
        splitSubgroups = true;
        sg1Name = withSg.subgroups[0]?.name || "Підгрупа 1";
        sg1Link = withSg.subgroups[0]?.link || "";
        sg2Name = withSg.subgroups[1]?.name || "Підгрупа 2";
        sg2Link = withSg.subgroups[1]?.link || "";
      } else {
        link = pool.map((l) => String(l?.link || "").trim()).find(Boolean) || "";
      }
    }

    if (!lecturers.length && !firstRoom && !link && !sg1Link && !sg2Link && !savedLink) {
      return null;
    }

    return {
      lecturer: lecturers.join(", "),
      room: firstRoom,
      splitSubgroups,
      link,
      sg1Name,
      sg1Link,
      sg2Name,
      sg2Link,
    };
  }

  function applyScheduleEventTemplateIfNew() {
    // Автошаблон спрацьовує при створенні нової пари (коли evtIdInput та evtReplacesKeyInput порожні)
    if (document.getElementById("evtIdInput").value || document.getElementById("evtReplacesKeyInput").value) {
      return;
    }
    const subject = document.getElementById("evtNameInput").value.trim();
    const type = document.getElementById("evtTypeSelect").value;
    const tpl = findLessonTemplateForSubjectAndType(subject, type);
    if (!tpl) return;

    document.getElementById("evtLecturerInput").value = tpl.lecturer;
    document.getElementById("evtRoomInput").value = tpl.room;
    document.getElementById("evtSplitSubgroupsCheck").checked = tpl.splitSubgroups;
    document.getElementById("evtSingleLinkWrap").hidden = tpl.splitSubgroups;
    document.getElementById("evtSubgroupsWrap").hidden = !tpl.splitSubgroups;
    document.getElementById("evtLinkInput").value = tpl.link;
    document.getElementById("evtSg1Name").value = tpl.sg1Name;
    document.getElementById("evtSg1Link").value = tpl.sg1Link;
    document.getElementById("evtSg2Name").value = tpl.sg2Name;
    document.getElementById("evtSg2Link").value = tpl.sg2Link;
  }

  document.getElementById("evtNameInput").addEventListener("change", applyScheduleEventTemplateIfNew);
  document.getElementById("evtNameInput").addEventListener("input", () => {
    const val = document.getElementById("evtNameInput").value.trim().toLowerCase();
    const subjects = collectEntitiesFromScheduleAndProfiles("subject");
    if (subjects.some((s) => s.toLowerCase() === val)) {
      applyScheduleEventTemplateIfNew();
    }
  });
  document.getElementById("evtTypeSelect").addEventListener("change", applyScheduleEventTemplateIfNew);

  document.getElementById("evtPairSelect").addEventListener("change", (e) => {
    const slot = KPI_PAIR_TIMES[Number(e.target.value)];
    if (slot) {
      document.getElementById("evtStartInput").value = slot.start;
      document.getElementById("evtEndInput").value = slot.end;
    }
  });
  document.getElementById("evtOneTimeCheck").addEventListener("change", (e) => {
    document.getElementById("evtRecurringRow").hidden = e.target.checked;
  });
  document.getElementById("evtSplitSubgroupsCheck").addEventListener("change", (e) => {
    document.getElementById("evtSingleLinkWrap").hidden = e.target.checked;
    document.getElementById("evtSubgroupsWrap").hidden = !e.target.checked;
  });

  document.getElementById("scheduleEventForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const split = document.getElementById("evtSplitSubgroupsCheck").checked;
    const payload = {
      id: document.getElementById("evtIdInput").value || null,
      replacesSourceKey: document.getElementById("evtReplacesKeyInput").value || null,
      name: document.getElementById("evtNameInput").value.trim(),
      type: document.getElementById("evtTypeSelect").value,
      pair: Number(document.getElementById("evtPairSelect").value),
      timeStart: document.getElementById("evtStartInput").value,
      timeEnd: document.getElementById("evtEndInput").value,
      isOneTime: document.getElementById("evtOneTimeCheck").checked,
      date: document.getElementById("evtDateInput").value,
      week: document.getElementById("evtWeekSelect").value,
      day: document.getElementById("evtDaySelect").value,
      lecturer: document.getElementById("evtLecturerInput").value.trim(),
      room: document.getElementById("evtRoomInput").value.trim(),
      description: document.getElementById("evtDescInput").value.trim(),
      link: split ? "" : normalizeUserUrl(document.getElementById("evtLinkInput").value.trim()),
      subgroups: split
        ? [
            { name: document.getElementById("evtSg1Name").value.trim(), link: normalizeUserUrl(document.getElementById("evtSg1Link").value.trim()) },
            { name: document.getElementById("evtSg2Name").value.trim(), link: normalizeUserUrl(document.getElementById("evtSg2Link").value.trim()) },
          ]
        : [],
    };
    const btn = document.getElementById("saveScheduleEventBtn");
    btn.disabled = true;
    try {
      const res = await apiFetch("/api/schedule/event", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(res.error || "Помилка збереження");
      state.schedule = res.schedule;
      document.getElementById("scheduleEventModal").hidden = true;
      renderSchedule();
      showToast("Розклад оновлено!");
    } catch (err) {
      showToast(err.message);
    } finally {
      btn.disabled = false;
    }
  });

  // Class Links Modal
  document.getElementById("openClassLinksBtn").addEventListener("click", openClassLinksModal);
  document.getElementById("closeClassLinksModalBtn").addEventListener("click", () => {
    document.getElementById("classLinksModal").hidden = true;
  });
  document.getElementById("classLinksModal").addEventListener("click", (e) => {
    if (e.target.id === "classLinksModal") document.getElementById("classLinksModal").hidden = true;
  });
  document.getElementById("clSubjectSelect").addEventListener("change", () => {
    loadClassLinkIntoForm(
      document.getElementById("clSubjectSelect").value,
      document.getElementById("clTypeSelect").value,
    );
  });
  document.getElementById("clTypeSelect").addEventListener("change", () => {
    loadClassLinkIntoForm(
      document.getElementById("clSubjectSelect").value,
      document.getElementById("clTypeSelect").value,
    );
  });
  document.querySelectorAll("[data-cl-split]").forEach((btn) => {
    btn.addEventListener("click", () => {
      haptic("light");
      setClassLinkSplitUi(btn.getAttribute("data-cl-split") === "true");
    });
  });
  document.getElementById("clDeleteCurrentBtn").addEventListener("click", () => {
    const key = document.getElementById("clDeleteCurrentBtn").getAttribute("data-current-cl-key");
    if (key) deleteClassLinkByKey(key);
  });
  document.getElementById("classLinkForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const subject = document.getElementById("clSubjectSelect").value;
    const type = document.getElementById("clTypeSelect").value;
    if (!subject) {
      showToast("Оберіть предмет");
      return;
    }
    const split = document.getElementById("clSplitCheck").checked;
    try {
      const res = await apiFetch("/api/schedule/links", {
        method: "POST",
        body: JSON.stringify({
          subject,
          type,
          room: document.getElementById("clRoomInput").value.trim(),
          splitSubgroups: split,
          link: split ? "" : normalizeUserUrl(document.getElementById("clLinkInput").value.trim()),
          subgroup1Name: document.getElementById("clSg1Name").value.trim() || "Підгрупа 1",
          subgroup1Link: split ? normalizeUserUrl(document.getElementById("clSg1Link").value.trim()) : "",
          subgroup2Name: document.getElementById("clSg2Name").value.trim() || "Підгрупа 2",
          subgroup2Link: split ? normalizeUserUrl(document.getElementById("clSg2Link").value.trim()) : "",
        }),
      });
      if (!res.ok) throw new Error(res.error || "Помилка збереження");
      state.schedule = res.schedule;
      loadClassLinkIntoForm(subject, type);
      renderSchedule();
      renderHome();
      showToast("Посилання збережено!");
    } catch (err) {
      showToast(err.message);
    }
  });

  // Bot Notifications Modal
  function syncGroupNotifToggleUi(enabled) {
    const chk = document.getElementById("notifEnabledCheck");
    if (chk) chk.checked = Boolean(enabled);
    document.querySelectorAll("[data-set-group-notif]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-set-group-notif") === String(Boolean(enabled)));
    });
  }

  document.querySelectorAll("[data-set-group-notif]").forEach((btn) => {
    btn.addEventListener("click", () => {
      haptic("light");
      syncGroupNotifToggleUi(btn.getAttribute("data-set-group-notif") === "true");
    });
  });

  document.getElementById("openNotifSettingsBtn").addEventListener("click", () => {
    const cfg = state.schedule?.notificationSettings || {};
    syncGroupNotifToggleUi(Boolean(cfg.enabled));
    document.getElementById("notifChatIdInput").value = cfg.chatId || "";
    document.getElementById("notifThreadIdInput").value = cfg.threadId || "";
    document.getElementById("notifSettingsModal").hidden = false;
  });
  document.getElementById("closeNotifSettingsModalBtn").addEventListener("click", () => {
    document.getElementById("notifSettingsModal").hidden = true;
  });
  document.getElementById("notifSettingsModal").addEventListener("click", (e) => {
    if (e.target.id === "notifSettingsModal") document.getElementById("notifSettingsModal").hidden = true;
  });
  document.getElementById("notifSettingsForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const enabled = document.getElementById("notifEnabledCheck").checked;
    try {
      const res = await apiFetch("/api/schedule/notifications", {
        method: "POST",
        body: JSON.stringify({
          enabled,
          chatId: document.getElementById("notifChatIdInput").value.trim(),
          threadId: document.getElementById("notifThreadIdInput").value.trim() || null,
        }),
      });
      if (!res.ok) throw new Error(res.error || "Помилка збереження");
      state.schedule = res.schedule;
      renderSchedule();
      document.getElementById("notifSettingsModal").hidden = true;
      showToast(enabled ? "Сповіщення в чат увімкнено!" : "Сповіщення в чат вимкнено!");
    } catch (err) {
      showToast(err.message);
    }
  });
  document.getElementById("testNotifBtn").addEventListener("click", async () => {
    try {
      await apiFetch("/api/schedule/notifications", {
        method: "POST",
        body: JSON.stringify({
          enabled: document.getElementById("notifEnabledCheck").checked,
          chatId: document.getElementById("notifChatIdInput").value.trim(),
          threadId: document.getElementById("notifThreadIdInput").value.trim() || null,
        }),
      });
      const res = await apiFetch("/api/schedule/notifications/test", { method: "POST" });
      if (!res.ok) throw new Error(res.error || "Не вдалося надіслати");
      showToast("Тестове сповіщення надіслано!");
    } catch (err) {
      showToast(err.message);
    }
  });

  // Task Subject Modal
  document.getElementById("closeTaskSubjectModalBtn").addEventListener("click", () => {
    document.getElementById("taskSubjectModal").hidden = true;
  });
  document.getElementById("saveTaskSubjectBtn").addEventListener("click", async () => {
    if (!state.activeTaskSubjectId) return;
    try {
      const res = await apiFetch("/api/tasks/subject", {
        method: "POST",
        body: JSON.stringify({
          taskId: state.activeTaskSubjectId,
          subject: document.getElementById("taskSubjectSelect").value,
        }),
      });
      if (!res.ok) throw new Error(res.error || "Помилка збереження");
      state.tasks = res.tasks || [];
      document.getElementById("taskSubjectModal").hidden = true;
      renderTasks();
      showToast("Предмет завдання оновлено!");
    } catch (err) {
      showToast(err.message);
    }
  });

  // Edit User Profile Modal Listeners (Admin / Owner)
  const closeEditUserModal = () => {
    const m = document.getElementById("editUserModal");
    if (m) m.hidden = true;
  };
  document.getElementById("closeEditUserModalBtn")?.addEventListener("click", closeEditUserModal);
  document.getElementById("cancelEditUserBtn")?.addEventListener("click", closeEditUserModal);
  document.getElementById("editUserModal")?.addEventListener("click", (e) => {
    if (e.target.id === "editUserModal") closeEditUserModal();
  });
  document.getElementById("editUserForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userId = document.getElementById("editUserIdInput").value.trim();
    const lastName = document.getElementById("editUserLastName").value.trim();
    const firstName = document.getElementById("editUserFirstName").value.trim();
    const birthday = document.getElementById("editUserBirthday").value.trim();
    const username = document.getElementById("editUserUsername").value.trim().replace(/^@+/, "");
    const removeAvatar = document.getElementById("editUserRemoveAvatar").checked;
    const btn = document.getElementById("saveEditUserBtn");
    if (btn) btn.disabled = true;
    try {
      const res = await apiFetch("/api/users/edit", {
        method: "POST",
        body: JSON.stringify({ userId, lastName, firstName, birthday, username, removeAvatar }),
      });
      if (!res.ok) throw new Error(res.error || "Помилка збереження");
      state.users = res.users || [];
      state.pendingUsers = res.pendingUsers || [];
      state.blacklistedUsers = res.blacklistedUsers || [];
      if (String(userId) === String(state.user?.userId || "")) {
        const me = state.users.find((x) => String(x.userId) === String(userId));
        if (me) state.user = { ...state.user, ...me };
        renderHome();
        renderProfile();
      }
      renderUsers();
      closeEditUserModal();
      showToast("Профіль учасника оновлено!");
    } catch (err) {
      showToast(err.message);
    } finally {
      if (btn) btn.disabled = false;
    }
  });

  // Users Admin Tabs
  document.querySelectorAll("[data-users-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      haptic("light");
      state.usersTab = btn.getAttribute("data-users-tab");
      renderUsers();
    });
  });

  // ==================== DEDICATED /ai MULTI-CHAT & VISION PAGE ====================
  state.aiChats = [];
  state.activeAiChatId = null;
  state.pendingAiImageDataUrl = "";
  state.aiBusy = false;

  function buildAiAnchorHtml(rawUrl, rawLabel) {
    const cleanUrl = String(rawUrl || "").trim();
    const labelHtml = rawLabel || escapeHtml(cleanUrl);
    if (!cleanUrl || /^javascript:/i.test(cleanUrl)) return labelHtml;
    const internalRoute = extractInternalRoute(cleanUrl);
    if (internalRoute) {
      const resolved = resolveSmartRouteUrl(internalRoute);
      return `<a href="${escapeAttr(resolved)}" data-internal-route="${escapeAttr(internalRoute)}">${labelHtml}</a>`;
    }
    if (/^(https?:|mailto:|tg:)/i.test(cleanUrl)) {
      return `<a href="${escapeAttr(cleanUrl)}" target="_blank" rel="noopener noreferrer">${labelHtml}</a>`;
    }
    return labelHtml;
  }

  function formatAiInlineMarkdown(escapedText) {
    const tokens = [];
    const pushToken = (html) => {
      const idx = tokens.length;
      tokens.push(html);
      return `\u0000AI_TOK_${idx}\u0000`;
    };

    let s = String(escapedText || "");

    // 1. Inline code `...`
    s = s.replace(/`([^`\n]+)`/g, (_m, code) => pushToken(`<code class="ai-inline-code">${code}</code>`));

    // 2. Markdown hyperlinks [label](url)
    s = s.replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (_m, label, url) => {
      const decodedUrl = url.replace(/&amp;/g, "&");
      const formattedLabel = label
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/(^|[^\w])\*([^\s*][^*]*?)\*(?!\w)/g, "$1<em>$2</em>");
      return pushToken(buildAiAnchorHtml(decodedUrl, formattedLabel));
    });

    // 3. Bare URLs https://... or http://...
    s = s.replace(/\b(https?:\/\/[^\s<>()]+[^\s<>().,!?;:])/gi, (m) => {
      const decodedUrl = m.replace(/&amp;/g, "&");
      return pushToken(buildAiAnchorHtml(decodedUrl, m));
    });

    // 4. Telegram @username handles
    s = s.replace(/(^|[\s(])@([a-zA-Z][a-zA-Z0-9_]{3,31})\b/g, (_m, lead, uname) => {
      return `${lead}${pushToken(buildAiAnchorHtml(`https://t.me/${uname}`, `@${uname}`))}`;
    });

    // 5. Bold **...** and __...__
    s = s.replace(/\*\*([^*\n]+?)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/__([^_\n]+?)__/g, "<strong>$1</strong>");

    // 6. Strikethrough ~~...~~
    s = s.replace(/~~([^~\n]+?)~~/g, "<del>$1</del>");

    // 7. Italic *...* and _..._
    s = s.replace(/(^|[^*\w])\*([^\s*\n](?:[^*\n]*?[^\s*\n])?)\*(?!\w)/g, "$1<em>$2</em>");
    s = s.replace(/(^|[^_\w])_([^\s_\n](?:[^_\n]*?[^\s_\n])?)_(?!\w)/g, "$1<em>$2</em>");

    // Restore protected tokens
    s = s.replace(/\u0000AI_TOK_(\d+)\u0000/g, (_m, idx) => tokens[Number(idx)] || "");
    return s;
  }

  function formatAiTextHtml(rawText) {
    const src = String(rawText || "").replace(/\r\n?/g, "\n");
    const codeBlocks = [];
    const withPlaceholders = src.replace(/```(?:[a-zA-Z0-9_+-]+)?\n?([\s\S]*?)```/g, (_m, code) => {
      const idx = codeBlocks.length;
      codeBlocks.push(`<pre class="ai-code-block"><code>${escapeHtml(code.replace(/\n$/, ""))}</code></pre>`);
      return `\n\n@@AI_CODEBLOCK_${idx}@@\n\n`;
    });

    const lines = withPlaceholders.split("\n");
    const out = [];
    let listType = null;
    let paraLines = [];

    const flushPara = () => {
      if (!paraLines.length) return;
      out.push(`<p>${paraLines.map((l) => formatAiInlineMarkdown(escapeHtml(l))).join("<br>")}</p>`);
      paraLines = [];
    };
    const flushList = () => {
      if (!listType) return;
      out.push(`</${listType}>`);
      listType = null;
    };

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();
      const trimmed = line.trim();

      const cbMatch = trimmed.match(/^@@AI_CODEBLOCK_(\d+)@@$/);
      if (cbMatch) {
        flushPara();
        flushList();
        out.push(codeBlocks[Number(cbMatch[1])] || "");
        continue;
      }

      if (!trimmed) {
        flushPara();
        flushList();
        continue;
      }

      const hMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
      if (hMatch) {
        flushPara();
        flushList();
        const tag = hMatch[1].length <= 2 ? "h3" : "h4";
        out.push(`<${tag}>${formatAiInlineMarkdown(escapeHtml(hMatch[2]))}</${tag}>`);
        continue;
      }

      const qMatch = trimmed.match(/^>\s?(.*)$/);
      if (qMatch) {
        flushPara();
        flushList();
        out.push(`<blockquote>${formatAiInlineMarkdown(escapeHtml(qMatch[1]))}</blockquote>`);
        continue;
      }

      const ulMatch = trimmed.match(/^[-*•]\s+(.+)$/);
      if (ulMatch) {
        flushPara();
        if (listType !== "ul") {
          flushList();
          listType = "ul";
          out.push("<ul>");
        }
        out.push(`<li>${formatAiInlineMarkdown(escapeHtml(ulMatch[1]))}</li>`);
        continue;
      }

      const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);
      if (olMatch) {
        flushPara();
        if (listType !== "ol") {
          flushList();
          listType = "ol";
          out.push("<ol>");
        }
        out.push(`<li>${formatAiInlineMarkdown(escapeHtml(olMatch[1]))}</li>`);
        continue;
      }

      flushList();
      paraLines.push(line);
    }

    flushPara();
    flushList();
    return out.join("");
  }

  function formatRelativeShort(ts) {
    if (!ts) return "";
    const diffMin = Math.max(0, Math.floor((Date.now() - ts) / 60000));
    if (diffMin < 1) return "щойно";
    if (diffMin < 60) return `${diffMin} хв тому`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} год тому`;
    return `${Math.floor(diffHr / 24)} дн тому`;
  }

  function getActiveAiChat() {
    return (state.aiChats || []).find((c) => c.id === state.activeAiChatId) || null;
  }

  function renderAiChatsDrawer() {
    const listEl = document.getElementById("aiChatsList");
    if (!listEl) return;
    const chats = state.aiChats || [];
    if (!chats.length) {
      listEl.innerHTML = '<div class="meta-sub" style="padding:12px 6px; text-align:center;">Чатів поки немає</div>';
      return;
    }
    listEl.innerHTML = chats
      .map((c) => {
        const isActive = c.id === state.activeAiChatId;
        const msgCount = Array.isArray(c.messages) ? c.messages.length : 0;
        return `
          <div class="ai-drawer-item${isActive ? " active" : ""}" data-select-ai-chat="${escapeAttr(c.id)}">
            <div class="ai-drawer-item-main">
              <div class="ai-drawer-item-title">${escapeHtml(c.title || "Новий чат")}</div>
              <div class="ai-drawer-item-meta">${msgCount} повід. · ${escapeHtml(formatRelativeShort(c.updatedAt || c.createdAt))}</div>
            </div>
            <button type="button" class="ai-drawer-del" data-del-ai-chat="${escapeAttr(c.id)}" title="Видалити чат">✕</button>
          </div>
        `;
      })
      .join("");
  }

  function renderAiMessagesView() {
    const scrollEl = document.getElementById("aiPageMessages");
    const titleEl = document.getElementById("aiActiveChatTitle");
    if (!scrollEl) return;
    const chat = getActiveAiChat();
    if (titleEl) titleEl.textContent = chat?.title || "Новий чат";

    const msgs = Array.isArray(chat?.messages) ? chat.messages : [];
    if (!msgs.length && !state.aiBusy) {
      scrollEl.innerHTML = `
        <div class="ai-empty-hero">
          <div class="ai-empty-icon">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>
          </div>
          <div class="ai-empty-title">Чим допомогти?</div>
          <div class="ai-empty-sub">Я бачу контекст цього чату, базу артиклів, викладачів, розклад і зображення, які ви надсилаєте.</div>
          <div class="ai-suggestions">
            <button type="button" class="ai-suggestion-chip" data-ai-suggest="Які пари сьогодні за розкладом?">Які пари сьогодні?</button>
            <button type="button" class="ai-suggestion-chip" data-ai-suggest="Хто веде предмети на цьому тижні?">Викладачі й предмети</button>
            <button type="button" class="ai-suggestion-chip" data-ai-suggest="Що є в останніх артиклях групи?">Останні артиклі</button>
          </div>
        </div>
      `;
      return;
    }

    scrollEl.innerHTML = msgs
      .map((m, i) => {
        if (m.role === "user") {
          const imgHtml = m.localPreviewUrl
            ? `<img class="ai-turn-user-img" src="${escapeAttr(m.localPreviewUrl)}" alt="Фото" />`
            : m.hasImage
              ? `<div class="ai-turn-user-img-badge">🖼 Зображення</div><br>`
              : "";
          return `<div class="ai-turn-user">${imgHtml}${escapeHtml(m.text || "")}</div>`;
        }
        return `
          <div class="ai-turn-model">
            <div>${formatAiTextHtml(m.text || "")}</div>
            <div class="ai-turn-actions">
              <button type="button" class="ai-copy-btn" data-copy-ai-idx="${i}">Копіювати</button>
            </div>
          </div>
        `;
      })
      .join("");

    if (state.aiBusy) {
      const dots = document.createElement("div");
      dots.className = "ai-turn-model";
      dots.innerHTML = '<div class="ai-typing-dots"><span></span><span></span><span></span></div>';
      scrollEl.appendChild(dots);
    }

    scrollEl.scrollTop = scrollEl.scrollHeight;
  }

  async function openAiChatPage() {
    hideAllTopLevelViews();
    const page = document.getElementById("aiChatPage");
    if (page) page.hidden = false;
    document.title = "ШІ Помічник";
    try {
      const res = await apiFetch("/api/ai/chats");
      if (res.ok && Array.isArray(res.chats)) {
        state.aiChats = res.chats;
        if (!state.activeAiChatId || !state.aiChats.some((c) => c.id === state.activeAiChatId)) {
          state.activeAiChatId = state.aiChats[0]?.id || null;
        }
      }
    } catch {}
    renderAiChatsDrawer();
    renderAiMessagesView();
  }

  async function createNewAiChat() {
    try {
      const res = await apiFetch("/api/ai/chats/create", { method: "POST" });
      if (res.ok && res.chat) {
        state.aiChats = res.chats || [res.chat, ...(state.aiChats || [])];
        state.activeAiChatId = res.chat.id;
      } else {
        state.activeAiChatId = null;
      }
    } catch {
      state.activeAiChatId = null;
    }
    const drawer = document.getElementById("aiChatsDrawer");
    if (drawer) drawer.hidden = true;
    renderAiChatsDrawer();
    renderAiMessagesView();
    document.getElementById("aiPageInput")?.focus();
  }

  function clearPendingAiImage() {
    state.pendingAiImageDataUrl = "";
    const prev = document.getElementById("aiAttachPreview");
    const thumb = document.getElementById("aiAttachThumb");
    if (prev) prev.hidden = true;
    if (thumb) thumb.src = "";
  }

  async function sendAiChatMessage(overrideText = null) {
    if (state.aiBusy) return;
    const inp = document.getElementById("aiPageInput");
    const question = (overrideText !== null ? String(overrideText) : inp?.value || "").trim();
    const imgUrl = state.pendingAiImageDataUrl || "";
    if (!question && !imgUrl) return;

    if (inp && overrideText === null) {
      inp.value = "";
      inp.style.height = "auto";
    }
    clearPendingAiImage();

    let activeChat = getActiveAiChat();
    if (!activeChat) {
      activeChat = {
        id: "__pending__",
        title: question ? question.slice(0, 42) : "Фото-запит",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
      };
      state.aiChats = [activeChat, ...(state.aiChats || [])];
      state.activeAiChatId = activeChat.id;
    }
    activeChat.messages.push({
      role: "user",
      text: question,
      hasImage: Boolean(imgUrl),
      localPreviewUrl: imgUrl || "",
      ts: Date.now(),
    });

    state.aiBusy = true;
    const sendBtn = document.getElementById("aiPageSendBtn");
    if (sendBtn) sendBtn.disabled = true;
    renderAiMessagesView();

    try {
      const res = await apiFetch("/api/ai/ask", {
        method: "POST",
        body: JSON.stringify({
          chatId: activeChat.id === "__pending__" ? "" : activeChat.id,
          question,
          imageDataUrl: imgUrl || undefined,
        }),
      });
      if (!res.ok) throw new Error(res.error || "Помилка відповіді ШІ");
      state.aiChats = res.chats || state.aiChats;
      if (res.chat?.id) state.activeAiChatId = res.chat.id;
    } catch (err) {
      activeChat.messages.push({
        role: "model",
        text: `⚠️ ${err.message}`,
        ts: Date.now(),
      });
    } finally {
      state.aiBusy = false;
      if (sendBtn) sendBtn.disabled = false;
      renderAiChatsDrawer();
      renderAiMessagesView();
    }
  }

  document.getElementById("aiBackHomeBtn")?.addEventListener("click", () => {
    haptic("light");
    navigateTo("/home");
  });
  document.getElementById("aiOpenDrawerBtn")?.addEventListener("click", () => {
    haptic("light");
    renderAiChatsDrawer();
    const d = document.getElementById("aiChatsDrawer");
    if (d) d.hidden = false;
  });
  document.getElementById("aiCloseDrawerBtn")?.addEventListener("click", () => {
    const d = document.getElementById("aiChatsDrawer");
    if (d) d.hidden = true;
  });
  document.getElementById("aiChatsDrawer")?.addEventListener("click", async (e) => {
    if (e.target.id === "aiChatsDrawer") {
      e.target.hidden = true;
      return;
    }
    const delBtn = e.target.closest("[data-del-ai-chat]");
    if (delBtn) {
      e.stopPropagation();
      const cid = delBtn.getAttribute("data-del-ai-chat");
      if (!confirm("Видалити цей чат?")) return;
      try {
        const res = await apiFetch("/api/ai/chats/delete", {
          method: "POST",
          body: JSON.stringify({ chatId: cid }),
        });
        if (res.ok) {
          state.aiChats = res.chats || [];
          if (state.activeAiChatId === cid) {
            state.activeAiChatId = state.aiChats[0]?.id || null;
          }
          renderAiChatsDrawer();
          renderAiMessagesView();
        }
      } catch (err) {
        showToast(err.message);
      }
      return;
    }
    const item = e.target.closest("[data-select-ai-chat]");
    if (item) {
      state.activeAiChatId = item.getAttribute("data-select-ai-chat");
      document.getElementById("aiChatsDrawer").hidden = true;
      renderAiChatsDrawer();
      renderAiMessagesView();
    }
  });
  document.getElementById("aiNewChatTopBtn")?.addEventListener("click", () => {
    haptic("light");
    createNewAiChat();
  });
  document.getElementById("aiNewChatDrawerBtn")?.addEventListener("click", () => {
    haptic("light");
    createNewAiChat();
  });
  document.getElementById("aiAttachRemoveBtn")?.addEventListener("click", clearPendingAiImage);
  document.getElementById("aiImageFileInput")?.addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file, 1024, 0.8);
      state.pendingAiImageDataUrl = dataUrl;
      const thumb = document.getElementById("aiAttachThumb");
      const prev = document.getElementById("aiAttachPreview");
      if (thumb) thumb.src = dataUrl;
      if (prev) prev.hidden = false;
    } catch (err) {
      showToast(err.message || "Не вдалося обробити фото");
    }
  });
  document.getElementById("aiPageInput")?.addEventListener("input", (e) => {
    e.target.style.height = "auto";
    e.target.style.height = Math.min(130, e.target.scrollHeight) + "px";
  });
  document.getElementById("aiPageInput")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendAiChatMessage();
    }
  });
  document.getElementById("aiPageForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    sendAiChatMessage();
  });
  document.getElementById("aiPageMessages")?.addEventListener("click", async (e) => {
    const sug = e.target.closest("[data-ai-suggest]");
    if (sug) {
      haptic("light");
      sendAiChatMessage(sug.getAttribute("data-ai-suggest"));
      return;
    }
    const copyBtn = e.target.closest("[data-copy-ai-idx]");
    if (copyBtn) {
      const idx = Number(copyBtn.getAttribute("data-copy-ai-idx"));
      const chat = getActiveAiChat();
      const txt = chat?.messages?.[idx]?.text || "";
      if (txt) {
        try {
          await navigator.clipboard.writeText(txt);
          showToast("Скопійовано!");
        } catch {}
      }
    }
  });

  // Delegated personal class-notifications toggle in /profile
  document.addEventListener("click", async (e) => {
    const classNotifBtn = e.target.closest("[data-set-class-notif]");
    if (classNotifBtn) {
      const enabled = classNotifBtn.getAttribute("data-set-class-notif") === "true";
      haptic("light");
      try {
        const res = await apiFetch("/api/profile/notifications", {
          method: "POST",
          body: JSON.stringify({ enabled }),
        });
        if (!res.ok) throw new Error(res.error || "Помилка збереження");
        state.user = { ...state.user, classNotificationsEnabled: Boolean(res.classNotificationsEnabled) };
        renderProfile();
        showToast(enabled ? "Сповіщення про пари увімкнено" : "Сповіщення про пари вимкнено");
      } catch (err) {
        showToast(err.message);
      }
    }
  });

  // Deselect long-pressed task on outside click
  document.addEventListener("click", (ev) => {
    if (state.selectedTaskId && !ev.target.closest(".task-card-selected")) {
      state.selectedTaskId = null;
      renderTasks();
    }
  });

  // Profile Listeners
  document.getElementById("openBotBtn").addEventListener("click", () => openBotDeepLink(""));

  document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const lastName = document.getElementById("inputLastName").value.trim();
    const firstName = document.getElementById("inputFirstName").value.trim();
    const birthday = (document.getElementById("inputBirthday")?.value || "").trim();
    const btn = document.getElementById("saveProfileBtn");
    btn.disabled = true;
    try {
      const res = await apiFetch("/api/profile", {
        method: "POST",
        body: JSON.stringify({ lastName, firstName, birthday }),
      });
      if (!res.ok) throw new Error(res.error || "Не вдалося зберегти");
      state.user = { ...state.user, ...res.user, isRegistered: true };
      renderProfile();
      showToast("Дані профілю збережено!");
    } catch (err) {
      showToast(err.message);
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById("profileAvatarInput").addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    e.target.value = "";
    try {
      showToast("Стиснення та збереження аватарки...");
      const dataUrl = await compressImageFile(file, 256, 0.78);
      const res = await apiFetch("/api/profile/avatar", {
        method: "POST",
        body: JSON.stringify({ dataUrl }),
      });
      if (!res.ok) throw new Error(res.error || "Не вдалося оновити аватарку");
      state.user = { ...state.user, avatarUrl: res.avatarUrl };
      const idx = (state.users || []).findIndex((u) => u.userId === state.user.userId);
      if (idx >= 0) state.users[idx].avatarUrl = res.avatarUrl;
      renderProfile();
      showToast("Аватарку оновлено!");
    } catch (err) {
      showToast(err.message);
    }
  });

  // Article Editor Listeners
  document.getElementById("newArticleBtn").addEventListener("click", () => navigateTo("/articles/new"));
  document.getElementById("backFromEditorBtn").addEventListener("click", () => navigateTo("/articles"));
  let editingCodeEmbedEl = null;

  function encodeUtf8Base64(str) {
    return btoa(unescape(encodeURIComponent(String(str || ""))));
  }

  function decodeUtf8Base64(b64) {
    try { return decodeURIComponent(escape(atob(b64 || ""))); } catch { return ""; }
  }

  function renderCodeEmbedStub(box) {
    const h = Number(box.getAttribute("data-embed-height")) || 320;
    box.setAttribute("contenteditable", "false");
    box.innerHTML = `
      <div class="article-code-editor-stub">
        <span><b>&lt;/&gt; Інтерактивний блок коду</b> · ${h}px</span>
        <div style="display:flex; gap:6px;">
          <button type="button" class="tg-btn tg-btn-secondary tg-btn-sm" data-edit-code-embed="1">Редагувати</button>
          <button type="button" class="tg-btn tg-btn-danger tg-btn-sm" data-del-code-embed="1">✕</button>
        </div>
      </div>
    `;
  }

  document.getElementById("editArticleBody")?.addEventListener("click", (e) => {
    const editBtn = e.target.closest("[data-edit-code-embed]");
    if (editBtn) {
      const box = editBtn.closest(".article-code-embed");
      if (!box) return;
      editingCodeEmbedEl = box;
      document.getElementById("artCodeHeightInput").value = box.getAttribute("data-embed-height") || "320";
      document.getElementById("artCodeSourceInput").value = decodeUtf8Base64(box.getAttribute("data-embed-code") || "");
      document.getElementById("articleCodeModal").hidden = false;
      return;
    }
    const delBtn = e.target.closest("[data-del-code-embed]");
    if (delBtn) {
      const box = delBtn.closest(".article-code-embed");
      if (box) box.remove();
    }
    const delSp = e.target.closest("[data-del-spoiler]");
    if (delSp) {
      const blk = delSp.closest(".tg-spoiler-block");
      if (blk) blk.remove();
    }
  });

  const closeArtTableModal = () => { document.getElementById("articleTableModal").hidden = true; };
  document.getElementById("closeArticleTableModalBtn")?.addEventListener("click", closeArtTableModal);
  document.getElementById("cancelArticleTableBtn")?.addEventListener("click", closeArtTableModal);
  document.getElementById("articleTableModal")?.addEventListener("click", (e) => {
    if (e.target.id === "articleTableModal") closeArtTableModal();
  });
  document.getElementById("articleTableForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const rows = Math.max(1, Math.min(30, Number(document.getElementById("artTableRows").value) || 3));
    const cols = Math.max(1, Math.min(10, Number(document.getElementById("artTableCols").value) || 3));
    const hasHeader = document.getElementById("artTableHeader").checked;

    const wrap = document.createElement("div");
    wrap.className = "tg-article-table-wrap";
    const tbl = document.createElement("table");
    tbl.className = "tg-article-table";
    for (let r = 0; r < rows; r++) {
      const tr = document.createElement("tr");
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement(hasHeader && r === 0 ? "th" : "td");
        cell.innerHTML = hasHeader && r === 0 ? `Колонка ${c + 1}` : "<br>";
        tr.appendChild(cell);
      }
      tbl.appendChild(tr);
    }
    wrap.appendChild(tbl);

    const editor = document.getElementById("editArticleBody");
    editor.focus();
    if (savedEditorRange) {
      try {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedEditorRange);
      } catch {}
    }
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const pAfter = document.createElement("p");
      pAfter.innerHTML = "<br>";
      range.insertNode(pAfter);
      range.insertNode(wrap);
    } else {
      editor.appendChild(wrap);
    }
    closeArtTableModal();
  });

  const closeArtSpoilerModal = () => {
    const m = document.getElementById("articleSpoilerModal");
    if (m) m.hidden = true;
  };
  document.getElementById("closeArticleSpoilerModalBtn")?.addEventListener("click", closeArtSpoilerModal);
  document.getElementById("cancelArticleSpoilerBtn")?.addEventListener("click", closeArtSpoilerModal);
  document.getElementById("articleSpoilerModal")?.addEventListener("click", (e) => {
    if (e.target.id === "articleSpoilerModal") closeArtSpoilerModal();
  });
  document.getElementById("articleSpoilerForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("artSpoilerTitleInput").value.trim() || "Розділ";
    const defaultClosed = document.getElementById("artSpoilerCollapsedCheck").checked;

    const blk = document.createElement("div");
    blk.className = "tg-spoiler-block";
    blk.setAttribute("data-default-closed", defaultClosed ? "1" : "0");

    const hdr = document.createElement("div");
    hdr.className = "tg-spoiler-header";
    const titleSpan = document.createElement("span");
    titleSpan.className = "tg-spoiler-title";
    titleSpan.textContent = title;
    const chev = document.createElement("span");
    chev.className = "tg-spoiler-chevron";
    chev.setAttribute("contenteditable", "false");
    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "tg-spoiler-del-btn";
    delBtn.setAttribute("contenteditable", "false");
    delBtn.setAttribute("data-del-spoiler", "1");
    delBtn.textContent = "✕";
    hdr.appendChild(titleSpan);
    hdr.appendChild(chev);
    hdr.appendChild(delBtn);

    const body = document.createElement("div");
    body.className = "tg-spoiler-body";
    body.innerHTML = "<p>Текст розділу...</p>";
    blk.appendChild(hdr);
    blk.appendChild(body);

    const editor = document.getElementById("editArticleBody");
    editor.focus();
    if (savedEditorRange) {
      try {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedEditorRange);
      } catch {}
    }
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const pAfter = document.createElement("p");
      pAfter.innerHTML = "<br>";
      range.insertNode(pAfter);
      range.insertNode(blk);
    } else {
      editor.appendChild(blk);
    }
    closeArtSpoilerModal();
  });

  const closeArtCodeModal = () => {
    document.getElementById("articleCodeModal").hidden = true;
    editingCodeEmbedEl = null;
  };
  document.getElementById("closeArticleCodeModalBtn")?.addEventListener("click", closeArtCodeModal);
  document.getElementById("cancelArticleCodeBtn")?.addEventListener("click", closeArtCodeModal);
  document.getElementById("articleCodeModal")?.addEventListener("click", (e) => {
    if (e.target.id === "articleCodeModal") closeArtCodeModal();
  });
  document.getElementById("articleCodeForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const code = document.getElementById("artCodeSourceInput").value;
    const height = Math.max(120, Math.min(1200, Number(document.getElementById("artCodeHeightInput").value) || 320));
    if (!code.trim()) return;
    const b64 = encodeUtf8Base64(code);

    if (editingCodeEmbedEl) {
      editingCodeEmbedEl.setAttribute("data-embed-code", b64);
      editingCodeEmbedEl.setAttribute("data-embed-height", String(height));
      renderCodeEmbedStub(editingCodeEmbedEl);
      closeArtCodeModal();
      return;
    }

    const box = document.createElement("div");
    box.className = "article-code-embed";
    box.setAttribute("data-embed-code", b64);
    box.setAttribute("data-embed-height", String(height));
    renderCodeEmbedStub(box);

    const editor = document.getElementById("editArticleBody");
    editor.focus();
    if (savedEditorRange) {
      try {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedEditorRange);
      } catch {}
    }
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const pAfter = document.createElement("p");
      pAfter.innerHTML = "<br>";
      range.insertNode(pAfter);
      range.insertNode(box);
    } else {
      editor.appendChild(box);
    }
    closeArtCodeModal();
  });

  document.getElementById("cancelArticleEditBtn").addEventListener("click", () => navigateTo("/articles"));

  document.querySelectorAll("#articleToolbar button[data-cmd]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("editArticleBody").focus();
      document.execCommand(btn.getAttribute("data-cmd"), false, btn.getAttribute("data-val") || null);
    });
  });

  let pendingConfirmFn = null;
  function openDestructiveConfirmModal({ title, target, desc, checkboxLabel, buttonText, onConfirm }) {
    pendingConfirmFn = onConfirm;
    document.getElementById("confirmModalTitle").textContent = title;
    document.getElementById("confirmModalTarget").textContent = target;
    document.getElementById("confirmModalDesc").textContent = desc;
    document.getElementById("confirmModalCheckboxLabel").textContent = checkboxLabel;
    const cb = document.getElementById("confirmModalCheckbox");
    const submitBtn = document.getElementById("submitConfirmModalBtn");
    cb.checked = false;
    submitBtn.disabled = true;
    submitBtn.textContent = buttonText || "Підтвердити";
    document.getElementById("confirmActionModal").hidden = false;
  }

  function closeConfirmModal() {
    document.getElementById("confirmActionModal").hidden = true;
    pendingConfirmFn = null;
  }

  document.getElementById("closeConfirmModalBtn").addEventListener("click", closeConfirmModal);
  document.getElementById("cancelConfirmModalBtn").addEventListener("click", closeConfirmModal);
  document.getElementById("confirmModalCheckbox").addEventListener("change", (e) => {
    document.getElementById("submitConfirmModalBtn").disabled = !e.target.checked;
  });
  document.getElementById("submitConfirmModalBtn").addEventListener("click", async () => {
    const fn = pendingConfirmFn;
    closeConfirmModal();
    if (typeof fn === "function") await fn();
  });

  // Telegraph-style inline URL/Photo input bar (https:// is NOT required, Ctrl+K supported)
  let inlineBarMode = null; // "link" | "photoUrl"
  let savedEditorRange = null;

  function saveEditorSelection() {
    const ed = document.getElementById("editArticleBody");
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (ed && ed.contains(range.commonAncestorContainer)) {
        savedEditorRange = range.cloneRange();
      }
    }
  }

  document.getElementById("editArticleBody").addEventListener("mouseup", saveEditorSelection);
  document.getElementById("editArticleBody").addEventListener("keyup", saveEditorSelection);
  document.getElementById("editArticleBody").addEventListener("touchend", saveEditorSelection);
  document.addEventListener("selectionchange", () => {
    const ed = document.getElementById("editArticleBody");
    if (ed && document.activeElement === ed) saveEditorSelection();
  });

  // Prevent toolbar buttons from stealing focus and clearing text selection
  document.querySelectorAll("#articleToolbar button").forEach((btn) => {
    btn.addEventListener("mousedown", (e) => {
      saveEditorSelection();
      e.preventDefault();
    });
  });

  // Ctrl+K / Cmd+K shortcut for inserting hyperlink in article editor
  document.addEventListener("keydown", (e) => {
    const editorPage = document.getElementById("articleEditorPage");
    if (!editorPage || editorPage.hidden) return;
    if ((e.ctrlKey || e.metaKey) && e.key && e.key.toLowerCase() === "k") {
      e.preventDefault();
      saveEditorSelection();
      openTelegraphInlineBar("link");
    }
  });

  function openTelegraphInlineBar(mode) {
    saveEditorSelection();
    inlineBarMode = mode;
    const bar = document.getElementById("telegraphInlineBar");
    const inp = document.getElementById("telegraphInlineInput");
    inp.value = "";
    inp.placeholder =
      mode === "photoUrl"
        ? "Вставте посилання на фото і натисніть Enter"
        : "Посилання або гілка (наприклад /tasks) — Enter";
    bar.hidden = false;
    setTimeout(() => inp.focus(), 10);
  }

  function closeTelegraphInlineBar() {
    document.getElementById("telegraphInlineBar").hidden = true;
    inlineBarMode = null;
  }

  function applyTelegraphInlineBar() {
    const raw = document.getElementById("telegraphInlineInput").value.trim();
    const mode = inlineBarMode;
    closeTelegraphInlineBar();
    if (!raw) return;
    const url = normalizeUserUrl(raw);
    if (!url) return;

    const ed = document.getElementById("editArticleBody");
    if (mode === "photoUrl") {
      insertImageUrlIntoEditor(url);
      showToast("Фото додано");
    } else if (mode === "link") {
      ed.focus();
      const a = document.createElement("a");
      const internalRoute = extractInternalRoute(url);
      if (internalRoute) {
        a.setAttribute("href", internalRoute);
        a.setAttribute("data-internal-route", internalRoute);
      } else {
        a.setAttribute("href", url);
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }

      if (savedEditorRange && ed.contains(savedEditorRange.commonAncestorContainer)) {
        const range = savedEditorRange.cloneRange();
        if (!range.collapsed) {
          const frag = range.extractContents();
          a.appendChild(frag);
          range.insertNode(a);
        } else {
          a.textContent = raw;
          range.insertNode(a);
        }
        range.setStartAfter(a);
        range.collapse(true);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        savedEditorRange = range.cloneRange();
      } else {
        a.textContent = raw;
        ed.appendChild(a);
      }
    }
  }

  document.getElementById("telegraphInlineApplyBtn").addEventListener("click", applyTelegraphInlineBar);
  document.getElementById("telegraphInlineCancelBtn").addEventListener("click", closeTelegraphInlineBar);
  document.getElementById("telegraphInlineInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyTelegraphInlineBar();
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeTelegraphInlineBar();
    }
  });

  document.querySelectorAll("#articleToolbar button[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const act = btn.getAttribute("data-action");
      const ed = document.getElementById("editArticleBody");
      if (act === "table") {
        saveEditorSelection();
        document.getElementById("articleTableModal").hidden = false;
        return;
      }
      if (act === "collapsible") {
        saveEditorSelection();
        document.getElementById("artSpoilerTitleInput").value = "";
        document.getElementById("artSpoilerCollapsedCheck").checked = true;
        document.getElementById("articleSpoilerModal").hidden = false;
        setTimeout(() => document.getElementById("artSpoilerTitleInput")?.focus(), 50);
        return;
      }
      if (act === "embedCode") {
        saveEditorSelection();
        editingCodeEmbedEl = null;
        document.getElementById("artCodeHeightInput").value = "320";
        document.getElementById("artCodeSourceInput").value = "";
        document.getElementById("articleCodeModal").hidden = false;
        return;
      }
      if (act === "link" || act === "photoUrl") {
        openTelegraphInlineBar(act);
        return;
      }
      ed.focus();
      if (act === "heading") {
        const h2 = getClosestTagInEditor(["H2", "H1", "H3"]);
        document.execCommand("formatBlock", false, h2 ? "P" : "H2");
      } else if (act === "quote") {
        const listEl = getClosestTagInEditor(["UL", "OL"]);
        if (listEl) document.execCommand("insertUnorderedList");
        const bq = getClosestTagInEditor(["BLOCKQUOTE"]);
        if (bq) unwrapElementKeepChildren(bq);
        else document.execCommand("formatBlock", false, "BLOCKQUOTE");
      } else if (act === "list") {
        const bq = getClosestTagInEditor(["BLOCKQUOTE"]);
        if (bq) unwrapElementKeepChildren(bq);
        document.execCommand("insertUnorderedList");
      }
    });
  });

  document.getElementById("editArticleBody").addEventListener("click", (e) => {
    if (e.target && e.target.tagName === "IMG") selectEditorPhoto(e.target);
    else selectEditorPhoto(null);
  });

  document.getElementById("movePhotoUpBtn").addEventListener("click", () => {
    if (!selectedEditorImg) return;
    const block = getImageBlockNode(selectedEditorImg);
    if (block && block.previousElementSibling) block.parentNode.insertBefore(block, block.previousElementSibling);
  });
  document.getElementById("movePhotoDownBtn").addEventListener("click", () => {
    if (!selectedEditorImg) return;
    const block = getImageBlockNode(selectedEditorImg);
    if (block && block.nextElementSibling) block.parentNode.insertBefore(block.nextElementSibling, block);
  });
  document.getElementById("removePhotoBtn").addEventListener("click", () => {
    if (!selectedEditorImg) return;
    const block = getImageBlockNode(selectedEditorImg);
    if (block && block !== document.getElementById("editArticleBody")) {
      if (block.tagName === "IMG" || block.textContent.trim() === "") block.remove();
      else selectedEditorImg.remove();
    } else {
      selectedEditorImg.remove();
    }
    selectEditorPhoto(null);
  });



  function updateArticlePublicToggleLabel() {
    const cb = document.getElementById("editArticlePublic");
    const lbl = document.getElementById("editArticlePublicLabel");
    if (!cb || !lbl) return;
    lbl.textContent = cb.checked ? "Публічний (для всіх)" : "Закритий (лише зареєстрованим)";
  }

  document.getElementById("editArticlePublic")?.addEventListener("change", updateArticlePublicToggleLabel);

  document.getElementById("saveArticleBtn").addEventListener("click", async () => {
    const title = document.getElementById("editArticleTitle").value.trim();
    const author = document.getElementById("editArticleAuthor").value.trim();
    const subject = document.getElementById("editArticleSubject").value;
    const isPinned = Boolean(document.getElementById("editArticlePinned")?.checked);
    const isPublic = document.getElementById("editArticlePublic") ? Boolean(document.getElementById("editArticlePublic").checked) : true;
    const ed = document.getElementById("editArticleBody");

    // Normalize relative /api/media/ src attributes before saving
    const clone = ed.cloneNode(true);
    clone.querySelectorAll(".tg-spoiler-del-btn").forEach((b) => b.remove());
    clone.querySelectorAll(".tg-spoiler-block").forEach((b) => b.classList.remove("is-collapsed"));
    clone.querySelectorAll("a[href], a[data-internal-route]").forEach((a) => {
      const route = extractInternalRoute(a.getAttribute("data-internal-route") || a.getAttribute("href") || "");
      if (route) {
        a.setAttribute("href", route);
        a.setAttribute("data-internal-route", route);
        a.removeAttribute("target");
        a.removeAttribute("rel");
      }
    });
    clone.querySelectorAll("img").forEach((img) => {
      img.classList.remove("selected-photo");
      const orig = img.getAttribute("data-orig-src");
      if (orig) {
        img.setAttribute("src", orig);
        img.removeAttribute("data-orig-src");
      }
    });
    const contentHtml = clone.innerHTML.trim();

    if (!title) {
      showToast("Вкажіть заголовок артикля");
      return;
    }
    const btn = document.getElementById("saveArticleBtn");
    btn.disabled = true;
    try {
      const res = await apiFetch("/api/articles", {
        method: "POST",
        body: JSON.stringify({ id: state.activeArticleId, title, author, subject, contentHtml, isPinned, isPublic }),
      });
      if (!res.ok) throw new Error(res.error || "Помилка збереження");
      state.articles = res.articles || [];
      showToast("Артикль опубліковано!");
      navigateTo(`/${encodeURIComponent(res.article.slug || res.article.id)}`);
    } catch (err) {
      showToast(err.message);
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById("deleteArticleEditorBtn").addEventListener("click", async () => {
    if (!state.activeArticleId || !confirm("Видалити цей артикль?")) return;
    try {
      const res = await apiFetch("/api/articles/delete", {
        method: "POST",
        body: JSON.stringify({ id: state.activeArticleId }),
      });
      if (!res.ok) throw new Error(res.error || "Помилка видалення");
      state.articles = res.articles || [];
      showToast("Артикль видалено");
      navigateTo("/articles");
    } catch (err) {
      showToast(err.message);
    }
  });

  // Entity Profile & Directory Listeners
  document.getElementById("closeEntityModalBtn").addEventListener("click", () => {
    document.getElementById("entityProfileModal").hidden = true;
  });

  document.querySelectorAll("[data-add-cat]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!state.activeEntity) return;
      const kind = btn.getAttribute("data-add-cat");
      const titles = { description: "Опис", contacts: "Контакти", photo: "Фото", custom: "Додаткова інформація" };
      state.activeEntity.categories.push({
        id: `cat_${Date.now()}`,
        kind,
        title: titles[kind] || "Інформація",
        contentHtml: "",
        imageData: null,
      });
      renderEntityCategories();
    });
  });

  document.getElementById("saveEntityProfileBtn").addEventListener("click", async () => {
    if (!state.activeEntity) return;
    const btn = document.getElementById("saveEntityProfileBtn");
    btn.disabled = true;
    try {
      const res = await apiFetch("/api/profiles", {
        method: "POST",
        body: JSON.stringify({
          type: state.activeEntity.type,
          key: state.activeEntity.key,
          name: state.activeEntity.name,
          categories: state.activeEntity.categories,
        }),
      });
      if (!res.ok) throw new Error(res.error || "Не вдалося зберегти профіль");
      state.profiles = res.profiles || state.profiles;
      document.getElementById("entityProfileModal").hidden = true;
      showToast("Профіль збережено!");
    } catch (err) {
      showToast(err.message);
    } finally {
      btn.disabled = false;
    }
  });

  const openDir = () => {
    renderDirectoryList();
    document.getElementById("directoryModal").hidden = false;
  };
  document.getElementById("openDirectoryBtn").addEventListener("click", openDir);
  document.getElementById("homeOpenDirectoryBtn").addEventListener("click", openDir);
  document.getElementById("closeDirectoryModalBtn").addEventListener("click", () => {
    document.getElementById("directoryModal").hidden = true;
  });
  document.querySelectorAll("[data-dir-type]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeDirType = btn.getAttribute("data-dir-type");
      renderDirectoryList();
    });
  });
  document.getElementById("directoryModal")?.addEventListener("click", (e) => {
    if (e.target.id === "directoryModal") document.getElementById("directoryModal").hidden = true;
  });
  document.getElementById("createEntityBtn").addEventListener("click", () => {
    const inp = document.getElementById("newEntityNameInput");
    const typeSel = document.getElementById("newEntityTypeSelect");
    const targetType = typeSel ? typeSel.value : "subject";
    const name = inp.value.trim();
    if (!name) {
      showToast("Введіть назву або ПІБ");
      return;
    }
    inp.value = "";
    document.getElementById("directoryModal").hidden = true;
    openEntityProfile(targetType, name);
  });

  bootstrap();
})();
