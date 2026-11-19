(function () {
  const THEME_STORAGE_KEY = "tg_archiver_theme";
  const USER_ID_STORAGE_KEY = "tg_archiver_user_id";
  const FALLBACK_SERVER_URL = "http://78.154.103.37:14370";
  const DAYS_SHORT = {
    "Понеділок": "Пн",
    "Вівторок": "Вт",
    "Середа": "Ср",
    "Четвер": "Чт",
    "П'ятниця": "Пт",
    "Субота": "Сб",
  };
  const DAYS_ORDER = ["Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота"];

  const ICONS = {
    user: '<svg class="tg-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    pin: '<svg class="tg-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    link: '<svg class="tg-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    clock: '<svg class="tg-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    file: '<svg class="tg-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    upload: '<svg class="tg-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
    archive: '<svg class="tg-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>',
    trash: '<svg class="tg-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    camera: '<svg class="tg-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
    check: '<svg class="tg-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  };

  const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
  if (tg) {
    try {
      tg.ready();
      tg.expand();
    } catch {}
  }

  const state = {
    theme: document.documentElement.getAttribute("data-theme") || "light",
    activeTab: "schedule",
    selectedWeek: "1",
    selectedDay: "Понеділок",
    schedule: null,
    tasks: [],
    articles: [],
    profiles: { subjects: {}, lecturers: {} },
    user: null,
    isAdmin: false,
    authMode: "guest",
    botUsername: "ES61bot",
    activeArticleId: null,
    activeEntity: null, // { type: "subject" | "lecturer", key, name, categories: [] }
  };

  let resolvedApiBase = "";

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

  function getApiBasesToTry() {
    if (window.location.protocol === "https:") {
      return [""];
    }
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
        const res = await fetch(`${base}${path}`, {
          ...options,
          headers: {
            ...getAuthHeaders(hasBody),
            ...(options.headers || {}),
          },
        });
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

  // ==================== SCHEDULE (GROUPED CARDS) ====================

  function groupLessonsBySlotAndSubject(lessons) {
    const groups = [];
    const map = new Map();
    for (const l of lessons) {
      const key = `${l.pair || ""}|${l.timeStart || ""}|${(l.name || "").trim()}|${(l.type || "").trim()}`;
      if (!map.has(key)) {
        const grp = {
          pair: l.pair,
          timeStart: l.timeStart,
          timeEnd: l.timeEnd,
          name: l.name,
          type: l.type,
          items: [],
        };
        map.set(key, grp);
        groups.push(grp);
      }
      const grp = map.get(key);
      // Уникаємо повних дублів усередині групи
      const dup = grp.items.some(
        (x) =>
          x.lecturer === l.lecturer &&
          x.room === l.room &&
          x.link === l.link,
      );
      if (!dup) grp.items.push(l);
    }
    return groups;
  }

  function renderSchedule() {
    const sched = state.schedule;
    if (!sched) return;

    const groupName = sched.groupName || "ЕС-61";
    document.getElementById("groupBadge").textContent = groupName.slice(0, 2).toUpperCase();
    if (state.activeTab === "schedule") {
      document.getElementById("headerTitle").textContent = `Розклад ${groupName}`;
    }

    document.getElementById("week1Badge").hidden = Number(sched.currentWeek) !== 1;
    document.getElementById("week2Badge").hidden = Number(sched.currentWeek) !== 2;

    document.querySelectorAll(".week-btn").forEach((btn) => {
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

        const typeLower = String(grp.type || "").toLowerCase();
        const typeClass = typeLower.includes("лек")
          ? "type-lec"
          : typeLower.includes("лаб")
            ? "type-lab"
            : "type-prac";

        const subItemsHtml = grp.items
          .map((item, idx) => {
            const lecturerBtn = item.lecturer
              ? `<button type="button" class="entity-link-btn" data-open-entity="lecturer" data-entity-name="${escapeAttr(item.lecturer)}">${ICONS.user}<span>${escapeHtml(item.lecturer)}</span></button>`
              : "";
            const roomTag = item.room ? `<span class="lesson-room-tag">${ICONS.pin}<span>${escapeHtml(item.room)}</span></span>` : "";
            const linkTag = item.link
              ? `<a href="${escapeAttr(item.link)}" target="_blank" rel="noopener noreferrer" class="entity-link-btn">${ICONS.link}<span>Пара</span></a>`
              : "";
            const prefix = grp.items.length > 1 ? `<b>${idx + 1}.</b> ` : "";
            return `
              <div class="lesson-subitem">
                <div class="lesson-subitem-row">${prefix}${lecturerBtn || "<span>Викладач не вказаний</span>"}</div>
                ${roomTag || linkTag ? `<div class="lesson-subitem-row">${roomTag}${linkTag}</div>` : ""}
              </div>
            `;
          })
          .join("");

        card.innerHTML = `
          <div class="lesson-time-col">
            <div class="lesson-pair-num">${grp.pair || "—"} пара</div>
            <div class="lesson-time-start">${escapeHtml(grp.timeStart || "")}</div>
            <div class="lesson-time-end">${escapeHtml(grp.timeEnd || "")}</div>
          </div>
          <div class="lesson-body">
            <div class="lesson-badges">
              <span class="lesson-badge ${typeClass}">${escapeHtml(grp.type || "Пара")}</span>
              ${grp.items.length > 1 ? `<span class="lesson-badge count-pill">${grp.items.length} підгрупи / пункти</span>` : ""}
            </div>
            <button type="button" class="lesson-title-btn" data-open-entity="subject" data-entity-name="${escapeAttr(grp.name || "Дисципліна")}">
              ${escapeHtml(grp.name || "Дисципліна")}
            </button>
            <div class="lesson-subgroups">${subItemsHtml}</div>
          </div>
        `;
        container.appendChild(card);
      }

      container.querySelectorAll("[data-open-entity]").forEach((btn) => {
        btn.addEventListener("click", () => {
          haptic("light");
          openEntityProfile(
            btn.getAttribute("data-open-entity"),
            btn.getAttribute("data-entity-name"),
          );
        });
      });
    }

    document.getElementById("lastSyncedText").textContent = sched.lastSyncedKyiv
      ? `Останнє оновлення: ${sched.lastSyncedKyiv}`
      : "Останнє оновлення: ще не виконано";
  }

  // ==================== TASKS (DEEP-LINK TO BOT) ====================

  function renderTasks() {
    const container = document.getElementById("tasksContainer");
    const pill = document.getElementById("tasksCountPill");
    const tasks = state.tasks || [];
    pill.textContent = String(tasks.length);
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
              ? `<button class="tg-btn tg-btn-primary" type="button" data-bot-task="${escapeAttr(task.id)}">${ICONS.upload}<span>Здати в боті</span></button>`
              : ""
          }
          ${
            state.isAdmin && task.submissionsCount > 0
              ? `<button class="tg-btn tg-btn-secondary" type="button" data-bot-archive="${escapeAttr(task.id)}">${ICONS.archive}<span>Архів у боті</span></button>`
              : ""
          }
        </div>
      `;
      container.appendChild(card);
    }

    container.querySelectorAll("[data-bot-task]").forEach((btn) => {
      btn.addEventListener("click", () => {
        haptic("light");
        openBotDeepLink(`task_${btn.getAttribute("data-bot-task")}`);
      });
    });

    container.querySelectorAll("[data-bot-archive]").forEach((btn) => {
      btn.addEventListener("click", () => {
        haptic("light");
        openBotDeepLink(`archive_${btn.getAttribute("data-bot-archive")}`);
      });
    });
  }

  // ==================== ARTICLES (TELEGRAPH-STYLE) ====================

  function renderArticles() {
    const newBtn = document.getElementById("newArticleBtn");
    newBtn.hidden = !state.isAdmin;

    const container = document.getElementById("articlesContainer");
    const list = state.articles || [];
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
      const dateStr = art.updatedAt
        ? new Date(art.updatedAt).toLocaleDateString("uk-UA")
        : "";

      card.innerHTML = `
        <div class="article-card-title">${escapeHtml(art.title)}</div>
        <div class="meta-sub">${escapeHtml(art.author || "Адміністратор")}${dateStr ? ` · ${dateStr}` : ""}</div>
        ${plain ? `<div class="article-card-excerpt">${escapeHtml(plain)}${plain.length >= 140 ? "…" : ""}</div>` : ""}
      `;
      card.addEventListener("click", () => {
        haptic("light");
        openArticleReader(art.id);
      });
      container.appendChild(card);
    }
  }

  function openArticleReader(articleId) {
    const art = (state.articles || []).find((a) => a.id === articleId);
    if (!art) return;
    state.activeArticleId = articleId;

    document.getElementById("articleModalTitle").textContent = "Артикль";
    document.getElementById("articleReadView").hidden = false;
    document.getElementById("articleEditView").hidden = true;
    document.getElementById("editArticleBtn").hidden = !state.isAdmin;
    document.getElementById("deleteArticleBtn").hidden = !state.isAdmin;

    const dateStr = art.updatedAt ? new Date(art.updatedAt).toLocaleString("uk-UA") : "";
    document.getElementById("readArticleTitle").textContent = art.title;
    document.getElementById("readArticleMeta").textContent = `${art.author || "Адміністратор"}${dateStr ? ` · ${dateStr}` : ""}`;
    document.getElementById("readArticleBody").innerHTML = art.contentHtml || "<i>Текст порожній</i>";
    document.getElementById("articleModal").hidden = false;
  }

  function openArticleEditor(articleId = null) {
    if (!state.isAdmin) return;
    const art = articleId ? (state.articles || []).find((a) => a.id === articleId) : null;
    state.activeArticleId = art ? art.id : null;

    document.getElementById("articleModalTitle").textContent = art ? "Редагувати артикль" : "Новий артикль";
    document.getElementById("articleReadView").hidden = true;
    document.getElementById("articleEditView").hidden = false;
    document.getElementById("editArticleBtn").hidden = true;
    document.getElementById("deleteArticleBtn").hidden = !art;

    const defaultAuthor = `${state.user?.lastName || ""} ${state.user?.firstName || ""}`.trim() || "Адміністратор";
    document.getElementById("editArticleTitle").value = art ? art.title : "";
    document.getElementById("editArticleAuthor").value = art ? art.author || "" : defaultAuthor;
    document.getElementById("editArticleBody").innerHTML = art ? art.contentHtml || "" : "";
    document.getElementById("articleModal").hidden = false;
  }

  // ==================== SUBJECT & LECTURER PROFILES ====================

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
                ${cat.imageData ? `<img src="${escapeAttr(cat.imageData)}" class="entity-cat-photo" alt="Фото" />` : ""}
                <label class="tg-btn tg-btn-secondary tg-btn-sm" style="align-self:flex-start;">
                  ${ICONS.camera}<span>${cat.imageData ? "Змінити фото" : "Завантажити фото"}</span>
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
          ${cat.imageData ? `<img src="${escapeAttr(cat.imageData)}" class="entity-cat-photo" alt="${escapeAttr(cat.title)}" />` : ""}
          ${cat.contentHtml ? `<div style="white-space:pre-wrap; font-size:14px;">${escapeHtml(cat.contentHtml)}</div>` : ""}
        `;
      }
      listEl.appendChild(card);
    });

    if (state.isAdmin) {
      listEl.querySelectorAll("[data-cat-title]").forEach((inp) => {
        inp.addEventListener("input", () => {
          const i = Number(inp.getAttribute("data-cat-title"));
          state.activeEntity.categories[i].title = inp.value;
        });
      });
      listEl.querySelectorAll("[data-cat-text]").forEach((ta) => {
        ta.addEventListener("input", () => {
          const i = Number(ta.getAttribute("data-cat-text"));
          state.activeEntity.categories[i].contentHtml = ta.value;
        });
      });
      listEl.querySelectorAll("[data-cat-del]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const i = Number(btn.getAttribute("data-cat-del"));
          state.activeEntity.categories.splice(i, 1);
          renderEntityCategories();
        });
      });
      listEl.querySelectorAll("[data-cat-photo]").forEach((inp) => {
        inp.addEventListener("change", (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          const i = Number(inp.getAttribute("data-cat-photo"));
          const reader = new FileReader();
          reader.onload = () => {
            state.activeEntity.categories[i].imageData = String(reader.result || "");
            renderEntityCategories();
          };
          reader.readAsDataURL(file);
        });
      });
    }
  }

  // ==================== PROFILE & TABS ====================

  function renderProfile() {
    const user = state.user || {};
    const fullName = `${user.lastName || ""} ${user.firstName || ""}`.trim() || "Гість";
    const initials = ((user.lastName || "")[0] || "") + ((user.firstName || "")[0] || "") || "?";
    const isGuest = !user.userId || user.userId === "guest";

    document.getElementById("profileAvatar").textContent = initials.toUpperCase();
    document.getElementById("profileFullName").textContent = fullName;
    document.getElementById("profileUsername").textContent = user.username
      ? `@${user.username}`
      : isGuest
        ? "Telegram ID не розпізнано"
        : `ID: ${user.userId}`;

    document.getElementById("manualUserIdCard").hidden = !isGuest;
    document.getElementById("inputLastName").value = user.lastName || "";
    document.getElementById("inputFirstName").value = user.firstName || "";

    document.getElementById("infoUserId").textContent = isGuest ? "Не розпізнано" : user.userId;
    document.getElementById("infoUserRole").textContent = state.isAdmin ? "Адміністратор" : "Користувач";
    document.getElementById("infoBotUsername").textContent = state.botUsername ? `@${state.botUsername}` : "ES61bot";
    document.getElementById("adminHeaderPill").hidden = !state.isAdmin;
  }

  function switchTab(tabName) {
    state.activeTab = tabName;
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === `tab-${tabName}`);
    });
    document.querySelectorAll(".tg-nav-pill").forEach((tab) => {
      tab.classList.toggle("active", tab.getAttribute("data-tab") === tabName);
    });

    const groupName = state.schedule?.groupName || "ЕС-61";
    const titles = {
      schedule: `Розклад ${groupName}`,
      tasks: "Завдання",
      articles: "Артиклі",
      profile: "Профіль",
    };
    document.getElementById("headerTitle").textContent = titles[tabName] || "Бот-архіватор";
  }

  async function bootstrap() {
    const dot = document.getElementById("serverStatusDot");
    const statusText = document.getElementById("serverStatusText");
    try {
      const data = await apiFetch("/api/bootstrap");
      if (!data.ok) throw new Error(data.error || "Помилка завантаження");

      state.user = data.user;
      state.isAdmin = Boolean(data.isAdmin);
      state.authMode = data.authMode;
      state.botUsername = data.botUsername || "ES61bot";
      state.schedule = data.schedule;
      state.tasks = data.tasks || [];
      state.articles = data.articles || [];
      state.profiles = data.profiles || { subjects: {}, lecturers: {} };

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

      dot.className = "status-dot online";
      statusText.textContent = `Онлайн · ${data.schedule?.serverTimeKyiv || ""}`;

      renderSchedule();
      renderTasks();
      renderArticles();
      renderProfile();
    } catch (err) {
      dot.className = "status-dot offline";
      statusText.textContent = "Немає зв'язку з сервером";
      showToast(`Помилка з'єднання: ${err.message}`);
    }
  }

  // ==================== EVENT LISTENERS ====================

  document.getElementById("themeToggleBtn").addEventListener("click", () => {
    haptic("light");
    const next = state.theme === "dark" ? "light" : "dark";
    applyTheme(next, { persistLocal: true, persistServer: true });
    showToast(next === "dark" ? "Темну тему збережено" : "Світлу тему збережено");
  });

  document.querySelectorAll("[data-set-theme]").forEach((btn) => {
    btn.addEventListener("click", () => {
      haptic("light");
      const next = btn.getAttribute("data-set-theme");
      applyTheme(next, { persistLocal: true, persistServer: true });
      showToast(next === "dark" ? "Темну тему збережено" : "Світлу тему збережено");
    });
  });

  document.querySelectorAll(".tg-nav-pill").forEach((tab) => {
    tab.addEventListener("click", () => {
      haptic("light");
      switchTab(tab.getAttribute("data-tab"));
    });
  });

  document.querySelectorAll(".week-btn").forEach((btn) => {
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
      showToast(`Помилка: ${err.message}`);
    } finally {
      btn.disabled = false;
      btn.textContent = "Оновити";
    }
  });

  document.getElementById("saveManualUserIdBtn").addEventListener("click", () => {
    const val = document.getElementById("manualUserIdInput").value.trim();
    if (!/^\d+$/.test(val)) {
      showToast("Введіть коректний числовий Telegram ID");
      return;
    }
    try {
      localStorage.setItem(USER_ID_STORAGE_KEY, val);
    } catch {}
    bootstrap();
    showToast("Telegram ID збережено!");
  });

  document.getElementById("openBotBtn").addEventListener("click", () => {
    openBotDeepLink("");
  });

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

  // Articles Listeners
  document.getElementById("newArticleBtn").addEventListener("click", () => openArticleEditor(null));
  document.getElementById("editArticleBtn").addEventListener("click", () => openArticleEditor(state.activeArticleId));
  document.getElementById("closeArticleModalBtn").addEventListener("click", () => {
    document.getElementById("articleModal").hidden = true;
  });
  document.getElementById("cancelArticleEditBtn").addEventListener("click", () => {
    if (state.activeArticleId) openArticleReader(state.activeArticleId);
    else document.getElementById("articleModal").hidden = true;
  });

  document.querySelectorAll("#articleToolbar button[data-cmd]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cmd = btn.getAttribute("data-cmd");
      const val = btn.getAttribute("data-val") || null;
      document.getElementById("editArticleBody").focus();
      document.execCommand(cmd, false, val);
    });
  });

  document.querySelectorAll("#articleToolbar button[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const act = btn.getAttribute("data-action");
      const ed = document.getElementById("editArticleBody");
      ed.focus();
      if (act === "link") {
        const url = prompt("Введіть посилання (https://...):");
        if (url) document.execCommand("createLink", false, url);
      } else if (act === "code") {
        const sel = window.getSelection()?.toString() || "код";
        document.execCommand("insertHTML", false, `<code>${escapeHtml(sel)}</code>`);
      }
    });
  });

  document.getElementById("articleImageInput").addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      document.getElementById("editArticleBody").focus();
      document.execCommand("insertImage", false, String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  });

  document.getElementById("saveArticleBtn").addEventListener("click", async () => {
    const title = document.getElementById("editArticleTitle").value.trim();
    const author = document.getElementById("editArticleAuthor").value.trim();
    const contentHtml = document.getElementById("editArticleBody").innerHTML.trim();
    if (!title) {
      showToast("Вкажіть заголовок артикля");
      return;
    }
    const btn = document.getElementById("saveArticleBtn");
    btn.disabled = true;
    try {
      const res = await apiFetch("/api/articles", {
        method: "POST",
        body: JSON.stringify({ id: state.activeArticleId, title, author, contentHtml }),
      });
      if (!res.ok) throw new Error(res.error || "Помилка збереження");
      state.articles = res.articles || [];
      renderArticles();
      openArticleReader(res.article.id);
      showToast("Артикль опубліковано!");
    } catch (err) {
      showToast(err.message);
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById("deleteArticleBtn").addEventListener("click", async () => {
    if (!state.activeArticleId) return;
    try {
      const res = await apiFetch("/api/articles/delete", {
        method: "POST",
        body: JSON.stringify({ id: state.activeArticleId }),
      });
      if (!res.ok) throw new Error(res.error || "Помилка видалення");
      state.articles = res.articles || [];
      renderArticles();
      document.getElementById("articleModal").hidden = true;
      showToast("Артикль видалено");
    } catch (err) {
      showToast(err.message);
    }
  });

  // Entity Profile Listeners
  document.getElementById("closeEntityModalBtn").addEventListener("click", () => {
    document.getElementById("entityProfileModal").hidden = true;
  });

  document.querySelectorAll("[data-add-cat]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!state.activeEntity) return;
      const kind = btn.getAttribute("data-add-cat");
      const titles = {
        description: "Опис",
        contacts: "Контакти",
        photo: "Фото",
        custom: "Додаткова інформація",
      };
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

  bootstrap();
})();
