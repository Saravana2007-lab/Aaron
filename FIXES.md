# Aaron Recovery — Fixed Build

This folder is a cleaned-up version of the uploaded Aaron Recovery app.

## Fixes made
- Fixed date handling to use the device's local calendar date instead of UTC, preventing day rollover errors in India and other time zones.
- Fixed the recovery score so an optional bedtime snack cannot reduce the score.
- Fixed the recovery score so hydration contributes to the score only when a doctor-provided fluid target exists.
- Changed hydration tracking without a doctor target to clearly show a neutral tracker state instead of implying that 8 glasses is a prescribed target.
- Fixed the hydration progress bar when no target exists so it no longer calculates `NaN%`.
- Hardened localStorage reads/writes against malformed stored data and storage failures.
- Added validation for logged water amounts, weight entries, and doctor-provided fluid targets.
- Escaped saved check-in notes before inserting them into HTML.
- Improved streak handling so a missed day breaks the consecutive streak rather than allowing it to grow indefinitely.
- Kept the app fully offline and dependency-free.

## Validation
- All JavaScript files pass Node.js syntax checking.
- No build system or npm install is required.

## Run
Open `index.html` directly, or open the folder with VS Code + Live Server.
