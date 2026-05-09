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
  Rank.B_PLUS_PLUS,
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
  [Rank.B_PLUS_PLUS]: "ELITE HUNTER++",
  [Rank.A]: "MASTER HUNTER",
  [Rank.A_PLUS]: "MASTER HUNTER+",
  [Rank.S]: "MONARCH",
  [Rank.S_PLUS]: "MONARCH+",
  [Rank.SS]: "NATIONAL LEVEL",
  [Rank.SS_PLUS]: "NATIONAL LEVEL+",
  [Rank.SSS]: "SHADOW MONARCH"
};

export const EXP_PER_LEVEL = 1000;

export const SYSTEM_PENALTIES = [
  "Solve {n} complex mathematical or logical problems.",
  "Summarize a difficult concept in your field of study for {n} minutes.",
  "Read {n} pages of an academic or technical book.",
  "Explain your current study topic to an imaginary audience for {n} minutes.",
  "Write a {n}-word essay on the importance of discipline.",
  "Complete the failed mission + {n} extra focused sessions.",
  "Review and correct {n} previous mistakes in your work.",
  "Transcribe {n} key definitions or formulas by hand.",
  "Research and summarize {n} new concepts related to your studies.",
  "Practice a skill or language for {n} minutes in one sitting.",
  "Perform {n} push-ups immediately.",
  "Perform {n} bodyweight squats.",
  "Hold a plank for {n} seconds.",
  "Do {n} sit-ups with perfect form.",
  "Drink {n} cl of water without stopping (hydration quest).",
  "Organize {n} files or folders on your computer.",
  "Clean {n} objects in your workspace.",
  "Meditate for {n} minutes without moving.",
  "Write down {n} goals for the next week.",
  "List {n} things you are grateful for.",
  "Spend {n} minutes away from all screens.",
  "Take {n} deep breaths, focusing only on the air entering your lungs.",
  "Sketch {n} objects in your room.",
  "Learn {n} new words in a foreign language.",
  "Research {n} historical figures and their secrets to success.",
  "Walk {n} steps inside your room or outside.",
  "Do {n} jumping jacks.",
  "Stretch your body for {n} minutes.",
  "Write a {n}-word letter to your future self.",
  "Outline {n} chapters of a book you're reading.",
  "Solve {n} riddles or brain teasers.",
  "Identify {n} weaknesses in your current study habit.",
  "Propose {n} solutions to improve your focus.",
  "Listen to {n} minutes of classical or focus music.",
  "Declutter {n} items from your physical space.",
  "Review {n} flashcards of your choice.",
  "Conjugate {n} verbs in a language you are learning.",
  "Memorize {n} lines of a poem or text.",
  "Write {n} lines of code or pseudo-code.",
  "Explain a scientific theory to a child for {n} minutes.",
  "Summarize {n} news articles related to technology.",
  "List {n} books you want to read this year.",
  "Plan your schedule for the next {n} hours in detail.",
  "Do {n} burpees (the ultimate penalty).",
  "Perform {n} mountain climbers.",
  "Hold a wall sit for {n} seconds.",
  "Do {n} lunges (each leg).",
  "Write down {n} affirmations and repeat them aloud.",
  "Track your thoughts for {n} minutes in a journal.",
  "Disconnect from the internet for {n} minutes.",
  "Analyze {n} data points from a recent study.",
  "Compare {n} different methods for solving a problem.",
  "Draw {n} geometric shapes and calculate their areas.",
  "Re-read {n} pages of your notes from last week.",
  "Highlight {n} important sections in a textbook.",
  "Create {n} mind maps for your current project.",
  "Brainstorm {n} ideas for a new hobby.",
  "Research {n} facts about the human brain and learning.",
  "Write {n} sentences using only words with more than 6 letters.",
  "Translate {n} sentences into another language.",
  "Find and correct {n} typos in a random article online.",
  "Explain {n} concepts of ethics in your field.",
  "List {n} advantages of a healthy lifestyle.",
  "Spend {n} minutes practicing mindful eating.",
  "Clean your phone or laptop screen {n} times.",
  "Organize {n} bookmarks in your browser.",
  "Review {n} formulas related to physics or chemistry.",
  "Write {n} lines about why you failed your quest.",
  "Sketch {n} architectural details you see outside.",
  "Learn {n} common phrases in a new dialect.",
  "Research {n} innovative startups in your region.",
  "Summarize {n} TED talks from memory.",
  "Write {n} synonyms for the word 'Success'.",
  "Perform {n} calf raises.",
  "Do {n} arm circles in each direction.",
  "Practice {n} yoga poses.",
  "Hold {n} focus blocks of 5 minutes each.",
  "List {n} mentors you admire and why.",
  "Write {n} potential questions for your next exam.",
  "Solve {n} logic puzzles from a magazine or app.",
  "Identify {n} software tools that could boost your productivity.",
  "Research {n} ways to improve sleep quality.",
  "Write a summary of {n} minutes of a documentary.",
  "Draw {n} diagrams representing complex systems.",
  "List {n} ways to handle stress effectively.",
  "Practice {n} minutes of speed reading.",
  "Write {n} haikus about your journey.",
  "Find {n} quotes from great leaders.",
  "Describe {n} future scenarios where you achieve your goals.",
  "Perform {n} high knees.",
  "Do {n} shadow boxing movements.",
  "Hold a bridge pose for {n} seconds.",
  "Write {n} reasons why you will not fail again.",
  "Organize {n} items in your desk drawer.",
  "Review {n} past projects and list improvements.",
  "Sketch {n} maps of your neighborhood.",
  "Learn {n} keyboard shortcuts for your favorite software.",
  "Write {n} tips for staying productive during holidays.",
  "Research the history of {n} scientific discoveries.",
  "Complete {n} rounds of a bodyweight routine."
];

