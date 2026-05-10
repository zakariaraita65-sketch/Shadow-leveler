import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Check, Lock } from 'lucide-react';
import { AVAILABLE_TITLES } from '../constants';
import { UserStats } from '../types';

interface TitleSelectorProps {
  onClose: () => void;
  onSelect: (title: string) => void;
  earnedTitles: string[];
  activeTitle: string;
  stats: UserStats;
  skills: any;
}

export default function TitleSelector({ onClose, onSelect, earnedTitles, activeTitle, stats, skills }: TitleSelectorProps) {
  const getMetricValue = (metric: string | undefined) => {
    if (!metric) return 0;
    if (metric === 'categories') {
      const categories = ['hg', 'french', 'arabic', 'islamic'];
      return categories.filter(cat => skills[cat] && skills[cat].level >= 1).length;
    }
    if (metric === 'rankIndex') {
      const RANK_ORDER = [
        'E', 'E+', 'D', 'D+', 'C', 'C+', 'B', 'B+', 'B++', 'A', 'A+', 'S', 'S+', 'SS', 'SS+', 'SSS'
      ];
      return RANK_ORDER.indexOf(stats.rank);
    }
    return (stats as any)[metric] || 0;
  };
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-system-bg border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-system-neon/20 rounded-lg text-system-neon">
              <Trophy size={24} />
            </div>
            <div>
              <h2 className="text-xl font-display font-black italic uppercase tracking-tight">Hall of Titles</h2>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Select your recognized designation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVAILABLE_TITLES.filter(t => !t.secret || earnedTitles.includes(t.name)).map((title) => {
              const isEarned = earnedTitles.includes(title.name);
              const isActive = activeTitle === title.name;

              return (
                <div 
                  key={title.id}
                  onClick={() => isEarned && onSelect(title.name)}
                  className={`
                    relative p-4 rounded-xl border transition-all group flex flex-col gap-2
                    ${isEarned 
                      ? 'cursor-pointer border-white/10 hover:border-system-neon/50 bg-white/5 hover:bg-white/10' 
                      : 'opacity-50 border-white/5 bg-black/20 cursor-not-allowed'}
                    ${isActive ? 'border-system-neon bg-system-neon/10' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-display font-bold uppercase`} style={{ color: isActive ? (title.theme?.color || '#00ff9d') : 'white' }}>
                      {title.name}
                    </span>
                    {isActive ? (
                      <Check size={16} className="text-system-neon" />
                    ) : !isEarned && (
                      <Lock size={16} className="text-white/20" />
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-white/40 uppercase">Requirement</span>
                    </div>
                    <span className="text-xs text-white/70 italic mb-1">{title.condition}</span>

                    {!isEarned && title.goal && (
                       <div className="w-full h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden border border-white/5 relative">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${title.goal && title.goal > 0 ? (Math.min(getMetricValue(title.metric), title.goal) / title.goal) * 100 : 0}%` }}
                            className="h-full relative z-10"
                            style={{ 
                              backgroundColor: title.theme?.color || '#22d3ee',
                              boxShadow: `0 0 15px ${title.theme?.color}`
                            }}
                          />
                          {/* Progress line background indicator */}
                          <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                       </div>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <span 
                      className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-all duration-700 ${
                        title.difficulty !== 'Easy' ? 'animate-pulse' : ''
                      }`}
                      style={{
                        color: title.theme?.color || '#22d3ee',
                        borderColor: `${title.theme?.color}60`,
                        boxShadow: title.difficulty !== 'Easy' ? `0 0 15px ${title.theme?.color}60` : 'none',
                        textShadow: title.difficulty !== 'Easy' ? `0 0 8px ${title.theme?.color}` : 'none',
                        backgroundColor: `${title.theme?.color}15`,
                        fontWeight: title.difficulty !== 'Easy' ? 'bold' : 'normal'
                      }}
                    >
                      {title.difficulty.toUpperCase()}
                    </span>
                  </div>

                  {isActive && (
                    <div className="absolute top-0 right-0 p-1">
                      <div className="w-1.5 h-1.5 bg-system-neon rounded-full animate-pulse shadow-[0_0_8px_rgba(0,255,157,0.8)]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-black/20 text-center">
           <p className="text-[10px] font-mono text-white/20 uppercase">Titles are earned through high-intensity missions and consistency.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
