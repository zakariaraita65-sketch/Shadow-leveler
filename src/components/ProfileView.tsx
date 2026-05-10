import { useState, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Clock, 
  Trophy, 
  Calendar,
  ChevronRight,
  Brain,
  Dumbbell,
  BookOpen,
  Sword,
  BarChart3,
  Edit3,
  Check,
  X,
  Dna,
  Scale,
  Ruler,
  Droplets,
  Flag,
  Camera,
  Gem,
  Moon,
  CircleDot,
  Ghost,
  Coins,
  Flame,
  CloudMoon,
  Sparkles,
  Sun,
  Crown,
  Cpu,
  Wand2
} from 'lucide-react';
import { UserStats, Rank } from '../types';
import { RANK_ORDER, RANK_TITLES, AVAILABLE_TITLES, DIFFICULTY_COLORS, getCurrencyForTitle } from '../constants';

import SystemLogo from './SystemLogo';

const ICON_MAP: Record<string, any> = {
  Gem, Moon, CircleDot, Droplets, Ghost, Coins, Flame, CloudMoon, Sparkles, Sun, Crown, Cpu, Wand2
};

interface ProfileViewProps {
  userId: string;
  stats: UserStats;
  skills: Record<string, any>;
  questCount: number;
  onUpdateStats: (newStats: Partial<UserStats>) => Promise<void>;
}

