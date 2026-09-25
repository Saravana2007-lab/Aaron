/* progress.js — adherence & wellbeing tracking. Never frames metrics as medical outcomes. */

const Progress = (function () {
  function normalizeProgress(value) {
    const base = Meals.defaultProgress();
    if (!value || typeof value !== "object" || Array.isArray(value)) return base;
    return {
      ...base,
      ...value,
      history: value.history && typeof value.history === "object" && !Array.isArray(value.history) ? value.history : {},
    };
  }

  function recordDailySnapshot() {
    const progress = normalizeProgress(Storage.getData("progress", null));
    const key = Storage.todayKey();
    const score = Meals.todayScore();
    const hydration = Hydration.todaySummary();

    progress.history[key] = {
      mealsCompleted: score.mealsCompleted,
      mealsTotal: score.mealsTotal,
      hydrationPct: hydration.target ? Math.min(1, hydration.consumed / hydration.target) : 0,
      vegetableServings: score.vegetableServings,
      fruitServings: score.fruitServings,
    };

    progress.totalMealsCompleted = Object.values(progress.history).reduce(
      (sum, d) => sum + d.mealsCompleted,
      0
    );
    progress.hydrationDaysMet = Object.values(progress.history).filter((d) => d.hydrationPct >= 1).length;
    progress.fruitDaysMet = Object.values(progress.history).filter((d) => d.fruitServings >= 2).length;
    progress.vegetableDaysMet = Object.values(progress.history).filter((d) => d.vegetableServings >= 2).length;

    Storage.saveData("progress", progress);
    return progress;
  }

  function get() {
    return normalizeProgress(Storage.getData("progress", null));
  }

  function last7Days() {
    const progress = get();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = Storage.todayKey(d);
      const entry = progress.history[key];
      days.push({
        label: d.toLocaleDateString(undefined, { weekday: "short" }),
        pct: entry && entry.mealsTotal ? Math.round((entry.mealsCompleted / entry.mealsTotal) * 100) : 0,
      });
    }
    return days;
  }

  function unlockedAchievements() {
    const progress = get();
    return ACHIEVEMENTS.filter((a) => a.test(progress));
  }

  function saveCheckIn(entry) {
    const key = Storage.todayKey();
    const checkins = Storage.getData("daily_checkins", {});
    checkins[key] = { ...entry, date: key, savedAt: new Date().toISOString() };
    Storage.saveData("daily_checkins", checkins);
  }

  function todayCheckIn() {
    const checkins = Storage.getData("daily_checkins", {});
    return checkins[Storage.todayKey()] || null;
  }

  function saveWeight(kg) {
    const logs = Storage.getData("weight_logs", []);
    logs.push({ kg, date: new Date().toISOString() });
    Storage.saveData("weight_logs", logs);
  }

  function weightLogs() {
    return Storage.getData("weight_logs", []);
  }

  return {
    recordDailySnapshot,
    get,
    last7Days,
    unlockedAchievements,
    saveCheckIn,
    todayCheckIn,
    saveWeight,
    weightLogs,
  };
})();
