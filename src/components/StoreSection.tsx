import { motion } from "motion/react";
import { STORE_ITEMS, getCurrencyForTitle } from "../constants";
import * as LucideIcons from "lucide-react";
import SystemLogo from "./SystemLogo";

interface StoreSectionProps {
  gold: number;
  onBuy: (item: any) => void;
  activeTitle: string;
}

export default function StoreSection({ gold, onBuy, activeTitle }: StoreSectionProps) {
  const currency = getCurrencyForTitle(activeTitle);
  const CurrencyIcon = (LucideIcons as any)[currency.icon] || LucideIcons.Coins;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LucideIcons.ShoppingBag className="text-system-neon" />
          <h2 className="text-2xl font-display font-bold italic tracking-tight">System Store</h2>
        </div>
        <div className="flex items-center gap-4 px-4 py-2 bg-system-neon/5 border border-system-neon/20 rounded-lg">
          <div className="flex items-center gap-2">
            <CurrencyIcon className="text-system-neon" size={18} />
            <div className="flex flex-col">
              <span className="text-[8px] font-mono text-white/40 uppercase leading-none mb-1">{currency.name}</span>
              <span className="text-xl font-display font-bold text-system-neon neon-text leading-none">{gold}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {STORE_ITEMS.map((item) => {
          const Icon = (LucideIcons as any)[item.icon];
          const canAfford = gold >= item.cost;

          return (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              className={`p-6 rounded-xl system-border bg-system-card/40 backdrop-blur-sm relative overflow-hidden group border-opacity-20 ${
                canAfford ? "border-system-neon/40" : "border-white/10"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center border transition-all ${
                    canAfford ? "bg-system-neon/10 border-system-neon/30 text-system-neon" : "bg-white/5 border-white/10 text-white/30"
                  }`}>
                    {item.icon.toLowerCase().includes('shield') ? (
                      <SystemLogo size={28} color={canAfford ? "currentColor" : undefined} />
                    ) : (
                      <Icon size={28} />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-display font-bold text-xl">{item.name}</h3>
                    <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest">{item.type}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-white/50 leading-relaxed min-h-[40px] mb-6 italic">
                "{item.description}"
              </p>

              <button
                onClick={() => onBuy(item)}
                disabled={!canAfford}
                className={`w-full py-3 rounded-lg font-display font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                  canAfford 
                    ? "bg-system-neon/20 hover:bg-system-neon text-system-neon hover:text-system-bg border border-system-neon/50" 
                    : "bg-white/5 text-white/20 border border-white/10 cursor-not-allowed"
                }`}
              >
                {canAfford ? (
                  <>Exchange {item.cost} {currency.name}</>
                ) : (
                  <>Insufficient {currency.name} ({item.cost})</>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      
      <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-xl mt-4">
         <p className="text-xs text-blue-300 font-mono italic opacity-70">
           Note: Purchased buffs are applied immediately. Consumables are kept in your system inventory.
         </p>
      </div>
    </div>
  );
}
