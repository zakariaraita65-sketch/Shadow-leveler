import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState, ReactNode } from "react";

interface SystemMessageProps {
  message: string;
  type?: "info" | "success" | "warning" | "danger";
  onClose: () => void;
  onClick?: () => void;
  key?: any;
}

export default function SystemMessage({ message, type = "info", onClose, onClick }: SystemMessageProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 500);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    info: "text-system-neon border-system-neon/50 bg-system-neon/10",
    success: "text-green-400 border-green-500/50 bg-green-500/10",
    warning: "text-yellow-400 border-yellow-500/50 bg-yellow-500/10",
    danger: "text-system-danger border-system-danger/50 bg-system-danger/10",
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.8, x: 20, filter: "blur(5px)" }}
          onClick={() => {
            if (onClick) {
              onClick();
              setVisible(false);
              setTimeout(onClose, 500);
            }
          }}
          className={`pointer-events-auto relative w-full px-6 py-4 border-l-4 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl ${colors[type]} ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-95 ring-2 ring-white/20' : ''} transition-all duration-300`}
        >
          {type === 'warning' && (
            <motion.div 
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="absolute inset-0 bg-white rounded-xl pointer-events-none"
            />
          )}
          
          <div className="flex flex-col gap-1 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.3em] font-black opacity-50">
                Matrix Protocol: {type}
              </span>
              {onClick && (
                <span className="text-[8px] px-2 py-0.5 rounded-full bg-white/10 font-bold animate-pulse">
                  ACTION REQUIRED
                </span>
              )}
            </div>
            <div className={`text-lg font-display font-black tracking-wide italic uppercase ${type === 'warning' ? 'animate-pulse' : ''}`}>
              {message}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className={`absolute bottom-0 left-0 h-1 bg-current transition-all duration-[4300ms] w-0 animate-[progress_4.3s_linear] opacity-30`} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
