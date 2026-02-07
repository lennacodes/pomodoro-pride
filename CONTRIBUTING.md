# Contributing to Pomodoro Pride

Thanks for your interest in contributing! Here's how to get started.

## Getting Started

1. Fork and clone the repo
2. Open Firefox and go to `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on** and select the `manifest.json` file
4. The extension will appear in your toolbar

## Project Structure

```
pomodoro_pride/
├── manifest.json          # Extension manifest (MV2)
├── background.js          # Timer logic, alarms, badge, notifications
├── shared/
│   ├── constants.js       # Timer defaults, storage keys, mode enums
│   ├── flags.js           # Pride flag color definitions
│   ├── storage.js         # browser.storage.local wrapper
│   └── theme.js           # CSS custom property theming engine
├── popup/
│   ├── popup.html         # Popup structure
│   ├── popup.css          # Popup styles
│   └── popup.js           # Timer UI, settings, color picker
├── stats/
│   ├── stats.html         # Stats page structure
│   ├── stats.css          # Stats page styles
│   └── stats.js           # Calendar, session log, streaks, export/import
├── onboarding/
│   ├── onboarding.html    # Welcome page shown on first install
│   ├── onboarding.css     # Onboarding styles
│   └── onboarding.js      # Close button handler
├── fonts/                 # Bundled Fredoka font files
├── icons/                 # Extension icons (16-128px PNGs)
└── sounds/
    └── ding.wav           # Timer completion chime
```

## Architecture Notes

- **No ES modules.** Firefox MV2 popups don't support ES modules. All shared code attaches to the `window.PomodoroPride` namespace and is loaded via `<script>` tags.
- **Timer persistence.** The timer runs via `browser.alarms` with an absolute `endTime` timestamp. The popup's `setInterval` is only for display — the real timer lives in the background script.
- **Theming.** `theme.js` sets CSS custom properties (`--gradient-full`, `--glass-bg`, `--text-color`, etc.) on `document.documentElement`. Both popup and stats pages listen to `browser.storage.onChanged` for live theme updates.
- **Flags.** Each flag is `{ id, name, colors, stops? }`. The optional `stops` array defines non-equal stripe widths for flags like Bisexual (2:1:2 ratio) and Progress Pride.

## Making Changes

- Keep it simple. Avoid over-engineering or adding unnecessary abstractions.
- Test with multiple flag themes (light and dark backgrounds) to ensure text remains readable.
- If adding a new pride flag, add it to `shared/flags.js`. Use the `stops` field if stripes are not equal width.

## Submitting a PR

1. Create a branch from `main`
2. Make your changes
3. Test by loading the extension in Firefox (`about:debugging`)
4. Open a pull request with a clear description of what changed and why
