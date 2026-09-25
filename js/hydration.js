/* hydration.js — hydration log. Never auto-prescribes a fluid target. */
const Hydration = (function () {
  const GLASS_ML = 250;

  function getLog() {
    const key = Storage.todayKey();
    const logs = Storage.getData("hydration", {});
    if (!logs[key]) {
      logs[key] = { entries: [] };
      Storage.saveData("hydration", logs);
    }
    return logs[key];
  }

  function saveLog(log) {
    const key = Storage.todayKey();
    const logs = Storage.getData("hydration", {});
    logs[key] = log;
    Storage.saveData("hydration", logs);
  }

  function addWater(ml) {
    const amount = Number(ml);
    if (!Number.isFinite(amount) || amount <= 0) return getLog();
    const log = getLog();
    log.entries.push({ ml: amount, time: new Date().toISOString() });
    saveLog(log);
    return log;
  }

  function undoLast() {
    const log = getLog();
    if (log.entries.length) log.entries.pop();
    saveLog(log);
    return log;
  }

  function totalMl() {
    return getLog().entries.reduce((sum, e) => sum + (Number(e.ml) || 0), 0);
  }

  function todaySummary() {
    const profile = Storage.getData("aaron_profile", DEFAULT_PROFILE);
    const consumedMl = totalMl();
    const doctorTarget = Number(profile.fluidTarget);

    if (Number.isFinite(doctorTarget) && doctorTarget > 0) {
      const targetMl = doctorTarget * 1000;
      return {
        consumed: consumedMl,
        target: targetMl,
        consumedDisplay: `${(consumedMl / 1000).toFixed(1)} L`,
        targetDisplay: `${doctorTarget.toFixed(1)} L`,
        usingDoctorTarget: true,
      };
    }

    return {
      consumed: consumedMl,
      target: null,
      consumedDisplay: `${(consumedMl / GLASS_ML).toFixed(1)} glasses`,
      targetDisplay: "No target set",
      usingDoctorTarget: false,
    };
  }

  return { addWater, undoLast, getLog, totalMl, todaySummary, GLASS_ML };
})();
