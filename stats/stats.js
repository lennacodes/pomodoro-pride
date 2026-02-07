(() => {
  const PP = window.PomodoroPride;
  const { MODE_LABELS, MODES } = PP.constants;
  const storage = PP.storage;
  const theme = PP.theme;

  const weekGrid = document.getElementById('week-grid');
  const weekLabel = document.getElementById('week-label');
  const weekSummary = document.getElementById('week-summary');
  const btnPrevWeek = document.getElementById('btn-prev-week');
  const btnNextWeek = document.getElementById('btn-next-week');
  const dayTitle = document.getElementById('day-title');
  const statFocus = document.getElementById('stat-focus');
  const statDayTime = document.getElementById('stat-day-time');
  const statShort = document.getElementById('stat-short');
  const statLong = document.getElementById('stat-long');
  const statAllPomodoros = document.getElementById('stat-all-pomodoros');
  const statAllTime = document.getElementById('stat-all-time');
  const statStreak = document.getElementById('stat-streak');
  const statBestStreak = document.getElementById('stat-best-streak');
  const sessionLog = document.getElementById('session-log');
  const btnExport = document.getElementById('btn-export');
  const btnImport = document.getElementById('btn-import');
  const btnReset = document.getElementById('btn-reset');

  let allSessions = [];
  let selectedDate = todayStr();
  let weekOffset = 0;

  function todayStr() {
    return new Date().toLocaleDateString('en-CA');
  }

  function formatDuration(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.round((totalSeconds % 3600) / 60);
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  }

  function getWeekDays(offset) {
    const days = [];
    const now = new Date();
    const baseOffset = offset * 7;
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i + baseOffset);
      days.push({
        date: d.toLocaleDateString('en-CA'),
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate()
      });
    }
    return days;
  }

  function getWeekLabel(offset) {
    if (offset === 0) return 'This Week';
    const days = getWeekDays(offset);
    const first = new Date(days[0].date + 'T12:00:00');
    const last = new Date(days[6].date + 'T12:00:00');
    const opts = { month: 'short', day: 'numeric' };
    return `${first.toLocaleDateString('en-US', opts)} – ${last.toLocaleDateString('en-US', opts)}`;
  }

  function getSessionsForDate(date) {
    return allSessions.filter(s => s.date === date && s.completed);
  }

  function getFocusSessions() {
    return allSessions.filter(s => s.completed && s.type === MODES.FOCUS);
  }

  function heatLevel(count) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 4) return 2;
    if (count <= 6) return 3;
    return 4;
  }

  // --- All-Time Stats ---

  function renderAllTimeStats() {
    const focusSessions = getFocusSessions();
    const totalPomodoros = focusSessions.length;
    const totalSeconds = focusSessions.reduce((sum, s) => sum + (s.duration || 0), 0);

    statAllPomodoros.textContent = totalPomodoros;
    statAllTime.textContent = formatDuration(totalSeconds);

    // Streaks
    const { current, best } = computeStreaks();
    statStreak.textContent = current;
    statBestStreak.textContent = best;
  }

  function computeStreaks() {
    // Get unique dates that have at least 1 completed pomodoro, sorted descending
    const focusDates = new Set(
      getFocusSessions().map(s => s.date)
    );

    if (focusDates.size === 0) return { current: 0, best: 0 };

    // Build sorted array of all dates descending
    const sorted = [...focusDates].sort().reverse();

    // Current streak: count consecutive days backwards from today
    let current = 0;
    const today = todayStr();
    const checkDate = new Date(today + 'T12:00:00');

    // Allow streak to start from today or yesterday (in case they haven't done one yet today)
    if (!focusDates.has(today)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateStr = checkDate.toLocaleDateString('en-CA');
      if (focusDates.has(dateStr)) {
        current++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Best streak: scan all sorted dates
    let best = 0;
    let run = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1] + 'T12:00:00');
      const curr = new Date(sorted[i] + 'T12:00:00');
      const diffDays = Math.round((prev - curr) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        run++;
      } else {
        best = Math.max(best, run);
        run = 1;
      }
    }
    best = Math.max(best, run, current);

    return { current, best };
  }

  // --- Week Navigation ---

  btnPrevWeek.addEventListener('click', () => {
    weekOffset--;
    updateWeekNav();
    renderWeek();
  });

  btnNextWeek.addEventListener('click', () => {
    if (weekOffset >= 0) return;
    weekOffset++;
    updateWeekNav();
    renderWeek();
  });

  function updateWeekNav() {
    weekLabel.textContent = getWeekLabel(weekOffset);
    btnNextWeek.disabled = weekOffset >= 0;
  }

  // --- Render Week ---

  function renderWeek() {
    const days = getWeekDays(weekOffset);
    weekGrid.innerHTML = '';

    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#ffffff';

    let weekPomodoros = 0;
    let weekFocusSeconds = 0;

    days.forEach(day => {
      const sessions = getSessionsForDate(day.date);
      const focusSessions = sessions.filter(s => s.type === MODES.FOCUS);
      const focusCount = focusSessions.length;
      const level = heatLevel(focusCount);

      weekPomodoros += focusCount;
      weekFocusSeconds += focusSessions.reduce((sum, s) => sum + (s.duration || 0), 0);

      const cell = document.createElement('div');
      cell.className = 'day-cell' + (day.date === selectedDate ? ' selected' : '');
      cell.addEventListener('click', () => selectDay(day.date, cell));

      const label = document.createElement('div');
      label.className = 'day-label';
      label.textContent = day.dayName;

      const heat = document.createElement('div');
      heat.className = 'day-heat';
      heat.textContent = focusCount || '';
      if (level > 0) {
        const opacity = level * 0.22;
        heat.style.background = hexToRgba(accentColor, opacity);
      }

      const dateLabel = document.createElement('div');
      dateLabel.className = 'day-date';
      dateLabel.textContent = day.dayNum;

      cell.appendChild(label);
      cell.appendChild(heat);
      cell.appendChild(dateLabel);
      weekGrid.appendChild(cell);
    });

    // Week summary
    if (weekPomodoros > 0) {
      weekSummary.textContent = `${weekPomodoros} pomodoro${weekPomodoros !== 1 ? 's' : ''} \u00B7 ${formatDuration(weekFocusSeconds)} focus time`;
    } else {
      weekSummary.textContent = 'No pomodoros this week';
    }
  }

  function hexToRgba(hex, alpha) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function selectDay(date, cellEl) {
    selectedDate = date;
    weekGrid.querySelectorAll('.day-cell').forEach(c => c.classList.remove('selected'));
    if (cellEl) cellEl.classList.add('selected');

    const isToday = date === todayStr();
    if (isToday) {
      dayTitle.textContent = 'Today';
    } else {
      const d = new Date(date + 'T12:00:00');
      dayTitle.textContent = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }

    renderDayStats();
    renderSessionLog();
  }

  // --- Day Stats ---

  function renderDayStats() {
    const sessions = getSessionsForDate(selectedDate);
    const focusSessions = sessions.filter(s => s.type === MODES.FOCUS);
    statFocus.textContent = focusSessions.length;
    statShort.textContent = sessions.filter(s => s.type === MODES.SHORT_BREAK).length;
    statLong.textContent = sessions.filter(s => s.type === MODES.LONG_BREAK).length;

    const focusSeconds = focusSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    statDayTime.textContent = formatDuration(focusSeconds);
  }

  // --- Session Log ---

  function renderSessionLog() {
    const sessions = getSessionsForDate(selectedDate);
    sessionLog.innerHTML = '';

    if (sessions.length === 0) {
      sessionLog.innerHTML = '<div class="empty-state">No sessions for this day</div>';
      return;
    }

    const sorted = [...sessions].sort((a, b) => a.startTime - b.startTime);

    sorted.forEach(s => {
      const row = document.createElement('div');
      row.className = 'session-row';

      const time = document.createElement('span');
      time.className = 'session-time';
      time.textContent = new Date(s.startTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      const type = document.createElement('span');
      type.className = 'session-type';
      type.textContent = MODE_LABELS[s.type] || s.type;

      const dur = document.createElement('span');
      dur.className = 'session-duration';
      dur.textContent = `${Math.round(s.duration / 60)} min`;

      row.appendChild(time);
      row.appendChild(type);
      row.appendChild(dur);
      sessionLog.appendChild(row);
    });
  }

  // --- Export ---

  btnExport.addEventListener('click', async () => {
    const data = await storage.exportAll();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pomodoro-pride-stats-${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // --- Import ---

  btnImport.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.sessions || !Array.isArray(data.sessions)) {
        alert('Invalid file: missing sessions array.');
        return;
      }

      await storage.importSessions(data.sessions);

      if (data.selectedFlag) {
        await storage.saveSelectedFlag(data.selectedFlag);
        theme.applyTheme(data.selectedFlag);
      }

      allSessions = await storage.getSessions();
      renderAll();
    } catch (err) {
      alert('Failed to import: ' + err.message);
    }

    btnImport.value = '';
  });

  // --- Reset ---

  btnReset.addEventListener('click', () => {
    showConfirm('Are you sure you want to reset all stats? This cannot be undone.', async () => {
      await storage.clearSessions();
      allSessions = [];
      renderAll();
    });
  });

  function renderAll() {
    renderAllTimeStats();
    renderWeek();
    renderDayStats();
    renderSessionLog();
  }

  function showConfirm(message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';

    const p = document.createElement('p');
    p.textContent = message;

    const actions = document.createElement('div');
    actions.className = 'confirm-actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => overlay.remove());

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn btn-danger';
    confirmBtn.textContent = 'Reset';
    confirmBtn.addEventListener('click', () => {
      overlay.remove();
      onConfirm();
    });

    actions.appendChild(cancelBtn);
    actions.appendChild(confirmBtn);
    dialog.appendChild(p);
    dialog.appendChild(actions);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  }

  // --- Calendar Picker ---

  weekLabel.addEventListener('click', () => openCalendarPicker());

  function openCalendarPicker() {
    // Start the calendar on the month of the currently displayed week's middle day
    const days = getWeekDays(weekOffset);
    const midDate = new Date(days[3].date + 'T12:00:00');
    let calYear = midDate.getFullYear();
    let calMonth = midDate.getMonth();

    const overlay = document.createElement('div');
    overlay.className = 'cal-overlay';
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    const dialog = document.createElement('div');
    dialog.className = 'cal-dialog';

    // Header
    const header = document.createElement('div');
    header.className = 'cal-header';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'cal-nav';
    prevBtn.innerHTML = '&lsaquo;';
    prevBtn.addEventListener('click', () => {
      calMonth--;
      if (calMonth < 0) { calMonth = 11; calYear--; }
      renderCalMonth();
    });

    const monthLabel = document.createElement('span');
    monthLabel.className = 'cal-month-label';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'cal-nav';
    nextBtn.innerHTML = '&rsaquo;';
    nextBtn.addEventListener('click', () => {
      calMonth++;
      if (calMonth > 11) { calMonth = 0; calYear++; }
      renderCalMonth();
    });

    header.appendChild(prevBtn);
    header.appendChild(monthLabel);
    header.appendChild(nextBtn);

    // Weekday headers
    const weekdaysRow = document.createElement('div');
    weekdaysRow.className = 'cal-weekdays';
    ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach(d => {
      const wd = document.createElement('div');
      wd.className = 'cal-weekday';
      wd.textContent = d;
      weekdaysRow.appendChild(wd);
    });

    // Days grid
    const daysGrid = document.createElement('div');
    daysGrid.className = 'cal-days';

    // Jump to today button
    const todayBtn = document.createElement('button');
    todayBtn.className = 'cal-today-btn';
    todayBtn.textContent = 'Jump to Today';
    todayBtn.addEventListener('click', () => {
      jumpToDate(todayStr());
      overlay.remove();
    });

    dialog.appendChild(header);
    dialog.appendChild(weekdaysRow);
    dialog.appendChild(daysGrid);
    dialog.appendChild(todayBtn);
    overlay.appendChild(dialog);

    // Build set of dates with sessions for dot indicators
    const sessionDates = new Set(
      allSessions.filter(s => s.completed && s.type === MODES.FOCUS).map(s => s.date)
    );

    function renderCalMonth() {
      monthLabel.textContent = new Date(calYear, calMonth, 1)
        .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      daysGrid.innerHTML = '';

      const firstDay = new Date(calYear, calMonth, 1);
      const startPad = firstDay.getDay(); // 0=Sun
      const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
      const prevMonthDays = new Date(calYear, calMonth, 0).getDate();

      const today = todayStr();

      // Previous month padding
      for (let i = startPad - 1; i >= 0; i--) {
        const dayNum = prevMonthDays - i;
        const d = new Date(calYear, calMonth - 1, dayNum);
        const dateStr = d.toLocaleDateString('en-CA');
        const btn = createDayBtn(dayNum, dateStr, true, today, sessionDates);
        daysGrid.appendChild(btn);
      }

      // Current month
      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(calYear, calMonth, i);
        const dateStr = d.toLocaleDateString('en-CA');
        const btn = createDayBtn(i, dateStr, false, today, sessionDates);
        daysGrid.appendChild(btn);
      }

      // Next month padding
      const totalCells = startPad + daysInMonth;
      const remaining = (7 - (totalCells % 7)) % 7;
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(calYear, calMonth + 1, i);
        const dateStr = d.toLocaleDateString('en-CA');
        const btn = createDayBtn(i, dateStr, true, today, sessionDates);
        daysGrid.appendChild(btn);
      }
    }

    function createDayBtn(dayNum, dateStr, isOtherMonth, today, sessionDates) {
      const btn = document.createElement('button');
      btn.className = 'cal-day';
      btn.textContent = dayNum;
      if (isOtherMonth) btn.classList.add('other-month');
      if (dateStr === today) btn.classList.add('today');
      if (sessionDates.has(dateStr)) btn.classList.add('has-sessions');

      btn.addEventListener('click', () => {
        jumpToDate(dateStr);
        overlay.remove();
      });

      return btn;
    }

    renderCalMonth();
    document.body.appendChild(overlay);
  }

  function jumpToDate(dateStr) {
    // Calculate weekOffset so that dateStr falls within the displayed week
    const target = new Date(dateStr + 'T12:00:00');
    const today = new Date(todayStr() + 'T12:00:00');
    const diffDays = Math.round((today - target) / (1000 * 60 * 60 * 24));
    // Current week (offset 0) shows today as the last day (index 6)
    // So offset = -floor(diffDays / 7) but we need to check if it lands in the right range
    weekOffset = -Math.floor(diffDays / 7);
    if (weekOffset > 0) weekOffset = 0;

    updateWeekNav();
    renderWeek();
    selectDay(dateStr, null);
  }

  // --- Init ---

  async function init() {
    const flagId = await storage.getSelectedFlag();
    theme.applyTheme(flagId);

    const savedColor = await storage.getTextColor();
    if (savedColor) theme.applyTextColor(savedColor);

    theme.listenForChanges();

    allSessions = await storage.getSessions();
    updateWeekNav();
    renderAllTimeStats();
    renderWeek();
    selectDay(todayStr(), null);
  }

  init();
})();
