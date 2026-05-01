
// ============================================================
//  Move it May 2026 — App Data & State
// ============================================================

const TEAMS_DATA = {
  "Blue Barracudas": {
    color: "#1A8FE3", bg: "#EBF4FD", emoji: "🦈",
    players: ["Lauren Sanford","Bridget Stokes","Mark Marshall","Andrew Carreiro","Brian Warner",
      "Melissa Zweigbaum","Chase Goodwin","Maggie Ryan","Art Pier","Ambre Davenport",
      "Adam Hamza","Lucy Miller","Sophia Mehra","Sal Cucciniello"]
  },
  "Red Jaguars": {
    color: "#E03535", bg: "#FDEAEA", emoji: "🐆",
    players: ["Luke Jonas","Liz Kiefer","Rachel Seidenberg","Pam Zehner","Shardell Hamilton",
      "Laken Tassinari","Maya Hilliard","Tom Polizzi","Steven Zepeda","Shannon Beseth",
      "Caroline Broderick","Cristina Castillo","Mike Waite","Annie Muolo"]
  },
  "Green Monkeys": {
    color: "#2DA84A", bg: "#EAFAF0", emoji: "🐒",
    players: ["Hannah Wagner","Kyle Van Boemel","Vitor DaSilva","Allyx Fabiano","Drew Carter",
      "Billy Sawyer","Kyle Allen","Edward Duval","Sapphire Hernandez","Cheri White",
      "James Reilly","Gene Barsukov","Cory Prescott","Leah Sokol"]
  },
  "Orange Iguanas": {
    color: "#F07B00", bg: "#FEF3E6", emoji: "🦎",
    players: ["Laurie O'Brien","Nikole Sharland","Austin Guerin","Chase Carpenter","Bobby Coy",
      "Donna Le Bell","Jeff Johnson","Ywina Mathieu","Derek DelVecchio","Noel Ong",
      "Robin Iantosca","Marly Grace Paige","Hannah Haslam","Nate Seyler"]
  },
  "Purple Parrots": {
    color: "#8A35CC", bg: "#F4ECFB", emoji: "🦜",
    players: ["Jasmine Hintz","Joe Raposo","Tessa Hom","Hailey Aspinwall","Tim Kelly",
      "Andrew Branchina","Kevin Anderson","Candace Cooper","Blake Vinson","Emily Parsons",
      "Evan Weston","Hallie McLaughlin","Kate Venkauskas","Heather Seyler"]
  },
  "Silver Snakes": {
    color: "#5C7D8F", bg: "#EEF2F4", emoji: "🐍",
    players: ["Melanie Billings","Adam Gross","Andrea O'Blenes","Harley Hitchman","Allie Barker",
      "Bridget Regan","Cathryn Johnson","Ben Weisman","Lindsay Ball","Bridgette Peirce",
      "Brad Bass","Conner Mayheu","Dan Rockwood","Drew Kamaski"]
  }
};

const ACTIVITIES = {
  "Tier 1 — 5 pts/session": {
    points: 5,
    color: "#E03535",
    items: ["Running/Jogging","Swimming","High-Intensity Sports (Soccer, HIIT, Pickleball, Rowing)","Mountain Biking"]
  },
  "Tier 2 — 3 pts/session": {
    points: 3,
    color: "#F07B00",
    items: ["Walking","Strength Training","Exercise Class (Spin, Pilates, etc.)","Road Cycling"]
  },
  "Tier 3 — 1 pt/session": {
    points: 1,
    color: "#2DA84A",
    items: ["Stretching/Yoga","Recreational Sports (Golfing, Bowling)","Other (Yardwork, etc.)"]
  }
};

const BONUS_ACTIVITIES = [
  { id: "steps10k",   label: "10,000 Steps",         desc: "Hit 10,000 steps today",                                           pts: 3 },
  { id: "extraHour",  label: "Extra Hour",            desc: "Went over 1 hour — add per workout",                               pts: 3 },
  { id: "sleep7",     label: "7+ Hours Sleep (×5/wk)",desc: "Hit 7+ hours of sleep for 5 days this week",                      pts: 2 },
  { id: "teammate",   label: "Workout with Teammate", desc: "Completed a workout with a teammate (virtual or in-person)",       pts: 1 },
  { id: "mindful",    label: "Mindful Moment",        desc: "10+ min of meditation, breathwork, journalling, or digital detox", pts: 1 },
];

// ── LocalStorage persistence ──────────────────────────────────
const STORAGE_KEY = 'moveit_may_2026';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return { entries: [] };
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Each entry: { id, player, team, date (YYYY-MM-DD), activities: [{name, tier, duration, pts}], bonuses: [{id, pts}], totalPts, note }
function getPlayerTeam(playerName) {
  for (const [team, data] of Object.entries(TEAMS_DATA)) {
    if (data.players.includes(playerName)) return team;
  }
  return null;
}

function calcActivityPts(tierPts, durationMins) {
  if (durationMins < 30) return 0;
  return tierPts;
}

function calcExtraHourPts(durationMins) {
  // +3 per full hour over 1 hour
  if (durationMins <= 60) return 0;
  return 3 * Math.floor(durationMins / 60);
}

// Expose globally
Object.assign(window, {
  TEAMS_DATA, ACTIVITIES, BONUS_ACTIVITIES,
  loadState, saveState, getPlayerTeam,
  calcActivityPts, calcExtraHourPts
});
