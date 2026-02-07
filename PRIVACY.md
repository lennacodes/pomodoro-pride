# Privacy Policy

**Pomodoro Pride** respects your privacy. This document explains what data the extension collects, how it is stored, and how it is used.

## Data Collection

Pomodoro Pride does **not** collect, transmit, or share any personal data. The extension has no servers, no analytics, and no tracking of any kind.

## Data Storage

All data is stored **locally** on your device using the browser's built-in `browser.storage.local` API. This includes:

- **Selected pride flag** — Your chosen theme preference
- **Text color preference** — Your custom text color, if set
- **Timer state** — Current timer mode, start/end time (used to persist the timer across popup opens)
- **Session history** — Completed Pomodoro sessions (type, start time, end time, duration, date)

This data never leaves your browser. It is not sent to any external server or third party.

## Permissions

The extension requests the following browser permissions:

| Permission | Purpose |
|---|---|
| `storage` | Save your settings and session history locally |
| `alarms` | Run the timer in the background when the popup is closed |
| `notifications` | Show a notification when a timer completes |

No other permissions are requested. The extension does not access your browsing history, tabs, or any website data.

## Data Export & Deletion

- You can **export** your session data as a JSON file from the Stats page
- You can **import** previously exported data to restore your history
- You can **reset** all stats from the Stats page, permanently deleting all session history
- Uninstalling the extension removes all stored data

## Third-Party Services

Pomodoro Pride makes **no external network requests**. All assets, including fonts, are bundled with the extension.

## Changes

If this privacy policy changes, the update will be included in the extension's GitHub repository.

## Contact

If you have questions about this policy, open an issue on the [GitHub repository](https://github.com/lennacodes/pomodoro-pride).
