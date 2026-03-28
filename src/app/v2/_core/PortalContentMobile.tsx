"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PlayCircle, 
  FileText, 
  ChevronRight, 
  Award, 
  CalendarCheck,
  Play,
  ArrowLeft,
  X,
  Star,
  Download,
  Home,
  User,
  Users,
  Layout,
  MessageSquare,
  Zap,
  CheckCircle2,
  Clock,
  TrendingUp,
  Target,
  Paperclip,
  ChevronDown,
  ExternalLink,
  BarChart,
  GraduationCap,
  CircleDashed,
  Sparkles,
  QrCode,
  ShieldCheck,
  ZapIcon,
  MapPin,
  Fingerprint,
  Stethoscope,
  MessageCircle,
  RotateCcw
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { getYouTubeEmbedUrl } from "@/lib/utils";
import dynamic from "next/dynamic";

// Dynamic Import for IdCard
const IdCardContent = dynamic(() => import("./IdCardContent"), {
  loading: () => <div className="h-64 flex items-center justify-center text-white/20">Loading Identity...</div>,
  ssr: false
});

export default function PortalContentMobile({ id }: { id: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home'); 
  const [batch, setBatch] = useState<any>(null);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [membership, setMembership] = useState<any>(null);
  const [myQuizResults, setMyQuizResults] = useState<any[]>([]);
  const [myAssignments, setMyAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [isAssetsExpanded, setIsAssetsExpanded] = useState(false);
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const idCardRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // Statistics
  const [stats, setStats] = useState({
    gpa: 0,
    attendanceRate: 0,
    tasksDone: 0,
    totalTasks: 0,
    plusPoints: 0,
    nextSession: null as any,
    activeSessionToday: null as any
  });

  const initMobile = async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
       router.push('/v2/login');
       return;
    }

    const [bRes, cRes, pRes, mRes, qRes, sRes] = await Promise.all([
      supabase.from('v2_workspaces').select('*').eq('id', id).single(),
      supabase.from('v2_curriculums').select('*').eq('workspace_id', id).order('created_at', { ascending: true }),
      supabase.from('v2_profiles').select('*').eq('id', user.id).single(),
      supabase.from('v2_memberships').select('*').eq('workspace_id', id).eq('profile_id', user.id).single(),
      supabase.from('v2_quiz_results').select('curriculum_id, score').eq('profile_id', user.id).eq('workspace_id', id),
      supabase.from('v2_submissions').select('*, v2_curriculums(title)').eq('profile_id', user.id).eq('workspace_id', id)
    ]);

    const batchData = bRes.data;
    const curriculumData = cRes.data || [];
    const profileData = pRes.data;
    const membershipData = mRes.data;
    const quizResults = qRes.data || [];
    const assignmentSubmissions = sRes.data || [];

    setBatch(batchData);
    setCurriculum(curriculumData);
    setCurrentUser(profileData);
    setMembership(membershipData);
    setMyQuizResults(quizResults);
    setMyAssignments(assignmentSubmissions);

    if (curriculumData.length > 0) {
       setSelectedLesson(curriculumData.find((c: any) => c.type === 'material') || curriculumData[0]);
    }

    // Statistics Calculation
    const tasks = curriculumData.filter((c: any) => c.type !== 'material' && c.is_published !== false);
    let totalPT = 0, countPT = 0, totalGC = 0, countGC = 0, totalAssign = 0, countAssign = 0;
    
    tasks.forEach((t: any) => {
       const qr = quizResults.find(si => si.curriculum_id === t.id);
       const sub = assignmentSubmissions.find(si => si.curriculum_id === t.id);
       let scoreValue = 0;
       if (t.type === 'post_test') scoreValue = qr?.score || 0;
       else if (sub?.grade) {
          const gMap: any = { 'A+': 100, 'A': 90, 'B+': 80, 'B': 70, 'C': 60, 'D': 40 };
          scoreValue = gMap[sub.grade] || 0;
       }
       if (t.type === 'post_test') { totalPT += scoreValue; countPT++; }
       else if (t.type === 'challenge') { totalGC += scoreValue; countGC++; }
       else if (t.type === 'individual_assignment') { totalAssign += scoreValue; countAssign++; }
    });

    const avgPT = countPT > 0 ? totalPT / countPT : 0;
    const avgAssign = countAssign > 0 ? totalAssign / countAssign : 0;
    const avgGC = countGC > 0 ? totalGC / countGC : 0;
    const attendCount = Object.values(membershipData?.attendance || {}).filter(v => v === 'P').length;
    const totalSessions = batchData?.schedules?.length || 0; 
    const attendScore = totalSessions > 0 ? (attendCount / totalSessions) * 100 : 0;
    const plusPointsTotal = Object.values(membershipData?.plus_points || {}).reduce((a: any, b: any) => (parseInt(a) || 0) + (parseInt(b) || 0), 0) as number;
    const finalKeaktifan = Math.min(100, attendScore + plusPointsTotal);
    const finalAvg = (avgPT * 0.3 + avgAssign * 0.3 + avgGC * 0.2 + finalKeaktifan * 0.2);

    const now = new Date();
    const schedules = (batchData?.schedules || []).map((s: any) => ({ ...s, dateObj: new Date(s.date) }));
    const nextS = schedules.filter((s: any) => s.dateObj >= now).sort((a: any, b: any) => a.dateObj.getTime() - b.dateObj.getTime())[0];
    const activeToday = schedules.find((s: any) => s.dateObj.toDateString() === now.toDateString());

    setStats({
       gpa: Math.round(finalAvg),
       attendanceRate: Math.round(attendScore),
       tasksDone: quizResults.length + assignmentSubmissions.length,
       totalTasks: tasks.length,
       plusPoints: plusPointsTotal,
       nextSession: nextS || curriculumData.find((c: any) => c.type === 'material' && new Date(c.due_date || c.created_at) > now),
       activeSessionToday: activeToday
    });

    // Fetch group members
    if (membershipData?.group_name && membershipData.group_name !== 'Unassigned') {
      const { data: groupMemData } = await supabase
        .from('v2_memberships')
        .select('id, profile_id, group_name, is_leader, group_wa_link')
        .eq('workspace_id', id)
        .eq('group_name', membershipData.group_name);

      if (groupMemData && groupMemData.length > 0) {
        console.log(`🔍 Mobile Group Sync: Joining for ${membershipData.group_name}`);
        
        // Single atomic Join Query
        const { data: memWithProfs, error: joinErr } = await supabase
          .from('v2_memberships')
          .select(`
            *,
            v2_profiles:profile_id (
              id,
              full_name,
              avatar_url
            )
          `)
          .eq('workspace_id', id)
          .eq('group_name', membershipData.group_name);
        
        if (joinErr) {
          console.error("❌ Mobile Group Join Failed:", joinErr.message);
          // Fallback
          const { data: fallback } = await supabase.from('v2_memberships').select('*').eq('workspace_id', id).eq('group_name', membershipData.group_name);
          if (fallback) setGroupMembers(fallback);
        } else {
          setGroupMembers(memWithProfs || []);
        }
      }
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    initMobile();
  }, [id, router]);

  const handleManualAttendance = async (sessionId: string, status: 'P' | 'S' | 'I' | null) => {
    if (!membership || !sessionId) return;
    const currentAttendance = membership.attendance || {};
    setIsLoading(true);
    let updatedAttendance = { ...currentAttendance };
    if (status === null) delete updatedAttendance[sessionId];
    else updatedAttendance[sessionId] = status;
    const { error } = await supabase.from('v2_memberships').update({ attendance: updatedAttendance }).eq('id', membership.id);
    if (error) alert("Gagal update absen: " + error.message);
    else await initMobile();
    setIsLoading(false);
  };

  const handleDownloadCard = async () => {
    if (!idCardRef.current) return;
    setIsLoading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(idCardRef.current, { backgroundColor: null, scale: 3, logging: false, useCORS: true });
      const link = document.createElement('a');
      link.download = `ID-${currentUser?.full_name?.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err: any) {
      alert("Failed Download: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/v2/login');
  };

  if (isLoading && !batch) return (
     <div className="min-h-screen bg-white flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin mb-6" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Synchronizing Identity...</p>
     </div>
  );

  const isRuangSosmed = batch?.name?.toLowerCase()?.includes('ruang sosmed');

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans pb-32">
      
      {/* 1. TOP NATIVE HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm">
         <div className="flex items-center gap-3">
            <div className="w-9 h-9 active:scale-90 transition-transform">
               <img src="/logo_rs.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
               <h1 className="text-sm font-black text-slate-900 tracking-tight leading-normal truncate max-w-[120px]">
                  {isRuangSosmed ? 'Ruang Sosmed' : 'Student Portal'}
               </h1>
               <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest -mt-0.5">LMS Environment</p>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-white shadow-sm" onClick={() => setActiveTab('profile')}>
               {currentUser?.avatar_url ? <img src={currentUser.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-100 flex items-center justify-center font-black text-xs">{currentUser?.full_name?.charAt(0)}</div>}
            </div>
         </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto">
         
         {/* HOME TAB */}
         {activeTab === 'home' && (
            <div className="px-6 py-8 space-y-10">
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                  <div className="space-y-1 flex items-center justify-between">
                     <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Hi, {currentUser?.full_name?.split(' ')[0]}!👋</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{membership?.group_name || 'Individual Scholar'}</p>
                     </div>
                     <div className="flex items-baseline gap-1 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                        <TrendingUp size={12} className="text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-600 tracking-tighter">GPA {stats.gpa}</span>
                     </div>
                  </div>

                  {/* SMART ATTENDANCE WIDGET */}
                  {stats.activeSessionToday && (
                     <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className={`p-6 rounded-[36px] relative shadow-xl border-4 border-white overflow-hidden bg-white shadow-slate-200/50`}>
                        <div className="space-y-6">
                           <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                 <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">Live Attendance</p>
                                 <h4 className="text-sm font-black tracking-tight text-slate-900">{stats.activeSessionToday.title}</h4>
                              </div>
                              <CalendarCheck size={20} className="text-blue-500" />
                           </div>

                           {membership?.attendance?.[stats.activeSessionToday.id] ? (
                              <div className="flex items-center justify-between gap-4">
                                 <div className={`flex-1 h-14 rounded-2xl flex items-center px-4 gap-3 ${
                                    membership.attendance[stats.activeSessionToday.id] === 'P' ? 'bg-emerald-50 text-emerald-600' :
                                    membership.attendance[stats.activeSessionToday.id] === 'S' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                                 }`}>
                                    <CheckCircle2 size={18} strokeWidth={3} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                       Status: {
                                          membership.attendance[stats.activeSessionToday.id] === 'P' ? 'Hadir' :
                                          membership.attendance[stats.activeSessionToday.id] === 'S' ? 'Sakit' : 'Izin'
                                       }
                                    </span>
                                 </div>
                                 <button onClick={() => handleManualAttendance(stats.activeSessionToday.id, null)} className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center active:scale-95 transition-all border border-slate-100"><RotateCcw size={18} /></button>
                              </div>
                           ) : (
                              <div className="grid grid-cols-1 gap-2">
                                 <button onClick={() => handleManualAttendance(stats.activeSessionToday.id, 'P')} className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"><Fingerprint size={16} /> Hadir Sekarang</button>
                                 <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => handleManualAttendance(stats.activeSessionToday.id, 'S')} className="h-12 bg-amber-50 text-amber-600 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] border border-amber-100 flex items-center justify-center gap-2"><Stethoscope size={14} /> Sakit</button>
                                    <button onClick={() => handleManualAttendance(stats.activeSessionToday.id, 'I')} className="h-12 bg-sky-50 text-sky-600 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] border border-sky-100 flex items-center justify-center gap-2"><MessageCircle size={14} /> Izin</button>
                                 </div>
                              </div>
                           )}
                        </div>
                     </motion.div>
                  )}

                  {/* JOURNEY CARD */}
                  <div className={`p-8 bg-gradient-to-br ${isRuangSosmed ? 'from-[#0ea5e9] to-[#1e3a8a]' : 'from-[#0F172A] to-[#1E293B]'} rounded-[44px] text-white relative overflow-hidden shadow-2xl active:scale-[0.98] transition-all`}>
                     <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between">
                           <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[9px] font-black uppercase tracking-widest border border-white/20">Ongoing Journey</div>
                           <Award size={20} className="text-amber-400" />
                        </div>
                        <h3 className="text-xl font-black leading-tight">{batch?.name}</h3>
                        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black border border-white/10"><Clock size={20} /></div>
                              <div>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-sky-300">Next Class</p>
                                 <p className="text-xs font-bold truncate max-w-[140px]">{stats.nextSession?.title || 'Check Calendar'}</p>
                              </div>
                           </div>
                           <button onClick={() => setActiveTab('learning')} className="w-10 h-10 rounded-xl bg-white text-blue-900 flex items-center justify-center shadow-lg shadow-white/20"><PlayCircle size={20} /></button>
                        </div>
                     </div>
                  </div>

                  {/* TEAM / GROUP WIDGET */}
                  {groupMembers.length > 0 && (
                     <div className="bg-white border border-slate-100 rounded-[36px] shadow-sm shadow-slate-200/50 overflow-hidden">
                       {/* Header */}
                       <div className="px-6 pt-6 pb-4 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className="w-9 h-9 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                             <Users size={16} />
                           </div>
                           <div>
                             <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-tight">Your Group</p>
                             <h4 className="text-sm font-black text-slate-900 tracking-tight leading-tight mt-0.5">{membership?.group_name}</h4>
                           </div>
                         </div>
                         {/* WA Button */}
                         {groupMembers.find((m: any) => m.group_wa_link)?.group_wa_link ? (
                           <a
                             href={groupMembers.find((m: any) => m.group_wa_link)?.group_wa_link}
                             target="_blank" rel="noreferrer"
                             className="flex items-center gap-2 px-4 h-10 rounded-2xl bg-[#25D366] text-white font-black text-[9px] uppercase tracking-widest shadow-lg shadow-[#25D366]/20 active:scale-95 transition-all"
                           >
                             <MessageSquare size={14} fill="white" /> Join WA
                           </a>
                         ) : (
                           <div className="flex items-center gap-2 px-4 h-10 rounded-2xl bg-slate-50 text-slate-300 font-black text-[9px] uppercase tracking-widest border border-slate-100">
                             <MessageSquare size={14} /> WA Soon
                           </div>
                         )}
                       </div>

                       {/* Members list */}
                       <div className="px-4 pb-5 space-y-2">
                         {groupMembers.map((m: any) => (
                           <div key={m.id} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                             m.profile_id === currentUser?.id ? 'bg-indigo-50 border border-indigo-100' : 'bg-slate-50'
                           }`}>
                             {/* Avatar */}
                             <div className={`relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 ${
                               m.is_leader ? 'ring-2 ring-amber-400 ring-offset-1' : 'ring-1 ring-slate-100 shadow-inner'
                             }`}>
                               {m.v2_profiles?.avatar_url ? (
                                 <img src={m.v2_profiles.avatar_url} alt={m.v2_profiles?.full_name} className="w-full h-full object-cover" />
                               ) : (
                                 <div className="w-full h-full bg-slate-200 flex items-center justify-center font-black text-xs text-slate-500">
                                   {m.v2_profiles?.full_name?.charAt(0) || '?'}
                                 </div>
                               )}
                               {m.is_leader && (
                                 <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-md flex items-center justify-center border-2 border-white shadow-sm">
                                   <Star size={8} fill="white" className="text-white" />
                                 </div>
                               )}
                             </div>

                             {/* Name & role */}
                             <div className="flex-1 min-w-0">
                               <p className="text-sm font-black text-slate-800 truncate leading-tight">
                                 {m.v2_profiles?.full_name}
                                 {m.profile_id === currentUser?.id && (
                                   <span className="ml-2 text-[8px] font-black text-indigo-500 bg-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-widest">You</span>
                                 )}
                               </p>
                               <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${
                                 m.is_leader ? 'text-amber-500' : 'text-slate-400'
                               }`}>
                                 {m.is_leader ? '⭐ Team Leader' : 'SQUAD MEMBER'}
                               </p>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                  {/* STATS GRID */}
                  <div className="grid grid-cols-2 gap-4">
                     {[
                        { label: 'Bonus Points', val: `+${stats.plusPoints}`, icon: <Star size={18} fill="currentColor" />, color: 'amber' },
                        { label: 'Tasks Log', val: `${stats.tasksDone}/${stats.totalTasks}`, icon: <CheckCircle2 size={18} />, color: 'emerald' }
                     ].map(item => (
                        <div key={item.label} className="p-6 bg-white border border-slate-100 rounded-[36px] shadow-sm space-y-4 shadow-slate-200/50">
                           <div className={`w-10 h-10 rounded-2xl bg-${item.color}-50 text-${item.color}-500 flex items-center justify-center shadow-inner`}><div className="scale-110">{item.icon}</div></div>
                           <div>
                              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">{item.label}</p>
                              <p className="text-xl font-black text-slate-800 tracking-tight">{item.val}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </motion.div>
            </div>
         )}

         {/* LEARNING TAB */}
         {activeTab === 'learning' && (
            <div className="flex flex-col min-h-screen pb-32">
               <div className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
                  <div className="px-6 pt-3 pb-4">
                     <div className="aspect-video bg-black relative w-full overflow-hidden rounded-[40px] shadow-2xl border-[6px] border-white">
                        {selectedLesson?.video_url ? (
                           <iframe src={getYouTubeEmbedUrl(selectedLesson.video_url)} className="w-full h-full" allowFullScreen />
                        ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center text-white/20 bg-slate-900 p-8 text-center">
                              <Play size={48} className="mb-4 opacity-10" />
                              <p className="text-xs font-black uppercase tracking-widest">Select your module</p>
                           </div>
                        )}
                     </div>
                  </div>
                  <div className="px-6 pb-6 space-y-4">
                     <div className="space-y-1">
                        <div className="flex items-center gap-2"><span className="text-[8px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-widest">Watching</span><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">• {selectedLesson?.module_name || 'Module'}</p></div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight line-clamp-1">{selectedLesson?.title}</h3>
                     </div>
                     {selectedLesson?.assets_json?.length > 0 && (
                        <div className="space-y-3">
                           <button onClick={() => setIsAssetsExpanded(!isAssetsExpanded)} className={`w-full h-14 rounded-2xl flex items-center justify-between px-6 transition-all ${isAssetsExpanded ? 'bg-slate-900 text-white' : 'bg-amber-50 text-amber-600'}`}>
                              <div className="flex items-center gap-3"><Paperclip size={18} /><span className="text-xs font-black uppercase tracking-widest">Resources ({selectedLesson.assets_json.length})</span></div>
                              <motion.div animate={{ rotate: isAssetsExpanded ? 180 : 0 }}><ChevronDown size={18} /></motion.div>
                           </button>
                           <AnimatePresence>{isAssetsExpanded && <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="overflow-hidden space-y-2">{selectedLesson.assets_json.map((a: any, i: number) => (<a key={i} href={a.url} target="_blank" className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm shadow-slate-200/10 transition-all active:scale-[0.98]"><div className="flex items-center gap-4 text-slate-700"><ExternalLink size={16} /><span className="text-xs font-bold truncate max-w-[180px]">{a.name}</span></div><Download size={14} className="text-slate-400" /></a>))}</motion.div>}</AnimatePresence>
                        </div>
                     )}
                  </div>
               </div>
               <div className="px-6 py-6 space-y-3 pb-8">
                  {curriculum.map((item, idx) => (
                     <div key={item.id} onClick={() => { setSelectedLesson(item); setIsAssetsExpanded(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`p-5 rounded-[28px] border-2 flex items-center justify-between transition-all ${selectedLesson?.id === item.id ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-white border-slate-100 text-slate-800'}`}>
                        <div className="flex items-center gap-4"><div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${selectedLesson?.id === item.id ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-300'}`}>{item.type === 'material' ? <Play size={16} fill="currentColor" /> : <FileText size={16} />}</div><div className="max-w-[170px]"><p className={`text-[8px] font-bold uppercase tracking-widest mb-0.5 ${selectedLesson?.id === item.id ? 'text-white/60' : 'text-slate-400'}`}>{item.module_name || `Module ${idx+1}`}</p><h4 className="text-sm font-black tracking-tight truncate">{item.title}</h4></div></div>
                        <ChevronRight size={16} className={selectedLesson?.id === item.id ? 'text-white' : 'text-slate-200'} />
                     </div>
                  ))}
               </div>
            </div>
         )}

         {/* TASKS TAB */}
         {activeTab === 'tasks' && (
            <div className="px-6 py-8 space-y-8">
               <div className="space-y-2 px-2"><h3 className="text-xl font-black text-slate-900 tracking-tight">Active Assignments</h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{curriculum.filter(c => c.type !== 'material' && c.is_published !== false).length - (myQuizResults.length + myAssignments.length)} Items Pending</p></div>
               <div className="space-y-4 pb-8">
                  {curriculum.filter(c => c.type !== 'material' && c.is_published !== false).map((c) => {
                     const isDone = myQuizResults.some(q => q.curriculum_id === c.id) || myAssignments.some(a => a.curriculum_id === c.id);
                     return (
                        <div key={c.id} className={`p-6 bg-white border ${isDone ? 'border-emerald-100' : 'border-slate-100'} rounded-[36px] flex items-center justify-between shadow-sm shadow-slate-200/50`}>
                           <div className="flex items-center gap-4"><div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${isDone ? 'bg-emerald-50 text-emerald-500 shadow-inner' : 'bg-slate-50 text-slate-300 shadow-inner'}`}>{isDone ? <CheckCircle2 size={20} /> : <FileText size={20} />}</div><div><h4 className="text-sm font-black text-slate-800 tracking-tight line-clamp-1">{c.title}</h4><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{c.type.replace(/_/g, ' ')}</p></div></div>
                           <ChevronRight size={18} className="text-slate-200" />
                        </div>
                     );
                  })}
               </div>
            </div>
         )}

         {/* PROFILE TAB */}
         {activeTab === 'profile' && (
            <div className="px-6 py-10 space-y-12 mb-20">
               <div className="flex flex-col items-center text-center space-y-4 pt-4">
                  <div className="w-24 h-24 rounded-[40px] bg-white p-1 shadow-2xl relative shadow-slate-300/50">
                     <div className="w-full h-full rounded-[36px] bg-slate-100 overflow-hidden ring-4 ring-white">{currentUser?.avatar_url ? <img src={currentUser.avatar_url} alt={currentUser?.full_name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-3xl text-slate-400">{currentUser?.full_name?.charAt(0)}</div>}</div>
                     <div className="absolute -bottom-1 -right-1 p-2 bg-emerald-500 text-white rounded-xl shadow-lg border-2 border-white"><CheckCircle2 size={12} strokeWidth={3} /></div>
                  </div>
                  <div><h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-tight mb-2">{currentUser?.full_name}</h3><div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600"><User size={10} /><span className="text-[9px] font-black uppercase tracking-widest">{membership?.group_name || 'Individual scholar'}</span></div></div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest px-2">Official Identity</h4>
                  <div onClick={() => setIsIdCardOpen(true)} className="relative aspect-[1.6/1] bg-gradient-to-br from-white to-blue-50 rounded-[32px] shadow-2xl overflow-hidden active:scale-95 transition-all group border-4 border-white ring-1 ring-slate-100 shadow-slate-200/60">
                     <div className="absolute inset-0 p-8 flex items-center justify-between">
                        <div className="space-y-4">
                           <div className="w-24 h-12 flex items-center justify-start">
                             <img src="/logo_rs.png" className="w-full h-full object-contain object-left" alt="RS" />
                           </div>
                           <div className="space-y-1">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-tight">Registered Member</p>
                              <p className="text-slate-900 font-black text-lg uppercase tracking-tight">{currentUser?.full_name?.split(' ')[0]}</p>
                           </div>
                        </div>
                        <div className="w-24 h-24 rounded-3xl bg-white border border-slate-100 shadow-xl flex items-center justify-center overflow-hidden rotate-6">{currentUser?.avatar_url ? <img src={currentUser.avatar_url} alt={currentUser?.full_name} className="w-full h-full object-cover" /> : <QrCode size={40} className="text-slate-200" />}</div>
                     </div>
                     <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-white/90 to-transparent flex justify-end transition-transform group-hover:translate-y-0 translate-y-2">
                        <div className="px-4 py-2 rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 text-[8px] font-black text-white uppercase tracking-widest flex items-center gap-2">View Full Card <Sparkles size={10} /></div>
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest px-2">Learning Insights</h4>
                  <div className="grid grid-cols-1 gap-4">
                     <div className="p-8 bg-white border border-slate-100 rounded-[44px] shadow-sm flex items-center justify-between overflow-hidden relative shadow-slate-200/50">
                        <div className="absolute -right-8 -bottom-8 opacity-[0.03] scale-150 rotate-12"><GraduationCap size={120} /></div>
                        <div className="space-y-4"><div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner"><Target size={22} /></div><div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Overall GPA</p><p className="text-3xl font-black text-slate-900 tracking-tight">{stats.gpa}<span className="text-slate-200 text-lg">/100</span></p></div></div>
                        <div className="relative w-20 h-20"><svg className="w-full h-full -rotate-90"><circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-50" /><motion.circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="10" strokeDasharray={213.6} initial={{ strokeDashoffset: 213.6 }} animate={{ strokeDashoffset: 213.6 - (stats.gpa / 100 * 213.6) }} strokeLinecap="round" fill="transparent" className="text-indigo-600 shadow-lg" /></svg><div className="absolute inset-0 flex items-center justify-center"><BarChart size={16} className="text-slate-300" /></div></div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-7 bg-white border border-slate-100 rounded-[40px] shadow-sm space-y-4 shadow-slate-200/50"><div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner"><CalendarCheck size={18} /></div><div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Attendance</p><p className="text-xl font-black text-slate-800">{stats.attendanceRate}%</p></div></div>
                        <div className="p-7 bg-white border border-slate-100 rounded-[40px] shadow-sm space-y-4 shadow-slate-200/50"><div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-inner"><ZapIcon size={18} /></div><div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Task Status</p><p className="text-xl font-black text-slate-800">{stats.tasksDone}<span className="text-slate-300 text-[10px]">/{stats.totalTasks}</span></p></div></div>
                     </div>
                  </div>
               </div>

               <button 
                  onClick={handleSignOut} 
                  className="w-full h-16 bg-white border border-rose-100 text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-[32px] flex items-center justify-center gap-3 active:bg-rose-50 shadow-sm shadow-rose-200/20"
               >
                  Sign Out from Portal <ArrowLeft size={16} />
               </button>
            </div>
         )}
      </main>

      {/* 3. ID CARD MODAL */}
      <AnimatePresence>
         {isIdCardOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-8">
               <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full flex flex-col items-center gap-12">
                  <div className="flex items-center gap-3 text-white/30"><ShieldCheck size={16} /><p className="text-[10px] font-black uppercase tracking-[0.3em]">Official Identity Card</p></div>
                  <div className="relative w-full max-w-sm">
                     <div className="absolute -inset-10 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
                     <div ref={idCardRef} className="w-full h-fit rounded-[48px] overflow-hidden shadow-2xl bg-slate-900 border border-white/5">
                        <div className="p-10 pb-12 text-white h-full"><IdCardContent batch={batch} currentUser={currentUser} me={membership} resolvedParams={{ id }} /></div>
                     </div>
                  </div>
                  <button onClick={() => setIsIdCardOpen(false)} className="px-10 h-12 rounded-full bg-white/10 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center border border-white/10 active:scale-95 transition-all">Close</button>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* 4. NATIVE BOTTOM NAV - LIGHT AMBIENT THEME */}
      <nav className="fixed bottom-8 left-6 right-6 z-[100] h-20 bg-white/70 backdrop-blur-2xl rounded-2xl border border-white/40 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] flex items-center justify-around px-4">
         {[
            { id: 'home', icon: <Home size={22} strokeWidth={2.5} />, label: 'Home' },
            { id: 'learning', icon: <PlayCircle size={22} strokeWidth={2.5} />, label: 'Classes' },
            { id: 'tasks', icon: <FileText size={22} strokeWidth={2.5} />, label: 'Tasks' },
            { id: 'profile', icon: <User size={22} strokeWidth={2.5} />, label: 'Me' }
         ].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`relative flex flex-col items-center justify-center gap-1 transition-all ${activeTab === t.id ? 'text-sky-600 scale-105 font-black' : 'text-slate-400 font-bold'}`}>
               {activeTab === t.id && <motion.div layoutId="navTab" className="absolute -top-5 w-5 h-1 bg-sky-500 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.5)]" />}
               {t.icon}
               <span className="text-[7px] uppercase tracking-[0.2em]">{t.label}</span>
            </button>
         ))}
      </nav>
    </div>
  );
}
