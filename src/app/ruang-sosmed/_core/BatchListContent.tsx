"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  Target,
  Pencil,
  Trash2,
  ArrowRightCircle,
  ArrowRight,
  Settings2,
  ArrowLeft,
  BookOpen
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseV2 as supabase } from "@/lib/supabase";
import { getCachedSession, isLegacyAdmin } from "@/lib/authCache";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function BatchListContent() {
  const [batches, setBatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [batchForm, setBatchForm] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    max_members: 50
  });

  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [selectedBatchMembers, setSelectedBatchMembers] = useState(0);
  const router = useRouter();
  const initializedRef = React.useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

   //Run auth + data fetch in PARALLEL — no more sequential blocking!
    const init = async () => {
      await Promise.all([checkAdmin(), fetchBatches()]);
    };
    init();
  }, []);

  const checkAdmin = async () => {
   //Use cached session — avoids network call on every mount
    const legacyAdmin = isLegacyAdmin();
    if (legacyAdmin) {
      setIsAuthorized(true);
      return;
    }

    const session = await getCachedSession();
    if (!session) {
      router.push('/ruang-sosmed/login');
      return;
    }

    const { data: profile } = await supabase.from('v2_profiles').select('role').eq('id', session.user.id).single();
    if (profile?.role === 'admin') {
      setIsAuthorized(true);
    } else {
      router.push('/ruang-sosmed/login');
    }
  };

  const fetchBatches = async () => {
    setIsLoading(true);
    
   //Safety fallback: force render after 20s to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
        console.warn("⚠️ [BatchList] Fetch timeout (20s). Forcing UI render. Check RLS policies or network.");
        setIsLoading(false);
    }, 20000);

    try {
      console.log("📡 [BatchList] Fetching workspaces...");
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from('v2_workspaces')
        .select('id, name, description, type, start_date, end_date, max_members, created_at, schedules, settings')
        .eq('type', 'batch')
        .order('created_at', { ascending: false });
      
      const elapsed = Date.now() - startTime;
      console.log(`📡 [BatchList] Query done in ${elapsed}ms. Count: ${data?.length ?? 0}`);

      if (error) {
        console.error("❌ [BatchList] Supabase error:", error.code, error.message, error.hint);
      }
      
      if (data) {
        setBatches(data);
       //Restore last selected batch
        const savedId = localStorage.getItem('batch_list_selected');
        if (savedId) {
          const found = data.find((b: any) => b.id === savedId);
          if (found) {
            handleSelectBatch(found);
          } else {
            console.log("📍 [BatchList] Saved ID not found in new DB. Clearing cache.");
            localStorage.removeItem('batch_list_selected');
          }
        }
      }
    } catch (err: any) {
      console.error("❌ [BatchList] Unexpected error:", err.message);
    } finally {
      clearTimeout(safetyTimeout);
      setIsLoading(false);
    }
  };

  const fetchBatchStats = async (batchId: string) => {
    const { count } = await supabase
      .from('v2_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', batchId);
    setSelectedBatchMembers(count || 0);
  };

  const handleSelectBatch = (batch: any) => {
    setSelectedBatch(batch);
    fetchBatchStats(batch.id);
    localStorage.setItem('batch_list_selected', batch.id);

   //Auto-open info modal on mobile
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsInfoModalOpen(true);
    }
  };

  const handleCreateBatch = async () => {
    if (!batchForm.name) return;

    if (editingBatchId) {
      const { error } = await supabase
        .from('v2_workspaces')
        .update({ 
          ...batchForm
        })
        .eq('id', editingBatchId);
      
      if (!error) {
        setIsModalOpen(false);
        setEditingBatchId(null);
        setBatchForm({ name: "", description: "", start_date: "", end_date: "", max_members: 50 });
        if (selectedBatch?.id === editingBatchId) {
           setSelectedBatch({ ...selectedBatch, ...batchForm });
        }
        fetchBatches();
      } else {
        alert("Error updating: " + error.message);
      }
    } else {
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
        alert("Error creating: " + error.message);
      }
    }
  };

  const openEditModal = (batch: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingBatchId(batch.id);
    setBatchForm({
      name: batch.name || "",
      description: batch.description || "",
      start_date: batch.start_date || "",
      end_date: batch.end_date || "",
      max_members: batch.max_members || 50
    });
    setIsModalOpen(true);
  };

  const handleDeleteBatch = async (id: string, name: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Apakah Anda yakin ingin menghapus Batch "${name}"? Seluruh data murid dan kurikulum di dalamnya akan ikut terhapus.`)) return;
    
    const { error } = await supabase
      .from('v2_workspaces')
      .delete()
      .eq('id', id);
    
    if (!error) {
      if (selectedBatch?.id === id) setSelectedBatch(null);
      fetchBatches();
    } else {
      alert("Gagal menghapus: " + error.message);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
          Verifying Admin Access...
        </p>
      </div>
    );
  }

  return (
    <>
    <div className="p-6 md:p-10 xl:p-12 space-y-12 max-w-[1700px] mx-auto animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-6">
        <div className="space-y-4">
          <Link href="/ruang-sosmed" className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all group/back mb-2 border border-slate-100/50">
            <ArrowLeft size={14} className="group-hover/back:-translate-x-1 transition-transform"/>
            <span className="text-[9px] font-black uppercase tracking-widest">Workspace Selection</span>
          </Link>
          <div className="flex flex-col space-y-2">
            <div className="px-3 py-1 w-fit rounded-full bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-[0.2em] border border-blue-100 inline-flex items-center gap-2">
              Workspace Control
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight flex items-center gap-4 py-1">
              <GraduationCap className="text-blue-600" size={32}/> Batch Management
            </h1>
          </div>
          <p className="text-slate-500 font-medium text-sm sm:text-base max-w-lg">Kelola seluruh kelas bootcamp dalam satu dashboard terpusat.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <Link
            href="/admin/dashboard"
            className="w-full sm:w-auto h-16 md:h-20 px-6 rounded-2xl md:rounded-3xl bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-wider hover:bg-slate-900 hover:text-white active:scale-95 transition-all flex items-center justify-center gap-2 border border-slate-200"
          >
            <ArrowLeft size={16}/> Back to V1
          </Link>
          <Link
            href="/ruang-sosmed/admin/templates"
            className="w-full sm:w-auto h-16 md:h-20 px-8 rounded-2xl md:rounded-3xl bg-white border-2 border-slate-200 text-slate-600 font-black text-sm hover:border-blue-300 hover:text-blue-600 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-sm"
          >
            <BookOpen size={18}/> Quiz Templates
          </Link>
          <Button 
            onClick={() => {
              setEditingBatchId(null);
              setBatchForm({ name: "", description: "", start_date: "", end_date: "", max_members: 50 });
              setIsModalOpen(true);
            }}
            className="w-full md:w-auto h-16 md:h-20 px-10 rounded-2xl md:rounded-3xl bg-blue-600 text-white font-black text-sm shadow-2xl shadow-blue-600/30 active:scale-95 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 border-b-4 border-blue-800"
          >
            <Plus size={20}/> Create New Batch
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar Batches List */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Batches</h3>
            <span className="text-[10px] font-black text-blue-600">{batches.length} Classes</span>
          </div>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar pb-20 p-1">
            {isLoading && (
              <div className="py-10 text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"/>
                <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest">Loading Batches...</p>
              </div>
            )}
            {!isLoading && batches.map((batch) => (
              <div 
                key={batch.id} 
                onClick={() => handleSelectBatch(batch)}
                className={`p-6 rounded-[32px] border transition-all cursor-pointer group relative overflow-hidden ${selectedBatch?.id === batch.id ? 'bg-blue-600 border-blue-600 shadow-2xl shadow-blue-600/30 text-white ring-4 ring-blue-500/10' : 'bg-white border-slate-100 hover:border-blue-200'}`}
              >
                {selectedBatch?.id === batch.id && (
                   <motion.div layoutId="active-bg" className="absolute inset-0 bg-blue-600 -z-10"/>
                )}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedBatch?.id === batch.id ? 'bg-white/10' : 'bg-blue-50 text-blue-600'}`}>
                    <Zap size={18} className="fill-current"/>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${selectedBatch?.id === batch.id ? 'bg-white/10 text-white border-white/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                    {batch.status || 'Active'}
                  </div>
                </div>
                <h4 className={`text-lg font-black tracking-tight leading-none ${selectedBatch?.id === batch.id ? 'text-white' : 'text-[#0F172A] group-hover:text-blue-600'} transition-colors truncate`}>{batch.name}</h4>
                <div className="mt-4 flex items-center gap-4 opacity-40">
                  <div className="flex items-center gap-2">
                    <Users size={12}/>
                    <span className="text-[10px] font-bold">{batch.max_members || 50} Slots</span>
                  </div>
                </div>
              </div>
            ))}

            {batches.length === 0 && !isLoading && (
              <div className="p-10 text-center rounded-[24px] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold text-xs">Belum ada batch kelas.</p>
              </div>
            )}
          </div>
        </div>

        {/* Analytics Overview Center - Preview Mode */}
        <div className="hidden lg:block lg:col-span-8">
          <AnimatePresence mode="wait">
            {!selectedBatch ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full min-h-[600px] border border-dashed border-slate-200 bg-white/50 p-12 rounded-[56px] flex flex-col items-center justify-center text-center space-y-8 lg:sticky lg:top-24"
              >
                <div className="w-24 h-24 bg-blue-50 rounded-[36px] flex items-center justify-center text-blue-600 shadow-inner">
                  <Sparkles size={44}/>
                </div>
                <div className="space-y-4 max-w-sm">
                  <h2 className="text-3xl font-black text-[#0F172A] tracking-tighter leading-none">Pilih Batch.</h2>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed">Klik salah satu batch di sebelah kiri untuk melihat detail kelas dan masuk ke board manajemen.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key={selectedBatch.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full min-h-[600px] border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 p-14 rounded-[56px] flex flex-col lg:sticky lg:top-24 overflow-hidden group/preview"
              >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"/>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2"/>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-12">
                     <div className="space-y-6">
                        <div className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100 w-fit">
                           Batch Workspace Details
                        </div>
                        <h2 className="text-5xl font-black text-[#0F172A] tracking-tighter leading-none max-w-xl">{selectedBatch.name}</h2>
                     </div>
                     <div className="flex gap-3">
                        <button 
                          onClick={(e) => openEditModal(selectedBatch, e)}
                          className="p-4 rounded-2xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          title="Edit Information"
                        >
                          <Pencil size={20}/>
                        </button>
                        <button 
                          onClick={(e) => handleDeleteBatch(selectedBatch.id, selectedBatch.name, e)}
                          className="p-4 rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                          title="Delete Batch"
                        >
                          <Trash2 size={20}/>
                        </button>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                     <div className="p-8 rounded-[36px] bg-slate-50 border border-slate-100 space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">STATUS BATCH</p>
                        <p className="text-xl font-black text-emerald-600 uppercase">{selectedBatch.status || 'Active'}</p>
                     </div>
                     <div className="p-8 rounded-[36px] bg-slate-50 border border-slate-100 space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">TOTAL MURID</p>
                        <p className="text-xl font-black text-blue-600">{selectedBatchMembers}/{selectedBatch.max_members || 50}</p>
                     </div>
                     <div className="p-8 rounded-[36px] bg-slate-50 border border-slate-100 space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">TANGGAL MULAI</p>
                        <p className="text-xl font-black text-[#0F172A] truncate">{formatDate(selectedBatch.start_date)}</p>
                     </div>
                     <div className="p-8 rounded-[36px] bg-slate-50 border border-slate-100 space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">TANGGAL BERAKHIR</p>
                        <p className="text-xl font-black text-[#0F172A] truncate">{formatDate(selectedBatch.end_date)}</p>
                     </div>
                  </div>

                  <div className="flex-1 space-y-6">
                     <div className="flex items-center gap-3">
                        <Target className="text-blue-600" size={20}/>
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Batch Workspace Narrative</h4>
                     </div>
                     <div className="p-10 rounded-[44px] bg-neutral-50/50 border border-slate-100 min-h-[160px]">
                        <p className="text-slate-600 font-medium leading-relaxed italic">
                           {selectedBatch.description || "Batch ini belum memiliki narasi deskripsi. Silakan edit informasi batch untuk menambahkan visi dan misi bootcamp."}
                        </p>
                     </div>
                  </div>

                  <div className="mt-12 pt-10 border-t border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="flex -space-x-3">
                           {[1,2,3,4].map(i => (
                              <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100"/>
                           ))}
                        </div>
                        <p className="text-xs font-bold text-slate-400 italic">Students already joined</p>
                     </div>
                     <Link href={`/ruang-sosmed/batch/${selectedBatch.id}`}>
                        <Button className="h-20 px-12 rounded-[32px] bg-blue-600 text-white font-black text-lg shadow-2xl shadow-blue-500/20 hover:scale-110 active:scale-95 transition-all flex items-center gap-4">
                           Enter Board Management <ArrowRightCircle size={24}/>
                        </Button>
                     </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
                <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">
                  {editingBatchId ? "Perbarui Informasi Batch" : "Inisialisasi Batch Baru"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all"><X size={24}/></button>
              </div>

              <div className="p-10 space-y-8 overflow-y-auto no-scrollbar">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">BATCH/CLASS NAME</label>
                  <input 
                    value={batchForm.name}
                    onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })}
                    placeholder="e.g. Ruang Sosmed Batch 1: Social Media Growth"
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
                  {editingBatchId ? "Simpan Perubahan" : "Create Batch Environment"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* 5. BATCH INFO POPUP (MOBILE ONLY) */}
      {typeof document !== 'undefined' ? createPortal(
        <AnimatePresence>
          {isInfoModalOpen && selectedBatch && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-transparent border-none">
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setIsInfoModalOpen(false)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-md cursor-pointer" 
             />
              {/* Modal Card */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative z-10 w-full max-w-[95%] sm:max-w-md bg-white rounded-[32px] shadow-2xl p-6 overflow-hidden max-h-[85vh] border border-slate-100/20 mx-auto box-border flex flex-col"
              >
                <div className="flex-shrink-0 flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner shrink-0">
                    <GraduationCap size={24}/>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={(e) => {
                        setIsInfoModalOpen(false);
                        openEditModal(selectedBatch, e);
                      }}
                      className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 transition-all border border-slate-100"
                    >
                      <Settings2 size={16}/>
                    </button>
                    <button 
                      onClick={() => setIsInfoModalOpen(false)}
                      className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 transition-all border border-slate-100"
                    >
                      <X size={16}/>
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto no-scrollbar space-y-5 pb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest border border-emerald-100">{selectedBatch.status || 'Active'}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {selectedBatch.id.split('-')[0]}</span>
                    </div>
                    <h2 className="text-xl font-black text-[#0F172A] tracking-tight leading-tight mb-2 pr-2">{selectedBatch.name}</h2>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{selectedBatch.description || "Kelas bootcamp eksklusif untuk persiapan industri."}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-600 shrink-0"><Calendar size={14}/></div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Schedule</p>
                        <p className="text-[10px] font-bold text-slate-700 truncate">{formatDate(selectedBatch.start_date)} - {formatDate(selectedBatch.end_date)}</p>
                      </div>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-600 shrink-0"><Users size={14}/></div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Capacity</p>
                        <p className="text-[10px] font-bold text-slate-700">{selectedBatchMembers}/{selectedBatch.max_members || 50} Students</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <Link 
                      href={`/ruang-sosmed/batch/${selectedBatch.id}`}
                      className="w-full h-14 bg-blue-600 text-white rounded-xl font-black text-sm shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95 transition-all border-b-4 border-blue-800"
                    >
                      Enter Workspace <ArrowRight size={16}/>
                    </Link>
                    <button 
                      onClick={(e) => {
                        setIsInfoModalOpen(false);
                        handleDeleteBatch(selectedBatch.id, selectedBatch.name, e);
                      }}
                      className="w-full py-2 text-[8px] font-black text-rose-500/30 hover:text-rose-500 uppercase tracking-[0.2em] transition-all"
                    >
                      Terminate Workspace
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      , document.body) : null}
    </>
  );
}
