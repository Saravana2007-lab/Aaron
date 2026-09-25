/* data.js — data model defaults + daily meal schedule generator */

const DEFAULT_PROFILE = {
  name: "Aaron",
  age: 19,
  sex: "male",
  heightCm: 163,
  weightKg: 45,
  diet: "non-vegetarian",
  wakeTime: "07:00",
  sleepTime: "22:30",
  breakfastTime: "07:30",
  lunchTime: "13:00",
  dinnerTime: "20:00",
  fluidTarget: null, // liters, only if doctor specified — never auto-calculated
  likedFoods: [],
  dislikedFoods: "",
  reminderTiming: "5", // minutes before
  remindersEnabled: false,
  theme: "system",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyServiceNumber: "",
  onboarded: false,
};

// Meal templates: each references food ids from FoodDB for recommended + alternatives.
const MEAL_TEMPLATES = [
  {
    key: "breakfast",
    title: "Recovery Breakfast",
    icon: "bowl",
    offsetFromTime: "breakfastTime",
    recommended: ["idli", "sambar", "egg", "apple"],
    alternatives: [
      { label: "Option A", foods: ["oats", "egg", "spinach"] },
      { label: "Option B", foods: ["dosa", "sambar", "egg"] },
      { label: "Option C", foods: ["poha", "egg", "banana"] },
    ],
  },
  {
    key: "midmorning",
    title: "Mid-morning Snack",
    icon: "fruit",
    offsetMinutesAfter: { of: "breakfastTime", minutes: 180 },
    recommended: ["apple", "curd"],
    alternatives: [
      { label: "Option A", foods: ["banana", "egg"] },
      { label: "Option B", foods: ["guava", "nuts"] },
    ],
  },
  {
    key: "lunch",
    title: "Lunch",
    icon: "bowl",
    offsetFromTime: "lunchTime",
    recommended: ["brown-rice", "dal", "spinach", "chicken"],
    alternatives: [
      { label: "Option A", foods: ["roti", "dal", "beans", "fish"] },
      { label: "Option B", foods: ["millet", "sambar", "okra"] },
    ],
  },
  {
    key: "afternoon",
    title: "Afternoon Snack",
    icon: "salad",
    offsetMinutesAfter: { of: "lunchTime", minutes: 180 },
    recommended: ["carrot", "nuts"],
    alternatives: [
      { label: "Option A", foods: ["papaya", "curd"] },
      { label: "Option B", foods: ["orange", "nuts"] },
    ],
  },
  {
    key: "evening",
    title: "Evening Snack",
    icon: "cup",
    offsetMinutesAfter: { of: "dinnerTime", minutes: -120 },
    recommended: ["low-fat-milk", "banana"],
    alternatives: [
      { label: "Option A", foods: ["curd", "guava"] },
      { label: "Option B", foods: ["nuts", "apple"] },
    ],
  },
  {
    key: "dinner",
    title: "Dinner",
    icon: "utensils",
    offsetFromTime: "dinnerTime",
    recommended: ["roti", "tofu", "beans"],
    alternatives: [
      { label: "Option A", foods: ["quinoa", "fish", "spinach"] },
      { label: "Option B", foods: ["brown-rice", "dal", "bottle-gourd"] },
    ],
  },
  {
    key: "bedtime",
    title: "Optional Bedtime Snack",
    icon: "moon",
    offsetMinutesAfter: { of: "sleepTime", minutes: -60 },
    recommended: ["low-fat-milk"],
    alternatives: [{ label: "Option A", foods: ["curd"] }],
    optional: true,
  },
];

function addMinutesToTime(hhmm, minutes) {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const wrapped = ((total % 1440) + 1440) % 1440;
  const hh = String(Math.floor(wrapped / 60)).padStart(2, "0");
  const mm = String(wrapped % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

function generateDailyPlan(profile) {
  return MEAL_TEMPLATES.map((tpl) => {
    let time;
    if (tpl.offsetFromTime) {
      time = profile[tpl.offsetFromTime] || "08:00";
    } else if (tpl.offsetMinutesAfter) {
      const base = profile[tpl.offsetMinutesAfter.of] || "08:00";
      time = addMinutesToTime(base, tpl.offsetMinutesAfter.minutes);
    }
    return {
      id: tpl.key,
      time,
      title: tpl.title,
      icon: tpl.icon,
      recommended: tpl.recommended,
      alternatives: tpl.alternatives,
      optional: !!tpl.optional,
    };
  }).sort((a, b) => a.time.localeCompare(b.time));
}

const GROCERY_CATEGORIES = {
  Vegetables: ["bottle-gourd", "ridge-gourd", "okra", "spinach", "beans", "carrot"],
  Fruits: ["apple", "papaya", "guava", "banana", "orange", "pear"],
  Proteins: ["egg", "chicken", "fish", "dal", "tofu", "turkey"],
  "Whole Grains": ["brown-rice", "millet", "quinoa", "roti", "oats"],
  "Healthy Fats": ["nuts", "avocado"],
  Dairy: ["low-fat-milk", "curd", "low-fat-cheese"],
};

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];


function generateWeeklyPlans(profile) {
  return WEEK_DAYS.map((day, dayIndex) => ({
    day,
    meals: generateDailyPlan(profile).map((meal) => {
      const options = [meal.recommended, ...(meal.alternatives || []).map((a) => a.foods)];
      const foods = options[dayIndex % options.length] || meal.recommended;
      return { ...meal, selectedFoods: foods };
    }),
  }));
}

const ACHIEVEMENTS = [
  { id: "first-day", label: "First Full Day", test: (p) => p.daysCompleted >= 1 },
  { id: "hydration-habit", label: "Hydration Habit", test: (p) => p.hydrationDaysMet >= 3 },
  { id: "seven-meals", label: "7 Meals Completed", test: (p) => p.totalMealsCompleted >= 7 },
  { id: "seven-day-streak", label: "7-Day Consistency", test: (p) => p.streak >= 7 },
  { id: "fruit-habit", label: "Fruit Habit", test: (p) => p.fruitDaysMet >= 3 },
  { id: "vegetable-habit", label: "Vegetable Habit", test: (p) => p.vegetableDaysMet >= 3 },
];

const MOTIVATIONAL_MESSAGES = [
  "One meal at a time.",
  "Consistency matters more than perfection.",
  "Your job today is simply to follow the plan.",
  "Missed a meal? No problem. Continue with the next one.",
  "Small steps still count.",
];

const WARNING_SYMPTOMS = [
  "Severe or worsening fever",
  "Repeated vomiting",
  "Yellowing of eyes or skin",
  "Severe abdominal pain",
  "Very little or no urine",
  "Confusion",
  "Severe weakness",
  "Difficulty breathing",
  "Rapid deterioration",
];
