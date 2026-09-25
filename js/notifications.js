/* notifications.js — gentle, non-manipulative meal/hydration reminders */

const Notifications = (function () {
  let timers = [];

  function isSupported() {
    return "Notification" in window;
  }

  function permission() {
    return isSupported() ? Notification.permission : "unsupported";
  }

  async function requestPermission() {
    if (!isSupported()) return "unsupported";
    return await Notification.requestPermission();
  }

  function clearScheduled() {
    timers.forEach((t) => clearTimeout(t));
    timers = [];
  }

  function notify(title, body) {
    if (isSupported() && Notification.permission === "granted") {
      try {
        new Notification(title, { body, icon: "" });
      } catch (e) {
        console.warn("Notification failed:", e);
      }
    }
  }

  function scheduleToday() {
    clearScheduled();
    const profile = Storage.getData("aaron_profile", DEFAULT_PROFILE);
    if (!profile.remindersEnabled) return;
    if (permission() !== "granted") return;

    const leadMinutes = Math.max(0, Math.min(60, parseInt(profile.reminderTiming || "5", 10) || 0));
    const plan = Meals.getTodayPlan();
    const now = new Date();

    plan.forEach((meal) => {
      if (meal.completed || meal.skipped) return;
      const [h, m] = meal.time.split(":").map(Number);
      const target = new Date();
      target.setHours(h, m - leadMinutes, 0, 0);
      const delay = target.getTime() - now.getTime();
      if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
        const t = setTimeout(() => {
          notify(meal.title, leadMinutes > 0 ? `Coming up in ${leadMinutes} min` : "It's time for this meal");
        }, delay);
        timers.push(t);
      }
    });
  }

  return { isSupported, permission, requestPermission, notify, scheduleToday, clearScheduled };
})();
