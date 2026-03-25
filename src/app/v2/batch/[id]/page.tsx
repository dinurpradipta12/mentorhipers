"use client";

export const runtime = "edge";

import React, { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  BarChart4, 
  Plus, 
  Search, 
  ChevronRight, 
  X, 
  Award, 
  Zap, 
  MessageSquare,
  Sparkles,
  Target,
  FileText,
  UserPlus,
  Share2,
  Check,
  Eye,
  EyeOff,
  UserCheck
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [activeTab, setActiveTab] = useState("students");
  const [batch, setBatch] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // Auth Store
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Data Store
  const [students, setStudents] = useState<any[]>([]);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  
  // Registration Modal State
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ fullName: '', email: '', password: '' });

  useEffect(() => {
    fetchUserData();
    fetchBatchDetail();
    fetchStudents();
    fetchCurriculum();
  }, [resolvedParams.id]);

  const fetchUserData = async () => {
    // 1. Check Legacy Session (V1 Admin Developer)
    const legacySessionStr = localStorage.getItem("mh_session");
    if (legacySessionStr) {
      const session = JSON.parse(legacySessionStr);
      if (session.role === 'admin') {
         setCurrentUser({ full_name: 'Admin Developer', role: 'admin' });
         return; 
      }
    }

    // 2. Check Supabase Auth (New V2 Structure)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('v2_profiles').select('*').eq('id', user.id).single();
      if (profile) {
        setCurrentUser(profile);
        if (profile.role === 'student') setActiveTab('curriculum');
      }
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleAddStudent = async () => {
    // This will be connected to the Server Action in the next step
    alert(`Success: Akun untuk ${newStudent.fullName} telah dibuat!\nSilakan Copy pesan WhatsApp berikut:\n\nHalo ${newStudent.fullName}! Selamat bergabung di ${batch?.name}. Silakan login di ${window.location.origin}/v2/login dengan Email: ${newStudent.email} dan Password: ${newStudent.password}`);
    setIsRegModalOpen(false);
  };

  const fetchBatchDetail = async () => {
    const { data } = await supabase.from('v2_workspaces').select('*').eq('id', resolvedParams.id).single();
    if (data) setBatch(data);
    setIsLoading(false);
  };

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('v2_memberships')
      .select('*, v2_profiles(*)')
      .eq('workspace_id', resolvedParams.id);
    if (data) setStudents(data);
  };

  const fetchCurriculum = async () => {
    const { data } = await supabase
      .from('v2_curriculums')
      .select('*')
      .eq('workspace_id', resolvedParams.id)
      .order('created_at', { ascending: true });
    if (data) setCurriculum(data);
  };

  // if (isLoading) return <div className="h-screen w-full flex items-center justify-center p-20"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  const isAdmin = currentUser?.role === 'admin';
  const isAdminView = isAdmin && !isPreviewMode;

  const TABS = [
    ...(isAdminView ? [{ id: "students", label: "Student List & Groups", icon: <Users size={16} /> }] : []),
    { id: "curriculum", label: isAdminView ? "Curriculum Assignments" : "My Tasks & Learning", icon: <BookOpen size={16} /> },
    { id: "grades", label: isAdminView ? "Grading Matrix" : "My Results", icon: <BarChart4 size={16} /> },
    { id: "attendance", label: isAdminView ? "Attendance History" : "My Attendance", icon: <CheckCircle2 size={16} /> }
  ];

  return (
    <div className="p-6 md:p-10 xl:p-12 space-y-12 max-w-[1700px] mx-auto min-h-screen">
      {/* Simulation Banner */}
      <AnimatePresence>
        {isPreviewMode && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-emerald-500 text-white p-4 rounded-3xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20"
          >
            <Eye size={16} /> SIMULASI TAMPILAN MURID (PREVIEW MODE)
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 py-10 px-10 bg-slate-900 rounded-[44px] text-white overflow-hidden relative shadow-2xl">
        {/* Glow */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-500/20 blur-[100px] rounded-full" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-500/20 blur-[100px] rounded-full" />

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/v2/batch" className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10 group">
              <ChevronRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div className={`px-3 py-1 rounded-full text-white text-[9px] font-black uppercase tracking-widest ${isAdminView ? 'bg-blue-600' : 'bg-emerald-500'}`}>
              {isAdminView ? 'Cohort Management' : 'Student Portal'}
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">{batch?.name || "Loading Batch..."}</h1>
            {!isAdminView && <p className="text-emerald-400 font-bold tracking-widest uppercase text-xs">Simulated view as {currentUser?.full_name}!</p>}
            <div className="flex flex-wrap gap-6 items-center opacity-60">
              <p className="flex items-center gap-2 text-sm font-bold"><Zap size={14} className="text-blue-400" /> {batch?.status === 'active' ? 'Ongoing Batch' : 'Batch Completed'}</p>
              <div className="h-1 w-1 rounded-full bg-white/30" />
              <p className="flex items-center gap-2 text-sm font-bold"><Users size={14} className="text-blue-400" /> {students.length} / {batch?.max_members} Students</p>
              <div className="h-1 w-1 rounded-full bg-white/30" />
              <p className="flex items-center gap-2 text-sm font-bold"><Clock size={14} className="text-blue-400" /> {batch?.description || "No description provided."}</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex gap-4 xl:mb-2">
           {isAdmin ? (
             <>
               {isAdminView && (
                 <Button 
                   onClick={() => setIsRegModalOpen(true)}
                   className="h-14 px-8 rounded-2xl bg-white text-slate-900 font-bold text-sm shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3"
                 >
                   <UserPlus size={18} /> Add Student
                 </Button>
               )}
               <Button 
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`h-14 px-8 rounded-2xl font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-3 ${isPreviewMode ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
               >
                 {isPreviewMode ? <EyeOff size={18} /> : <Eye size={18} />}
                 {isPreviewMode ? 'Exit Preview' : 'Student Preview'}
               </Button>
               {isAdminView && (
                  <Button 
                    onClick={handleShare}
                    className={`h-14 px-8 rounded-2xl font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-3 ${isCopied ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    {isCopied ? <Check size={18} /> : <Share2 size={18} />}
                    {isCopied ? 'Link Copied' : 'Share Batch'}
                  </Button>
               )}
             </>
           ) : (
             <Button className="h-14 px-8 rounded-2xl bg-white/10 text-white font-bold text-sm border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-3">
               <MessageSquare size={18} /> Contact Mentor
             </Button>
           )}
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex gap-4 p-2 bg-slate-50 border border-slate-100 rounded-3xl w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-8 py-4 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest transition-all ${activeTab === t.id ? "bg-white text-blue-600 shadow-lg shadow-blue-500/5 border border-slate-100" : "text-slate-400 hover:text-slate-900"}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content Rendering */}
      <AnimatePresence mode="wait">
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.2 }}
           className="min-h-[500px]"
        >
          {activeTab === 'students' && (
             <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Master Student List Table */}
                <Card className="xl:col-span-8 p-0 border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden rounded-[44px]">
                  <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">Active Students</h3>
                    <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                      <Search size={16} className="text-slate-400" />
                      <input placeholder="Cari nama murid..." className="bg-transparent border-none focus:outline-none text-sm font-bold w-48" />
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/50">
                          <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">FullName</th>
                          <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Team / Group</th>
                          <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                          <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((mem) => (
                           <tr key={mem.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                             <td className="px-10 py-6">
                               <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                                   {mem.v2_profiles?.avatar_url && <img src={mem.v2_profiles.avatar_url} className="w-full h-full object-cover" />}
                                 </div>
                                 <div>
                                   <p className="text-sm font-black text-[#0F172A]">{mem.v2_profiles?.full_name}</p>
                                   <p className="text-[10px] font-bold text-slate-400">Student ID: {mem.id.slice(0, 8)}</p>
                                 </div>
                               </div>
                             </td>
                             <td className="px-10 py-6">
                               <div className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black border border-blue-100 w-fit">
                                 {mem.group_name || "Unassigned"}
                               </div>
                             </td>
                             <td className="px-10 py-6">
                                <span className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Authorized
                                </span>
                             </td>
                             <td className="px-10 py-6">
                               <button className="text-slate-400 hover:text-blue-600 transition-colors"><MessageSquare size={18} /></button>
                             </td>
                           </tr>
                        ))}
                      </tbody>
                    </table>
                    {students.length === 0 && <div className="p-20 text-center opacity-40"><Users size={44} className="mx-auto mb-4" /><p className="font-bold text-xs">Belum ada murid di batch ini.</p></div>}
                  </div>
                </Card>

                {/* Group Management Widget */}
                <div className="xl:col-span-4 space-y-8">
                   <Card className="p-10 border-none shadow-xl shadow-slate-200/50 bg-white rounded-[44px]">
                      <div className="space-y-6">
                         <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-[#0F172A]">Batch Analytics</h3>
                            <Award className="text-amber-500" size={24} />
                         </div>
                         <div className="space-y-4">
                            {[
                               { label: 'Avg Post-Test', val: '0', color: 'bg-blue-600' },
                               { label: 'Avg Attendance', val: '0%', color: 'bg-emerald-600' },
                               { label: 'Pending Assessment', val: '0', color: 'bg-rose-500' }
                            ].map((s, i) => (
                               <div key={i} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</span>
                                  <span className={`text-xl font-black ${s.color.replace('bg-', 'text-')}`}>{s.val}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                   </Card>

                   <Card className="p-10 border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-[44px] relative overflow-hidden">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
                      <div className="relative z-10 space-y-6">
                         <h3 className="text-xl font-black">Group Challenge</h3>
                         <p className="text-white/60 text-sm font-medium leading-relaxed">
                            Bagi 50 murid menjadi beberapa tim diskusi untuk mengerjakan Challenge Akhir selama 3 minggu.
                         </p>
                         <Button className="w-full h-14 bg-white text-blue-700 font-bold rounded-2xl hover:scale-105 transition-all">
                            Manage Groups
                         </Button>
                      </div>
                   </Card>
                </div>
             </div>
          )}

          {activeTab === 'curriculum' && (
             <div className="max-w-4xl mx-auto space-y-10">
                <div className="flex items-center justify-between px-6">
                   <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">Curriculum Assignments</h3>
                   <Button className="bg-blue-600 text-white h-12 px-6 rounded-xl font-bold flex items-center gap-2">
                     <Plus size={18} /> New Assignment
                   </Button>
                </div>
                
                <div className="space-y-6 pb-20">
                   {[
                      { id: 1, title: 'Post-Test 1: Niche Research', type: 'post_test', due: 'March 29, 2026' },
                      { id: 2, title: 'Individual: Content Pillar Setup', type: 'individual_assignment', due: 'April 02, 2026' },
                      { id: 3, title: 'Group Challenge: Agency Proposal', type: 'challenge', due: 'April 15, 2026' }
                   ].map((c) => (
                      <Card key={c.id} className="p-8 border-none shadow-sm hover:shadow-xl transition-all bg-white rounded-[32px] group">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${c.type === 'post_test' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-600'}`}>
                                  {c.type === 'post_test' ? <FileText size={24} /> : <Target size={24} />}
                               </div>
                               <div>
                                  <h4 className="text-lg font-black text-[#0F172A] group-hover:text-blue-600 transition-colors uppercase tracking-tight">{c.title}</h4>
                                  <div className="flex items-center gap-4 mt-1 opacity-50">
                                     <p className="text-[10px] font-black uppercase tracking-widest">{c.type.replace('_', ' ')}</p>
                                     <div className="w-1 h-1 rounded-full bg-slate-400" />
                                     <p className="text-[10px] font-bold">Due: {c.due}</p>
                                  </div>
                               </div>
                            </div>
                            <Button className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all">
                               <ChevronRight size={20} />
                            </Button>
                         </div>
                      </Card>
                   ))}
                </div>
             </div>
          )}

          {activeTab === 'grades' && (
             <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
                   <BarChart4 size={32} />
                </div>
                <div>
                   <h3 className="text-xl font-black text-[#0F172A]">Grading Matrix V2</h3>
                   <p className="text-slate-400 text-sm font-medium mt-2">Coming soon: Matriks penilaian 12 poin untuk post-test, assignments, dan pameran hasil akhir.</p>
                </div>
             </div>
          )}

          {activeTab === 'attendance' && (
             <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
                   <CheckCircle2 size={32} />
                </div>
                <div>
                   <h3 className="text-xl font-black text-[#0F172A]">Presensi Kehadiran</h3>
                   <p className="text-slate-400 text-sm font-medium mt-2">Monitor tingkat kehadiran 50 murid Anda di setiap sesi mentoring live.</p>
                </div>
             </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ADD STUDENT MODAL (Option A) */}
      <AnimatePresence>
        {isRegModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[44px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-100"
            >
              <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">Add New Student</h3>
                <button onClick={() => setIsRegModalOpen(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all"><X size={24} /></button>
              </div>

              <div className="p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">FULL NAME</label>
                  <input 
                    value={newStudent.fullName}
                    onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
                    placeholder="e.g. Budi Santoso"
                    className="w-full h-14 rounded-2xl bg-neutral-50 px-6 font-bold text-sm border border-slate-100 focus:outline-none focus:ring-2 ring-blue-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">EMAIL ADDRESS</label>
                  <input 
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    placeholder="budisantoso@email.com"
                    className="w-full h-14 rounded-2xl bg-neutral-50 px-6 font-bold text-sm border border-slate-100 focus:outline-none focus:ring-2 ring-blue-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">TEMP PASSWORD</label>
                  <input 
                    value={newStudent.password}
                    onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                    placeholder="e.g. Mentorhipers2024!"
                    className="w-full h-14 rounded-2xl bg-neutral-50 px-6 font-bold text-sm border border-slate-100 focus:outline-none focus:ring-2 ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="p-10 pt-0">
                <Button 
                  onClick={handleAddStudent}
                  className="w-full h-16 rounded-2xl bg-blue-600 text-white font-black text-sm shadow-xl shadow-blue-500/20 hover:scale-105 transition-all"
                >
                  Create Account & Generate Message
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
