import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quest } from '../types';
import { Zap, Trees, Waves, AlertTriangle, Coins, Star, Flame, Camera, Upload, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import SystemLogo from './SystemLogo';
import { GoogleGenAI } from "@google/genai";

interface PortalInterfaceProps {
  quest: Quest;
  onClose: () => void;
  onComplete: () => void;
  portalType: 'cave' | 'forest' | 'sea' | 'lava';
}

export default function PortalInterface({ quest, onClose, onComplete, portalType }: PortalInterfaceProps) {
  const [verificationImage, setVerificationImage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const portalThemes = {
    cave: {
      bg: 'bg-stone-950',
      image: 'https://images.unsplash.com/photo-1505144808421-19ad0396f9ad?auto=format&fit=crop&w=1920&q=80',
      icon: <Zap size={100} className="text-yellow-500 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]" />,
      accent: 'text-yellow-500',
      border: 'border-yellow-500/30',
      label: 'Shadow Cave',
      particleColor: 'bg-yellow-500/20'
    },
    forest: {
      bg: 'bg-green-950',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=80',
      icon: <Trees size={100} className="text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]" />,
      accent: 'text-emerald-400',
      border: 'border-emerald-500/30',
      label: 'Eternal Forest',
      particleColor: 'bg-emerald-500/20'
    },
    sea: {
      bg: 'bg-blue-950',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80',
      icon: <Waves size={100} className="text-blue-400 drop-shadow-[0_0_20px_rgba(96,165,250,0.5)]" />,
      accent: 'text-blue-400',
      border: 'border-blue-500/30',
      label: 'Deep Sea Abyss',
      particleColor: 'bg-blue-400/20'
    },
    lava: {
      bg: 'bg-red-950',
      image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1920&q=80',
      icon: <Flame size={100} className="text-orange-600 drop-shadow-[0_0_20px_rgba(234,88,12,0.5)]" />,
      accent: 'text-orange-500',
      border: 'border-orange-500/30',
      label: 'Lava Domain',
      particleColor: 'bg-orange-500/30'
    }
  };

  const theme = portalThemes[portalType] || portalThemes.cave;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVerificationImage(reader.result as string);
        setVerificationError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const verifyWithAI = async () => {
    if (!verificationImage) return;
    
    setIsVerifying(true);
    setVerificationError(null);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("A.I. Key missing.");
      const ai = new GoogleGenAI({ apiKey });
      
      const base64Data = verificationImage.split(',')[1];
      const mimeType = verificationImage.split(';')[0].split(':')[1];
      
      const prompt = `
        Analyze this image to verify completion of the objective: "${quest.title} - ${quest.description}".
        The hunter is providing this as proof. 
        Determine if the image represents a valid effort or evidence of the task being attempted or done.
        Response JSON format: { "verified": boolean, "feedback": "short text" }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            }
          ]
        },
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text || '';
      const match = text.match(/\{.*\}/s);
      const data = match ? JSON.parse(match[0]) : { verified: true, feedback: "Evidence received." };

      if (data.verified) {
        setIsVerified(true);
      } else {
        setVerificationError(data.feedback || "The System rejects this evidence. Try a clearer proof.");
      }
    } catch (error) {
      console.error("AI Error:", error);
      setIsVerified(true); 
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[100] ${theme.bg} text-white flex flex-col items-center justify-center overflow-hidden`}
    >
        {/* Background Image with Ken Burns Effect */}
        <motion.div 
          initial={{ scale: 1.3, opacity: 0, x: -50, y: -50 }}
          animate={{ scale: 1, opacity: 0.6, x: 0, y: 0 }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          className="absolute inset-0 z-0"
        >
          <img 
            src={theme.image} 
            alt="portal background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </motion.div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: "110%", 
                opacity: 0,
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{ 
                y: "-10%", 
                opacity: [0, 1, 0],
                x: (Math.random() * 100 - 50) + "%"
              }}
              transition={{ 
                duration: Math.random() * 10 + 10, 
                repeat: Infinity, 
                delay: Math.random() * 15,
                ease: "linear"
              }}
              className={`absolute w-2 h-2 rounded-full blur-[1px] ${theme.particleColor}`}
            />
          ))}
        </div>

        {/* Scratches/Carbon overlay for depth */}
        <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] z-10" />
        
        <div className="max-w-3xl w-full text-center relative z-20 px-6">
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="mb-2"
            >
                <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <SystemLogo size={14} color={theme.accent.includes('yellow') ? '#eab308' : theme.accent.includes('emerald') ? '#10b981' : theme.accent.includes('blue') ? '#3b82f6' : '#ea580c'} />
                    </motion.div>
                    <span className={`text-[10px] uppercase tracking-[0.3em] font-black font-mono`}>
                        Dimensional Instance Found
                    </span>
                </div>
                
                <h1 className="text-5xl md:text-8xl font-display font-black mb-8 tracking-tighter italic drop-shadow-2xl">
                    {theme.label}
                </h1>
            </motion.div>

            <motion.div
                initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.8 }}
                className="mb-12 relative flex justify-center"
            >
                <motion.div 
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="absolute inset-0 blur-3xl opacity-30 bg-white rounded-full scale-150" 
                />
                <div className="relative z-10">
                  {theme.icon}
                </div>
            </motion.div>
            
            <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className={`bg-black/40 backdrop-blur-2xl p-8 rounded-[2rem] border ${theme.border} shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group`}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-white/20" />
                    <span className="text-xs font-black tracking-[0.3em] uppercase opacity-60 font-mono">Current Objective</span>
                    <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-white/20" />
                </div>

                <h2 className="text-3xl md:text-5xl font-display font-black mb-6 tracking-tight">{quest.title}</h2>
                <p className="text-lg text-white/70 mb-10 leading-relaxed font-medium max-w-xl mx-auto">
                    {quest.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-10">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center"
                    >
                        <div className="flex items-center gap-2 text-yellow-500 mb-1">
                            <Coins size={16} />
                            <span className="text-[10px] font-black uppercase tracking-tighter">Gold Bounty</span>
                        </div>
                        <span className="text-3xl font-display font-black">+{quest.gold}</span>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center"
                    >
                        <div className="flex items-center gap-2 text-blue-400 mb-1">
                            <Star size={16} />
                            <span className="text-[10px] font-black uppercase tracking-tighter">Experience</span>
                        </div>
                        <span className="text-3xl font-display font-black">+900</span>
                    </motion.div>
                </div>

                {!isVerified ? (
                  <div className="mb-8 space-y-4">
                    <div className="flex flex-col items-center gap-4 p-6 bg-white/5 border border-dashed border-white/20 rounded-2xl">
                       {verificationImage ? (
                         <div className="relative w-full aspect-video rounded-xl overflow-hidden group">
                           <img src={verificationImage} alt="proof" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                             <button 
                               onClick={() => setVerificationImage(null)}
                               className="px-4 py-2 bg-red-500 rounded-lg text-xs font-bold uppercase"
                             >
                               Remove Evidence
                             </button>
                           </div>
                         </div>
                       ) : (
                         <div className="flex flex-col items-center gap-2 text-white/40">
                           <Camera size={40} className="mb-2" />
                           <span className="text-sm font-bold uppercase tracking-widest">Awaiting Photographic Proof</span>
                           <span className="text-[10px] opacity-60">Visual evidence required for XP extraction</span>
                         </div>
                       )}

                       <input 
                         type="file" 
                         accept="image/*" 
                         className="hidden" 
                         ref={fileInputRef} 
                         onChange={handleImageUpload} 
                       />

                       {!verificationImage ? (
                         <motion.button
                           whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                           whileTap={{ scale: 0.98 }}
                           onClick={() => fileInputRef.current?.click()}
                           className="w-full py-4 border border-white/20 rounded-xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-sm"
                         >
                           <Upload size={18} />
                           Upload Proof
                         </motion.button>
                       ) : !isVerifying ? (
                         <motion.button
                           whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${theme.accent.replace('text-', '')}` }}
                           whileTap={{ scale: 0.95 }}
                           onClick={verifyWithAI}
                           className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-xl`}
                           style={{ backgroundColor: theme.accent.includes('yellow') ? '#eab308' : theme.accent.includes('emerald') ? '#10b981' : theme.accent.includes('blue') ? '#3b82f6' : '#ea580c', color: 'black' }}
                         >
                           <Sparkles size={18} />
                           Verify with Matrix
                         </motion.button>
                       ) : (
                         <div className="w-full py-4 bg-white/10 rounded-xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-sm">
                           <Loader2 size={18} className="animate-spin" />
                           Analyzing...
                         </div>
                       )}
                    </div>
                    {verificationError && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-[10px] font-bold uppercase font-mono bg-red-400/10 p-2 rounded border border-red-400/20"
                      >
                        {verificationError}
                      </motion.p>
                    )}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-8 p-6 bg-green-500/20 border border-green-500/40 rounded-2xl flex flex-col items-center gap-2"
                  >
                     <CheckCircle2 size={40} className="text-green-400" />
                     <span className="text-sm font-black text-green-400 uppercase tracking-[0.2em]">Evidence Authenticated</span>
                     <span className="text-[10px] text-green-400/100 uppercase font-mono">Matrix Sync Complete. Portal Stabilizing.</span>
                  </motion.div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                    <motion.button 
                      whileHover={isVerified ? { scale: 1.05, boxShadow: `0 0 30px ${theme.accent.replace('text-', '')}` } : {}}
                      whileTap={isVerified ? { scale: 0.95 } : {}}
                      onClick={onComplete}
                      disabled={!isVerified}
                      className={`flex-1 ${isVerified ? 'bg-white text-black hover:bg-white/90' : 'bg-white/5 text-white/20 border border-white/10 grayscale cursor-not-allowed'} px-8 py-4 rounded-2xl transition-all font-black uppercase tracking-widest text-lg flex items-center justify-center gap-3 shadow-xl`}
                    >
                        ESTABLISH VICTORY
                    </motion.button>
                    <motion.button 
                      whileHover={{ bg: 'rgba(255,255,255,0.1)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onClose}
                      className="flex-1 bg-white/5 border border-white/10 text-white/50 px-8 py-4 rounded-2xl transition-all font-bold uppercase tracking-widest text-sm"
                    >
                        Return to Reality
                    </motion.button>
                </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 2 }}
               className="mt-8 flex items-center justify-center gap-4 opacity-40 hover:opacity-100 transition-opacity"
            >
                <div className="h-px w-8 bg-white/30" />
                <AlertTriangle size={14} className="text-red-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Temporal Warning: Progress only saves on victory</span>
                <div className="h-px w-8 bg-white/30" />
            </motion.div>
        </div>
    </motion.div>
  );
}