export default function ProfileView({ userId, stats, skills, questCount, onUpdateStats }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    displayName: stats.displayName || "",
    age: stats.age || 0,
    height: stats.height || 0,
    weight: stats.weight || 0,
    bloodType: stats.bloodType || "O+",
    ultimateGoal: stats.ultimateGoal || "",
    gender: stats.gender || "male"
  });

  const handleEdit = () => {
    setEditData({
      displayName: stats.displayName || "",
      age: stats.age || 0,
      height: stats.height || 0,
      weight: stats.weight || 0,
      bloodType: stats.bloodType || "O+",
      ultimateGoal: stats.ultimateGoal || "",
      gender: stats.gender || "male"
    });
    setIsEditing(true);
  };
  
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const sanitizedData = {
        ...editData,
        age: isNaN(editData.age) ? 0 : editData.age,
        height: isNaN(editData.height) ? 0 : editData.height,
        weight: isNaN(editData.weight) ? 0 : editData.weight
      };

      const isComplete = !!sanitizedData.displayName && 
                         sanitizedData.age > 0 && 
                         sanitizedData.height > 0 && 
                         sanitizedData.weight > 0 && 
                         !!sanitizedData.gender;

      await onUpdateStats({
        ...sanitizedData,
        isProfileComplete: isComplete
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const [isUploading, setIsUploading] = useState(false);
  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500000) {
      alert("Image is too large. Please select a photo under 500KB.");
      return;
    }

    try {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        await onUpdateStats({ photoURL: base64String });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Photo upload failed:", error);
      setIsUploading(false);
    }
  };

  const currentRank = stats.rank || Rank.E;
  const rankTitle = RANK_TITLES[currentRank] || "ROOKIE";
  const activeTitle = stats.activeTitle || rankTitle;
  
  const activeTitleData = AVAILABLE_TITLES.find(t => t.name === activeTitle) || AVAILABLE_TITLES[0];
  const titleTheme = activeTitleData.theme || { color: "#00ff9d" };
  const themeColor = titleTheme.color;
  const isArchitect = activeTitle === "Grand Architect";

  const currency = getCurrencyForTitle(activeTitle);
  const CurrencyIcon = ICON_MAP[currency.icon] || Coins;
  
  const skillEntries = Object.entries(skills);

  const sortedSkills = skillEntries
    .map(([id, data]: [string, any]) => ({
      id,
      name: id.toUpperCase(),
      exp: data.exp || 0,
      level: data.level || 1
    }))
    .sort((a, b) => b.exp - a.exp);

  const strengths = sortedSkills.slice(0, 2);
  const weaknesses = sortedSkills.length > 2 ? sortedSkills.slice(-2).reverse() : [];

  const getCategoryIcon = (id: string) => {
    switch (id.toLowerCase()) {
      case 'physical': return <Dumbbell size={16} />;
      case 'mental': return <Brain size={16} />;
      case 'subject': return <BookOpen size={16} />;
      default: return <Sword size={16} />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Profile Card */}
      <section className="relative overflow-hidden bg-white/5 border border-white/10 rounded-3xl p-8">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <SystemLogo size={160} color={themeColor} />
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-2 overflow-hidden bg-white/5 flex items-center justify-center relative shadow-2xl" 
                 style={{ borderColor: themeColor, boxShadow: activeTitleData.theme?.glow ? `0 0 30px ${themeColor}44` : 'none' }}>
              {isUploading ? (
                <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" style={{ borderTopColor: themeColor }} />
              ) : stats.photoURL ? (
                <img src={stats.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={64} style={{ color: themeColor }} />
              )}
              
              <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera size={24} className="text-white mb-1" />
                <span className="text-[10px] font-mono text-white uppercase font-bold">Update</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handlePhotoChange}
                  disabled={isUploading}
                />
              </label>
            </div>
            <div className="absolute -bottom-2 -right-2 text-black px-3 py-1 rounded-full text-xs font-bold font-display italic shadow-lg"
                 style={{ backgroundColor: themeColor }}>
              LVL {stats.level}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
              {isEditing ? (
                <input 
                  type="text"
                  value={editData.displayName}
                  onChange={(e) => setEditData({...editData, displayName: e.target.value})}
                  className="bg-white/10 border border-white/20 rounded px-2 py-1 text-2xl font-display font-black italic uppercase text-white outline-none focus:border-white/40"
                />
              ) : (
                <div className="flex flex-col">
                  <h1 className="text-3xl font-display font-black italic uppercase tracking-tighter">
                    {stats.displayName || "ANONYMOUS UNIT"}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10 tracking-widest text-white/40">
                      HUNTER LICENSE ID: #{userId.substring(0, 8).toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
              <button 
                onClick={() => isEditing ? handleSave() : handleEdit()}
                disabled={isSaving}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" style={{ borderTopColor: themeColor }} />
                ) : isEditing ? (
                  <Check size={16} className="text-green-400" />
                ) : (
                  <Edit3 size={16} className="text-white/40" />
                )}
              </button>
            </div>
            
            <p className="font-mono text-sm uppercase tracking-widest mb-4 flex items-center justify-center md:justify-start gap-2 font-black"
               style={{ color: themeColor, filter: activeTitleData.theme?.glow ? `drop-shadow(0 0 10px ${themeColor})` : 'none' }}>
              {isArchitect ? <Cpu size={14} className="animate-spin-slow" /> : <Trophy size={14} />}
              {activeTitle}
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
               <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                 <span className="text-[10px] font-mono text-white/40 uppercase">Rank</span>
                 <span className="text-sm font-display font-bold text-white">{currentRank}</span>
               </div>
               
               {isEditing ? (
                 <>
                   <select 
                     value={editData.gender}
                     onChange={(e) => setEditData({...editData, gender: e.target.value as any})}
                     className="bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white"
                   >
                     <option value="male">Male</option>
                     <option value="female">Female</option>
                   </select>
                   <input 
                     type="number"
                     placeholder="Age"
                     value={editData.age || ""}
                     onChange={(e) => setEditData({...editData, age: e.target.value === "" ? 0 : parseInt(e.target.value)})}
                     className="w-16 bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white"
                   />
                 </>
               ) : (
                 <>
                   <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                     <span className="text-[10px] font-mono text-white/40 uppercase">Gender</span>
                     <span className="text-sm font-display font-bold text-white capitalize">{stats.gender || "Undeclared"}</span>
                   </div>
                   <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                     <span className="text-[10px] font-mono text-white/40 uppercase">Age</span>
                     <span className="text-sm font-display font-bold text-white">{stats.age || "??"}</span>
                   </div>
                 </>
               )}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Personal DNA Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xs font-display font-bold uppercase italic text-white/40 mb-6 flex items-center gap-2">
                <Dna size={14} className="text-system-neon" />
                Physical Matrix
              </h3>
              <div className="space-y-4">
                 {[
                   { label: "Height", value: stats.height || "--", unit: "cm", icon: Ruler, key: "height" },
                   { label: "Weight", value: stats.weight || "--", unit: "kg", icon: Scale, key: "weight" },
                   { label: "Blood", value: stats.bloodType || "--", unit: "", icon: Droplets, key: "bloodType" },
                 ].map((meta, i) => (
                   <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <meta.icon size={16} className="text-white/20" />
                        <span className="text-[10px] font-mono text-white/40 uppercase">{meta.label}</span>
                      </div>
                      {isEditing ? (
                        <input 
                           type={meta.key === 'bloodType' ? 'text' : 'number'}
                           value={(editData as any)[meta.key] || ""}
                           onChange={(e) => {
                             const val = e.target.value;
                             setEditData({
                               ...editData, 
                               [meta.key]: meta.key === 'bloodType' ? val : (val === '' ? 0 : parseFloat(val))
                             });
                           }}
                           className="w-16 bg-white/10 border border-white/20 rounded px-1 py-0.5 text-xs text-right text-white"
                        />
                      ) : (
                        <div className="flex items-baseline gap-1">
                           <span className="text-sm font-display font-bold text-white">{meta.value}</span>
                           <span className="text-[9px] font-mono text-white/20">{meta.unit}</span>
                        </div>
                      )}
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-system-neon/10 border border-system-neon/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Flag size={20} className="text-system-neon" />
                <h3 className="font-display font-bold text-sm uppercase">Ultimate Mission</h3>
              </div>
              {isEditing ? (
                <textarea 
                  value={editData.ultimateGoal}
                  onChange={(e) => setEditData({...editData, ultimateGoal: e.target.value})}
                  className="w-full h-32 bg-white/10 border border-white/20 rounded p-2 text-xs text-white"
                  placeholder="What is your final objective?"
                />
              ) : (
                <p className="text-xs text-white/60 leading-relaxed italic">
                  {stats.ultimateGoal || "No ultimate objective defined yet. Set your destiny in edit mode."}
                </p>
              )}
           </div>
        </div>

        {/* The Matrix Grid (Previously Stats Matrix) */}
        <div className="lg:col-span-3 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "Total Missions", value: questCount, icon: <Target className="text-blue-400" /> },
              { label: "Current Streak", value: `${stats.streak} Days`, icon: <Zap className="text-yellow-400" /> },
              { label: currency.name.toUpperCase(), value: stats.gold, icon: <CurrencyIcon className="text-yellow-400" /> },
              { label: "Completion Rate", value: `${questCount > 0 ? Math.round((stats.completedQuests / questCount) * 100) : 0}%`, icon: <TrendingUp className="text-purple-400" /> },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{stat.label}</p>
                    <h3 className="text-xl font-display font-black italic text-white uppercase">{stat.value}</h3>
                  </div>
                </div>
              </motion.div>
            ))}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths & Weaknesses Analysis */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <BarChart3 className="text-system-neon" />
                    <h2 className="text-lg font-display font-bold uppercase italic">Skill Resonance</h2>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {/* Strengths */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-green-500/20 text-green-400 rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                        <h3 className="font-display font-bold uppercase italic">Combat Strengths</h3>
                      </div>
                      <div className="space-y-4">
                        {strengths.length > 0 ? strengths.map((s, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                              <div className="flex items-center gap-3">
                                <div className="text-green-400">{getCategoryIcon(s.id)}</div>
                                <span className="text-sm font-mono text-white/80">{s.name}</span>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-xs font-bold text-green-400">LVL {s.level}</span>
                                <span className="text-[9px] font-mono text-white/30">{s.exp} XP</span>
                              </div>
                          </div>
                        )) : (
                          <p className="text-sm text-white/20 italic">Data insufficient to determine strengths.</p>
                        )}
                      </div>
                  </div>

                  {/* Weaknesses */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-red-500/20 text-red-400 rounded-lg">
                            <TrendingDown size={20} />
                        </div>
                        <h3 className="font-display font-bold uppercase italic">Strategic Weaknesses</h3>
                      </div>
                      <div className="space-y-4">
                        {weaknesses.length > 0 ? weaknesses.map((s, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                              <div className="flex items-center gap-3">
                                <div className="text-red-400">{getCategoryIcon(s.id)}</div>
                                <span className="text-sm font-mono text-white/80">{s.name}</span>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-xs font-bold text-red-400">LVL {s.level}</span>
                                <span className="text-[9px] font-mono text-white/30">{s.exp} XP</span>
                              </div>
                          </div>
                        )) : (
                          <p className="text-sm text-white/20 italic">Data insufficient to determine weaknesses.</p>
                        )}
                      </div>
                  </div>
                </div>
              </div>

              {/* Earned Titles Showcase */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Trophy className="text-system-neon" />
                    <h2 className="text-lg font-display font-bold uppercase italic">Recognition Hall</h2>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 divide-y divide-white/5">
                    {(stats.titles || []).map((title, i) => {
                      const titleInfo = AVAILABLE_TITLES.find(t => t.name === title);
                      const themeColor = titleInfo?.theme?.color || "#ffffff";
                      
                      return (
                        <div key={i} className="py-4 flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}` }} />
                              <div className="flex flex-col">
                                <span className={`text-sm font-display font-bold uppercase tracking-tight`} style={{ color: themeColor }}>
                                  {title}
                                </span>
                                <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">
                                  {titleInfo?.difficulty || "Basic"} Tier
                                </span>
                              </div>
                          </div>
                          {stats.activeTitle === title && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-white/10 text-white/50 uppercase" style={{ borderColor: `${themeColor}44`, color: themeColor }}>Equipped</span>
                          )}
                        </div>
                      );
                    })}
                    {(!stats.titles || stats.titles.length === 0) && (
                      <p className="py-4 text-sm text-white/20 italic">No recognized titles earned yet.</p>
                    )}
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