export const GET_RANDOM_PENALTY = () => {
    const template = SYSTEM_PENALTIES[Math.floor(Math.random() * SYSTEM_PENALTIES.length)];
    const n = Math.floor(Math.random() * 20) + 5;
    return template.replace("{n}", n.toString());
};

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
  hardQuestsCompleted: 0,
  dailyQuestsCompleted: 0,
  totalExpEarned: 0,
  activeTitle: "The Awakening",
  titles: ["The Awakening"],
  pardonTickets: 1,
  isProfileComplete: false
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  "Mythic": "text-white border-white/50 bg-white/10",
  "Legendary": "text-cyan-300 border-cyan-900/50 bg-cyan-950/20",
  "Hard": "text-red-400 border-red-900/50 bg-red-950/20",
  "Medium": "text-orange-400 border-orange-900/50 bg-orange-950/20",
  "Easy": "text-blue-400 border-blue-900/50 bg-blue-950/20"
};

export const AVAILABLE_TITLES = [
  { id: "awakening", name: "The Awakening", condition: "Initial Title", difficulty: "Easy", theme: { color: "#22d3ee", shadow: "0 0 15px rgba(34,211,238,0.2)" } },
  { id: "night_stalker", name: "Night Stalker", condition: "Complete 5 Daily Quests", difficulty: "Medium", goal: 5, metric: "dailyQuestsCompleted", theme: { color: "#f97316", shadow: "0 0 20px rgba(249,115,22,0.3)" } },
  { id: "void_hunter", name: "Void Hunter", condition: "Complete a quest in every category", difficulty: "Medium", goal: 4, metric: "categories", theme: { color: "#f97316", shadow: "0 0 20px rgba(249,115,22,0.3)" } },
  { id: "vampire_lord", name: "Vampire Overlord", condition: "Complete 10 Hard Quests", difficulty: "Hard", goal: 10, metric: "hardQuestsCompleted", theme: { color: "#ef4444", shadow: "0 0 25px rgba(239,68,68,0.4)" } },
  { id: "monarch_death", name: "Monarch of Death", condition: "Maintain a 15-day streak", difficulty: "Hard", goal: 15, metric: "streak", theme: { color: "#ef4444", shadow: "0 0 30px rgba(239,68,68,0.5)" } },
  { id: "abyss_walker", name: "Abyss Walker", condition: "Complete 100 Quests", difficulty: "Hard", goal: 100, metric: "completedQuests", theme: { color: "#ef4444", shadow: "0 0 25px rgba(239,68,68,0.4)" } },
  { id: "blood_sovereign", name: "Blood Sovereign", condition: "Earn 10,000 Total XP", difficulty: "Hard", goal: 10000, metric: "totalExpEarned", theme: { color: "#ef4444", shadow: "0 0 35px rgba(239,68,68,0.5)" } },
  { id: "shadow_king", name: "Shadow King", condition: "Reach Level 15", difficulty: "Legendary", goal: 15, metric: "level", theme: { color: "#a5f3fc", shadow: "0 0 40px rgba(165,243,252,0.6)", glow: true } },
  { id: "architect_fate", name: "Architect of Fate", condition: "Complete 500 Missions", difficulty: "Mythic", goal: 500, metric: "completedQuests", secret: true, theme: { color: "#e879f9", shadow: "0 0 50px rgba(232,121,249,0.7)", glow: true } },
  { id: "absolute_being", name: "Absolute Being", condition: "Reach Level 100", difficulty: "Mythic", goal: 100, metric: "level", secret: true, theme: { color: "#fcd34d", shadow: "0 0 60px rgba(252,211,77,0.8)", glow: true } },
  { id: "shadow_monarch_true", name: "True Shadow Monarch", condition: "Reach SSS Rank", difficulty: "Mythic", goal: 15, metric: "rankIndex", secret: true, theme: { color: "#ffffff", shadow: "0 0 70px rgba(255,255,255,0.9)", glow: true } }
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
  },
  { 
    id: "royal_pardon", 
    name: "Royal Pardon", 
    description: "A decree from the Monarch that instantly clears any active penalty. Single use.",
    cost: 1500,
    icon: "ShieldAlert",
    type: "consumable"
  }
];

