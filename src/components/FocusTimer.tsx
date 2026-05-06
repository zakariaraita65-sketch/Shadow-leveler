import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Timer, Play, Pause, RotateCcw, Target } from "lucide-react";

interface FocusTimerProps {
  onFocusComplete: (minutes: number) => void;
  onStart?: (minutes: number) => void;
}

export default function FocusTimer({ onFocusComplete, onStart }: FocusTimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (mode === "focus") {
        onFocusComplete(25);
        setMode("break");
        setTimeLeft(5 * 60);
      } else {
        setMode("focus");
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, onFocusComplete]);

  const toggleTimer = () => {
    if (!isActive && mode === 'focus') {
      onStart?.(25);
    }
    setIsActive(!isActive);
  };
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === "focus" ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 system-border bg-system-card/50 backdrop-blur-md rounded-xl relative overflow-hidden group">
      {/* HUD Label */}
      <div className="absolute top-0 right-0 p-2 text-[8px] font-mono text-system-neon/30 uppercase tracking-widest border-l border-b border-system-neon/20">
        Chronos-Interface v1.0
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className={`text-[10px] font-mono uppercase tracking-[0.3em] font-bold ${mode === 'focus' ? 'text-system-neon' : 'text-purple-400'}`}>
          {mode === "focus" ? "Active Hunt: Focus Mode" : "Rest Period: Mana Regeneration"}
        </span>
        <div className="text-7xl font-display font-black tracking-tighter italic neon-text tabular-nums">
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={toggleTimer}
          className={`flex items-center gap-2 px-6 py-3 rounded-md font-display font-bold uppercase tracking-wider transition-all ${
            isActive ? 'bg-system-danger/20 text-system-danger border border-system-danger/50' : 'bg-system-neon/20 text-system-neon border border-system-neon/50'
          } hover:scale-105 active:scale-95`}
        >
          {isActive ? <><Pause size={20} /> Pause</> : <><Play size={20} /> Engage</>}
        </button>
        <button
          onClick={resetTimer}
          className="p-3 rounded-md border border-white/10 hover:bg-white/5 transition-all"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Progress Ring Background */}
      <div className="absolute -z-10 w-full h-full opacity-10 flex items-center justify-center">
         <div className={`w-64 h-64 border-4 rounded-full border-dashed animate-spin-slow ${mode === 'focus' ? 'border-system-neon' : 'border-system-purple'}`} />
      </div>
    </div>
  );
}
