import { Rank } from "./types";

export const RANK_ORDER = [
  Rank.E,
  Rank.E_PLUS,
  Rank.D,
  Rank.D_PLUS,
  Rank.C,
  Rank.C_PLUS,
  Rank.B,
  Rank.B_PLUS,
  Rank.A,
  Rank.A_PLUS,
  Rank.S,
  Rank.S_PLUS,
  Rank.SS,
  Rank.SS_PLUS,
  Rank.SSS
];

export const RANK_TITLES: Record<string, string> = {
  [Rank.E]: "NOVICE HUNTER",
  [Rank.E_PLUS]: "NOVICE HUNTER+",
  [Rank.D]: "HUNTER",
  [Rank.D_PLUS]: "HUNTER+",
  [Rank.C]: "VETERAN HUNTER",
  [Rank.C_PLUS]: "VETERAN HUNTER+",
  [Rank.B]: "ELITE HUNTER",
  [Rank.B_PLUS]: "ELITE HUNTER+",
  [Rank.A]: "MASTER HUNTER",
  [Rank.A_PLUS]: "MASTER HUNTER+",
  [Rank.S]: "MONARCH",
  [Rank.S_PLUS]: "MONARCH+",
  [Rank.SS]: "NATIONAL LEVEL",
  [Rank.SS_PLUS]: "NATIONAL LEVEL+",
  [Rank.SSS]: "SHADOW MONARCH"
};

export const EXP_PER_LEVEL = 1000;

export const INITIAL_STATS = {
  rank: Rank.E,
  level: 1,
  exp: 0,
  maxExp: 1000,
  gold: 500, // Starting gold
  streak: 0,
  lastActive: new Date().toISOString(),
  totalFocusTime: 0,
  completedQuests: 0,
  activeTitle: "The Awakening",
  titles: ["The Awakening"]
};

export const AVAILABLE_TITLES = [
  { id: "awakening", name: "The Awakening", condition: "Initial Title", difficulty: "Easy" },
  { id: "hard_worker", name: "Hard Worker", condition: "Complete 10 Quests", difficulty: "Easy" },
  { id: "scholar", name: "Determined Scholar", condition: "Complete a Hard quest", difficulty: "Hard" },
  { id: "iron_will", name: "Iron Will", condition: "Completed 50 Quests", difficulty: "Medium" },
  { id: "shadow_conqueror", name: "Shadow Conqueror", condition: "Reach Level 10", difficulty: "Hard" },
  { id: "undying", name: "The Undying", condition: "Maintain a 10-day streak", difficulty: "Medium" },
  { id: "beast_slayer", name: "Beast Slayer", condition: "Complete 5 Daily Quests in one day", difficulty: "Medium" }
];

export const STORE_ITEMS = [
  { 
    id: "recovery_potion", 
    name: "Full Recovery Potion", 
    description: "Restores a lost streak and heals penalty damage to your status.",
    cost: 1200,
    icon: "FlaskConical",
    type: "consumable"
  },
  { 
    id: "exp_scroll", 
    name: "EXP Growth Scroll", 
    description: "Multiplies EXP gained from the next 3 missions by 1.5x.",
    cost: 800,
    icon: "Scroll",
    type: "buff"
  },
  { 
    id: "mana_elixir", 
    name: "Focus Mana Elixir", 
    description: "Unlocks advanced focus chamber resonance (+20% Focus Time Efficiency).",
    cost: 2500,
    icon: "Zap",
    type: "buff"
  },
  { 
    id: "system_key", 
    name: "Dungeon Key", 
    description: "Access to 'Hard Mode' main quests with immense rewards.",
    cost: 5000,
    icon: "Key",
    type: "key"
  }
];

export const SCIENTIFIC_QUOTES = [
  { text: "Imagination is more important than knowledge. Knowledge is limited. Imagination encircles the world.", author: "Albert Einstein" },
  { text: "Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.", author: "Marie Curie" },
  { text: "Science is a way of thinking much more than it is a body of knowledge.", author: "Carl Sagan" },
  { text: "Somewhere, something incredible is waiting to be known.", author: "Carl Sagan" },
  { text: "The good thing about science is that it's true whether or not you believe in it.", author: "Neil deGrasse Tyson" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" }
];

export const SUBJECTS = [
  { id: "hg", name: "HG (History/Geog)", icon: "Globe" },
  { id: "french", name: "French", icon: "Languages" },
  { id: "arabic", name: "Arabic", icon: "Languages" },
  { id: "islamic", name: "Islamic Studies", icon: "BookOpen" }
];
