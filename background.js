const PP = window.PomodoroPride;
const { MODES, TIMER_DEFAULTS, STORAGE_KEYS } = PP.constants;
const storage = PP.storage;

const ALARM_NAME = 'pomodoroComplete';
let badgeInterval = null;
let badgeEndTime = null;

browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const handler = messageHandlers[msg.action];
  if (handler) {
    handler(msg).then(sendResponse);
    return true;
  }
});

const messageHandlers = {
  async startTimer(msg) {
    const mode = msg.mode || MODES.FOCUS;
    const totalSeconds = TIMER_DEFAULTS[mode];
    const endTime = Date.now() + totalSeconds * 1000;

    const state = {
      mode,
      endTime,
      isRunning: true,
      totalSeconds,
      startedAt: Date.now()
    };

    await storage.saveTimerState(state);
    await browser.alarms.clear(ALARM_NAME);
    browser.alarms.create(ALARM_NAME, { when: endTime });
    startBadgeUpdates(state);

    return state;
  },

  async pauseTimer() {
    const state = await storage.getTimerState();
    if (!state || !state.isRunning) return state;

    const remaining = Math.max(0, Math.ceil((state.endTime - Date.now()) / 1000));
    state.isRunning = false;
    state.remainingSeconds = remaining;
    state.endTime = null;

    await storage.saveTimerState(state);
    await browser.alarms.clear(ALARM_NAME);
    stopBadgeUpdates();
    // Show paused minutes on badge
    const pausedMin = Math.floor(remaining / 60);
    setBadge(String(pausedMin));

    return state;
  },

  async resumeTimer() {
    const state = await storage.getTimerState();
    if (!state || state.isRunning || !state.remainingSeconds) return state;

    state.isRunning = true;
    state.endTime = Date.now() + state.remainingSeconds * 1000;
    state.remainingSeconds = null;

    await storage.saveTimerState(state);
    await browser.alarms.clear(ALARM_NAME);
    browser.alarms.create(ALARM_NAME, { when: state.endTime });
    startBadgeUpdates(state);

    return state;
  },

  async resetTimer() {
    await storage.clearTimerState();
    await browser.alarms.clear(ALARM_NAME);
    stopBadgeUpdates();
    clearBadge();
    return null;
  },

  async getTimerState() {
    const state = await storage.getTimerState();
    if (!state) return null;

    if (state.isRunning) {
      const remaining = Math.max(0, Math.ceil((state.endTime - Date.now()) / 1000));
      if (remaining <= 0) {
        await completeTimer(state);
        return null;
      }
    }
    return state;
  }
};

// --- Badge ---

function setBadge(text) {
  browser.browserAction.setBadgeText({ text });
  browser.browserAction.setBadgeBackgroundColor({ color: '#1a1a1a' });
}

function clearBadge() {
  browser.browserAction.setBadgeText({ text: '' });
}

function tickBadge() {
  if (!badgeEndTime) { clearBadge(); return; }
  const remainingSec = Math.max(0, Math.round((badgeEndTime - Date.now()) / 1000));
  if (remainingSec <= 0) {
    clearBadge();
    stopBadgeUpdates();
  } else {
    setBadge(String(Math.floor(remainingSec / 60)));
  }
}

function startBadgeUpdates(state) {
  stopBadgeUpdates();
  badgeEndTime = state.endTime;
  tickBadge();
  badgeInterval = setInterval(tickBadge, 1000);
}

function stopBadgeUpdates() {
  if (badgeInterval) {
    clearInterval(badgeInterval);
    badgeInterval = null;
  }
  badgeEndTime = null;
}

// --- Sound ---

function playDing() {
  try {
    const audio = new Audio(browser.runtime.getURL('sounds/ding.wav'));
    audio.volume = 0.7;
    audio.play();
  } catch (e) {
    // Silently fail if audio isn't available
  }
}

// --- Timer Complete ---

async function completeTimer(state) {
  const now = Date.now();
  const session = {
    id: `sess_${state.startedAt}_${Math.random().toString(36).slice(2, 6)}`,
    type: state.mode,
    startTime: state.startedAt,
    endTime: now,
    duration: state.totalSeconds,
    completed: true,
    date: new Date(state.startedAt).toLocaleDateString('en-CA')
  };

  await storage.saveSession(session);
  await storage.clearTimerState();
  await browser.alarms.clear(ALARM_NAME);
  stopBadgeUpdates();
  clearBadge();

  const modeLabels = PP.constants.MODE_LABELS;
  const label = modeLabels[state.mode] || 'Session';
  const isBreak = state.mode !== MODES.FOCUS;

  playDing();

  browser.notifications.create('pomodoro-done', {
    type: 'basic',
    title: 'Pomodoro Pride',
    message: isBreak ? 'Break is over! Ready to focus?' : `${label} complete! Time for a break.`,
    iconUrl: browser.runtime.getURL('icons/icon-96.png')
  });
}

// Open onboarding page on first install
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    browser.tabs.create({ url: browser.runtime.getURL('onboarding/onboarding.html') });
  }
});

// --- Alarm Listener ---

browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    const state = await storage.getTimerState();
    if (!state) return;
    await completeTimer(state);
  }
});

// Restore badge on background script startup (e.g. browser restart)
(async () => {
  const state = await storage.getTimerState();
  if (state && state.isRunning && state.endTime) {
    const remaining = Math.max(0, Math.ceil((state.endTime - Date.now()) / 1000));
    if (remaining > 0) {
      startBadgeUpdates(state);
    } else {
      await completeTimer(state);
    }
  } else if (state && !state.isRunning && state.remainingSeconds) {
    // Paused — show static badge
    setBadge(String(Math.floor(state.remainingSeconds / 60)));
  }
})();
