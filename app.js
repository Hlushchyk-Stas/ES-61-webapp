(function () {
  const THEME_STORAGE_KEY = "tg_archiver_theme";
  const DAYS_SHORT = {
    "Понеділок": "Пн",
    "Вівторок": "Вт",
    "Середа": "Ср",
    "Четвер": "Чт",
    "П'ятниця": "Пт",
    "Субота": "Сб",
  };
  const DAYS_ORDER = ["Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота"];

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
    user: null,
    authMode: "guest",
    botUsername: "",
    uploadTaskId: null,
  };

  function haptic(type = "light") {
    try {
      if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred(type);
      }
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

  function getAuthHeaders() {
    const headers = { "Content-Type": "application/json" };
    if (tg && tg.initData) {
      headers["X-Telegram-Init-Data"] = tg.initData;
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const uid = urlParams.get("userId");
      if (uid) headers["X-Telegram-User-Id"] = uid;
    }
    return headers;
  }

  const FALLBACK_SERVER_URL = "http://78.154.103.37:14370";
  let resolvedApiBase = "";

  function getApiBasesToTry() {
    if (window.location.protocol === "https:") {
      return [""];
    }
    const bases = [];
    if (resolvedApiBase) bases.push(resolvedApiBase);
    if (window.location.protocol !== "file:") {
      if (!bases.includes("")) bases.push("");
    }
    if (window.location.origin !== FALLBACK_SERVER_URL && !bases.includes(FALLBACK_SERVER_URL)) {
      bases.push(FALLBACK_SERVER_URL);
    }
    return bases;
  }

  async function apiFetch(path, options = {}) {
    const bases = getApiBasesToTry();
    let lastErr = null;
    for (const base of bases) {
      try {
        const res = await fetch(`${base}${path}`, {
          ...options,
          headers: {
            ...getAuthHeaders(),
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

    const lessons = (sched.weeks && sched.weeks[state.selectedWeek] && sched.weeks[state.selectedWeek][state.selectedDay]) || [];
    const container = document.getElementById("lessonsContainer");
    container.innerHTML = "";

    if (!lessons.length) {
      const empty = document.createElement("div");
      empty.className = "tg-empty-state";
      empty.textContent = sched.lastError
        ? `Немає пар або очікується оновлення (${sched.lastError})`
        : `На ${state.selectedDay.toLowerCase()} (${state.selectedWeek}-й тиждень) пар немає 🎉`;
      container.appendChild(empty);
    } else {
      for (const lesson of lessons) {
        const card = document.createElement("div");
        card.className = "lesson-card";

        const typeLower = String(lesson.type || "").toLowerCase();
        const typeClass = typeLower.includes("лек")
          ? "type-lec"
          : typeLower.includes("лаб")
            ? "type-lab"
            : "type-prac";

        card.innerHTML = `
          <div class="lesson-time-col">
            <div class="lesson-pair-num">${lesson.pair || "—"} пара</div>
            <div class="lesson-time-start">${escapeHtml(lesson.timeStart || "")}</div>
            <div class="lesson-time-end">${escapeHtml(lesson.timeEnd || "")}</div>
          </div>
          <div class="lesson-body">
            <div class="lesson-badges">
              <span class="lesson-badge ${typeClass}">${escapeHtml(lesson.type || "Пара")}</span>
            </div>
            <div class="lesson-title">${escapeHtml(lesson.name || "Дисципліна")}</div>
            <div class="lesson-meta">
              ${lesson.lecturer ? `<span>👤 ${escapeHtml(lesson.lecturer)}</span>` : ""}
              ${lesson.room ? `<span>📍 ${escapeHtml(lesson.room)}</span>` : ""}
              ${lesson.link ? `<a href="${escapeAttr(lesson.link)}" target="_blank" rel="noopener noreferrer" style="color: var(--tg-accent); text-decoration: none;">🔗 Приєднатись до пари</a>` : ""}
            </div>
          </div>
        `;
        container.appendChild(card);
      }
    }

    document.getElementById("lastSyncedText").textContent = sched.lastSyncedKyiv
      ? `Останнє оновлення: ${sched.lastSyncedKyiv}`
      : "Останнє оновлення: ще не виконано";
  }

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
        badges.push(`<span class="task-status-pill submitted">✓ Здано</span>`);
      }

      card.innerHTML = `
        <div class="task-top">
          <div class="task-title">${escapeHtml(task.title)}</div>
          <div style="display:flex; gap:5px; flex-wrap:wrap;">${badges.join("")}</div>
        </div>
        <div class="meta-sub">
          ⏳ ${escapeHtml(formatCountdown(task.deadlineMs, task.status))} · 📄 Здано робіт: <b>${task.submissionsCount}</b>
        </div>
        ${
          task.mySubmission
            ? `<div class="meta-sub">Ваш файл: <code>${escapeHtml(task.mySubmission.renamedFileName)}</code></div>`
            : ""
        }
        <div class="task-actions">
          ${
            !isClosed
              ? `<button class="tg-btn tg-btn-primary" type="button" data-upload-task="${escapeAttr(task.id)}">📤 Здати роботу</button>`
              : ""
          }
          ${
            task.submissionsCount > 0
              ? `<a class="tg-btn tg-btn-secondary" href="${resolvedApiBase}/api/tasks/archive?taskId=${encodeURIComponent(task.id)}" target="_blank">📦 ZIP-архів</a>`
              : ""
          }
        </div>
      `;
      container.appendChild(card);
    }

    container.querySelectorAll("[data-upload-task]").forEach((btn) => {
      btn.addEventListener("click", () => {
        haptic("light");
        openUploadModal(btn.getAttribute("data-upload-task"));
      });
    });
  }

  function renderProfile() {
    const user = state.user || {};
    const fullName = `${user.lastName || ""} ${user.firstName || ""}`.trim() || "Гість";
    const initials =
      ((user.lastName || "")[0] || "") + ((user.firstName || "")[0] || "") || "?";

    document.getElementById("profileAvatar").textContent = initials.toUpperCase();
    document.getElementById("profileFullName").textContent = fullName;
    document.getElementById("profileUsername").textContent = user.username
      ? `@${user.username}`
      : `ID: ${user.userId || "гість"}`;

    document.getElementById("inputLastName").value = user.lastName || "";
    document.getElementById("inputFirstName").value = user.firstName || "";

    document.getElementById("infoBotUsername").textContent = state.botUsername
      ? `@${state.botUsername}`
      : "Telegram-бот";
    document.getElementById("infoAuthMode").textContent =
      state.authMode === "telegram"
        ? "Telegram Mini App (верифіковано)"
        : state.authMode === "browser"
          ? "Браузер (за userId)"
          : "Гість";
  }

  function openUploadModal(taskId) {
    const task = (state.tasks || []).find((t) => t.id === taskId);
    if (!task) return;
    state.uploadTaskId = taskId;
    document.getElementById("uploadModalTitle").textContent = `Здати: ${task.title}`;
    document.getElementById("uploadTemplateHint").textContent = `Шаблон перейменування: ${task.fileTemplate}`;
    document.getElementById("uploadFileInput").value = "";
    document.getElementById("uploadFileNameLabel").textContent = "Оберіть файл з пристрою (до 20 МБ)";
    document.getElementById("submitFileBtn").disabled = true;
    document.getElementById("uploadModal").hidden = false;
  }

  function closeUploadModal() {
    document.getElementById("uploadModal").hidden = true;
    state.uploadTaskId = null;
  }

  function switchTab(tabName) {
    state.activeTab = tabName;
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === `tab-${tabName}`);
    });
    document.querySelectorAll(".tg-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.getAttribute("data-tab") === tabName);
    });

    const groupName = state.schedule?.groupName || "ЕС-61";
    const titles = {
      schedule: `Розклад ${groupName}`,
      tasks: "Завдання та архіви",
      profile: "Профіль та налаштування",
    };
    document.getElementById("headerTitle").textContent = titles[tabName] || "Бот-архіватор";
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

  async function bootstrap() {
    const dot = document.getElementById("serverStatusDot");
    const statusText = document.getElementById("serverStatusText");
    try {
      const data = await apiFetch("/api/bootstrap");
      if (!data.ok) throw new Error(data.error || "Помилка завантаження");

      state.user = data.user;
      state.authMode = data.authMode;
      state.botUsername = data.botUsername || "";
      state.schedule = data.schedule;
      state.tasks = data.tasks || [];

      if (data.schedule) {
        state.selectedWeek = String(data.schedule.currentWeek || 1);
        if (DAYS_ORDER.includes(data.schedule.todayDayName)) {
          state.selectedDay = data.schedule.todayDayName;
        }
      }

      // Якщо користувач раніше обрав тему на цьому пристрої, локальна тема має пріоритет і синхронізується з сервером;
      // якщо локальної теми ще немає, беремо збережену тему з сервера
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
      statusText.textContent = `Сервер онлайн · ${data.schedule?.serverTimeKyiv || ""}`;

      renderSchedule();
      renderTasks();
      renderProfile();
    } catch (err) {
      dot.className = "status-dot offline";
      statusText.textContent = "Немає зв'язку з сервером";
      showToast(`Помилка з'єднання: ${err.message}`);
    }
  }

  // Event Listeners
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

  document.querySelectorAll(".tg-tab").forEach((tab) => {
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

  document.getElementById("closeUploadModalBtn").addEventListener("click", closeUploadModal);
  document.getElementById("uploadModal").addEventListener("click", (e) => {
    if (e.target.id === "uploadModal") closeUploadModal();
  });

  document.getElementById("uploadFileInput").addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    const label = document.getElementById("uploadFileNameLabel");
    const btn = document.getElementById("submitFileBtn");
    if (!file) {
      label.textContent = "Оберіть файл з пристрою (до 20 МБ)";
      btn.disabled = true;
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      showToast("Файл перевищує 20 МБ");
      btn.disabled = true;
      return;
    }
    label.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)} КБ)`;
    btn.disabled = false;
  });

  document.getElementById("submitFileBtn").addEventListener("click", async () => {
    const fileInput = document.getElementById("uploadFileInput");
    const file = fileInput.files && fileInput.files[0];
    if (!file || !state.uploadTaskId) return;

    const btn = document.getElementById("submitFileBtn");
    btn.disabled = true;
    btn.textContent = "Надсилання...";

    try {
      const contentBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Помилка читання файлу"));
        reader.readAsDataURL(file);
      });

      const res = await apiFetch("/api/tasks/submit", {
        method: "POST",
        body: JSON.stringify({
          taskId: state.uploadTaskId,
          fileName: file.name,
          contentBase64,
        }),
      });
      if (!res.ok) throw new Error(res.error || "Помилка завантаження");
      state.tasks = res.tasks || state.tasks;
      renderTasks();
      closeUploadModal();
      showToast(`Здано як ${res.renamedFileName}`);
    } catch (err) {
      showToast(err.message);
      btn.disabled = false;
    } finally {
      btn.textContent = "Надіслати в архів";
    }
  });

  bootstrap();
})();
