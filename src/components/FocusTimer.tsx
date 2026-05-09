import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Timer, Play, Pause, RotateCcw, Target, Volume2, VolumeX } from "lucide-react";

const AMBIENT_SOUNDS = [
  { id: 'drops', name: 'Water Drops', url: 'https://assets.mixkit.co/active_storage/sfx/2390/2390-preview.mp3' },
  { id: 'ocean', name: 'Ocean Waves', url: 'https://assets.mixkit.co/active_storage/sfx/1110/1110-preview.mp3' },
  { id: 'wind', name: 'Wind', url: 'https://assets.mixkit.co/active_storage/sfx/2418/2418-preview.mp3' },
  { id: 'thunder', name: 'Thunderstorm', url: 'https://assets.mixkit.co/active_storage/sfx/2413/2413-preview.mp3' },
  { id: 'cafe', name: 'Coffee Shop', url: 'https://assets.mixkit.co/active_storage/sfx/1199/1199-preview.mp3' },
];

interface FocusTimerProps {
  onFocusComplete: (minutes: number) => void;
  onStart?: (minutes: number) => void;
}

export default function FocusTimer({ onFocusComplete, onStart }: FocusTimerProps) {
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");

  const [selectedSound, setSelectedSound] = useState(AMBIENT_SOUNDS[0]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isActive && mode === 'focus' && isAudioEnabled) {
        audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isActive, mode, isAudioEnabled, selectedSound]);

  useEffect(() => {
    if (!isActive && mode === 'focus') {
      setTimeLeft(selectedDuration * 60);
    }
  }, [selectedDuration, isActive, mode]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (mode === "focus") {
        onFocusComplete(selectedDuration);
        setMode("break");
        setTimeLeft(5 * 60);
      } else {
        setMode("focus");
        setTimeLeft(selectedDuration * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, onFocusComplete, selectedDuration]);

  const toggleTimer = () => {
    if (!isActive && mode === 'focus') {
      onStart?.(selectedDuration);
    }
    setIsActive(!isActive);
  };
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === "focus" ? selectedDuration * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 system-border bg-system-card/50 backdrop-blur-md rounded-xl relative overflow-hidden group">
      {/* Hidden audio element */}
      <audio ref={audioRef} src={selectedSound.url} loop className="hidden" />

      <div className="flex flex-col items-center gap-2 z-10 w-full">
        <span className={`text-[10px] font-mono uppercase tracking-[0.3em] font-bold ${mode === 'focus' ? 'text-system-neon' : 'text-purple-400'}`}>
          {mode === "focus" ? "Active Hunt: Focus Mode" : "Rest Period: Mana Regeneration"}
        </span>
        
        {!isActive && mode === 'focus' && (
          <div className="flex gap-2 mt-2">
            {[25, 60, 90, 120].map(duration => (
              <button
                key={duration}
                onClick={() => setSelectedDuration(duration)}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors border ${
                  selectedDuration === duration 
                    ? 'bg-system-neon/20 border-system-neon text-system-neon' 
                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                }`}
              >
                {duration >= 60 ? (duration === 90 ? '1.5h' : `${duration/60}h`) : `${duration}m`}
              </button>
            ))}
          </div>
        )}

        <div className="text-7xl font-display font-black tracking-tighter italic neon-text tabular-nums mt-4">
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 z-10">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-md p-1 px-2">
          <button 
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className="text-white/50 hover:text-white transition-colors"
          >
            {isAudioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <select 
            value={selectedSound.id}
            onChange={(e) => {
              const sound = AMBIENT_SOUNDS.find(s => s.id === e.target.value);
              if (sound) setSelectedSound(sound);
            }}
            className="bg-transparent text-[10px] font-mono text-white uppercase outline-none"
          >
            {AMBIENT_SOUNDS.map(s => <option key={s.id} value={s.id} className="bg-system-bg text-white">{s.name}</option>)}
          </select>
        </div>

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
          className="p-3 rounded-md border border-white/10 hover:bg-white/5 transition-all text-white/70 hover:text-white"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Aurora Borealis Effect (Northern Lights) - Fluid Style */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 transition-opacity duration-1000">
        <div className="absolute inset-0 opacity-40 blur-[100px] transform-gpu">
           {/* Fluid Wave 1 (Main Cyan) */}
           <motion.div 
             animate={{ 
               x: isActive ? ['-20%', '10%', '-15%', '5%'] : '0%',
               y: isActive ? ['10%', '40%', '20%', '35%'] : '25%',
               scale: isActive ? [1, 1.2, 1.1, 1.3] : 1,
               rotate: isActive ? [-15, -10, -20, -15] : -15
             }}
             transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-0 left-[-20%] w-[140%] h-[40%] bg-gradient-to-r from-transparent via-system-neon/40 to-transparent rounded-[100%] mix-blend-screen"
           />
           
           {/* Fluid Wave 2 (Deep Blue/Grey) */}
           <motion.div 
             animate={{ 
               x: isActive ? ['10%', '-20%', '5%', '-10%'] : '0%',
               y: isActive ? ['30%', '10%', '25%', '15%'] : '20%',
               scale: isActive ? [1.1, 0.9, 1.2, 1] : 1,
               rotate: isActive ? [10, 20, 5, 15] : 15
             }}
             transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
             className="absolute top-0 left-[-20%] w-[140%] h-[35%] bg-gradient-to-r from-transparent via-cyan-900/30 to-transparent rounded-[100%] mix-blend-multiply"
           />

           {/* Fluid Wave 3 (Bright Highlights/White) */}
           <motion.div 
             animate={{ 
               x: isActive ? ['-5%', '15%', '-10%', '0%'] : '0%',
               y: isActive ? ['20%', '45%', '15%', '30%'] : '30%',
               opacity: isActive ? [0.3, 0.6, 0.4, 0.5] : 0.2
             }}
             transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 5 }}
             className="absolute top-0 left-[-20%] w-[140%] h-[20%] bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-[100%] rotate-[-5deg] mix-blend-overlay"
           />

           {/* Core Glow Center */}
           <motion.div 
             animate={{ 
               scale: isActive ? [1, 1.1, 1] : 1,
               opacity: isActive ? [0.2, 0.4, 0.2] : 0.1
             }}
             transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[40%] bg-system-neon/20 rounded-full blur-[120px]"
           />
        </div>
        
        {/* Ambient Bottom Gradient */}
        <div className={`absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-system-neon/15 via-transparent to-transparent transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-30'}`} />
      </div>
    </div>

  );
}
