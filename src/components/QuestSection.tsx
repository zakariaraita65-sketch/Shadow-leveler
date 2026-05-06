import { motion } from "motion/react";
import { Plus, Check, Trash2, Calendar, Swords, ScrollText, Volume2 } from "lucide-react";
import { Quest } from "../types";
import { speak } from "../lib/voice";

interface QuestSectionProps {
  quests: Quest[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export default function QuestSection({ quests = [], onToggle, onDelete, onAdd }: QuestSectionProps) {
  console.log(`[RENDER] QuestSection received ${quests?.length || 0} quests`);
  const dailyQuests = (quests || []).filter(q => q.type === "daily" || !q.type);
  const mainQuests = (quests || []).filter(q => q.type === "main");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white/5 p-4 rounded-lg border border-white/5">
        <div className="flex flex-col">
          <h2 className="text-xl font-display font-bold italic tracking-tight flex items-center gap-2">
            <Swords className="text-system-neon" size={20} /> MISSIONS
          </h2>
          <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Tracking mission objectives in real-time</span>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 text-[10px] font-bold bg-system-neon text-black px-4 py-2 rounded uppercase hover:bg-white transition-all transform active:scale-95"
        >
          <Plus size={14} /> Add Mission
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DAILY QUESTS */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50">
              Daily Missions
            </h3>
            <span className="text-[10px] font-mono text-system-neon bg-system-neon/10 px-2 rounded">{dailyQuests.length}</span>
          </div>
          <div className="flex flex-col gap-3 min-h-[100px]">
            {dailyQuests.length === 0 ? (
              <EmptyQuest type="daily" />
            ) : (
                dailyQuests.map((quest) => (
                <QuestCard 
                  key={quest.id} 
                  quest={quest} 
                  onToggle={() => onToggle(quest.id)} 
                  onDelete={() => onDelete(quest.id)} 
                />
              ))
            )}
          </div>
        </div>

        {/* MAIN QUESTS */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50">
              Main Campaigns
            </h3>
            <span className="text-[10px] font-mono text-system-purple bg-system-purple/10 px-2 rounded">{mainQuests.length}</span>
          </div>
          <div className="flex flex-col gap-3 min-h-[100px]">
            {mainQuests.length === 0 ? (
              <EmptyQuest type="main" />
            ) : (
                mainQuests.map((quest) => (
                <QuestCard 
                  key={quest.id} 
                  quest={quest} 
                  onToggle={() => onToggle(quest.id)} 
                  onDelete={() => onDelete(quest.id)} 
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuestCardProps {
  quest: Quest;
  onToggle: () => void;
  onDelete: () => void;
  key?: any;
}

function QuestCard({ quest, onToggle, onDelete }: QuestCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className={`group relative flex items-center gap-4 p-4 rounded-lg system-border transition-all ${
        quest.completed ? "bg-white/5 border-white/5" : "bg-system-card hover:bg-slate-800/80"
      }`}
    >
      <button
        onClick={onToggle}
        className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${
          quest.completed 
            ? "bg-system-neon border-system-neon text-system-bg" 
            : "border-white/20 hover:border-system-neon hover:bg-system-neon/10"
        }`}
      >
        {quest.completed && <Check size={14} strokeWidth={4} />}
      </button>

      <div className="flex flex-col flex-1">
        <div className="flex items-center gap-2">
          <h4 className={`font-medium ${quest.completed ? "line-through text-white/30" : "text-white"}`}>
            {quest.title}
          </h4>
          {!quest.completed && (
            <button 
              onClick={(e) => { e.stopPropagation(); speak(quest.title); }}
              className="text-white/20 hover:text-system-neon transition-colors"
              title="Read Objective"
            >
              <Volume2 size={12} />
            </button>
          )}
        </div>
        
        {quest.description && (
          <p className="text-xs text-white/50 mt-1 mb-1 line-clamp-2">
            {quest.description}
          </p>
        )}

        <div className="flex items-center gap-3 text-[10px] font-mono text-white/40 mt-1 flex-wrap">
          <span className="flex items-center gap-1 uppercase">
            <ScrollText size={10} /> {quest.category}
          </span>
          <span className="flex items-center gap-1 text-system-neon uppercase">
             +{quest.expReward} EXP
          </span>
          {quest.dueDate && (
             <span className="flex items-center gap-1 text-white/50 uppercase ml-auto">
               <Calendar size={10} /> {new Date(quest.dueDate).toLocaleDateString()} {new Date(quest.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
             </span>
          )}
        </div>
      </div>

      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-2 text-white/30 hover:text-system-danger transition-all"
      >
        <Trash2 size={16} />
      </button>
    </motion.div>
  );
}

function EmptyQuest({ type }: { type: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/10 rounded-lg opacity-40">
      <ScrollText size={24} className="mb-2" />
      <span className="text-xs font-mono uppercase tracking-widest">No {type} quests active</span>
    </div>
  );
}
