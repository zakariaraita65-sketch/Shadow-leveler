
export enum Rank {
  E = "E",
  E_PLUS = "E+",
  D = "D",
  D_PLUS = "D+",
  C = "C",
  C_PLUS = "C+",
  B = "B",
  B_PLUS = "B+",
  B_PLUS_PLUS = "B++",
  A = "A",
  A_PLUS = "A+",
  S = "S",
  S_PLUS = "S+",
  SS = "SS",
  SS_PLUS = "SS+",
  SSS = "SSS"
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  exp: number;
  gold?: number;
  difficulty?: "Easy" | "Medium" | "Hard" | "Legendary" | "Mythic";
  type: "daily" | "main";
  completed: boolean;
  dueDate: string; 
  category: string;
  duration?: number;
  status?: "pending" | "active" | "completed" | "failed";
  startedAt?: string;
  userId?: string;
  createdAt?: string;
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
  penaltyAssignedAt?: string;
  lockdownUntil?: string; // ISO string for the 5-minute lockdown
  activeTitle?: string;
  titles?: string[];
  pardonTickets?: number;
  pardonGifted?: boolean;
  height?: number;
  weight?: number;
  bloodType?: string;
  ultimateGoal?: string;
  hardQuestsCompleted?: number;
  dailyQuestsCompleted?: number;
  totalExpEarned?: number;
  isProfileComplete?: boolean;
}

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  type: "buff" | "consumable" | "key";
}
