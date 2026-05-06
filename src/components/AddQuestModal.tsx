import React, { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { SUBJECTS } from "../constants";

interface AddQuestModalProps {
  onClose: () => void;
  onAdd: (quest: any) => void;
}

export default function AddQuestModal({ onClose, onAdd }: AddQuestModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 2); // Default to 2 hours from now
    return d.toISOString().slice(0, 16);
  });
  const [type, setType] = useState<"daily" | "main">("daily");
  const [category, setCategory] = useState(SUBJECTS[0].id);

  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(true);
      return;
    }

    let finalDueDate;
    try {
      if (!dueDate) throw new Error("Empty date");
      finalDueDate = new Date(dueDate).toISOString();
    } catch (err) {
      const d = new Date();
      d.setHours(d.getHours() + 2);
      finalDueDate = d.toISOString();
    }

    const questPayload: any = {
      title: title.trim(),
      type,
      category,
      expReward: type === "daily" ? 150 : 500,
      dueDate: finalDueDate,
    };
    if (description.trim()) {
      questPayload.description = description.trim();
    }

    onAdd(questPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-system-bg/90 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-system-card system-border rounded-xl shadow-2xl overflow-hidden p-8">
         <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white">
            <X size={20} />
         </button>

         <div className="flex flex-col gap-6">
            <div>
               <span className="text-[10px] font-mono text-system-neon tracking-[0.3em] uppercase">Registrar</span>
               <h2 className="text-2xl font-display font-bold italic tracking-tight">Add New Mission</h2>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
               <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-mono text-white/40 uppercase">Mission Name</label>
                  <input
                     autoFocus
                     value={title}
                     onChange={(e) => {
                       setTitle(e.target.value);
                       if (e.target.value.trim()) setError(false);
                     }}
                     className={`bg-white/5 border rounded-md px-4 py-3 outline-none focus:border-system-neon/50 text-lg transition-all ${
                       error ? "border-system-danger" : "border-white/10"
                     }`}
                     placeholder="Study 3 Chapters of..."
                  />
                  {error && <span className="text-[10px] text-system-danger font-mono uppercase">Mission directive required</span>}
               </div>

               <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-mono text-white/40 uppercase">Details (Optional)</label>
                  <textarea
                     value={description}
                     onChange={(e) => setDescription(e.target.value)}
                     className="bg-white/5 border border-white/10 rounded-md px-4 py-3 outline-none focus:border-system-neon/50 text-sm transition-all min-h-[80px] resize-none"
                     placeholder="Specific requirements for this mission..."
                  />
               </div>

               <div className="flex gap-4">
                  <div className="flex flex-col flex-1 gap-2">
                     <label className="text-[10px] font-mono text-white/40 uppercase">Time Limit</label>
                     <input
                        type="datetime-local"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-md px-3 py-2 outline-none focus:border-system-neon/50 text-sm"
                     />
                  </div>
               </div>

               <div className="flex gap-4">
                  <div className="flex flex-col flex-1 gap-2">
                     <label className="text-[10px] font-mono text-white/40 uppercase">Mission Type</label>
                     <select 
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="bg-white/5 border border-white/10 rounded-md px-4 py-2 outline-none focus:border-system-neon/50"
                     >
                        <option value="daily">Daily Mission</option>
                        <option value="main">Main Quest</option>
                     </select>
                  </div>
                  <div className="flex flex-col flex-1 gap-2">
                     <label className="text-[10px] font-mono text-white/40 uppercase">Subject Area</label>
                     <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-md px-4 py-2 outline-none focus:border-system-neon/50"
                     >
                        {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                     </select>
                  </div>
               </div>

               <button
                  type="submit"
                  className="mt-4 bg-system-neon text-system-bg font-display font-bold uppercase py-4 rounded-md hover:scale-[1.02] active:scale-95 transition-all shadow-lg system-glow"
               >
                  Accept Mission
               </button>
            </form>
         </div>
      </div>
    </div>
  );
}
