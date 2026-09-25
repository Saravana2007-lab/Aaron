/* storage.js — resilient localStorage abstraction, namespaced, JSON-safe */
const Storage = (function () {
  const PREFIX = "aaronRecovery:";

  function saveData(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error("Storage save failed:", e);
      return false;
    }
  }

  function getData(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) return fallback;
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch (e) {
      console.error("Storage read failed:", e);
      return fallback;
    }
  }

  function removeData(key) {
    try { localStorage.removeItem(PREFIX + key); } catch (e) { console.error("Storage remove failed:", e); }
  }

  function clearData() {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(PREFIX))
        .forEach((k) => localStorage.removeItem(k));
    } catch (e) { console.error("Storage clear failed:", e); }
  }

  // Use the device's local calendar date. toISOString() uses UTC and can shift
  // an India/Asia-Pacific user's "today" around midnight.
  function todayKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return { saveData, getData, removeData, clearData, todayKey };
})();
