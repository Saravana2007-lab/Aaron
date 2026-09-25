# Aaron Recovery

**Recover. Refuel. Rebuild.**

A personal recovery and nutrition organizer built for Aaron — plain HTML, CSS, and vanilla JavaScript, no backend, no build step, fully offline.

## Run it

- Double-click `index.html`, **or**
- Open the folder in VS Code and use the **Live Server** extension.

No `npm install`, no bundler, nothing else required.

## What's included

- Onboarding that captures Aaron's schedule, food likes, and any doctor-given fluid target (never auto-calculated)
- Home dashboard: next meal countdown, today's recovery score, timeline
- Today's Plan with meal cards, alternatives, "why this meal", and gentle missed-meal handling
- Food Library with search and "what can I eat" explanations tied only to the doctor's guideline
- Hydration log (manual entries, doctor's target if provided — otherwise a neutral tracker, never a prescribed amount)
- Progress: weekly consistency, gentle achievements, daily check-in, optional weight log
- Weekly planner and an auto-generated grocery list
- Doctor's Dietary Guidelines screen (the source of truth, shown verbatim)
- Emergency/Safety screen with configurable doctor and emergency contacts and a warning-symptom list that always defers to medical care
- Settings: light/dark/system theme, reminder notifications, editable schedule
- Everything is stored locally in the browser (`localStorage`) — nothing leaves the device

## Important

This app is a recovery **organizer**, not a medical device. It never diagnoses, never modifies medication, and never invents dietary restrictions beyond what the doctor has specified. Wherever medical uncertainty exists, the app defers: *"Your doctor's instructions always take priority."*

## Project structure

```
aaron-recovery/
├── index.html
├── css/
│   ├── style.css        design tokens, base styles, light/dark theme
│   ├── components.css   cards, buttons, nav, forms, sheets, etc.
│   └── responsive.css   breakpoints
├── js/
│   ├── storage.js        localStorage abstraction
│   ├── foodDatabase.js   local food knowledge base
│   ├── data.js           profile defaults + daily plan generator
│   ├── meals.js          today's plan state, completion, swaps
│   ├── hydration.js      hydration log
│   ├── progress.js       adherence tracking, achievements, check-ins
│   ├── notifications.js  gentle browser reminders
│   ├── safety.js         emergency contact + symptom helpers
│   ├── ui.js              small render/UI helpers
│   └── app.js             main controller — screens & events
└── README.md
```

Scripts are loaded as plain `<script>` tags (not ES modules) specifically so the app works when opened directly from disk via `file://`, where module scripts are blocked by the browser's CORS rules.


## Fixed build
The supplied build includes the fixes documented in `FIXES.md`, including local-date handling, neutral hydration tracking, scoring, streak logic, validation, and safer rendering of saved notes.


## Finishing pass

The app also includes:
- JSON export/import for the local recovery record
- Installable PWA support on supported browsers
- Offline service-worker caching when served through Live Server
- A private local-data notice and install status
- Responsive mobile-first UI and dark mode

For PWA/offline installation, use VS Code Live Server (or another local HTTP server) rather than opening `index.html` directly.


## QA status

The final pass checks all JavaScript files with Node syntax validation. The app is designed for browser execution through a local HTTP server such as VS Code Live Server.

Key fixes in the final pass:
- Today’s meal schedule now updates when schedule settings change without losing completion history.
- Startup reminder scheduling is initialized when notifications are enabled.
- Progress data is included in JSON backup/restore.
- Grocery generation is based on the base weekly plan rather than an unrelated full food catalog.
- Duplicate dynamic check-in listener was removed.
- Idli is no longer incorrectly labelled as a whole-grain food.
