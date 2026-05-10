import { useState, useRef, useEffect } from "react";
import { motion, useAnimation } from "motion/react";
import { LayoutDashboard, Swords, Sparkles, Clock, ShoppingBag, Fingerprint } from "lucide-react";
import { signInWithFingerprint, signInWithGoogle, loginWithId, registerWithId } from "../firebase";
import SystemLogo from "./SystemLogo";
import { KeyRound, User as UserIcon, LogIn, UserPlus } from "lucide-react";

interface LoginProps {
  onLoginProgress: (progress: boolean) => void;
}

export default function Login({ onLoginProgress }: LoginProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPressing, setIsPressing] = useState(false);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const controls = useAnimation();

  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [hunterId, setHunterId] = useState("");
  const [hunterPass, setHunterPass] = useState("");

  const handleManualAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hunterId || !hunterPass) return;

    // Validate ID: no spaces, only alphanumeric and basic symbols
    if (hunterId.includes(" ")) {
      setError("ID_INVALID: Hunter ID cannot contain spaces.");
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      if (isRegistering) {
        await registerWithId(hunterId, hunterPass);
      } else {
        await loginWithId(hunterId, hunterPass);
      }
    } catch (err: any) {
      console.error("Manual Auth failed", err);
      let message = "Authentication failed.";
      if (err.code === 'auth/user-not-found') message = "ID_NOT_FOUND: This Hunter ID does not exist. / هذا الرقم غير موجود";
      if (err.code === 'auth/wrong-password') message = "PASS_INCORRECT: Matrix signature mismatch. / كلمة السر خاطئة";
      if (err.code === 'auth/email-already-in-use') message = "ID_TAKEN: This ID is already claimed. / هذا الرقم محجوز";
      if (err.code === 'auth/weak-password') message = "WEAK_PASS: Security requires 6+ chars. / كلمة السر ضعيفة";
      if (err.code === 'auth/operation-not-allowed') message = "SYSTEM_ERROR: ID Login is disabled in Matrix core. / النظام اليدوي معطل حالياً";
      setError(message);
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await signInWithFingerprint();
    } catch (err: any) {
      console.error("Login failed", err);
      if (err?.code === 'auth/operation-not-allowed') {
        setError("AUTH_REJECTED: Please enable 'Anonymous' Sign-In Provider in your Firebase Console (Authentication > Sign-in method) to use the Biometric Scanner, or use Google Login below.");
      } else {
        setError(err.message || "Authentication failed.");
      }
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Google Login failed", err);
      setError(err.message || "Google Authentication failed.");
      setIsLoading(false);
    }
  };

  const startPress = () => {
    if (isLoading) return;
    
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

  if (!showScanner) {
    return (
      <div className="min-h-screen bg-system-bg flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-system-neon/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-system-purple/5 rounded-full blur-[120px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-10 flex flex-col items-center gap-10 max-w-lg w-full"
        >
           <div className="flex flex-col gap-4">
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }} 
                transition={{ duration: 4, repeat: Infinity }}
                className="w-24 h-24 rounded-full bg-system-neon/10 border border-system-neon/30 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,211,238,0.2)]"
              >
                <SystemLogo color="#00f2ff" size={64} />
              </motion.div>
              <div className="flex flex-col gap-1 mt-4">
                <span className="text-xs font-mono text-system-neon tracking-[0.5em] uppercase font-bold">Protocol: Void</span>
                <h1 className="text-5xl md:text-6xl font-display font-black italic tracking-tighter text-white">SHADOW LEVELER</h1>
                <p className="text-white/30 font-mono text-sm uppercase tracking-widest mt-2 italic">
                   Master your academic destiny. Break the matrix.
                </p>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4 w-full text-left">
              <LandingCard icon={<Clock size={16}/>} title="Focus" desc="Enter the chamber and earn mana." />
              <LandingCard icon={<Swords size={16}/>} title="Missions" desc="Complete tasks to level up." />
              <LandingCard icon={<Sparkles size={16}/>} title="Skills" desc="Unlock new abilities and buffs." />
              <LandingCard icon={<LayoutDashboard size={16}/>} title="Rank" desc="Rise through the hunter ranks." />
           </div>

           <div className="flex flex-col gap-4 w-full">
              <button 
                onClick={() => {
                  setShowScanner(true);
                  setIsManual(false);
                }}
                className="w-full py-4 bg-system-neon text-black font-display font-black italic tracking-widest text-lg rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)]"
              >
                INITIALIZE SYSTEM / بدء النظام
              </button>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleGoogleLogin}
                  className="flex-1 py-3 border border-white/10 text-white/50 font-mono text-xs tracking-widest uppercase hover:bg-white/5 transition-colors rounded-xl flex items-center justify-center gap-2"
                >
                  Google
                </button>
                <button 
                  onClick={() => {
                    setShowScanner(true);
                    setIsManual(true);
                  }}
                  className="flex-1 py-3 border border-white/10 text-white/50 font-mono text-xs tracking-widest uppercase hover:bg-white/5 transition-colors rounded-xl flex items-center justify-center gap-2"
                >
                  Hunter ID
                </button>
              </div>
           </div>
           
           <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
              Version 1.4.2 [Production Build]
           </span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-system-bg flex flex-col items-center justify-center p-6 text-center relative overflow-hidden select-none">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-system-neon/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-system-purple/10 rounded-full blur-[120px] animate-pulse delay-700 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="z-10 flex flex-col items-center gap-8 max-w-md w-full"
      >
        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono text-system-neon tracking-[0.4em] uppercase font-bold">System Access Point</span>
          <h1 className="text-5xl font-display font-black italic tracking-tighter text-white uppercase">Biometric Link</h1>
          <p className="text-white/40 font-mono text-sm uppercase tracking-widest mt-2 italic px-4">
            "Only those who prove their will to level up shall pass."
          </p>
        </div>

        <div className="flex flex-col items-center gap-8 w-full mt-12 relative">
          
          {isManual ? (
            <form onSubmit={handleManualAuth} className="w-full max-w-sm flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2 text-left">
                  <label className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em]">Hunter ID / الرقم التعريفي</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-system-neon/50" size={16} />
                    <input 
                      type="text"
                      required
                      value={hunterId}
                      onChange={(e) => setHunterId(e.target.value)}
                      placeholder="Username or ID"
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-system-neon outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-left">
                  <label className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em]">Matrix Password / كلمة السر</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-system-neon/50" size={16} />
                    <input 
                      type="password"
                      required
                      value={hunterPass}
                      onChange={(e) => setHunterPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-system-neon outline-none transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-system-neon text-black font-display font-black italic tracking-widest text-lg rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] disabled:opacity-50 flex items-center justify-center gap-2 uppercase"
              >
                {isLoading ? "Synchronizing..." : isRegistering ? "Confirm Registration" : "Enter the System"}
                {isRegistering ? <UserPlus size={20} /> : <LogIn size={20} />}
              </button>

              <button 
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-[10px] font-mono text-system-neon/70 uppercase tracking-[0.2em] hover:text-system-neon"
              >
                {isRegistering ? "Already have a matrix signature? Log In" : "New Hunter? Register Signature"}
              </button>
            </form>
          ) : (
            <>
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
                  onContextMenu={(e) => e.preventDefault()}
                  className={`w-32 h-32 rounded-full select-none touch-none system-border flex flex-col items-center justify-center transition-colors duration-300 relative z-10 ${
                    isPressing ? 'bg-system-neon/20 shadow-[0_0_50px_rgba(34,211,238,0.5)] border-system-neon' : 'bg-system-card'
                  }`}
                >
                  <SystemLogo color="#00f2ff" size={64} glow={isPressing} />
                </motion.button>
              </div>

              <p className="text-xs font-mono text-white/50 uppercase tracking-[0.3em] h-4">
                 {isLoading ? "AUTHENTICATING..." : isPressing ? "SCANNING BIOMETRICS..." : "HOLD TO AUTHENTICATE / اضغط باستمرار"}
              </p>
            </>
          )}

          <div className="flex flex-col gap-2 w-full max-w-[280px]">
              {!isManual && (
                <button 
                  onClick={() => setIsManual(true)}
                  className="w-full px-6 py-3 bg-white/5 hover:bg-white/10 system-border rounded-lg text-xs font-mono tracking-widest text-white/80 transition-all uppercase flex items-center justify-center gap-2"
                >
                  Manual Access / دخول يدوي
                </button>
              )}
              
              <button 
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full px-6 py-3 bg-white/5 hover:bg-white/10 system-border rounded-lg text-xs font-mono tracking-widest text-white/80 transition-all uppercase flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Standard Login / Google
              </button>
              
              <button 
                onClick={() => {
                  if (isManual) {
                    setIsManual(false);
                  } else {
                    setShowScanner(false);
                  }
                }}
                className="w-full text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] hover:text-white transition-colors py-2"
              >
                Back / العودة
              </button>
          </div>

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

        <div className="mt-12 text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] max-w-[250px]">
           Encrypted connection established. Player data synchronized via biometric signature.
        </div>
      </motion.div>
    </div>
  );
}

function LandingCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex flex-col gap-1">
      <div className="flex items-center gap-2 text-system-neon">
         {icon}
         <span className="text-[10px] font-bold uppercase tracking-wider">{title}</span>
      </div>
      <p className="text-[9px] text-white/40 leading-tight uppercase font-mono">{desc}</p>
    </div>
  );
}
