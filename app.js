(function () {
  const THEME_STORAGE_KEY = "tg_archiver_theme";
  const USER_ID_STORAGE_KEY = "tg_archiver_user_id";
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
  const APP_ROUTES = new Set(["/home", "/schedule", "/tasks", "/articles", "/users", "/profile"]);

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
    const unsafeId = tg?.initDataUnsafe?.user?.id ? String(tg.initDataUnsafe.user.id) : "";
    const manualId = getSavedManualUserId();
    const bestId = unsafeId || manualId;
    if (bestId) {
      headers["X-Telegram-User-Id"] = bestId;
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
    if (window.location.origin !== FALLBACK_SERVER_URL && !bases.includes(FALLBACK_SERVER_URL)) {
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
          12000,
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

  function navigateTo(path, replace = false) {
    const target = path.startsWith("/") ? path : `/${path}`;
    if (getNormalizedPath() !== target) {
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
  }

  function showMainTab(tabName) {
    hideAllTopLevelViews();
    document.getElementById("appShell").hidden = false;
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === `tab-${tabName}`);
    });
    document.querySelectorAll(".tg-nav-pill").forEach((pill) => {
      pill.classList.toggle("active", pill.getAttribute("data-route") === `/${tabName}`);
    });
    window.scrollTo(0, 0);
  }

  function renderGuestGate() {
    hideAllTopLevelViews();
    document.getElementById("guestGateView").hidden = false;

    const titleEl = document.getElementById("guestGateTitle");
    const descEl = document.getElementById("guestGateDesc");
    const manualBlock = document.getElementById("guestManualIdBlock");
    const regForm = document.getElementById("guestRegisterForm");
    const statusNotice = document.getElementById("guestStatusNotice");

    manualBlock.hidden = true;
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
    } else if (st === "unregistered") {
      titleEl.textContent = "Реєстрація учасника";
      descEl.textContent = "Заповніть Прізвище та Ім'я для підтвердження доступу адміністратором. Після верифікації відкриється повний функціонал.";
      regForm.hidden = false;
      document.getElementById("regLastName").value = state.user?.lastName || "";
      document.getElementById("regFirstName").value = state.user?.firstName || "";
    } else {
      titleEl.textContent = "Гостьовий вхід обмежено";
      descEl.textContent = "Неверифіковані користувачі можуть переглядати лише окремий артикль за прямим посиланням. Відкрийте додаток у Telegram або введіть ваш Telegram ID.";
      manualBlock.hidden = false;
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

    // ONLY ONE button (Home) for verified users, ZERO buttons for unverified/guests
    homeBtn.hidden = !state.isVerified;

    let art = (state.articles || []).find(
      (a) => a && ((a.slug && a.slug.toLowerCase() === slug.toLowerCase()) || a.id === slug),
    );

    if (!art) {
      showLoader(true);
      try {
        const res = await apiFetch(`/api/article/${encodeURIComponent(slug)}`);
        if (res.ok && res.article) {
          art = res.article;
          if (typeof res.isVerified === "boolean") {
            state.isVerified = res.isVerified;
            homeBtn.hidden = !state.isVerified;
          }
        }
      } catch {} finally {
        showLoader(false);
      }
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
        bodyEl.innerHTML = "<p>Перевірте правильність посилання.</p>";
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

    // Standard verified app routes
    if (APP_ROUTES.has(pathname)) {
      if (!state.isVerified) return renderGuestGate();
      const tab = pathname.slice(1);
      document.title = "ЕС-61 · Веб-додаток";
      showMainTab(tab);
      if (tab === "home") renderHome();
      else if (tab === "schedule") renderSchedule();
      else if (tab === "tasks") renderTasks();
      else if (tab === "articles") renderArticles();
      else if (tab === "users") renderUsers();
      else if (tab === "profile") renderProfile();
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
    document.getElementById("homeAdminPill").hidden = !state.isAdmin;

    const sched = state.schedule;
    document.getElementById("homeDateMeta").textContent = sched
      ? `${sched.todayDayName || ""} · ${sched.currentWeek || 1}-й тиждень · ${sched.groupName || "ЕС-61"}`
      : "Група ЕС-61";

    const openTasks = (state.tasks || []).filter((t) => t.status !== "closed");
    document.getElementById("homeTileTasksSub").textContent = `${openTasks.length} відкритих`;
    document.getElementById("homeTileArticlesSub").textContent = `${(state.articles || []).length} публікацій`;
    document.getElementById("homeTileUsersSub").textContent = `${(state.users || []).length} верифікованих`;

    // Today's lessons summary
    const todayLessons =
      sched && sched.weeks && sched.weeks[String(sched.currentWeek || 1)]?.[sched.todayDayName]
        ? sched.weeks[String(sched.currentWeek || 1)][sched.todayDayName]
        : [];
    const groupedToday = groupLessonsBySlotAndSubject(todayLessons);
    document.getElementById("homeTileScheduleSub").textContent =
      groupedToday.length > 0 ? `Сьогодні пар: ${groupedToday.length}` : "Сьогодні пар немає";

    const nextWrap = document.getElementById("homeNextLessonWrap");
    if (groupedToday.length > 0) {
      const first = groupedToday[0];
      const linksHtml = renderLessonLinksHtml(first);
      nextWrap.innerHTML = `
        <div class="tg-section-card next-lesson-card">
          <div class="meta-label">Сьогодні за розкладом · ${escapeHtml(first.timeStart || "")}${first.timeEnd ? `–${escapeHtml(first.timeEnd)}` : ""}</div>
          <div class="meta-value" style="margin-top:3px;">${escapeHtml(first.name)} <span class="meta-sub">(${escapeHtml(first.type || "Пара")})</span></div>
          ${linksHtml ? `<div class="lesson-links-row">${linksHtml}</div>` : ""}
        </div>
      `;
    } else {
      nextWrap.innerHTML = "";
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

  function renderLessonLinksHtml(grp) {
    if (grp.subgroups && grp.subgroups.length > 0) {
      return grp.subgroups
        .filter((sg) => sg && sg.link)
        .map(
          (sg) =>
            `<a href="${escapeAttr(sg.link)}" target="_blank" rel="noopener noreferrer" class="tg-btn tg-btn-secondary tg-btn-sm">${ICONS.link}<span>${escapeHtml(sg.name || "Підгрупа")}</span></a>`,
        )
        .join("");
    }
    const links = Array.from(new Set((grp.items || []).map((i) => i.link).filter(Boolean)));
    return links
      .map(
        (lnk, idx) =>
          `<a href="${escapeAttr(lnk)}" target="_blank" rel="noopener noreferrer" class="tg-btn tg-btn-secondary tg-btn-sm">${ICONS.link}<span>${links.length > 1 ? `Посилання ${idx + 1}` : "Приєднатися"}</span></a>`,
      )
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
        <div class="tg-section-header" style="margin-bottom:6px;"><span>Одноразові події та спец. дати</span></div>
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

    const rawLessons =
      (sched.weeks && sched.weeks[state.selectedWeek] && sched.weeks[state.selectedWeek][state.selectedDay]) || [];
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
        const datesHtml =
          grp.dates && grp.dates.length > 0
            ? `<div class="lesson-special-date-box">
                <span>${ICONS.calendar} <b>Спец. дати:</b> ${escapeHtml(grp.dates.map(formatUkDate).join(", "))}</span>
              </div>`
            : "";

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
      card.className = "task-card";
      const isClosed = task.status === "closed";

      const badges = [];
      badges.push(
        `<span class="task-status-pill ${isClosed ? "closed" : "open"}">${isClosed ? "Закрито" : "Відкрито"}</span>`,
      );
      if (task.isSubmittedByMe) {
        badges.push(`<span class="task-status-pill submitted">${ICONS.check} Здано</span>`);
      }

      card.innerHTML = `
        ${task.subject ? `<span class="subject-tag-pill">${escapeHtml(task.subject)}</span>` : ""}
        <div class="task-top">
          <div class="task-title">${escapeHtml(task.title)}</div>
          <div style="display:flex; gap:5px; flex-wrap:wrap;">${badges.join("")}</div>
        </div>
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
      container.appendChild(card);
    }

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
    const allArticles = state.articles || [];
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
          ? "Артиклів ще немає. Натисніть «Створити артикль»!"
          : "Артиклів поки немає."
      }</div>`;
      return;
    }

    for (const art of list) {
      const card = document.createElement("div");
      card.className = "article-card";
      const tmp = document.createElement("div");
      tmp.innerHTML = art.contentHtml || "";
      const plain = (tmp.textContent || "").trim().slice(0, 140);
      const dateStr = art.updatedAt ? new Date(art.updatedAt).toLocaleDateString("uk-UA") : "";
      const slug = art.slug || art.id;

      card.innerHTML = `
        <div class="article-card-main" data-open-slug="${escapeAttr(slug)}">
          ${art.subject ? `<span class="subject-tag-pill">${escapeHtml(art.subject)}</span>` : ""}
          <div class="article-card-title">${escapeHtml(art.title)}</div>
          <div class="article-card-slug">/${escapeHtml(slug)}</div>
          <div class="meta-sub">${escapeHtml(art.author || "Адміністратор")}${dateStr ? ` · ${dateStr}` : ""}</div>
          ${plain ? `<div class="article-card-excerpt">${escapeHtml(plain)}${plain.length >= 140 ? "…" : ""}</div>` : ""}
        </div>
        <div class="article-card-actions">
          <button type="button" class="tg-btn tg-btn-secondary tg-btn-sm" data-copy-slug="${escapeAttr(slug)}">${ICONS.link}<span>Посилання</span></button>
          ${
            state.isAdmin
              ? `<button type="button" class="tg-btn tg-btn-secondary tg-btn-sm" data-edit-slug="${escapeAttr(slug)}">${ICONS.edit}<span>Редагувати</span></button>
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
        const url = `${window.location.origin}/${encodeURIComponent(btn.getAttribute("data-copy-slug"))}`;
        try {
          await navigator.clipboard.writeText(url);
          showToast("Посилання скопійовано!");
        } catch {
          showToast(url);
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
      const subText = u.username ? `@${u.username} · ID ${u.userId}` : `ID ${u.userId}`;

      let actionsHtml = "";
      if (state.isAdmin && !u.isAdmin) {
        if (state.usersTab === "verified") {
          actionsHtml = `
            <div class="user-card-actions">
              <button type="button" class="tg-btn tg-btn-danger tg-btn-sm" data-u-act="delete" data-u-id="${escapeAttr(u.userId)}">Видалити</button>
              <button type="button" class="tg-btn tg-btn-secondary tg-btn-sm" data-u-act="blacklist" data-u-id="${escapeAttr(u.userId)}">У ЧС</button>
            </div>
          `;
        } else if (state.usersTab === "pending") {
          actionsHtml = `
            <div class="user-card-actions">
              <button type="button" class="tg-btn tg-btn-success tg-btn-sm" data-u-act="approve" data-u-id="${escapeAttr(u.userId)}">Підтвердити</button>
              <button type="button" class="tg-btn tg-btn-secondary tg-btn-sm" data-u-act="reject" data-u-id="${escapeAttr(u.userId)}">Відхилити</button>
              <button type="button" class="tg-btn tg-btn-danger tg-btn-sm" data-u-act="blacklist" data-u-id="${escapeAttr(u.userId)}">У ЧС</button>
            </div>
          `;
        } else if (state.usersTab === "blacklisted") {
          actionsHtml = `
            <div class="user-card-actions">
              <button type="button" class="tg-btn tg-btn-secondary tg-btn-sm" data-u-act="unblacklist" data-u-id="${escapeAttr(u.userId)}">Винести з ЧС</button>
            </div>
          `;
        }
      }

      card.innerHTML = `
        <div class="user-card-row">
          <div class="avatar-circle avatar-md" data-user-avatar></div>
          <div class="user-card-info">
            <div class="user-card-name">
              <span>${escapeHtml(fullName)}</span>
              ${u.isAdmin ? '<span class="admin-crown-pill">Адмін</span>' : ""}
            </div>
            <div class="meta-sub">${escapeHtml(subText)}</div>
          </div>
        </div>
        ${actionsHtml}
      `;
      renderAvatarInto(card.querySelector("[data-user-avatar]"), u);
      container.appendChild(card);
    }

    container.querySelectorAll("[data-u-act]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const uid = btn.getAttribute("data-u-id");
        const act = btn.getAttribute("data-u-act");
        const confirms = {
          delete: "Видалити цього верифікованого учасника?",
          blacklist: "Занести користувача в чорний список?",
        };
        runUserAction(uid, act, confirms[act] || "");
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
                <textarea class="entity-cat-textarea" data-cat-text="${idx}" placeholder="Підпис до фото (необов'язково)...">${escapeHtml(cat.contentHtml || "")}</textarea>
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

  function renderClassLinksList() {
    const listEl = document.getElementById("classLinksList");
    const linksMap = state.schedule?.classLinks || {};
    const entries = Object.entries(linksMap);
    if (!entries.length) {
      listEl.innerHTML = '<div class="tg-empty-state">Посилань ще не додано</div>';
      return;
    }
    listEl.innerHTML = entries
      .map(([key, cfg]) => {
        const desc = cfg.splitSubgroups
          ? `${cfg.subgroup1Name || "Підгрупа 1"} / ${cfg.subgroup2Name || "Підгрупа 2"}`
          : cfg.link || "—";
        return `
          <div class="directory-item-btn" style="cursor:default;">
            <div style="min-width:0;">
              <div class="meta-value">${escapeHtml(cfg.subject)} <span class="meta-sub">(${escapeHtml(cfg.type)})</span></div>
              <div class="meta-sub" style="overflow:hidden; text-overflow:ellipsis;">${escapeHtml(desc)}${cfg.room ? ` · ${escapeHtml(cfg.room)}` : ""}</div>
            </div>
            <button type="button" class="tg-btn tg-btn-danger tg-btn-sm" data-del-cl="${escapeAttr(key)}">${ICONS.trash}</button>
          </div>
        `;
      })
      .join("");
    listEl.querySelectorAll("[data-del-cl]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        try {
          const res = await apiFetch("/api/schedule/links/delete", {
            method: "POST",
            body: JSON.stringify({ key: btn.getAttribute("data-del-cl") }),
          });
          if (!res.ok) throw new Error(res.error || "Помилка");
          state.schedule = res.schedule;
          renderClassLinksList();
          renderSchedule();
          showToast("Посилання видалено");
        } catch (err) {
          showToast(err.message);
        }
      });
    });
  }

  function openClassLinksModal() {
    populateSubjectSelect(document.getElementById("clSubjectSelect"), "", "Оберіть предмет...");
    populateLessonTypeSelect(document.getElementById("clTypeSelect"), "Лекція");
    document.getElementById("clRoomInput").value = "";
    document.getElementById("clSplitCheck").checked = false;
    document.getElementById("clSingleWrap").hidden = false;
    document.getElementById("clSubgroupsWrap").hidden = true;
    document.getElementById("clLinkInput").value = "";
    document.getElementById("clSg1Link").value = "";
    document.getElementById("clSg2Link").value = "";
    renderClassLinksList();
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
    document.querySelectorAll("[data-dir-type]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-dir-type") === activeDirType);
    });
    document.getElementById("directoryAdminCreate").hidden = !state.isAdmin;

    const listEl = document.getElementById("directoryList");
    const items = collectEntitiesFromScheduleAndProfiles(activeDirType);
    listEl.innerHTML = "";

    if (!items.length) {
      listEl.innerHTML = '<div class="tg-empty-state">Список порожній</div>';
      return;
    }

    const bucket = activeDirType === "lecturer" ? "lecturers" : "subjects";
    for (const name of items) {
      const prof = state.profiles?.[bucket]?.[name];
      const count = prof?.categories?.length || 0;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "directory-item-btn";
      btn.innerHTML = `<span>${escapeHtml(name)}</span>${count > 0 ? `<span class="tg-pill">${count}</span>` : ""}`;
      btn.addEventListener("click", () => {
        document.getElementById("directoryModal").hidden = true;
        openEntityProfile(activeDirType, name);
      });
      listEl.appendChild(btn);
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

  document.getElementById("articleHomeBtn").addEventListener("click", () => {
    haptic("light");
    navigateTo("/home");
  });

  // Guest Gate Listeners
  document.getElementById("guestSaveIdBtn").addEventListener("click", () => {
    const val = document.getElementById("guestManualIdInput").value.trim();
    if (!/^\d+$/.test(val)) {
      showToast("Введіть коректний числовий Telegram ID");
      return;
    }
    try {
      localStorage.setItem(USER_ID_STORAGE_KEY, val);
    } catch {}
    bootstrap();
  });

  document.getElementById("guestRegisterForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const lastName = document.getElementById("regLastName").value.trim();
    const firstName = document.getElementById("regFirstName").value.trim();
    const btn = document.getElementById("guestRegisterBtn");
    btn.disabled = true;
    try {
      const res = await apiFetch("/api/register", {
        method: "POST",
        body: JSON.stringify({ lastName, firstName }),
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
      link: split ? "" : document.getElementById("evtLinkInput").value.trim(),
      subgroups: split
        ? [
            { name: document.getElementById("evtSg1Name").value.trim(), link: document.getElementById("evtSg1Link").value.trim() },
            { name: document.getElementById("evtSg2Name").value.trim(), link: document.getElementById("evtSg2Link").value.trim() },
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
  document.getElementById("clSplitCheck").addEventListener("change", (e) => {
    document.getElementById("clSingleWrap").hidden = e.target.checked;
    document.getElementById("clSubgroupsWrap").hidden = !e.target.checked;
  });
  document.getElementById("classLinkForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const subject = document.getElementById("clSubjectSelect").value;
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
          type: document.getElementById("clTypeSelect").value,
          room: document.getElementById("clRoomInput").value.trim(),
          splitSubgroups: split,
          link: split ? "" : document.getElementById("clLinkInput").value.trim(),
          subgroup1Name: document.getElementById("clSg1Name").value.trim(),
          subgroup1Link: document.getElementById("clSg1Link").value.trim(),
          subgroup2Name: document.getElementById("clSg2Name").value.trim(),
          subgroup2Link: document.getElementById("clSg2Link").value.trim(),
        }),
      });
      if (!res.ok) throw new Error(res.error || "Помилка збереження");
      state.schedule = res.schedule;
      renderClassLinksList();
      renderSchedule();
      showToast("Посилання збережено!");
    } catch (err) {
      showToast(err.message);
    }
  });

  // Bot Notifications Modal
  document.getElementById("openNotifSettingsBtn").addEventListener("click", () => {
    const cfg = state.schedule?.notificationSettings || {};
    document.getElementById("notifEnabledCheck").checked = Boolean(cfg.enabled);
    document.getElementById("notifChatIdInput").value = cfg.chatId || "";
    document.getElementById("notifThreadIdInput").value = cfg.threadId || "";
    document.getElementById("notifSettingsModal").hidden = false;
  });
  document.getElementById("closeNotifSettingsModalBtn").addEventListener("click", () => {
    document.getElementById("notifSettingsModal").hidden = true;
  });
  document.getElementById("notifSettingsForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch("/api/schedule/notifications", {
        method: "POST",
        body: JSON.stringify({
          enabled: document.getElementById("notifEnabledCheck").checked,
          chatId: document.getElementById("notifChatIdInput").value.trim(),
          threadId: document.getElementById("notifThreadIdInput").value.trim() || null,
        }),
      });
      if (!res.ok) throw new Error(res.error || "Помилка збереження");
      state.schedule = res.schedule;
      document.getElementById("notifSettingsModal").hidden = true;
      showToast("Налаштування сповіщень збережено!");
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

  // Users Admin Tabs
  document.querySelectorAll("[data-users-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      haptic("light");
      state.usersTab = btn.getAttribute("data-users-tab");
      renderUsers();
    });
  });

  // Profile Listeners
  document.getElementById("openBotBtn").addEventListener("click", () => openBotDeepLink(""));

  document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const lastName = document.getElementById("inputLastName").value.trim();
    const firstName = document.getElementById("inputFirstName").value.trim();
    const btn = document.getElementById("saveProfileBtn");
    btn.disabled = true;
    try {
      const res = await apiFetch("/api/profile", {
        method: "POST",
        body: JSON.stringify({ lastName, firstName }),
      });
      if (!res.ok) throw new Error(res.error || "Не вдалося зберегти");
      state.user = { ...state.user, ...res.user, isRegistered: true };
      renderProfile();
      showToast("ПІБ збережено!");
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
      const dataUrl = await compressImageFile(file, 320, 0.8);
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
  document.getElementById("cancelArticleEditBtn").addEventListener("click", () => navigateTo("/articles"));

  document.querySelectorAll("#articleToolbar button[data-cmd]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("editArticleBody").focus();
      document.execCommand(btn.getAttribute("data-cmd"), false, btn.getAttribute("data-val") || null);
    });
  });

  document.querySelectorAll("#articleToolbar button[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const act = btn.getAttribute("data-action");
      const ed = document.getElementById("editArticleBody");
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
      } else if (act === "link") {
        const url = prompt("Введіть посилання (https://...):");
        if (url) document.execCommand("createLink", false, url);
      } else if (act === "imageUrl") {
        const url = prompt("Вставте пряме посилання на зображення (https://...):");
        if (url && /^https?:\/\//i.test(url.trim())) {
          insertImageUrlIntoEditor(url.trim());
        } else if (url) {
          showToast("Посилання має починатися з http:// або https://");
        }
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

  document.getElementById("articleImageInput").addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    e.target.value = "";
    try {
      showToast("Завантаження зображення...");
      const dataUrl = await compressImageFile(file, 1280, 0.82);
      const res = await apiFetch("/api/media/upload", {
        method: "POST",
        body: JSON.stringify({ dataUrl, folder: "articles" }),
      });
      if (!res.ok || !res.url) throw new Error(res.error || "Помилка завантаження фото");
      insertImageUrlIntoEditor(res.url);
      showToast("Фото додано за посиланням!");
    } catch (err) {
      showToast(err.message);
    }
  });

  document.getElementById("saveArticleBtn").addEventListener("click", async () => {
    const title = document.getElementById("editArticleTitle").value.trim();
    const author = document.getElementById("editArticleAuthor").value.trim();
    const subject = document.getElementById("editArticleSubject").value;
    const ed = document.getElementById("editArticleBody");

    // Normalize relative /api/media/ src attributes before saving
    const clone = ed.cloneNode(true);
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
        body: JSON.stringify({ id: state.activeArticleId, title, author, subject, contentHtml }),
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
  document.getElementById("createEntityBtn").addEventListener("click", () => {
    const inp = document.getElementById("newEntityNameInput");
    const name = inp.value.trim();
    if (!name) {
      showToast("Введіть назву або ПІБ");
      return;
    }
    inp.value = "";
    document.getElementById("directoryModal").hidden = true;
    openEntityProfile(activeDirType, name);
  });

  bootstrap();
})();
