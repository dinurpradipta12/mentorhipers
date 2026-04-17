"use client";



import React, { useState, useEffect, use, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

//Dynamic Imports for size optimization
const IdCardContent = dynamic(() => import("./IdCardContent"), {
  loading: () => <div className="h-64 flex items-center justify-center text-white/20">Loading Identity...</div>,
  ssr: false
});
import AvatarCreator from "./AvatarCreator";
import { 
  PlayCircle, 
  FileText, 
  Users, 
  ChevronRight, 
  Zap, 
  Clock, 
  Download,
  GraduationCap,
  Sparkles,
  BarChart3,
  Award,
  CalendarCheck,
  Play,
  ArrowLeft,
  ChevronLeft,
  Check,
  Target,
  MessageSquare,
  X,
  XCircle,
  CircleSlash,
  Star,
  CalendarDays,
  Video,
  Upload,
  QrCode,
  ShieldCheck,
  Fingerprint,
  Camera,
  Eye,
  Layout,
  Heart,
  ArrowRight,
  MessageCircle,
  Share2,
  LogOut,
  User
} from "lucide-react";
import { supabaseV2 as supabase } from "@/lib/supabase";
import { getCachedSession } from "@/lib/authCache";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { getYouTubeEmbedUrl } from "@/lib/utils";

function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;

      if (distance < 0) {
        setTimeLeft(null);
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        d: Math.floor(distance/(1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24))/(1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60))/(1000 * 60)),
        s: Math.floor((distance % (1000 * 60))/1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return <p className="text-rose-500 font-black text-2xl animate-pulse">CLASS STARTING SOON...</p>;

  return (
    <div className="flex gap-4 justify-center scale-90 md:scale-100">
      {Object.entries(timeLeft).map(([key, val]) => (
        <div key={key} className="flex flex-col items-center">
          <div className="w-16 h-20 bg-white/10 rounded-[24px] border border-white/20 backdrop-blur-md flex items-center justify-center">
            <span className="text-2xl font-black">{val < 10 ? `0${val}` : val}</span>
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest mt-3 opacity-40">{key === 'd' ? 'Days' : key === 'h' ? 'Hours' : key === 'm' ? 'Mins' : 'Secs'}</span>
        </div>
      ))}
    </div>
  );
}

