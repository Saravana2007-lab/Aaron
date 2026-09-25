/* meals.js — today's plan state, completion tracking, swaps, missed-meal logic */

const Meals = (function () {
  function getProfile() {
    return Storage.getData("aaron_profile", DEFAULT_PROFILE);
  }

  function getTodayPlan() {
    const key = Storage.todayKey();
    let plans = Storage.getData("meal_plan", {});
    if (!plans[key]) {
      const profile = getProfile();
      const generated = generateDailyPlan(profile).map((m) => ({
        ...m,
        selectedFoods: m.recommended,
        completed: false,
        completedAt: null,
        skipped: false,
      }));
      plans[key] = generated;
      Storage.saveData("meal_plan", plans);
    }
    return plans[key];
  }

  function saveTodayPlan(plan) {
    const key = Storage.todayKey();
    const plans = Storage.getData("meal_plan", {});
    plans[key] = plan;
    Storage.saveData("meal_plan", plans);
  }

  // Keep today's completion history while applying changed meal times from Settings.
  function syncTodaySchedule() {
    const profile = getProfile();
    const existing = getTodayPlan();
    const fresh = generateDailyPlan(profile);
    const byId = new Map(existing.map((m) => [m.id, m]));
    const merged = fresh.map((m) => {
      const old = byId.get(m.id);
      return {
        ...m,
        selectedFoods: old?.selectedFoods?.length ? old.selectedFoods : m.recommended,
        completed: !!old?.completed,
        completedAt: old?.completedAt || null,
        skipped: !!old?.skipped,
      };
    });
    saveTodayPlan(merged);
    return merged;
  }

  function markEaten(mealId) {
    const plan = getTodayPlan();
    const meal = plan.find((m) => m.id === mealId);
    if (meal) {
      meal.completed = true;
      meal.skipped = false;
      meal.completedAt = new Date().toISOString();
    }
    saveTodayPlan(plan);
    bumpStreakIfDayComplete(plan);
    return plan;
  }

  function markSkipped(mealId) {
    const plan = getTodayPlan();
    const meal = plan.find((m) => m.id === mealId);
    if (meal) {
      meal.skipped = true;
      meal.completed = false;
    }
    saveTodayPlan(plan);
    return plan;
  }

  function chooseAlternative(mealId, foods) {
    const plan = getTodayPlan();
    const meal = plan.find((m) => m.id === mealId);
    if (meal) meal.selectedFoods = foods;
    saveTodayPlan(plan);
    return plan;
  }

  function nextUpcomingMeal() {
    const plan = getTodayPlan();
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const upcoming = plan
      .filter((m) => !m.completed && !m.skipped)
      .map((m) => {
        const [h, mi] = m.time.split(":").map(Number);
        return { meal: m, minutes: h * 60 + mi };
      })
      .sort((a, b) => a.minutes - b.minutes);

    const future = upcoming.find((u) => u.minutes >= nowMinutes);
    return (future || upcoming[0] || null)?.meal || null;
  }

  function minutesUntil(meal) {
    if (!meal) return null;
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const [h, m] = meal.time.split(":").map(Number);
    let target = h * 60 + m;
    let diff = target - nowMinutes;
    if (diff < -30) diff += 1440; // treat as tomorrow if long past
    return diff;
  }

  function todayScore() {
    const plan = getTodayPlan();
    // Optional bedtime snacks should not lower the daily score.
    const requiredPlan = plan.filter((m) => !m.optional);
    const total = requiredPlan.length;
    const completed = requiredPlan.filter((m) => m.completed).length;
    const hydration = Hydration.todaySummary();
    const veg = countTagInPlan(requiredPlan, "vegetable");
    const fruit = countTagInPlan(requiredPlan, "fruit");

    const mealPct = total ? completed / total : 0;
    // If no doctor-provided target exists, hydration is a neutral tracker and
    // must not silently reduce the score.
    const hasHydrationTarget = hydration.usingDoctorTarget && hydration.target > 0;
    const hydrationPct = hasHydrationTarget
      ? Math.min(1, hydration.consumed / hydration.target)
      : null;
    const overall = Math.round(
      (hasHydrationTarget ? mealPct * 0.6 + hydrationPct * 0.4 : mealPct) * 100
    );

    return {
      overall,
      mealsCompleted: completed,
      mealsTotal: total,
      hydrationConsumed: hydration.consumedDisplay,
      hydrationTarget: hydration.targetDisplay,
      vegetableServings: veg,
      fruitServings: fruit,
    };
  }

  function countTagInPlan(plan, tagField) {
    let count = 0;
    plan.forEach((m) => {
      if (!m.completed) return;
      m.selectedFoods.forEach((fid) => {
        const f = FoodDB.get(fid);
        if (f && f[tagField]) count++;
      });
    });
    return count;
  }

  function bumpStreakIfDayComplete(plan) {
    const required = plan.filter((m) => !m.optional);
    if (!required.length || !required.every((m) => m.completed)) return;

    const rawProgress = Storage.getData("progress", null);
    const progress = rawProgress && typeof rawProgress === "object" && !Array.isArray(rawProgress)
      ? { ...defaultProgress(), ...rawProgress, history: rawProgress.history && typeof rawProgress.history === "object" && !Array.isArray(rawProgress.history) ? rawProgress.history : {} }
      : defaultProgress();
    const key = Storage.todayKey();
    if (progress.lastStreakDay === key) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = Storage.todayKey(yesterday);
    const yesterdayEntry = progress.history && progress.history[yesterdayKey];
    const yesterdayComplete =
      yesterdayEntry &&
      yesterdayEntry.mealsTotal > 0 &&
      yesterdayEntry.mealsCompleted >= yesterdayEntry.mealsTotal;

    progress.streak = yesterdayComplete ? (progress.streak || 0) + 1 : 1;
    progress.lastStreakDay = key;
    progress.daysCompleted = (progress.daysCompleted || 0) + 1;
    Storage.saveData("progress", progress);
  }

  function defaultProgress() {
    return {
      streak: 0,
      lastStreakDay: null,
      daysCompleted: 0,
      totalMealsCompleted: 0,
      hydrationDaysMet: 0,
      fruitDaysMet: 0,
      vegetableDaysMet: 0,
      history: {}, // key: date -> {mealsCompleted, mealsTotal, hydrationPct}
    };
  }

  return {
    getTodayPlan,
    saveTodayPlan,
    markEaten,
    markSkipped,
    chooseAlternative,
    nextUpcomingMeal,
    minutesUntil,
    todayScore,
    defaultProgress,
    syncTodaySchedule,
  };
})();
