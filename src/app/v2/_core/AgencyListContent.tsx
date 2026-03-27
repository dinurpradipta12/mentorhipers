"use client";



import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Plus, 
  Search, 
  ChevronRight, 
  Users, 
  LayoutDashboard, 
  Layers, 
  Zap, 
  Target,
  ArrowUpRight,
  TrendingUp,
  X
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AgencyListContent() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    max_members: 10
  });

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('v2_workspaces')
      .select('*')
      .eq('type', 'agency')
      .order('created_at', { ascending: false });
    if (data) setWorkspaces(data);
    setIsLoading(false);
  };

  const handleCreate = async () => {
    if (!form.name) return;
    const { error } = await supabase
      .from('v2_workspaces')
      .insert([{ 
        ...form, 
        type: 'agency' 
      }]);
    if (!error) {
      setIsModalOpen(false);
      setForm({ name: "", description: "", max_members: 10 });
      fetchWorkspaces();
    }
  };

  return (
    <div className="p-6 md:p-10 xl:p-12 space-y-16 max-w-[1700px] mx-auto min-h-screen animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100 inline-flex items-center gap-2">
            B2B Collaborative Workspace
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-tight flex items-center gap-4">
            <Building2 className="text-emerald-500" size={44} /> Agency Management
          </h1>
          <p className="text-slate-500 font-medium max-w-xl leading-relaxed">Kelola klien korporat dan tim agensi Anda dalam ruang kolaboratif yang terpusat.</p>
        </div>

        <Button 
          onClick={() => setIsModalOpen(true)}
          className="h-16 px-10 rounded-2xl bg-emerald-600 text-white font-black text-sm shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all flex items-center justify-center gap-3"
        >
          <Plus size={20} /> New B2B Workspace
        </Button>
      </div>

      {/* Grid of Agencies */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {workspaces.map((ws) => (
          <Link key={ws.id} href={`/v2/agency/${ws.id}`}>
            <motion.div 
               whileHover={{ y: -6 }}
               className="p-10 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[44px] space-y-8 group transition-all cursor-pointer relative overflow-hidden"
            >
               {/* Accent Gradient */}
               <div className="absolute -right-20 -top-20 w-52 h-52 bg-emerald-50 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

               <div className="flex items-center justify-between relative z-10">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                    <Layers size={28} />
                  </div>
                  <div className="flex -space-x-3">
                     {[1, 2, 3].map((i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white" />
                     ))}
                     <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white border-2 border-white">+7</div>
                  </div>
               </div>

               <div className="space-y-3 relative z-10">
                  <h3 className="text-2xl font-black text-[#0F172A] tracking-tight group-hover:text-emerald-600 transition-colors">{ws.name}</h3>
                  <p className="text-slate-500 font-medium text-sm line-clamp-2">{ws.description || 'No description provided.'}</p>
               </div>

               <div className="pt-6 border-t border-slate-50 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                        <Users size={12} /> 10 Seats
                     </div>
                     <div className="w-px h-3 bg-slate-200" />
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-500">
                        <TrendingUp size={12} /> Sync On
                     </div>
                  </div>
                  <ArrowUpRight size={18} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
               </div>
            </motion.div>
          </Link>
        ))}

        {workspaces.length === 0 && !isLoading && (
          <div className="md:col-span-full h-80 flex flex-col items-center justify-center p-20 text-center space-y-6 border-2 border-dashed border-slate-100 rounded-[44px]">
             <Zap className="text-slate-100" size={80} />
             <p className="text-slate-400 font-bold max-w-xs text-xs uppercase tracking-widest">Belum ada workspace B2B. Buat workspace pertama Anda untuk mulai berkolaborasi.</p>
          </div>
        )}
      </div>

      {/* Modal Agency */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[44px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100"
            >
              <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">Create Agency Workspace</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all"><X size={24} /></button>
              </div>

              <div className="p-10 space-y-8 overflow-y-auto no-scrollbar">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">AGENCY / COMPANY NAME</label>
                  <input 
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. PT Maju Digital Branding"
                    className="w-full h-16 rounded-2xl bg-neutral-50 px-8 font-bold text-lg focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">DESCRIPTION</label>
                  <textarea 
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Tuliskan tujuan kolaborasi ini..."
                    className="w-full h-32 rounded-2xl bg-neutral-50 p-8 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100 resize-none"
                  />
                </div>
              </div>

              <div className="p-10 pt-4">
                <Button 
                  onClick={handleCreate}
                  className="w-full h-20 rounded-3xl bg-emerald-600 text-white font-black text-lg shadow-2xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Confirm B2B Setup
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
