import { useState } from "react";
import React from "react";
import { motion } from "motion/react";
import { User, Shield, UserCircle, Users, Calendar, ArrowLeft, Sparkles } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

interface OnboardingProps {
  user: any;
  onComplete: (data: { 
    displayName: string; 
    gender: "male" | "female"; 
    age: number;
    height?: number;
    weight?: number;
    bloodType?: string;
    ultimateGoal?: string;
  }) => void;
}

export default function Onboarding({ user, onComplete }: OnboardingProps) {
  const [formData, setFormData] = useState({
    displayName: user.displayName || "",
    gender: "male" as "male" | "female",
    age: 18,
    height: 170,
    weight: 70,
    bloodType: "A",
    ultimateGoal: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.displayName && formData.age > 0) {
      onComplete(formData);
    }
  };

  return (
    <div className="min-h-screen bg-system-bg flex items-center justify-center p-6 text-white relative overflow-hidden">
      {/* Anime-style background effects */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-system-neon/20 rounded-full animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-system-neon/10 rounded-full animate-spin-slow" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full bg-system-card system-border p-8 rounded-2xl relative z-10"
      >
        <div className="flex flex-col items-center gap-4 mb-10 pt-4">
          <div className="w-16 h-16 rounded-full bg-system-neon/20 flex items-center justify-center text-system-neon system-glow mb-2">
            <Shield size={32} />
          </div>
          <span className="text-[10px] font-mono text-system-neon tracking-[0.4em] uppercase font-bold text-center">New Hunter Detected</span>
          <h2 className="text-3xl font-display font-black italic tracking-tighter text-center uppercase">Initialize Profile</h2>
          <p className="text-white/40 text-xs font-mono uppercase tracking-widest text-center">"Provide your core attributes to synchronize with the System Matrix."</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex justify-start border-b border-white/5 pb-4 mb-2">
            <button 
               type="button"
               onClick={() => signOut(auth)}
               className="text-white/50 hover:text-system-neon flex items-center gap-2 text-xs font-mono uppercase transition-colors"
            >
              <ArrowLeft size={14} /> Go Back (Sign Out)
            </button>
          </div>

          {/* Display Name */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-widest">
              <UserCircle size={14} className="text-system-neon" /> Hunter Name
            </label>
            <input
              type="text"
              required
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 focus:border-system-neon focus:ring-1 focus:ring-system-neon outline-none transition-all font-display text-lg"
              placeholder="Enter your name..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gender */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-widest">
                <Users size={14} className="text-system-neon" /> Gender
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: "male" })}
                  className={`flex-1 py-3 rounded-lg font-display font-bold transition-all border ${
                    formData.gender === "male"
                      ? "bg-system-neon/20 border-system-neon text-system-neon"
                      : "bg-white/5 border-white/10 text-white/40"
                  }`}
                >
                  MALE
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: "female" })}
                  className={`flex-1 py-3 rounded-lg font-display font-bold transition-all border ${
                    formData.gender === "female"
                      ? "bg-system-neon/20 border-system-neon text-system-neon"
                      : "bg-white/5 border-white/10 text-white/40"
                  }`}
                >
                  FEMALE
                </button>
              </div>
            </div>

            {/* Age */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-widest">
                <Calendar size={14} className="text-system-neon" /> Hunter Age
              </label>
              <input
                type="number"
                required
                min="1"
                max="120"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 focus:border-system-neon focus:ring-1 focus:ring-system-neon outline-none transition-all font-display text-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Height (cm)</label>
                <input 
                  type="number" 
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 focus:border-system-neon outline-none"
                />
             </div>
             <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Weight (kg)</label>
                <input 
                  type="number" 
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 focus:border-system-neon outline-none"
                />
             </div>
             <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Blood Type</label>
                <select 
                  value={formData.bloodType}
                  onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 focus:border-system-neon outline-none text-white/80"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
             </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-widest">
              <Sparkles size={14} className="text-system-neon" /> Ultimate Goal
            </label>
            <textarea
              required
              value={formData.ultimateGoal}
              onChange={(e) => setFormData({ ...formData, ultimateGoal: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 focus:border-system-neon focus:ring-1 focus:ring-system-neon outline-none transition-all font-display text-base min-h-[100px]"
              placeholder="What is your ultimate goal?"
            />
          </div>

          <button
            type="submit"
            className="mt-6 w-full py-4 bg-system-neon text-system-bg font-display font-black uppercase rounded-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl system-glow"
          >
            Synchronize with Matrix
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-[9px] font-mono text-white/20 uppercase tracking-[0.2em] text-center">
          Warning: Once synchronized, these core attributes define your initial character branch in the Shadow Matrix.
        </div>
      </motion.div>
    </div>
  );
}
