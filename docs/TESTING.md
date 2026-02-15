# Pomodoro Pride Manual Testing Checklist

Use this checklist before every release.

## Setup

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select `manifest.json` from the project root

---

## Timer

### Focus Mode
- [ ] Click "Start" — 25-minute timer begins counting down
- [ ] Timer display updates every second
- [ ] Badge on toolbar icon shows remaining minutes
- [ ] Timer continues when popup is closed (background script)
- [ ] Re-opening popup shows the correct remaining time

### Pause / Resume
- [ ] Click "Pause" — timer stops, badge shows paused minutes
- [ ] Click "Resume" — timer continues from where it paused
- [ ] Paused state persists if popup is closed and reopened

### Reset
- [ ] Click "Reset" — timer returns to 00:00, badge clears
- [ ] Reset while running — timer stops and clears

### Completion
- [ ] Timer reaches 0:00 — ding sound plays
- [ ] Desktop notification appears ("Focus complete! Time for a break.")
- [ ] Session is recorded in stats
- [ ] Badge clears after completion

### Break Modes
- [ ] Short Break — 5-minute timer, different notification on completion
- [ ] Long Break — 15-minute timer
- [ ] Correct mode label shown in timer display

---

## Pride Flags

### Flag Picker
- [ ] All 35+ flags are visible in the picker
- [ ] Clicking a flag applies it immediately
- [ ] Background gradient updates to match the flag
- [ ] Selected flag persists across popup open/close

### Theme Colors
- [ ] Light flags (e.g. trans) get dark text
- [ ] Dark flags (e.g. gay MLM) get white text
- [ ] Glass UI elements adjust (light glass on dark, dark glass on light)

### Custom Text Color
- [ ] Color picker lets user override auto text color
- [ ] Custom color persists across sessions
- [ ] Clearing custom color reverts to auto-detected color

### Flag Accuracy
- [ ] Spot-check a few flags against reference images
- [ ] Flags with unequal stripes (Bisexual, Progress Pride) render correctly
- [ ] All stripes are hard-edged (no smooth gradients between colors)

---

## Stats Page

### Week Heatmap
- [ ] Shows 7 days (current week by default)
- [ ] Each day cell shows focus session count
- [ ] Heat intensity matches count (0=empty, 1-2=light, 3-4=medium, 5-6=high, 7+=max)
- [ ] Clicking a day selects it and shows its breakdown

### Week Navigation
- [ ] Left arrow goes to previous week
- [ ] Right arrow goes to next week (disabled on current week)
- [ ] Week label shows "This Week" or date range
- [ ] Clicking week label opens calendar picker

### Calendar Picker
- [ ] Month navigation (left/right arrows)
- [ ] Days with sessions show dot indicator
- [ ] Clicking a day jumps to that week and selects the day
- [ ] "Jump to Today" button works
- [ ] Previous/next month padding days are dimmed

### Day Breakdown
- [ ] Shows focus count, short break count, long break count
- [ ] Shows total focus time (formatted as "Xh Xm")
- [ ] Session log lists each session with time, type, and duration

### All-Time Stats
- [ ] Total pomodoros count
- [ ] Total focus time
- [ ] Current streak (consecutive days with at least 1 focus session)
- [ ] Best streak
- [ ] Streak allows today or yesterday as starting point

### Export / Import
- [ ] Export downloads JSON file
- [ ] Import loads sessions from a JSON file
- [ ] Duplicate sessions (same ID) are skipped on import
- [ ] Invalid file shows error message

### Reset
- [ ] Confirmation dialog appears
- [ ] Cancel leaves data intact
- [ ] Confirm clears all sessions

---

## Notifications

- [ ] Focus complete — notification with "Time for a break" message
- [ ] Break complete — notification with "Ready to focus?" message
- [ ] Sound plays on timer completion (ding.wav)

---

## Onboarding

- [ ] First install opens onboarding page in a new tab
- [ ] Onboarding page displays correctly with flag gradient
- [ ] Close button works

---

## Persistence

All state should survive browser restart:
- [ ] Selected flag
- [ ] Custom text color
- [ ] Running timer (resumes with correct remaining time)
- [ ] Paused timer (shows paused state with badge)
- [ ] Session history

---

## Edge Cases

- [ ] Close browser while timer is running — timer completes on next startup if overdue
- [ ] Very long session log — scrolls without breaking layout
- [ ] No sessions yet — empty states shown correctly
- [ ] Rapid start/pause/reset — no crashes or stale state
