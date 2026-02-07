window.PomodoroPride = window.PomodoroPride || {};
window.PomodoroPride.theme = {
  relativeLuminance(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const toLinear = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  },

  buildGradient(colors, angle) {
    const stops = colors.map((c, i) => {
      const pct = (i / (colors.length - 1)) * 100;
      return `${c} ${pct.toFixed(1)}%`;
    }).join(', ');
    return `linear-gradient(${angle}deg, ${stops})`;
  },

  buildStripes(flag, angle) {
    const colors = flag.colors;
    const cssStops = [];
    if (flag.stops) {
      flag.stops.forEach((stop, i) => {
        cssStops.push(`${stop.color} ${stop.start}%`);
        cssStops.push(`${stop.color} ${stop.end}%`);
      });
    } else {
      const band = 100 / colors.length;
      colors.forEach((c, i) => {
        cssStops.push(`${c} ${(i * band).toFixed(2)}%`);
        cssStops.push(`${c} ${((i + 1) * band).toFixed(2)}%`);
      });
    }
    return `linear-gradient(${angle}deg, ${cssStops.join(', ')})`;
  },

  applyTheme(flagId) {
    const PP = window.PomodoroPride;
    const flag = PP.flags.find(f => f.id === flagId) || PP.flags[0];
    const colors = flag.colors;
    const root = document.documentElement.style;

    root.setProperty('--gradient-full', this.buildGradient(colors, 180));
    root.setProperty('--gradient-vertical', this.buildGradient(colors, 180));

    colors.forEach((c, i) => {
      root.setProperty(`--flag-color-${i}`, c);
    });
    root.setProperty('--flag-color-count', colors.length);

    const midIdx = Math.floor(colors.length / 2);
    root.setProperty('--accent-color', colors[midIdx]);

    const avgLum = colors.reduce((sum, c) => sum + this.relativeLuminance(c), 0) / colors.length;
    const isDark = avgLum <= 0.45;

    // Text color — will be overridden by applyTextColor if user has a custom one
    this._autoTextColor = isDark ? '#ffffff' : '#1a1a1a';
    this._autoTextMuted = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.55)';
    root.setProperty('--text-color', this._autoTextColor);
    root.setProperty('--text-color-muted', this._autoTextMuted);
    root.setProperty('--text-color-inverse', isDark ? '#1a1a1a' : '#ffffff');

    if (isDark) {
      root.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.12)');
      root.setProperty('--glass-bg-hover', 'rgba(255, 255, 255, 0.22)');
      root.setProperty('--glass-bg-active', 'rgba(255, 255, 255, 0.30)');
      root.setProperty('--glass-border', 'rgba(255, 255, 255, 0.18)');
      root.setProperty('--glass-shadow', 'rgba(0, 0, 0, 0.25)');
    } else {
      root.setProperty('--glass-bg', 'rgba(0, 0, 0, 0.08)');
      root.setProperty('--glass-bg-hover', 'rgba(0, 0, 0, 0.15)');
      root.setProperty('--glass-bg-active', 'rgba(0, 0, 0, 0.22)');
      root.setProperty('--glass-border', 'rgba(0, 0, 0, 0.12)');
      root.setProperty('--glass-shadow', 'rgba(0, 0, 0, 0.15)');
    }

    return flag;
  },

  applyTextColor(color) {
    const root = document.documentElement.style;
    if (color) {
      root.setProperty('--text-color', color);
      // Derive a muted version by parsing the hex and adding alpha
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      root.setProperty('--text-color-muted', `rgba(${r}, ${g}, ${b}, 0.65)`);
    } else if (this._autoTextColor) {
      root.setProperty('--text-color', this._autoTextColor);
      root.setProperty('--text-color-muted', this._autoTextMuted);
    }
  },

  listenForChanges() {
    const self = this;
    browser.storage.onChanged.addListener((changes) => {
      const keys = window.PomodoroPride.constants.STORAGE_KEYS;
      if (changes[keys.SELECTED_FLAG]) {
        self.applyTheme(changes[keys.SELECTED_FLAG].newValue);
        // Re-apply custom text color on top if it exists
        window.PomodoroPride.storage.getTextColor().then(c => {
          if (c) self.applyTextColor(c);
        });
      }
      if (changes[keys.TEXT_COLOR]) {
        self.applyTextColor(changes[keys.TEXT_COLOR].newValue || null);
      }
    });
  }
};
