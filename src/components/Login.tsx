import { useState } from "react";
import { motion } from "motion/react";
import { Shield, LayoutDashboard, Swords, Sparkles, Clock, ShoppingBag } from "lucide-react";
import { signInWithGoogle } from "../firebase";

interface LoginProps {
  onLoginProgress: (progress: boolean) => void;
}

export default function Login({ onLoginProgress }: LoginProps) {
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setError(null);
      onLoginProgress(true);
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Login failed", err);
      setError(err.message || "Authentication failed. If you are in an iframe, try opening the app in a new tab.");
      onLoginProgress(false);
    }
  };

  return (
    <div className="min-h-screen bg-system-bg flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-system-neon/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-system-purple/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="z-10 flex flex-col items-center gap-8 max-w-md w-full"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 border-2 border-dashed border-system-neon/30 rounded-full"
          />
          <div className="w-24 h-24 rounded-full bg-system-card system-border flex items-center justify-center text-system-neon shadow-2xl system-glow relative z-10">
            <Shield size={48} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono text-system-neon tracking-[0.4em] uppercase font-bold">System Access Point</span>
          <h1 className="text-5xl font-display font-black italic tracking-tighter text-white">SHADOW LEVELER</h1>
          <p className="text-white/40 font-mono text-sm uppercase tracking-widest mt-2 italic px-4">
            "Only those who prove their will to level up shall pass."
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full mt-4">
          <button
            onClick={handleLogin}
            className="group relative flex items-center justify-center gap-3 bg-white text-system-bg font-display font-black uppercase py-4 rounded-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-system-neon to-system-purple opacity-0 group-hover:opacity-10 transition-opacity" />
            <img src="https://www.gstatic.com/firebase/anonymous-scan.png" alt="G" className="w-6 h-6 grayscale brightness-0" />
            Sign in with Google
          </button>

          {error && (
            <div className="p-4 bg-system-danger/10 border border-system-danger/20 rounded-lg text-system-danger text-xs font-mono">
              <p>ERROR: {error}</p>
              <p className="mt-2 text-white/60">If this persists, click the 'Open in New Tab' button in the top right of the preview header to bypass iframe restrictions.</p>
            </div>
          )}

          {!error && (
            <p className="text-[10px] text-white/20 font-mono italic max-w-[280px] mx-auto">
              Tip: If the login popup doesn't appear, try opening this app in a new tab.
            </p>
          )}
          
          <div className="flex items-center justify-center gap-6 mt-4 opacity-30 grayscale transition-all hover:opacity-80 hover:grayscale-0">
             <LayoutDashboard size={20} />
             <Swords size={20} />
             <Sparkles size={20} />
             <Clock size={20} />
             <ShoppingBag size={20} />
          </div>
        </div>

        <div className="mt-12 text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] max-w-[200px]">
           Encrypted connection established. Player data will be synchronized with the academic matrix.
        </div>
      </motion.div>
    </div>
  );
}
