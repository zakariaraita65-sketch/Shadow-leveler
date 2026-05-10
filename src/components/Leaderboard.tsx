import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Trophy, Medal, User, Crown, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { RANK_TITLES } from '../constants';

interface LeaderboardEntry {
  uid: string;
  displayName: string;
  level: number;
  rank: string;
  activeTitle?: string;
  photoURL?: string;
  hunterId?: string;
}

export const Leaderboard: React.FC = () => {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const playersRef = collection(db, 'users');
    const q = query(
      playersRef,
      where('isProfileComplete', '==', true),
      orderBy('level', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as LeaderboardEntry[];
      
      setLeaders(data);
      setLoading(false);
    }, (err) => {
      console.error("Leaderboard Snapshot Error:", err);
      setError("Failed to sync leaderboard data.");
      handleFirestoreError(err, OperationType.LIST, 'users');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading && leaders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-system-neon mb-4"></div>
        <p className="text-white/20 font-mono text-[10px] uppercase tracking-[0.2em]">Synchronizing Hunter Data...</p>
      </div>
    );
  }

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm flex flex-col max-h-[600px] shadow-2xl">
      <div className="bg-gradient-to-r from-system-neon/20 to-transparent p-6 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-system-neon/10 rounded-xl border border-system-neon/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <Trophy className="text-system-neon" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-white tracking-tight uppercase">Global Ranking</h2>
            <p className="text-xs text-white/40 font-mono tracking-wider italic">Only the strongest are etched into history</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono text-system-neon/50 uppercase tracking-tighter">Total Agents Observed</span>
          <p className="text-xl font-display font-black italic text-white leading-none">{leaders.length}</p>
        </div>
      </div>

      <div className="p-2 overflow-y-auto flex-1 custom-scrollbar">
        {error ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-red-400/60">
            <AlertCircle size={48} className="mb-4" />
            <p className="font-mono text-sm tracking-widest uppercase">Encryption Error Detected</p>
            <p className="text-[10px] italic mt-2">{error}</p>
          </div>
        ) : leaders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-white/20">
            <User size={48} className="mb-4 opacity-10" />
            <p className="font-mono text-sm tracking-widest uppercase">No verified hunters found.</p>
            <p className="text-[10px] italic mt-2">Complete your profile (Name, Age, Height, Weight) to join the global database.</p>
          </div>
        ) : (
          leaders.map((leader, index) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              key={leader.uid}
              className={`flex items-center gap-4 p-4 rounded-xl mb-1 transition-all group relative overflow-hidden backdrop-blur-md ${
                index === 0 ? 'bg-system-neon/10 border border-system-neon/30' : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              {index === 0 && (
                <div className="absolute top-0 right-0 p-1 opacity-10">
                  <Crown size={64} className="text-system-neon rotate-12" />
                </div>
              )}
              
              <div className="w-8 flex justify-center font-mono font-black italic text-sm">
                {index === 0 ? (
                  <Crown className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" size={22} />
                ) : (
                  <span className={index < 3 ? "text-white" : "text-white/40"}>{index + 1}</span>
                )}
              </div>

              <div className="relative shrink-0">
                {leader.photoURL ? (
                  <img src={leader.photoURL} alt="" className="w-12 h-12 rounded-full border border-white/20 object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                    <User className="text-white/40" size={20} />
                  </div>
                )}
                {index < 3 && (
                  <div className="absolute -top-1 -right-1 bg-black border border-white/20 rounded-full p-0.5 shadow-lg">
                    <Medal size={12} className={index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : 'text-orange-400'} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white group-hover:text-system-neon transition-colors truncate">
                    {leader.displayName || 'ANONYMOUS HUNTER'}
                  </span>
                  {(leader.hunterId === 'GYKPZWT5' || leader.hunterId === '#GYKPZWT5' || leader.uid === '5BN892FX' || leader.uid === 'zakariaraita65@gmail.com') && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="shrink-0 flex items-center gap-1"
                    >
                      <Crown size={14} className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] fill-yellow-400" />
                      {leader.uid === 'zakariaraita65@gmail.com' && (
                        <span className="text-[10px] font-black text-system-neon bg-system-neon/10 px-1.5 py-0.5 rounded border border-system-neon/30 animate-pulse">
                          SYSTEM ARCHITECT
                        </span>
                      )}
                    </motion.div>
                  )}
                  <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-black bg-white/10 text-white/60 border border-white/10">
                    LVL {leader.level}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-mono text-system-neon font-black tracking-widest uppercase truncate">
                    {RANK_TITLES[leader.rank as keyof typeof RANK_TITLES] || leader.rank || "RANK UNKNOWN"}
                  </span>
                  {leader.activeTitle && (
                     <>
                      <span className="text-white/20 text-[10px]">•</span>
                      <span className="text-[10px] font-medium text-white/40 italic truncate">
                        [{leader.activeTitle}]
                      </span>
                     </>
                  )}
                </div>
              </div>

              {index === 0 && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-system-neon to-transparent" />
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

