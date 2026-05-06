import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
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
  ShoppingBag
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
  getDoc
} from 'firebase/firestore';
import { auth, db, OperationType, handleFirestoreError } from './firebase';
import { speak } from './lib/voice';

import UserHUD from './components/UserHUD';
import QuestSection from './components/QuestSection';
import FocusTimer from './components/FocusTimer';
import SkillTree from './components/SkillTree';
import StoreSection from './components/StoreSection';
import QuotesSection from './components/QuotesSection';
import SystemMessage from './components/SystemMessage';
import AddQuestModal from './components/AddQuestModal';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import { UserStats, Quest, Rank } from './types';
import { INITIAL_STATS, RANK_ORDER, EXP_PER_LEVEL } from './constants';

export default function App() {
  // --- STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [skills, setSkills] = useState<any>({});
  
  const [notifications, setNotifications] = useState<{ id: number; text: string; type?: any }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'quests' | 'skills' | 'timer' | 'store'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      const userRef = doc(db, 'users', u.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        setShowOnboarding(true);
        setLoading(false);
      } else {
        setShowOnboarding(false);
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  const handleOnboardingComplete = async (data: { displayName: string; gender: "male" | "female"; age: number }) => {
    if (!user) return;
    
    setLoading(true);
    const userRef = doc(db, 'users', user.uid);
    const initialUserData = {
      ...INITIAL_STATS,
      displayName: data.displayName,
      gender: data.gender,
      age: data.age,
      photoURL: user.photoURL || "",
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
    const statsUnsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        setStats(snap.data() as UserStats);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, `users/${user.uid}`));

    // Listen for quests
    const questsUnsub = onSnapshot(collection(db, 'users', user.uid, 'quests'), (snap) => {
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
    if (!user || loading) return;

    const checkPenalty = async () => {
      const now = new Date();
      const last = new Date(stats.lastActive);
      const diffMs = now.getTime() - last.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      const userRef = doc(db, 'users', user.uid);

      if (diffHours > 48) {
        await updateDoc(userRef, {
          streak: 0,
          exp: Math.max(0, stats.exp - 100),
          lastActive: now.toISOString(),
          penaltyActive: true,
          penaltyReason: "LONG INACTIVITY DETECTED",
          penaltyDeadline: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
        });
        notify("SYSTEM WARNING: PENALTY QUEST GENERATED", "danger");
      } else if (diffHours > 24) {
        // If daily quests were not finished, trigger penalty
        const unfinishedDailies = quests.filter(q => q.type === 'daily' && !q.completed);
        if (unfinishedDailies.length > 0) {
          await updateDoc(userRef, {
            penaltyActive: true,
            penaltyReason: "INCOMPLETE DAILY MISSIONS",
            penaltyDeadline: new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString()
          });
          notify("PENALTY MISSION ACTIVATED: MISSION FAILURE", "danger");
        }

        await updateDoc(userRef, { 
          streak: stats.streak + 1,
          lastActive: now.toISOString() 
        });
        notify("DAILY SESSION INITIALIZED", "info");
      }
    };

    checkPenalty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]); 

  // --- HELPERS ---
  const notify = useCallback((text: string, type: any = 'info') => {
    setNotifications(prev => [...prev, { id: Date.now(), text, type }]);
  }, []);

  const addExp = useCallback(async (amount: number, category?: string) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    
    let newExp = stats.exp + amount;
    let newLevel = stats.level;
    let newRank = stats.rank;
    let newMaxExp = stats.maxExp;

    while (newExp >= newMaxExp) {
      newExp -= newMaxExp;
      newLevel += 1;
      newMaxExp = Math.floor(EXP_PER_LEVEL * Math.pow(1.1, newLevel - 1));
      const msg = `LEVEL UP! REACHED LEVEL ${newLevel}`;
      notify(msg, 'success');
      speak(msg);
      
      const rankIdx = Math.floor(newLevel / 10);
      if (rankIdx < RANK_ORDER.length && RANK_ORDER[rankIdx] !== newRank) {
        newRank = RANK_ORDER[rankIdx];
        const rankMsg = `RANK UP! NEW RANK: ${newRank}-RANK`;
        notify(rankMsg, 'success');
        speak(rankMsg);
      }
    }

    const goldEarned = Math.floor(amount * 0.8);
    
    try {
      await updateDoc(userRef, { 
        exp: newExp, 
        level: newLevel, 
        rank: newRank, 
        maxExp: newMaxExp,
        gold: stats.gold + goldEarned
      });
    } catch (err) { handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`); }

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
        await addExp(quest.expReward, quest.category);
        notify('DAILY MISSION COMPLETED', 'info');
        speak('MISSION COMPLETED. EXPERENCE GAINED.');
        await updateDoc(doc(db, 'users', user.uid), { 
          completedQuests: stats.completedQuests + 1 
        });
      }
      await updateDoc(qRef, { completed: !quest.completed });
    } catch (err) { handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/quests/${id}`); }
  };

  const deleteQuest = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'quests', id));
    } catch (err) { handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/quests/${id}`); }
  };

  const addQuest = async (qData: any) => {
    if (!user) return;
    console.log("[ACTION] Adding quest:", qData);
    const newQuest = {
      ...qData,
      userId: user.uid,
      completed: false,
      description: qData.description || "",
      dueDate: qData.dueDate || new Date().toISOString(),
    };
    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'quests'), newQuest);
      console.log("[SUCCESS] Quest added with ID:", docRef.id);
      notify('QUEST ACCEPTED', 'info');
      speak('QUEST ACCEPTED. GOOD LUCK HUNTER.');
    } catch (err) { 
      notify('QUEST REGISTRATION FAILED', 'danger');
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/quests`); 
    }
  };

  const handleFocusComplete = (minutes: number) => {
    addExp(minutes * 10);
    if (user) {
      updateDoc(doc(db, 'users', user.uid), { 
        totalFocusTime: stats.totalFocusTime + minutes 
      });
    }
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
      await updateDoc(doc(db, 'users', user.uid), {
        penaltyActive: false,
        penaltyReason: "",
        penaltyDeadline: ""
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

  const handleLogout = () => signOut(auth);

  // --- RENDER ---
  if (loading) {
    return (
      <div className="min-h-screen bg-system-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-system-neon border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login onLoginProgress={(p) => setLoading(p)} />;
  }

  if (showOnboarding) {
    return <Onboarding user={user} onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-system-bg text-slate-100 font-sans selection:bg-system-neon/30 overflow-x-hidden">
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
            <span className="text-[10px] font-mono text-system-neon tracking-[0.2em] font-bold leading-none">SHADOW LEVELER</span>
            <span className="text-lg font-display font-black italic tracking-tighter text-white">SYSTEM v2.5.0</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-mono text-white/40">CURRENT STREAK</span>
              <span className="text-sm font-display font-bold text-system-neon neon-text">{stats.streak} DAYS</span>
           </div>
           <div className="w-10 h-10 rounded-full system-border overflow-hidden bg-system-neon/20 flex items-center justify-center group cursor-pointer relative" onClick={handleLogout}>
              <Shield className="text-system-neon group-hover:hidden" size={24} />
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
              <NavItem active={activeTab === 'quests'} icon={<Swords size={20}/>} label="Quest Board" onClick={() => setActiveTab('quests')} />
              <NavItem active={activeTab === 'skills'} icon={<Sparkles size={20}/>} label="Skill Matrix" onClick={() => setActiveTab('skills')} />
              <NavItem active={activeTab === 'timer'} icon={<Clock size={18}/>} label="Focus Chamber" onClick={() => setActiveTab('timer')} />
              <NavItem active={activeTab === 'store'} icon={<ShoppingBag size={20}/>} label="System Store" onClick={() => setActiveTab('store')} />
              <NavItem active={false} icon={<BarChart3 size={20}/>} label="Player Stats" onClick={() => notify('FEATURE LOCKED: REACH LEVEL 10', 'warning')} />
            </div>

            <div className="pt-8 mt-auto flex flex-col gap-4 border-t border-white/10">
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
                className="flex items-center gap-3 px-3 py-2 text-white/40 hover:text-system-danger transition-colors"
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
                  />
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2">
                       <QuestSection 
                          quests={quests} 
                          onToggle={toggleQuest} 
                          onDelete={deleteQuest} 
                          onAdd={() => setIsModalOpen(true)}
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
                />
              )}

              {activeTab === 'skills' && (
                <SkillTree skills={skills} />
              )}

              {activeTab === 'store' && (
                <StoreSection gold={stats.gold} onBuy={handleBuyItem} />
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
               <div className="w-20 h-20 rounded-full bg-system-danger/20 flex items-center justify-center text-system-danger mx-auto animate-pulse">
                  <Shield size={40} />
               </div>
               <div className="flex flex-col gap-1">
                  <span className="text-xs font-mono text-system-danger tracking-[0.4em] font-bold uppercase">Penalty Mission</span>
                  <h2 className="text-3xl font-display font-black italic text-white">FAILED TO COMPLY</h2>
               </div>
               <p className="text-white/60 text-sm font-mono uppercase italic">
                  Reason: {stats.penaltyReason}<br/>
                  "Survive the penalty or face permanent degradation."
               </p>
               <div className="flex flex-col gap-4 mt-4">
                  <button 
                    onClick={handleClearPenalty}
                    className="w-full py-4 bg-system-danger text-white font-display font-black uppercase rounded-lg hover:scale-105 active:scale-95 transition-all"
                  >
                    I Have Completed 100 Push-ups
                  </button>
                  <button 
                    onClick={handlePenaltyFailure}
                    className="w-full py-3 border border-white/10 text-white/40 font-mono text-[10px] uppercase hover:text-system-danger transition-colors"
                  >
                    Accept Failure (Level -1)
                  </button>
               </div>
            </div>
          </motion.div>
        )}
        {isModalOpen && (
          <AddQuestModal onClose={() => setIsModalOpen(false)} onAdd={addQuest} />
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 w-full p-4 pointer-events-none flex flex-col items-end gap-2">
        {notifications.map(n => (
          <SystemMessage 
            key={n.id} 
            message={n.text} 
            type={n.type} 
            onClose={() => removeNotification(n.id)} 
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
