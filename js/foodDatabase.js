/* foodDatabase.js — local food knowledge base.
   IMPORTANT: no disease/treatment claims. Every "explanation" only ever
   references fit with the doctor's dietary guideline, never a medical outcome. */

const FoodDB = (function () {
  const foods = [
    // ---------------- PROTEIN ----------------
    { id: "egg", name: "Egg (boiled)", category: "Protein", mealType: ["breakfast", "snack", "lunch", "dinner"],
      vegetarian: true, recommended: true, wholeGrain: false, proteinSource: true, vegetable: false, fruit: false, healthyFat: false,
      preparationMethods: ["Boiled", "Poached", "Lightly scrambled with little oil"],
      tags: ["protein", "quick", "portable"], alternatives: ["chicken", "fish", "dal", "tofu"],
      explanation: "Lean protein option listed in your doctor's guideline." },
    { id: "chicken", name: "Skinless chicken", category: "Protein", mealType: ["lunch", "dinner"],
      vegetarian: false, recommended: true, wholeGrain: false, proteinSource: true, vegetable: false, fruit: false, healthyFat: false,
      preparationMethods: ["Grilled", "Boiled", "Light curry, minimal oil"],
      tags: ["protein", "main meal"], alternatives: ["fish", "egg", "dal", "tofu"],
      explanation: "Lean protein option listed in your doctor's guideline. Skinless and grilled/boiled preparations fit best." },
    { id: "fish", name: "Fish", category: "Protein", mealType: ["lunch", "dinner"],
      vegetarian: false, recommended: true, wholeGrain: false, proteinSource: true, vegetable: false, fruit: false, healthyFat: false,
      preparationMethods: ["Steamed", "Grilled", "Light curry"],
      tags: ["protein", "main meal"], alternatives: ["chicken", "egg", "tofu", "dal"],
      explanation: "Lean protein option listed in your doctor's guideline." },
    { id: "turkey", name: "Turkey", category: "Protein", mealType: ["lunch", "dinner"],
      vegetarian: false, recommended: true, wholeGrain: false, proteinSource: true, vegetable: false, fruit: false, healthyFat: false,
      preparationMethods: ["Grilled", "Boiled"], tags: ["protein"], alternatives: ["chicken", "fish", "tofu"],
      explanation: "Lean protein option listed in your doctor's guideline." },
    { id: "dal", name: "Dal / lentils", category: "Protein", mealType: ["lunch", "dinner"],
      vegetarian: true, recommended: true, wholeGrain: false, proteinSource: true, vegetable: false, fruit: false, healthyFat: false,
      preparationMethods: ["Boiled", "Light tempering with minimal oil"],
      tags: ["protein", "legume", "vegetarian"], alternatives: ["tofu", "egg", "chicken", "fish"],
      explanation: "Legume / pulse protein listed in your doctor's guideline." },
    { id: "tofu", name: "Tofu", category: "Protein", mealType: ["lunch", "dinner", "snack"],
      vegetarian: true, recommended: true, wholeGrain: false, proteinSource: true, vegetable: false, fruit: false, healthyFat: false,
      preparationMethods: ["Grilled", "Light stir-fry", "Steamed"],
      tags: ["protein", "vegetarian"], alternatives: ["dal", "egg", "chicken", "fish"],
      explanation: "Plant-based lean protein listed in your doctor's guideline." },
    { id: "curd", name: "Curd / yogurt (low-fat)", category: "Protein", mealType: ["breakfast", "snack", "lunch"],
      vegetarian: true, recommended: true, wholeGrain: false, proteinSource: true, vegetable: false, fruit: false, healthyFat: false,
      preparationMethods: ["Plain, unsweetened"], tags: ["protein", "dairy", "quick"], alternatives: ["low-fat milk", "egg"],
      explanation: "Reduced-fat dairy protein source listed in your doctor's guideline." },
    { id: "nuts", name: "Unsalted nuts", category: "Healthy Fat", mealType: ["snack"],
      vegetarian: true, recommended: true, wholeGrain: false, proteinSource: true, vegetable: false, fruit: false, healthyFat: true,
      preparationMethods: ["Raw, unsalted, small portion"], tags: ["fat", "protein", "snack"], alternatives: ["avocado", "curd"],
      explanation: "Healthy fat and light protein source listed in your doctor's guideline." },

    // ---------------- WHOLE GRAIN ----------------
    { id: "brown-rice", name: "Brown rice", category: "Whole Grain", mealType: ["lunch", "dinner"],
      vegetarian: true, recommended: true, wholeGrain: true, proteinSource: false, vegetable: false, fruit: false, healthyFat: false,
      preparationMethods: ["Steamed / boiled"], tags: ["grain", "main meal"], alternatives: ["millet", "quinoa", "whole-grain roti"],
      explanation: "Whole-grain option listed in your doctor's guideline." },
    { id: "millet", name: "Millets (ragi / jowar / bajra)", category: "Whole Grain", mealType: ["breakfast", "lunch", "dinner"],
      vegetarian: true, recommended: true, wholeGrain: true, proteinSource: false, vegetable: false, fruit: false, healthyFat: false,
      preparationMethods: ["Dosa", "Porridge", "Roti"], tags: ["grain"], alternatives: ["brown-rice", "quinoa", "whole-grain roti"],
      explanation: "Whole-grain option listed in your doctor's guideline." },
    { id: "quinoa", name: "Quinoa", category: "Whole Grain", mealType: ["lunch", "dinner"],
      vegetarian: true, recommended: true, wholeGrain: true, proteinSource: false, vegetable: false, fruit: false, healthyFat: false,
      preparationMethods: ["Boiled / steamed"], tags: ["grain"], alternatives: ["brown-rice", "millet"],
      explanation: "Whole-grain option listed in your doctor's guideline." },
    { id: "oats", name: "Oats", category: "Whole Grain", mealType: ["breakfast"],
      vegetarian: true, recommended: true, wholeGrain: true, proteinSource: false, vegetable: false, fruit: false, healthyFat: false,
      preparationMethods: ["Porridge with vegetables or fruit"], tags: ["grain", "breakfast"], alternatives: ["millet", "whole-grain roti"],
      explanation: "Whole-grain option listed in your doctor's guideline." },
    { id: "roti", name: "Whole-grain roti", category: "Whole Grain", mealType: ["lunch", "dinner"],
      vegetarian: true, recommended: true, wholeGrain: true, proteinSource: false, vegetable: false, fruit: false, healthyFat: false,
      preparationMethods: ["Tawa-cooked, minimal oil"], tags: ["grain"], alternatives: ["brown-rice", "millet"],
      explanation: "Whole-grain option listed in your doctor's guideline." },
    { id: "idli", name: "Idli", category: "Breakfast", mealType: ["breakfast"],
      vegetarian: true, recommended: true, wholeGrain: false, proteinSource: false, vegetable: false, fruit: false, healthyFat: false,
      preparationMethods: ["Steamed"], tags: ["Indian", "light", "breakfast"], alternatives: ["dosa", "oats", "poha"],
      explanation: "Steamed Indian breakfast option that fits the small-meal pattern; it is not being counted as a whole-grain serving." },
    { id: "dosa", name: "Ragi dosa", category: "Breakfast", mealType: ["breakfast"],
      vegetarian: true, recommended: true, wholeGrain: true, proteinSource: false, vegetable: false, fruit: false, healthyFat: false,
      preparationMethods: ["Tawa, minimal oil"], tags: ["Indian", "breakfast"], alternatives: ["idli", "oats", "poha"],
      explanation: "Millet-based, whole-grain breakfast option." },
    { id: "poha", name: "Vegetable poha", category: "Breakfast", mealType: ["breakfast"],
      vegetarian: true, recommended: true, wholeGrain: false, proteinSource: false, vegetable: true, fruit: false, healthyFat: false,
      preparationMethods: ["Light tempering, minimal oil"], tags: ["Indian", "breakfast"], alternatives: ["idli", "dosa", "oats"],
      explanation: "Light, vegetable-forward breakfast option." },
    { id: "sambar", name: "Sambhar (dal + vegetable)", category: "Protein + Vegetable", mealType: ["breakfast", "lunch", "dinner"],
      vegetarian: true, recommended: true, wholeGrain: false, proteinSource: true, vegetable: true, fruit: false, healthyFat: false,
      preparationMethods: ["Boiled, light tempering"], tags: ["protein", "vegetable"], alternatives: ["dal", "vegetable curry"],
      explanation: "Combines lentil protein and vegetables, both encouraged in your doctor's guideline." },

    // ---------------- VEGETABLES ----------------
    { id: "bottle-gourd", name: "Bottle gourd", category: "Vegetable", mealType: ["lunch", "dinner"],
      vegetarian: true, recommended: true, wholeGrain: false, proteinSource: false, vegetable: true, fruit: false, healthyFat: false,
      preparationMethods: ["Steamed", "Light curry"], tags: ["vegetable", "non-starchy"], alternatives: ["ridge-gourd", "spinach"],
      explanation: "Non-starchy vegetable — helps fill half the plate as your guideline suggests." },
    { id: "ridge-gourd", name: "Ridge gourd", category: "Vegetable", mealType: ["lunch", "dinner"],
      vegetarian: true, recommended: true, wholeGrain: false, proteinSource: false, vegetable: true, fruit: false, healthyFat: false,
      preparationMethods: ["Light curry", "Steamed"], tags: ["vegetable", "non-starchy"], alternatives: ["bottle-gourd", "okra"],
      explanation: "Non-starchy vegetable listed in your doctor's guideline." },
    { id: "okra", name: "Lady's finger / okra", category: "Vegetable", mealType: ["lunch", "dinner"],
      vegetarian: true, recommended: true, wholeGrain: false, proteinSource: false, vegetable: true, fruit: false, healthyFat: false,
      preparationMethods: ["Light sauté, minimal oil", "Steamed"], tags: ["vegetable", "non-starchy"], alternatives: ["ridge-gourd", "beans"],
      explanation: "Non-starchy vegetable listed in your doctor's guideline." },
    { id: "spinach", name: "Spinach", category: "Vegetable", mealType: ["lunch", "dinner"],
      vegetarian: true, recommended: true, wholeGrain: false, proteinSource: false, vegetable: true, fruit: false, healthyFat: false,
      preparationMethods: ["Light sauté", "Steamed", "Added to dal"], tags: ["vegetable", "leafy", "non-starchy"], alternatives: ["beans", "bottle-gourd"],
      explanation: "Leafy non-starchy vegetable listed in your doctor's guideline." },
    { id: "beans", name: "Green beans", category: "Vegetable", mealType: ["lunch", "dinner"],
      vegetarian: true, recommended: true, wholeGrain: false, proteinSource: false, vegetable: true, fruit: false, healthyFat: false,
      preparationMethods: ["Steamed", "Light sauté"], tags: ["vegetable", "non-starchy"], alternatives: ["okra", "spinach"],
      explanation: "Non-starchy vegetable listed in your doctor's guideline." },
    { id: "carrot", name: "Carrot", category: "Vegetable", mealType: ["lunch", "dinner", "snack"],
      vegetarian: true, recommended: true, wholeGrain: false, proteinSource: false, vegetable: true, fruit: false, healthyFat: false,
      preparationMethods: ["Raw", "Steamed"], tags: ["vegetable"], alternatives: ["beans", "bottle-gourd"],
      explanation: "Vegetable that helps fill half the plate as your guideline suggests." },

    // ---------------- FRUIT ----------------
    { id: "apple", name: "Apple", category: "Fruit", mealType: ["snack", "breakfast"],
      vegetarian: true, recommended: true, wholeGrain: false, proteinSource: false, vegetable: false, fruit: true, healthyFat: false,
      preparationMethods: ["Fresh, whole"], tags: ["fruit"], alternatives: ["guava", "papaya", "pear", "orange"],
      explanation: "Whole fruit — variety of fruit is encouraged in your doctor's guideline." },
    { id: "papaya", name: "Papaya", category: "Fruit", mealType: ["snack", "breakfast"],
      vegetarian: true, recommended: true, wholeGrain: false, proteinSource: false, vegetable: false, fruit: true, healthyFat: false,
      preparationMethods: ["Fresh"], tags: ["fruit"], alternatives: ["apple", "guava", "pear"],
      explanation: "Whole fruit listed in your doctor's guideline." },
    { id: "guava", name: "Guava", category: "Fruit", mealType: ["snack"],
      vegetarian: true, recommended: true, wholeGrain: false, proteinSource: false, vegetable: false, fruit: true, healthyFat: false,
      preparationMethods: ["Fresh"], tags: ["fruit"], alternatives: ["apple", "papaya", "orange"],
      explanation: "Whole fruit listed in your doctor's guideline." },
    { id: "banana", name: "Banana", category: "Fruit", mealType: ["snack", "breakfast"],
      vegetarian: true, recommended: true, wholeGrain: false, proteinSource: false, vegetable: false, fruit: true, healthyFat: false,
      preparationMethods: ["Fresh"], tags: ["fruit"], alternatives: ["apple", "pear", "orange"],
      explanation: "Whole fruit listed in your doctor's guideline." },
    { id: "orange", name: "Orange", category: "Fruit", mealType: ["snack"],
      vegetarian: true, recommended: true, wholeGrain: false, proteinSource: false, vegetable: false, fruit: true, healthyFat: false,
      preparationMethods: ["Fresh"], tags: ["fruit"], alternatives: ["guava", "papaya", "pear"],
      explanation: "Whole fruit listed in your doctor's guideline." },
    { id: "pear", name: "Pear", category: "Fruit", mealType: ["snack"],
      vegetarian: true, recommended: true, wholeGrain: false, proteinSource: false, vegetable: false, fruit: true, healthyFat: false,
      preparationMethods: ["Fresh"], tags: ["fruit"], alternatives: ["apple", "guava", "orange"],
      explanation: "Whole fruit listed in your doctor's guideline." },

    // ---------------- HEALTHY FAT / DAIRY ----------------
    { id: "avocado", name: "Avocado", category: "Healthy Fat", mealType: ["snack", "breakfast"],
      vegetarian: true, recommended: true, wholeGrain: false, proteinSource: false, vegetable: false, fruit: false, healthyFat: true,
      preparationMethods: ["Fresh, small portion"], tags: ["fat"], alternatives: ["nuts", "low-fat cheese"],
      explanation: "Healthy fat listed in your doctor's guideline." },
    { id: "low-fat-milk", name: "Low-fat / non-fat milk", category: "Healthy Fat", mealType: ["breakfast", "snack"],
      vegetarian: true, recommended: true, wholeGrain: false, proteinSource: true, vegetable: false, fruit: false, healthyFat: true,
      preparationMethods: ["Plain"], tags: ["dairy"], alternatives: ["curd", "low-fat cheese"],
      explanation: "Reduced-fat dairy listed in your doctor's guideline." },
    { id: "low-fat-cheese", name: "Low-fat cheese", category: "Healthy Fat", mealType: ["snack"],
      vegetarian: true, recommended: true, wholeGrain: false, proteinSource: true, vegetable: false, fruit: false, healthyFat: true,
      preparationMethods: ["Small portion"], tags: ["dairy"], alternatives: ["curd", "low-fat-milk"],
      explanation: "Reduced-fat dairy listed in your doctor's guideline." },

    // ---------------- AVOID ----------------
    { id: "white-bread", name: "White bread", category: "Avoid", mealType: [],
      vegetarian: true, recommended: false, wholeGrain: false, proteinSource: false, vegetable: false, fruit: false, healthyFat: false,
      preparationMethods: [], tags: ["refined grain"], alternatives: ["whole-grain roti", "millet", "oats"],
      explanation: "Refined grain — your doctor's guideline suggests limiting this." },
    { id: "white-rice", name: "White rice", category: "Avoid", mealType: [],
      vegetarian: true, recommended: false, wholeGrain: false, proteinSource: false, vegetable: false, fruit: false, healthyFat: false,
      preparationMethods: [], tags: ["refined grain"], alternatives: ["brown-rice", "millet", "quinoa"],
      explanation: "Refined grain — your doctor's guideline suggests preferring whole grains instead." },
    { id: "fried-foods", name: "Fried foods", category: "Avoid", mealType: [],
      vegetarian: true, recommended: false, wholeGrain: false, proteinSource: false, vegetable: false, fruit: false, healthyFat: false,
      preparationMethods: [], tags: ["fried"], alternatives: ["grilled", "steamed", "boiled preparations"],
      explanation: "Fried preparation — your doctor's guideline suggests avoiding this." },
    { id: "butter", name: "Butter", category: "Avoid", mealType: [],
      vegetarian: true, recommended: false, wholeGrain: false, proteinSource: false, vegetable: false, fruit: false, healthyFat: false,
      preparationMethods: [], tags: ["unhealthy fat"], alternatives: ["avocado", "nuts"],
      explanation: "Unhealthy fat — your doctor's guideline suggests avoiding this." },
    { id: "cream", name: "Cream", category: "Avoid", mealType: [],
      vegetarian: true, recommended: false, wholeGrain: false, proteinSource: false, vegetable: false, fruit: false, healthyFat: false,
      preparationMethods: [], tags: ["unhealthy fat"], alternatives: ["low-fat-milk", "curd"],
      explanation: "Unhealthy fat — your doctor's guideline suggests avoiding this." },
    { id: "salty-packaged", name: "High-salt packaged foods", category: "Avoid", mealType: [],
      vegetarian: true, recommended: false, wholeGrain: false, proteinSource: false, vegetable: false, fruit: false, healthyFat: false,
      preparationMethods: [], tags: ["high-salt"], alternatives: ["home-cooked, unsalted snacks", "nuts", "fruit"],
      explanation: "High-salt food — your doctor's guideline suggests avoiding this." },
    { id: "sugary-drinks", name: "Sugary drinks", category: "Avoid", mealType: [],
      vegetarian: true, recommended: false, wholeGrain: false, proteinSource: false, vegetable: false, fruit: false, healthyFat: false,
      preparationMethods: [], tags: ["added sugar"], alternatives: ["water", "fresh fruit"],
      explanation: "Added sugar — your doctor's guideline suggests avoiding this." },
    { id: "added-sugar-foods", name: "Added-sugar foods", category: "Avoid", mealType: [],
      vegetarian: true, recommended: false, wholeGrain: false, proteinSource: false, vegetable: false, fruit: false, healthyFat: false,
      preparationMethods: [], tags: ["added sugar"], alternatives: ["fresh fruit"],
      explanation: "Added sugar — your doctor's guideline suggests avoiding this." },
    { id: "alcohol", name: "Alcohol", category: "Avoid", mealType: [],
      vegetarian: true, recommended: false, wholeGrain: false, proteinSource: false, vegetable: false, fruit: false, healthyFat: false,
      preparationMethods: [], tags: ["alcohol"], alternatives: ["water", "fresh fruit"],
      explanation: "Your doctor's guideline lists this as something to avoid." },
  ];

  const byId = Object.fromEntries(foods.map((f) => [f.id, f]));

  function all() {
    return foods;
  }

  function get(id) {
    return byId[id] || null;
  }

  function search(query) {
    const q = (query || "").trim().toLowerCase();
    if (!q) return [];
    return foods.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.tags.some((t) => t.toLowerCase().includes(q)) ||
        f.category.toLowerCase().includes(q)
    );
  }

  function alternativesFor(id) {
    const f = get(id);
    if (!f) return [];
    return f.alternatives.map((aid) => byId[aid]).filter(Boolean);
  }

  function byCategory(catPredicate) {
    return foods.filter(catPredicate);
  }

  function isRecommended(id) {
    const f = get(id);
    return f ? f.recommended : null;
  }

  return { all, get, search, alternativesFor, byCategory, isRecommended };
})();
