"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Users, 
  ChevronRight, 
  Calendar, 
  LayoutDashboard,
  Clock,
  Sparkles,
  Zap,
  GraduationCap,
  X,
  Target
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function BatchManagementPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [batchForm, setBatchForm] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    max_members: 50
  });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('v2_workspaces')
      .select('*')
      .eq('type', 'batch')
      .order('created_at', { ascending: false });
    if (data) setBatches(data);
    setIsLoading(false);
  };

  const handleCreateBatch = async () => {
    if (!batchForm.name) return;
    const { error } = await supabase
      .from('v2_workspaces')
      .insert([{ 
        ...batchForm, 
        type: 'batch' 
      }]);
    if (!error) {
      setIsModalOpen(false);
      setBatchForm({ name: "", description: "", start_date: "", end_date: "", max_members: 50 });
      fetchBatches();
    } else {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="p-6 md:p-10 xl:p-12 space-y-12 max-w-[1700px] mx-auto animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest border border-blue-100 inline-flex items-center gap-2">
            Workspace Control
          </div>
          <h1 className="text-4xl font-black text-[#0F172A] tracking-tight flex items-center gap-4">
            <GraduationCap className="text-blue-600" size={40} /> Batch Management
          </h1>
          <p className="text-slate-500 font-medium">Kelola seluruh kelas bootcamp dalam satu dashboard terpusat.</p>
        </div>

        <Button 
          onClick={() => setIsModalOpen(true)}
          className="h-16 px-10 rounded-2xl bg-blue-600 text-white font-black text-sm shadow-xl shadow-blue-500/20 hover:scale-105 transition-all flex items-center justify-center gap-3"
        >
          <Plus size={20} /> Create New Batch
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Batches List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Batches</h3>
            <span className="text-[10px] font-black text-blue-600">{batches.length} Classes</span>
          </div>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar pb-20">
            {isLoading && (
              <div className="py-10 text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest">Loading Batches...</p>
              </div>
            )}
            {!isLoading && batches.map((batch) => (
              <Link key={batch.id} href={`/v2/batch/${batch.id}`}>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-5 rounded-[24px] bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Zap size={18} className="fill-current" />
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest border border-emerald-100">
                      {batch.status}
                    </div>
                  </div>
                  <h4 className="text-lg font-black text-[#0F172A] tracking-tight group-hover:text-blue-600 transition-colors truncate">{batch.name}</h4>
                  <div className="mt-4 flex items-center gap-4 opacity-40">
                    <div className="flex items-center gap-2">
                      <Users size={12} />
                      <span className="text-[10px] font-bold">50 Slots</span>
                    </div>
                    <div className="h-1 w-1 rounded-full bg-slate-400" />
                    <div className="flex items-center gap-2">
                      <Calendar size={12} />
                      <span className="text-[10px] font-bold">Active</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}

            {batches.length === 0 && !isLoading && (
              <div className="p-10 text-center rounded-[24px] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold text-xs">Belum ada batch kelas. Tekan tombol diatas untuk membuat.</p>
              </div>
            )}
          </div>
        </div>

        {/* Analytics Overview Center */}
        <div className="lg:col-span-3">
          <Card className="h-full min-h-[500px] border-none shadow-xl shadow-slate-200/50 bg-white p-12 rounded-[44px] flex flex-col items-center justify-center text-center space-y-8 lg:sticky lg:top-24">
            <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center text-blue-600">
              <Sparkles size={44} />
            </div>
            <div className="space-y-4 max-w-md mx-auto">
              <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">Pilih sebuah Batch untuk mengelola kurikulum.</h2>
              <p className="text-slate-500 font-medium">Anda bisa membagi murid menjadi kelompok, mengatur absensi, dan melakukan penilaian grading 12 poin secara terpisah tiap anak.</p>
            </div>
            
            <div className="grid grid-cols-3 gap-6 w-full max-w-2xl pt-10">
              {[
                { label: 'Total Murid', val: '0', color: 'text-blue-600' },
                { label: 'Assignment Pending', val: '0', color: 'text-amber-500' },
                { label: 'Lulus Batch', val: '0', color: 'text-emerald-500' }
              ].map((stat, i) => (
                <div key={i} className="p-6 rounded-[28px] bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{stat.label}</p>
                  <p className={`text-3xl font-black ${stat.color}`}>{stat.val}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Create Modal */}
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
                <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">Inisialisasi Batch Baru</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all"><X size={24} /></button>
              </div>

              <div className="p-10 space-y-8 overflow-y-auto no-scrollbar">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">BATCH / CLASS NAME</label>
                  <input 
                    value={batchForm.name}
                    onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })}
                    placeholder="e.g. Mentorhipers Batch 1: Social Media Growth"
                    className="w-full h-16 rounded-2xl bg-neutral-50 px-8 font-bold text-lg focus:outline-none focus:ring-4 ring-blue-500/10 border border-slate-100 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">START DATE</label>
                    <input 
                      type="date"
                      value={batchForm.start_date}
                      onChange={(e) => setBatchForm({ ...batchForm, start_date: e.target.value })}
                      className="w-full h-16 rounded-2xl bg-neutral-50 px-8 font-bold text-sm border border-slate-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">END DATE</label>
                    <input 
                      type="date"
                      value={batchForm.end_date}
                      onChange={(e) => setBatchForm({ ...batchForm, end_date: e.target.value })}
                      className="w-full h-16 rounded-2xl bg-neutral-50 px-8 font-bold text-sm border border-slate-100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">QUOTA STUDENT (MAX 50)</label>
                  <input 
                    type="number"
                    max={50}
                    value={batchForm.max_members}
                    onChange={(e) => setBatchForm({ ...batchForm, max_members: parseInt(e.target.value) })}
                    className="w-full h-16 rounded-2xl bg-neutral-50 px-8 font-bold text-sm border border-slate-100"
                  />
                </div>
              </div>

              <div className="p-10 pt-4">
                <Button 
                  onClick={handleCreateBatch}
                  className="w-full h-20 rounded-3xl bg-blue-600 text-white font-black text-lg shadow-2xl shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Create Batch Environment
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
