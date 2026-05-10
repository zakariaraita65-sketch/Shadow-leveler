import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  Swords, 
  Sparkles, 
  Clock, 
  BarChart3,
  Bell,
  BellRing,
  Zap,
  ShoppingBag,
  User as UserIcon
} from 'lucide-react';

import { 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc,
  deleteDoc,
  getDoc,
  query,
  where
} from 'firebase/firestore';
import { auth, db, OperationType, handleFirestoreError } from './firebase';
import { speak } from './lib/voice';

import UserHUD from './components/UserHUD';
import QuestSection from './components/QuestSection';
import FocusTimer from './components/FocusTimer';
import SkillTree from './components/SkillTree';
import StoreSection from './components/StoreSection';
import RankSection from './components/RankSection';
import ProfileView from './components/ProfileView';
import QuotesSection from './components/QuotesSection';
import SystemMessage from './components/SystemMessage';
import AddQuestModal from './components/AddQuestModal';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import AIPenaltyVerifier from './components/AIPenaltyVerifier';
import { UserStats, Quest, Rank } from './types';
import { 
  INITIAL_STATS, 
  RANK_ORDER, 
  RANK_TITLES,
  EXP_PER_LEVEL, 
  AVAILABLE_TITLES, 
  GET_RANDOM_PENALTY, 
  getRankIndexForLevel, 
  getCurrencyForTitle,
  HUNTER_NOTIFICATIONS,
  SUBJECTS,
  EXAM_DATE
} from './constants';
import PortalInterface from './components/PortalInterface';
import TitleSelector from './components/TitleSelector';
import SystemLogo from './components/SystemLogo';