export const SCIENTIFIC_QUOTES = [
  { text: "Wake up to reality! Nothing ever goes as planned in this world.", author: "Madara Uchiha" },
  { text: "People live their lives bound by what they accept as correct and true. That is how they define 'reality'.", author: "Itachi Uchiha" },
  { text: "Those who do not understand true pain can never understand true peace.", author: "Pain (Nagato)" },
  { text: "Always protect your pride. To bow down to others is to admit defeat.", author: "Sung Jin-Woo" },
  { text: "If you don't take risks, you can't create a future.", author: "Monkey D. Luffy" },
  { text: "My soldiers, rage! My soldiers, scream! My soldiers, fight!", author: "Erwin Smith" },
  { text: "The world is cruel, but also very beautiful.", author: "Mikasa Ackerman" },
  { text: "Whatever you lose, you'll find it again. But what you throw away you'll never get back.", author: "Kenshin Himura" },
  { text: "Stand proud. You are strong.", author: "Ryomen Sukuna" },
  { text: "Throughout Heaven and Earth, I alone am the honored one.", author: "Satoru Gojo" },
  { text: "Knowing what it feels like to be in pain, is exactly why we try to be kind to others.", author: "Jiraiya" },
  { text: "Imagination is more important than knowledge.", author: "Albert Einstein" },
  { text: "Nothing in life is to be feared, it is only to be understood.", author: "Marie Curie" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" }
];

export const SUBJECTS = [
  { id: "hg", name: "HG (History/Geog)", icon: "Globe" },
  { id: "french", name: "French", icon: "Languages" },
  { id: "arabic", name: "Arabic", icon: "Languages" },
  { id: "islamic", name: "Islamic Studies", icon: "BookOpen" }
];
