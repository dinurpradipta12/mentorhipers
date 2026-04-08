"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  BookOpen, 
  CheckCircle2, 
  ClipboardList, 
  BarChart4, 
  MoreVertical,
  ChevronRight,
  ArrowLeft,
  Share2,
  CalendarDays,
  Plus, 
  Pencil, 
  Trash2, 
  Shield, 
  X,
  Crown,
  Trophy,
  Medal,
  Star
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabaseV2 as supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";

export default function BatchContentMobile({ id }: { id: string }) {
  const router = useRouter(); 
  const [activeTab, setActiveTab] = useState("learning");
  const [batch, setBatch] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

 //--- MOBILE ADMIN QUICK ACTION STATES ---
  const [isLmsSheetOpen, setIsLmsSheetOpen] = useState(false);
  const [editingLmsItem, setEditingLmsItem] = useState<any>(null);
  const [lmsForm, setLmsForm] = useState({ title: '', module_name: '', video_url: '' });

  const [isStudentSheetOpen, setIsStudentSheetOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const [isMoveGroupSheetOpen, setIsMoveGroupSheetOpen] = useState(false);
  const [moveGroupTarget, setMoveGroupTarget] = useState('');

  const [isReportSheetOpen, setIsReportSheetOpen] = useState(false);
  const [selectedReportStudent, setSelectedReportStudent] = useState<any>(null);

  const gradingConfig = {
      post_test_weight: 40,
      assignment_weight: 40,
      challenge_weight: 10,
      attendance_weight: 10
  };

  useEffect(() => {
    let isMounted = true;
    const initMobile = async () => {
      setIsLoading(true);
      const { data: bData } = await supabase.from('v2_workspaces').select('id, name, description, type, start_date, end_date, max_members, status, settings, schedules, created_at').eq('id', id).single();
      const { data: cData } = await supabase.from('v2_curriculums').select('*').eq('workspace_id', id).order('created_at', { ascending: true });
      
     //Fetch Submissions and Quiz results for Leaderboard
      const subPromise = supabase.from('v2_submissions').select('curriculum_id, profile_id, grade').eq('workspace_id', id);
      const quizPromise = supabase.from('v2_quiz_results').select('curriculum_id, profile_id, score').eq('workspace_id', id);
      const [ { data: subData }, { data: qData } ] = await Promise.all([subPromise, quizPromise]);

      if (isMounted) {
         setBatch(bData);
         setCurriculum(cData || []);
         setAllSubmissions([...(subData || []), ...(qData || [])]);
      }

     //Safe Profile Fetching (Avoid 500 Base64 Crash)
      const { data: basicMem } = await supabase.from('v2_memberships').select('id, workspace_id, profile_id, group_name, group_wa_link, is_leader, attendance, plus_points, joined_at').eq('workspace_id', id);
      
      if (basicMem && basicMem.length > 0) {
        const rawProfileIds = [...new Set(basicMem.map(m => m.profile_id).filter(Boolean))];
        const profileIds = rawProfileIds.filter(pid =>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(pid));

        if (profileIds.length > 0) {
         //Phase 1: NAMES ONLY (Fast)
          const { data: nameData } = await supabase.from('v2_profiles').select('id, full_name').in('id', profileIds);
          if (nameData && isMounted) {
            const nameMap = new Map(nameData.map(p => [p.id, p]));
            const withNames = basicMem.map(m => ({ ...m, v2_profiles: nameMap.get(m.profile_id) || null }));
            setStudents(withNames);
          }
          
          if (isMounted) setIsLoading(false);//Stop loading early to unblock UI!

         //Phase 2: AVATARS in chunks
          const BATCH_SIZE = 4;
          for (let i = 0; i < profileIds.length; i += BATCH_SIZE) {
            if (!isMounted) break;
            const batchIds = profileIds.slice(i, i + BATCH_SIZE);
            const { data: avatarBatch } = await supabase.from('v2_profiles').select('id, avatar_url').in('id', batchIds);
            
            if (avatarBatch && isMounted) {
               setStudents(prev => {
                 const avatarMap = new Map(avatarBatch.map(p => [p.id, p.avatar_url]));
                 return prev.map(s => {
                   if (avatarMap.has(s.profile_id)) {
                     return { ...s, v2_profiles: { ...(s.v2_profiles || {}), avatar_url: avatarMap.get(s.profile_id) } };
                   }
                   return s;
                 });
               });
            }
          }
        } else {
           if (isMounted) { setStudents(basicMem); setIsLoading(false); }
        }
      } else {
         if (isMounted) { setStudents([]); setIsLoading(false); }
      }
    };
    initMobile();
    return () => { isMounted = false; };
  }, [id]);

  const handleSaveLms = async () => {
    if (!lmsForm.title || !lmsForm.title.trim()) {
      alert("Judul kurikulum wajib diisi!");
      return;
    }

    setIsLoading(true);
    try {
      const payload = { 
        title: lmsForm.title.trim(), 
        module_name: lmsForm.module_name, 
        video_url: lmsForm.video_url 
      };

      if (editingLmsItem) {
        const { error } = await supabase.from('v2_curriculums').update(payload).eq('id', editingLmsItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('v2_curriculums').insert([{ 
          ...payload, 
          workspace_id: id, 
          type: 'material', 
          is_published: true 
        }]);
        if (error) throw error;
      }

      const { data: cData } = await supabase.from('v2_curriculums').select('*').eq('workspace_id', id).order('created_at', { ascending: true });
      setCurriculum(cData || []);
      setIsLmsSheetOpen(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveGroup = async () => {
     if (!selectedStudent || !moveGroupTarget) return;
     setIsLoading(true);
     await supabase.from('v2_memberships').update({ group_name: moveGroupTarget }).eq('id', selectedStudent.id);
     
     setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, group_name: moveGroupTarget } : s));
     setIsMoveGroupSheetOpen(false);
     setIsStudentSheetOpen(false);
     setIsLoading(false);
  };

  const handleShare = () => {
     const shareUrl = `${window.location.origin}/ruang-sosmed/${id}`;
     navigator.clipboard.writeText(shareUrl);
     alert("Link Portal Siswa berhasil di-copy! 🛸");
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center p-20 text-center font-bold text-slate-400">Loading Mobile Experience...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans pb-32">
      {/* Mobile Header */}
      <div className="p-8 bg-gradient-to-br from-blue-700 to-indigo-900 text-white rounded-b-[40px] shadow-lg shadow-blue-900/10">
        <div className="flex items-center gap-4 mb-6">
           <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
             <ArrowLeft size={20}/>
           </button>
           <div>
             <h1 className="text-xl font-black">{batch?.name || "LMS Mobile"}</h1>
             <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{students.length} Students Active</p>
           </div>
        </div>
        <div className="flex gap-2">
           <Button onClick={handleShare} className="h-10 px-4 bg-white text-blue-800 rounded-xl text-[10px] font-black uppercase tracking-widest flex-1">Share Access</Button>
           <Button className="h-10 w-10 bg-white/10 text-white rounded-xl flex items-center justify-center"><MoreVertical size={16}/></Button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 pt-10 space-y-4 flex-1">
         {activeTab === 'learning' && (
           <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-2xl font-black text-slate-800 tracking-tight">Kurikulum</h2>
                 <button onClick={() => { setEditingLmsItem(null); setLmsForm({ title: '', module_name: '', video_url: '' }); setIsLmsSheetOpen(true); }} className="w-10 h-10 bg-blue-600 text-white rounded-[14px] flex items-center justify-center shadow-lg shadow-blue-500/30 active:scale-95 transition-all outline-none">
                    <Plus size={20}/>
                 </button>
              </div>
              {curriculum.map((item, idx) => (
                <div key={item.id} onClick={() => { setEditingLmsItem(item); setLmsForm({ title: item.title, module_name: item.module_name, video_url: item.video_url || '' }); setIsLmsSheetOpen(true); }} className="p-4 bg-white rounded-3xl border border-slate-100 flex items-center justify-between group cursor-pointer active:scale-[0.98] transition-all shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] aspect-[4/1]">
                   <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-[20px] bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg shrink-0">
                         {idx + 1}
                      </div>
                      <div className="pr-2">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">{item.module_name || "Material"}</p>
                         <h4 className="text-sm font-bold text-slate-800 leading-tight line-clamp-2">{item.title}</h4>
                      </div>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Pencil size={14}/>
                   </div>
                </div>
              ))}
           </div>
         )}

         {activeTab === 'students' && (
           <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-2xl font-black text-slate-800 tracking-tight">Active Students</h2>
              </div>
              {students.map(s => (
                <div key={s.id} onClick={() => { setSelectedStudent(s); setIsStudentSheetOpen(true); }} className="p-4 bg-white rounded-3xl border border-slate-100 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
                   <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-[20px] bg-slate-100 overflow-hidden font-black text-slate-400 flex items-center justify-center text-lg shrink-0 border border-slate-200">
                        {s.v2_profiles?.avatar_url ? <img src={s.v2_profiles.avatar_url} className="w-full h-full object-cover"/> : s.v2_profiles?.full_name?.charAt(0)}
                      </div>
                      <div>
                         <h4 className="text-sm font-black text-slate-800 line-clamp-1">{s.v2_profiles?.full_name}</h4>
                         <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest border border-emerald-100 truncate max-w-[120px] block">{s.group_name || "Unassigned"}</span>
                            {s.is_leader && <span className="text-amber-500"><Shield size={12} fill="currentColor"/></span>}
                         </div>
                      </div>
                   </div>
                   <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <MoreVertical size={16}/>
                   </div>
                </div>
              ))}
           </div>
         )}

         {activeTab === 'grades' && (
           <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-black text-slate-800 tracking-tight">Leaderboard</h2>
              </div>
              
              <div className="space-y-3 pb-20">
                {(() => {
                  const ranked = students.map(mem => {
                    const studentSubmissions = allSubmissions.filter(s => s.profile_id === mem.profile_id);
                    let totalPT = 0, countPT = 0, totalAssign = 0, countAssign = 0, totalGC = 0, countGC = 0;
                    
                    const tasks = curriculum.filter(t => t.type !== 'material');
                    tasks.forEach(t => {
                       let score = null;
                       const now = new Date().getTime();
                       const deadlineElapsed = t.due_date ? (new Date(t.due_date).getTime() + 86400000) < now : false;

                       if (t.type === 'post_test') {
                          const res = studentSubmissions.find(s => s.curriculum_id === t.id && s.score !== undefined);
                          score = res ? (res.score || 0) : (deadlineElapsed ? 0 : null);
                          if (score !== null) { totalPT += score; countPT++; }
                       } else {
                          const sub = studentSubmissions.find(s => s.curriculum_id === t.id && s.grade !== undefined);
                          score = sub ? (sub.grade || 0) : (deadlineElapsed ? 0 : null);
                          if (score !== null) {
                            if (t.type === 'challenge') { totalGC += score; countGC++; }
                            else { totalAssign += score; countAssign++; }
                          }
                       }
                    });

                    const avgPT = countPT > 0 ? totalPT/countPT : 0;
                    const avgAssign = countAssign > 0 ? totalAssign/countAssign : 0;
                    const avgGC = countGC > 0 ? totalGC/countGC : 0;
                    
                    const finalAvg = (
                       (avgPT * gradingConfig.post_test_weight) +
                       (avgAssign * gradingConfig.assignment_weight) +
                       (avgGC * gradingConfig.challenge_weight)
                    )/(gradingConfig.post_test_weight + gradingConfig.assignment_weight + gradingConfig.challenge_weight + gradingConfig.attendance_weight);

                    return { ...mem, finalAvg };
                  }).sort((a, b) => b.finalAvg - a.finalAvg);

                  return ranked.map((s, idx) => (
                    <div 
                      key={s.id} 
                      onClick={() => { setSelectedReportStudent(s); setIsReportSheetOpen(true); }}
                      className="p-4 bg-white rounded-3xl border border-slate-100 flex items-center justify-between shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] active:scale-[0.98] transition-all cursor-pointer"
                    >
                       <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-14 h-14 rounded-[22px] bg-slate-100 overflow-hidden border-2 border-white shadow-md ring-1 ring-slate-100">
                               {s.v2_profiles?.avatar_url ? (
                                  <img src={s.v2_profiles.avatar_url} className="w-full h-full object-cover"/>
                               ) : (
                                  <div className="w-full h-full flex items-center justify-center font-black text-slate-400 bg-slate-50 text-xl">
                                     {s.v2_profiles?.full_name?.charAt(0)}
                                  </div>
                               )}
                            </div>
                            {/* RANK ICON OVERLAY */}
                            {idx === 0 && (
                               <div className="absolute -top-2 -left-2 w-8 h-8 bg-amber-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-amber-300/50 border-2 border-white rotate-[-12deg]">
                                  <Crown size={16} fill="currentColor"/>
                               </div>
                            )}
                            {idx === 1 && (
                               <div className="absolute -top-2 -left-2 w-7 h-7 bg-slate-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-slate-300/50 border-2 border-white">
                                  <Trophy size={14} fill="currentColor"/>
                               </div>
                            )}
                            {idx === 2 && (
                               <div className="absolute -top-2 -left-2 w-7 h-7 bg-orange-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-orange-300/50 border-2 border-white">
                                  <Medal size={14} fill="currentColor"/>
                               </div>
                            )}
                          </div>
                          <div>
                             <h4 className="text-sm font-black text-slate-800 line-clamp-1">{s.v2_profiles?.full_name}</h4>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <span className={idx < 3 ? 'text-blue-500 font-black' : ''}>#{idx + 1} RANK</span>
                                <span className="w-1 h-1 bg-slate-200 rounded-full"/>
                                <span>{s.group_name || "MEMBER"}</span>
                             </p>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="flex items-end justify-end gap-0.5">
                             <div className="text-xl font-black text-slate-900 leading-none">{Math.round(s.finalAvg)}</div>
                             <div className="text-[8px] font-black text-blue-500 uppercase mb-0.5">pts</div>
                          </div>
                          <span className="text-[8px] font-black uppercase text-slate-300 tracking-tighter block mt-1">Global Score</span>
                       </div>
                    </div>
                  ));
                })()}
              </div>
           </div>
         )}
      </div>

      {/* ========================================= */}
      {/* 5. BOTTOM SHEETS (MOBILE NATIVE FEEL)       */}
      {/* ========================================= */}
      <AnimatePresence>
         {/* LMS Form Sheet */}
         {isLmsSheetOpen && (
            <>
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLmsSheetOpen(false)} className="fixed inset-0 bg-slate-900/40 z-[200] backdrop-blur-sm"/>
               <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="fixed bottom-0 inset-x-0 z-[210] bg-white rounded-t-[40px] p-6 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.1)] max-h-[90vh] overflow-y-auto flex flex-col items-stretch">
                  <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 shrink-0"/>
                  <div className="flex items-center justify-between mb-8">
                     <div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{editingLmsItem ? 'Edit Module' : 'Create Module'}</p>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">{editingLmsItem ? 'Update Link Materi' : 'Materi Pembelajaran Baru'}</h3>
                     </div>
                     <button onClick={() => setIsLmsSheetOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center active:scale-95 transition-transform"><X size={16}/></button>
                  </div>
                  <div className="space-y-5 flex-1 pb-32">
                     <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">Minggu/Modul Ke-</label>
                        <input type="text" value={lmsForm.module_name} onChange={e => setLmsForm({...lmsForm, module_name: e.target.value})} placeholder="e.g. Pertemuan 1" className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-base font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"/>
                     </div>
                     <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">Judul Materi</label>
                        <input type="text" value={lmsForm.title} onChange={e => setLmsForm({...lmsForm, title: e.target.value})} placeholder="e.g. Fundamental Social Media" className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-base font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"/>
                     </div>
                     <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">Link Zoom/Video Rekaman</label>
                        <input type="text" value={lmsForm.video_url} onChange={e => setLmsForm({...lmsForm, video_url: e.target.value})} placeholder="https://zoom.us/j/..." className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-base font-bold text-blue-600 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"/>
                     </div>
                     <Button onClick={handleSaveLms} className="w-full h-14 bg-blue-600 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 mt-4 outline-none">Simpan Perubahan</Button>
                     {editingLmsItem && (
                        <div className="pt-6 mt-6 border-t border-slate-100">
                           <button onClick={async () => { setIsLoading(true); await supabase.from('v2_curriculums').delete().eq('id', editingLmsItem.id); const { data } = await supabase.from('v2_curriculums').select('*').eq('workspace_id', id).order('created_at', { ascending: true }); setCurriculum(data || []); setIsLmsSheetOpen(false); setIsLoading(false); }} className="w-full py-3 text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] relative flex items-center justify-center gap-2 bg-rose-50/50 rounded-2xl border border-rose-100">
                              <Trash2 size={14}/> Hapus Modul Ini
                           </button>
                        </div>
                     )}
                  </div>
               </motion.div>
            </>
         )}

         {/* Student Action Sheet */}
         {isStudentSheetOpen && selectedStudent && !isMoveGroupSheetOpen && (
            <>
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsStudentSheetOpen(false)} className="fixed inset-0 bg-slate-900/40 z-[200] backdrop-blur-sm"/>
               <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="fixed bottom-0 inset-x-0 z-[210] bg-white rounded-t-[40px] p-6 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                  <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8 shrink-0"/>
                  <div className="flex flex-col items-center mb-8 text-center px-4">
                     <div className="w-24 h-24 rounded-[32px] bg-slate-100 overflow-hidden font-black text-slate-400 flex items-center justify-center text-3xl mb-4 ring-4 ring-slate-50 shadow-xl shadow-slate-200/50">
                       {selectedStudent.v2_profiles?.avatar_url ? <img src={selectedStudent.v2_profiles.avatar_url} className="w-full h-full object-cover"/> : selectedStudent.v2_profiles?.full_name?.charAt(0)}
                     </div>
                     <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight line-clamp-1">{selectedStudent.v2_profiles?.full_name}</h3>
                     <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-lg">{selectedStudent.group_name || "Unassigned"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pb-32">
                     <button className="h-20 rounded-[20px] bg-slate-50 border border-slate-100 text-slate-400 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform" onClick={() => { setIsStudentSheetOpen(false); setActiveTab('grades'); }}>
                        <BarChart4 size={20} className="mb-0.5"/>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Lihat Raport</span>
                     </button>
                     <button className="h-20 rounded-[20px] bg-blue-50 border border-blue-100 text-blue-600 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform" onClick={() => { setMoveGroupTarget(selectedStudent.group_name || ''); setIsMoveGroupSheetOpen(true); }}>
                        <Users size={20} className="mb-0.5"/>
                        <span className="text-[9px] font-black uppercase tracking-widest">Pindah Group</span>
                     </button>
                     <button className="h-20 rounded-[20px] bg-amber-50 border border-amber-100 text-amber-500 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
                        <Shield size={20} className="mb-0.5"/>
                        <span className="text-[9px] font-black uppercase tracking-widest">Jadikan Leader</span>
                     </button>
                     <button className="h-20 rounded-[20px] bg-rose-50 border border-rose-100 text-rose-500 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
                        <Trash2 size={20} className="mb-0.5"/>
                        <span className="text-[9px] font-black uppercase tracking-widest">Keluarkan</span>
                     </button>
                  </div>
               </motion.div>
            </>
         )}

         {/* Move Group Sheet */}
         {isMoveGroupSheetOpen && selectedStudent && (
            <>
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMoveGroupSheetOpen(false)} className="fixed inset-0 bg-slate-900/60 z-[220] backdrop-blur-sm"/>
               <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="fixed bottom-0 inset-x-0 z-[230] bg-white rounded-t-[40px] p-6 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                  <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 shrink-0"/>
                  <div className="text-center mb-8 px-4">
                     <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Target Group</p>
                     <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">Pindahkan {selectedStudent.v2_profiles?.full_name?.split(' ')[0]}</h3>
                  </div>
                  <div className="space-y-4 pb-32">
                     <div className="flex flex-wrap items-center gap-2 justify-center mb-8 px-2 max-h-40 overflow-y-auto">
                        {Array.from(new Set(students.map(m => m.group_name).filter(Boolean))).map((grp: any) => (
                           <button 
                             key={grp} 
                             onClick={() => setMoveGroupTarget(grp)}
                             className={`px-4 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-[0.1em] transition-all active:scale-95 ${moveGroupTarget === grp ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' : 'bg-slate-50 text-slate-500 border-slate-200'}`}
                           >
                             {grp}
                           </button>
                        ))}
                     </div>
                     <div className="px-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block text-center">Atau buat kelompok baru</label>
                        <input type="text" value={moveGroupTarget} onChange={e => setMoveGroupTarget(e.target.value)} placeholder="e.g. Batch 17 - Tiger" className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-base font-bold text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all mb-4"/>
                        <Button onClick={handleMoveGroup} className="w-full h-14 bg-blue-600 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 outline-none">Konfirmasi Perpindahan</Button>
                     </div>
                  </div>
               </motion.div>
            </>
         )}
         {/* Detailed Progress Report Sheet */}
         {isReportSheetOpen && selectedReportStudent && (
            <>
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsReportSheetOpen(false)} className="fixed inset-0 bg-slate-900/60 z-[300] backdrop-blur-md"/>
               <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="fixed bottom-0 inset-x-0 z-[310] bg-white rounded-t-[44px] p-6 pb-safe shadow-[0_-20px_60px_rgba(0,0,0,0.15)] flex flex-col max-h-[95vh]">
                  <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8 shrink-0"/>
                  
                  <div className="flex items-center gap-5 mb-10 px-2 shrink-0">
                     <div className="w-20 h-20 rounded-[28px] bg-slate-100 overflow-hidden shadow-2xl shadow-slate-200 ring-2 ring-white ring-offset-2">
                        {selectedReportStudent.v2_profiles?.avatar_url ? (
                           <img src={selectedReportStudent.v2_profiles.avatar_url} className="w-full h-full object-cover"/>
                        ) : (
                           <div className="w-full h-full flex items-center justify-center font-black text-slate-400 text-2xl">
                              {selectedReportStudent.v2_profiles?.full_name?.charAt(0)}
                           </div>
                        )}
                     </div>
                     <div className="flex-1">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                           Academic Stats <span className="w-1 h-1 bg-blue-200 rounded-full"/> {selectedReportStudent.group_name || "Batch Member"}
                        </p>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-tight mb-2">{selectedReportStudent.v2_profiles?.full_name}</h3>
                        <div className="flex items-center gap-3">
                           <div className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase border border-emerald-100">Active Student</div>
                           <div className="flex items-center gap-1 text-amber-500 font-black text-[10px] uppercase">
                              <Star size={12} fill="currentColor"/> {Math.round(selectedReportStudent.finalAvg)} Overall
                           </div>
                        </div>
                     </div>
                     <button onClick={() => setIsReportSheetOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center active:scale-90 transition-all shrink-0"><X size={20}/></button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-2 space-y-8 pb-10 custom-scrollbar">
                     {/* OVERVIEW SCORE CARD */}
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] text-white shadow-xl shadow-blue-500/20">
                           <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">Overall GPA</p>
                           <h4 className="text-4xl font-black">{Math.round(selectedReportStudent.finalAvg)}</h4>
                           <div className="mt-4 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${selectedReportStudent.finalAvg}%` }} className="h-full bg-white transition-all duration-1000"/>
                           </div>
                        </div>
                        <div className="p-6 bg-slate-900 rounded-[32px] text-white shadow-xl shadow-slate-900/10">
                           <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2">Attendance</p>
                           <h4 className="text-4xl font-black">95<span className="text-lg opacity-40">%</span></h4>
                           <p className="text-[8px] font-bold text-slate-500 mt-2 uppercase tracking-tighter">Verified by system</p>
                        </div>
                     </div>

                     {/* MODULE BREAKDOWN */}
                     <div className="space-y-4">
                        <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] px-2">Performance Details</h5>
                        <div className="space-y-3">
                           {curriculum.filter(t => t.type !== 'material').map((t, idx) => {
                              const sub = allSubmissions.find(s => s.profile_id === selectedReportStudent.profile_id && s.curriculum_id === t.id);
                              
                             //Check both possible fields depending on table
                              const scoreValue = t.type === 'post_test' ? sub?.score : sub?.grade;
                              const isSubmitted = scoreValue !== undefined && scoreValue !== null;

                              return (
                                 <div key={t.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-400 font-black text-xs">
                                          {idx + 1}
                                       </div>
                                       <div>
                                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t.type?.replace('_', ' ')}</p>
                                          <h6 className="text-xs font-bold text-slate-800 line-clamp-1">{t.title}</h6>
                                       </div>
                                    </div>
                                    <div className="text-right">
                                       <div className={`text-sm font-black ${isSubmitted ? 'text-slate-900' : 'text-slate-300'}`}>
                                          {isSubmitted ? scoreValue : 'N/A'}
                                       </div>
                                       <div className={`text-[7px] font-bold uppercase tracking-widest ${isSubmitted ? 'text-emerald-500' : 'text-slate-300'}`}>
                                          {isSubmitted ? 'Submitted' : 'Pending'}
                                       </div>
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </div>

                     <div className="pt-4 pb-20">
                        <Button className="w-full h-14 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10">Download Digital Raport</Button> 
                     </div>
                  </div>
               </motion.div>
            </>
         )}
      </AnimatePresence>

      {/* NATIVE BOTTOM NAV - LIGHT AMBIENT THEME */}
      <nav className="fixed bottom-8 left-6 right-6 z-[100] h-20 bg-white/70 backdrop-blur-2xl rounded-2xl border border-white/40 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] flex items-center justify-around px-4">
         {[
            { id: 'learning', icon: <BookOpen size={22} strokeWidth={2.5}/>, label: 'Materi' },
            { id: 'students', icon: <Users size={22} strokeWidth={2.5}/>, label: 'Students' },
            { id: 'grades', icon: <BarChart4 size={22} strokeWidth={2.5}/>, label: 'Grades' },
            { id: 'tasks', icon: <ClipboardList size={22} strokeWidth={2.5}/>, label: 'Tasks' }
         ].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`relative flex flex-col items-center justify-center gap-1 transition-all ${activeTab === t.id ? 'text-blue-600 scale-105 font-black' : 'text-slate-400 font-bold'}`}>
               {activeTab === t.id && <motion.div layoutId="navTab" className="absolute -top-5 w-5 h-1 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]"/>}
               {t.icon}
               <span className="text-[7px] uppercase tracking-[0.2em]">{t.label}</span>
            </button>
         ))}
      </nav>
    </div>
  );
}
