import React from "react";
import { RANK_ORDER, RANK_TITLES, AVAILABLE_TITLES, getCurrencyForTitle } from "../constants";
import { motion } from "motion/react";
import SystemLogo from "./SystemLogo";
import { 
  Zap, 
  TrendingUp, 
  Award, 
  Coins, 
  Gem, 
  Moon, 
  CircleDot, 
  Droplets, 
  Ghost, 
  Flame, 
  CloudMoon, 
  Sparkles, 
  Sun, 
  Crown,
  Cpu,
  Wand2
} from "lucide-react";

const ICON_MAP: Record<string, any> = {
  Gem, Moon, CircleDot, Droplets, Ghost, Coins, Flame, CloudMoon, Sparkles, Sun, Crown, Cpu, Wand2
};

interface UserHUDProps {
  stats: any;
  rankIndex: number;
  userId: string;
  onOpenTitles?: () => void;
}

export default function UserHUD({ stats, rankIndex, userId, questCount = 0, onOpenTitles }: UserHUDProps & { questCount?: number }) {
  if (!stats) return null;

  const currentRank = RANK_ORDER[rankIndex] || "E";
  const rankTitle = RANK_TITLES[currentRank] || "ROOKIE";
  const activeTitle = stats.activeTitle || rankTitle;
  const level = stats.level || 1;
  const exp = stats.exp || 0;
  const maxExp = stats.maxExp || 1000;
  const streak = stats.streak || 0;
  const focusTime = stats.totalFocusTime || 0;
  const gold = stats.gold || 0;
  
  const activeTitleData = AVAILABLE_TITLES.find(t => t.name === activeTitle) || AVAILABLE_TITLES[0];
  const currency = getCurrencyForTitle(activeTitle);
  const CurrencyIcon = ICON_MAP[currency.icon] || Coins;

  const isArchitect = activeTitle === "Grand Architect";
  const titleTheme = (activeTitleData as any).theme || { color: "#00ff9d" };
  const themeColor = titleTheme.color;
  const hasGlow = !!titleTheme.glow;

  return (
    <div className={`flex flex-col gap-6 p-6 system-border backdrop-blur-md rounded-xl relative overflow-hidden group shadow-2xl transition-all duration-700 ${hasGlow ? 'bg-black/60 ring-2' : 'bg-system-card/50'}`} 
         style={{ 
            borderColor: hasGlow ? themeColor : `rgba(var(--system-neon-rgb), 0.2)`, 
            boxShadow: hasGlow ? `0 0 70px ${themeColor}44, inset 0 0 30px ${themeColor}22` : `0 0 30px rgba(var(--system-neon-rgb), 0.15)`,
            ringColor: hasGlow ? `${themeColor}44` : 'transparent'
         }}>
      
      {hasGlow && (
        <>
          <motion.div 
            animate={{ x: ['-200%', '200%'] }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            className="absolute inset-0 z-0 pointer-events-none w-1/3 h-full skew-x-12 opacity-20 bg-gradient-to-r from-transparent via-white to-transparent"
          />
          <motion.div 
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`absolute inset-0 z-0 pointer-events-none`}
            style={{ backgroundColor: `${themeColor}22` }}
          />
        </>
      )}

      {/* Background Decor */}
      <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl animate-pulse opacity-40`} 
           style={{ backgroundColor: themeColor, boxShadow: hasGlow ? `0 0 50px ${themeColor}` : 'none' }} />

      {hasGlow && (
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay" />
      )}
      <div className="absolute top-0 left-0 w-full h-[1px]" 
           style={{ background: `linear-gradient(90deg, transparent, ${themeColor}, transparent)` }} />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: themeColor }} />
            <h2 className={`text-[10px] font-mono uppercase tracking-[0.4em] font-black`} style={{ color: `${themeColor}cc` }}>
              {stats.displayName || "GUEST_HUNTER"}
            </h2>
          </div>
          <h1 className="text-5xl font-display font-black italic tracking-tighter mt-1 leading-none uppercase">
            LVL <span style={{ color: themeColor, filter: activeTitleData.theme?.glow ? `drop-shadow(0 0 10px ${themeColor})` : 'none' }}>{level}</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6 self-end md:self-center">
          <div className="flex flex-col items-end">
             <button 
                onClick={onOpenTitles}
                className="flex items-center gap-2 mb-1 group/title hover:brightness-125 transition-all active:scale-95"
             >
               <span className={`w-1 h-1 rounded-full animate-pulse`} 
                     style={{ 
                       backgroundColor: themeColor, 
                       boxShadow: `0 0 8px ${themeColor}` 
                     }} />
               <span className={`text-[10px] font-mono uppercase tracking-[0.3em] font-bold`} style={{ color: themeColor }}>
                 {activeTitle}
               </span>
               {isArchitect ? <Cpu size={12} style={{ color: themeColor }} className="animate-spin-slow" /> : <Award size={12} style={{ color: themeColor }} />}
             </button>
             <div className={`text-7xl font-display font-black italic group-hover:scale-110 transition-all duration-500 leading-none tracking-tighter`}
                  style={{ color: themeColor, filter: `drop-shadow(0 0 20px ${themeColor}99)` }}>
                {currentRank}
             </div>
          </div>
        </div>
      </div>

      {/* EXP BAR */}
      <div className="flex flex-col gap-2 relative z-10">
        <div className="flex justify-between items-end text-[10px] font-mono uppercase tracking-widest text-white/40">
          <span className="brightness-125 font-bold text-system-neon">Experience Sync</span>
          <div className="flex items-center gap-2">
            <span className="text-white/60">{exp}</span>
            <span className="opacity-20 text-[8px]">/</span>
            <span className="text-white/30">{maxExp}</span>
          </div>
        </div>
        <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(0, (exp / Math.max(1, maxExp)) * 100)}%` }}
            transition={{ type: "spring", stiffness: 40, damping: 15 }}
            className="h-full relative bg-system-neon"
          >
             <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-shimmer" />
          </motion.div>
        </div>
      </div>

      {/* MINI STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 relative z-10">
        <StatItem icon={<TrendingUp size={14} />} label="STREAK" value={`${streak} DAYS`} />
        <StatItem icon={<Zap size={14} />} label="FOCUS" value={`${focusTime} MIN`} />
        <StatItem icon={<Award size={14} />} label="ACTIVE MISSIONS" value={questCount} />
        <StatItem icon={<CurrencyIcon size={14} />} label={currency.name.toUpperCase()} value={`${gold}`} overrideColor="text-yellow-400" />
      </div>
    </div>
  );
}

function StatItem({ icon, label, value, overrideColor }: { icon: React.ReactNode, label: string, value: any, overrideColor?: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-all hover:translate-y-[-2px]">
      <div className={`opacity-60 ${overrideColor || 'text-system-neon'}`}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[8px] font-mono text-white/30 uppercase tracking-tighter leading-none mb-1">{label}</span>
        <span className="text-sm font-display font-bold leading-none">{value}</span>
      </div>
    </div>
  );
}