export default function App() {
  // --- STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [skills, setSkills] = useState<any>({});
  
  const [notifications, setNotifications] = useState<{ id: number; text: string; type?: any; onClick?: () => void }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'quests' | 'skills' | 'timer' | 'store' | 'ranks' | 'profile'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [activePortalQuest, setActivePortalQuest] = useState<Quest | null>(null);
  const [activePortalType, setActivePortalType] = useState<'cave' | 'forest' | 'sea' | 'lava'>('cave');
  const hasCheckedPenalty = useRef(false);
  const lastTimeCheck = useRef<number>(0);

  // --- TIME MONITORING & EMERGENCY MISSIONS ---
  useEffect(() => {
    if (!user || loading) return;

    const interval = setInterval(() => {
      const now = new Date();
      const hour = now.getHours();
      const minutes = now.getMinutes();
      const currentTime = hour * 60 + minutes;

      // Avoid double triggering within the same minute
      if (currentTime === lastTimeCheck.current) return;
      lastTimeCheck.current = currentTime;

      // 1. Sleep Notification (10 PM - 5 AM)
      if (hour >= 22 || hour < 5) {
        if (minutes === 0 || minutes === 30) {
          const msg = HUNTER_NOTIFICATIONS.sleep[Math.floor(Math.random() * HUNTER_NOTIFICATIONS.sleep.length)];
          notify(msg, 'danger');
          speak(msg);
        }
      }

      // 2. Rest Notification (Every hour at 45 mins)
      if (minutes === 45) {
        const msg = HUNTER_NOTIFICATIONS.rest[Math.floor(Math.random() * HUNTER_NOTIFICATIONS.rest.length)];
        notify(msg, 'info');
        speak(msg);
      }

      // 3. Emergency Mission Spawning
      // Trigger every 4 hours (240 minutes)
      if (currentTime > 0 && currentTime % 240 === 0) {                
        spawnEmergencyQuest();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user, loading]);

  const spawnEmergencyQuest = async () => {
    if (!user) return;
    const prioritizeSubjects = ['history_geo', 'arabic'];
    const filteredSubjects = SUBJECTS.filter(s => prioritizeSubjects.includes(s.id));
    
    // 70% chance to pick a priority subject during the 20-day countdown
    const targetSubject = (Math.random() < 0.7) 
      ? filteredSubjects[Math.floor(Math.random() * filteredSubjects.length)]
      : SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];

    const lessons = (targetSubject as any).priorityLessons || (targetSubject as any).lessons || [targetSubject.name];
    const randomLesson = lessons[Math.floor(Math.random() * lessons.length)];

    const msgTemplate = HUNTER_NOTIFICATIONS.emergency[Math.floor(Math.random() * HUNTER_NOTIFICATIONS.emergency.length)];
    const msg = msgTemplate.replace("[SUBJECT]", targetSubject.name);
    
    const portals: ('cave' | 'forest' | 'sea' | 'lava')[] = ['cave', 'forest', 'sea', 'lava'];
    const randomPortal = portals[Math.floor(Math.random() * portals.length)];

    const emergencyQuest: Quest = {
      id: `emergency-${Date.now()}`,
      title: `ULTIMATE MISSION: ${randomLesson}`,
      description: `ULTIMATE REVISION PHASE: Focus on "${randomLesson}" from ${targetSubject.name}. Time is running out, Hunter!`,
      type: 'main',
      difficulty: 'Legendary',
      category: targetSubject.id,
      expReward: 900, 
      gold: 400,
      completed: false,
      status: 'active',
      dueDate: new Date(Date.now() + 20 * 60 * 1000).toISOString(), // 20 minutes limit!
      userId: user.uid,
      createdAt: new Date().toISOString()
    };

    try {
      const { id: localId, ...questData } = emergencyQuest;
      const docRef = await addDoc(collection(db, 'users', user.uid, 'quests'), questData);
      
      // Update the active quest with the REAL firestore ID
      const finalQuest = { ...emergencyQuest, id: docRef.id };
      
      notify(msg, 'warning', () => {
          speak("Initializing dimensional transition. Brace yourself, Hunter.");
          setActivePortalQuest(finalQuest);
          setActivePortalType(randomPortal);
      });
      
      setIsEmergencyActive(true);
      setTimeout(() => setIsEmergencyActive(false), 5000);

    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/quests`);
    }
  };

  // --- AUTH LISTENERS ---
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setLoading(false);
        setShowOnboarding(false);
        return;
      }

      // Check if User Profile exists
      try {
        const userRef = doc(db, 'users', u.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          setShowOnboarding(true);
          setLoading(false);
        } else {
          setShowOnboarding(false);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setLoading(false);
        // Fallback or handle error
      }
    });
    return unsub;
  }, []);

  const handleOnboardingComplete = async (data: { 
    displayName: string; 
    gender: "male" | "female"; 
    age: number;
    height?: number;
    weight?: number;
    bloodType?: string;
    ultimateGoal?: string;
  }) => {
    if (!user) return;
    
    setLoading(true);
    const userRef = doc(db, 'users', user.uid);
    const initialUserData = {
      ...INITIAL_STATS,
      displayName: data.displayName,
      gender: data.gender,
      age: data.age,
      height: data.height || 0,
      weight: data.weight || 0,
      bloodType: data.bloodType || "",
      ultimateGoal: data.ultimateGoal || "",
      photoURL: user.photoURL || "",
      lastActive: new Date().toISOString(), // Ensure fresh start
      isProfileComplete: !!data.displayName && (data.age || 0) > 0 && (data.height || 0) > 0 && (data.weight || 0) > 0 && !!data.gender
    };

    try {
      await setDoc(userRef, initialUserData);
      setShowOnboarding(false);
      notify("PROFILE INITIALIZED: WELCOME TO THE MATRIX", "success");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  // --- DATA SYNC ---
  useEffect(() => {
    if (!user) return;

    // Listen for stats
    const statsUnsub = onSnapshot(doc(db, 'users', user.uid), async (snap) => {
      if (snap.exists()) {
        const data = snap.data() as UserStats;
        
        // --- EXP CONSISTENCY CHECK (SAFETY) ---
        // If maxExp is inconsistent with level (e.g. 120 for Level 2), recalibrate
        const correctMaxExp = Math.floor(EXP_PER_LEVEL * Math.pow(1.05, (data.level || 1) - 1));
        if (data.maxExp !== correctMaxExp && data.maxExp < 500) {
           console.log("[SYSTEM] Recalibrating maxExp for user:", user.uid);
           await updateDoc(doc(db, 'users', user.uid), { maxExp: correctMaxExp });
        }

        setStats(data);
        
        // --- CREATOR TITLE & LEVEL BOOSTER ---
        const specialIds = ['VJ06BQWB', 'MJKUSZCN', 'GYKPZWT5', '#VJ06BQWB', '#MJKUSZCN', '#GYKPZWT5'];
        const currentHunterId = data.hunterId || '';
        const isSpecialHunter = specialIds.includes(currentHunterId);
        
        if (user.email === 'zakariaraita65@gmail.com' || user.uid.startsWith('5BN892FX') || isSpecialHunter) {
           const currentTitles = Array.isArray(data.titles) ? data.titles : [];
           const needsArchitect = (user.email === 'zakariaraita65@gmail.com' || user.uid.startsWith('5BN892FX')) && !currentTitles.includes("Grand Architect");
           const needsController = isSpecialHunter && !currentTitles.includes("Al-Musaytir");
           const needsAwakened = !currentTitles.includes("The Awakened (المستيقظ)");
           const needsLevelBoost = data.level < 5;

           if (needsArchitect || needsController || needsAwakened || needsLevelBoost) {
              const updatedTitles = [...currentTitles];
              if (needsArchitect && !updatedTitles.includes("Grand Architect")) updatedTitles.push("Grand Architect");
              if (needsController && !updatedTitles.includes("Al-Musaytir")) updatedTitles.push("Al-Musaytir");
              if (needsAwakened && !updatedTitles.includes("The Awakened (المستيقظ)")) updatedTitles.push("The Awakened (المستيقظ)");
              
              const updates: any = {
                 titles: updatedTitles
              };

              if (needsController) {
                updates.activeTitle = "Al-Musaytir";
              }

              if (needsLevelBoost) {
                 updates.totalExpEarned = Math.max(data.totalExpEarned || 0, 5000);
                 updates.level = 5; 
                 updates.exp = 0;
                 updates.maxExp = Math.floor(EXP_PER_LEVEL * Math.pow(1.05, 4));
                 updates.rank = getRankIndexForLevel(5);
                 notify("MATRIX OVERRIDE: LEVEL 5 ATTAINED. WELCOME, AL-MUSAYTIR.", "success");
                 speak("Access granted. Protocol Al-Musaytir initiated.");
              }

              await updateDoc(doc(db, 'users', user.uid), updates);
              
              if (needsArchitect) {
                notify("GRAND ARCHITECT DETECTED. SYSTEM PERMISSIONS UPDATED.", "success");
                speak("Welcome back, Grand Architect. Your creation is at your command.");
              }
           }
        }
        
        // --- TITLE MIGRATION & SAFETY ---
        // Ensure everyone has "The Awakened (المستيقظ)"
        if (!data.titles || !data.titles.includes("The Awakened (المستيقظ)")) {
             const uTitles = Array.isArray(data.titles) ? [...data.titles] : [];
             if (!uTitles.includes("The Awakened (المستيقظ)")) uTitles.push("The Awakened (المستيقظ)");
             
             // If they had the old name, remove it
             const cleanedTitles = uTitles.filter(t => t !== "The Awakening");
             
             const migrationUpdates: any = { titles: cleanedTitles };
             if (data.activeTitle === "The Awakening" || !data.activeTitle) {
               migrationUpdates.activeTitle = "The Awakened (المستيقظ)";
             }
             
             await updateDoc(doc(db, 'users', user.uid), migrationUpdates);
        }

        // Award one-time pardon ticket if missing (for existing users)
        if (data.pardonTickets === undefined || (data.pardonTickets === 0 && !(data as any).pardonGifted)) {
           await updateDoc(doc(db, 'users', user.uid), { 
             pardonTickets: (data.pardonTickets || 0) + 1,
             pardonGifted: true 
           });
           notify("MONARCH'S GIFT: 1 Royal Pardon Ticket granted.", "success");
        }
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, `users/${user.uid}`));

    // Listen for quests
    const questsUnsub = onSnapshot(query(collection(db, 'users', user.uid, 'quests'), where('userId', '==', user.uid)), (snap) => {
      const q = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Quest[];
      console.log(`[DATA] Loaded ${q.length} quests for user ${user.uid}`);
      // Sort by dueDate descending, handle missing/invalid dates
      setQuests(q.sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return dateB - dateA;
      }));
    }, (err) => {
      console.error("[ERROR] Quest Snapshot Error:", err);
      handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/quests`);
    });

    // Listen for skills
    const skillsUnsub = onSnapshot(collection(db, 'users', user.uid, 'skills'), (snap) => {
      const sk: any = {};
      snap.forEach(doc => { sk[doc.id] = doc.data(); });
      setSkills(sk);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/skills`));

    return () => {
      statsUnsub();
      questsUnsub();
      skillsUnsub();
    };
  }, [user]);

  // --- PENALTY CHECK ---
  useEffect(() => {
    if (!user || loading || stats.penaltyActive || showOnboarding || hasCheckedPenalty.current) return;

    const checkPenalty = async () => {
      // Ensure we have loaded real stats from DB (not just initial state)
      // Check for a specific field that only exists in the DB or is updated after onboarding
      if (!stats.lastActive || showOnboarding) return;

      const now = new Date();
      const last = new Date(stats.lastActive);
      
      // If the profile was created less than 10 minutes ago, skip any penalty checks
      // This prevents issues where stale module-level INITIAL_STATS dates trigger penalties
      const accountAgeMs = now.getTime() - last.getTime();
      if (accountAgeMs < 10 * 60 * 1000) return;

      // Mark as truly checked for this session
      hasCheckedPenalty.current = true;

      const diffMs = now.getTime() - last.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      const userRef = doc(db, 'users', user.uid);

      // NO INACTIVITY PENALTIES FOR NOVICES (Below Level 2)
      if (stats.level < 2) {
        // Still update lastActive so we don't keep checking
        if (diffHours > 1) {
            await updateDoc(userRef, { lastActive: now.toISOString() });
        }
        return;
      }

      // Only run checks if some time has passed since last activity (e.g., at least 1 hour)
      if (diffHours < 1) return;

      if (diffHours > 48) {
        await updateDoc(userRef, {
          streak: 0,
          exp: Math.max(0, stats.exp - 100),
          lastActive: now.toISOString(),
          penaltyActive: true,
          penaltyReason: "LONG INACTIVITY DETECTED: " + GET_RANDOM_PENALTY(),
          penaltyDeadline: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          lockdownUntil: new Date(now.getTime() + 5 * 60 * 1000).toISOString()
        });
        notify("SYSTEM ERROR: LOCKDOWN INITIATED", "danger");
      } else if (diffHours > 24) {
        // If daily quests were not finished, trigger penalty
        const unfinishedDailies = quests.filter(q => q.type === 'daily' && !q.completed);
        if (unfinishedDailies.length > 0) {
          // Mark unfinished dailies as failed so they don't trigger again
          for (const q of unfinishedDailies) {
             await updateDoc(doc(db, 'users', user.uid, 'quests', q.id), {
               status: 'failed',
               completed: false
             });
          }

          await updateDoc(userRef, {
            penaltyActive: true,
            penaltyReason: "INCOMPLETE DAILY MISSIONS: " + GET_RANDOM_PENALTY(),
            penaltyDeadline: new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString(),
            lockdownUntil: new Date(now.getTime() + 5 * 60 * 1000).toISOString(),
            lastActive: now.toISOString()
          });
          notify("PENALTY MISSION ACTIVATED: MISSION FAILURE", "danger");
        } else {
          await updateDoc(userRef, { 
            streak: stats.streak + 1,
            lastActive: now.toISOString() 
          });
          notify("DAILY SESSION INITIALIZED", "info");
        }
      }
    };

    checkPenalty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, quests.length, stats.penaltyActive, stats.lastActive]); 

  // --- HELPERS ---
  const notify = useCallback((text: string, type: any = 'info', onClick?: () => void) => {
    // Use a more unique ID to prevent React "duplicate key" errors
    const uniqueId = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id: uniqueId, text, type, onClick }]);

    // Native Browser Notifications
    if (Notification.permission === "granted") {
        console.log("Browser notifications are enabled, but bypassing 'new Notification' constructor to avoid Illegal constructor error.");
    }
  }, []);

  const requestNotificationPermissions = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          notify("SENSES INITIALIZED: SYSTEM ALERTS ARE NOW LINKED TO REALITY.", "success");
          speak("SYSTEM ALERTS ARE NOW LINKED TO REALITY. YOU WILL BE NOTIFIED OF ALL THREATS.");
        }
      });
    }
  };

  const addExp = useCallback(async (amount: number = 0, category?: string, additionalUpdates: any = {}) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    
    // Ensure amount is a number and not NaN
    const rewardAmount = isNaN(amount) ? 0 : amount;
    
    let newExp = stats.exp + rewardAmount;
    let newLevel = stats.level;
    let newRank = stats.rank;
    let newMaxExp = stats.maxExp;

    while (newExp >= newMaxExp) {
      newExp -= newMaxExp;
      newLevel += 1;
      newMaxExp = Math.floor(EXP_PER_LEVEL * Math.pow(1.05, newLevel - 1));
      const msg = `LEVEL UP! REACHED LEVEL ${newLevel}`;
      notify(msg, 'success');
      speak(msg);
      
      const rankIdx = getRankIndexForLevel(newLevel);
      if (rankIdx < RANK_ORDER.length && RANK_ORDER[rankIdx] !== newRank) {
        newRank = RANK_ORDER[rankIdx];
        const rankMsg = `RANK UP! NEW RANK: ${newRank}-RANK`;
        notify(rankMsg, 'success');
        speak(rankMsg);
      }
    }

    const goldEarned = Math.floor(rewardAmount * 0.8);
    const totalExpNow = (stats.totalExpEarned || 0) + rewardAmount;
    
    if (goldEarned > 0) {
      const currency = getCurrencyForTitle(stats.activeTitle || "");
      notify(`REWARD: +${goldEarned} ${currency.name}`, 'success');
    }
    
    // Merge updates
    const finalUpdate = { 
      exp: newExp, 
      level: newLevel, 
      rank: newRank, 
      maxExp: newMaxExp,
      gold: stats.gold + goldEarned,
      totalExpEarned: totalExpNow,
      lastActive: new Date().toISOString(),
      ...additionalUpdates
    };

    try {
      await updateDoc(userRef, finalUpdate);
    } catch (err) { handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`); }

    // Title Awards Check - Use the most current counts
    const completedNow = finalUpdate.completedQuests ?? stats.completedQuests;
    checkAndAwardTitles(newLevel, completedNow, totalExpNow, newRank);

    if (category) {
      const skillRef = doc(db, 'users', user.uid, 'skills', category);
      const skillSnap = await getDoc(skillRef);
      const skill = skillSnap.exists() ? skillSnap.data() : { level: 1, exp: 0, maxExp: 100 };
      
      let sExp = (skill.exp || 0) + (amount / 2);
      let sLevel = skill.level || 1;
      let sMax = skill.maxExp || 100;

      while (sExp >= sMax) {
        sExp -= sMax;
        sLevel += 1;
        sMax = Math.floor(100 * Math.pow(1.2, sLevel - 1));
        notify(`${category.toUpperCase()} SKILL LEVEL UP!`, 'success');
      }

      await setDoc(skillRef, { level: sLevel, exp: sExp, maxExp: sMax });
    }
  }, [user, stats, notify]);

  // --- ACTIONS ---
  const toggleQuest = async (id: string) => {
    if (!user) return;
    const questIdx = quests.findIndex(q => q.id === id);
    if (questIdx === -1) return;
    const quest = quests[questIdx];

    try {
      const qRef = doc(db, 'users', user.uid, 'quests', id);
      if (!quest.completed) {
        notify('MISSION COMPLETED', 'info');
        speak('MISSION COMPLETED. EXPERENCE GAINED.');
        
        const reward = quest.expReward || quest.exp || 900;

        const updates = {
          completedQuests: stats.completedQuests + 1,
          dailyQuestsCompleted: quest.type === 'daily' ? (stats.dailyQuestsCompleted || 0) + 1 : (stats.dailyQuestsCompleted || 0),
          hardQuestsCompleted: reward >= 300 ? (stats.hardQuestsCompleted || 0) + 1 : (stats.hardQuestsCompleted || 0),
        };

        // Unified update for exp, rank, gold AND quest stats
        await addExp(reward, quest.category, updates);
        
        // DELETE so it disappears as requested
        await deleteDoc(qRef);
      } else {
        // If users somehow toggles back (unlikely now), just update
        await updateDoc(qRef, { completed: !quest.completed, status: 'pending' });
      }
    } catch (err) { handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/quests/${id}`); }
  };

  const deleteQuest = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'quests', id));
    } catch (err) { handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/quests/${id}`); }
  };

  const startQuest = async (id: string) => {
    if (!user) return;
    const questRef = doc(db, 'users', user.uid, 'quests', id);
    try {
      await updateDoc(questRef, {
        status: 'active',
        startedAt: new Date().toISOString()
      });
      await updateDoc(doc(db, 'users', user.uid), { lastActive: new Date().toISOString() });
      notify('MISSION ACTIVATED', 'info');
      speak('MISSION START. TIME IS RUNNING.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/quests/${id}`);
    }
  };

  const failQuest = async (id: string, questTitle: string, questExpReward: number = 100) => {
    if (!user) return;
    const questRef = doc(db, 'users', user.uid, 'quests', id);
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(questRef, {
        status: 'failed',
        completed: false
      });
      
      const newExp = stats.exp - 200;

      // Use the pre-defined 100 penalties for variety
      let generatedPenalty = GET_RANDOM_PENALTY();
      try {
          const { GoogleGenAI } = await import('@google/genai');
          const apiKey = process.env.GEMINI_API_KEY;
          if (!apiKey) {
            console.error("GEMINI_API_KEY is missing. AI functionality disabled.");
            return;
          }
          const ai = new GoogleGenAI({ apiKey });
          const diffStr = questExpReward > 100 ? "hard" : "easy";
          const result = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: `The user failed a mission called "${questTitle}" with difficulty "${diffStr}". 
              Generate a constructive penalty task similar to "${generatedPenalty}". 
              Maintain the spirit of academic or physical challenge.
              Respond ONLY with the penalty task description. Keep it under 2 sentences.`
          });
          if (result && result.text) {
              generatedPenalty = result.text.trim();
          }
      } catch (err) {
          console.error("AI Penalty Gen Error", err);
      }

      await updateDoc(userRef, {
        penaltyActive: true,
        exp: Math.max(-9999, newExp),
        penaltyReason: generatedPenalty,
        penaltyAssignedAt: new Date().toISOString(),
        penaltyDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        lockdownUntil: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      });
      notify("MISSION FAILED. SYSTEM REBOOTING.", "danger");
      speak("MISSION FAILED. PENALTY PROTOCOL INITIATED. TWO HUNDRED EXP DEDUCTED.");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/quests/${id}`);
    }
  };

  const addQuest = async (qData: any) => {
    if (!user) return;
    console.log("[ACTION] Adding quest:", qData);
    const newQuest = {
      ...qData,
      userId: user.uid,
      completed: false,
    };
    if (!newQuest.dueDate) {
        newQuest.dueDate = new Date().toISOString();
    }
    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'quests'), newQuest);
      console.log("[SUCCESS] Quest added with ID:", docRef.id);
      notify('QUEST ACCEPTED', 'info');
      speak('QUEST ACCEPTED. GOOD LUCK HUNTER.');
    } catch (err: any) { 
      notify('QUEST REGISTRATION FAILED: ' + (err.message || "Unknown error"), 'danger');
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/quests`); 
    }
  };

  const handleFocusComplete = (minutes: number) => {
    const updates = { 
      totalFocusTime: stats.totalFocusTime + minutes,
    };
    addExp(minutes * 10, undefined, updates);
    
    const msg = 'FOCUS TRAINING COMPLETE: MANA REPLENISHED';
    notify(msg, 'success');
    speak(msg);
  };

  const handleBuyItem = async (item: any) => {
    if (!user) return;
    if (stats.gold >= item.cost) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { gold: stats.gold - item.cost });
        const msg = `PURCHASE SUCCESSFUL: ${item.name.toUpperCase()}`;
        notify(msg, 'success');
        speak(msg);
        
        if (item.id === 'recovery_potion') {
          await updateDoc(doc(db, 'users', user.uid), { streak: stats.streak + 1 });
          notify('STREAK RESTORED VIA RECOVERY POTION', 'info');
          speak('POTION CONSUMED. STREAK RESTORED.');
        }

        if (item.id === 'royal_pardon') {
          await updateDoc(doc(db, 'users', user.uid), { pardonTickets: (stats.pardonTickets || 0) + 1 });
          notify('ROYAL PARDON GRANTED: TICKET ADDED TO INVENTORY', 'success');
          speak('ROYAL PARDON ACQUIRED. YOU MAY NOW BYPASS ONE PENALTY PROTOCOL.');
        }
      } catch (err) { handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`); }
    } else {
      notify('INSUFFICIENT GOLD', 'danger');
      speak('INSUFFICIENT FUNDS.');
    }
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearPenalty = async () => {
    if (!user) return;
    try {
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'users', user.uid), {
        penaltyActive: false,
        penaltyReason: "",
        penaltyDeadline: "",
        lastActive: now
      });
      notify("PENALTY SURVIVED: MATRIX RESTORED", "success");
      speak("PENALTY QUEST COMPLETED. SYSTEM RESTORED TO NORMAL.");
    } catch (err) { handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`); }
  };

  const handlePenaltyFailure = async () => {
    if (!user) return;
    try {
       // Lose a level or heavy EXP
       let newLevel = Math.max(1, stats.level - 1);
       await updateDoc(doc(db, 'users', user.uid), {
         level: newLevel,
         exp: 0,
         penaltyActive: false,
         penaltyReason: ""
       });
       notify("CRITICAL FAILURE: LEVEL DEGRADED", "danger");
       speak("SYSTEM FAILURE. LEVEL DEGRADATION CONFIRMED.");
    } catch (err) { handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`); }
  };

  const handleUpdateUserStats = async (newStats: Partial<UserStats>) => {
    if (!user) return;
    try {
      const updatedData = {
        ...newStats,
        lastActive: new Date().toISOString()
      };
      await updateDoc(doc(db, 'users', user.uid), updatedData);
      notify("USER DNA UPDATED", "success");
      speak("SYSTEM DATA SYNCHRONIZED. YOUR DNA HAS BEEN RECODED.");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      throw err; // Re-throw to allow caller to handle failure
    }
  };

  const handleLogout = () => signOut(auth);
  
  // --- LOCKDOWN TIMER ---
  const [lockdownTimeLeft, setLockdownTimeLeft] = useState<number>(0);
  useEffect(() => {
    if (!stats.lockdownUntil) {
      setLockdownTimeLeft(0);
      return;
    }

    const interval = setInterval(() => {
      const lockdownDate = new Date(stats.lockdownUntil!);
      const remaining = !isNaN(lockdownDate.getTime()) ? lockdownDate.getTime() - Date.now() : 0;
      if (remaining <= 0) {
        setLockdownTimeLeft(0);
        clearInterval(interval);
        // We don't automatically clear stats.lockdownUntil here to stay in sync with Firestore
      } else {
        setLockdownTimeLeft(Math.ceil(remaining / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [stats.lockdownUntil]);

  // --- THEME SYNC ---
  useEffect(() => {
    if (!stats.activeTitle) return;
    
    const activeTitleObj = AVAILABLE_TITLES.find(t => t.name === stats.activeTitle);
    if (!activeTitleObj?.theme) return;

    // Convert hex to RGB for the CSS variable
    const hex = activeTitleObj.theme.color;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    document.documentElement.style.setProperty('--system-neon-rgb', `${r}, ${g}, ${b}`);
    
    // Also update any other specific theme properties if needed
  }, [stats.activeTitle]);

  const [isPardoning, setIsPardoning] = useState(false);
  const [isSacrificing, setIsSacrificing] = useState(false);

  const handleSacrificeExp = async () => {
    if (!user || isSacrificing) return;
    
    try {
        setIsSacrificing(true);
        const now = new Date().toISOString();
        
        // Calculate new EXP and Level
        let newExp = stats.exp - 200;
        let newLevel = stats.level;
        
        if (newExp < 0) {
            if (newLevel > 1) {
                newLevel -= 1;
                newExp = 0;
            } else {
                newExp = 0;
            }
        }

        const newMaxExp = Math.floor(EXP_PER_LEVEL * Math.pow(1.05, newLevel - 1));

        await updateDoc(doc(db, 'users', user.uid), {
            penaltyActive: false,
            penaltyReason: null,
            penaltyDeadline: null,
            penaltyAssignedAt: null,
            exp: newExp,
            level: newLevel,
            maxExp: newMaxExp,
            lastActive: now
        });

        notify("DATA SACRIFICED: 200 EXP LOST. PENALTY CLEARED.", "warning");
        speak("DATA PARTITION PURGED. SYSTEM RESTORED AT A COST.");
    } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
        setIsSacrificing(false);
    }
  };

  const handlePardon = async () => {
    if (!user || isPardoning) return;
    if ((stats.pardonTickets || 0) <= 0) {
        notify("ERROR: YOU DO NOT HAVE A ROYAL PARDON TICKET", "danger");
        speak("ACCESS DENIED. NO PARDON TICKET DETECTED.");
        return;
    }

    try {
        setIsPardoning(true);
        const now = new Date().toISOString();
        await updateDoc(doc(db, 'users', user.uid), {
            penaltyActive: false,
            penaltyReason: null,
            penaltyDeadline: null,
            penaltyAssignedAt: null,
            pardonTickets: stats.pardonTickets - 1,
            lastActive: now
        });
        notify("ROYAL PARDON GRANTED: Penalty cleared.", "success");
        speak("THE MONARCH HAS BEEN PARDONED. CONTINUE YOUR MISSION.");
    } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
        setIsPardoning(false);
    }
  };

  const checkAndAwardTitles = async (level: number, completedCount: number, totalExp: number, currentRank: Rank) => {
    if (!user) return;
    const earnedTitles = [...(stats.titles || [])];
    let newlyEarned = false;

    const dailyCount = stats.dailyQuestsCompleted || 0;
    const hardCount = stats.hardQuestsCompleted || 0;
    const streak = stats.streak || 0;

    AVAILABLE_TITLES.forEach(title => {
       if (earnedTitles.includes(title.name)) return;

       if (title.id === 'night_stalker' && dailyCount >= 5) {
           earnedTitles.push(title.name);
           newlyEarned = true;
       }
       if (title.id === 'vampire_lord' && hardCount >= 10) {
           earnedTitles.push(title.name);
           newlyEarned = true;
       }
       if (title.id === 'monarch_death' && streak >= 15) {
           earnedTitles.push(title.name);
           newlyEarned = true;
       }
       if (title.id === 'abyss_walker' && completedCount >= 100) {
           earnedTitles.push(title.name);
           newlyEarned = true;
       }
       if (title.id === 'blood_sovereign' && totalExp >= 10000) {
           earnedTitles.push(title.name);
           newlyEarned = true;
       }
       if (title.id === 'shadow_king' && level >= 15) {
           earnedTitles.push(title.name);
           newlyEarned = true;
       }
       if (title.id === 'architect_fate' && completedCount >= 500) {
           earnedTitles.push(title.name);
           newlyEarned = true;
       }
       if (title.id === 'absolute_being' && level >= 100) {
           earnedTitles.push(title.name);
           newlyEarned = true;
       }
       if (title.id === 'shadow_monarch_true' && RANK_ORDER.indexOf(currentRank) >= 15) {
           earnedTitles.push(title.name);
           newlyEarned = true;
       }
       
       if (title.id === 'void_hunter') {
          // Check if user has skills in all categories (proxy for having completed quests in all categories)
          const categories = ['hg', 'french', 'arabic', 'islamic'];
          const hasAll = categories.every(cat => skills[cat] && skills[cat].level >= 1);
          if (hasAll) {
             earnedTitles.push(title.name);
             newlyEarned = true;
          }
       }
    });

    if (newlyEarned) {
        await updateDoc(doc(db, 'users', user.uid), { titles: earnedTitles });
        notify(`NEW TITLE UNLOCKED: ${earnedTitles[earnedTitles.length - 1]}`, 'success');
        speak(`NEW TITLE ACHIEVED! YOU ARE NOW RECOGNIZED AS ${earnedTitles[earnedTitles.length - 1]}`);
    }
  };

  const handleSetTitle = async (titleName: string) => {
    if (!user) return;
    try {
        await updateDoc(doc(db, 'users', user.uid), { activeTitle: titleName });
        notify(`TITLE EQUIPPED: ${titleName}`, 'info');
        setIsTitleModalOpen(false);
    } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handlePortalComplete = async () => {
    if (!activePortalQuest || !user) return;
    
    // Add rewards - STRICT 900 XP
    const reward = 900;
    
    try {
      // 1. Update stats and add EXP
      await addExp(reward, activePortalQuest.category, {
        completedQuests: stats.completedQuests + 1,
        hardQuestsCompleted: (stats.hardQuestsCompleted || 0) + 1
      });
      
      // 2. Delete from Firestore so it disappears permanently
      const questId = activePortalQuest.id;
      await deleteDoc(doc(db, 'users', user.uid, 'quests', questId));
      
      // 3. Cleanup local state
      setActivePortalQuest(null);
      setIsEmergencyActive(false);
      setQuests(prev => prev.filter(q => q.id !== questId));
      
      notify("MISSION ACCOMPLISHED: PORTAL SEALED.", "success");
      speak("Mission accomplished. Dimensional portal has been neutralized. Rewards distributed and energy stabilized.");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/quests/${activePortalQuest.id}`);
    }
  };

  // --- RENDER ---
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[1000] p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-8 text-center max-w-sm"
        >
          <div className="relative flex items-center justify-center w-20 h-20">
             <div className="absolute inset-0 border-4 border-system-neon/20 border-t-system-neon rounded-full animate-spin" />
             <SystemLogo size={40} color="#00f2ff" />
          </div>
          <div className="flex flex-col gap-3">
             <h2 className="text-2xl font-display font-black italic tracking-widest text-white uppercase">Syncing with Matrix</h2>
             <div className="flex gap-1 justify-center">
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-2 h-2 rounded-full bg-system-neon" />
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-2 h-2 rounded-full bg-system-neon" />
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-2 h-2 rounded-full bg-system-neon" />
             </div>
             <p className="text-[10px] font-mono text-system-neon/60 uppercase tracking-[0.4em] mt-2">Neural Link Status: Establishing Secure Tunnel</p>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="flex flex-col gap-4 mt-4"
          >
            <p className="text-xs text-white/40 leading-relaxed">System latency detected. This could be due to multidimensional interference or authentication delays.</p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-mono uppercase tracking-widest text-white hover:bg-white/10 transition-all font-bold"
              >
                FORCED RE-INITIALIZATION
              </button>
              {user && (
                <button 
                  onClick={() => setLoading(false)}
                  className="px-8 py-3 border border-system-neon/30 text-system-neon/60 rounded-xl text-[10px] font-mono uppercase tracking-widest hover:bg-system-neon/10 transition-all"
                >
                  BYPASS LOADING (DANGEROUS)
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginProgress={(p) => setLoading(p)} />;
  }

  if (showOnboarding) {
    return <Onboarding user={user} onComplete={handleOnboardingComplete} />;
  }

  const activeTitle = stats.activeTitle || (RANK_TITLES[RANK_ORDER[getRankIndexForLevel(stats.level)]] || "ROOKIE");
  const activeTitleData = AVAILABLE_TITLES.find(t => t.name === activeTitle) || AVAILABLE_TITLES[0];
  const themeColor = (activeTitleData as any).theme?.color || '#00ff9d';
  const hasGlow = !!(activeTitleData as any).theme?.glow;

  return (
    <div className="min-h-screen bg-system-bg text-slate-100 font-sans selection:bg-system-neon/30 overflow-x-hidden">
      {/* EMERGENCY SYSTEM OVERLAY */}
      <AnimatePresence>
        {isEmergencyActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0, 0.4, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, repeat: 2 }}
            className="fixed inset-0 z-[9999] pointer-events-none border-[20px] border-red-600/50 shadow-[inset_0_0_100px_rgba(220,38,38,0.5)] bg-red-900/10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activePortalQuest && (
          <PortalInterface 
            quest={activePortalQuest} 
            portalType={activePortalType} 
            onClose={() => setActivePortalQuest(null)} 
            onComplete={handlePortalComplete}
          />
        )}
      </AnimatePresence>

      {/* HUD HEADER */}
      <header className="sticky top-0 z-40 w-full h-16 border-b border-white/5 bg-system-bg/80 backdrop-blur-md flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-white/5 rounded-md"
          >
            <Menu size={24} />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-[0.2em] font-bold leading-none" style={{ color: themeColor }}>SHADOW LEVELER</span>
            <span className="text-lg font-display font-black italic tracking-tighter text-white">SYSTEM v2.5.0</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-mono text-white/40">CURRENT STREAK</span>
              <span className="text-sm font-display font-bold text-system-neon neon-text">{stats.streak} DAYS</span>
           </div>
           <div className="w-10 h-10 rounded-full system-border overflow-hidden bg-system-neon/20 flex items-center justify-center group cursor-pointer relative" onClick={handleLogout}>
              <div className="group-hover:hidden">
                <SystemLogo color={themeColor} size={24} glow={hasGlow} />
              </div>
              <LogOut className="text-system-danger hidden group-hover:block" size={20} />
           </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* SIDEBAR NAVIGATION */}
        <nav className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 border-r border-white/5 bg-system-card transition-transform duration-300 transform
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex flex-col h-full p-6">
            <div className="flex items-center justify-between lg:hidden mb-8">
               <span className="font-display font-bold">SYSTEM MENU</span>
               <button onClick={() => setIsSidebarOpen(false)}><X size={20}/></button>
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <NavItem active={activeTab === 'dashboard'} icon={<LayoutDashboard size={20}/>} label="Dashboard" onClick={() => setActiveTab('dashboard')} />
              <NavItem active={activeTab === 'profile'} icon={<UserIcon size={20}/>} label="User DNA" onClick={() => setActiveTab('profile')} />
              <NavItem active={activeTab === 'quests'} icon={<Swords size={20}/>} label="Missions" onClick={() => setActiveTab('quests')} />
              <NavItem active={activeTab === 'skills'} icon={<Sparkles size={20}/>} label="Skill Matrix" onClick={() => setActiveTab('skills')} />
              <NavItem active={activeTab === 'timer'} icon={<Clock size={18}/>} label="Focus Chamber" onClick={() => setActiveTab('timer')} />
              <NavItem active={activeTab === 'store'} icon={<ShoppingBag size={20}/>} label="System Store" onClick={() => setActiveTab('store')} />
              <NavItem active={activeTab === 'ranks'} icon={<BarChart3 size={20}/>} label="Rank & Leaderboard" onClick={() => setActiveTab('ranks')} />
            </div>

            <div className="pt-8 mt-auto flex flex-col gap-4 border-t border-white/10">
              <div className="px-3 py-4 bg-red-500/10 border border-red-500/30 rounded-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-1 opacity-20">
                    <Zap size={40} className="text-red-500" />
                 </div>
                 <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                       <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                       <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-widest">D-DAY COUNTDOWN</span>
                    </div>
                    <div className="text-3xl font-display font-black text-white italic">
                       {Math.max(0, Math.ceil((new Date(EXAM_DATE).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                       <span className="text-sm ml-2 text-red-500/80">DAYS LEFT</span>
                    </div>
                    <div className="mt-2 text-[8px] font-mono text-white/50 uppercase leading-tight">
                       Ultimate Revision Phase: Active<br/>
                       Priority: History & Geography
                    </div>
                 </div>
              </div>

              <button 
                onClick={requestNotificationPermissions}
                className="flex items-center gap-3 px-3 py-2 text-system-neon hover:bg-system-neon/10 transition-all border border-system-neon/20 rounded-lg group"
              >
                <div className="text-system-neon group-hover:scale-110 transition-transform">
                  <BellRing size={18} />
                </div>
                <div className="flex flex-col items-start translate-y-[1px]">
                  <span className="text-[10px] font-mono leading-tight">INITIALIZE SENSES</span>
                  <span className="text-[8px] font-mono text-white/40 leading-tight">BROWSER NOTIFICATIONS</span>
                </div>
              </button>

              <div className="flex items-center gap-3 px-3">
                 <div className="p-2 rounded bg-system-neon/10 text-system-neon">
                    <Bell size={18} />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-white/40">SYSTEM STATUS</span>
                    <span className="text-[11px] font-bold text-green-400 uppercase">Shadow Link Active</span>
                 </div>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 text-white/40 hover:text-system-danger transition-colors mt-2"
              >
                <LogOut size={20} />
                <span className="text-sm font-medium">Log out of Matrix</span>
              </button>
            </div>
          </div>
        </nav>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-6 lg:p-10 min-h-[calc(100vh-64px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-10"
            >
              {activeTab === 'dashboard' && (
                <>
                  <UserHUD 
                    userId={user.uid} 
                    stats={stats} 
                    rankIndex={RANK_ORDER.indexOf(stats.rank)} 
                    questCount={quests.length}
                    onOpenTitles={() => setIsTitleModalOpen(true)}
                  />
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2">
                       <QuestSection 
                          quests={quests} 
                          onToggle={toggleQuest} 
                          onDelete={deleteQuest} 
                          onAdd={() => setIsModalOpen(true)}
                          onStart={startQuest}
                          onFail={failQuest}
                       />
                    </div>
                    <div className="flex flex-col gap-8">
                       <QuotesSection />
                       <FocusTimer 
                          onFocusComplete={handleFocusComplete} 
                          onStart={(m) => speak(`FOCUS TRAINING INITIALIZED FOR ${m} MINUTES. SILENCE YOUR DEVICE AND CONCENTRATE.`)}
                       />
                       <div className="p-6 system-border bg-system-card/40 rounded-xl">
                          <h3 className="text-xs font-mono uppercase tracking-widest text-system-neon mb-4">Daily Penalty Check</h3>
                          <p className="text-sm text-white/60 leading-relaxed italic">
                            "Missed missions result in penalty zone incubation. Maintain your streak to avoid shadow degradation."
                          </p>
                       </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'quests' && (
                <QuestSection 
                  quests={quests} 
                  onToggle={toggleQuest} 
                  onDelete={deleteQuest} 
                  onAdd={() => setIsModalOpen(true)}
                  onStart={startQuest}
                  onFail={failQuest}
                />
              )}

              {activeTab === 'skills' && (
                <SkillTree skills={skills} />
              )}

              {activeTab === 'store' && (
                <StoreSection gold={stats.gold} onBuy={handleBuyItem} activeTitle={stats.activeTitle || ""} />
              )}

              {activeTab === 'ranks' && (
                <RankSection level={stats.level} rank={stats.rank} exp={stats.exp} maxExp={stats.maxExp} />
              )}

              {activeTab === 'profile' && (
                <ProfileView userId={user.uid} stats={stats} skills={skills} questCount={quests.length} onUpdateStats={handleUpdateUserStats} />
              )}

              {activeTab === 'timer' && (
                <div className="max-w-2xl mx-auto w-full pt-10">
                   <FocusTimer onFocusComplete={handleFocusComplete} />
                   <div className="mt-12 p-8 border border-white/5 bg-white/5 rounded-2xl flex flex-col gap-4">
                      <h3 className="text-xl font-display font-bold italic">Why Focus?</h3>
                      <p className="text-white/60 leading-relaxed">
                        Entering the focus chamber allows the hunter to synchronize their consciousness with the academic matrix. High-intensity meditation generates mana (EXP) proportional to the duration of stay.
                      </p>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        <StatBox label="Sessions" value="12" />
                        <StatBox label="Avg Depth" value="28m" />
                        <StatBox label="Flow Sync" value="84%" />
                        <StatBox label="Mana Gain" value="+4.2k" />
                      </div>
                   </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* OVERLAYS */}
      <AnimatePresence>
        {stats.penaltyActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-6 backdrop-blur-sm"
          >
            <div className="max-w-md w-full bg-system-danger/10 border-2 border-system-danger p-8 rounded-2xl flex flex-col gap-6 text-center">
               <div className="w-20 h-20 rounded-full bg-system-danger/20 flex items-center justify-center mx-auto">
                  <SystemLogo size={40} color="#ff3e3e" />
               </div>
               <div className="flex flex-col gap-1">
                  <span className="text-xs font-mono text-system-danger tracking-[0.4em] font-bold uppercase">Penalty Mission</span>
                  <h2 className="text-3xl font-display font-black italic text-white">FAILED TO COMPLY</h2>
               </div>
               <div className="text-white/60 text-sm font-mono uppercase italic">
                  Assigned Task: <br/>
                  <div className="mt-4 mb-2 p-4 border border-system-danger/30 bg-system-danger/10 text-white font-bold tracking-widest text-xs rounded-lg">
                    {stats.penaltyReason}
                  </div>
               </div>

               <AIPenaltyVerifier 
                   penaltyTaskDescription={stats.penaltyReason || "Penalty Task"}
                   penaltyAssignedAt={stats.penaltyAssignedAt}
                   onVerifySuccess={handleClearPenalty}
                   onVerifyFail={() => notify("AI Verification Failed. Evidenced not accepted.", "danger")}
               />

               <div className="flex flex-col gap-4 mt-2 border-t border-white/10 pt-4">
                  <div className="flex flex-col gap-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSacrificeExp();
                        }}
                        disabled={isSacrificing}
                        className="w-full py-3 font-display font-bold italic tracking-tighter transition-all rounded-xl border border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)] flex items-center justify-center gap-2"
                      >
                         {isSacrificing ? (
                            <><Clock size={16} className="animate-spin" /> PURGING DATA...</>
                        ) : (
                            <>SACRIFICE DATA (-200 EXP)</>
                        )}
                      </button>
                      <span className="text-[9px] font-mono text-white/30 uppercase">
                          Current EXP: {Math.floor(stats.exp)} / {Math.floor(stats.maxExp)}
                      </span>
                  </div>

                  <div className="flex flex-col gap-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePardon();
                        }}
                        disabled={(stats.pardonTickets || 0) <= 0 || isPardoning}
                        className={`
                            w-full py-3 font-display font-bold italic tracking-tighter transition-all rounded-xl border flex items-center justify-center gap-2
                            ${(stats.pardonTickets || 0) > 0 
                                ? 'bg-system-neon/10 border-system-neon/30 text-system-neon hover:bg-system-neon/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
                                : 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed'}
                        `}
                      >
                        {isPardoning ? (
                            <><Clock size={16} className="animate-spin" /> EXECUTING...</>
                        ) : (
                            <>REQUEST ROYAL PARDON</>
                        )}
                      </button>
                      <span className="text-[9px] font-mono text-white/30 uppercase">
                          Inventory: {stats.pardonTickets || 0} Tickets
                      </span>
                  </div>
                  {(stats.pardonTickets || 0) <= 0 && (
                      <p className="text-[10px] text-system-danger/60 font-mono uppercase mt-1 italic">
                          No tickets in system inventory. You must complete the task or accept failure.
                      </p>
                  )}
                  <button 
                    onClick={handlePenaltyFailure}
                    className="w-full py-2 border border-white/10 text-white/40 font-mono text-[9px] uppercase hover:text-system-danger transition-colors mt-2"
                  >
                    Accept Total Failure (Level -1)
                  </button>
               </div>
            </div>
          </motion.div>
        )}
        {isModalOpen && (
          <AddQuestModal onClose={() => setIsModalOpen(false)} onAdd={addQuest} />
        )}
        {isTitleModalOpen && (
          <TitleSelector 
             onClose={() => setIsTitleModalOpen(false)} 
             earnedTitles={stats.titles || []} 
             activeTitle={stats.activeTitle || ""}
             onSelect={handleSetTitle}
             stats={stats}
             skills={skills}
          />
        )}
      </AnimatePresence>

      {/* LOCKDOWN OVERLAY */}
      <AnimatePresence>
        {lockdownTimeLeft > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center overflow-hidden"
          >
            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
            
            <motion.div
              animate={{ 
                boxShadow: [
                  "0 0 40px rgba(var(--system-neon-rgb), 0.1)",
                  "0 0 80px rgba(var(--system-neon-rgb), 0.3)",
                  "0 0 40px rgba(var(--system-neon-rgb), 0.1)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative z-10 w-full max-w-lg p-10 border-2 border-system-neon/30 bg-black/40 rounded-3xl"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="mb-8"
              >
                <div className="flex justify-center">
                  <SystemLogo size={80} color={themeColor} glow={hasGlow} />
                </div>
              </motion.div>

              <h1 className="text-4xl font-display font-black italic tracking-tighter text-white mb-2 uppercase">
                System Lockdown
              </h1>
              <p className="text-system-neon font-mono text-xs uppercase tracking-[0.3em] mb-8 opacity-70">
                Critical Error: Violation Detected
              </p>

              <div className="flex flex-col gap-4 mb-8">
                <div className="p-4 bg-system-neon/5 border border-system-neon/20 rounded-xl">
                  <p className="text-[10px] font-mono text-white/40 uppercase mb-1">Reason</p>
                  <p className="text-sm font-medium text-white/80 italic">
                    "{stats.penaltyReason || "INTEGRITY PROTOCOL BREACH"}"
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex justify-between items-center px-4 py-2 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-[10px] font-mono text-white/40 uppercase">Status</span>
                    <span className="text-[10px] font-mono text-system-danger uppercase animate-pulse font-bold">REBOOTING...</span>
                  </div>
                </div>
              </div>

              <div className="relative h-2 bg-white/5 rounded-full overflow-hidden mb-4">
                  <motion.div 
                    className="absolute inset-y-0 left-0 bg-system-neon"
                    initial={{ width: "100%" }}
                    animate={{ width: `${isNaN(lockdownTimeLeft) ? 0 : Math.max(0, Math.min(100, (lockdownTimeLeft / 300) * 100))}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
              </div>

              <div className="text-6xl font-display font-black italic tracking-tighter text-white tabular-nums">
                {Math.floor(lockdownTimeLeft / 60)}:{(lockdownTimeLeft % 60).toString().padStart(2, '0')}
              </div>
              <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mt-2">
                System Access Suspended
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-12 flex flex-col items-center gap-2"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-system-neon/10 border border-system-neon/20 rounded-full">
                <div className="w-2 h-2 rounded-full bg-system-neon animate-ping" />
                <span className="text-[10px] font-mono text-system-neon font-bold uppercase tracking-widest leading-none">
                  Restoring Matrix Balance
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed top-0 right-0 z-[1000] p-4 pointer-events-none flex flex-col items-end gap-3 w-full max-w-md">
        {notifications.map(n => (
          <SystemMessage 
            key={n.id} 
            message={n.text} 
            type={n.type} 
            onClose={() => removeNotification(n.id)} 
            onClick={n.onClick}
          />
        ))}
      </div>
    </div>
  );
}

function NavItem({ active, icon, label, onClick }: { active: boolean, icon: any, label: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-all
        ${active 
          ? 'bg-system-neon/10 text-system-neon border-l-4 border-system-neon' 
          : 'text-white/40 hover:text-white hover:bg-white/5'}
      `}
    >
      {icon}
      <span className="text-sm tracking-wide">{label}</span>
    </button>
  );
}

function StatBox({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col">
       <span className="text-[10px] font-mono text-white/30 uppercase">{label}</span>
       <span className="text-lg font-display font-bold text-white">{value}</span>
    </div>
  )
}
