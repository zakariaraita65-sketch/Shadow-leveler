import { useState, useRef, useEffect } from "react";
import { motion, useAnimation } from "motion/react";
import { Shield, LayoutDashboard, Swords, Sparkles, Clock, ShoppingBag, Fingerprint } from "lucide-react";
import { signInWithFingerprint } from "../firebase";

interface LoginProps {
  onLoginProgress: (progress: boolean) => void;
}

export default function Login({ onLoginProgress }: LoginProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPressing, setIsPressing] = useState(false);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const controls = useAnimation();

  const handleLogin = async () => {
    try {
      setError(null);
      onLoginProgress(true);
      await signInWithFingerprint();
    } catch (err: any) {
      console.error("Login failed", err);
      if (err?.code === 'auth/operation-not-allowed') {
        setError("AUTH_REJECTED: Anonymous sign-in is disabled. Please enable 'Anonymous' in your Firebase Authentication Console to use the fingerprint scanner.");
      } else {
        setError(err.message || "Authentication failed.");
      }
      onLoginProgress(false);
    }
  };

  const startPress = () => {
    setIsPressing(true);
    setError(null);
    controls.start({
      scale: 1.1,
      filter: "brightness(1.5)",
      transition: { duration: 1.5, ease: "linear" }
    });
    
    pressTimer.current = setTimeout(() => {
      handleLogin();
      setIsPressing(false);
    }, 1500); // 1.5s hold to login
  };

  const cancelPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    setIsPressing(false);
    controls.start({
      scale: 1,
      filter: "brightness(1)",
      transition: { duration: 0.3 }
    });
  };

  // Clean up timer
  useEffect(() => {
    return () => {
      if (pressTimer.current) clearTimeout(pressTimer.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-system-bg flex flex-col items-center justify-center p-6 text-center relative overflow-hidden select-none">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-system-neon/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-system-purple/10 rounded-full blur-[120px] animate-pulse delay-700 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 flex flex-col items-center gap-8 max-w-md w-full"
      >
        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono text-system-neon tracking-[0.4em] uppercase font-bold">System Access Point</span>
          <h1 className="text-5xl font-display font-black italic tracking-tighter text-white">SHADOW LEVELER</h1>
          <p className="text-white/40 font-mono text-sm uppercase tracking-widest mt-2 italic px-4">
            "Only those who prove their will to level up shall pass."
          </p>
        </div>

        <div className="flex flex-col items-center gap-8 w-full mt-12 relative">
          
          {/* Fingerprint Scanner Ring */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            {isPressing && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 bg-system-neon rounded-full"
              />
            )}
            
            <motion.div
              animate={isPressing ? { rotate: 180 } : { rotate: 0 }}
              transition={{ duration: 1.5, ease: "linear" }}
              className={`absolute -inset-4 border-2 border-dashed rounded-full ${isPressing ? 'border-system-neon' : 'border-system-neon/30'}`}
            />
            
            <motion.button
              animate={controls}
              onMouseDown={startPress}
              onMouseUp={cancelPress}
              onMouseLeave={cancelPress}
              onTouchStart={startPress}
              onTouchEnd={cancelPress}
              className={`w-32 h-32 rounded-full system-border flex flex-col items-center justify-center transition-colors duration-300 relative z-10 ${
                isPressing ? 'bg-system-neon/20 shadow-[0_0_50px_rgba(34,211,238,0.5)] border-system-neon' : 'bg-system-card text-system-neon/50'
              }`}
            >
              <Fingerprint size={64} className={isPressing ? 'text-system-neon animate-pulse' : ''} />
            </motion.button>
          </div>

          <p className="text-xs font-mono text-white/50 uppercase tracking-[0.3em] h-4">
             {isPressing ? "SCANNING BIOMETRICS..." : "HOLD TO AUTHENTICATE"}
          </p>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-system-danger/10 border border-system-danger/20 rounded-lg text-system-danger text-xs font-mono w-full max-w-sm mt-4 text-left"
            >
              <p className="font-bold mb-1">ACCESS DENIED</p>
              <p className="text-system-danger/80 break-words">{error}</p>
            </motion.div>
          )}

        </div>

        <div className="mt-16 text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] max-w-[250px]">
           Encrypted connection established. Player data synchronized via biometric signature.
        </div>
      </motion.div>
    </div>
  );
}
