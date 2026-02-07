window.PomodoroPride = window.PomodoroPride || {};
window.PomodoroPride.storage = {
  async getSelectedFlag() {
    const keys = window.PomodoroPride.constants.STORAGE_KEYS;
    const result = await browser.storage.local.get(keys.SELECTED_FLAG);
    return result[keys.SELECTED_FLAG] || 'rainbow';
  },

  async saveSelectedFlag(flagId) {
    const keys = window.PomodoroPride.constants.STORAGE_KEYS;
    await browser.storage.local.set({ [keys.SELECTED_FLAG]: flagId });
  },

  async getTextColor() {
    const keys = window.PomodoroPride.constants.STORAGE_KEYS;
    const result = await browser.storage.local.get(keys.TEXT_COLOR);
    return result[keys.TEXT_COLOR] || null;
  },

  async saveTextColor(color) {
    const keys = window.PomodoroPride.constants.STORAGE_KEYS;
    if (color) {
      await browser.storage.local.set({ [keys.TEXT_COLOR]: color });
    } else {
      await browser.storage.local.remove(keys.TEXT_COLOR);
    }
  },

  async getTimerState() {
    const keys = window.PomodoroPride.constants.STORAGE_KEYS;
    const result = await browser.storage.local.get(keys.TIMER_STATE);
    return result[keys.TIMER_STATE] || null;
  },

  async saveTimerState(state) {
    const keys = window.PomodoroPride.constants.STORAGE_KEYS;
    await browser.storage.local.set({ [keys.TIMER_STATE]: state });
  },

  async clearTimerState() {
    const keys = window.PomodoroPride.constants.STORAGE_KEYS;
    await browser.storage.local.remove(keys.TIMER_STATE);
  },

  async getSessions() {
    const keys = window.PomodoroPride.constants.STORAGE_KEYS;
    const result = await browser.storage.local.get(keys.SESSIONS);
    return result[keys.SESSIONS] || [];
  },

  async saveSession(session) {
    const sessions = await this.getSessions();
    sessions.push(session);
    const keys = window.PomodoroPride.constants.STORAGE_KEYS;
    await browser.storage.local.set({ [keys.SESSIONS]: sessions });
  },

  async importSessions(newSessions) {
    const existing = await this.getSessions();
    const existingIds = new Set(existing.map(s => s.id));
    const merged = [...existing];
    for (const s of newSessions) {
      if (!existingIds.has(s.id)) {
        merged.push(s);
      }
    }
    const keys = window.PomodoroPride.constants.STORAGE_KEYS;
    await browser.storage.local.set({ [keys.SESSIONS]: merged });
  },

  async clearSessions() {
    const keys = window.PomodoroPride.constants.STORAGE_KEYS;
    await browser.storage.local.remove(keys.SESSIONS);
  },

  async exportAll() {
    const keys = window.PomodoroPride.constants.STORAGE_KEYS;
    const result = await browser.storage.local.get([keys.SELECTED_FLAG, keys.TEXT_COLOR, keys.SESSIONS]);
    return {
      version: 1,
      exportDate: new Date().toISOString(),
      selectedFlag: result[keys.SELECTED_FLAG] || 'rainbow',
      textColor: result[keys.TEXT_COLOR] || null,
      sessions: result[keys.SESSIONS] || []
    };
  }
};