export default function PortalContentDesktop({ id }: { id: string }) {
  const resolvedParams = { id };
  const [batch, setBatch] = useState<any>(null);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('learning');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);//To find me in the membership

 //Quiz & Submission States
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<any>({});
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [lastQuizResult, setLastQuizResult] = useState<number>(0);
  
  const [myQuizResults, setMyQuizResults] = useState<any[]>([]);
  const [myAssignments, setMyAssignments] = useState<any[]>([]);
  const [myCustomGroups, setMyCustomGroups] = useState<any[]>([]);
  const [selectedGroupToRepresent, setSelectedGroupToRepresent] = useState<string | null>(null);

  // Community Feed States
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [activeArticle, setActiveArticle] = useState<any>(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [submitForm, setSubmitForm] = useState({ file_link: '', mentor_feedback: '' });
  const [activeTask, setActiveTask] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isPhotoSetupOpen, setIsPhotoSetupOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);
  const idCardRef = useRef<HTMLDivElement>(null);

  const handleDownloadCard = async () => {
     if (!idCardRef.current) return;
     setIsLoading(true);
     try {
       //Dynamically import html2canvas only when needed
        const html2canvas = (await import("html2canvas")).default;
        
        const canvas = await html2canvas(idCardRef.current, {
           backgroundColor: null,
           scale: 2,
           logging: false,
           useCORS: true
        });
        const link = document.createElement('a');
        link.download = `Student-ID-${currentUser?.full_name?.replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
     } catch (err) {
        console.error("Download failed:", err);
        alert("Gagal mengunduh kartu. Silakan coba lagi.");
     } finally {
        setIsLoading(false);
     }
  };

  const handleShareActivity = async () => {
     const isRuangSosmed = batch?.name?.toLowerCase()?.includes('ruang sosmed');
     const brand = isRuangSosmed ? "Ruang Sosmed" : "Ruang Sosmed";
     const igTag = isRuangSosmed ? "@ruangsosmedid" : "@ruangsosmed";
     
     const shareText = `Official Member of ${brand}! 🛸✨\n\nSenang sekali bisa menjadi bagian dari ${batch?.name || 'Batch ini'}.\nReady to level up with ${igTag}!\n\n#${brand.replace(/\s+/g, '')} #LearningJourney #CreativeCareer`;

    //1. Copy to Clipboard
     try {
        await navigator.clipboard.writeText(shareText);
        alert("Caption keren sudah di-copy ke clipboard! ✨\n\nSekarang mengunduh kartu untuk kamu posting...");
     } catch (err) {
        console.error("Paste failed");
     }

    //2. Download Card
     await handleDownloadCard();

    //3. Web Share API if available
     if (navigator.share) {
        try {
           await navigator.share({
              title: `My ${brand} Identity`,
              text: shareText,
              url: window.location.href
           });
        } catch (err) {
           console.log("Share cancelled or failed");
        }
     }
  };

  useEffect(() => {
    setIsMounted(true);
    initPage();

    const savedTab = localStorage.getItem(`portal_tab_${resolvedParams.id}`);
    if (savedTab) setActiveTab(savedTab);

   //⚠️ REALTIME DISABLED to reduce connection load on Nano plan.
   //Each portal page open = 1 realtime connection. With many students, this exhausts Nano limits.
   //Re-enable after upgrading to Pro plan, or implement a polling fallback.
   //
   //const channel = supabase.channel('portal_sync')
   //  .on('postgres_changes', { event: '*', schema: 'public', table: 'v2_workspaces', filter: `id=eq.${resolvedParams.id}` }, () => fetchBatchDetail())
   //  .on('postgres_changes', { event: '*', schema: 'public', table: 'v2_memberships', filter: `workspace_id=eq.${resolvedParams.id}` }, () => fetchStudents())
   //  .subscribe();
   //return () => { supabase.removeChannel(channel); };
  }, [resolvedParams.id]);

  const initPage = async () => {
    console.log("🚀 Initializing Student Portal...");
    setIsLoading(true);
    try {
     //Use cached session — avoids network call on every mount/refresh
      const session = await getCachedSession();
      const user = session?.user;
      
      if (!user) {
         window.location.href = '/ruang-sosmed/login';
         return;
      }
      
      await fetchUserData(user.id);
      
      await Promise.all([
        fetchBatchDetail(),
        fetchCurriculum(),
        fetchStudents(),
        fetchMySubmissions(user.id),
        fetchAnnouncements()
      ]);
      console.log("✅ Initialization Complete.");
    } catch (err) {
      console.error("❌ Init Failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMySubmissions = async (userId: string) => {
    if (!userId) return;
    
   //1. Quizzes
    const { data: qData } = await supabase
      .from('v2_quiz_results')
      .select('curriculum_id, score, answers_json')
      .eq('profile_id', userId)
      .eq('workspace_id', resolvedParams.id);
    if (qData) setMyQuizResults(qData);

   //2. Assignments
    const { data: aData } = await supabase
      .from('v2_submissions')
      .select('*, v2_curriculums(title)')
      .eq('profile_id', userId)
      .eq('workspace_id', resolvedParams.id);
    if (aData) setMyAssignments(aData);

    //3. My Custom Groups (Hybrid Group Assignment Feature)
    const { data: gData } = await supabase
      .from('v2_assignment_group_members')
      .select('group_id, v2_assignment_groups(id, name)')
      .eq('profile_id', userId);
    
    if (gData) {
        setMyCustomGroups(gData.map((g: any) => ({ 
           id: g.v2_assignment_groups?.id, 
           name: g.v2_assignment_groups?.name 
        })));
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('v2_announcements')
        .select('*')
        .eq('workspace_id', resolvedParams.id)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
      if (!error && data) setAnnouncements(data);
    } catch (err) {
      console.error("fetchAnnouncements failed", err);
    }
  };

  const handleReaction = async (annId: string) => {
    if (!currentUser) return;
    try {
      const ann = announcements.find(a => a.id === annId);
      if (!ann) return;

      let newReactions = Array.isArray(ann.reactions) ? [...ann.reactions] : [];
      if (newReactions.includes(currentUser.id)) {
          newReactions = newReactions.filter(id => id !== currentUser.id);
      } else {
          newReactions.push(currentUser.id);
      }

      const { error } = await supabase.from('v2_announcements').update({ reactions: newReactions }).eq('id', annId);
      if (!error) {
          setAnnouncements(prev => prev.map(a => a.id === annId ? { ...a, reactions: newReactions } : a));
      }
    } catch (err) {
      console.error("handleReaction failed", err);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data: memData, error: memError } = await supabase
        .from('v2_memberships')
        .select('*')
        .eq('workspace_id', resolvedParams.id);
      
      if (memError) return;

      if (memData && memData.length > 0) {
        const uniqueIds = Array.from(new Set(memData.map(m => m.profile_id).filter(Boolean)));
        
        let allProfData: any[] = [];
        const CHUNK_SIZE = 10;
        
        for (let i = 0; i < uniqueIds.length; i += CHUNK_SIZE) {
          const chunk = uniqueIds.slice(i, i + CHUNK_SIZE);
          const { data } = await supabase
            .from('v2_profiles')
            .select('id, full_name, avatar_url') 
            .in('id', chunk);
          if (data) allProfData = [...allProfData, ...data];
        }

        const profMap = new Map(allProfData.map(p => [p.id, p]));
        const combined = memData.map(m => ({
          ...m,
          v2_profiles: profMap.get(m.profile_id) || null
        }));
        setStudents(combined);
      } else {
        setStudents([]);
      }
    } catch (e) {
      console.error("Fetch students failed:", e);
    }
  };

  const fetchUserData = async (userId: string) => {
    if (!userId) return;

    const { data: profile } = await supabase.from('v2_profiles').select('id, full_name, username, role, avatar_url, updated_at').eq('id', userId).single();
    if (!profile) return;

    if (profile.role !== 'admin') {
      //SECURITY BARRIER: Verify Batch Membership
        const { data: member } = await supabase
          .from('v2_memberships')
          .select('id')
          .eq('profile_id', userId)
          .eq('workspace_id', resolvedParams.id)
         .single();
         
       if (!member) {
         //KICK OUT - They don't belong to this Portal
          window.location.href = '/ruang-sosmed/login';
          return;
       }
    }
    
    setCurrentUser(profile);

   //AUTO PROFILE SETUP TRIGGER
    if (profile.role === 'student' && !profile.avatar_url) {
       setIsPhotoSetupOpen(true);
    }
  };

  const me = students.find(s => s.profile_id === currentUser?.id);

  const fetchBatchDetail = async () => {
    const { data } = await supabase.from('v2_workspaces').select('id, name, description, type, start_date, end_date, max_members, status, settings, schedules, created_at').eq('id', resolvedParams.id).single();
    if (data) setBatch(data);
  };

  const fetchCurriculum = async () => {
    const { data } = await supabase
      .from('v2_curriculums')
      .select('*')
      .eq('workspace_id', resolvedParams.id)
      .order('created_at', { ascending: true });
    
    if (data) {
      setCurriculum(data);
      if (data.length > 0 && !selectedLesson) {
          const firstMat = data.find((c: any) => c.type === 'material') || data[0];
          setSelectedLesson(firstMat);
      }
    }
  };

  const handleTakeQuiz = (c: any) => {
     if (!c.quiz_data || !c.quiz_data.questions || c.quiz_data.questions.length === 0) {
        alert("This quiz has no questions yet. Contact mentor!");
        return;
     }
     setActiveQuiz(c);
     setQuizAnswers({});
     setIsQuizModalOpen(true);
  };

  const handleSubmitQuiz = async () => {
     if (!activeQuiz || !currentUser) return;
     
     setIsLoading(true);
     try {
       //Double check for existing submission to enforce 1x attempt
        const { data: existing } = await supabase
           .from('v2_quiz_results')
           .select('id')
           .eq('curriculum_id', activeQuiz.id)
           .eq('profile_id', currentUser.id)
           .single();
        
        if (existing) {
           alert("You have already submitted this task! Only 1 attempt is allowed.");
           setIsQuizModalOpen(false);
           return;
        }

        const questions = activeQuiz.quiz_data.questions;
        const mcQuestions = questions.filter((q: any) => !q.type || q.type === 'mc');
        let correctCount = 0;
        
        mcQuestions.forEach((q: any) => {
           // Find original index to match quizAnswers key
           const originalIdx = questions.indexOf(q);
           if (quizAnswers[originalIdx] === q.correct) correctCount++;
        });

        const score = mcQuestions.length > 0 
          ? Math.round((correctCount/mcQuestions.length) * 100)
          : 100; // Default to 100 if participation-only (all essays)

       //1. Save Result
        const { error: resError } = await supabase.from('v2_quiz_results').insert([
           {
              curriculum_id: activeQuiz.id,
              profile_id: currentUser.id,
              workspace_id: resolvedParams.id,
              answers_json: quizAnswers,
              score: score
           }
        ]);
        if (resError) throw resError;

       //2. Sync to Grading Matrix
        const ptIndex = curriculum.filter(c => c.type === 'post_test').findIndex(c => c.id === activeQuiz.id);
        
        if (ptIndex !== -1) {
           const myMembership = students.find(s => s.profile_id === currentUser.id);
           if (myMembership) {
              const newGrades = { ...myMembership.grades };
              if (!newGrades.post_tests) newGrades.post_tests = [0,0,0,0,0,0];
              newGrades.post_tests[ptIndex] = score;
              
              const { error } = await supabase.from('v2_memberships').update({ grades: newGrades }).eq('id', myMembership.id);
              if (error) throw error;
              fetchStudents();
           }
        }

        setLastQuizResult(score);
        setIsQuizModalOpen(false);
        setIsResultModalOpen(true);
        if (currentUser?.id) fetchMySubmissions(currentUser.id);//Update submission status immediately
     } catch (err: any) {
        alert("Failed to submit quiz: " + err.message);
     } finally {
        setIsLoading(false);
     }
  };

   const handleReviewQuiz = (task: any, result: any) => {
      setActiveQuiz(task);
      setQuizAnswers(result.answers_json || {});
      setLastQuizResult(result.score);
      setIsResultModalOpen(true);
   };

   const handleOpenSubmitModal = (task: any) => {
     setActiveTask(task);
     setSubmitForm({ file_link: '', mentor_feedback: '' });
     setIsSubmitModalOpen(true);
  };

  const handleSubmitAssignment = async () => {
     if (!activeTask || !currentUser) return;
     if (!submitForm.file_link) {
        alert("Please provide the submission link (Google Drive/Canva)!");
        return;
     }

     setIsLoading(true);
     try {
        const groupIdToUse = selectedGroupToRepresent || activeTask.assignment_group_id || null;
        const { data: mainSubmission, error } = await supabase.from('v2_submissions').insert([
           {
              curriculum_id: activeTask.id,
              profile_id: currentUser.id,
              workspace_id: resolvedParams.id,
              file_link: submitForm.file_link,
              status: 'pending',
              assignment_group_id: groupIdToUse
           }
        ]).select().single();
        if (error) throw error;
        
        // ==========================================
        // AUTO-CLONING LOGIC FOR GROUP TASKS
        // ==========================================
        if (activeTask.type === 'group_assignment' || activeTask.assignment_group_id) {
           const myMembership = students.find((s: any) => s.profile_id === currentUser.id);
           if (myMembership) {
              let membersToClone = [];
              if (activeTask.assignment_group_id) {
                  // Custom Assignment Group (New Feature)
                  const { data } = await supabase.from('v2_assignment_group_members').select('profile_id').eq('group_id', activeTask.assignment_group_id);
                  if (data) membersToClone = data.map(d => d.profile_id).filter(id => id !== currentUser.id);
              } else if (myMembership.group_name) {
                  // Main Batch Group (Existing Feature)
                  membersToClone = students.filter((s:any) => s.group_name === myMembership.group_name && s.profile_id !== currentUser.id).map((s:any) => s.profile_id);
              }
              
              if (membersToClone.length > 0) {
                 const clonePayload = membersToClone.map((id) => ({
                    curriculum_id: activeTask.id,
                    profile_id: id,
                    workspace_id: resolvedParams.id,
                    file_link: submitForm.file_link,
                    status: 'pending',
                    is_cloned: true,
                    cloned_from_submission_id: mainSubmission.id,
                    submitted_by_profile_id: currentUser.id
                 }));
                 await supabase.from('v2_submissions').insert(clonePayload);
              }
           }
        }
        
        setIsSubmitModalOpen(false);
        if (currentUser?.id) fetchMySubmissions(currentUser.id);
        alert("Assignment submitted successfully! 🛸✨");
     } catch (err: any) {
        alert("Failed to submit: " + err.message);
     } finally {
        setIsLoading(false);
     }
  };

  const handleMarkFeedbackAsRead = async (subId: string) => {
    try {
      const { error } = await supabase
        .from('v2_submissions')
        .update({ is_feedback_read: true })
        .eq('id', subId);
      if (error) throw error;
      if (currentUser?.id) fetchMySubmissions(currentUser.id);//Refresh local states
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleSaveProfileAvatar = async (avatarUrl: string) => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
     //Update Database with the URL
      const { error } = await supabase.from('v2_profiles').update({ avatar_url: avatarUrl }).eq('id', currentUser.id);
      if (error) throw error;
      
      setCurrentUser({ ...currentUser, avatar_url: avatarUrl });
      setIsPhotoSetupOpen(false);
      alert("Identitas avatar berhasil dipulihkan! 🚀");
    } catch (err: any) {
      alert("Gagal simpan avatar: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelfAttendance = async (sessionId: string, status: string) => {
    const me = students.find(s => s.profile_id === currentUser?.id);
    if (!currentUser || !me) return;
    setIsLoading(true);
    try {
      const newAtt = { ...me.attendance || {} };
      newAtt[sessionId] = status;
      const { error } = await supabase.from('v2_memberships').update({ attendance: newAtt }).eq('id', me.id);
      if (error) throw error;
      
     //Update local state to reflect change immediately
      setStudents(prev => prev.map(s => s.id === me.id ? { ...s, attendance: newAtt } : s));
    } catch (err: any) {
      console.error("Attendance Failed:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto shadow-2xl shadow-blue-500/20"/>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] animate-pulse">Establishing Secure Connection...</p>
        </div>
      </div>
    );
  }

  if (isLoading && !batch) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"/>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Student Environment...</p>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: "learning", label: "Learning Center", icon: <PlayCircle size={16}/> },
    { id: "board", label: "Community Feed", icon: <Layout size={16}/> },
    { id: "assignments", label: "My Tasks", icon: <FileText size={16}/> },
    ...(students && currentUser && students.find((s: any) => s.profile_id === currentUser?.id)?.group_name && students.find((s: any) => s.profile_id === currentUser?.id)?.group_name !== 'Unassigned' ? [{ id: "group", label: "My Team", icon: <Users size={16}/> }] : []),
    { id: "results", label: "Analytics", icon: <BarChart3 size={16}/> },
    { id: "attendance", label: "Presence", icon: <CalendarCheck size={16}/> }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* PREMIUM HEADER - Unified with Admin Style */}
      <div className="max-w-[1600px] mx-auto p-6 md:p-10 lg:p-14 space-y-12">
        <div className="relative bg-gradient-to-r from-[#0ea5e9] to-[#1e3a8a] rounded-[44px] p-10 xl:p-14 overflow-hidden shadow-2xl shadow-blue-900/20">
          {/* Decorative Magic */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"/>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-300/20 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none"/>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 text-[9px] font-black w-fit uppercase tracking-widest shadow-inner">
                    {batch?.name?.toLowerCase()?.includes('ruang sosmed') ? 'Ruang Sosmed Student' : 'Student Portal'}
                  </div>
               </div>
               <div className="space-y-2">
                 <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-sm">{batch?.name || "Loading Batch..."}</h1>
                 <div className="flex items-center gap-6 text-sky-100 font-bold text-xs opacity-90">
                    <p className="flex items-center gap-2"><Sparkles size={14} className="text-sky-300"/> Authorized Member: {currentUser?.full_name?.split(' ')[0]}</p>
                    <div className="h-1 w-1 rounded-full bg-white/40"/>
                    <p className="flex items-center gap-2"><GraduationCap size={14} className="text-sky-300"/> LMS Environment</p>
                 </div>
               </div>
            </div>

            <div className="flex items-center gap-4">
               {/* Student Progress Badge */}
               <div className="flex items-center gap-6">
                  {/* Avatar with Edit Trigger */}
                  <div className="relative group/avatar">
                     <div 
                        onClick={() => setIsIdCardOpen(true)}
                        className="w-16 h-16 rounded-full border-2 border-white/30 backdrop-blur-md overflow-hidden cursor-pointer active:scale-95 transition-all shadow-xl shadow-blue-900/10 flex items-center justify-center relative"
                        style={{ backgroundColor: currentUser?.avatar_url?.includes('bg=') ? decodeURIComponent(currentUser.avatar_url.split('bg=')[1]) : 'rgba(255,255,255,0.1)' }}
                     >
                        {currentUser?.avatar_url ? (
                           <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-contain scale-[1.3] translate-y-1.5"/>
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-white font-black">{currentUser?.full_name?.charAt(0) || '?'}</div>
                        )}
                     </div>
                     <button 
                        onClick={() => setIsPhotoSetupOpen(true)}
                        className="absolute -bottom-1 -right-1 w-7 h-7 bg-white text-blue-600 rounded-lg shadow-lg flex items-center justify-center border-2 border-blue-50 hover:scale-110 active:scale-90 transition-all z-20 group"
                        title="Edit Avatar"
                     >
                        <Camera size={14} strokeWidth={3}/>
                     </button>
                  </div>

                  <div className="space-y-1">
                     <p className="text-white text-lg font-black tracking-tight leading-none truncate max-w-[150px]">{currentUser?.full_name}</p>
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                        <p className="text-sky-200 text-[9px] font-black uppercase tracking-[0.2em]">Active Scholar</p>
                     </div>
                  </div>

                  <button 
                     onClick={async () => {
                        await supabase.auth.signOut();
                        window.location.href = "/ruang-sosmed/login";
                     }}
                     className="ml-4 w-12 h-12 rounded-2xl bg-white/10 hover:bg-rose-500 text-white flex items-center justify-center transition-all border border-white/20 hover:border-transparent active:scale-90"
                     title="Logout"
                   >
                     <LogOut size={20}/>
                   </button>
               </div>
            </div>
          </div>
        </div>

        {/* PILL TABS - Centered & Premium */}
        <div className="flex justify-center mb-6">
          <div className="flex gap-4 p-2 bg-white/80 backdrop-blur-xl border border-slate-100 rounded-[32px] w-fit shadow-xl shadow-slate-200/50">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                   setActiveTab(t.id);
                   localStorage.setItem(`portal_tab_${resolvedParams.id}`, t.id);
                }}
                className={`px-8 py-4 rounded-2xl flex items-center gap-3 text-xs font-black transition-all ${activeTab === t.id ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 border border-blue-100" : "text-slate-400 hover:text-slate-900"}`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>


        {/* LMS CONTENT AREA */}
        {activeTab === 'learning' && (
           <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
              {/* Video Player Board */}
              <div className="xl:col-span-8 space-y-10">
                 {selectedLesson ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                       <div className="aspect-video bg-black rounded-[56px] overflow-hidden shadow-2xl relative group border-[12px] border-white ring-1 ring-slate-100 shadow-slate-200/50">
                          {selectedLesson.video_url ? (
                             <iframe 
                               src={getYouTubeEmbedUrl(selectedLesson.video_url)} 
                               className="w-full h-full" 
                               allowFullScreen 
                            />
                          ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-white relative">
                                 {/* Waiting Screen/Countdown */}
                                 <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/60 to-slate-900 z-0 animate-pulse"/>
                                 <div className="relative z-10 text-center space-y-6 md:space-y-10 p-12">
                                    <div className="w-20 h-20 bg-white/10 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-white/20 backdrop-blur-xl animate-bounce">
                                       <Play size={32} fill="white" className="ml-1"/>
                                    </div>
                                    <div className="space-y-4">
                                       <h3 className="text-3xl font-black tracking-tighter">Live kelas akan dimulai dalam</h3>
                                       {selectedLesson.due_date ? (
                                          <Countdown targetDate={selectedLesson.due_date}/>
                                       ) : (
                                          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Waktu tayang belum dijadwalkan oleh mentor.</p>
                                       )}
                                    </div>
                                    <div className="pt-6">
                                       <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 inline-flex items-center gap-3">
                                          <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping"/>
                                          <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Waiting for Stream Link...</p>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           )}
                        </div>

                        <Card className="p-10 border-none shadow-xl shadow-slate-200/40 bg-white rounded-[44px] space-y-8 min-h-[400px]">
                           {selectedLesson.type === 'material' ? (
                              <>
                                 <div className="flex items-center justify-between">
                                    <h2 className="text-3xl font-black text-[#0F172A] tracking-tighter">{selectedLesson.title}</h2>
                                    <div className="px-5 py-2 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400">Lesson Mode</div>
                                 </div>
                                 <div className="leading-relaxed text-slate-600 font-medium italic whitespace-pre-wrap text-lg bg-slate-50/50 p-8 rounded-3xl border border-slate-50">
                                    {selectedLesson.content_rich || "Materi ini belum memiliki deskripsi tambahan."}
                                 </div>
                              </>
                           ) : (
                              <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-8">
                                 <div className="w-24 h-24 rounded-[36px] bg-slate-900 text-white flex items-center justify-center shadow-2xl">
                                    {selectedLesson.type === 'post_test' ? <FileText size={48}/> : <Zap size={48}/>}
                                 </div>
                                 <div className="space-y-4">
                                    <h2 className="text-4xl font-black tracking-tighter text-[#0F172A]">{selectedLesson.title}</h2>
                                    <p className="max-w-sm mx-auto text-slate-400 font-bold uppercase tracking-widest text-[10px]">Silahkan kerjakan melalui tab Assignments khusus untuk pengerjaan tugas & kuis.</p>
                                 </div>
                                 <Button 
                                    onClick={() => setActiveTab('assignments')}
                                    className="h-14 px-10 rounded-2xl bg-blue-600 text-white font-black"
                                 >Go to Assignments</Button>
                              </div>
                           )}
                        </Card>
                    </motion.div>
                 ) : (
                    <div className="aspect-video bg-white rounded-[56px] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-20 gap-6">
                       <Sparkles size={60} className="text-blue-500 opacity-20"/>
                       <h3 className="text-2xl font-black text-slate-300 tracking-tighter">Pilih materi kelas.</h3>
                    </div>
                 )}
              </div>

              {/* Sidebar Playlist Board */}
              <div className="xl:col-span-4 space-y-8">
                 <Card className="p-10 border-none shadow-xl shadow-slate-200/50 bg-white rounded-[44px] space-y-10">
                    <div className="flex items-center justify-between">
                       <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                         <PlayCircle className="text-blue-600"/> Course Journey
                       </h3>
                       <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">{curriculum.filter(c => c.type === 'material' && c.is_published !== false).length} Modules</span>
                    </div>
                     <div className="space-y-4">
                        {curriculum.filter(c => c.type === 'material' && c.is_published !== false).map((lesson, idx) => (
                           <div 
                             key={lesson.id}
                             onClick={() => setSelectedLesson(lesson)}
                             className={`p-6 rounded-[32px] border transition-all cursor-pointer group flex items-center justify-between ${selectedLesson?.id === lesson.id ? 'bg-blue-600 border-blue-600 text-white shadow-2xl shadow-blue-600/30' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-blue-200'}`}
                           >
                              <div className="flex items-center gap-5">
                                 <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black shadow-sm ${selectedLesson?.id === lesson.id ? 'bg-white/20 text-white' : 'bg-white text-blue-600'}`}>
                                    {lesson.type === 'material' ? <PlayCircle size={18}/> : lesson.type === 'post_test' ? <FileText size={18}/> : <Zap size={18}/>}
                                 </div>
                                 <div className="space-y-1">
                                    <p className={`text-[9px] font-bold opacity-60`}>{lesson.module_name || `Resource ${idx + 1}`}</p>
                                    <p className={`text-[13px] font-black tracking-tight truncate max-w-[180px]`}>{lesson.title}</p>
                                 </div>
                              </div>
                              <Play size={16} className={selectedLesson?.id === lesson.id ? 'text-white' : 'text-blue-600'}/>
                           </div>
                        ))}
                     </div>
                 </Card>

                 {/* Premium Assets Deck */}
                 {selectedLesson?.assets_json?.length > 0 && (
                    <Card className="p-10 border-none shadow-xl shadow-slate-200/50 bg-white rounded-[44px] space-y-8 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100/60 blur-[80px] rounded-full pointer-events-none"/>
                       <h3 className="text-xl font-black tracking-tight px-2 text-[#0F172A]">Classroom Assets</h3>
                       <div className="space-y-4">
                          {selectedLesson.assets_json.map((asset: any, i: number) => (
                             <a 
                               key={i} 
                               href={asset.url} 
                               target="_blank" 
                               className="flex items-center justify-between p-6 rounded-[32px] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-lg hover:border-slate-200 transition-all group shadow-sm"
                             >
                                <div className="flex items-center gap-5">
                                   <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-slate-600 flex items-center justify-center shadow-sm"><Download size={20}/></div>
                                   <div className="space-y-1">
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Resource {i + 1}</p>
                                      <span className="text-sm font-bold tracking-tight text-slate-800">{asset.name}</span>
                                   </div>
                                 </div>
                                <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-600 transition-colors"/>
                             </a>
                          ))}
                       </div>
                    </Card>
                 )}
              </div>
           </div>
        )}

        {activeTab === 'board' && (
           <div className="space-y-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-6">
                 <div className="space-y-1">
                    <h3 className="text-3xl font-black text-[#0F172A] tracking-tighter">Community Board</h3>
                    <p className="text-sm font-bold text-slate-400">Update terbaru, pengumuman, dan artikel bacaan untukmu</p>
                 </div>
                 <div className="flex items-center gap-3">
                    {['Semua', 'Pengumuman', 'Artikel', 'Tips'].map(cat => (
                       <button key={cat} className="px-5 py-2.5 rounded-2xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
                          {cat}
                       </button>
                    ))}
                 </div>
              </div>

              {announcements.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {announcements.map((ann) => (
                       <motion.div 
                         key={ann.id}
                         whileHover={{ y: -8 }}
                         onClick={() => {
                            if (ann.category === 'Pengumuman' && ann.image_url) {
                               setActiveArticle(ann);
                               setIsArticleModalOpen(true);
                            } else {
                               window.location.href = `/ruang-sosmed/board/${resolvedParams.id}/${ann.id}`;
                            }
                         }}
                         className="group cursor-pointer bg-white rounded-[48px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col transition-all active:scale-95"
                       >
                          <div className="aspect-[16/11] w-full bg-slate-100 relative overflow-hidden">
                             {ann.image_url ? (
                                <img src={ann.image_url} alt={ann.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                             ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-blue-600">
                                   <Layout size={40} className="text-white/20"/>
                                </div>
                             )}
                             <div className="absolute top-8 left-8 px-5 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-blue-600 shadow-xl border border-white/50">
                                {ann.category}
                             </div>
                             {ann.is_pinned && (
                                <div className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-amber-400 text-white flex items-center justify-center shadow-xl border-4 border-white">
                                   <Zap size={22} fill="currentColor"/>
                                </div>
                             )}
                          </div>
                          
                          <div className="p-10 flex-1 flex flex-col gap-6">
                             <h4 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tighter">{ann.title}</h4>
                             <p className="text-sm text-slate-400 font-medium leading-relaxed line-clamp-3">{ann.summary}</p>
                             
                             <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <button 
                                     onClick={(e) => {
                                        e.stopPropagation();
                                        handleReaction(ann.id);
                                     }}
                                     className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all ${ann.reactions?.includes(currentUser?.id) ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-rose-50 hover:text-rose-600'}`}
                                   >
                                      <Heart size={16} fill={ann.reactions?.includes(currentUser?.id) ? "currentColor" : "none"}/>
                                      <span className="text-xs font-black">{ann.reactions?.length || 0}</span>
                                   </button>
                                   <div className="h-4 w-[1px] bg-slate-100 mx-2"/>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(ann.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                                </div>
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                   <ArrowRight size={18}/>
                                </div>
                             </div>
                          </div>
                       </motion.div>
                    ))}
                 </div>
              ) : (
                 <div className="flex flex-col items-center justify-center py-32 space-y-8 bg-white rounded-[56px] border border-slate-100 border-dashed">
                    <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200">
                       <Layout size={40}/>
                    </div>
                    <div className="text-center space-y-2">
                       <h4 className="text-xl font-black text-slate-900 uppercase tracking-widest">Feed is quiet today...</h4>
                       <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">Tunggu update seru berikutnya dari mentor!</p>
                    </div>
                 </div>
              )}
           </div>
        )}

               {/* Assignments Board */}
        {activeTab === 'assignments' && (
           <div className="space-y-10">
              <div className="px-6 flex items-center justify-between">
                <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">Active Assignments</h3>
                <p className="text-xs font-bold text-slate-400 bg-slate-100 px-4 py-2 rounded-2xl border border-slate-200">{curriculum.filter(c => c.type !== 'material' && c.is_published !== false).length} Tasks pending</p>
              </div>
              <div className="space-y-6 pb-20">
                 {curriculum.filter(c => c.type !== 'material' && c.is_published !== false).map((task) => {
                    const me = students.find(s => s.profile_id === currentUser?.id); 
                    const sub = myAssignments.find(s => s.curriculum_id === task.id);
                    const quiz = myQuizResults.find(s => s.curriculum_id === task.id);
                    const isDone = !!sub || !!quiz;
                    
                    const now = new Date().getTime();
                    const deadline = task.due_date ? new Date(task.due_date).getTime() : null;
                    const isExpired = deadline ? (now > (deadline + 86400000)) : false;//H+1 Grace period

                    return (
                    <Card key={task.id} className={`p-10 border-none shadow-xl shadow-slate-200/30 hover:shadow-2xl transition-all bg-white rounded-[44px] group relative overflow-hidden ${isExpired && !isDone ? 'opacity-60 grayscale' : ''}`}>
                       {isExpired && !isDone && (
                          <div className="absolute top-0 right-0 px-6 py-2 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-3xl shadow-lg z-10 animate-pulse">
                             TIMEOUT/EXPIRED
                          </div>
                       )}
                       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                          <div className="flex items-center gap-8">
                             <div className={`w-16 h-16 rounded-[28px] flex items-center justify-center transition-all shadow-sm ${task.type === 'post_test' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-600'}`}>
                                {task.type === 'post_test' ? <FileText size={28}/> : <Zap size={28}/>}
                             </div>
                             <div className="space-y-1">
                                 <p className="text-[10px] font-bold text-slate-400">{task.type.replace('_', ' ')}</p>
                                 <h4 className="text-2xl font-black text-[#0F172A] tracking-tighter">{task.title}</h4>
                                 <div className="flex flex-col gap-3 mt-4">
                                    <p className={`text-[11px] font-bold flex items-center gap-2 ${isExpired ? 'text-rose-500' : 'text-slate-400'}`}>
                                       <Clock size={12}/> Deadline: {task.due_date ? new Date(task.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "Open schedule"}
                                    </p>
                                    {task.assets_json && task.assets_json.length > 0 && (
                                       <a 
                                         href={task.assets_json[0].url} 
                                         target="_blank"
                                         rel="noreferrer"
                                         className="h-10 px-6 w-fit rounded-xl bg-blue-50 border border-blue-100 text-[11px] font-black text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                                       >
                                          <Download size={14}/> View Instruction Brief
                                       </a>
                                    )}
                                 </div>
                              </div>
                           </div>
                            <div className="flex gap-4">
                                {(() => {
                                   if (isDone) {
                                      const status = sub?.status || 'completed';
                                      const grade = sub?.grade || quiz?.score;
                                      
                                      return (
                                         <div className="flex items-center gap-4">
                                            {sub?.mentor_feedback && (
                                               <div className="relative">
                                                  <button 
                                                    onClick={() => { 
                                                       setActiveTask(task); 
                                                       setSubmitForm(sub); 
                                                       setIsFeedbackModalOpen(true);
                                                      //handleMarkFeedbackAsRead(sub.id);
                                                    }}
                                                    className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 hover:scale-110 active:scale-95 transition-all"
                                                  >
                                                    <FileText size={18}/>
                                                  </button>
                                                  {!sub.is_feedback_read && (
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white animate-pulse"/>
                                                  )}
                                               </div>
                                            )}
                                                                     <div className="flex items-center gap-3">
                                                 {task.type === 'post_test' && quiz && (
                                                   <button 
                                                      onClick={() => handleReviewQuiz(task, quiz)}
                                                      className="h-16 px-8 rounded-[28px] bg-slate-50 border border-slate-100 text-slate-400 font-black text-xs hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm flex items-center gap-2"
                                                   >
                                                      <Eye size={16}/> Review Hasil
                                                   </button>
                                                 )}
                                                 <div className={`h-16 px-8 rounded-[28px] ${status === 'completed' ? 'bg-emerald-50 text-emerald-600' : status === 'in_review' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'} font-black text-xs flex items-center gap-3 border border-slate-100`}>
                                                   <div className="flex flex-col">
                                                      <p className="text-[8px] opacity-60 uppercase">{status.replace('_', ' ')}</p>
                                                      <div className="flex items-center gap-2">
                                                         {status === 'completed' ? <Check size={14}/> : <Clock size={14}/>}
                                                         <span>{grade !== undefined ? `SCORE: ${grade}` : 'TASK DONE'}</span>
                                                      </div>
                                                   </div>
                                                 </div>
                                             </div>
                                          </div>
                                      );
                                   }

                                   if (isExpired) {
                                      return (
                                         <div className="h-16 px-8 rounded-[28px] bg-rose-50 text-rose-500 font-black text-xs flex items-center gap-3 border border-rose-100 uppercase tracking-widest shadow-inner">
                                            <XCircle size={18}/> Submission Closed
                                         </div>
                                      );
                                   }

                                   if (task.type === 'challenge' && !me?.is_leader) {
                                      return (
                                         <div className="h-16 px-8 rounded-[28px] bg-slate-50 text-slate-400 font-bold text-[10px] flex items-center gap-3 italic border border-slate-100 max-w-[180px]">
                                            Only Team Leader can submit results.
                                         </div>
                                      );
                                   }

                                   return (
                                      <Button 
                                        onClick={() => task.type === 'post_test' ? handleTakeQuiz(task) : handleOpenSubmitModal(task)}
                                        className="h-16 px-10 rounded-[28px] bg-gradient-to-r from-[#0ea5e9] to-[#1e3a8a] text-white font-black text-sm hover:opacity-90 shadow-xl shadow-blue-900/20 active:scale-95 transition-all"
                                      >Submit Task</Button>
                                   );
                                })()}
                             </div>
                        </div>
                    </Card>
                    );
                 })}
              </div>
           </div>
        )}

        {activeTab === 'group' && (() => {
            const myMem = students.find((s: any) => s.profile_id === currentUser?.id);
            const myGroupName = myMem?.group_name;
            if (!myGroupName || myGroupName === 'Unassigned') return <div className="p-20 text-center opacity-40 font-black">You are not assigned to a challenge group.</div>;
            
            const teamMembers = students.filter((s:any) => s.group_name === myGroupName);
            const leader = teamMembers.find((s:any) => s.is_leader);
            
            return (
               <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-5 duration-500">
                  <div className="xl:col-span-8 space-y-10">
                     <div className="text-center md:text-left space-y-4">
                        <h2 className="text-4xl font-black text-[#0F172A] tracking-tighter">Your Challenge Team</h2>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Collaborate, discuss, and conquer the final challenge together.</p>
                     </div>

                     <Card className="p-8 md:p-14 border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[56px] space-y-10 relative overflow-hidden">
                     <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-10 border-b border-slate-100">
                        <div>
                           <h3 className="text-3xl font-black text-[#0F172A] flex items-center gap-4">
                              {myGroupName} 
                              <span className="bg-indigo-50 text-indigo-600 text-[10px] uppercase font-black tracking-widest px-4 py-2 rounded-full border border-indigo-100">Team Space</span>
                           </h3>
                           <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">{teamMembers.length} Members Enrolled</p>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto mt-2 md:mt-0">
                           {myMem?.group_wa_link ? (
                              <a 
                                 href={myMem.group_wa_link} 
                                 target="_blank" 
                                 rel="noreferrer"
                                 className="flex items-center gap-3 px-8 py-5 rounded-[24px] bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs uppercase tracking-[0.1em] shadow-xl shadow-[#25D366]/20 transition-all hover:scale-105 active:scale-95 w-full md:w-auto justify-center"
                              >
                                 <MessageSquare size={18} fill="white"/> Team Discussion Group
                              </a>
                           ) : (
                              <div className="flex items-center gap-3 px-8 py-5 rounded-[24px] bg-slate-50 border border-slate-100 text-slate-400 font-black text-xs uppercase tracking-[0.1em] w-full md:w-auto justify-center opacity-60">
                                 <MessageSquare size={18}/> WA Group Link Pending
                              </div>
                           )}
                        </div>
                     </div>
                     
                     <div className="space-y-6">
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Team Composition</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {teamMembers.map((m: any) => (
                              <div key={m.id} className={`flex items-center gap-5 p-6 rounded-[32px] border ${m.profile_id === currentUser?.id ? 'bg-indigo-50/50 border-indigo-100 shadow-sm' : 'bg-slate-50 border-slate-100'} transition-all`}>
                                 <div className="relative shrink-0">
                                   <div 
                                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black overflow-hidden shadow-inner relative ${m.is_leader ? 'border-4 border-amber-400 shadow-lg shadow-amber-500/20' : 'border-2 border-slate-100'}`}
                                      style={{ backgroundColor: m.v2_profiles?.avatar_url?.includes('bg=') ? decodeURIComponent(m.v2_profiles.avatar_url.split('bg=')[1]) : '#f1f5f9' }}
                                   >
                                      {m.v2_profiles?.avatar_url ? (
                                        <img src={m.v2_profiles.avatar_url} alt={m.v2_profiles?.full_name} className="w-full h-full object-contain scale-[1.3] translate-y-1"/>
                                      ) : (
                                        <span className="text-slate-300">{m.v2_profiles?.full_name?.charAt(0) || '?'}</span>
                                      )}
                                   </div>
                                   {m.is_leader && (
                                     <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg shadow-md border-2 border-white flex items-center justify-center z-10">
                                       <Star size={10} fill="white" className="text-white"/>
                                     </div>
                                   )}
                                 </div>
                                 <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-bold text-slate-800 truncate">{m.v2_profiles?.full_name} {m.profile_id === currentUser?.id && <span className="text-indigo-500 font-medium ml-1 bg-indigo-100 px-2 py-0.5 rounded-lg text-[10px] uppercase tracking-widest">You</span>}</p>
                                    {m.is_leader ? (
                                       <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-1.5 flex items-center gap-1.5"><Award size={12} className="shrink-0"/> Team Captain</p>
                                    ) : (
                                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">SQUAD MEMBER</p>
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </Card>
               </div>
               
               {/* MINIBOARD CALENDAR */}
               <div className="xl:col-span-4 space-y-8 h-[calc(100vh-200px)] sticky top-20">
                  <Card className="p-8 md:p-10 border-none shadow-xl shadow-slate-200/50 bg-white rounded-[44px] space-y-8 h-full flex flex-col">
                     <div className="flex items-center gap-4 border-b border-slate-100 pb-6 shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                           <CalendarCheck size={24}/>
                        </div>
                        <div>
                           <h3 className="text-lg font-black text-[#0F172A] tracking-tighter">Live Sessions</h3>
                           <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Upcoming Events</p>
                        </div>
                     </div>
                     
                     <div className="space-y-4 overflow-y-auto flex-1 pr-2 pb-4 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
                        {(batch?.schedules || []).length === 0 ? (
                           <div className="text-center p-8 opacity-40 h-full flex flex-col items-center justify-center">
                              <CalendarDays size={32} className="mx-auto mb-3 text-slate-400"/>
                              <p className="text-xs font-black uppercase tracking-widest">Belum ada kelas.</p>
                           </div>
                        ) : (
                           (batch?.schedules || []).map((sch: any) => (
                              <div key={sch.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 flex items-start gap-4 group hover:bg-white hover:shadow-lg transition-all hover:border-indigo-100 cursor-pointer">
                                 <div className="w-12 h-12 shrink-0 rounded-[20px] bg-white shadow-sm flex flex-col items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <span className="text-sm leading-none">{new Date(sch.date).getDate()}</span>
                                    <span className="text-[8px] uppercase tracking-widest opacity-80 mt-1">{new Date(sch.date).toLocaleString('default', { month: 'short' })}</span>
                                 </div>
                                 <div className="flex flex-col justify-center overflow-hidden pt-1 space-y-2">
                                    <h5 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2">{sch.title}</h5>
                                    <div className="flex items-center gap-3">
                                       <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-2 py-1 rounded-md flex items-center gap-1 uppercase tracking-widest"><Clock size={10}/> {sch.time}</span>
                                       {sch.meet_link && (
                                          <a href={sch.meet_link} target="_blank" rel="noreferrer" className="text-[9px] font-black text-indigo-500 hover:underline flex items-center gap-1 uppercase tracking-widest group-hover:text-indigo-600">
                                             <Video size={10}/> LINK
                                          </a>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           ))
                        )}
                     </div>
                  </Card>
               </div>
            </div>
            );
        })()}

        {activeTab === 'results' && (() => {
            const me = students.find(s => s.profile_id === currentUser?.id);
            if (!me) return <div className="p-20 text-center opacity-40">Loading your profile...</div>;

           //DYNAMIC CALCULATION PER NEW SYSTEM
            const tasks = curriculum.filter(t => t.type !== 'material');
            
            let totalPT = 0, countPT = 0;
            let totalAssign = 0, countAssign = 0;
            let totalGC = 0, countGC = 0;

            tasks.forEach(t => {
               if (t.type === 'post_test') {
                  const res = myQuizResults.find(q => q.curriculum_id === t.id);
                  if (res) { totalPT += res.score; countPT++; }
               } else if (t.type === 'challenge') {
                  const sub = myAssignments.find(s => s.curriculum_id === t.id);
                  if (sub?.grade) { totalGC += sub.grade; countGC++; }
               } else {
                  const sub = myAssignments.find(s => s.curriculum_id === t.id);
                  if (sub?.grade) { totalAssign += sub.grade; countAssign++; }
               }
            });

            const avgPT = countPT > 0 ? totalPT/countPT : 0;
            const avgAssign = countAssign > 0 ? totalAssign/countAssign : 0;
            const avgGroup = countGC > 0 ? totalGC/countGC : 0;

            const attendCount = Object.values(me.attendance || {}).filter(v => v === 'P').length;
            const totalSessions = batch?.schedules?.length || 0; 
            const keaktifan = totalSessions > 0 ? (attendCount/totalSessions) * 100 : 0;

           //Formula: (PT + Assign + GC + Active)/4
            const finalScore = Math.round((avgPT + avgAssign + avgGroup + keaktifan)/4);
            
            const getGrade = (s: number) => {
               if (s >= 90) return { label: 'A+', color: 'text-purple-600', bg: 'bg-purple-50', desc: 'Superstar (Outstanding)' };
               if (s >= 85) return { label: 'A', color: 'text-indigo-600', bg: 'bg-indigo-50', desc: 'Very Good' };
               if (s >= 80) return { label: 'B+', color: 'text-blue-600', bg: 'bg-blue-50', desc: 'Good' };
               if (s >= 70) return { label: 'B', color: 'text-amber-600', bg: 'bg-amber-50', desc: 'Average' };
               if (s >= 60) return { label: 'C', color: 'text-orange-600', bg: 'bg-orange-50', desc: 'Below Average' };
               return { label: 'D', color: 'text-rose-500', bg: 'bg-rose-50', desc: 'Very Poor' };
            };
            const grade = getGrade(finalScore);

            return (
               <div className="space-y-10 pb-20">
                  {/* RAPORT HEADER */}
                  <Card className="relative p-12 lg:p-16 border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[56px] overflow-hidden">
                     <div className="absolute top-0 right-0 p-12">
                        <div className={`w-36 h-36 rounded-[44px] flex flex-col items-center justify-center ${grade.bg} ${grade.color} shadow-inner border border-white/40 backdrop-blur-sm`}>
                           <span className="text-5xl font-black">{grade.label}</span>
                           <span className="text-[10px] font-bold opacity-60">ACADEMIC RANK</span>
                        </div>
                     </div>
                     
                     <div className="relative z-10 space-y-10">
                        <div className="space-y-4">
                           <div className="px-5 py-2 rounded-2xl bg-gradient-to-r from-[#0ea5e9] to-[#1e3a8a] text-white text-[10px] font-black w-fit uppercase tracking-widest shadow-inner">Official Learning Analytics</div>
                           <h2 className="text-5xl font-black text-[#0F172A] tracking-tighter">Academic Progress Report</h2>
                           <p className="text-xl font-medium text-slate-400 max-w-xl line-clamp-2">Laporan evaluasi pilar fundamental Ruang Sosmed untuk batch {batch?.name || 'V2'}.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-100">
                           <div className="space-y-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Grade Score</p>
                              <div className="flex items-baseline gap-2">
                                 <span className="text-6xl font-black text-slate-900">{finalScore}</span>
                                 <span className="text-lg font-bold text-slate-300">/100</span>
                              </div>
                           </div>
                           <div className="space-y-2 md:col-span-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance Description</p>
                              <p className={`text-2xl font-black ${grade.color} drop-shadow-sm`}>{grade.desc}</p>
                           </div>
                        </div>
                     </div>
                  </Card>

                  {/* DETAILED PILLARS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     {[
                        { label: 'Post Tests', score: Math.round(avgPT), icon: <FileText size={20}/>, color: 'bg-amber-50 text-amber-500' },
                        { label: 'Assignments', score: Math.round(avgAssign), icon: <Target size={20}/>, color: 'bg-blue-50 text-blue-600' },
                        { label: 'Group Challenges', score: Math.round(avgGroup), icon: <Users size={20}/>, color: 'bg-indigo-50 text-indigo-600' },
                        { label: 'Participation', score: Math.round(keaktifan), icon: <Sparkles size={20}/>, color: 'bg-purple-50 text-purple-600' }
                     ].map((p, i) => (
                        <Card key={i} className="p-8 border-none shadow-lg shadow-slate-200/40 bg-white rounded-[40px] space-y-6">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${p.color}`}>
                              {p.icon}
                           </div>
                           <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.label}</p>
                              <p className="text-3xl font-black text-[#0F172A]">{p.score}<span className="text-sm text-slate-200 ml-1">/100</span></p>
                           </div>
                        </Card>
                     ))}
                  </div>

                 {/* ATTENDANCE TRACKER IN RESULTS */}
                 <Card className="p-10 lg:p-14 border-none shadow-xl shadow-slate-200/30 bg-white rounded-[56px] space-y-10">
                    <div className="flex items-center justify-between">
                       <div className="space-y-2">
                          <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">Session Attendance Log</h3>
                          <p className="text-sm font-medium text-slate-400">Kehadiran minimal 75% diperlukan untuk kelayakan sertifikat.</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Attendance</p>
                          <p className="text-3xl font-black text-blue-600">{me.attendance ? Object.values(me.attendance).filter(v => v === 'P').length : 0} <span className="text-sm text-slate-200">/{batch?.schedules?.length || 0}</span></p>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 lg:grid-cols-12 gap-3">
                       {(batch?.schedules || []).map((s: any, i: number) => {
                          const status = me.attendance?.[s.id] || me.attendance?.[`s${i+1}`] || '-';
                          return (
                             <div key={s.id || i} className={`h-14 rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${status === 'P' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : status === 'S' ? 'bg-amber-50 border-rose-100 text-amber-600' : status === 'I' ? 'bg-blue-50 border-blue-100 text-blue-600' : status === 'A' ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                                <span className="text-[8px] font-bold leading-none mb-1 opacity-50">{new Date(s.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}</span>
                                <span className="text-xs font-black">{status === 'P' ? 'P' : status}</span>
                             </div>
                          );
                       })}
                    </div>
                 </Card>
                 <div className={`p-10 rounded-[44px] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl ${me.certificate_url ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-amber-500/20' : 'bg-slate-100'}`}>
                     <div className="space-y-2">
                        <h4 className={`text-xl font-black tracking-tight ${me.certificate_url ? 'text-white' : 'text-slate-400'}`}>
                           {me.certificate_url ? '🏆 Sertifikat Kamu Sudah Tersedia!' : 'Sertifikat Belum Tersedia'}
                        </h4>
                        <p className={`text-sm font-medium opacity-80 ${me.certificate_url ? 'text-white/80' : 'text-slate-400'}`}>
                           {me.certificate_url ? 'Selamat! Mentor kamu sudah mengupload sertifikat kelulusan.' : 'Mentormu akan mengupload sertifikat setelah program selesai.'}
                        </p>
                     </div>
                     {me.certificate_url ? (
                        <a href={me.certificate_url} target="_blank" rel="noreferrer">
                           <Button className="h-16 px-10 rounded-3xl bg-white text-amber-600 font-black text-sm hover:scale-105 transition-all shadow-lg flex items-center gap-3">
                              <Download size={18}/> Download Sertifikat Kamu
                           </Button>
                        </a>
                     ) : (
                        <Button disabled className="h-16 px-10 rounded-3xl bg-slate-200 text-slate-400 font-black text-sm cursor-not-allowed">
                           Sertifikat Belum Tersedia
                        </Button>
                     )}
                  </div>
              </div>
           );
        })()}

        {activeTab === 'attendance' && (
           <div className="space-y-12">
              <div className="flex items-center justify-between px-6">
                 <div className="space-y-2">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Digital Attendance Card</h2>
                    <p className="text-slate-400 font-medium">Silahkan lakukan "Stamp" kehadiran untuk setiap sesi yang berlangsung.</p>
                 </div>
                 <div className="flex items-center gap-4 bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Logged In AS: {currentUser?.full_name}</span>
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-20">
                 {(() => {
                    const slots = batch?.schedules || [];
                    return slots.map((s: any, i: number) => {
                       const sessionId = s.id;
                       const status = me?.attendance?.[sessionId] || me?.attendance?.[`s${i+1}`] || '-';
                       const label = s.title;
                       const dateStr = new Date(s.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long' });
                       
                       return (
                          <Card key={s.id || i} className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-[44px] flex flex-col items-center justify-center text-center gap-6 group hover:-translate-y-2 transition-all border-b-4 border-transparent hover:border-blue-500">
                             <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center font-black text-2xl transition-all ${status === 'P' ? 'bg-emerald-500 text-white shadow-2xl shadow-emerald-500/20' : status === 'S' ? 'bg-amber-400 text-white shadow-2xl shadow-amber-400/20' : status === 'I' ? 'bg-blue-500 text-white shadow-2xl shadow-blue-500/20' : 'bg-slate-50 text-slate-200'}`}>
                                {status === '-' ? i + 1 : status}
                             </div>
                             
                             <div className="space-y-4">
                                <div className="space-y-1">
                                   <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{dateStr}</p>
                                   <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest leading-relaxed px-4">{label}</h4>
                                </div>
                                {status === '-' ? (
                                   <div className="flex flex-col gap-2">
                                      <button 
                                        onClick={() => handleSelfAttendance(sessionId, 'P')}
                                        className="px-6 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#1e3a8a] text-white rounded-2xl text-[10px] font-black uppercase hover:opacity-90 transition-all shadow-xl shadow-blue-900/20"
                                      >
                                         Stamp Hadir
                                      </button>
                                      <div className="flex gap-2">
                                         <button 
                                           onClick={() => handleSelfAttendance(sessionId, 'S')}
                                           className="flex-1 px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-[9px] font-bold hover:bg-amber-100 hover:text-amber-600 transition-all"
                                         >
                                            Sakit
                                         </button>
                                         <button 
                                           onClick={() => handleSelfAttendance(sessionId, 'I')}
                                           className="flex-1 px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-[9px] font-bold hover:bg-blue-100 hover:text-blue-600 transition-all"
                                         >
                                            Izin
                                         </button>
                                      </div>
                                   </div>
                                ) : (
                                   <div className="space-y-4">
                                      <p className="text-sm font-black text-slate-900 tracking-tight">Recorded as {status === 'P' ? 'PRESENT' : status === 'S' ? 'SICK' : 'PERMISSION'}</p>
                                      <button 
                                        onClick={() => handleSelfAttendance(sessionId, '-')}
                                        className="text-[9px] font-bold text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                         Reset Stamp
                                      </button>
                                   </div>
                                )}
                             </div>
                          </Card>
                       );
                    });
                 })()}
              </div>
           </div>
        )}

        {/* QUIZ TAKING MODAL - Shared Logic */}
        <AnimatePresence>
          {isQuizModalOpen && activeQuiz && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95, y: 10 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95, y: 10 }}
                 className="w-full max-w-3xl max-h-[90vh] bg-white rounded-[32px] shadow-3xl overflow-hidden flex flex-col"
               >
                  <div className="p-6 md:p-8 bg-gradient-to-r from-[#0ea5e9] to-[#1e3a8a] text-white flex items-center justify-between shrink-0">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                           <FileText size={24} className="text-white"/>
                        </div>
                        <div>
                           <h2 className="text-xl md:text-2xl font-black tracking-tight">{activeQuiz.title}</h2>
                           <p className="text-[10px] md:text-xs text-blue-100 font-bold uppercase tracking-widest mt-0.5">{activeQuiz.module_name || "Assessment"}</p>
                        </div>
                     </div>
                     <button onClick={() => setIsQuizModalOpen(false)} className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all border border-white/10 backdrop-blur-md">
                        <X size={20} className="text-white"/>
                     </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-slate-50/50">
                     {activeQuiz.quiz_data.questions.map((q: any, qi: number) => {
                        const isMC = !q.type || q.type === 'mc';
                        return (
                        <div key={qi} className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                           <div className="flex items-start gap-4">
                              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-black text-sm mt-0.5 ring-1 ring-blue-100">
                                 {qi+1}
                              </div>
                              <div className="flex-1 space-y-1">
                                 <h3 className="text-base md:text-lg font-bold text-slate-800 leading-snug">{q.text} {q.required && <span className="text-rose-500">*</span>}</h3>
                                 {!isMC && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{q.type === 'essay' ? 'Jawaban Singkat' : q.type === 'long_text' ? 'Teks Panjang' : 'Lainnya'}</span>}
                              </div>
                           </div>
                           
                           {isMC ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:pl-12">
                                {q.options.map((opt: string, oi: number) => (
                                   <button 
                                     key={oi}
                                     onClick={() => setQuizAnswers({ ...quizAnswers, [qi]: oi })}
                                     className={`p-4 rounded-2xl text-left border-2 transition-all duration-200 font-bold text-sm flex items-center justify-between group ${quizAnswers[qi] === oi ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50/30 hover:text-blue-700'}`}
                                   >
                                      <span className="pr-3 leading-snug">{opt}</span>
                                      <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${quizAnswers[qi] === oi ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white group-hover:border-blue-300'}`}>
                                         {quizAnswers[qi] === oi && <Check size={10} strokeWidth={4}/>}
                                      </div>
                                   </button>
                                ))}
                             </div>
                           ) : (
                             <div className="md:pl-12">
                               {q.type === 'long_text' ? (
                                 <textarea
                                   value={quizAnswers[qi] || ''}
                                   onChange={(e) => setQuizAnswers({ ...quizAnswers, [qi]: e.target.value })}
                                   placeholder="Tulis jawaban lengkap kamu di sini..."
                                   rows={4}
                                   className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-blue-400 focus:bg-white transition-all text-sm font-medium resize-none outline-none"
                                 />
                               ) : (
                                 <input
                                   value={quizAnswers[qi] || ''}
                                   onChange={(e) => setQuizAnswers({ ...quizAnswers, [qi]: e.target.value })}
                                   placeholder={q.type === 'essay' ? "Contoh: 100.000" : "Isi di sini..."}
                                   className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-blue-400 focus:bg-white transition-all text-sm font-medium outline-none"
                                 />
                               )}
                               <p className="text-[10px] font-bold text-slate-400 mt-3 italic">* Bagian ini akan ditinjau oleh mentor secara manual.</p>
                             </div>
                           )}
                        </div>
                      )})}


                  </div>

                  <div className="p-6 md:p-8 bg-white border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] relative z-10">
                     <p className="text-sm font-bold text-slate-400">
                        Answered: <span className="text-blue-600 font-black text-base">{Object.keys(quizAnswers).filter(k => k !== 'feedback').length}</span>/{activeQuiz.quiz_data.questions.length}
                     </p>
                     <div className="flex w-full md:w-auto gap-3">
                        <Button onClick={() => setIsQuizModalOpen(false)} variant="ghost" className="flex-1 md:flex-none h-12 px-6 rounded-[16px] text-slate-500 hover:bg-slate-100 hover:text-slate-800">Cancel</Button>
                        <Button 
                           onClick={handleSubmitQuiz}
                           disabled={Object.keys(quizAnswers).filter(k => k !== 'feedback').length < activeQuiz.quiz_data.questions.length || isLoading}
                           className="flex-1 md:flex-none h-12 px-8 rounded-[16px] bg-gradient-to-r from-[#0ea5e9] to-[#1e3a8a] text-white font-black text-sm shadow-xl shadow-blue-900/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale hover:opacity-90"
                        >
                           Submit & Finish
                        </Button>
                     </div>
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* RESULTS MODAL - Premium Experience */}
        <AnimatePresence>
          {isResultModalOpen && (() => {
              const questions = activeQuiz?.quiz_data?.questions || [];
              const mcQuestions = questions.filter((q: any) => !q.type || q.type === 'mc');
              const wrongAnswers = mcQuestions.map((q: any) => {
                 const qi = questions.indexOf(q);
                 const studentAnswer = quizAnswers[qi];
                 if (studentAnswer !== q.correct) {
                    return {
                       number: qi + 1,
                       questionHtml: q.text,
                       studentChoice: studentAnswer !== undefined ? q.options[studentAnswer] : "Tidak Dijawab",
                       correctChoice: q.options[q.correct]
                    };
                 }
                 return null;
              }).filter(Boolean);

             return (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-2xl">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.8, y: 100 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.8, y: 100 }}
                 className="w-full max-w-xl bg-white rounded-[56px] shadow-3xl overflow-hidden relative flex flex-col max-h-[95vh]"
               >
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 z-20"/>
                  
                  <div className="overflow-y-auto p-12 space-y-8 flex-1 scrollbar-thin scrollbar-thumb-slate-200">
                     <div className="text-center space-y-4">
                        <div className={`w-24 h-24 rounded-[36px] mx-auto flex items-center justify-center shadow-2xl ${lastQuizResult >= 80 ? 'bg-emerald-500 text-white shadow-emerald-500/30' : lastQuizResult >= 60 ? 'bg-blue-600 text-white shadow-blue-600/30' : 'bg-rose-500 text-white shadow-rose-500/30'}`}>
                           {lastQuizResult >= 80 ? <Award size={48}/> : lastQuizResult >= 60 ? <Check size={48} strokeWidth={3}/> : <Zap size={48}/>}
                        </div>
                        <div className="space-y-1">
                           <h3 className="text-3xl font-black text-[#0F172A] tracking-tighter">
                              {lastQuizResult >= 80 ? 'Incredible Work!' : lastQuizResult >= 60 ? 'Great Progress!' : 'Keep Learning!'}
                           </h3>
                           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Your dynamic score report is ready</p>
                        </div>
                     </div>

                     <div className="p-10 rounded-[44px] bg-slate-50 border border-slate-100 space-y-2 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Achieved Score</p>
                        <div className="flex items-baseline justify-center gap-2">
                           <span className={`text-6xl font-black ${lastQuizResult >= 80 ? 'text-emerald-500' : lastQuizResult >= 60 ? 'text-blue-600' : 'text-rose-500'}`}>{lastQuizResult}</span>
                           <span className="text-xl font-black text-slate-300">/100</span>
                        </div>
                     </div>

                     {/* WRONG ANSWERS REPORT */}
                     {wrongAnswers.length > 0 && (
                        <div className="space-y-6 pt-4 border-t border-slate-100 text-left">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center font-black text-xs border border-rose-100 shadow-sm shrink-0">
                                 {wrongAnswers.length}
                              </div>
                              <div>
                                 <h3 className="text-lg font-black text-[#0F172A] tracking-tight">Koreksi Jawaban Salah</h3>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Needs Improvement</p>
                              </div>
                           </div>
                           
                           <div className="grid grid-cols-1 gap-4">
                              {wrongAnswers.map((wa: any, idx: number) => (
                                 <div key={idx} className="p-5 bg-white border border-slate-200 rounded-[24px] shadow-sm space-y-4">
                                    <div className="flex gap-3 items-start">
                                       <span className="shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-black">{wa.number}</span>
                                       <p className="text-sm font-bold text-slate-800 leading-snug pt-0.5">{wa.questionHtml}</p>
                                    </div>
                                    <div className="pl-9 space-y-3 pt-1 border-t border-slate-50 mt-4">
                                       <div className="flex gap-2 items-start">
                                          <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[10px] font-black uppercase shrink-0 mt-0.5 shadow-inner">Tebakan</span>
                                          <p className="text-xs font-medium text-slate-500 line-through decoration-rose-300">{wa.studentChoice}</p>
                                       </div>
                                       <div className="flex gap-2 items-start">
                                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase shrink-0 mt-0.5 shadow-inner">Benar</span>
                                          <p className="text-xs font-bold text-emerald-600 bg-emerald-50/50">{wa.correctChoice}</p>
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     <div className="space-y-4 text-center pt-6 pb-2">
                        <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-[280px] mx-auto">
                           {lastQuizResult >= 80 ? 'Maaf, score kamu terlalu sempurna! Kamu resmi menjadi salah satu murid terbaik minggu ini.' : 'Bagus! Kamu sudah menguasai materi ini dengan baik. Terus tingkatkan performamu!'}
                        </p>
                        <Button 
                           onClick={() => setIsResultModalOpen(false)}
                           className="w-full h-16 rounded-[24px] bg-gradient-to-r from-[#0ea5e9] to-[#1e3a8a] text-white font-black text-sm shadow-xl shadow-blue-900/20 active:scale-95 transition-all"
                        >
                           Continue Journey
                        </Button>
                     </div>
                  </div>
               </motion.div>
            </div>
             );
          })()}
        </AnimatePresence>

        {/* PHOTO LIGHTBOX (Pengumuman) */}
        <AnimatePresence>
          {isArticleModalOpen && activeArticle && activeArticle.category === 'Pengumuman' && (
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsArticleModalOpen(false)}
               className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-12 bg-slate-950/90 backdrop-blur-2xl cursor-zoom-out"
             >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  onClick={e => e.stopPropagation()}
                  className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[32px] shadow-2xl cursor-default"
                >
                   {activeArticle.image_url && (
                      <img src={activeArticle.image_url} alt={activeArticle.title} className="w-full h-auto max-h-[85vh] object-contain rounded-[32px]"/>
                   )}
                   <div className="absolute top-4 right-4">
                      <button onClick={() => setIsArticleModalOpen(false)} className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all">
                         <X size={22}/>
                      </button>
                   </div>
                   <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-8 rounded-b-[32px]">
                      <span className="px-4 py-2 bg-blue-500 rounded-xl text-[10px] font-black uppercase tracking-widest text-white">{activeArticle.category}</span>
                      <h3 className="text-2xl font-black text-white mt-3 leading-tight">{activeArticle.title}</h3>
                      {activeArticle.summary && <p className="text-sm text-white/60 mt-2 leading-relaxed">{activeArticle.summary}</p>}
                   </div>
                </motion.div>
             </motion.div>
          )}
        </AnimatePresence>

        {/* ARTICLE READING MODAL (Artikel/Tips/etc) */}
        <AnimatePresence>
          {isArticleModalOpen && activeArticle && activeArticle.category !== 'Pengumuman' && (
             <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 md:p-12 bg-slate-900/60 backdrop-blur-3xl">
                <motion.div 
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100 }}
                  className="w-full max-w-5xl h-full max-h-[90vh] bg-white rounded-[56px] shadow-3xl overflow-hidden flex flex-col md:flex-row border border-white/20"
                >
                   {/* Left: Image/Visual Side (Desktop) */}
                   <div className="hidden md:block w-2/5 h-full bg-slate-100 relative overflow-hidden shrink-0">
                      {activeArticle.image_url ? (
                         <img src={activeArticle.image_url} alt={activeArticle.title} className="w-full h-full object-cover"/>
                      ) : (
                         <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center">
                            <Layout size={80} className="text-white/10"/>
                         </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"/>
                      <div className="absolute bottom-12 left-12 right-12 text-white space-y-4">
                         <div className="px-4 py-2 bg-blue-500 rounded-xl text-[10px] font-black uppercase tracking-widest w-fit">
                            {activeArticle.category}
                         </div>
                         <h2 className="text-3xl font-black leading-tight tracking-tighter uppercase">{activeArticle.title}</h2>
                      </div>
                   </div>

                   {/* Right: Content Side */}
                   <div className="flex-1 overflow-y-auto p-8 md:p-16 lg:p-20 flex flex-col gap-10 scrollbar-hide">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                               <MessageCircle size={24}/>
                            </div>
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Post by Mentor</p>
                               <p className="text-xs font-bold text-slate-900">{new Date(activeArticle.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                         </div>
                         <button onClick={() => setIsArticleModalOpen(false)} className="p-4 bg-slate-50 rounded-2xl text-slate-300 hover:text-rose-500 transition-all active:scale-90">
                            <X size={24}/>
                         </button>
                      </div>

                      <div className="space-y-8">
                         <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-[1.1]">{activeArticle.title}</h1>
                         
                         <div className="flex items-center gap-6">
                            <button 
                               onClick={() => handleReaction(activeArticle.id)}
                               className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all ${activeArticle.reactions?.includes(currentUser?.id) ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                            >
                               <Heart size={20} fill={activeArticle.reactions?.includes(currentUser?.id) ? "currentColor" : "none"}/>
                               <span className="text-sm font-black">{activeArticle.reactions?.length || 0} Likes</span>
                            </button>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                               <Share2 size={18}/>
                            </div>
                         </div>

                         <div className="h-1 w-20 bg-blue-600 rounded-full"/>

                         <div className="prose prose-slate max-w-none">
                            <p className="text-lg md:text-xl font-bold text-slate-600 italic leading-relaxed border-l-8 border-blue-50 pl-8 mb-10">
                                {activeArticle.summary}
                            </p>
                            
                            <div className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                               {activeArticle.content}
                            </div>
                         </div>
                      </div>

                      <div className="mt-auto pt-12">
                         <button 
                            onClick={() => setIsArticleModalOpen(false)}
                            className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black text-sm uppercase shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3"
                         >
                            SELESAI MEMBACA <Check size={20}/>
                         </button>
                      </div>
                   </div>
                </motion.div>
             </div>
          )}
        </AnimatePresence>

        {/* SUBMIT ASSIGNMENT MODAL (Non-Quiz) */}
         <AnimatePresence>
           {isSubmitModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl">
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.9, y: 30 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.9, y: 30 }}
                   className="w-full max-w-xl bg-white rounded-[56px] shadow-3xl overflow-hidden flex flex-col p-10 space-y-10"
                 >
                    <div className="flex items-center justify-between">
                       <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center"><Target size={30}/></div>
                       <button onClick={() => setIsSubmitModalOpen(false)} className="p-3 bg-slate-50 rounded-xl text-slate-300 hover:text-rose-500 transition-all"><X size={20}/></button>
                    </div>

                    <div className="space-y-3">
                       <h2 className="text-3xl font-black text-[#0F172A] tracking-tighter">Submit Your Best Work</h2>
                       <div className="flex items-center gap-3">
                          <p className="text-sm font-medium text-slate-400">Pastikan link pekerjaan kamu (Gdrive/Canva) sudah bisa diakses oleh mentor.</p>
                          {activeTask?.due_date && (
                             <div className="px-3 py-1 bg-rose-50 rounded-lg text-[10px] font-black text-rose-500 flex items-center gap-1 border border-rose-100">
                                <Clock size={10}/> DEADLINE: {new Date(activeTask.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                             </div>
                          )}
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">DOCUMENT/PROJECT LINK</label>
                          <input 
                             value={submitForm.file_link}
                             onChange={(e) => setSubmitForm({ ...submitForm, file_link: e.target.value })}
                             placeholder="https://canva.com/..."
                             className="w-full h-16 rounded-[24px] bg-slate-50 border border-slate-100 px-8 text-sm font-bold focus:border-blue-500/50 focus:outline-none transition-all"
                         />
                       </div>

                       {(activeTask?.type === 'group_assignment' || activeTask?.assignment_group_id) && myCustomGroups.length > 0 && (
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">🗳️ MEWAKILI KELOMPOK (Daftar Tim)</label>
                             <select 
                                value={selectedGroupToRepresent || ''}
                                onChange={(e) => setSelectedGroupToRepresent(e.target.value)}
                                className="w-full h-16 rounded-[24px] bg-slate-50 border border-slate-100 px-8 text-sm font-bold focus:border-blue-500/50 focus:outline-none transition-all outline-none"
                             >
                                <option value="">-- Pilih Kelompok Kamu --</option>
                                {myCustomGroups.map(g => (
                                   <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                             </select>
                             <p className="text-[9px] font-bold text-blue-500 ml-4 uppercase tracking-tighter">✨ Tugas otomatis dikloning ke teman satu tim!</p>
                          </div>
                       )}
                    </div>

                    <Button 
                       onClick={handleSubmitAssignment}
                       disabled={isLoading}
                       className="h-16 w-full rounded-[24px] bg-gradient-to-r from-[#0ea5e9] to-[#1e3a8a] text-white font-black text-sm shadow-xl shadow-blue-900/20 active:scale-95 transition-all"
                    >
                       Kirim Tugas Sekarang
                    </Button>
                 </motion.div>
              </div>
           )}
         </AnimatePresence>

         {/* FEEDBACK MODAL */}
         <AnimatePresence>
           {isFeedbackModalOpen && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl">
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.9, y: 30 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.9, y: 30 }}
                   className="w-full max-w-xl bg-white rounded-[56px] shadow-3xl overflow-hidden flex flex-col p-10 space-y-10"
                 >
                    <div className="flex items-center justify-between">
                       <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center"><MessageSquare size={30}/></div>
                       <button onClick={() => setIsFeedbackModalOpen(false)} className="p-3 bg-slate-50 rounded-xl text-slate-300 hover:text-rose-500 transition-all"><X size={20}/></button>
                    </div>

                    <div className="space-y-3">
                       <h2 className="text-3xl font-black text-[#0F172A] tracking-tighter">Mentor Feedback</h2>
                       <p className="text-sm font-black text-blue-600 uppercase tracking-widest">{activeTask?.title}</p>
                    </div>

                    <div className="p-8 rounded-[32px] bg-slate-50/50 border border-slate-100 text-lg font-medium text-slate-700 leading-relaxed italic">
                       "{submitForm.mentor_feedback || "Belum ada catatan tambahan dari mentor. Semangat!"}"
                    </div>
                     <Button 
                        onClick={() => setIsFeedbackModalOpen(false)}
                        className="h-16 w-full rounded-[24px] bg-gradient-to-r from-[#0ea5e9] to-[#1e3a8a] text-white font-black text-sm shadow-xl shadow-blue-900/20 hover:opacity-90 transition-all"
                     >
                        Close Review
                     </Button>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* 4. AVATAR CREATOR MODAL */}
         <AnimatePresence>
            {isPhotoSetupOpen && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center p-8 overflow-y-auto">
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-5xl space-y-12">
                     <div className="flex flex-col items-center text-center space-y-4">
                        <div className="px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest">Identity Setup</div>
                        <h2 className="text-5xl font-black text-white tracking-tight leading-none">Hello, <span className="text-blue-600">{currentUser?.full_name?.split(' ')[0]}</span>!</h2>
                        <p className="text-slate-400 text-lg max-w-xl leading-relaxed">Pilih gayamu di ekosistem Ruang Sosmed.</p>
                     </div>
                     <AvatarCreator initialName={currentUser?.full_name} onSave={handleSaveProfileAvatar} onCancel={() => setIsPhotoSetupOpen(false)}/>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>

         <AnimatePresence>
            {isIdCardOpen && (
               <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#0F172A]/80 backdrop-blur-md">
                 <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-md relative">
                   <button onClick={() => setIsIdCardOpen(false)} className="absolute -top-24 left-1/2 -translate-x-1/2 text-white/40 hover:text-white flex flex-col items-center gap-2">
                     <X size={24}/> <span>Close</span>
                   </button>
                   <div ref={idCardRef} className="w-full h-auto">
                     <Suspense fallback={<div className="h-[500px] flex items-center justify-center text-white/20">Loading Identity Card...</div>}>
                        <IdCardContent batch={batch} currentUser={currentUser} me={me} resolvedParams={resolvedParams}/>
                     </Suspense>
                    <div className="mt-10">
                       <Button 
                        onClick={() => setIsIdCardOpen(false)} 
                        className="w-full h-16 rounded-[28px] bg-white hover:bg-slate-100 text-slate-900 font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all"
                       >
                         Paham, Lanjutkan Belajar
                       </Button>
                    </div>
                   </div>
                 </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}
