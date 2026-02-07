(() => {
  const PP = window.PomodoroPride;
  const { MODES, TIMER_DEFAULTS, MODE_LABELS } = PP.constants;
  const storage = PP.storage;
  const theme = PP.theme;

  // DOM refs
  const timerDisplay = document.getElementById('timer-display');
  const timerMode = document.getElementById('timer-mode');
  const timerCard = document.querySelector('.timer-card');
  const btnStart = document.getElementById('btn-start');
  const btnShort = document.getElementById('btn-short');
  const btnLong = document.getElementById('btn-long');
  const btnReset = document.getElementById('btn-reset');
  const flagGrid = document.getElementById('flag-grid');
  const views = document.querySelectorAll('.view');
  const tabBtns = document.querySelectorAll('.tab-btn');

  let tickInterval = null;
  let currentState = null;

  // --- Timer Display ---

  function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function updateDisplay(state) {
    currentState = state;

    if (!state) {
      timerDisplay.textContent = formatTime(TIMER_DEFAULTS[MODES.FOCUS]);
      timerMode.textContent = MODE_LABELS[MODES.FOCUS];
      btnStart.textContent = 'Start';
      timerCard.classList.remove('running');
      stopTick();
      return;
    }

    const label = MODE_LABELS[state.mode] || 'Focus';
    timerMode.textContent = label;

    if (state.isRunning) {
      btnStart.textContent = 'Pause';
      timerCard.classList.add('running');
      startTick();
    } else {
      const remaining = state.remainingSeconds || 0;
      timerDisplay.textContent = formatTime(remaining);
      btnStart.textContent = 'Resume';
      timerCard.classList.remove('running');
      stopTick();
    }
  }

  function tickUpdate() {
    if (!currentState || !currentState.isRunning || !currentState.endTime) return;
    const remaining = Math.max(0, Math.ceil((currentState.endTime - Date.now()) / 1000));
    timerDisplay.textContent = formatTime(remaining);

    if (remaining <= 0) {
      updateDisplay(null);
    }
  }

  function startTick() {
    stopTick();
    tickUpdate();
    tickInterval = setInterval(tickUpdate, 200);
  }

  function stopTick() {
    if (tickInterval) {
      clearInterval(tickInterval);
      tickInterval = null;
    }
  }

  // --- Message helpers ---

  function sendMsg(action, data) {
    return browser.runtime.sendMessage({ action, ...data });
  }

  // --- Button handlers ---

  btnStart.addEventListener('click', async () => {
    if (!currentState) {
      const state = await sendMsg('startTimer', { mode: MODES.FOCUS });
      updateDisplay(state);
    } else if (currentState.isRunning) {
      const state = await sendMsg('pauseTimer');
      updateDisplay(state);
    } else {
      const state = await sendMsg('resumeTimer');
      updateDisplay(state);
    }
  });

  btnShort.addEventListener('click', async () => {
    const state = await sendMsg('startTimer', { mode: MODES.SHORT_BREAK });
    updateDisplay(state);
  });

  btnLong.addEventListener('click', async () => {
    const state = await sendMsg('startTimer', { mode: MODES.LONG_BREAK });
    updateDisplay(state);
  });

  btnReset.addEventListener('click', async () => {
    await sendMsg('resetTimer');
    updateDisplay(null);
  });

  // --- Tab Navigation ---

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.view;

      if (target === 'stats') {
        browser.tabs.create({ url: browser.runtime.getURL('stats/stats.html') });
        return;
      }

      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      views.forEach(v => v.classList.remove('active'));
      const view = document.getElementById(`view-${target}`);
      if (view) view.classList.add('active');
    });
  });

  // --- Settings Sub-tabs ---

  const settingsTabs = document.querySelectorAll('.settings-tab');
  const settingsPanels = document.querySelectorAll('.settings-panel');

  settingsTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      settingsTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      settingsPanels.forEach(p => p.classList.remove('active'));
      const panel = document.getElementById(`panel-${tab.dataset.panel}`);
      if (panel) panel.classList.add('active');
    });
  });

  // --- Custom Color Picker ---

  const cpSvCanvas = document.getElementById('cp-sv');
  const cpHueCanvas = document.getElementById('cp-hue');
  const cpSvCursor = document.getElementById('cp-sv-cursor');
  const cpHueCursor = document.getElementById('cp-hue-cursor');
  const cpSwatch = document.getElementById('cp-swatch');
  const colorHex = document.getElementById('color-hex');
  const btnResetColor = document.getElementById('btn-reset-color');

  const cpSvCtx = cpSvCanvas.getContext('2d');
  const cpHueCtx = cpHueCanvas.getContext('2d');

  let cpHue = 0;
  let cpSat = 1;
  let cpVal = 1;

  // HSV to RGB
  function hsvToRgb(h, s, v) {
    let r, g, b;
    const i = Math.floor(h / 60) % 6;
    const f = h / 60 - Math.floor(h / 60);
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    switch (i) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  // RGB to HSV
  function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let h = 0, s = max === 0 ? 0 : d / max, v = max;
    if (d !== 0) {
      switch (max) {
        case r: h = ((g - b) / d + 6) % 6; break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
    }
    return [h, s, v];
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
  }

  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  }

  // Draw the saturation-value gradient for the current hue
  function drawSV() {
    const w = cpSvCanvas.width, h = cpSvCanvas.height;
    const img = cpSvCtx.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const s = x / (w - 1);
        const v = 1 - y / (h - 1);
        const [r, g, b] = hsvToRgb(cpHue, s, v);
        const idx = (y * w + x) * 4;
        img.data[idx] = r;
        img.data[idx + 1] = g;
        img.data[idx + 2] = b;
        img.data[idx + 3] = 255;
      }
    }
    cpSvCtx.putImageData(img, 0, 0);
  }

  // Draw the hue bar
  function drawHue() {
    const w = cpHueCanvas.width, h = cpHueCanvas.height;
    const grad = cpHueCtx.createLinearGradient(0, 0, w, 0);
    for (let i = 0; i <= 6; i++) {
      const [r, g, b] = hsvToRgb(i * 60, 1, 1);
      grad.addColorStop(i / 6, `rgb(${r},${g},${b})`);
    }
    cpHueCtx.fillStyle = grad;
    cpHueCtx.fillRect(0, 0, w, h);
  }

  function updatePickerUI() {
    const [r, g, b] = hsvToRgb(cpHue, cpSat, cpVal);
    const hex = rgbToHex(r, g, b);
    colorHex.textContent = hex;
    cpSwatch.style.background = hex;

    // Position cursors
    cpSvCursor.style.left = (cpSat * cpSvCanvas.width) + 'px';
    cpSvCursor.style.top = ((1 - cpVal) * cpSvCanvas.height) + 'px';
    cpHueCursor.style.left = (cpHue / 360 * cpHueCanvas.width) + 'px';
  }

  function applyPickerColor() {
    const [r, g, b] = hsvToRgb(cpHue, cpSat, cpVal);
    const hex = rgbToHex(r, g, b);
    theme.applyTextColor(hex);
    storage.saveTextColor(hex);
  }

  // SV canvas interaction
  function handleSV(e) {
    const rect = cpSvCanvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    cpSat = x / rect.width;
    cpVal = 1 - y / rect.height;
    updatePickerUI();
    applyPickerColor();
  }

  let svDragging = false;
  cpSvCanvas.addEventListener('mousedown', (e) => { svDragging = true; handleSV(e); });
  document.addEventListener('mousemove', (e) => { if (svDragging) handleSV(e); });
  document.addEventListener('mouseup', () => { svDragging = false; });

  // Hue bar interaction
  function handleHue(e) {
    const rect = cpHueCanvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    cpHue = (x / rect.width) * 360;
    drawSV();
    updatePickerUI();
    applyPickerColor();
  }

  let hueDragging = false;
  cpHueCanvas.addEventListener('mousedown', (e) => { hueDragging = true; handleHue(e); });
  document.addEventListener('mousemove', (e) => { if (hueDragging) handleHue(e); });
  document.addEventListener('mouseup', () => { hueDragging = false; });

  // Set picker from a hex color
  function setPickerFromHex(hex) {
    const [r, g, b] = hexToRgb(hex);
    [cpHue, cpSat, cpVal] = rgbToHsv(r, g, b);
    drawSV();
    updatePickerUI();
  }

  btnResetColor.addEventListener('click', async () => {
    await storage.saveTextColor(null);
    theme.applyTextColor(null);
    const auto = theme._autoTextColor || '#ffffff';
    setPickerFromHex(auto);
  });

  // Initialize the picker canvases
  function initPicker(hex) {
    drawHue();
    setPickerFromHex(hex);
  }

  // --- Flag Grid ---

  async function buildFlagGrid() {
    const selectedFlag = await storage.getSelectedFlag();
    flagGrid.innerHTML = '';

    PP.flags.forEach(flag => {
      const swatch = document.createElement('button');
      swatch.className = 'flag-swatch';
      if (flag.id === selectedFlag) swatch.classList.add('selected');
      swatch.title = flag.name;
      swatch.setAttribute('aria-label', flag.name);
      swatch.style.background = theme.buildStripes(flag, 180);

      swatch.addEventListener('click', async () => {
        await storage.saveSelectedFlag(flag.id);
        theme.applyTheme(flag.id);
        flagGrid.querySelectorAll('.flag-swatch').forEach(s => s.classList.remove('selected'));
        swatch.classList.add('selected');
      });

      flagGrid.appendChild(swatch);
    });
  }

  // --- Init ---

  async function init() {
    const flagId = await storage.getSelectedFlag();
    theme.applyTheme(flagId);

    // Apply saved custom text color on top
    const savedColor = await storage.getTextColor();
    if (savedColor) {
      theme.applyTextColor(savedColor);
      initPicker(savedColor);
    } else {
      initPicker(theme._autoTextColor || '#ffffff');
    }

    theme.listenForChanges();

    const state = await sendMsg('getTimerState');
    updateDisplay(state);

    await buildFlagGrid();
  }

  init();
})();
