// Pure functions extracted from shared/theme.js and stats/stats.js for testing.
// These are exact copies of the source logic so we can test them outside the
// browser (the originals rely on window.PomodoroPride namespace).
//
// If you change these functions in the source files, update the copies here too.

// From shared/theme.js — calculates the relative luminance of a hex color
// using the WCAG formula. Used to decide whether text should be light or dark
// on a given flag background. Returns a value between 0 (black) and 1 (white).
function relativeLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

// From shared/theme.js — builds a smooth CSS linear-gradient string
// from an array of hex colors. Used for the popup background.
function buildGradient(colors, angle) {
  const stops = colors.map((c, i) => {
    const pct = (i / (colors.length - 1)) * 100;
    return `${c} ${pct.toFixed(1)}%`;
  });
  return `linear-gradient(${angle}deg, ${stops.join(', ')})`;
}

// From shared/theme.js — builds a hard-edged CSS stripe gradient from a
// flag definition. Supports both equal-width stripes and custom stop positions.
function buildStripes(flag, angle) {
  const colors = flag.colors;
  const cssStops = [];
  if (flag.stops) {
    flag.stops.forEach((stop) => {
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
}

// From stats/stats.js — formats a duration in seconds as a human-readable
// string (e.g. 3600 → "1h", 5400 → "1h 30m", 300 → "5m").
function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.round((totalSeconds % 3600) / 60);
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// From stats/stats.js — maps a session count to a heatmap intensity level
// (0-4) for the weekly activity grid.
function heatLevel(count) {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  return 4;
}

// From stats/stats.js — converts a hex color to an rgba string with the
// given alpha value. Supports both 3-char and 6-char hex.
function hexToRgba(hex, alpha) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

module.exports = {
  relativeLuminance,
  buildGradient,
  buildStripes,
  formatDuration,
  heatLevel,
  hexToRgba,
};
