/* app.js — main controller: onboarding, rendering, event wiring */

(function () {
  let currentMealForDetail = null;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    renderStaticIcons();
    const profile = Storage.getData("aaron_profile", DEFAULT_PROFILE);
    UI.applyTheme(profile.theme || "system");

    if (!profile.onboarded) {
      initOnboarding();
    } else {
      document.getElementById("onboarding").style.display = "none";
      startMainApp();
    }
  }

  /* ---------------------------- Onboarding ---------------------------- */
  function initOnboarding() {
    const nav = document.getElementById("bottom-nav");
    if (nav) nav.style.display = "none";
    const likeOptions = ["Chicken", "Fish", "Eggs", "Dal", "Idli", "Dosa", "Roti", "Rice", "Millets", "Oats", "Fruits", "Vegetables"];
    const likesWrap = document.getElementById("ob-likes");
    likeOptions.forEach((food) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip-option";
      btn.textContent = food;
      btn.addEventListener("click", () => btn.classList.toggle("selected"));
      likesWrap.appendChild(btn);
    });

    let slide = 0;
    const slides = document.querySelectorAll(".onboard-slide");
    const dotsWrap = document.getElementById("onboard-dots");
    slides.forEach((_, i) => {
      const d = document.createElement("div");
      d.className = "dot" + (i === 0 ? " active" : "");
      dotsWrap.appendChild(d);
    });
    const dots = dotsWrap.querySelectorAll(".dot");

    function render() {
      slides.forEach((s, i) => s.classList.toggle("active", i === slide));
      dots.forEach((d, i) => d.classList.toggle("active", i === slide));
      document.getElementById("ob-back").style.display = slide === 0 ? "none" : "inline-flex";
      document.getElementById("onboard-nav").style.display = slide === 3 ? "none" : "flex";
    }

    document.getElementById("ob-next").addEventListener("click", () => {
      if (slide < slides.length - 1) {
        slide++;
        render();
      }
    });
    document.getElementById("ob-back").addEventListener("click", () => {
      if (slide > 0) {
        slide--;
        render();
      }
    });

    document.getElementById("onboard-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const likes = Array.from(likesWrap.querySelectorAll(".chip-option.selected")).map((b) => b.textContent);
      const profile = {
        ...DEFAULT_PROFILE,
        name: document.getElementById("ob-name").value || "Aaron",
        wakeTime: document.getElementById("ob-wake").value || "07:00",
        sleepTime: document.getElementById("ob-sleep").value || "22:30",
        breakfastTime: document.getElementById("ob-breakfast").value || "07:30",
        lunchTime: document.getElementById("ob-lunch").value || "13:00",
        dinnerTime: document.getElementById("ob-dinner").value || "20:00",
        likedFoods: likes,
        dislikedFoods: document.getElementById("ob-dislikes").value || "",
        fluidTarget: document.getElementById("ob-fluid").value
          ? Math.max(0, parseFloat(document.getElementById("ob-fluid").value))
          : null,
        onboarded: true,
      };
      Storage.saveData("aaron_profile", profile);
      document.getElementById("onboarding").style.display = "none";
      startMainApp();
    });

    render();
  }

  /* ---------------------------- Main app ---------------------------- */
  function startMainApp() {
    const nav = document.getElementById("bottom-nav");
    if (nav) nav.style.display = "flex";
    wireNav();
    wireHome();
    wireHydration();
    wireProgress();
    wireMore();
    wireFoodLibrary();
    wireWeekly();
    wireGrocery();
    wireSafety();
    wireSettings();
    wirePrivacyAndPWA();
    wireSheetDismiss();
    wireMealDetailBack();

    renderAll();
    UI.showScreen("screen-home");
    Progress.recordDailySnapshot();
    Notifications.scheduleToday();

    setInterval(() => {
      renderHome();
      renderPlan();
      Progress.recordDailySnapshot();
    }, 60000);
  }

  function renderAll() {
    renderHome();
    renderPlan();
    renderHydration();
    renderProgress();
    populateSettingsForm();
    renderSafetySymptoms();
  }

  function wireNav() {
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => UI.showScreen(btn.dataset.screen));
    });
    document.querySelectorAll(".more-link").forEach((btn) => {
      btn.addEventListener("click", () => UI.showScreen(btn.dataset.target));
    });
    document.querySelectorAll(".back-btn").forEach((btn) => {
      btn.addEventListener("click", () => UI.showScreen(btn.dataset.target));
    });
  }

  function wireSheetDismiss() {
    document.getElementById("sheet-backdrop").addEventListener("click", (e) => {
      if (e.target.id === "sheet-backdrop") UI.closeSheet();
    });
  }

  /* ---------------------------- Home ---------------------------- */
  function wireHome() {
    document.getElementById("btn-im-hungry").addEventListener("click", openImHungrySheet);
    document.getElementById("btn-log-outside").addEventListener("click", openAteOutsideSheet);
  }

  function renderHome() {
    const profile = Storage.getData("aaron_profile", DEFAULT_PROFILE);
    document.getElementById("home-greeting").textContent = greetingFor(profile.name);
    document.getElementById("home-date").textContent = new Date().toLocaleDateString(undefined, {
      weekday: "long", month: "long", day: "numeric",
    });

    const next = Meals.nextUpcomingMeal();
    document.getElementById("home-next-up").innerHTML = renderHeroCard(next);
    const heroBtn = document.querySelector("#home-next-up .hero-cta");
    if (heroBtn) heroBtn.addEventListener("click", () => openMealDetail(next.id));

    const score = Meals.todayScore();
    document.getElementById("home-score").innerHTML = `
      <div class="score-ring">${UI.scoreRingSVG(score.overall)}</div>
      <div class="score-breakdown">
        <div class="score-item">Meals<strong>${score.mealsCompleted} / ${score.mealsTotal}</strong></div>
        <div class="score-item">Hydration<strong>${score.hydrationConsumed}</strong></div>
        <div class="score-item">Vegetables<strong>${score.vegetableServings} servings</strong></div>
        <div class="score-item">Fruits<strong>${score.fruitServings} servings</strong></div>
      </div>`;

    document.getElementById("home-timeline").innerHTML = renderTimeline();
  }

  function greetingFor(name) {
    const h = new Date().getHours();
    const part = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
    return `Good ${part}, ${name || "Aaron"}`;
  }

  function renderHeroCard(meal) {
    if (!meal) {
      return `<div class="card" style="text-align:center;">
        <div class="icon-chip" style="margin:0 auto;">${svgIcon("checkCircle", 22)}</div>
        <div style="font-weight:700; margin-top:6px;">All planned meals done for today</div>
        <p class="page-subtitle">Nice work staying consistent.</p>
      </div>`;
    }
    const mins = Meals.minutesUntil(meal);
    const countdown = mins <= 0 ? "Now" : mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
    const foodNames = meal.selectedFoods.map((id) => FoodDB.get(id)?.name).filter(Boolean).join(" + ");
    return `
      <div class="hero-card">
        <div class="hero-eyebrow">NEXT UP</div>
        <div class="hero-time">${formatTime(meal.time)}</div>
        <div class="hero-meal">${svgIcon(meal.icon, 18)} ${meal.title}</div>
        <div class="hero-foods">${foodNames}</div>
        <div class="hero-countdown">${countdown}</div>
        <br/>
        <button class="hero-cta">View meal</button>
      </div>`;
  }

  function renderTimeline() {
    const plan = Meals.getTodayPlan();
    return plan
      .map((m) => {
        const state = m.completed ? "done" : m.skipped ? "skipped" : "";
        const icon = m.completed ? "✓" : m.skipped ? "–" : "○";
        const statusText = m.completed ? "Completed" : m.skipped ? "Skipped" : "Upcoming";
        return `
        <div class="timeline-item ${state}">
          <div class="timeline-dot">${icon}</div>
          <div class="timeline-content">
            <div class="timeline-title">${m.title}${m.optional ? " (optional)" : ""}</div>
            <div class="timeline-meta">${formatTime(m.time)} — ${statusText}</div>
          </div>
        </div>`;
      })
      .join("");
  }

  function formatTime(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, "0")} ${period}`;
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* ---------------------------- Today's Plan ---------------------------- */
  function renderPlan() {
    document.getElementById("plan-date").textContent = new Date().toLocaleDateString(undefined, {
      weekday: "long", month: "long", day: "numeric",
    });
    const plan = Meals.getTodayPlan();
    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

    document.getElementById("plan-list").innerHTML = plan.map((m) => mealCardHTML(m, nowMinutes)).join("");

    plan.forEach((m) => {
      const card = document.getElementById(`meal-${m.id}`);
      if (!card) return;
      card.querySelector(".act-eat")?.addEventListener("click", () => {
        Meals.markEaten(m.id);
        Progress.recordDailySnapshot();
        renderAll();
        Notifications.scheduleToday();
        UI.toast(`${m.title} marked as eaten`);
      });
      card.querySelector(".act-alt")?.addEventListener("click", () => openAlternativeSheet(m.id));
      card.querySelector(".act-why")?.addEventListener("click", () => openWhySheet(m.id));
      card.querySelector(".act-details")?.addEventListener("click", () => openMealDetail(m.id));
      card.querySelector(".act-eat-now")?.addEventListener("click", () => {
        Meals.markEaten(m.id);
        Progress.recordDailySnapshot();
        renderAll();
        UI.toast(`${m.title} marked as eaten`);
      });
      card.querySelector(".act-lighter")?.addEventListener("click", () => openAlternativeSheet(m.id));
      card.querySelector(".act-skip")?.addEventListener("click", () => {
        Meals.markSkipped(m.id);
        renderAll();
        UI.toast("Meal skipped. Continuing with your schedule.");
      });
    });
  }

  function mealCardHTML(m, nowMinutes) {
    const [h, mi] = m.time.split(":").map(Number);
    const mealMinutes = h * 60 + mi;
    const isMissed = !m.completed && !m.skipped && nowMinutes - mealMinutes > 60;
    const foods = UI.foodChips(m.selectedFoods);

    let statusBlock;
    if (m.completed) {
      statusBlock = `<div class="meal-status-pill">✓ Completed</div>`;
    } else if (m.skipped) {
      statusBlock = `<div class="meal-status-pill" style="background:var(--warn-tint); color:var(--warn);">Skipped</div>`;
    } else if (isMissed) {
      statusBlock = `
        <div class="page-subtitle" style="color:var(--warn); font-weight:600; margin-top:10px;">You missed this meal.</div>
        <div class="meal-actions">
          <button class="btn btn-primary btn-sm act-eat-now">Eat planned meal now</button>
          <button class="btn btn-secondary btn-sm act-lighter">Choose another option</button>
          <button class="btn btn-ghost btn-sm act-skip">Skip and continue</button>
        </div>`;
    } else {
      statusBlock = `
        <div class="meal-actions">
          <button class="btn btn-primary btn-sm act-eat">Eat this</button>
          <button class="btn btn-secondary btn-sm act-alt">Choose alternative</button>
          <button class="btn btn-ghost btn-sm act-details">View details</button>
        </div>
        <button class="btn btn-ghost btn-sm act-why" style="margin-top:8px;">Why this meal?</button>`;
    }

    return `
      <div class="meal-card" id="meal-${m.id}">
        <div class="meal-card-top">
          <div>
            <div class="meal-label">${m.title.toUpperCase()}</div>
            <div class="meal-time">${formatTime(m.time)}</div>
          </div>
          <div class="meal-icon">${svgIcon(m.icon, 20)}</div>
        </div>
        <div class="meal-foods">${foods}</div>
        ${statusBlock}
      </div>`;
  }

  function openAlternativeSheet(mealId) {
    const plan = Meals.getTodayPlan();
    const meal = plan.find((m) => m.id === mealId);
    const tpl = MEAL_TEMPLATES.find((t) => t.key === mealId);
    let html = `<div class="sheet-title">Choose an alternative — ${meal.title}</div>`;
    html += optionRow("Recommended", tpl.recommended, mealId);
    tpl.alternatives.forEach((alt) => {
      html += optionRow(alt.label, alt.foods, mealId);
    });
    UI.openSheet(html);
    document.querySelectorAll(".alt-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        const foods = btn.dataset.foods.split(",");
        Meals.chooseAlternative(mealId, foods);
        UI.closeSheet();
        renderAll();
        UI.toast("Option updated");
      });
    });
  }

  function optionRow(label, foods, mealId) {
    const names = foods.map((id) => FoodDB.get(id)?.name).filter(Boolean).join(" + ");
    return `
      <button class="alt-option" data-foods="${foods.join(",")}" style="display:block; width:100%; text-align:left; background:var(--surface); border:1.5px solid var(--border-soft); border-radius:var(--r-md); padding:14px; margin-bottom:10px; cursor:pointer;">
        <div style="font-weight:700; font-size:0.85rem; color:var(--primary);">${label}</div>
        <div style="margin-top:4px; font-size:0.92rem;">${names}</div>
      </button>`;
  }

  function openWhySheet(mealId) {
    const plan = Meals.getTodayPlan();
    const meal = plan.find((m) => m.id === mealId);
    let html = `<div class="sheet-title">Why this meal?</div>`;
    meal.selectedFoods.forEach((fid) => {
      const f = FoodDB.get(fid);
      if (!f) return;
      html += `<div style="margin-bottom:14px;"><div style="font-weight:700;">${f.name}</div><div class="page-subtitle">${f.explanation}</div></div>`;
    });
    html += `<div class="priority-note">Your doctor's instructions always take priority.</div>`;
    UI.openSheet(html);
  }

  function openMealDetail(mealId) {
    currentMealForDetail = mealId;
    const plan = Meals.getTodayPlan();
    const meal = plan.find((m) => m.id === mealId);
    const tpl = MEAL_TEMPLATES.find((t) => t.key === mealId);

    let html = `
      <div class="card">
        <div class="meal-label">${meal.title.toUpperCase()}</div>
        <div class="meal-time">${formatTime(meal.time)}</div>
        <div class="section-heading" style="margin-top:16px;">CURRENTLY SELECTED</div>
        <div class="meal-foods">${UI.foodChips(meal.selectedFoods)}</div>
      </div>`;

    tpl.alternatives.forEach((alt) => {
      html += `<div class="card"><div class="meal-label">${alt.label.toUpperCase()}</div><div class="meal-foods" style="margin-top:8px;">${UI.foodChips(alt.foods)}</div></div>`;
    });

    html += `<div class="section-heading">FOOD NOTES</div>`;
    meal.selectedFoods.forEach((fid) => {
      const f = FoodDB.get(fid);
      if (f) html += UI.foodResultCard(f);
    });

    document.getElementById("meal-detail-content").innerHTML = html;
    UI.showScreen("screen-meal-detail");
  }

  function wireMealDetailBack() {
    // handled by generic .back-btn wiring
  }

  /* ---------------------------- "I'm hungry" ---------------------------- */
  function openImHungrySheet() {
    const html = `
      <div class="sheet-title">What are you looking for?</div>
      <div class="quick-grid">
        <div class="quick-tile" data-cat="protein"><span class="quick-emoji">${svgIcon("egg",24)}</span>Protein</div>
        <div class="quick-tile" data-cat="fruit"><span class="quick-emoji">${svgIcon("fruit",24)}</span>Fruit</div>
        <div class="quick-tile" data-cat="vegetable"><span class="quick-emoji">${svgIcon("salad",24)}</span>Vegetable</div>
        <div class="quick-tile" data-cat="main"><span class="quick-emoji">${svgIcon("bowl",24)}</span>Main meal</div>
        <div class="quick-tile" data-cat="snack"><span class="quick-emoji">${svgIcon("cup",24)}</span>Light snack</div>
      </div>`;
    UI.openSheet(html);
    document.querySelectorAll(".quick-tile").forEach((tile) => {
      tile.addEventListener("click", () => showHungryResults(tile.dataset.cat));
    });
  }

  function showHungryResults(cat) {
    let list = [];
    if (cat === "protein") list = FoodDB.byCategory((f) => f.proteinSource && f.recommended);
    else if (cat === "fruit") list = FoodDB.byCategory((f) => f.fruit && f.recommended);
    else if (cat === "vegetable") list = FoodDB.byCategory((f) => f.vegetable && f.recommended);
    else if (cat === "main") list = FoodDB.byCategory((f) => f.mealType.includes("lunch") && f.recommended);
    else if (cat === "snack") list = FoodDB.byCategory((f) => f.mealType.includes("snack") && f.recommended);

    let html = `<div class="sheet-title">Good choices right now</div>`;
    html += list.map((f, i) => `<div class="card" style="margin-bottom:10px;"><strong>${i + 1}. ${f.name}</strong><div class="page-subtitle">${f.explanation}</div></div>`).join("");
    UI.openSheet(html);
  }

  /* ---------------------------- Ate something outside ---------------------------- */
  function openAteOutsideSheet() {
    const html = `
      <div class="sheet-title">Log something you ate</div>
      <p class="page-subtitle" style="margin-bottom:12px;">Where was it from?</p>
      <div class="quick-grid">
        <div class="quick-tile" data-src="Home cooked"><span class="quick-emoji">${svgIcon("home",24)}</span>Home cooked</div>
        <div class="quick-tile" data-src="Restaurant"><span class="quick-emoji">${svgIcon("utensils",24)}</span>Restaurant</div>
        <div class="quick-tile" data-src="College canteen"><span class="quick-emoji">${svgIcon("building",24)}</span>Canteen</div>
        <div class="quick-tile" data-src="Other"><span class="quick-emoji">${svgIcon("square",24)}</span>Other</div>
      </div>`;
    UI.openSheet(html);
    document.querySelectorAll(".quick-tile").forEach((tile) => {
      tile.addEventListener("click", () => confirmAteOutside(tile.dataset.src));
    });
  }

  function confirmAteOutside(source) {
    const html = `
      <div class="sheet-title">Log what you ate</div>
      <p class="page-subtitle" style="margin-bottom:12px;">${escapeHTML(source)} · optional note</p>
      <div class="field"><label for="outside-food-note">Food / note</label><input id="outside-food-note" type="text" maxlength="120" placeholder="e.g. grilled chicken + roti" /></div>
      <button class="btn btn-primary btn-block" id="ate-outside-done">Save log</button>`;
    UI.openSheet(html);
    document.getElementById("ate-outside-done").addEventListener("click", () => {
      const note = document.getElementById("outside-food-note").value.trim();
      const logs = Storage.getData("outside_meals", []);
      logs.push({ source, note, at: new Date().toISOString() });
      Storage.saveData("outside_meals", logs);
      UI.closeSheet();
      UI.toast("Logged. One meal at a time.");
    });
  }

  /* ---------------------------- Hydration ---------------------------- */
  function wireHydration() {
    document.querySelectorAll("[data-ml]").forEach((btn) => {
      btn.addEventListener("click", () => {
        Hydration.addWater(parseInt(btn.dataset.ml, 10));
        renderHydration();
        renderHome();
        Progress.recordDailySnapshot();
        UI.toast("Water logged");
      });
    });
    document.getElementById("hydration-undo").addEventListener("click", () => {
      Hydration.undoLast();
      renderHydration();
      renderHome();
    });
  }

  function renderHydration() {
    const summary = Hydration.todaySummary();
    document.getElementById("hydration-total").textContent = `${summary.consumedDisplay} / ${summary.targetDisplay}`;
    const pct = summary.target
      ? Math.min(100, Math.round((summary.consumed / summary.target) * 100))
      : 0;
    const bar = document.getElementById("hydration-bar");
    bar.style.width = pct + "%";
    bar.setAttribute("aria-valuenow", String(pct));
    bar.setAttribute("aria-valuemax", "100");
    bar.setAttribute("aria-label", summary.usingDoctorTarget ? "Hydration against doctor-provided target" : "Hydration tracker; no target set");

    const log = Hydration.getLog();
    if (!log.entries.length) {
      document.getElementById("hydration-timeline").innerHTML = `<div class="empty-state"><div class="empty-state-emoji">${svgIcon("droplet",26)}</div>No water logged yet today.</div>`;
      return;
    }
    document.getElementById("hydration-timeline").innerHTML = log.entries
      .map((e) => {
        const t = new Date(e.time);
        return `<div class="list-row"><span class="list-row-title">${t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span><span>${e.ml} ml ✓</span></div>`;
      })
      .join("");
  }

  /* ---------------------------- Progress ---------------------------- */
  function wireProgress() {
    document.getElementById("btn-save-weight").addEventListener("click", () => {
      const val = parseFloat(document.getElementById("weight-input").value);
      if (!Number.isFinite(val) || val <= 0 || val > 500) {
        UI.toast("Enter a valid weight");
        return;
      }
      Progress.saveWeight(val);
      document.getElementById("weight-input").value = "";
      renderProgress();
      UI.toast("Weight saved");
    });
  }

  function renderProgress() {
    const progress = Progress.get();
    document.getElementById("streak-count").textContent = progress.streak || 0;

    const days = Progress.last7Days();
    document.getElementById("progress-week-chart").innerHTML = days
      .map(
        (d) => `
      <div class="bar-row">
        <div class="bar-label">${d.label}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${d.pct}%"></div></div>
        <div class="bar-value">${d.pct}%</div>
      </div>`
      )
      .join("");

    const unlocked = Progress.unlockedAchievements();
    if (!unlocked.length) {
      document.getElementById("progress-achievements").innerHTML = `<p class="page-subtitle">Achievements will appear here as you build consistency.</p>`;
    } else {
      document.getElementById("progress-achievements").innerHTML = unlocked
        .map((a) => `<span class="badge badge-ok" style="margin:0 6px 6px 0; display:inline-flex;">${svgIcon("medal",14)} ${a.label}</span>`)
        .join("");
    }

    const todayCheckin = Progress.todayCheckIn();
    document.getElementById("progress-checkin-card").innerHTML = todayCheckin
      ? `<p class="page-subtitle">Today's check-in saved. Energy ${todayCheckin.energy}/5, appetite ${todayCheckin.appetite}/5.</p><button class="btn btn-secondary btn-block" id="btn-open-checkin">Update check-in</button>`
      : `<p class="page-subtitle" style="margin-bottom:12px;">How are you feeling today?</p><button class="btn btn-primary btn-block" id="btn-open-checkin">Do today's check-in</button>`;
    document.getElementById("btn-open-checkin").addEventListener("click", openCheckinSheet);

    const weights = Progress.weightLogs();
    document.getElementById("weight-log-list").innerHTML = weights
      .slice(-5)
      .reverse()
      .map((w) => `<div class="list-row"><span class="list-row-sub">${new Date(w.date).toLocaleDateString()}</span><span class="list-row-title">${w.kg} kg</span></div>`)
      .join("");
  }

  function openCheckinSheet() {
    const existing = Progress.todayCheckIn() || { energy: 3, appetite: 3, hydration: "Okay", meals: "Completed", notes: "" };
    const html = `
      <div class="sheet-title">How are you feeling today?</div>
      <div class="field"><label>Energy</label>${ratingRow("energy", existing.energy)}</div>
      <div class="field"><label>Appetite</label>${ratingRow("appetite", existing.appetite)}</div>
      <div class="field"><label>Hydration</label>${chipRow("hydration", ["Good", "Okay", "Poor"], existing.hydration)}</div>
      <div class="field"><label>Meals</label>${chipRow("meals", ["Completed", "Partially completed", "Mostly missed"], existing.meals)}</div>
      <div class="field"><label for="checkin-notes">Notes (optional)</label><textarea id="checkin-notes" rows="3" style="width:100%; border:1.5px solid var(--border); border-radius:var(--r-sm); padding:12px; background:var(--surface); color:var(--text); font-family:inherit;">${escapeHTML(existing.notes)}</textarea></div>
      <button class="btn btn-primary btn-block" id="btn-save-checkin">Save check-in</button>`;
    UI.openSheet(html);

    let selEnergy = existing.energy;
    let selAppetite = existing.appetite;
    let selHydration = existing.hydration;
    let selMeals = existing.meals;

    document.querySelectorAll('[data-rating="energy"]').forEach((b) => b.addEventListener("click", () => {
      selEnergy = parseInt(b.dataset.value, 10);
      updateRatingUI("energy", selEnergy);
    }));
    document.querySelectorAll('[data-rating="appetite"]').forEach((b) => b.addEventListener("click", () => {
      selAppetite = parseInt(b.dataset.value, 10);
      updateRatingUI("appetite", selAppetite);
    }));
    document.querySelectorAll('[data-chip="hydration"]').forEach((b) => b.addEventListener("click", () => {
      selHydration = b.dataset.value;
      updateChipUI("hydration", selHydration);
    }));
    document.querySelectorAll('[data-chip="meals"]').forEach((b) => b.addEventListener("click", () => {
      selMeals = b.dataset.value;
      updateChipUI("meals", selMeals);
    }));

    document.getElementById("btn-save-checkin").addEventListener("click", () => {
      Progress.saveCheckIn({
        energy: selEnergy,
        appetite: selAppetite,
        hydration: selHydration,
        meals: selMeals,
        notes: document.getElementById("checkin-notes").value,
      });
      UI.closeSheet();
      renderProgress();
      UI.toast("Check-in saved");
    });
  }

  function ratingRow(name, selected) {
    return `<div class="chip-select">${[1, 2, 3, 4, 5]
      .map((n) => `<button type="button" class="chip-option${n === selected ? " selected" : ""}" data-rating="${name}" data-value="${n}">${n}</button>`)
      .join("")}</div>`;
  }
  function updateRatingUI(name, val) {
    document.querySelectorAll(`[data-rating="${name}"]`).forEach((b) => b.classList.toggle("selected", parseInt(b.dataset.value, 10) === val));
  }
  function chipRow(name, options, selected) {
    return `<div class="chip-select">${options
      .map((o) => `<button type="button" class="chip-option${o === selected ? " selected" : ""}" data-chip="${name}" data-value="${o}">${o}</button>`)
      .join("")}</div>`;
  }
  function updateChipUI(name, val) {
    document.querySelectorAll(`[data-chip="${name}"]`).forEach((b) => b.classList.toggle("selected", b.dataset.value === val));
  }

  /* ---------------------------- More / hub ---------------------------- */
  function wireMore() {
    // handled by generic .more-link wiring in wireNav
  }

  /* ---------------------------- Food Library ---------------------------- */
  function wireFoodLibrary() {
    const tabs = [
      { key: "all", label: "All" },
      { key: "protein", label: "Protein" },
      { key: "vegetable", label: "Vegetable" },
      { key: "fruit", label: "Fruit" },
      { key: "grain", label: "Whole Grain" },
      { key: "fat", label: "Healthy Fat" },
      { key: "avoid", label: "Avoid" },
    ];
    const tabWrap = document.getElementById("food-tabs");
    tabWrap.innerHTML = tabs.map((t, i) => `<button class="tab-btn${i === 0 ? " active" : ""}" data-tab="${t.key}">${t.label}</button>`).join("");
    let activeTab = "all";

    function refresh() {
      const q = document.getElementById("food-search").value.trim();
      let results;
      if (q) {
        results = FoodDB.search(q);
      } else if (activeTab === "all") {
        results = FoodDB.all();
      } else if (activeTab === "avoid") {
        results = FoodDB.byCategory((f) => !f.recommended);
      } else {
        const map = { protein: "proteinSource", vegetable: "vegetable", fruit: "fruit", grain: "wholeGrain", fat: "healthyFat" };
        results = FoodDB.byCategory((f) => f[map[activeTab]] && f.recommended);
      }
      renderFoodResults(results);
    }

    tabWrap.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        tabWrap.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeTab = btn.dataset.tab;
        document.getElementById("food-search").value = "";
        refresh();
      });
    });

    document.getElementById("food-search").addEventListener("input", refresh);
    refresh();
  }

  function renderFoodResults(list) {
    const wrap = document.getElementById("food-results");
    if (!list.length) {
      wrap.innerHTML = `<div class="empty-state"><div class="empty-state-emoji">${svgIcon("search",26)}</div>No foods found. Try another search.</div>`;
      return;
    }
    wrap.innerHTML = list.map((f) => UI.foodResultCard(f)).join("");
  }

  /* ---------------------------- Weekly Plan ---------------------------- */
  function wireWeekly() {
    const wrap = document.getElementById("week-pills");
    const todayName = new Date().toLocaleDateString(undefined, { weekday: "long" });
    const initialDay = WEEK_DAYS.includes(todayName) ? todayName : WEEK_DAYS[0];
    wrap.innerHTML = WEEK_DAYS.map((d) => `<button class="week-pill${d === initialDay ? " active" : ""}" data-day="${d}">${d.slice(0, 3)}</button>`).join("");
    wrap.querySelectorAll(".week-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        wrap.querySelectorAll(".week-pill").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderWeeklyDay(btn.dataset.day);
      });
    });
    renderWeeklyDay(initialDay);
  }

  function renderWeeklyDay(day) {
    const profile = Storage.getData("aaron_profile", DEFAULT_PROFILE);
    const weekly = generateWeeklyPlans(profile);
    const selected = weekly.find((d) => d.day === day) || weekly[0];
    const plan = selected.meals;
    document.getElementById("weekly-day-content").innerHTML = plan
      .map(
        (m) => `
      <div class="card">
        <div class="meal-card-top">
          <div><div class="meal-label">${m.title.toUpperCase()}</div><div class="meal-time">${formatTime(m.time)}</div></div>
          <div class="meal-icon">${svgIcon(m.icon, 20)}</div>
        </div>
        <div class="meal-foods">${UI.foodChips(m.selectedFoods)}</div>
      </div>`
      )
      .join("");
  }

  /* ---------------------------- Grocery List ---------------------------- */
  function wireGrocery() {
    document.getElementById("btn-generate-grocery").addEventListener("click", () => {
      const profile = Storage.getData("aaron_profile", DEFAULT_PROFILE);
      const weekly = generateWeeklyPlans(profile);
      const counts = new Map();
      weekly.forEach((day) => {
        day.meals.forEach((meal) => {
          meal.selectedFoods.forEach((id) => counts.set(id, (counts.get(id) || 0) + 1));
        });
      });
      const categoryById = {};
      Object.entries(GROCERY_CATEGORIES).forEach(([cat, ids]) => ids.forEach((id) => { categoryById[id] = cat; }));
      const items = Array.from(counts.entries()).map(([id, count]) => ({
        id,
        category: categoryById[id] || "Other",
        count,
        purchased: false,
      }));
      Storage.saveData("grocery_list", items);
      renderGrocery();
      UI.toast("Grocery list generated from this week's plan");
    });
    document.getElementById("btn-clear-purchased").addEventListener("click", () => {
      const items = Storage.getData("grocery_list", []).filter((i) => !i.purchased);
      Storage.saveData("grocery_list", items);
      renderGrocery();
    });
    renderGrocery();
  }

  function renderGrocery() {
    const items = Storage.getData("grocery_list", []);
    const wrap = document.getElementById("grocery-list");
    if (!items.length) {
      wrap.innerHTML = `<div class="empty-state"><div class="empty-state-emoji">${svgIcon("cart",26)}</div>No grocery list yet. Generate one from your weekly plan.</div>`;
      return;
    }
    const byCategory = {};
    items.forEach((it) => {
      byCategory[it.category] = byCategory[it.category] || [];
      byCategory[it.category].push(it);
    });
    wrap.innerHTML = Object.entries(byCategory)
      .map(([cat, list]) => {
        return `
        <div class="section-heading">${cat.toUpperCase()}</div>
        <div class="card">
          ${list
            .map((it) => {
              const f = FoodDB.get(it.id);
              return `<div class="grocery-item${it.purchased ? " checked" : ""}" data-id="${it.id}">
                <div class="grocery-check">${it.purchased ? "✓" : ""}</div>
                <div class="grocery-name">${f ? f.name : it.id}</div>
                <span class="badge">${it.count || 1} uses/wk</span>
              </div>`;
            })
            .join("")}
        </div>`;
      })
      .join("");

    wrap.querySelectorAll(".grocery-item").forEach((row) => {
      row.addEventListener("click", () => {
        const items = Storage.getData("grocery_list", []);
        const item = items.find((i) => i.id === row.dataset.id);
        if (item) item.purchased = !item.purchased;
        Storage.saveData("grocery_list", items);
        renderGrocery();
      });
    });
  }

  /* ---------------------------- Safety ---------------------------- */
  function renderSafetySymptoms() {
    document.getElementById("safety-symptom-list").innerHTML = Safety.symptoms().map((s) => `<li>${s}</li>`).join("");
  }

  function wireSafety() {
    const contacts = Safety.getContacts();
    document.getElementById("safety-doctor-name").value = contacts.doctorName;
    document.getElementById("safety-doctor-phone").value = contacts.doctorPhone;
    document.getElementById("safety-emergency-number").value = contacts.emergencyNumber;

    document.getElementById("btn-save-safety").addEventListener("click", () => {
      const profile = Storage.getData("aaron_profile", DEFAULT_PROFILE);
      profile.emergencyContactName = document.getElementById("safety-doctor-name").value;
      profile.emergencyContactPhone = document.getElementById("safety-doctor-phone").value;
      profile.emergencyServiceNumber = document.getElementById("safety-emergency-number").value;
      Storage.saveData("aaron_profile", profile);
      UI.toast("Contacts saved");
    });

    document.getElementById("btn-contact-doctor").addEventListener("click", () => {
      const c = Safety.getContacts();
      if (c.doctorPhone) window.location.href = `tel:${c.doctorPhone}`;
      else UI.toast("Add your doctor's phone number below first");
    });
    document.getElementById("btn-emergency-services").addEventListener("click", () => {
      const c = Safety.getContacts();
      if (c.emergencyNumber) window.location.href = `tel:${c.emergencyNumber}`;
      else UI.toast("Add an emergency number below first");
    });
  }

  /* ---------------------------- Settings ---------------------------- */
  function populateSettingsForm() {
    const profile = Storage.getData("aaron_profile", DEFAULT_PROFILE);
    document.getElementById("set-wake").value = profile.wakeTime;
    document.getElementById("set-sleep").value = profile.sleepTime;
    document.getElementById("set-breakfast").value = profile.breakfastTime;
    document.getElementById("set-lunch").value = profile.lunchTime;
    document.getElementById("set-dinner").value = profile.dinnerTime;
    document.getElementById("set-fluid").value = profile.fluidTarget || "";
    document.getElementById("reminders-toggle").checked = !!profile.remindersEnabled;
    document.getElementById("reminder-timing").value = profile.reminderTiming || "5";
    document.querySelectorAll("#theme-select .chip-option").forEach((b) => b.classList.toggle("selected", b.dataset.theme === (profile.theme || "system")));
    updateNotifNote();
  }

  function updateNotifNote() {
    const note = document.getElementById("notif-permission-note");
    if (!Notifications.isSupported()) {
      note.textContent = "Notifications aren't supported in this browser";
    } else if (Notifications.permission() === "denied") {
      note.textContent = "Notifications blocked in browser settings";
    } else if (Notifications.permission() === "granted") {
      note.textContent = "Notifications allowed";
    } else {
      note.textContent = "Tap to allow notifications";
    }
  }

  function wireSettings() {
    document.querySelectorAll("#theme-select .chip-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#theme-select .chip-option").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        const theme = btn.dataset.theme;
        UI.applyTheme(theme);
        const profile = Storage.getData("aaron_profile", DEFAULT_PROFILE);
        profile.theme = theme;
        Storage.saveData("aaron_profile", profile);
      });
    });

    document.getElementById("reminders-toggle").addEventListener("change", async (e) => {
      const profile = Storage.getData("aaron_profile", DEFAULT_PROFILE);
      if (e.target.checked) {
        const perm = await Notifications.requestPermission();
        if (perm !== "granted") {
          e.target.checked = false;
          UI.toast("Notification permission not granted");
          updateNotifNote();
          return;
        }
        profile.remindersEnabled = true;
      } else {
        profile.remindersEnabled = false;
        Notifications.clearScheduled();
      }
      Storage.saveData("aaron_profile", profile);
      updateNotifNote();
      Notifications.scheduleToday();
    });

    document.getElementById("reminder-timing").addEventListener("change", (e) => {
      const profile = Storage.getData("aaron_profile", DEFAULT_PROFILE);
      profile.reminderTiming = e.target.value;
      Storage.saveData("aaron_profile", profile);
      Notifications.scheduleToday();
    });

    document.getElementById("btn-save-settings").addEventListener("click", () => {
      const profile = Storage.getData("aaron_profile", DEFAULT_PROFILE);
      profile.wakeTime = document.getElementById("set-wake").value;
      profile.sleepTime = document.getElementById("set-sleep").value;
      profile.breakfastTime = document.getElementById("set-breakfast").value;
      profile.lunchTime = document.getElementById("set-lunch").value;
      profile.dinnerTime = document.getElementById("set-dinner").value;

      const toMinutes = (value) => { const [h, m] = String(value).split(":").map(Number); return h * 60 + m; };
      const schedule = [profile.wakeTime, profile.breakfastTime, profile.lunchTime, profile.dinnerTime, profile.sleepTime].map(toMinutes);
      const validSchedule = schedule.every(Number.isFinite) && schedule[0] < schedule[1] && schedule[1] < schedule[2] && schedule[2] < schedule[3] && schedule[3] < schedule[4];
      if (!validSchedule) {
        UI.toast("Use this order: wake → breakfast → lunch → dinner → sleep");
        return;
      }
      const fluidValue = document.getElementById("set-fluid").value;
      const parsedFluid = fluidValue ? parseFloat(fluidValue) : null;
      if (fluidValue && (!Number.isFinite(parsedFluid) || parsedFluid <= 0 || parsedFluid > 20)) {
        UI.toast("Enter a valid fluid target");
        return;
      }
      profile.fluidTarget = parsedFluid;
      Storage.saveData("aaron_profile", profile);
      Meals.syncTodaySchedule();
      Notifications.scheduleToday();
      UI.toast("Schedule saved — today's plan updated");
      renderAll();
    });

    document.getElementById("btn-reset-app").addEventListener("click", () => {
      if (confirm("This will erase all saved data on this device. Continue?")) {
        Storage.clearData();
        location.reload();
      }
    });
  }
  /* ---------------------------- Privacy / PWA ---------------------------- */
  function getExportableData() {
    const keys = [
      "aaron_profile",
      "meal_plan",
      "hydration",
      "daily_checkins",
      "weight_logs",
      "grocery_list",
      "outside_meals",
      "progress"
    ];
    const data = {};
    keys.forEach((key) => { data[key] = Storage.getData(key, null); });
    return {
      app: "Aaron Recovery",
      version: 3,
      exportedAt: new Date().toISOString(),
      data
    };
  }

  function downloadJSON(filename, value) {
    const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function wirePrivacyAndPWA() {
    const exportBtn = document.getElementById("btn-export-data");
    const importBtn = document.getElementById("btn-import-data");
    const importInput = document.getElementById("data-import-input");
    const installBtn = document.getElementById("btn-install-app");
    const pwaStatus = document.getElementById("pwa-status");

    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        const stamp = Storage.todayKey();
        downloadJSON(`aaron-recovery-${stamp}.json`, getExportableData());
        UI.toast("Your data was exported");
      });
    }

    if (importBtn && importInput) {
      importBtn.addEventListener("click", () => importInput.click());
      importInput.addEventListener("change", async () => {
        const file = importInput.files && importInput.files[0];
        if (!file) return;
        try {
          const parsed = JSON.parse(await file.text());
          if (!parsed || parsed.app !== "Aaron Recovery" || !parsed.data || typeof parsed.data !== "object") {
            throw new Error("Invalid Aaron Recovery backup");
          }
          const allowed = ["aaron_profile", "meal_plan", "hydration", "daily_checkins", "weight_logs", "grocery_list", "outside_meals", "progress"];
          allowed.forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(parsed.data, key)) {
              Storage.saveData(key, parsed.data[key]);
            }
          });
          UI.toast("Backup imported. Refreshing…");
          setTimeout(() => location.reload(), 700);
        } catch (err) {
          console.error(err);
          UI.toast("That backup file is not valid");
        } finally {
          importInput.value = "";
        }
      });
    }

    let deferredPrompt = null;
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredPrompt = event;
      if (installBtn) {
        installBtn.hidden = false;
        installBtn.textContent = "Install";
      }
      if (pwaStatus) pwaStatus.textContent = "Ready to install on this device.";
    });

    if (installBtn) {
      installBtn.addEventListener("click", async () => {
        if (!deferredPrompt) {
          UI.toast("Use your browser's Add to Home Screen option");
          return;
        }
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        installBtn.hidden = true;
      });
    }

    window.addEventListener("appinstalled", () => {
      if (installBtn) installBtn.hidden = true;
      if (pwaStatus) pwaStatus.textContent = "Installed on this device.";
      UI.toast("Aaron Recovery installed");
    });

    if ("serviceWorker" in navigator && location.protocol !== "file:") {
      navigator.serviceWorker.register("./sw.js").then(() => {
        if (pwaStatus) pwaStatus.textContent = "Offline support is active.";
      }).catch((err) => console.warn("Service worker registration failed:", err));
    }
  }

})();
