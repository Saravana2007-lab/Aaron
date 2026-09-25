/* ui.js — small reusable UI helpers */

const UI = (function () {
  function showScreen(id) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    const target = document.getElementById(id);
    if (target) target.classList.add("active");
    document.querySelectorAll(".nav-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.screen === id);
    });
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    target?.scrollIntoView({ block: "start", behavior: "auto" });
  }

  function toast(message) {
    const el = document.getElementById("toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 2200);
  }

  function openSheet(html) {
    document.getElementById("sheet-content").innerHTML =
      '<div class="sheet-handle"></div>' + html;
    document.getElementById("sheet-backdrop").classList.add("open");
  }

  function closeSheet() {
    document.getElementById("sheet-backdrop").classList.remove("open");
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === "light" || theme === "dark") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
  }

  function scoreRingSVG(pct) {
    const r = 42;
    const c = 2 * Math.PI * r;
    const offset = c - (pct / 100) * c;
    return `
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="${r}" stroke="var(--border-soft)" stroke-width="10" fill="none"/>
        <circle cx="50" cy="50" r="${r}" stroke="var(--primary)" stroke-width="10" fill="none"
          stroke-dasharray="${c}" stroke-dashoffset="${offset}" stroke-linecap="round"
          transform="rotate(-90 50 50)"/>
        <text x="50" y="55" text-anchor="middle" font-size="20" font-weight="700" fill="var(--text)">${pct}%</text>
      </svg>`;
  }

  function foodChips(foodIds) {
    return foodIds
      .map((id) => {
        const f = FoodDB.get(id);
        return `<span class="food-chip">${f ? f.name : id}</span>`;
      })
      .join("");
  }

  function foodResultCard(food) {
    const badge = food.recommended
      ? `<span class="badge badge-ok">${svgIcon("checkCircle", 13)} Fits guideline</span>`
      : `<span class="badge badge-avoid">${svgIcon("alertTriangle", 13)} Avoid</span>`;
    const prep = food.preparationMethods && food.preparationMethods.length
      ? `<div class="page-subtitle" style="margin-top:8px;"><strong style="color:var(--text);">Preparation:</strong> ${food.preparationMethods.join(", ")}</div>`
      : "";
    const alts = food.alternatives && food.alternatives.length
      ? `<div class="page-subtitle" style="margin-top:6px;"><strong style="color:var(--text);">Alternatives:</strong> ${food.alternatives.map(a => FoodDB.get(a)?.name || a).join(", ")}</div>`
      : "";
    return `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
          <div style="font-weight:700; font-size:1.02rem;">${food.name}</div>
          ${badge}
        </div>
        <div class="page-subtitle" style="margin-top:8px;">${food.explanation}</div>
        ${prep}
        ${alts}
      </div>`;
  }

  return { showScreen, toast, openSheet, closeSheet, applyTheme, scoreRingSVG, foodChips, foodResultCard };
})();
