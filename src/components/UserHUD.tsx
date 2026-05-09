import React from "react";
import { RANK_ORDER, RANK_TITLES, AVAILABLE_TITLES, getCurrencyForTitle } from "../constants";
import { motion } from "motion/react";
import { 
  Shield, 
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
  Crown 
} from "lucide-react";

const ICON_MAP: Record<string, any> = {
  Gem, Moon, CircleDot, Droplets, Ghost, Coins, Flame, CloudMoon, Sparkles, Sun, Crown
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

  return (
    <div className="flex flex-col gap-6 p-6 system-border bg-system-card/50 backdrop-blur-md rounded-xl relative overflow-hidden group shadow-2xl transition-all duration-700" 
         style={{ borderColor: `rgba(var(--system-neon-rgb), 0.2)`, boxShadow: `0 0 30px rgba(var(--system-neon-rgb), 0.15)` }}>
      {/* Background Decor */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl animate-pulse opacity-40 bg-system-neon" />
      <div className="absolute top-0 left-0 w-full h-[1px] shadow-[0_0_10px_rgba(var(--system-neon-rgb),0.5)]" 
           style={{ background: `linear-gradient(90deg, transparent, var(--color-system-neon), transparent)` }} />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-system-neon" />
            <h2 className="text-[10px] font-mono text-white/40 uppercase tracking-[0.4em]">
              {stats.displayName || "GUEST_HUNTER"}
            </h2>
          </div>
          <h1 className="text-5xl font-display font-black italic tracking-tighter mt-1 leading-none">
            LVL <span className="text-system-neon">{level}</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6 self-end md:self-center">
          <div className="flex flex-col items-end">
             <button 
                onClick={onOpenTitles}
                className="flex items-center gap-2 mb-1 group/title hover:brightness-125 transition-all active:scale-95"
             >
               <span className="w-1 h-1 rounded-full animate-pulse bg-system-neon shadow-[0_0_8px_rgba(var(--system-neon-rgb),0.5)]" />
               <span className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold text-system-neon group-hover/title:drop-shadow-[0_0_5px_rgba(var(--system-neon-rgb),0.8)] transition-all">
                 {activeTitle}
               </span>
               <Award size={12} className="group-hover/title:scale-110 group-hover/title:rotate-12 transition-transform text-system-neon" />
             </button>
             <div className="text-7xl font-display font-black italic group-hover:scale-110 transition-all duration-500 leading-none tracking-tighter text-system-neon neon-text">
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
