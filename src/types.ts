
export enum Rank {
  E = "E",
  D = "D",
  C = "C",
  B = "B",
  A = "A",
  S = "S",
  SS = "SS",
  SSS = "SSS"
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  expReward: number;
  type: "daily" | "main";
  completed: boolean;
  dueDate: string; // Deprecate or keep as optional/fallback? Let's keep it but it might be null/empty
  category: string;
  duration?: number; // duration in minutes
  status?: "pending" | "active" | "completed" | "failed";
  startedAt?: string; // ISO string
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  exp: number;
  maxExp: number;
  icon: string;
}

export interface UserStats {
  rank: Rank;
  level: number;
  exp: number;
  maxExp: number;
  gold: number; // Added currency
  streak: number;
  lastActive: string;
  totalFocusTime: number; // in minutes
  completedQuests: number;
  displayName?: string;
  photoURL?: string;
  gender?: "male" | "female";
  age?: number;
  penaltyActive?: boolean;
  penaltyReason?: string;
  penaltyDeadline?: string;
}

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  type: "buff" | "consumable" | "key";
}
