export const TEAMS_DATA = {
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
}

export const ACTIVITIES = {
  "Tier 1 — 5 pts/session": {
    points: 5, color: "#E03535",
    items: ["Running/Jogging","Swimming","High-Intensity Sports (Soccer, HIIT, Pickleball, Rowing)","Mountain Biking"]
  },
  "Tier 2 — 3 pts/session": {
    points: 3, color: "#F07B00",
    items: ["Walking","Strength Training","Exercise Class (Spin, Pilates, etc.)","Road Cycling"]
  },
  "Tier 3 — 1 pt/session": {
    points: 1, color: "#2DA84A",
    items: ["Stretching/Yoga","Recreational Sports (Golfing, Bowling)","Other (Yardwork, etc.)"]
  }
}

export const BONUS_ACTIVITIES = [
  { id: "steps10k",  label: "10,000 Steps",          desc: "Hit 10,000 steps today",                                           pts: 3 },
  { id: "extraHour", label: "Extra Hour",             desc: "Went over 1 hour — add per workout",                               pts: 3 },
  { id: "sleep7",    label: "7+ Hours Sleep (×5/wk)", desc: "Hit 7+ hours of sleep for 5 days this week",                      pts: 2 },
  { id: "teammate",  label: "Workout with Teammate",  desc: "Completed a workout with a teammate (virtual or in-person)",       pts: 1 },
  { id: "mindful",   label: "Mindful Moment",         desc: "10+ min of meditation, breathwork, journalling, or digital detox", pts: 1 },
]

export const CHALLENGE_DEFS = {
  steps: {
    id: 'steps', week: 'Week 1', title: 'Steps Challenge',
    dates: 'May 3–9', emoji: '👟',
    days: [
      { label: 'Sat, May 3',  date: '2026-05-03' },
      { label: 'Sun, May 4',  date: '2026-05-04' },
      { label: 'Mon, May 5',  date: '2026-05-05' },
      { label: 'Tue, May 6',  date: '2026-05-06' },
      { label: 'Wed, May 7',  date: '2026-05-07' },
      { label: 'Thu, May 8',  date: '2026-05-08' },
      { label: 'Fri, May 9',  date: '2026-05-09' },
    ],
    unit: 'steps', threshold: 10000, pts: 3,
    desc: 'May 3–9 · Enter daily steps. 10,000+ steps = 3 pts/day.',
  },
  water: {
    id: 'water', week: 'Week 2', title: 'Water Challenge',
    dates: 'May 10–16', emoji: '💧',
    days: [
      { label: 'Sat, May 10', date: '2026-05-10' },
      { label: 'Sun, May 11', date: '2026-05-11' },
      { label: 'Mon, May 12', date: '2026-05-12' },
      { label: 'Tue, May 13', date: '2026-05-13' },
      { label: 'Wed, May 14', date: '2026-05-14' },
      { label: 'Thu, May 15', date: '2026-05-15' },
      { label: 'Fri, May 16', date: '2026-05-16' },
    ],
    unit: 'oz', threshold: 80, pts: 2,
    desc: 'May 10–16 · Enter daily water intake (oz). 80+ oz = 2 pts/day.',
  },
}

export const MAY_DAYS = Array.from({ length: 31 }, (_, i) => i + 1)
export const MONTH_START_DOF = new Date(2026, 4, 1).getDay()

export function todayStr() {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`
}

export function mayDateStr(d) {
  return `2026-05-${String(d).padStart(2,'0')}`
}

export function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
}

export function getWeekNum(dateStr) {
  const d = new Date(dateStr)
  const jan1 = new Date(d.getFullYear(), 0, 1)
  return Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7)
}

export function calcTieredPts(tierPts, durationMins) {
  if (durationMins < 30) return 0
  return Math.floor(durationMins / 30) * tierPts
}

export function getPlayerTeam(playerName) {
  for (const [team, data] of Object.entries(TEAMS_DATA)) {
    if (data.players.includes(playerName)) return team
  }
  return null
}
