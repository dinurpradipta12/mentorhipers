"use client";



import React, { useState, useEffect, useRef, use, useMemo } from "react";
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
  Trophy,
  FileText,
  UserPlus,
  Share2,
  ExternalLink,
  Check,
  Edit,
  Trash2,
  Settings,
  List,
  Eye,
  EyeOff,
  UserCheck,
  Play,
  PlayCircle,
  ClipboardList,
  Download,
  CalendarCheck,
  CalendarDays,
  ArrowLeft,
  ChevronLeft,
  Star,
  MoreVertical,
  Medal,
  UserX,
  Layout,
  Heart,
  Edit3,
  ArrowRight,
  ShuffleIcon,
  User,
  Camera
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabaseV2 as supabase } from "@/lib/supabase";
import { getCachedSession, isLegacyAdmin } from "@/lib/authCache";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { getYouTubeEmbedUrl, compressImage } from "@/lib/utils";
//Server Actions replaced with fetch calls to Edge-compatible API routes

import dynamic from "next/dynamic";
const IdCardContent = dynamic(() => import("./IdCardContent"), {
  loading: () => <div className="h-64 flex items-center justify-center text-slate-200">Loading Student Identity...</div>,
  ssr: false
});

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
     <div className="flex gap-4 justify-center">
       {Object.entries(timeLeft).map(([key, val]) => (
         <div key={key} className="flex flex-col items-center">
           <div className="w-20 h-24 bg-white/10 rounded-[28px] border border-white/20 backdrop-blur-md flex items-center justify-center">
             <span className="text-4xl font-black">{val < 10 ? `0${val}` : val}</span>
           </div>
           <span className="text-[10px] font-black uppercase tracking-widest mt-3 opacity-40">{key === 'd' ? 'Days' : key === 'h' ? 'Hours' : key === 'm' ? 'Mins' : 'Secs'}</span>
         </div>
       ))}
     </div>
   );
 }

export default function BatchContentDesktop({ id }: { id: string }) {
  const resolvedParams = { id };
  const router = useRouter(); 
  const [activeTab, setActiveTab] = useState("students");
  const [batch, setBatch] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
 //Auth Store
  const [currentUser, setCurrentUser] = useState<any>(null);

 //Data Store
  const [students, setStudents] = useState<any[]>([]);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  
 //Registration Modal State
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ fullName: '', username: '', password: '' });

 //LMS Management State
  const [isLmsModalOpen, setIsLmsModalOpen] = useState(false);
  const [editingLmsItem, setEditingLmsItem] = useState<any>(null);
  const [lmsForm, setLmsForm] = useState<any>({
     title: '',
     module_name: '',
     type: 'material',
     video_url: '',
     content_rich: '',
     due_date: '',
     is_published: true,
     assets_json: [],
     quiz_data: { questions: [] }
  });

 //Template Picker State (for Quiz Builder)
  const [quizTemplates, setQuizTemplates] = useState<any[]>([]);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');
  
 //Registration Success Interaction
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [regSuccessData, setRegSuccessData] = useState<any>(null);

 //Quiz & Submission Interaction
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<any>({});
  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ title: '', date: '', time: '', meet_link: '' });
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupLink, setEditGroupLink] = useState("");
  const [submissionsData, setSubmissionsData] = useState<any[]>([]); 
  const [allSubmissions, setAllSubmissions] = useState<any[]>([]); 
  
  // Custom Assignment Groups State
  const [customGroups, setCustomGroups] = useState<any[]>([]);
  const [isCustomGroupModalOpen, setIsCustomGroupModalOpen] = useState(false);
  const [customGroupForm, setCustomGroupForm] = useState({ name: '', description: '', members: [] as string[] });

  // Feed Board States
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [annForm, setAnnForm] = useState({ 
      category: 'Umum', 
      title: '', 
      summary: '', 
      content: '', 
      image_url: '', 
      gallery_images: [] as string[],
      is_pinned: false 
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const [gradingConfig, setGradingConfig] = useState<any>({
     post_test_weight: 25,
     assignment_weight: 25,
     challenge_weight: 25,
     attendance_weight: 25
  });

  const [activeQuizReview, setActiveQuizReview] = useState<any>(null);
  const [isQuizReviewModalOpen, setIsQuizReviewModalOpen] = useState(false);
  const [viewingCurriculum, setViewingCurriculum] = useState<any>(null);

 //Results Modal
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [lastQuizResult, setLastQuizResult] = useState<number>(0);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any>(null);
  const [matrixSearch, setMatrixSearch] = useState('');

  const filteredMatrix = useMemo(() => {
    const term = matrixSearch.toLowerCase().trim();
    if (!term) return students;
    return students.filter(s => (s.v2_profiles?.full_name || '').toLowerCase().includes(term));
  }, [students, matrixSearch]);

  // Bulk Grading Modal
  const [isBulkGradeModalOpen, setIsBulkGradeModalOpen] = useState(false);
  const [bulkGradeData, setBulkGradeData] = useState<{ sub: any, members: any[] } | null>(null);

 //Student Management State
  const [studentActionTarget, setStudentActionTarget] = useState<any>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const [studentSearch, setStudentSearch] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<any[]>([]);
  const [isManualGrading, setIsManualGrading] = useState(false);
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);
  const [isCredentialSuccess, setIsCredentialSuccess] = useState(false);
  const [editStudentName, setEditStudentName] = useState('');
  const [certUrl, setCertUrl] = useState('');
  const [moveGroupTarget, setMoveGroupTarget] = useState('');
  const initializedRef = useRef(false);

  useEffect(() => {
    const initPage = async () => {
      setIsLoading(true);
      console.log("🚀 Starting V2 Batch Initialization (Sequential Mode)...");
      const timeout = setTimeout(() => {
        console.warn("⚠️ Initialization taking too long (40s limit). Forcing UI render.");
        setIsLoading(false);
      }, 40000);

      try {
        await Promise.all([
          fetchUserData(),
          fetchBatchDetail(),
          fetchCurriculum(),
          fetchStudents(),
          fetchAllSubmissions(),
          fetchCustomGroups(),
          fetchAnnouncements()
        ]);
        console.log("✅ Initialization Complete.");
      } catch (err: any) {
        console.error("❌ Overall Page Initialization Failed:", err.message);
      } finally {
        clearTimeout(timeout);
        setIsLoading(false);
      }
    };
    initPage();
    const savedTab = localStorage.getItem(`batch_tab_${resolvedParams.id}`);
    if (savedTab) setActiveTab(savedTab);
  }, [resolvedParams.id]);

  useEffect(() => {
    if (!resolvedParams.id) return;
    const channel = supabase
      .channel(`batch_${resolvedParams.id}_presence`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineIds = new Set<string>();
        Object.values(state).forEach((presences: any) => {
          presences.forEach((p: any) => {
            if (p.profile_id) onlineIds.add(p.profile_id);
          });
        });
        setOnlineUsers(onlineIds);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        // Show toast but only for OTHER users, not myself
        newPresences.forEach((p: any) => {
          if (p.profile_id && p.profile_id !== currentUser?.id) {
            const student = students.find(s => s.profile_id === p.profile_id);
            if (student) {
              const toastId = Math.random().toString(36).substring(7);
              setToasts(prev => [...prev, { 
                id: toastId, 
                name: student.v2_profiles?.full_name || 'A Student',
                avatar: student.v2_profiles?.avatar_url
              }]);
              // Auto-remove after 4 seconds
              setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== toastId));
              }, 4000);
            }
          }
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            profile_id: currentUser?.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    const memChannel = supabase
      .channel(`batch_${resolvedParams.id}_memberships`)
      .on('postgres_changes', { 
        event: 'INSERT',
        schema: 'public', 
        table: 'v2_memberships',
        filter: `workspace_id=eq.${resolvedParams.id}`
      }, () => {
        console.log("⚡ New member joined — refreshing students list...");
        fetchStudents();
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(channel); 
      supabase.removeChannel(memChannel);
    };
  }, [resolvedParams.id, currentUser?.id]);

   const fetchUserData = async () => {
   //Use cached session — avoids network call on every mount
    const session = await getCachedSession();
    const user = session?.user;
    
   //2. CHECK LEGACY BYPASS (From localStorage)
    const legacyAdmin = isLegacyAdmin();
    const isArunika = (user?.email?.toLowerCase().includes('arunika')) || legacyAdmin;

    if (isArunika) {
       setCurrentUser({ full_name: 'Admin Arunika', role: 'admin', email: user?.email || 'arunika@legacy' });
       const savedTab = typeof window !== 'undefined' ? localStorage.getItem(`batch_tab_${resolvedParams.id}`) : null;
       if (!savedTab) setActiveTab('students');
    }

    if (!user && !legacyAdmin) return;

    try {
      if (user) {
         const { data: profile } = await supabase.from('v2_profiles').select('id, full_name, username, role, updated_at').eq('id', user.id).single();
         
         if (profile) {
           const updatedUser = { ...profile, email: user.email, role: isArunika ? 'admin' : profile.role };
           setCurrentUser(updatedUser);
           
           if (updatedUser.role === 'student' && !isArunika) {
              router.push(`/ruang-sosmed/${resolvedParams.id}`);
              return;
           }

           if (updatedUser.role === 'admin' || isArunika) {
              setActiveTab('students');
           } else {
              setActiveTab('learning');
           }
         }
      }
    } catch (err) {
       console.error("V2 Auth Error:", err);
    }
  };

  const fetchAllSubmissions = async () => {
    //Run both queries in PARALLEL to halve connection time
     const [subResult, qResult] = await Promise.all([
       supabase.from('v2_submissions').select('id, curriculum_id, profile_id, grade').eq('workspace_id', resolvedParams.id),
       supabase.from('v2_quiz_results').select('id, curriculum_id, profile_id, score').eq('workspace_id', resolvedParams.id)
     ]);
     
     const combined = [...(subResult.data || []), ...(qResult.data || [])];
     setAllSubmissions(combined);
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/ruang-sosmed/${resolvedParams.id}`;
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShuffleGroups = async (num = 5) => {
     if (!students.length) return;
     setIsLoading(true);
     try {
        const shuffled = [...students].sort(() => Math.random() - 0.5);
        const updates = shuffled.map((s, i) => {
           const grIdx = Math.floor(i/(Math.ceil(students.length/num)));
           const gName = `Team ${String.fromCharCode(65 + grIdx)}`;//Team A, B, C...
           return supabase.from('v2_memberships').update({ group_name: gName }).eq('id', s.id);
        });
        await Promise.all(updates);
        fetchStudents();
        setIsGroupModalOpen(false);
     } catch (err: any) {
        alert(err.message);
     } finally {
        setIsLoading(false);
     }
  };

  const handleToggleLeader = async (id: string, current: boolean) => {
     try {
        const { error } = await supabase.from('v2_memberships').update({ is_leader: !current }).eq('id', id);
        if (error) throw error;
        setStudents(prev => prev.map(s => s.id === id ? { ...s, is_leader: !current } : s));
     } catch (err: any) { alert(err.message); }
  };

  const handleSaveGroupConfig = async (oldName: string) => {
     if (!editingGroup) return;
     if (!editGroupName.trim()) { setEditingGroup(null); return; }
     
     setIsLoading(true);
     try {
        const { error } = await supabase
           .from('v2_memberships')
           .update({ 
              group_name: editGroupName.trim(),
              group_wa_link: editGroupLink.trim()
           })
           .eq('workspace_id', resolvedParams.id)
           .eq('group_name', oldName);
           
        if (error) throw error;
        
        setStudents(prev => prev.map(s => s.group_name === oldName ? {
           ...s,
           group_name: editGroupName.trim(),
           group_wa_link: editGroupLink.trim()
        } : s));
        setEditingGroup(null);
     } catch (err: any) {
        alert(err.message);
     } finally {
        setIsLoading(false);
     }
  };

 //--- STUDENT MANAGEMENT HANDLERS ---
  const handleUpdateStudentName = async () => {
    if (!studentActionTarget || !editStudentName.trim()) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from('v2_profiles').update({ full_name: editStudentName.trim() }).eq('id', studentActionTarget.profile_id);
      if (error) throw error;
      setStudents(prev => prev.map(s => s.id === studentActionTarget.id ? { ...s, v2_profiles: { ...s.v2_profiles, full_name: editStudentName.trim() } } : s));
      setStudentActionTarget(null);
    } catch (err: any) { alert(err.message); }
    finally { setIsLoading(false); }
  };

  const handleMoveStudentGroup = async () => {
    if (!studentActionTarget) return;
    setIsLoading(true);
    try {
      const newGroup = moveGroupTarget === '__remove__' ? null : moveGroupTarget;
      const { error } = await supabase.from('v2_memberships').update({ group_name: newGroup, is_leader: false }).eq('id', studentActionTarget.id);
      if (error) throw error;
      setStudents(prev => prev.map(s => s.id === studentActionTarget.id ? { ...s, group_name: newGroup, is_leader: false } : s));
      setStudentActionTarget(null);
    } catch (err: any) { alert(err.message); }
    finally { setIsLoading(false); }
  };

  const handleSaveCertificate = async () => {
    if (!studentActionTarget) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from('v2_memberships').update({ certificate_url: certUrl.trim() || null }).eq('id', studentActionTarget.id);
      if (error) throw error;
      setStudents(prev => prev.map(s => s.id === studentActionTarget.id ? { ...s, certificate_url: certUrl.trim() || null } : s));
      setStudentActionTarget(null);
    } catch (err: any) { alert(err.message); }
    finally { setIsLoading(false); }
  };

  const handleRemoveStudent = async (mem: any) => {
    if (!confirm(`Hapus ${mem.v2_profiles?.full_name} dari batch ini? Akun tidak akan dihapus, hanya aksesnya ke batch ini.`)) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from('v2_memberships').delete().eq('id', mem.id);
      if (error) throw error;
      setStudents(prev => prev.filter(s => s.id !== mem.id));
      setOpenActionMenuId(null);
    } catch (err: any) { alert(err.message); }
    finally { setIsLoading(false); }
  };



  const handleSaveSchedule = async () => {
    if (!scheduleForm.title || !scheduleForm.date || !scheduleForm.time) return alert("Penuhi data jadwal (Title, Date, Time)!");
    
    setIsLoading(true);
    try {
      const newScheduleItem = { id: crypto.randomUUID(), ...scheduleForm };
      const currentSchedules = batch?.schedules || [];
      const newSchedules = [...currentSchedules, newScheduleItem].sort((a,b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

      const res = await fetch('/api/ruang-sosmed/update-schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: resolvedParams.id, schedules: newSchedules })
      });
      const updateResponse = await res.json();
      if (!updateResponse.success) throw new Error(updateResponse.error);
      setBatch({ ...batch, schedules: newSchedules });
      setScheduleForm({ title: '', date: '', time: '', meet_link: '' });
    } catch(err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm("Hapus jadwal ini?")) return;
    try {
      const currentSchedules = batch?.schedules || [];
      const newSchedules = currentSchedules.filter((s:any) => s.id !== id);

      const res = await fetch('/api/ruang-sosmed/update-schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: resolvedParams.id, schedules: newSchedules })
      });
      const updateResponse = await res.json();
      if (!updateResponse.success) throw new Error(updateResponse.error);
      setBatch({ ...batch, schedules: newSchedules });
    } catch(err: any) {
      alert(err.message);
    }
  };

  const handleCopyMessage = () => {
    if (!regSuccessData) return;
    navigator.clipboard.writeText(regSuccessData.waMessage);
    alert("WhatsApp Message Copied to Clipboard!");
  };

  const handleAddStudent = async () => {
    if (!newStudent.fullName || !newStudent.username || !newStudent.password) {
       alert("Lengkapi semua field!");
       return;
    }

    setIsLoading(true);

    try {
     //Call Edge API Route (replacing Server Action - Cloudflare Pages compatible)
      const response = await fetch('/api/ruang-sosmed/register-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newStudent.fullName,
          username: newStudent.username,
          password: newStudent.password,
          workspaceId: resolvedParams.id
        })
      });

      const res = await response.json();

      if (!res.success) {
         alert(`Error: ${res.error}`);
         return;
      }
      
      const loginUrl = `${window.location.origin}/ruang-sosmed/login`;
      const waMessage = `Halo ${newStudent.fullName}! Selamat bergabung di ${batch?.name || "Ruang Sosmed"}.\n\nSilakan login di ${loginUrl} dengan detail berikut:\nUsername: ${newStudent.username}\nPassword: ${newStudent.password}\n\nSelamat belajar! 🚀`;

     //Simpan data kreden untuk modal sukses
      setRegSuccessData({
        ...newStudent,
        waMessage,
        batchName: batch?.name
      });
      
      setIsRegModalOpen(false);
      setIsSuccessModalOpen(true);
      setNewStudent({ fullName: '', username: '', password: '' });
      
     //Refresh list
      fetchStudents();
    } catch (err: any) {
      alert(`Critical Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const openLmsModal = (item: any = null) => {
    if (item) {
       setEditingLmsItem(item);
       setLmsForm({
          title: item.title,
          module_name: item.module_name,
          type: item.type,
          video_url: item.video_url || '',
          content_rich: item.content_rich || '',
          due_date: item.due_date || '',
          is_published: item.is_published ?? true,
          assets_json: item.assets_json || [],
          quiz_data: item.quiz_data || { questions: [] }
       });
    } else {
       setEditingLmsItem(null);
       setLmsForm({
          title: '',
          module_name: '',
          type: 'material',
          video_url: '',
          content_rich: '',
          due_date: '',
          is_published: true,
          assets_json: [],
          quiz_data: { questions: [] }
       });
    }
    setIsLmsModalOpen(true);
  };

  const handleSaveLms = async () => {
     if (!resolvedParams.id || resolvedParams.id === "undefined") {
        alert("Wait! Batch ID is not valid. Please refresh the page.");
        return;
     }

     if (!lmsForm.title || !lmsForm.title.trim()) {
        alert("Judul kurikulum wajib diisi!");
        return;
     }

     setIsLoading(true);
     try {
        const payload = { ...lmsForm, title: lmsForm.title.trim() };
        if (editingLmsItem && editingLmsItem.id) {
           const { error } = await supabase.from('v2_curriculums').update(payload).eq('id', editingLmsItem.id);
           if (error) throw error;
        } else {
           const { error } = await supabase.from('v2_curriculums').insert([{ ...payload, workspace_id: resolvedParams.id }]);
           if (error) throw error;
        }
       setIsLmsModalOpen(false);
       fetchCurriculum();
    } catch (err: any) {
       alert(err.message);
    } finally {
       setIsLoading(false);
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
       //Enforce 1x attempt
        const { data: existing } = await supabase
           .from('v2_quiz_results')
           .select('id')
           .eq('curriculum_id', activeQuiz.id)
           .eq('profile_id', currentUser.id)
           .single();

        if (existing) {
           alert("Unauthorized attempt: You have already submitted this task.");
           setIsQuizModalOpen(false);
           return;
        }

        const questions = activeQuiz.quiz_data.questions;
        let correctCount = 0;
        questions.forEach((q: any, i: number) => {
           if (quizAnswers[i] === q.correct) correctCount++;
        });

        const score = Math.round((correctCount/questions.length) * 100);

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

       //2. Sync to Grading Matrix (v2_memberships)
       //Find which index this quiz belongs to (e.g. PT1, PT2, etc) based on module name or order
        const ptIndex = curriculum.filter(c => c.type === 'post_test').findIndex(c => c.id === activeQuiz.id);
        
        if (ptIndex !== -1) {
           const myMembership = students.find(s => s.profile_id === currentUser.id);
           if (myMembership) {
              const newGrades = { ...myMembership.grades };
              if (!newGrades.post_tests) newGrades.post_tests = [0,0,0,0,0,0];
              newGrades.post_tests[ptIndex] = score;
              
              await supabase.from('v2_memberships').update({ grades: newGrades }).eq('id', myMembership.id);
              fetchStudents();//Refresh local students state
           }
        }

        setLastQuizResult(score);
        setIsQuizModalOpen(false);
        setIsResultModalOpen(true);
     } catch (err: any) {
        alert("Failed to submit quiz: " + err.message);
     } finally {
        setIsLoading(false);
     }
  };

  const handleViewSubmissions = async (c: any) => {
     setViewingCurriculum(c);
     setIsLoading(true);
     try {
        const isQuiz = c.type === 'post_test';
        const table = isQuiz ? 'v2_quiz_results' : 'v2_submissions';
        const selectQuery = isQuiz
           ? '*, v2_profiles(full_name, avatar_url)'
           : '*, v2_profiles!profile_id(full_name, avatar_url)';
           
        const { data, error } = await supabase
           .from(table)
           .select(selectQuery)
           .eq('curriculum_id', c.id)
           .order('created_at', { ascending: false });
        
        if (error) throw error;
        setSubmissionsData(data || []);
        setIsSubmissionsModalOpen(true);
     } catch (err: any) {
        alert("Error fetching submissions: " + err.message);
     } finally {
        setIsLoading(false);
     }
  };

  const handleSaveFeedback = async (subId: string, feedback: string) => {
     try {
        const { error } = await supabase
           .from('v2_submissions')
           .update({ 
              mentor_feedback: feedback,
              status: 'completed' 
           })
           .eq('id', subId);
        if (error) throw error;
        
        setSubmissionsData(prev => prev.map(s => s.id === subId ? { ...s, mentor_feedback: feedback, status: 'completed' } : s));
        fetchAllSubmissions();//Update global state
     } catch (err: any) {
        alert("Failed to save feedback: " + err.message);
     }
  };

  const handleSaveGrade = async (subId: string, grade: string, criteria: any = null) => {
     const gradeNum = parseInt(grade);
     if (isNaN(gradeNum)) return;
     
     try {
        const { error } = await supabase
           .from('v2_submissions')
           .update({ 
              grade: gradeNum,
              criteria_scores: criteria,
              status: 'completed'
           })
           .eq('id', subId);
        if (error) throw error;
        
        setSubmissionsData(prev => prev.map(s => s.id === subId ? { ...s, grade: gradeNum, criteria_scores: criteria, status: 'completed' } : s));
        fetchAllSubmissions();//Update global state

        // ==========================================
        // AUTO-GRADING FOR CLONED ALL GROUP MEMBERS
        // ==========================================
        const currentSub = submissionsData.find(s => s.id === subId);
        const task = curriculum.find(t => t.id === currentSub?.curriculum_id);
        
        if (task?.grading_mode !== 'manual' && (task?.type === 'challenge' || task?.type === 'group_assignment' || task?.assignment_group_id)) {
           // Cari semua submission hasil clone yang mereferensikan submission ketua
           const clonedSubs = submissionsData.filter(s => s.cloned_from_submission_id === subId || (s.is_cloned && s.submitted_by_profile_id === currentSub?.profile_id && s.curriculum_id === task.id));
           
           if (clonedSubs.length > 0) {
              const updates = clonedSubs.map(cSub => ({
                  id: cSub.id,
                  grade: gradeNum,
                  criteria_scores: criteria,
                  status: 'completed',
                  mentor_feedback: `[AUTO-SYNC] Nilai kelompok disinkronkan otomatis berkat ${currentSub?.v2_profiles?.full_name || 'Ketua Tim'}!`
              }));
              
              for (const u of updates) {
                 await supabase.from('v2_submissions').update({
                    grade: u.grade,
                    criteria_scores: u.criteria_scores,
                    status: u.status,
                    mentor_feedback: u.mentor_feedback
                 }).eq('id', u.id);
              }
              
              // Refresh state
              setSubmissionsData(prev => prev.map(s => {
                 const match = updates.find(u => u.id === s.id);
                 if (match) return { ...s, grade: match.grade, criteria_scores: match.criteria_scores, status: match.status, mentor_feedback: match.mentor_feedback };
                 return s;
              }));
           } else {
               // Fallback: Kombinasi logikal lama jika data clone tidak ditemukan tapi dia adalah leader
               const studentMembership = students.find(s => s.profile_id === currentSub?.profile_id);
               if (studentMembership?.is_leader && studentMembership.group_name) {
                  const members = students.filter(s => s.group_name === studentMembership.group_name && !s.is_leader);
                  for (const m of members) {
                     await supabase.from('v2_submissions').upsert({
                           curriculum_id: task.id,
                           profile_id: m.profile_id,
                           workspace_id: resolvedParams.id,
                           grade: gradeNum,
                           status: 'completed',
                           mentor_feedback: `Auto-graded from Group Leader (${studentMembership.group_name})`
                     }, { onConflict: 'curriculum_id,profile_id' });
                  }
               }
           }
        }
     } catch (err: any) {
        alert("Failed to save grade: " + err.message);
     }
  };

  const openBulkGradeSelector = (sub: any) => {
     const leaderMembership = students.find(s => s.profile_id === sub.profile_id);
     if (!leaderMembership?.group_name) {
        alert("Murid ini tidak memiliki data grup di membershipnya! Pastikan grup sudah di-set.");
        return;
     }

     // Cari anggota yang satu grup (semua anggota, termasuk si pengumpul)
     const groupMembers = students
        .filter(s => s.group_name === leaderMembership.group_name)
        .map(m => ({ ...m, selected: true }));

     if (groupMembers.length === 0) {
        alert("Grup ini hanya berisi 1 orang, tidak ada anggota lain untuk diberi nilai.");
        return;
     }

     setBulkGradeData({ sub, members: groupMembers });
     setIsBulkGradeModalOpen(true);
  };

  const handleApplyBulkGrade = async () => {
     if (!bulkGradeData) return;
     const { sub, members } = bulkGradeData;
     const selectedMembers = members.filter(m => m.selected);

     if (selectedMembers.length === 0) {
        alert("Satu pun anggota tidak dipilih!");
        return;
     }

     setIsLoading(true);
     try {
        const gradeNum = sub.grade || 0;
        const criteria = sub.criteria_scores;

        // 1. Ambil data submission yang sudah ada untuk member terpilih pada curriculum ini
        const targetProfileIds = selectedMembers.map(m => m.profile_id);
        const { data: existingSubs } = await supabase
           .from('v2_submissions')
           .select('id, profile_id')
           .eq('curriculum_id', sub.curriculum_id)
           .in('profile_id', targetProfileIds);

        const existingMap = new Map(existingSubs?.map(s => [s.profile_id, s.id]));

        // 2. Pisahkan mana yang harus di-update (punya ID) dan mana yang insert baru
        const finalPayloads = selectedMembers.map(m => {
           const isOriginalUploader = m.profile_id === sub.profile_id;
           const payload: any = {
              curriculum_id: sub.curriculum_id,
              profile_id: m.profile_id,
              workspace_id: resolvedParams.id,
              grade: gradeNum,
              criteria_scores: criteria,
              status: 'completed',
              mentor_feedback: isOriginalUploader ? sub.mentor_feedback : `[GROUP SYNC] Nilai kelompok disinkronkan dari hasil evaluasi ${sub.v2_profiles?.full_name || 'Ketua Tim'}!`,
              is_cloned: !isOriginalUploader // Tandai sebagai clone jika bukan pengumpul asli
           };
           
           // Jika sudah ada, sertakan ID agar disinkronkan (update)
           if (existingMap.has(m.profile_id)) {
              payload.id = existingMap.get(m.profile_id);
           }
           
           return payload;
        });

        // 3. Eksekusi pemisahan (Update vs Insert) untuk menghindari error PK Null
        const toUpdate = finalPayloads.filter(p => p.id);
        const toInsert = finalPayloads.filter(p => !p.id);

        if (toUpdate.length > 0) {
           const { error: updErr } = await supabase.from('v2_submissions').upsert(toUpdate);
           if (updErr) throw updErr;
        }

        if (toInsert.length > 0) {
           const { error: insErr } = await supabase.from('v2_submissions').insert(toInsert);
           if (insErr) throw insErr;
        }

        await fetchAllSubmissions(); // Await global matrix refresh
        if (viewingCurriculum) {
           await handleViewSubmissions(viewingCurriculum); // Refresh the current modal view
        }

        alert(`Berhasil sinkronisasi nilai ke ${selectedMembers.length} anggota! 🛸`);
        setIsBulkGradeModalOpen(false);
     } catch (err: any) {
        alert("Gagal sinkronisasi nilai kelompok: " + err.message);
     } finally {
        setIsLoading(false);
     }
  };

  const toggleBulkGradeMember = (profileId: string) => {
     if (!bulkGradeData) return;
     setBulkGradeData({
        ...bulkGradeData,
        members: bulkGradeData.members.map(m => m.profile_id === profileId ? { ...m, selected: !m.selected } : m)
     });
  };

  const handleForceGroupSync = async (subId: string, groupId: string | null) => {
      if (!groupId) { alert("Pilih stempel grup terlebih dahulu untuk melakukan override!"); return; }
      setIsLoading(true);
      try {
          await supabase.from('v2_submissions').update({ assignment_group_id: groupId }).eq('id', subId);
          
          const { data: members } = await supabase.from('v2_assignment_group_members').select('profile_id').eq('group_id', groupId);
          if (members && members.length > 0) {
              const currentSub = submissionsData.find(s => s.id === subId);
              const membersToClone = members.map(m => m.profile_id).filter(id => id !== currentSub?.profile_id);
              
              if (membersToClone.length > 0) {
                  const clonePayload = membersToClone.map((id) => ({
                      curriculum_id: currentSub.curriculum_id,
                      profile_id: id,
                      workspace_id: resolvedParams.id,
                      file_link: currentSub.file_link,
                      status: currentSub.status,
                      is_cloned: true,
                      cloned_from_submission_id: currentSub.id,
                      submitted_by_profile_id: currentSub.profile_id,
                      assignment_group_id: groupId,
                      grade: currentSub.grade || 0,
                      mentor_feedback: `[AUTO-SYNC] Didistribusikan via Admin Override dari jawaban Ketua Tim!`
                  }));
                  
                  await supabase.from('v2_submissions').insert(clonePayload);
                  alert(`Berhasil melakukan Force-Clone ke ${membersToClone.length} anggota! 🚀`);
                  handleViewSubmissions(viewingCurriculum); 
              } else {
                  alert("Grup ini hanya berisi anak tersebut, tidak ada yang perlu di-clone.");
              }
          }
      } catch (err: any) {
          alert("Gagal melakukan sync: " + err.message);
      } finally {
          setIsLoading(false);
      }
  };

  const handleSavePlusPoints = async (studId: string, category: string, points: string) => {
     const pNum = parseInt(points) || 0;
     const student = students.find(s => s.id === studId);
     const newPlus = { ...(student?.plus_points || {}), [category]: pNum };
     
     try {
        const { error } = await supabase
          .from('v2_memberships')
          .update({ plus_points: newPlus })
          .eq('id', studId);
        if (error) throw error;
        setStudents(prev => prev.map(s => s.id === studId ? { ...s, plus_points: newPlus } : s));
     } catch (err) {
        console.error("Plus points save failed", err);
     }
  };

  const handlePreviewSub = async (sub: any) => {
     window.open(sub.file_link, '_blank');
     if (sub.status === 'pending') {
        try {
           const { error } = await supabase
             .from('v2_submissions')
             .update({ status: 'in_review' })
             .eq('id', sub.id);
           if (error) throw error;
           setSubmissionsData(prev => prev.map(s => s.id === sub.id ? { ...s, status: 'in_review' } : s));
           fetchAllSubmissions();
        } catch (err) {
           console.error("Failed to update status to in_review", err);
        }
     }
  };

  const saveAllGrades = async () => {
      setIsLoading(true);
      try {
         const updates = students.map(s => ({
            id: s.id,
            grades: s.grades
         }));

        //Bulk update grades via promise.all or a custom RPC
         await Promise.all(updates.map(u => 
            supabase.from('v2_memberships').update({ grades: u.grades }).eq('id', u.id)
         ));

         alert("All grades successfully synced to database! 🛸✨");
      } catch (err: any) {
         alert("Failed to sync grades: " + err.message);
      } finally {
         setIsLoading(false);
      }
   };

  const saveAttendance = async () => {
      setIsLoading(true);
      try {
         const updates = students.map(s => ({
            id: s.id,
            attendance: s.attendance
         }));

         await Promise.all(updates.map(u => 
            supabase.from('v2_memberships').update({ attendance: u.attendance }).eq('id', u.id)
         ));

         alert("Attendance records synced! ✅");
      } catch (err: any) {
         alert("Failed to sync attendance: " + err.message);
      } finally {
         setIsLoading(false);
      }
   };

  const handleDeleteLms = async (id: string) => {
    if (!confirm("Hapus materi/tugas ini?")) return;
    try {
       const { error } = await supabase.from('v2_curriculums').delete().eq('id', id);
       if (error) throw error;
       if (selectedLesson?.id === id) setSelectedLesson(null);
       fetchCurriculum();
    } catch (err: any) {
       alert(err.message);
    }
  };

  const fetchBatchDetail = async () => {
    const { data } = await supabase.from('v2_workspaces').select('id, name, description, type, start_date, end_date, max_members, status, settings, schedules, created_at').eq('id', resolvedParams.id).single();
    if (data) setBatch(data);
  };

  const fetchCustomGroups = async () => {
      try {
          const { data, error } = await supabase.from('v2_assignment_groups').select('*, v2_assignment_group_members(profile_id)').eq('workspace_id', resolvedParams.id);
          if (!error && data) setCustomGroups(data);
      } catch (err) {
          console.error("fetchCustomGroups failed", err);
      }
  };

   const handleMatrixEdit = async (type: string, id: string | null, curriculumId: string, profileId: string, value: string) => {
      const valNum = parseInt(value) || 0;
      try {
         if (type === 'post_test') {
            if (id) {
               await supabase.from('v2_quiz_results').update({ score: valNum }).eq('id', id);
            } else {
               await supabase.from('v2_quiz_results').insert({
                  curriculum_id: curriculumId,
                  profile_id: profileId,
                  workspace_id: resolvedParams.id,
                  score: valNum
               });
            }
         } else {
            if (id) {
                await supabase.from('v2_submissions').update({ grade: valNum, status: 'completed' }).eq('id', id);
            } else {
                await supabase.from('v2_submissions').insert({
                    curriculum_id: curriculumId,
                    profile_id: profileId,
                    workspace_id: resolvedParams.id,
                    grade: valNum,
                    status: 'completed'
                });
            }
         }
         fetchAllSubmissions();
      } catch (err) {
         console.error("Matrix edit failed", err);
      }
   };

  const handleUpdateMemberInfo = async (id: string, field: string, value: string) => {
    try {
      const { error } = await supabase
        .from('v2_memberships')
        .update({ [field]: value })
        .eq('id', id);
      if (error) throw error;
      
      setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    } catch (err) {
      console.error("Update member failed", err);
    }
  };

  const handleAutoGenerateCredentials = () => {
    setIsCredentialModalOpen(true);
  };

  const executeAutoGenerateCredentials = async () => {
    setIsCredentialModalOpen(false);
    setIsLoading(true);
    try {
      // Robust batch code extraction
      let batchNo = 'XX';
      const batchName = batch?.name || '';
      
      // Try to find numbers after 'Batch' or '#' or just any digit
      const match = batchName.match(/Batch\s*#?(\d+)/i) || batchName.match(/#(\d+)/) || batchName.match(/(\d+)/);
      if (match) {
        batchNo = match[1];
      } else {
        // Fallback: Use the first two characters of the workspace name if no number found
        batchNo = batchName.slice(0, 2).toUpperCase();
      }
      
      const batchCode = `RS-${batchNo}`;
      const programCode = 'SMS-MB'; 
      
      const updatePromises = students.map((s) => {
        const randomNo = Math.floor(1000 + Math.random() * 9000);
        const cred = `${batchCode}/${programCode}/${randomNo}`;
        return supabase.from('v2_memberships').update({ credential_no: cred }).eq('id', s.id).then(res => {
          if (res.error) throw res.error;
          return res;
        });
      });
      
      await Promise.all(updatePromises);
      await fetchStudents();
      setIsCredentialSuccess(true);
    } catch (err: any) {
      console.error("Generate failed:", err);
      alert("Gagal: " + (err.message || "Pastikan kamu sudah menjalankan SQL di Supabase dashboard."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    // 1. Prepare Period
    const startDate = batch?.start_date ? new Date(batch.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' }) : '';
    const endDate = batch?.end_date ? new Date(batch.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    const period = (startDate && endDate) ? `${startDate} - ${endDate}` : (batch?.name || 'Batch Periode');

    // 2. Headers
    const headers = ["Nama", "Periode", "No Credentials", "Avg Post Test", "Avg Assignment", "Avg Group Challenge", "Keaktifan (P+A)", "Final Score", "Grade", "Status"];
    
    // 3. Aggregate Data (Using Centralized Analytics)
    const rows = analyticsData.map(data => {
        const getGrading = (avg: number) => {
            const s = Math.round(avg);
            if (s >= 90) return { l: 'A+', k: 'Superstar (Outstanding)' };
            if (s >= 85) return { l: 'A', k: 'Very Good' };
            if (s >= 80) return { l: 'B+', k: 'Good' };
            if (s >= 70) return { l: 'B', k: 'Average' };
            if (s >= 60) return { l: 'C', k: 'Below Average' };
            return { l: 'D', k: 'Very Poor' };
        };
        const g = getGrading(data.avg);

        return [
            `"${data.name || 'Anonymous'}"`,
            `"${period}"`,
            `"${data.mem.credential_no || '-'}"`,
            data.avgPT.toFixed(1),
            data.avgAssign.toFixed(1),
            data.avgGC.toFixed(1),
            data.finalKeaktifan.toFixed(1),
            data.avg.toFixed(1),
            g.l,
            g.k
        ];
    });

    // 4. Combine
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    
    // 5. Download with BOM for Excel compatibility
    const blob = new Blob(["\ufeff", csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Grading_Matrix_${batch?.name || 'Batch'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchAnnouncements = async () => {
      try {
          const { data, error } = await supabase
            .from('v2_announcements')
            .select('*')
            .eq('workspace_id', resolvedParams.id)
            .order('created_at', { ascending: false });
          if (!error && data) setAnnouncements(data);
      } catch (err) {
          console.error("fetchAnnouncements failed", err);
      }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
          // 1. Compress Image (Client Side) - Max 1200px, 70% quality
          const compressedBlob = await compressImage(file, 1200, 0.7);
          
          // 2. Prepare Path
          const fileExt = 'jpg'; // We compress to jpeg
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${resolvedParams.id}/${fileName}`;

          // 3. Upload to Supabase Storage (Bucket: 'lms')
          const { data, error } = await supabase.storage
              .from('lms')
              .upload(filePath, compressedBlob, {
                  contentType: 'image/jpeg',
                  upsert: true
              });

          if (error) throw error;

          // 4. Get Public URL
          const { data: { publicUrl } } = supabase.storage
              .from('lms')
              .getPublicUrl(filePath);

          setAnnForm({ ...annForm, image_url: publicUrl });
          alert("✓ Foto berhasil diunggah dan dikompres!");
      } catch (err: any) {
          console.error("Upload failed", err);
          alert("Gagal mengunggah foto: " + err.message);
      } finally {
          setIsUploading(false);
      }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      if ((annForm.gallery_images?.length || 0) + files.length > 4) {
          alert("Maksimal 4 gambar gallery."); return;
      }

      setIsGalleryUploading(true);
      try {
          const uploadedUrls: string[] = [];
          for (const file of Array.from(files)) {
              const compressedBlob = await compressImage(file, 1000, 0.7);
              const fileName = `gallery-${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;
              const filePath = `${resolvedParams.id}/${fileName}`;
              const { error } = await supabase.storage.from('lms').upload(filePath, compressedBlob, { contentType: 'image/jpeg', upsert: true });
              if (error) throw error;
              const { data: { publicUrl } } = supabase.storage.from('lms').getPublicUrl(filePath);
              uploadedUrls.push(publicUrl);
          }
          setAnnForm(prev => ({ ...prev, gallery_images: [...(prev.gallery_images || []), ...uploadedUrls] }));
      } catch (err: any) {
          alert("Gagal upload gallery: " + err.message);
      } finally {
          setIsGalleryUploading(false);
      }
  };

  const handleSaveAnnouncement = async () => {
      if (!annForm.title) { alert("Judul wajib diisi!"); return; }
      setIsLoading(true);
      try {
          const payload = { 
              ...annForm, 
              workspace_id: resolvedParams.id,
              creator_id: currentUser?.id 
          };

          if (editingAnnId) {
              const { error } = await supabase.from('v2_announcements').update(payload).eq('id', editingAnnId);
              if (error) throw error;
          } else {
              const { error } = await supabase.from('v2_announcements').insert([payload]);
              if (error) throw error;
          }
          
          setIsAnnModalOpen(false);
          setAnnForm({ category: 'Umum', title: '', summary: '', content: '', image_url: '', gallery_images: [], is_pinned: false });
          setEditingAnnId(null);
          fetchAnnouncements();
          alert("Pemberitahuan berhasil disimpan! \u2728");
      } catch (err: any) {
          alert("Gagal simpan: " + err.message);
      } finally {
          setIsLoading(false);
      }
  };

  const handleDeleteAnnouncement = async (id: string) => {
      if (!confirm("Hapus pengumuman ini?")) return;
      setIsLoading(true);
      try {
          const { error } = await supabase.from('v2_announcements').delete().eq('id', id);
          if (error) throw error;
          fetchAnnouncements();
      } catch (err: any) {
          alert(err.message);
      } finally {
          setIsLoading(false);
      }
  };

  const handleSaveCustomGroup = async () => {
      if (!customGroupForm.name) { alert("Nama grup wajib diisi!"); return; }
      setIsLoading(true);
      try {
          // 1. Save Group Header
          const { data: grpData, error: grpErr } = await supabase.from('v2_assignment_groups').insert([{
              workspace_id: resolvedParams.id,
              name: customGroupForm.name,
              description: customGroupForm.description
          }]).select().single();
          if (grpErr) throw grpErr;

          // 2. Save Members
          if (customGroupForm.members.length > 0) {
              const membersPayload = customGroupForm.members.map(profile_id => ({
                  group_id: grpData.id,
                  profile_id: profile_id
              }));
              const { error: memErr } = await supabase.from('v2_assignment_group_members').insert(membersPayload);
              if (memErr) throw memErr;
          }

          alert("Custom Group Assigned Successfully! 🎉");
          setIsCustomGroupModalOpen(false);
          setCustomGroupForm({ name: '', description: '', members: [] });
          await fetchCustomGroups();
      } catch (err: any) {
          alert("Failed saving custom group: " + err.message);
      } finally {
          setIsLoading(false);
      }
  };

  const fetchStudents = async () => {
    try {
      const { data: basicMem, error: basicErr } = await supabase
        .from('v2_memberships')
        .select('id, profile_id, group_name, is_leader, attendance, plus_points, credential_no, certificate_url')
        .eq('workspace_id', resolvedParams.id);
      
      if (basicErr || !basicMem) {
        setStudents([]);
        return;
      }

      const rawProfileIds = [...new Set(basicMem.map(m => m.profile_id).filter(Boolean))];
      
      if (rawProfileIds.length > 0) {
        const { data: nameData } = await supabase
          .from('v2_profiles')
          .select('id, full_name, username, updated_at')
          .in('id', rawProfileIds);

        if (nameData) {
          const nameMap = new Map(nameData.map(p => [p.id, p]));
          setStudents(basicMem.map(m => ({
            ...m,
            v2_profiles: nameMap.get(m.profile_id) || { full_name: 'Unknown Student', username: 'unknown' }
          })));
        }

        const BATCH_SIZE = 4;
        for (let i = 0; i < rawProfileIds.length; i += BATCH_SIZE) {
          const batchIds = rawProfileIds.slice(i, i + BATCH_SIZE);
          const { data: avatarBatch } = await supabase.from('v2_profiles').select('id, avatar_url').in('id', batchIds);
          if (avatarBatch) {
            setStudents(prev => {
              const avatarMap = new Map(avatarBatch.map(p => [p.id, p.avatar_url]));
              return prev.map(s => avatarMap.has(s.profile_id) ? { ...s, v2_profiles: { ...s.v2_profiles, avatar_url: avatarMap.get(s.profile_id) } } : s);
            });
          }
        }
      }
    } catch (err: any) {
      console.error("❌ fetchStudents error:", err);
    } finally {
      setIsLoading(false);
    }
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
        //Auto-select first material
         const firstMaterial = data.find((c: any) => c.type === 'material') || data[0];
         setSelectedLesson(firstMaterial);
      }
    }
  };

  if (!isLoading && !batch) return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-20 text-center space-y-6">
       <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center shadow-inner">
          <EyeOff size={32}/>
       </div>
       <div>
          <h2 className="text-2xl font-black text-[#0F172A]">Akses Terbatas</h2>
          <p className="text-slate-400 font-medium max-w-sm mx-auto mt-2">Anda tidak memiliki izin untuk mengakses Batch ini. Silakan hubungi mentor jika ini adalah kesalahan.</p>
       </div>
       <Button onClick={() => window.location.href = '/ruang-sosmed/login'} className="bg-slate-900 text-white rounded-2xl h-14 px-8 font-bold">Back to Login</Button>
    </div>
  );

  const isAdmin = currentUser?.role === 'admin' || currentUser?.email?.includes('arunika');
  const isAdminView = isAdmin && !isPreviewMode;

  const tasksForAnalytics = curriculum.filter(t => t.type !== 'material');
  const analyticsData = students.map(mem => {
     const studentSubmissions = allSubmissions.filter(s => s.profile_id === mem.v2_profiles?.id);
     let totalPT = 0, countPT = 0;
     let totalAssign = 0, countAssign = 0;
     let totalGC = 0, countGC = 0;
     
     tasksForAnalytics.forEach(t => {
        const res = studentSubmissions.find(s => s.curriculum_id === t.id);
        const score = res ? (res.score || res.grade || 0) : 0;
        if (t.type === 'post_test') { totalPT += score; countPT++; }
        else if (t.type === 'individual_assignment' || t.type === 'assignment') { totalAssign += score; countAssign++; }
        else if (t.type === 'challenge') { totalGC += score; countGC++; }
     });

     const avgPT = totalPT / (tasksForAnalytics.filter(tr => tr.type === 'post_test').length || 1);
     const avgAssign = totalAssign / (tasksForAnalytics.filter(tr => tr.type === 'individual_assignment' || tr.type === 'assignment').length || 1);
     const avgGC = totalGC / (tasksForAnalytics.filter(tr => tr.type === 'challenge').length || 1);
     
     const attendList = Object.values(mem.attendance || {});
     const attendCount = attendList.filter(v => v === 'P').length;
     const attendScore = (attendCount / (batch?.schedules?.length || 1)) * 100;
     const plusPoints = (mem.plus_points || {}) as any;
     const plusTotal = Object.values(plusPoints).reduce((a: any, b: any) => (parseInt(a) || 0) + (parseInt(b) || 0), 0) as number;
     const participationScore = Object.keys(plusPoints).length > 0 ? Math.round(plusTotal / 4) : 0;
     const finalKeaktifan = (attendScore * 0.5) + (participationScore * 0.5);

     const finalAvg = (avgPT + avgAssign + avgGC + finalKeaktifan) / 4;
     const getGrading = (avg: number) => {
        const s = Math.round(avg);
        if (s >= 90) return { label: 'A+', desc: 'Superstar (Outstanding)' };
        if (s >= 85) return { label: 'A', desc: 'Very Good' };
        if (s >= 80) return { label: 'B+', desc: 'Good' };
        if (s >= 70) return { label: 'B', desc: 'Average' };
        if (s >= 60) return { label: 'C', desc: 'Below Average' };
        return { label: 'D', desc: 'Very Poor' };
     };
     const gInfo = getGrading(finalAvg);

     return { 
        mem,
        name: mem.v2_profiles?.full_name, 
        avatar: mem.v2_profiles?.avatar_url, 
        avg: finalAvg,
        grade: gInfo.label,
        gradeDesc: gInfo.desc,
        avgPT,
        avgAssign,
        avgGC,
        finalKeaktifan,
        attendance: attendCount,
        p_diskusi: parseInt(plusPoints['Diskusi']) || 0,
        p_aktif: parseInt(plusPoints['Aktif Grup']) || 0,
        p_presentation: parseInt(plusPoints['Presentation']) || 0,
        group: mem.group_name || 'Unassigned' 
     };
  });

  const sortedStudents = [...analyticsData].sort((a, b) => b.avg - a.avg || b.attendance - a.attendance);
  const star = sortedStudents[0];

  const TABS = [
    ...(isAdminView ? [{ id: "students", label: "Student List & Groups", icon: <Users size={16}/> }] : []),
    { id: "learning", label: isAdminView ? "Class Material (LMS)" : "Learning Journey", icon: <PlayCircle size={16}/> },
    { id: "board", label: "Community Board", icon: <Layout size={16}/> },
    { id: "assignments", label: isAdminView ? "Manage Tasks" : "My Assignments", icon: <ClipboardList size={16}/> },
    { id: "grades", label: isAdminView ? "Grading Matrix" : "My Results", icon: <BarChart4 size={16}/> },
    { id: "attendance", label: isAdminView ? "Attendance History" : "My Attendance", icon: <CheckCircle2 size={16}/> }
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
            className="bg-emerald-500 text-white p-4 rounded-3xl flex items-center justify-center gap-3 font-bold text-xs shadow-lg shadow-emerald-500/20"
          >
            <Eye size={16}/> Simulasi tampilan murid (Preview mode)
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 py-10 px-10 bg-gradient-to-r from-[#0ea5e9] to-[#1e3a8a] rounded-[44px] text-white overflow-hidden relative shadow-2xl shadow-blue-900/20">
        {/* Glow */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-white/10 blur-[100px] rounded-full"/>
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-sky-300/20 blur-[100px] rounded-full"/>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            {isAdminView && (
              <Link href="/ruang-sosmed/batch" className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10 group">
                <ChevronRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform"/>
              </Link>
            )}
            <div className={`px-4 py-1.5 rounded-full text-white text-[9px] font-black ${isAdminView ? 'bg-blue-600' : 'bg-emerald-500'}`}>
              {isAdminView ? 'Cohort Management' : 'Student Portal'}
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">{batch?.name || "Loading Batch..."}</h1>
            {!isAdminView && <p className="text-emerald-400 font-bold text-xs">Simulated view as {currentUser?.full_name}!</p>}
            <div className="flex flex-wrap gap-6 items-center opacity-60">
              <p className="flex items-center gap-2 text-sm font-bold"><Zap size={14} className="text-blue-400"/> {batch?.status === 'active' ? 'Ongoing Batch' : 'Batch Completed'}</p>
              <div className="h-1 w-1 rounded-full bg-white/30"/>
              <p className="flex items-center gap-2 text-sm font-bold"><Users size={14} className="text-blue-400"/> {students.length}/{batch?.max_members} Students</p>
              <div className="h-1 w-1 rounded-full bg-white/30"/>
              <p className="flex items-center gap-2 text-sm font-bold"><Clock size={14} className="text-blue-400"/> {batch?.description || "No description provided."}</p>
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
                   <UserPlus size={18}/> Add Student
                 </Button>
               )}
               <Button 
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`h-14 px-8 rounded-2xl font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-3 ${isPreviewMode ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
               >
                 {isPreviewMode ? <EyeOff size={18}/> : <Eye size={18}/>}
                 {isPreviewMode ? 'Exit Preview' : 'Student Preview'}
               </Button>
               {isAdminView && (
                  <Button 
                    onClick={handleShare}
                    className={`h-14 px-8 rounded-2xl font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-3 ${isCopied ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    {isCopied ? <Check size={18}/> : <Share2 size={18}/>}
                    {isCopied ? 'Link Copied' : 'Share Batch'}
                  </Button>
               )}
             </>
           ) : (
             <Button className="h-14 px-8 rounded-2xl bg-white/10 text-white font-bold text-sm border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-3">
               <MessageSquare size={18}/> Contact Mentor
             </Button>
           )}
        </div>
      </div>

      {/* Internal Navigation Tabs - Centered */}
      <div className="flex justify-center mb-6">
        <div className="flex gap-4 p-2 bg-white/80 backdrop-blur-xl border border-slate-100 rounded-[32px] w-fit shadow-xl shadow-slate-200/50">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id);
                localStorage.setItem(`batch_tab_${resolvedParams.id}`, t.id);
              }}
              className={`px-8 py-4 rounded-2xl flex items-center gap-3 text-xs font-black transition-all ${activeTab === t.id ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 border border-blue-100" : "text-slate-400 hover:text-slate-900"}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
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
                  <div className="p-10 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">Active Students</h3>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                         <Search size={16} className="text-slate-400"/>
                         <input 
                           value={studentSearch}
                           onChange={(e) => setStudentSearch(e.target.value)}
                           placeholder="Cari nama murid..." 
                           className="bg-transparent border-none focus:outline-none text-sm font-bold w-48"
                         />
                       </div>
                       <Button 
                         onClick={handleAutoGenerateCredentials}
                         className="h-12 px-6 rounded-2xl bg-amber-500 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-amber-200 hover:scale-[1.02] transition-all flex items-center gap-2 border-none"
                       >
                         <Award size={16}/> Generate IDs
                       </Button>
                       <Button 
                         onClick={() => setIsRegModalOpen(true)}
                         className="h-12 px-6 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:scale-[1.02] transition-all flex items-center gap-2 border-none"
                       >
                         <Plus size={16}/> Add Student
                       </Button>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/50">
                          <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">FullName</th>
                          <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Team/Group</th>
                          <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Credential ID</th>
                          <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Cert Link</th>
                          <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students
                          .filter(s => s.v2_profiles?.full_name?.toLowerCase().includes(studentSearch.toLowerCase()))
                          .map((mem) => (
                           <tr 
                             key={mem.id} 
                             onClick={() => { setSelectedStudentDetail(mem); setIsDetailModalOpen(true); }}
                             className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer group/row"
                           >
                             <td className="px-10 py-6">
                               <div className="flex items-center gap-4">
                                 <div className="relative flex-shrink-0">
                                   <div className="w-12 h-12 transition-all group-hover/row:scale-110 flex items-center justify-center">
                                      {mem.v2_profiles?.avatar_url ? (
                                         <img src={mem.v2_profiles.avatar_url} className="w-full h-full object-contain" alt=""/>
                                      ) : (
                                         <User size={16} className="text-slate-300"/>
                                      )}
                                    </div>
                                    {/* Online Indicator Dot - Outside overflow container to prevent clipping */}
                                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm transition-colors duration-500 z-10 ${onlineUsers.has(mem.profile_id) ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-300'}`}/>
                                  </div>
                                 <div className="group-hover/row:translate-x-1 transition-transform">
                                   <p className="text-sm font-black text-[#0F172A] group-hover/row:text-blue-600 transition-colors">{mem.v2_profiles?.full_name}</p>
                                   <div className="space-y-0.5">
                                      <p className="text-[10px] font-bold text-slate-400">Student ID: {mem.id.slice(0, 8)}</p>
                                      <p className={`text-[9px] font-black uppercase tracking-tight flex items-center gap-1.5 ${onlineUsers.has(mem.profile_id) ? 'text-emerald-500' : 'text-slate-300'}`}>
                                         {onlineUsers.has(mem.profile_id) ? (
                                            <><span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span></span> LIVE NOW</>
                                         ) : (
                                            mem.v2_profiles?.updated_at ? `Last active: ${new Date(mem.v2_profiles.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Last active: Unknown'
                                         )}
                                      </p>
                                   </div>
                                 </div>
                               </div>
                             </td>
                             <td className="px-10 py-6">
                               <div className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black border border-blue-100 w-fit">
                                 {mem.group_name || "Unassigned"}
                               </div>
                             </td>
                             <td className="px-10 py-6">
                                <input 
                                   type="text"
                                   placeholder="Ex: RS-16/SMS-MB/8897"
                                   defaultValue={mem.credential_no}
                                   onBlur={(e) => handleUpdateMemberInfo(mem.id, 'credential_no', e.target.value)}
                                   onClick={(e) => e.stopPropagation()}
                                   className="w-44 h-9 bg-slate-50 border-none text-[10px] font-bold text-blue-600 rounded-lg focus:bg-white focus:ring-1 ring-blue-200"
                                />
                             </td>
                             <td className="px-10 py-6">
                                <div className="flex items-center gap-2">
                                   <input 
                                      type="text"
                                      placeholder="Paste link here..."
                                      defaultValue={mem.certificate_url || mem.cert_url}
                                      onBlur={(e) => handleUpdateMemberInfo(mem.id, 'certificate_url', e.target.value)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-44 h-9 bg-slate-50 border-none text-[10px] font-bold text-slate-400 rounded-lg focus:bg-white focus:text-blue-600 focus:ring-1 ring-blue-200"
                                   />
                                   {(mem.certificate_url || mem.cert_url) && (
                                      <a href={mem.certificate_url || mem.cert_url} target="_blank" rel="noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                                         <ExternalLink size={14}/>
                                      </a>
                                   )}
                                </div>
                             </td>
                             <td className="px-10 py-6">
                                 <div className="relative">
                                   <button 
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       if (openActionMenuId === mem.id) {
                                         setOpenActionMenuId(null);
                                       } else {
                                         const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                                         setMenuPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
                                         setOpenActionMenuId(mem.id);
                                       }
                                     }}
                                     className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all"
                                   >
                                     <MoreVertical size={18}/>
                                   </button>
                                 </div>
                               </td>
                           </tr>
                        ))}
                      </tbody>
                    </table>
                    {students.length === 0 && <div className="p-20 text-center opacity-40"><Users size={44} className="mx-auto mb-4"/><p className="font-bold text-xs">Belum ada murid di batch ini.</p></div>}
                  </div>
                </Card>

                {/* Group Management Widget */}
                <div className="xl:col-span-4 space-y-8">
                    <Card className="p-10 border-none shadow-xl shadow-slate-200/50 bg-white rounded-[44px]">
                       <div className="space-y-8">
                          <div className="flex items-center justify-between">
                             <div className="space-y-1">
                                <h3 className="text-xl font-black text-[#0F172A]">Batch Ecosystem</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time Class Insights</p>
                             </div>
                             <Award className="text-amber-500" size={24}/>
                          </div>

                          {/* 1. STAR STUDENT OF THE WEEK */}
                          {(() => {
                             if (!star || star.avg === 0) return null;

                             return (
                                <div className="p-6 rounded-[32px] bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 relative overflow-hidden group">
                                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                                      <Star size={60} fill="currentColor" className="text-amber-500"/>
                                   </div>
                                   <div className="relative z-10 flex items-center gap-4">
                                      <div className="w-16 h-16 flex items-center justify-center relative">
                                         {star.avatar ? (
                                            <img src={star.avatar} className="w-full h-full object-contain drop-shadow-sm transition-transform group-hover:scale-110 duration-500"/>
                                         ) : (
                                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-black text-amber-600 border-2 border-amber-200 shadow-sm">{star.name?.charAt(0)}</div>
                                         )}
                                      </div>
                                      <div>
                                         <div className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest w-fit mb-1 shadow-sm">Star Student</div>
                                         <h4 className="text-sm font-black text-slate-800">{star.name}</h4>
                                         <p className="text-[10px] font-bold text-amber-600">{star.avg.toFixed(1)} Avg Score • {star.attendance} Presence</p>
                                      </div>
                                   </div>
                                </div>
                             );
                          })()}

                          {/* 2. ACTIVE GROUPS PROGRESS */}
                          <div className="space-y-4">
                             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Team Performances</h4>
                             <div className="grid grid-cols-1 gap-3">
                                {(() => {
                                   const groups = Array.from(new Set(students.map(s => s.group_name).filter(g => g && g !== 'Unassigned')));
                                   return groups.slice(0, 3).map(gName => {
                                      const members = students.filter(s => s.group_name === gName);
                                      const leader = members.find(m => m.is_leader);
                                      const avgAttendance = members.reduce((acc, m) => acc + Object.values(m.attendance || {}).filter(v => v === 'P').length, 0)/members.length;
                                      
                                      return (
                                         <div key={gName} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all">
                                            <div className="flex items-center gap-3">
                                               <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-blue-600 shadow-sm">
                                                  <Users size={14}/>
                                               </div>
                                               <div>
                                                  <p className="text-xs font-black text-slate-800">{gName}</p>
                                                  <p className="text-[9px] font-bold text-slate-400">Lead by {leader?.v2_profiles?.full_name || 'No Leader'}</p>
                                               </div>
                                            </div>
                                            <div className="text-right">
                                               <p className="text-[10px] font-black text-blue-600">{avgAttendance.toFixed(1)} Abs</p>
                                            </div>
                                         </div>
                                      );
                                   });
                                })()}
                             </div>
                          </div>

                          {/* 3. CRITICAL ATTENTION (Risk List) */}
                          <div className="space-y-4 pt-2">
                             <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Critical Attention</h4>
                             <div className="space-y-2">
                                {(() => {
                                   const risky = students.map(mem => {
                                      const absents = Object.values(mem.attendance || {}).filter(v => v === 'A' || v === 'S').length;
                                      const submissions = allSubmissions.filter(s => s.profile_id === mem.v2_profiles?.id).length;
                                      const totalTasks = curriculum.filter(t => t.type !== 'material').length;
                                      const pending = Math.max(0, totalTasks - submissions);
                                      const riskScore = (absents * 2) + pending;
                                      return { mem, absents, pending, score: riskScore, submissions };
                                   }).filter(r => r.score > 2 && (r.submissions > 0 || r.absents > 0)).sort((a, b) => b.score - a.score).slice(0, 2);

                                   if (risky.length === 0) return (
                                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                                         <CheckCircle2 size={14} className="text-emerald-500"/>
                                         <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">No critical risks found</p>
                                      </div>
                                   );

                                   return risky.map(r => (
                                      <div key={r.mem.id} className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-between">
                                         <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white border border-rose-100 flex items-center justify-center text-rose-500 font-black text-xs shadow-sm">
                                               {r.mem.v2_profiles?.full_name?.charAt(0)}
                                            </div>
                                            <div>
                                               <p className="text-xs font-black text-slate-800">{r.mem.v2_profiles?.full_name}</p>
                                               <p className="text-[9px] font-bold text-rose-400">{r.absents} Absents • {r.pending} Missing Tasks</p>
                                            </div>
                                         </div>
                                         <button className="p-2 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                                            <MessageSquare size={14}/>
                                         </button>
                                      </div>
                                   ));
                                })()}
                             </div>
                          </div>

                          <Button className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:scale-105 transition-all flex items-center justify-center gap-3 mt-4">
                             <Share2 size={16}/> Broadcast Batch Insight
                          </Button>
                       </div>
                    </Card>

                   <Card className="p-10 border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-[44px] relative overflow-hidden">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 blur-3xl rounded-full"/>
                      <div className="relative z-10 space-y-6">
                         <h3 className="text-xl font-black">Group Challenge</h3>
                         <p className="text-white/60 text-sm font-medium leading-relaxed">
                            Bagi 50 murid menjadi beberapa tim diskusi untuk mengerjakan Challenge Akhir selama 3 minggu.
                         </p>
                         <Button onClick={() => setIsGroupModalOpen(true)} className="w-full h-14 bg-white text-blue-700 font-bold rounded-2xl hover:scale-105 transition-all">
                            Manage Groups
                         </Button>
                      </div>
                   </Card>

                   <Card className="p-10 border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-[44px] relative overflow-hidden mt-8">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 blur-3xl rounded-full"/>
                      <div className="relative z-10 space-y-6">
                         <h3 className="text-xl font-black">Live Sessions</h3>
                         <p className="text-white/60 text-sm font-medium leading-relaxed">
                            Atur jadwal kelas tatap muka virtual (Zoom/Meet) untuk seluruh batch.
                         </p>
                         <Button onClick={() => setIsScheduleModalOpen(true)} className="w-full h-14 bg-white text-emerald-700 font-bold rounded-2xl hover:scale-105 transition-all">
                            Manage Schedules
                         </Button>
                      </div>
                   </Card>
                </div>
             </div>
          )}

          {activeTab === 'learning' && (
             <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* LESSON VIEWER (Left) */}
                <div className="xl:col-span-8 space-y-10">
                   {selectedLesson ? (
                      <div className="space-y-10">
                         {selectedLesson.type === 'material' ? (
                            <div className="aspect-video w-full rounded-[48px] bg-slate-900 overflow-hidden shadow-2xl relative group">
                               {selectedLesson.video_url ? (
                                  <iframe 
                                    src={getYouTubeEmbedUrl(selectedLesson.video_url)}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                 />
                               ) : (
                                   <div className="w-full h-full flex flex-col items-center justify-center text-white relative">
                                      {/* Waiting Screen/Countdown */}
                                      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/40 to-slate-900 z-0 animate-pulse"/>
                                      <div className="relative z-10 text-center space-y-8 p-12">
                                         <div className="w-24 h-24 bg-white/10 rounded-[32px] flex items-center justify-center mx-auto mb-10 border border-white/20 backdrop-blur-xl animate-bounce">
                                            <Play size={40} fill="white" className="ml-2"/>
                                         </div>
                                         <div className="space-y-4">
                                            <h3 className="text-4xl font-black tracking-tighter">Live kelas akan dimulai dalam</h3>
                                            {selectedLesson.due_date ? (
                                               <Countdown targetDate={selectedLesson.due_date}/>
                                            ) : (
                                               <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Waktu tayang belum dijadwalkan oleh mentor.</p>
                                            )}
                                         </div>
                                         <div className="pt-10">
                                            <div className="px-8 py-4 bg-white/5 rounded-2xl border border-white/10 inline-flex items-center gap-3">
                                               <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping"/>
                                               <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Waiting for Stream Link...</p>
                                            </div>
                                         </div>
                                      </div>
                                   </div>
                                )}
                             </div>
                         ) : (
                            <div className="p-20 rounded-[48px] bg-slate-900 text-white text-center space-y-6">
                               <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto">
                                  {selectedLesson.type === 'post_test' ? <FileText size={40}/> : <Target size={40}/>}
                               </div>
                               <div>
                                  <h3 className="text-2xl font-black">Interactive {selectedLesson.type === 'post_test' ? 'Post Test' : 'Task'}</h3>
                                  <p className="text-white/40 text-sm mt-2">Siswa akan mengerjakan bagian ini melalui portal pengerjaan tugas.</p>
                               </div>
                            </div>
                         )}

                         {/* Lesson Detail */}
                         <div className="px-6 space-y-6">
                            <div className="space-y-2">
                               <p className="text-blue-600 font-black text-xs uppercase tracking-widest">{selectedLesson.module_name || "Intro Material"}</p>
                               <h2 className="text-4xl font-black text-[#0F172A] tracking-tighter">{selectedLesson.title}</h2>
                            </div>
                            <div className="p-10 rounded-[44px] bg-white border border-slate-100 shadow-sm leading-relaxed text-slate-600 font-medium prose max-w-none">
                               {selectedLesson.content_rich || "Belum ada deskripsi untuk materi ini."}
                            </div>
                         </div>
                      </div>
                   ) : (
                      <div className="h-[600px] flex items-center justify-center text-slate-300">
                         <div className="text-center space-y-4">
                            <BookOpen size={64} className="mx-auto"/>
                            <p className="font-bold">Select a lesson to start learning</p>
                         </div>
                      </div>
                   )}
                </div>

                {/* SIDEBAR (Right) */}
                <div className="xl:col-span-4 space-y-8">
                   {/* Playlist */}
                   <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-[44px] space-y-8">
                      <div className="flex items-center justify-between px-2">
                         <h3 className="text-lg font-black text-[#0F172A] tracking-tight">Course Journey</h3>
                         {isAdminView ? (
                            <button onClick={() => openLmsModal()} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:scale-105 transition-all">
                               <Plus size={20}/>
                            </button>
                         ) : (
                            <Sparkles className="text-blue-500" size={20}/>
                         )}
                      </div>
                      <div className="space-y-3">
                         {curriculum.filter(t => t.type === 'material').map((item, idx) => (
                            <div key={item.id} className="relative group/item">
                               <button 
                                  onClick={() => setSelectedLesson(item)}
                                  className={`w-full p-6 rounded-3xl transition-all flex items-center gap-4 group ${selectedLesson?.id === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-lg hover:-translate-y-1'}`}
                               >
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selectedLesson?.id === item.id ? 'bg-white/20' : 'bg-white shadow-sm text-blue-600'}`}>
                                     {item.type === 'material' ? (
                                        selectedLesson?.id === item.id ? <Play size={16} fill="white"/> : <PlayCircle size={18}/>
                                     ) : item.type === 'post_test' ? (
                                        <FileText size={18}/>
                                     ) : (
                                        <Target size={18}/>
                                     )}
                                  </div>
                                  <div className="text-left overflow-hidden">
                                     <p className={`text-[10px] font-black uppercase tracking-widest ${selectedLesson?.id === item.id ? 'text-white/60' : 'text-slate-400'}`}>
                                        {item.module_name || `Item ${idx + 1}`}
                                     </p>
                                     <p className="text-sm font-bold truncate">{item.title}</p>
                                  </div>
                               </button>
                               {isAdminView && (
                                  <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-0 group-hover/item:opacity-100 transition-all flex items-center gap-2">
                                     <button onClick={(e) => { e.stopPropagation(); openLmsModal(item); }} className="p-2 bg-white shadow-lg rounded-lg text-slate-400 hover:text-blue-600 transition-all"><Edit size={14}/></button>
                                     <button onClick={(e) => { e.stopPropagation(); handleDeleteLms(item.id); }} className="p-2 bg-white shadow-lg rounded-lg text-slate-400 hover:text-rose-500 transition-all"><Trash2 size={14}/></button>
                                  </div>
                               )}
                            </div>
                         ))}
                      </div>
                   </Card>

                    {/* Class Assets */}
                    {selectedLesson && selectedLesson.assets_json && selectedLesson.assets_json.length > 0 && (
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
             <div className="space-y-10">
                <div className="flex items-center justify-between px-6">
                   <div className="space-y-1">
                      <h3 className="text-3xl font-black text-[#0F172A] tracking-tighter">Community Board</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bagikan pengumuman atau artikel bacaan kursus</p>
                   </div>
                   {isAdminView && (
                      <button 
                        onClick={() => {
                            setEditingAnnId(null);
                            setAnnForm({ category: 'Umum', title: '', summary: '', content: '', image_url: '', gallery_images: [], is_pinned: false });
                            setIsAnnModalOpen(true);
                        }}
                        className="h-14 px-8 rounded-2xl bg-blue-600 text-white font-black text-sm uppercase shadow-xl shadow-blue-900/20 hover:bg-slate-900 transition-all flex items-center gap-3"
                      >
                         <Plus size={20}/> Post New Info
                      </button>
                   )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {announcements.length > 0 ? (
                        announcements.map((ann) => (
                            <div key={ann.id} onClick={() => {
                                    if (ann.category === 'Pengumuman' && ann.image_url) {
                                        setLightboxImg(ann.image_url);
                                    } else {
                                        window.open(`/ruang-sosmed/board/${resolvedParams.id}/${ann.id}`, '_blank');
                                    }
                                }} className="group relative cursor-pointer bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col transition-all hover:scale-[1.02] hover:shadow-2xl">
                                <div className="aspect-[16/10] w-full bg-slate-100 relative overflow-hidden">
                                    {ann.image_url ? (
                                        <img src={ann.image_url} alt={ann.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                                            <Layout size={40} className="text-white/20"/>
                                        </div>
                                    )}
                                    <div className="absolute top-6 left-6 px-4 py-2 rounded-xl bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-blue-600 shadow-sm">
                                        {ann.category}
                                    </div>
                                    {ann.is_pinned && (
                                        <div className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-amber-400 text-white flex items-center justify-center shadow-lg">
                                            <Zap size={18} fill="currentColor"/>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="p-8 flex-1 flex flex-col gap-4">
                                    <h4 className="text-xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{ann.title}</h4>
                                    <p className="text-sm text-slate-400 font-medium line-clamp-2">{ann.summary}</p>
                                    
                                    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Heart size={14} className="text-rose-500" fill={ann.reactions?.length > 0 ? "currentColor" : "none"}/>
                                            <span className="text-[10px] font-black text-slate-400">{ann.reactions?.length || 0} Reactions</span>
                                        </div>
                                        {isAdminView && (
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingAnnId(ann.id);
                                                        setAnnForm({
                                                            category: ann.category,
                                                            title: ann.title,
                                                            summary: ann.summary,
                                                            content: ann.content,
                                                            image_url: ann.image_url,
                                                            gallery_images: ann.gallery_images || [],
                                                            is_pinned: ann.is_pinned
                                                        });
                                                        setIsAnnModalOpen(true);
                                                    }}
                                                    className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"
                                                >
                                                    <Edit3 size={16}/>
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteAnnouncement(ann.id); }}
                                                    className="p-3 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={16}/>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-32 text-center space-y-4">
                             <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-200"><Layout size={32}/></div>
                             <p className="text-slate-400 font-bold">Belum ada pengumuman di Community Board.</p>
                        </div>
                    )}
                </div>
             </div>
          )}

          {activeTab === 'assignments' && (
             <div className="space-y-10">
                <div className="flex items-center justify-between px-6">
                   <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">Active Assignments</h3>
                   {isAdminView && (
                      <Button onClick={() => openLmsModal({ type: 'post_test' })} className="bg-blue-600 text-white h-12 px-6 rounded-xl font-bold flex items-center gap-2">
                        <Plus size={18}/> New Task
                      </Button>
                   )}
                </div>
                
                <div className="space-y-6 pb-20">
                   {curriculum.filter(c => c.type !== 'material').length > 0 ? (
                      curriculum.filter((c: any) => c.type !== 'material').map((c: any) => {
                         const submittedCount = new Set(allSubmissions.filter((s: any) => s.curriculum_id === c.id).map((s: any) => s.profile_id)).size;
                         const totalStudents = students.length;
                         const isFullySubmitted = submittedCount === totalStudents && totalStudents > 0;

                         return (
                         <Card key={c.id} className={`p-6 md:p-8 border-2 transition-all rounded-[32px] md:rounded-[44px] group hover:-translate-y-1 ${isFullySubmitted ? 'border-emerald-100 bg-emerald-50/10 shadow-emerald-500/5' : 'border-transparent shadow-sm hover:shadow-xl hover:border-slate-100 bg-white'}`}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                               <div className="flex items-center gap-5 md:gap-6">
                                  <div className={`w-14 h-14 rounded-[24px] flex items-center justify-center shrink-0 transition-all ${c.type === 'post_test' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-600'}`}>
                                     {c.type === 'post_test' ? <FileText size={24}/> : <Target size={24}/>}
                                  </div>
                                  <div>
                                     <h4 className="text-base md:text-lg font-black text-[#0F172A] group-hover:text-blue-600 transition-colors uppercase tracking-tight">{c.title}</h4>
                                     <div className="flex items-center gap-3 mt-1.5 opacity-60">
                                        <p className="text-[10px] font-black uppercase tracking-widest">{c.type.replace('_', ' ')}</p>
                                        <div className="w-1 h-1 rounded-full bg-slate-400"/>
                                        <p className="text-[10px] font-bold">Due: {c.due_date ? new Date(c.due_date).toLocaleDateString() : 'No Deadline'}</p>
                                     </div>
                                  </div>
                               </div>
                               
                               <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                                  <div className="flex flex-col items-center justify-center px-4 md:border-r border-slate-100 md:mr-2">
                                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Submissions</p>
                                     <div className="flex items-end gap-1">
                                        <span className={`text-xl font-black leading-none ${isFullySubmitted ? 'text-emerald-500' : 'text-blue-600'}`}>{submittedCount}</span>
                                        <span className="text-sm font-bold text-slate-400 leading-none mb-0.5">/{totalStudents}</span>
                                     </div>
                                  </div>

                                  <div className="flex items-center gap-4">
                                  {isAdminView && (
                                     <div className="flex items-center gap-2 pr-4 border-r border-slate-100">
                                        <button 
                                          onClick={async () => {
                                            const { error } = await supabase.from('v2_curriculums').update({ is_published: !c.is_published }).eq('id', c.id);
                                            if (!error) fetchCurriculum();
                                          }} 
                                          className={`p-3 rounded-xl transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-wider ${c.is_published ? 'bg-blue-50 text-blue-600 hover:bg-rose-50 hover:text-rose-600' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white ring-2 ring-emerald-100 shadow-lg shadow-emerald-500/10'}`}
                                          title={c.is_published ? "Hide from Students" : "Show to Students"}
                                        >
                                          {c.is_published ? <Eye size={16}/> : <EyeOff size={16}/>}
                                          <span>{c.is_published ? 'LIVE' : 'DRAFT'}</span>
                                        </button>
                                        <button onClick={() => openLmsModal(c)} className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"><Edit size={16}/></button>
                                        <button onClick={() => handleDeleteLms(c.id)} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all"><Trash2 size={16}/></button>
                                     </div>
                                  )}
                                     <Button 
                                       onClick={() => isAdminView ? handleViewSubmissions(c) : handleTakeQuiz(c)}
                                       className={`h-12 px-6 rounded-[16px] font-black text-xs transition-all flex items-center gap-2 group/btn ${isFullySubmitted ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' : 'bg-slate-50 text-slate-500 hover:bg-blue-600 hover:text-white'}`}
                                     >
                                        {isAdminView ? 'View Submissions' : 'Submit Task'}
                                        <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform"/>
                                     </Button>
                                  </div>
                               </div>
                            </div>
                         </Card>
                         );
                      })
                   ) : (
                      <div className="p-20 text-center opacity-40">
                         <ClipboardList size={44} className="mx-auto mb-4"/>
                         <p className="font-bold text-xs uppercase tracking-widest">Belum ada tugas yang aktif.</p>
                      </div>
                   )}
                </div>
             </div>
          )}

          {activeTab === 'grades' && (
             <div className="space-y-10">
                {/* GRADES DASHBOARD ANALYTICS */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 px-2">
                   {(() => {
                      const top5 = sortedStudents.slice(0, 5);
                      
                      const groupMap: any = {};
                      analyticsData.forEach(s => {
                         if (s.group === 'Unassigned') return;
                         if (!groupMap[s.group]) groupMap[s.group] = { totalG: 0, sumD: 0, sumA: 0, sumP: 0, count: 0, activePresenters: 0 };
                         groupMap[s.group].totalG += s.avgGC;
                         groupMap[s.group].sumD += s.p_diskusi;
                         groupMap[s.group].sumA += s.p_aktif;
                         groupMap[s.group].sumP += s.p_presentation;
                         groupMap[s.group].count += 1;
                         if (s.p_presentation > 0) groupMap[s.group].activePresenters += 1;
                      });
                      
                      const groupsAnalytics = Object.keys(groupMap).map(g => {
                         const avgG = groupMap[g].totalG / groupMap[g].count;
                         const activePres = groupMap[g].activePresenters;
                         
                         // If no one presented, the participation score is 0
                         const squadPart = activePres > 0 
                            ? (groupMap[g].sumD + groupMap[g].sumA + groupMap[g].sumP) / activePres 
                            : 0;

                         return {
                            name: g,
                            avg: Math.round(avgG + squadPart)
                         };
                      }).sort((a, b) => b.avg - a.avg);

                      const topGroup = groupsAnalytics[0];

                      return (
                         <>
                            {/* Card 1: ELITE STUDENTS */}
                            <div className="md:col-span-5 bg-white rounded-[44px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col gap-6 relative overflow-hidden group">
                               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10"/>
                               <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                                        <Award size={20}/>
                                     </div>
                                     <h4 className="text-xl font-black text-[#0F172A] tracking-tight">Elite Students</h4>
                                  </div>
                                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Top 5 Performer</span>
                               </div>
                               <div className="flex items-center justify-around">
                                  {top5.map((s, idx) => (
                                     <div 
                                        key={idx} 
                                        onClick={() => { setSelectedStudentDetail(s.mem); setIsDetailModalOpen(true); }}
                                        className="flex flex-col items-center gap-2 group/avatar cursor-pointer"
                                     >
                                        <div className={`relative w-16 h-16 transition-transform group-hover/avatar:scale-110 duration-500`}>
                                           {s.avatar ? (
                                              <img src={s.avatar} className="w-full h-full object-contain drop-shadow-md" />
                                           ) : (
                                              <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-400 border-2 border-dashed border-slate-200 capitalize">{s.name?.charAt(0)}</div>
                                           )}
                                           {idx === 0 && <Star size={16} className="absolute -top-1 -right-1 text-amber-400 fill-amber-400 animate-pulse drop-shadow-sm"/>}
                                        </div>
                                        <p className="text-[9px] font-black text-[#0F172A] text-center w-14 truncate">{s.name.split(' ')[0]}</p>
                                        <div className={`px-2 py-0.5 rounded-full text-[8px] font-black ${idx === 0 ? 'bg-amber-400 text-white' : 'bg-blue-50 text-blue-600'}`}>
                                           {Math.round(s.avg)}
                                        </div>
                                     </div>
                                  ))}
                               </div>
                            </div>

                            {/* Card 2: LEADING TEAM (Minimalist) */}
                            <div className="md:col-span-3 bg-white rounded-[44px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative flex flex-col justify-center gap-4 overflow-hidden group">
                               <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10"/>
                               <div className="space-y-1 relative z-10">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leading Group</p>
                                  <h4 className="text-2xl font-black truncate text-[#0F172A]">{topGroup?.name || 'N/A'}</h4>
                               </div>
                               <div className="flex items-end justify-between mt-1 relative z-10">
                                  <div className="flex flex-col">
                                     <span className="text-[36px] font-black leading-none text-blue-600 tracking-tighter">{topGroup?.avg || 0}</span>
                                     <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Avg Squad Score</span>
                                  </div>
                                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                     <Trophy size={24}/>
                                  </div>
                               </div>
                            </div>

                            {/* Card 3: GROUP COMPARISON */}
                            <div className="md:col-span-4 bg-white rounded-[44px] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col gap-4">
                               <div className="px-2 pt-2">
                                  <h4 className="text-sm font-black text-[#0F172A] uppercase tracking-widest flex items-center gap-2">
                                     <Target size={16} className="text-rose-500"/> Squad Performance
                                  </h4>
                               </div>
                               <div className="space-y-3 px-2 pt-3 overflow-y-auto max-h-[160px] custom-scrollbar">
                                  {groupsAnalytics.map((g, idx) => (
                                     <div key={idx} className="space-y-1.5 group/g">
                                        <div className="flex items-center justify-between text-[10px] font-black text-slate-600">
                                           <span className="group-hover/g:text-blue-600 transition-colors">{g.name}</span>
                                           <span>{g.avg} PT</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                                           <motion.div 
                                              initial={{ width: 0 }}
                                              animate={{ width: `${g.avg}%` }}
                                              className={`h-full rounded-full ${idx === 0 ? 'bg-blue-600' : 'bg-slate-300 group-hover/g:bg-blue-300'} transition-all`}
                                           />
                                        </div>
                                     </div>
                                  ))}
                                  {groupsAnalytics.length === 0 && <p className="text-center text-[10px] font-bold text-slate-300 mt-10">Belum ada grup yang dibentuk.</p>}
                               </div>
                            </div>
                         </>
                      );
                   })()}
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between px-8 gap-6">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">Grading Matrix Raport</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Dynamic performance breakdown based on assignments and kuis.</p>
                     </div>
                     <div className="flex flex-wrap items-center gap-3">
                         {/* MATRIX SEARCH */}
                         <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                               <Search size={16}/>
                            </div>
                            <input 
                               type="text"
                               placeholder="Cari nama student..."
                               value={matrixSearch}
                               onChange={(e) => setMatrixSearch(e.target.value)}
                               className="w-64 h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                            />
                         </div>

                         <button 
                            onClick={handleExportCSV}
                            className="h-12 px-5 rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-wider border border-emerald-100 shadow-sm"
                         >
                            <Download size={18} />
                            <span>Export CSV</span>
                         </button>
                        <button 
                           onClick={() => setIsManualGrading(!isManualGrading)}
                           className={`h-12 px-5 rounded-2xl transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-wider ${isManualGrading ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                        >
                           <Settings size={18} className={isManualGrading ? 'animate-spin-slow' : ''}/>
                           <span>{isManualGrading ? 'MANUAL MODE' : 'MANUAL MODE'}</span>
                        </button>
                     </div>
                  </div>

                 <Card className="p-0 border-none shadow-2xl shadow-slate-200/50 bg-white overflow-hidden rounded-[44px]">
                    <div className="overflow-x-auto">
                       {students.length > 0 ? (
                          <table className="w-full border-collapse">
                             <thead>
                                <tr className="bg-[#0F172A] text-white">
                                   <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest border-r border-white/5 sticky left-0 z-20 bg-[#0F172A] min-w-[280px]">Student Profil</th>
                                   
                                   {/* DINAMIS HEADER BERDASARKAN TUGAS */}
                                   {curriculum.filter(t => t.type !== 'material').map((c) => (
                                      <th key={c.id} className="px-4 py-8 text-center text-[9px] font-black uppercase tracking-widest min-w-[120px] max-w-[120px] border-r border-white/10 group relative">
                                         <div className="line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                            {c.title}
                                         </div>
                                      </th>
                                   ))}

                                    <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-widest bg-emerald-600/90 text-white">Participation</th>
                                    <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white">AVG SCORE</th>
                                    <th className="px-8 py-4 text-center text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white">GRADE</th>
                                </tr>
                             </thead>
                             <tbody>
                                 {filteredMatrix.length === 0 ? (
                                    <tr>
                                       <td colSpan={100} className="p-40 text-center opacity-30">
                                          <Search size={44} className="mx-auto mb-4"/>
                                          <p className="font-black text-xs uppercase tracking-[0.2em]">Tidak Ada Student Bernama "{matrixSearch}"</p>
                                       </td>
                                    </tr>
                                 ) : (
                                    filteredMatrix.map((mem) => {
                                       const studentSubmissions = allSubmissions.filter(s => s.profile_id === mem.v2_profiles?.id);
                                       
                                       let totalPT = 0, countPT = 0;
                                       let totalAssign = 0, countAssign = 0;
                                       let totalGC = 0, countGC = 0;
                                       
                                       const tasks = curriculum.filter(t => t.type !== 'material');
                                       
                                       const scores = tasks.map(t => {
                                          let score: number | null = null;
                                           
                                          //LETS WORK WITH AUTO-0 LOGIC
                                          //Threshold: Due Date + 24 Hours
                                           const now = new Date().getTime();
                                           const hasDueDate = !!t.due_date;
                                           const deadlineElapsed = hasDueDate ? (new Date(t.due_date).getTime() + 86400000) < now : false;

                                           if (t.type === 'post_test') {
                                              const quizResult = studentSubmissions.find(s => s.curriculum_id === t.id && s.score !== undefined); 
                                              score = quizResult ? (quizResult.score || 0) : (deadlineElapsed ? 0 : null);
                                              if (score !== null) { totalPT += score; countPT++; }
                                           } else {
                                              const sub = studentSubmissions.find(s => s.curriculum_id === t.id && s.grade !== undefined);
                                              score = sub ? (sub.grade || 0) : (deadlineElapsed ? 0 : null);
                                              if (score !== null) {
                                                if (t.type === 'challenge') { totalGC += score; countGC++; }
                                                else { totalAssign += score; countAssign++; }
                                              }
                                           }
                                           return { id: t.id, score, isAutoZero: (score === 0 && !studentSubmissions.find(s => s.curriculum_id === t.id)) };
                                       });

                                       const avgPT = countPT > 0 ? totalPT / countPT : 0;
                                       const avgAssign = countAssign > 0 ? totalAssign / countAssign : 0;
                                       const avgGC = countGC > 0 ? totalGC / countGC : 0;
                                       const attendCount = Object.values(mem.attendance || {}).filter(v => v === 'P').length;
                                       const attendScore = (attendCount / (batch?.schedules?.length || 1)) * 100;
                                       const plusPoints = (mem.plus_points || {}) as any;
                                       const plusTotal = Object.values(plusPoints).reduce((a: any, b: any) => (parseInt(a) || 0) + (parseInt(b) || 0), 0) as number;
                                       const participationScore = Object.keys(plusPoints).length > 0 ? Math.round(plusTotal / 4) : 0;
                                       const finalKeaktifan = (attendScore * 0.5) + (participationScore * 0.5);

                                       const finalAvg = (avgPT + avgAssign + avgGC + finalKeaktifan) / 4;

                                       const getGradingLabels = (avg: number) => {
                                          const s = Math.round(avg);
                                          if (s >= 90) return { label: 'A+ (Superstar)', color: 'text-purple-600 bg-purple-50' };
                                          if (s >= 85) return { label: 'A (Very Good)', color: 'text-indigo-600 bg-indigo-50' };
                                          if (s >= 80) return { label: 'B+ (Good)', color: 'text-blue-600 bg-blue-50' };
                                          if (s >= 70) return { label: 'B (Average)', color: 'text-amber-600 bg-amber-50' };
                                          if (s >= 60) return { label: 'C (Below Avg)', color: 'text-orange-600 bg-orange-50' };
                                          return { label: 'D (Very Poor)', color: 'text-rose-600 bg-rose-50' };
                                       };
                                       const grade = getGradingLabels(finalAvg);

                                       return (
                                          <tr key={mem.id} className="border-b border-slate-100 hover:bg-slate-50 transition-all">
                                             <td 
                                                onClick={() => { setSelectedStudentDetail(mem); setIsDetailModalOpen(true); }}
                                                className="px-8 py-5 text-left border-r border-slate-100 sticky left-0 z-10 bg-white group shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)] cursor-pointer"
                                             >
                                                <div className="flex items-center gap-3">
                                                   <div className="w-10 h-10 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 flex-shrink-0 group-hover:scale-110 group-hover:border-blue-200 transition-all duration-300">
                                                      {mem.v2_profiles?.avatar_url ? (
                                                         <img src={mem.v2_profiles.avatar_url} className="w-full h-full object-contain drop-shadow-sm" />
                                                      ) : (
                                                         <div className="w-full h-full flex items-center justify-center font-black text-slate-300 text-xs">
                                                            {mem.v2_profiles?.full_name?.charAt(0)}
                                                         </div>
                                                      )}
                                                   </div>
                                                   <div>
                                                      <p className="text-sm font-black text-[#0F172A] group-hover:text-blue-600 transition-colors leading-none mb-1">{mem.v2_profiles?.full_name}</p>
                                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">{mem.group_name || 'Individual'}</p>
                                                   </div>
                                                </div>
                                             </td>
                                             {scores.map(s => {
                                                const t = curriculum.find(tx => tx.id === s.id);
                                                const sub = studentSubmissions.find(sx => sx.curriculum_id === s.id);
                                                
                                                const scoreValue = t?.type === 'post_test' ? sub?.score : sub?.grade;
                                                const hasScore = scoreValue !== undefined && scoreValue !== null;
                                                const isZero = s.isAutoZero || (hasScore && scoreValue === 0);

                                                return (
                                                   <td key={s.id} className="px-4 py-5 text-center border-r border-slate-50 group/cell hover:bg-slate-50 transition-colors">
                                                      {isManualGrading && t?.type !== 'post_test' ? (
                                                         <input 
                                                            type="number"
                                                            defaultValue={scoreValue || 0}
                                                            onBlur={(e) => handleMatrixEdit('assignment', sub?.id || null, t.id, mem.v2_profiles.id, e.target.value)}
                                                            className="w-12 h-8 bg-transparent border-b-2 border-transparent focus:border-blue-500 text-center font-black text-slate-600 focus:outline-none transition-all"
                                                         />
                                                      ) : (
                                                         hasScore || s.isAutoZero ? (
                                                            <div className="flex flex-col items-center">
                                                               <span className={`text-sm font-black transition-all ${isZero ? 'text-rose-500' : (scoreValue || 0) >= 80 ? 'text-emerald-500' : 'text-slate-600'}`}>
                                                                  {hasScore ? scoreValue : 0}
                                                               </span>
                                                               {sub?.is_cloned && <div className="w-1 h-1 rounded-full bg-blue-400 mt-0.5" title="Synced data" />}
                                                            </div>
                                                         ) : (
                                                            <span className="text-slate-200 font-bold opacity-30">-</span>
                                                         )
                                                      )}
                                                   </td>
                                                );
                                             })}
                                             <td className="px-6 py-5 text-center bg-emerald-50/30 text-emerald-600 font-black text-sm border-r border-slate-100">{participationScore}</td>
                                             <td className="px-6 py-5 text-center bg-blue-50/10 text-blue-600 font-black text-lg border-r border-slate-100">{Math.round(finalAvg)}</td>
                                             <td className="px-8 py-5 text-center border-r border-slate-100">
                                                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase whitespace-nowrap ${grade.color}`}>
                                                   {grade.label}
                                                </span>
                                             </td>
                                          </tr>
                                       );
                                    })
                                 )}
                             </tbody>
                          </table>
                       ) : (
                          <div className="p-40 text-center">
                             <BarChart4 size={44} className="mx-auto mb-4 opacity-10"/>
                             <p className="text-xs font-bold text-slate-300">Invite students first to enable grading matrix.</p>
                          </div>
                       )}
                    </div>
                 </Card>

                 {/* PARTICIPATION PLUS POINTS PANEL */}
                 <div className="pt-10 space-y-8">
                    <div className="px-6 flex items-center justify-between">
                       <div className="space-y-1">
                          <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">Participation Bonus Matrix</h3>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Add extra points (+5, +10) for discussions, teamwork, and proactiveness.</p>
                       </div>
                    </div>
                    
                    <Card className="p-0 border-none shadow-2xl shadow-slate-200/50 bg-white overflow-hidden rounded-[44px]">
                       <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                             <thead>
                                <tr className="bg-emerald-950 text-white">
                                   <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest sticky left-0 z-20 bg-emerald-950 min-w-[280px] border-r border-white/5">Student Profil</th>
                                   {['Diskusi', 'Aktif Grup', 'Challenge Presence', 'Presentation'].map(cat => (
                                      <th key={cat} className="px-4 py-8 text-center text-[9px] font-black uppercase tracking-widest min-w-[120px] opacity-60 border-r border-white/5">{cat}</th>
                                   ))}
                                   <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white">TOTAL BONUS</th>
                                </tr>
                             </thead>
                             <tbody>
                                 {filteredMatrix.length === 0 ? (
                                    <tr>
                                       <td colSpan={100} className="p-32 text-center opacity-30">
                                          <Search size={44} className="mx-auto mb-4"/>
                                          <p className="font-black text-[10px] uppercase tracking-[0.2em]">Tidak Ada Student Bernama "{matrixSearch}"</p>
                                       </td>
                                    </tr>
                                 ) : (
                                    filteredMatrix.map((mem) => {
                                   const plus = (mem.plus_points || {}) as any;
                                   const sumPlus = Object.values(plus).reduce((a: any, b: any) => (parseInt(a) || 0) + (parseInt(b) || 0), 0);
                                   const avgPlus = Math.round(sumPlus / 4);

                                   return (
                                      <tr key={mem.id} className="border-b border-slate-100 hover:bg-slate-50 transition-all">
                                         <td 
                                                onClick={() => { setSelectedStudentDetail(mem); setIsDetailModalOpen(true); }}
                                                className="px-8 py-4 border-r border-slate-100 sticky left-0 z-10 bg-white group shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)] cursor-pointer"
                                             >
                                                <div className="flex items-center gap-3">
                                                   <div className="w-10 h-10 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 flex-shrink-0 group-hover:scale-110 group-hover:border-blue-200 transition-all duration-300">
                                                      {mem.v2_profiles?.avatar_url ? (
                                                         <img src={mem.v2_profiles.avatar_url} className="w-full h-full object-contain drop-shadow-sm" />
                                                      ) : (
                                                         <div className="w-full h-full flex items-center justify-center font-black text-slate-300 text-xs">
                                                            {mem.v2_profiles?.full_name?.charAt(0)}
                                                         </div>
                                                      )}
                                                   </div>
                                                   <div>
                                                      <p className="text-sm font-black text-[#0F172A] group-hover:text-blue-600 transition-colors leading-none mb-1">{mem.v2_profiles?.full_name}</p>
                                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">{mem.group_name || 'Individual'}</p>
                                                   </div>
                                                </div>
                                             </td>
                                         {['Diskusi', 'Aktif Grup', 'Challenge Presence', 'Presentation'].map(cat => (
                                            <td key={cat} className="px-4 py-4 text-center border-r border-slate-100">
                                               <input 
                                                  type="number"
                                                  defaultValue={plus[cat] || 0}
                                                  onBlur={(e) => handleSavePlusPoints(mem.id, cat, e.target.value)}
                                                  className="w-12 h-8 bg-transparent border-b-2 border-transparent focus:border-emerald-500 text-center font-black text-emerald-600 focus:outline-none transition-all"
                                              />
                                            </td>
                                         ))}
                                         <td className="px-6 py-4 text-center bg-emerald-50/30 text-emerald-600 font-black text-sm">{avgPlus}</td>
                                      </tr>
                                   );
                                    })
                                 )}
                             </tbody>
                          </table>
                       </div>
                    </Card>
                 </div>
             </div>
          )}

          {activeTab === 'attendance' && (
             <div className="space-y-10 pb-20">
                <div className="flex items-center justify-between px-6">
                   <div className="space-y-1">
                      <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">Presence Monitoring</h3>
                      <p className="text-xs text-slate-400 font-bold">Track attendance across 20 dynamic sessions for all students.</p>
                   </div>
                   <Button onClick={saveAttendance} className="bg-slate-900 text-white h-12 px-8 rounded-xl font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all">
                      <Check size={18}/> Sync Attendance
                   </Button>
                </div>

                <Card className="p-0 border-none shadow-2xl shadow-slate-200/50 bg-white overflow-hidden rounded-[44px]">
                   <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-indigo-950 text-white">
                              <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest border-r border-white/5 sticky left-0 z-20 bg-indigo-950 min-w-[280px]">Student Profil</th>
                              {(() => {
                                 const slots = batch?.schedules || [];
                                 return slots.map((s: any, i: number) => (
                                    <th key={s.id || i} className="w-20 min-w-[80px] px-2 py-8 text-center text-[7px] font-black border-r border-white/5 whitespace-nowrap uppercase tracking-tighter opacity-60">
                                       <p className="mb-1 text-white/40">{new Date(s.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}</p>
                                       {s.title}
                                    </th>
                                 ));
                              })()}
                              <th className="px-8 py-4 text-center text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white">Rate</th>
                           </tr>
                        </thead>
                        <tbody>
                           {filteredMatrix.length === 0 ? (
                              <tr>
                                 <td colSpan={100} className="p-32 text-center opacity-30">
                                    <Search size={44} className="mx-auto mb-4"/>
                                    <p className="font-black text-[10px] uppercase tracking-[0.2em]">Tidak Ada Student Bernama "{matrixSearch}"</p>
                                 </td>
                              </tr>
                           ) : (
                              filteredMatrix.map((mem) => {
                                 const att = mem.attendance || {};
                                 const presentCount = Object.values(att).filter(v => v === 'P').length;

                              return (
                                 <tr key={mem.id} className="border-b border-slate-100 hover:bg-slate-50 transition-all">
                                    <td 
                                        onClick={() => { setSelectedStudentDetail(mem); setIsDetailModalOpen(true); }}
                                        className="px-8 py-5 text-left border-r border-slate-100 sticky left-0 z-10 bg-white group shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)] cursor-pointer"
                                     >
                                        <div className="flex items-center gap-3">
                                           <div className="w-10 h-10 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 flex-shrink-0 group-hover:scale-110 group-hover:border-blue-200 transition-all duration-300">
                                              {mem.v2_profiles?.avatar_url ? (
                                                 <img src={mem.v2_profiles.avatar_url} className="w-full h-full object-contain drop-shadow-sm" />
                                              ) : (
                                                 <div className="w-full h-full flex items-center justify-center font-black text-slate-300 text-xs">
                                                    {mem.v2_profiles?.full_name?.charAt(0)}
                                                 </div>
                                              )}
                                           </div>
                                           <div>
                                              <p className="text-sm font-black text-[#0F172A] group-hover:text-blue-600 transition-colors leading-none mb-1">{mem.v2_profiles?.full_name}</p>
                                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">{mem.group_name || 'Individual'}</p>
                                           </div>
                                        </div>
                                     </td>
                                    {(() => {
                                       const slots = batch?.schedules || [];
                                       return slots.map((s: any, i: number) => {
                                          const sessionId = s.id;
                                          const status = att[sessionId] || att[`s${i+1}`] || '-';
                                          const getBadge = (st: string) => {
                                             if (st === 'P') return <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20"><Check size={14} strokeWidth={4}/></div>;
                                             if (st === 'S') return <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-[10px]">S</div>;
                                             if (st === 'I') return <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black text-[10px]">I</div>;
                                             if (st === 'A') return <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black text-[10px]">A</div>;
                                             return <span className="opacity-10 text-[10px] font-black text-slate-300">·</span>;
                                          };

                                          return (
                                             <td key={s.id || i} className="w-20 min-w-[80px] text-center border-r border-slate-100 group/cell relative p-0">
                                                <div className="flex items-center justify-center h-14">
                                                   <button 
                                                     onClick={() => {
                                                        const newAtt = { ...mem.attendance || {} };
                                                        const current = newAtt[sessionId];
                                                       //Cycle: P -> S -> I -> A -> -
                                                        const nextStatus = current === 'P' ? 'S' : current === 'S' ? 'I' : current === 'I' ? 'A' : current === 'A' ? '-' : 'P';
                                                        newAtt[sessionId] = nextStatus;
                                                        setStudents(students.map(stud => stud.id === mem.id ? { ...stud, attendance: newAtt } : stud));
                                                        supabase.from('v2_memberships').update({ attendance: newAtt }).eq('id', mem.id);
                                                     }}
                                                     className="transition-all hover:scale-125 active:scale-90"
                                                   >
                                                      {getBadge(status)}
                                                   </button>
                                                </div>
                                             </td>
                                          );
                                       });
                                    })()}
                                    <td className="px-8 py-5 text-center font-black text-emerald-600 bg-emerald-50/30">
                                       {Math.round((presentCount/(batch?.schedules?.length || 1)) * 100)}
                                    </td>
                                 </tr>
                              );
                            })
                         )}
                        </tbody>
                      </table>
                      {students.length === 0 && (
                         <div className="p-20 text-center">
                            <CheckCircle2 size={44} className="mx-auto mb-4 opacity-10"/>
                            <p className="text-xs font-bold text-slate-300">No students found in this batch.</p>
                         </div>
                      )}
                   </div>
                </Card>
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
                <button onClick={() => setIsRegModalOpen(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all"><X size={24}/></button>
              </div>

              <div className="p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">FULL NAME</label>
                  <input 
                    value={newStudent.fullName || ''}
                    onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
                    placeholder="e.g. Budi Santoso"
                    className="w-full h-14 rounded-2xl bg-neutral-50 px-6 font-bold text-base border border-slate-100 focus:outline-none focus:ring-2 ring-blue-500/20"
                 />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">UNIQUE USERNAME</label>
                  <input 
                    value={newStudent.username || ''}
                    onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value.toLowerCase().trim() })}
                    placeholder="e.g. budisantoso"
                    className="w-full h-14 rounded-2xl bg-neutral-50 px-6 font-bold text-base border border-slate-100 focus:outline-none focus:ring-2 ring-blue-500/20"
                 />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">TEMP PASSWORD</label>
                  <input 
                    value={newStudent.password || ''}
                    onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                    placeholder="e.g. Ruang Sosmed2024!"
                    className="w-full h-14 rounded-2xl bg-neutral-50 px-6 font-bold text-base border border-slate-100 focus:outline-none focus:ring-2 ring-blue-500/20"
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

      {/* REGISTRATION SUCCESS MODAL */}
      <AnimatePresence>
        {isSuccessModalOpen && regSuccessData && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="bg-white rounded-[56px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-white/20 relative"
            >
               {/* Background Sparkles */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"/>
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full"/>

               <div className="p-14 relative z-10 space-y-10 text-center">
                  <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[36px] flex items-center justify-center mx-auto shadow-inner">
                     <CheckCircle2 size={44}/>
                  </div>

                  <div className="space-y-4">
                     <h3 className="text-4xl font-black text-[#0F172A] tracking-tighter">Account Created! 🎉</h3>
                     <p className="text-slate-500 font-medium px-10">Kredensial login untuk <span className="font-bold text-[#0F172A]">{regSuccessData.fullName}</span> telah berhasil di-generate secara otomatis.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="p-8 rounded-[36px] bg-slate-50 border border-slate-100 space-y-1 text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">EMAIL IDENTITY</p>
                        <p className="text-sm font-bold text-[#0F172A] truncate">{regSuccessData.email}</p>
                     </div>
                     <div className="p-8 rounded-[36px] bg-slate-50 border border-slate-100 space-y-1 text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">SECRET TOKEN</p>
                        <p className="text-sm font-black text-blue-600">{regSuccessData.password}</p>
                     </div>
                  </div>

                  <div className="space-y-4 pt-4">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">WhatsApp Invitation Template</p>
                     <div className="p-10 rounded-[44px] bg-neutral-50/50 border border-slate-100 text-left relative group">
                        <p className="text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-line italic">
                           {regSuccessData.waMessage}
                        </p>
                     </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                     <Button 
                        onClick={handleCopyMessage}
                        className="flex-1 h-20 rounded-[32px] bg-blue-600 text-white font-black text-lg shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4"
                     >
                        <Share2 size={24}/> Copy WA Message
                     </Button>
                     <Button 
                        onClick={() => setIsSuccessModalOpen(false)}
                        className="h-20 px-10 rounded-[32px] bg-slate-100 text-slate-400 font-black text-lg hover:bg-slate-200 transition-all"
                     >
                        Close
                     </Button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* LMS MANAGEMENT MODAL */}
      <AnimatePresence>
        {isLmsModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="bg-white rounded-[56px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col border border-white/20 relative max-h-[90vh]"
            >
               <div className="p-10 border-b border-slate-50 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Settings size={24}/></div>
                     <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">{editingLmsItem ? 'Edit Curriculum' : 'Add New Curriculum'}</h3>
                  </div>
                  <button onClick={() => setIsLmsModalOpen(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all"><X size={24}/></button>
               </div>

               <div className="p-10 overflow-y-auto space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">ITEM TYPE</label>
                        <select 
                           value={lmsForm.type}
                           onChange={(e) => setLmsForm({ ...lmsForm, type: e.target.value })}
                           className="w-full h-14 rounded-2xl bg-neutral-50 px-6 font-bold text-base border border-slate-100 focus:outline-none focus:ring-2 ring-blue-500/20"
                        >
                           <option value="material">Video Material</option>
                           <option value="post_test">Post Test</option>
                           <option value="individual_assignment">Individual Task</option>
                           <option value="challenge">Group Challenge (Main Group)</option>
                           <option value="group_assignment">Custom Group Assignment / Sub-group</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">MODULE NAME</label>
                        <input 
                           value={lmsForm.module_name || ''}
                           onChange={(e) => setLmsForm({ ...lmsForm, module_name: e.target.value })}
                           placeholder="e.g. Modul 01: Fundamental"
                           className="w-full h-14 rounded-2xl bg-neutral-50 px-6 font-bold text-base border border-slate-100 focus:outline-none focus:ring-2 ring-blue-500/20"
                       />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">TITLE</label>
                        <input 
                           value={lmsForm.title || ''}
                           onChange={(e) => setLmsForm({ ...lmsForm, title: e.target.value })}
                           placeholder="Judul Materi atau Tugas"
                           className="w-full h-14 rounded-2xl bg-neutral-50 px-6 font-bold text-base border border-slate-100 focus:outline-none focus:ring-2 ring-blue-500/20"
                       />
                     </div>
                      <div className="space-y-2">
                         <label className={`text-[10px] font-black uppercase tracking-widest ml-2 ${lmsForm.type === 'material' ? 'text-blue-500' : 'text-rose-500'}`}>
                            {lmsForm.type === 'material' ? 'LIVE CLASS DATE (COUNTDOWN)' : 'SET DEADLINE (DUE DATE)'}
                         </label>
                         <input 
                            type="datetime-local"
                            value={lmsForm.due_date ? new Date(new Date(lmsForm.due_date).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                            onChange={(e) => {
                               if (!e.target.value) {
                                  setLmsForm({ ...lmsForm, due_date: '' });
                               } else {
                                  const d = new Date(e.target.value);
                                  if (!isNaN(d.getTime())) {
                                     setLmsForm({ ...lmsForm, due_date: d.toISOString() });
                                  } else {
                                     setLmsForm({ ...lmsForm, due_date: e.target.value });
                                  }
                               }
                            }}
                            className={`w-full h-14 rounded-2xl bg-neutral-50 px-6 font-bold text-sm border-2 border-slate-100 focus:outline-none transition-all ${lmsForm.type === 'material' ? 'focus:border-blue-500 text-blue-600' : 'focus:border-rose-500 text-rose-600'}`}
                        />
                      </div>
                  </div>

                  {lmsForm.type === 'material' && (
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">VIDEO EMBED URL</label>
                        <input 
                           value={lmsForm.video_url || ''}
                           onChange={(e) => setLmsForm({ ...lmsForm, video_url: e.target.value })}
                           placeholder="https://www.youtube.com/embed/..."
                           className="w-full h-14 rounded-2xl bg-neutral-50 px-6 font-bold text-base border border-slate-100 focus:outline-none focus:ring-2 ring-blue-500/20"
                       />
                     </div>
                  )}

                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">CONTENT/DESCRIPTION</label>
                     <textarea 
                        value={lmsForm.content_rich || ''}
                        onChange={(e) => setLmsForm({ ...lmsForm, content_rich: e.target.value })}
                        placeholder="Tulis instruksi atau deskripsi materi di sini..."
                        rows={4}
                        className="w-full p-6 rounded-3xl bg-neutral-50 font-bold text-sm border border-slate-100 focus:outline-none focus:ring-2 ring-blue-500/20"
                    />
                  </div>

                  <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center gap-6">
                     <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">PUBLICATION STATUS</label>
                        <button 
                           onClick={() => setLmsForm({ ...lmsForm, is_published: !lmsForm.is_published })}
                           className={`w-full h-14 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 border-2 ${lmsForm.is_published ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-400 hover:text-emerald-500'}`}
                        >
                           {lmsForm.is_published ? <Eye size={20}/> : <EyeOff size={20}/>}
                           {lmsForm.is_published ? 'READY TO PUBLISH (LIVE)' : 'SAVE AS DRAFT (HIDDEN)'}
                        </button>
                     </div>
                     {(lmsForm.type === 'challenge' || lmsForm.type === 'group_assignment') && (
                        <div className="flex-1 space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">GRADING MATRIX</label>
                           <button 
                              onClick={() => setLmsForm({ ...lmsForm, grading_mode: lmsForm.grading_mode === 'manual' ? 'auto' : 'manual' })}
                              className={`w-full h-14 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 border-2 ${lmsForm.grading_mode !== 'manual' ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'bg-slate-800 border-slate-800 text-white'}`}
                           >
                              {lmsForm.grading_mode !== 'manual' ? <CheckCircle2 size={20}/> : <Settings size={20}/>}
                              {lmsForm.grading_mode !== 'manual' ? 'AUTO SYNC TO MEMBERS' : 'MANUAL GRADING'}
                           </button>
                        </div>
                     )}
                  </div>

                  {lmsForm.type === 'group_assignment' && (
                     <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-[32px] space-y-4">
                        <div className="flex items-center justify-between ml-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-800">ASSIGNMENT GROUP / CUSTOM SUB-GROUP</label>
                            <button onClick={() => setIsCustomGroupModalOpen(true)} className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-white shadow-sm border border-blue-100 px-3 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition-all">+ CREATE NEW GROUP</button>
                        </div>
                        <select 
                           value={lmsForm.assignment_group_id || ''}
                           onChange={(e) => setLmsForm({ ...lmsForm, assignment_group_id: e.target.value })}
                           className="w-full h-14 rounded-2xl bg-white px-6 font-bold text-sm border border-slate-200 focus:outline-none focus:ring-2 ring-blue-500/20"
                        >
                           <option value="">-- (All / Global Setup) --</option>
                           {customGroups.map(g => (
                               <option key={g.id} value={g.id}>{g.name}</option>
                           ))}
                        </select>
                     </div>
                  )}

                  {/* QUIZ BUILDER (If Post Test) */}
                  {lmsForm.type === 'post_test' && (
                     <div className="p-10 rounded-[44px] bg-slate-900 space-y-8">
                        {/* Template Picker */}
                        {showTemplatePicker && (
                           <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                              <div className="flex items-center justify-between">
                                 <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Pilih Template Soal</p>
                                 <button onClick={() => setShowTemplatePicker(false)} className="text-white/30 hover:text-white transition-colors"><X size={16}/></button>
                              </div>
                              <input
                                 value={templateSearch}
                                 onChange={e => setTemplateSearch(e.target.value)}
                                 placeholder="Cari nama template..."
                                 className="w-full h-11 rounded-2xl bg-white/5 border border-white/10 px-5 text-white font-bold text-sm focus:outline-none focus:border-blue-500/40 transition-all"
                              />
                              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                 {quizTemplates.filter((t: any) => t.title.toLowerCase().includes(templateSearch.toLowerCase())).map((t: any) => (
                                    <button
                                       key={t.id}
                                       onClick={() => {
                                          setLmsForm({ ...lmsForm, quiz_data: { questions: t.questions_json } });
                                          setShowTemplatePicker(false);
                                          setTemplateSearch('');
                                       }}
                                       className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-blue-500/20 hover:border-blue-400/30 transition-all text-left group/tpl"
                                    >
                                       <div>
                                          <p className="text-sm font-black text-white">{t.title}</p>
                                          <p className="text-[10px] font-bold text-white/40 mt-0.5">{t.category} · {t.questions_json.length} soal</p>
                                       </div>
                                       <ChevronRight size={16} className="text-white/20 group-hover/tpl:text-blue-400 transition-colors"/>
                                    </button>
                                 ))}
                                 {quizTemplates.filter((t: any) => t.title.toLowerCase().includes(templateSearch.toLowerCase())).length === 0 && (
                                    <p className="text-white/30 text-xs font-bold text-center py-6">Tidak ada template ditemukan.</p>
                                 )}
                              </div>
                           </div>
                        )}

                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20"><Sparkles size={20}/></div>
                              <h4 className="text-xl font-black text-white px-2">Quiz Builder Engine</h4>
                           </div>
                           <div className="flex items-center gap-3">
                              <button
                                 onClick={async () => {
                                    if (quizTemplates.length === 0) {
                                       const { data } = await supabase.from('v2_quiz_templates').select('*').order('updated_at', { ascending: false });
                                       if (data) setQuizTemplates(data);
                                    }
                                    setShowTemplatePicker(v => !v);
                                 }}
                                 className="h-12 px-5 rounded-xl bg-blue-500/20 text-blue-300 text-xs font-black hover:bg-blue-500/30 transition-all border border-blue-500/20 flex items-center gap-2"
                              >
                                 <BookOpen size={14}/> Load Template
                              </button>
                              <button
                                 onClick={() => {
                                    const newQuiz = { ...lmsForm.quiz_data || { questions: [] } };
                                    newQuiz.questions = [...(newQuiz.questions || []), { id: Date.now(), text: '', type: 'mc', options: ['', '', '', ''], correct: 0, required: true }];
                                    setLmsForm({ ...lmsForm, quiz_data: newQuiz });
                                 }}
                                 className="h-12 px-6 rounded-xl bg-white/10 text-white text-xs font-black hover:bg-white/20 transition-all border border-white/10"
                              >+ Add Question</button>
                           </div>
                        </div>

                        <div className="space-y-6">
                           {(lmsForm.quiz_data?.questions || []).map((q:any, qi:number) => (
                              <div key={q.id} className="p-8 rounded-[32px] bg-white/5 border border-white/10 space-y-6 relative group/q">
                                 <button 
                                   onClick={() => {
                                      const newQuiz = { ...lmsForm.quiz_data };
                                      newQuiz.questions = newQuiz.questions.filter((_:any,idx:number) => idx !== qi);
                                      setLmsForm({ ...lmsForm, quiz_data: newQuiz });
                                   }}
                                   className="absolute top-6 right-6 p-2 text-white/20 hover:text-rose-400 transition-colors"
                                 ><Trash2 size={16}/></button>

                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between px-2">
                                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Question {qi + 1} {q.required && <span className="text-rose-500">*</span>}</label>
                                       <div className="flex bg-white/5 p-1 rounded-xl gap-1 border border-white/5">
                                          {[
                                             { id: 'mc', label: 'MC' },
                                             { id: 'essay', label: 'Short' },
                                             { id: 'long_text', label: 'Long' },
                                             { id: 'other', label: 'Other' }
                                          ].map(t => (
                                             <button
                                                key={t.id}
                                                onClick={() => {
                                                   const nq = { ...lmsForm.quiz_data };
                                                   nq.questions[qi].type = t.id;
                                                   setLmsForm({ ...lmsForm, quiz_data: nq });
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${q.type === t.id || (!q.type && t.id === 'mc') ? 'bg-blue-600 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}
                                             >{t.label}</button>
                                          ))}
                                       </div>
                                    </div>
                                    <input 
                                       value={q.text || ''}
                                       onChange={(e) => {
                                          const newQuiz = { ...lmsForm.quiz_data };
                                          newQuiz.questions[qi].text = e.target.value;
                                          setLmsForm({ ...lmsForm, quiz_data: newQuiz });
                                       }}
                                       placeholder="Enter question text..."
                                       className="w-full h-14 rounded-2xl bg-white/5 border border-white/5 px-6 text-white font-bold text-sm focus:border-blue-500/40 focus:outline-none transition-all"
                                    />
                                    <div className="flex items-center gap-2 px-2">
                                       <button 
                                          onClick={() => {
                                             const nq = { ...lmsForm.quiz_data };
                                             nq.questions[qi].required = !q.required;
                                             setLmsForm({ ...lmsForm, quiz_data: nq });
                                          }}
                                          className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${q.required ? 'bg-blue-600 border-blue-600 text-white' : 'bg-transparent border-white/20'}`}
                                       >
                                          {q.required && <Check size={10} strokeWidth={4}/>}
                                       </button>
                                       <span className="text-[10px] font-bold text-white/40 uppercase tracking-tight">Required Field</span>
                                    </div>
                                  </div>

                                  {(q.type === 'mc' || !q.type) && (
                                    <div className="grid grid-cols-2 gap-4">
                                       {q.options.map((opt:string, oi:number) => (
                                          <div key={oi} className="relative">
                                             <input 
                                                value={opt || ''}
                                                onChange={(e) => {
                                                   const newQuiz = { ...lmsForm.quiz_data };
                                                   newQuiz.questions[qi].options[oi] = e.target.value;
                                                   setLmsForm({ ...lmsForm, quiz_data: newQuiz });
                                                }}
                                                placeholder={`Option ${oi + 1}`}
                                                className={`w-full h-14 rounded-2xl bg-white/5 border px-6 pr-14 text-white font-bold text-sm focus:outline-none transition-all ${q.correct === oi ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/5'}`}
                                            />
                                             <button 
                                                onClick={() => {
                                                   const newQuiz = { ...lmsForm.quiz_data };
                                                   newQuiz.questions[qi].correct = oi;
                                                   setLmsForm({ ...lmsForm, quiz_data: newQuiz });
                                                }}
                                                className={`absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${q.correct === oi ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/20 hover:text-white'}`}
                                             >
                                                <Check size={14}/>
                                             </button>
                                          </div>
                                       ))}
                                       <button 
                                         onClick={() => {
                                            const newQuiz = { ...lmsForm.quiz_data };
                                            newQuiz.questions[qi].options = [...newQuiz.questions[qi].options, ''];
                                            setLmsForm({ ...lmsForm, quiz_data: newQuiz });
                                         }}
                                         className="h-14 rounded-2xl border border-dashed border-white/10 text-white/20 hover:text-white hover:border-white/30 transition-all text-[10px] font-black uppercase tracking-widest"
                                       >+ New Option</button>
                                    </div>
                                  )}

                                  {q.type && q.type !== 'mc' && (
                                    <div className="p-8 rounded-[24px] bg-white/5 border border-white/10 border-dashed text-center">
                                       <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Input Area: {q.type.replace('_', ' ')}</p>
                                    </div>
                                  )}
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* Assets Manager (Simple) */}
                  <div className="space-y-4">
                     <div className="flex items-center justify-between ml-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">CLASSROOM ASSETS</label>
                        <button 
                           onClick={() => setLmsForm({ ...lmsForm, assets_json: [...lmsForm.assets_json, { name: '', url: '' }] })}
                           className="text-xs font-black text-blue-600 uppercase tracking-widest"
                        >+ Add Asset</button>
                     </div>
                     <div className="space-y-3">
                        {(lmsForm.assets_json || []).map((asset: any, i: number) => (
                           <div key={i} className="flex gap-4">
                              <input 
                                 value={asset.name || ''}
                                 onChange={(e) => {
                                    const newAssets = [...lmsForm.assets_json];
                                    newAssets[i].name = e.target.value;
                                    setLmsForm({ ...lmsForm, assets_json: newAssets });
                                 }}
                                 placeholder="Asset Name (PDF, Canva, ...)"
                                 className="flex-1 h-12 rounded-xl bg-slate-50 px-6 text-sm font-bold border border-slate-100"
                             />
                               <input 
                                 value={asset.url || ''}
                                 onChange={(e) => {
                                    const newAssets = [...lmsForm.assets_json];
                                    newAssets[i].url = e.target.value;
                                    setLmsForm({ ...lmsForm, assets_json: newAssets });
                                 }}
                                 placeholder="URL"
                                 className="flex-[2] h-12 rounded-xl bg-slate-50 px-6 text-sm font-bold border border-slate-100"
                             />
                              <button onClick={() => setLmsForm({ ...lmsForm, assets_json: (lmsForm.assets_json || []).filter((_: any, idx: number) => idx !== i) })} className="p-3 text-rose-500"><Trash2 size={16}/></button>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="p-10 bg-slate-50 border-t border-slate-100 flex gap-4 shrink-0">
                  <Button 
                    onClick={handleSaveLms}
                    className="flex-1 h-16 rounded-[24px] bg-blue-600 text-white font-black text-sm shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-all"
                  >
                    Save Changes & Publish Realtime
                  </Button>
                  <Button 
                    onClick={() => setIsLmsModalOpen(false)}
                    className="h-16 px-10 rounded-[24px] bg-white text-slate-400 font-bold text-sm border border-slate-100"
                  >Cancel</Button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QUIZ TAKING MODAL */}
      <AnimatePresence>
        {isQuizModalOpen && activeQuiz && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="w-full max-w-4xl max-h-[90vh] bg-white rounded-[48px] shadow-3xl overflow-hidden flex flex-col"
             >
                <div className="p-10 border-b border-slate-100 flex items-center justify-between shrink-0">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center">
                         <FileText size={32}/>
                      </div>
                      <div>
                         <h2 className="text-2xl font-black text-[#0F172A] tracking-tighter">{activeQuiz.title}</h2>
                         <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{activeQuiz.module_name || "Assessment"}</p>
                      </div>
                   </div>
                   <button onClick={() => setIsQuizModalOpen(false)} className="p-4 bg-slate-50 rounded-2xl text-slate-300 hover:text-rose-500 transition-all">
                      <X size={24}/>
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-12">
                   {activeQuiz.quiz_data.questions.map((q: any, qi: number) => (
                      <div key={qi} className="space-y-6">
                         <div className="flex items-start gap-4">
                            <span className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 font-black text-sm">{qi+1}</span>
                            <h3 className="text-xl font-bold text-slate-800 leading-tight pt-1">{q.text}</h3>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-14">
                            {q.options.map((opt: string, oi: number) => (
                               <button 
                                 key={oi}
                                 onClick={() => setQuizAnswers({ ...quizAnswers, [qi]: oi })}
                                 className={`p-6 rounded-3xl text-left border-2 transition-all font-bold text-sm flex items-center justify-between group ${quizAnswers[qi] === oi ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-lg shadow-blue-500/10' : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'}`}
                               >
                                  <span>{opt}</span>
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${quizAnswers[qi] === oi ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'}`}>
                                     {quizAnswers[qi] === oi && <Check size={12} strokeWidth={4}/>}
                                  </div>
                               </button>
                            ))}
                         </div>
                      </div>
                   ))}
                </div>

                <div className="p-10 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                   <p className="text-sm font-bold text-slate-400">
                      Answered: <span className="text-blue-600">{Object.keys(quizAnswers).length}</span>/{activeQuiz.quiz_data.questions.length}
                   </p>
                   <Button 
                     onClick={handleSubmitQuiz}
                     disabled={Object.keys(quizAnswers).length < activeQuiz.quiz_data.questions.length || isLoading}
                     className="h-16 px-12 rounded-[24px] bg-blue-600 text-white font-black text-sm shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                   >
                     Submit Answers & Finish
                   </Button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUBMISSIONS VIEW MODAL */}
      <AnimatePresence>
        {isSubmissionsModalOpen && viewingCurriculum && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="w-full max-w-5xl max-h-[90vh] bg-white rounded-[48px] shadow-3xl overflow-hidden flex flex-col"
             >
                <div className="p-10 border-b border-slate-100 flex items-center justify-between shrink-0">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center">
                         <Users size={32}/>
                      </div>
                      <div>
                         <h2 className="text-2xl font-black text-[#0F172A] tracking-tighter">Student Submissions</h2>
                         <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{viewingCurriculum.title}</p>
                      </div>
                   </div>
                   <button onClick={() => setIsSubmissionsModalOpen(false)} className="p-4 bg-slate-50 rounded-2xl text-slate-300 hover:text-rose-500 transition-all">
                      <X size={24}/>
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                   {submissionsData.filter(s => !s.is_cloned).length > 0 ? (
                      <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                         {submissionsData.filter(s => !s.is_cloned).map((sub, i) => (
                              <div 
                                key={i} 
                                onClick={() => {
                                   if (viewingCurriculum?.type === 'post_test') {
                                      setActiveQuizReview(sub);
                                      setIsQuizReviewModalOpen(true);
                                   }
                                }}
                                className={`p-8 rounded-[36px] bg-slate-50 border border-slate-100 flex flex-col gap-8 transition-all relative group ${viewingCurriculum?.type === 'post_test' ? 'cursor-pointer hover:border-blue-400 hover:shadow-xl hover:shadow-blue-900/10 hover:bg-white scale-100 hover:scale-[1.02]' : ''}`}
                              >
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                       <div className="w-14 h-14 flex items-center justify-center shrink-0 relative">
                                          {sub.v2_profiles?.avatar_url ? (
                                             <img src={sub.v2_profiles.avatar_url} alt="Profile" className="w-full h-full object-contain"/>
                                          ) : (
                                             <span className="text-slate-300">{sub.v2_profiles?.full_name?.charAt(0) || 'S'}</span>
                                          )}
                                       </div>
                                       <div>
                                          <h4 className="font-black text-slate-900 group-hover:text-blue-700 transition-colors duration-300">{sub.v2_profiles?.full_name || 'Anonymous'}</h4>
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(sub.created_at).toLocaleString()}</p>
                                       </div>
                                    </div>
                                   {/* TEST COMMENT */}
                                 {viewingCurriculum?.type === 'post_test' ? (
                                      <div className="px-5 py-2 rounded-2xl bg-emerald-50 text-emerald-600 font-bold text-xs">
                                         PASSED
                                      </div>
                                   ) : (
                                      <button 
                                        onClick={() => handlePreviewSub(sub)}
                                        className="h-12 px-6 rounded-2xl bg-blue-600 text-white font-black text-[10px] uppercase flex items-center gap-2 hover:bg-slate-900 transition-all"
                                      >
                                         Preview Link <Download size={14}/>
                                      </button>
                                   )}
                                </div>

                                {viewingCurriculum?.type === 'group_assignment' && customGroups.length > 0 && !sub.is_cloned && (
                                   <div className="mt-2 p-6 rounded-[32px] bg-slate-100/50 border border-slate-200/60 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                                       <div className="flex-1 w-full">
                                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-3 ml-2">🏷️ STEMPEL GRUP PENGUMPULAN (Admin Fallback)</label>
                                           <select 
                                               value={sub.assignment_group_id || ''}
                                               onChange={(e) => {
                                                   const newVal = e.target.value || null;
                                                   setSubmissionsData(prev => prev.map(s => s.id === sub.id ? { ...s, assignment_group_id: newVal } : s));
                                               }}
                                               className="w-full h-14 text-sm font-bold text-slate-700 px-6 rounded-2xl border border-slate-200 bg-white shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all"
                                           >
                                               <option value="">-- Murid lupa milih Grup? (Set manual di sini) --</option>
                                               {customGroups.map(g => (
                                                   <option key={g.id} value={g.id}>{g.name}</option>
                                               ))}
                                           </select>
                                       </div>
                                       {sub.assignment_group_id && (
                                           <button 
                                               onClick={() => handleForceGroupSync(sub.id, sub.assignment_group_id)}
                                               className="w-full md:w-auto h-14 px-8 rounded-2xl bg-[#0F172A] text-white font-black text-xs uppercase shadow-xl shadow-slate-900/10 hover:bg-blue-600 hover:shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                           >
                                               <Zap size={16}/> Force Clone!
                                           </button>
                                       )}
                                   </div>
                                )}

                                {viewingCurriculum?.type === 'post_test' ? (
                                 <div className="space-y-1 flex items-end justify-between">
                                    <div>
                                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">FINAL SCORE</p>
                                       <div className="text-4xl font-black text-emerald-500 tracking-tighter group-hover:text-amber-500 transition-colors leading-none">{sub.score}</div>
                                    </div>
                                    <div className="px-5 py-2.5 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 shadow-sm border border-blue-100">
                                       Inspect Quiz <ArrowRight size={12}/>
                                    </div>
                                 </div>
                              ) : (
                                <div className="space-y-8">
                                   {viewingCurriculum?.type === 'challenge' && (
                                      <div className="p-8 rounded-[36px] bg-blue-50/50 border border-blue-100 space-y-6">
                                         <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><Sparkles size={14}/> Group Criterion Breakdown</p>
                                         <div className="grid grid-cols-2 gap-6">
                                            {['Isi Konten', 'Struktur Strategi', 'Visual Design', 'Eksekusi'].map(criterion => {
                                               const currentScores = (sub.criteria_scores || {}) as any;
                                               return (
                                                  <div key={criterion} className="space-y-2">
                                                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{criterion}</label>
                                                     <input 
                                                        type="number"
                                                        defaultValue={currentScores[criterion] || 0}
                                                        onChange={(e) => {
                                                           const newScores = { ...((sub.criteria_scores as any) || {}), [criterion]: parseInt(e.target.value) || 0 };
                                                            const avg = Math.round(Object.values(newScores).reduce((a: number, b: unknown) => a + (b as number), 0)/4);
                                                           setSubmissionsData(prev => prev.map(s => s.id === sub.id ? { ...s, grade: avg, criteria_scores: newScores } : s));
                                                        }}
                                                        className="w-full h-12 rounded-2xl bg-white border border-slate-100 px-6 font-black text-sm text-blue-600"
                                                    />
                                                  </div>
                                               )
                                            })}
                                         </div>
                                         <div className="pt-4 border-t border-blue-100 flex items-center justify-between">
                                            <p className="text-xs font-bold text-slate-400">Final Averaged Score:</p>
                                            <p className="text-2xl font-black text-blue-600">{sub.grade || 0}</p>
                                         </div>
                                         <button 
                                            onClick={() => openBulkGradeSelector(sub)}
                                            className="w-full h-12 rounded-2xl bg-blue-600 text-white font-black text-[10px] uppercase shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                                         >
                                            Apply Group Grade to All Members
                                         </button>
                                      </div>
                                   )}
                                   
                                   <div className="grid grid-cols-2 gap-8">
                                      {viewingCurriculum?.type !== 'challenge' && (
                                         <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">GIVE SCORE (0-100)</label>
                                            <input 
                                               type="number"
                                               defaultValue={sub.grade || 0}
                                               onChange={(e) => {
                                                  setSubmissionsData(prev => prev.map(s => s.id === sub.id ? { ...s, grade: parseInt(e.target.value) || 0 } : s));
                                               }}
                                               placeholder="85"
                                               className="w-full h-16 rounded-3xl bg-white border border-slate-200 px-8 text-2xl font-black text-blue-600 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-200"
                                           />
                                         </div>
                                      )}
                                      <div className={`${viewingCurriculum?.type === 'challenge' ? 'col-span-2' : ''} space-y-2`}>
                                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">SUBMISSION STATUS</label>
                                         <div className="w-full h-16 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-400 uppercase text-xs">
                                            {sub.status}
                                         </div>
                                      </div>
                                   </div>
                                   <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mentor Feedback</label>
                                      <textarea 
                                         defaultValue={sub.mentor_feedback}
                                         onChange={(e) => {
                                            setSubmissionsData(prev => prev.map(s => s.id === sub.id ? { ...s, mentor_feedback: e.target.value } : s));
                                         }}
                                         placeholder="Tambahkan catatan untuk siswa di sini..."
                                         className="w-full h-32 rounded-3xl bg-white border border-slate-200 p-6 text-sm font-bold focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-200"
                                     />
                                   </div>
                                   
                                   {viewingCurriculum?.type !== 'challenge' && (
                                      <button 
                                        onClick={() => {
                                           handleSaveGrade(sub.id, (sub.grade || 0).toString());
                                           handleSaveFeedback(sub.id, sub.mentor_feedback);
                                           alert("Assessment Saved! ✨");
                                        }}
                                        className="w-full h-14 rounded-3xl bg-slate-900 text-white font-black text-xs uppercase shadow-xl active:scale-95 transition-all"
                                      >
                                         Save Assessment
                                      </button>
                                   )}
                                </div>
                             )}
                             </div>
                          ))}
                       </div>
                   ) : (
                      <div className="p-40 text-center space-y-6">
                         <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-200">
                            <Clock size={40}/>
                         </div>
                         <div>
                            <p className="text-lg font-black text-slate-300">No submissions yet.</p>
                            <p className="text-sm text-slate-400 font-bold">Waiting for students to complete this task.</p>
                         </div>
                      </div>
                   )}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BULK GRADE SELECTION MODAL */}
      <AnimatePresence>
        {isBulkGradeModalOpen && bulkGradeData && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-white rounded-[44px] shadow-3xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <UserCheck size={20}/>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#0F172A]">Apply Group Grade</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select members to receive the same grade</p>
                  </div>
                </div>
                <button onClick={() => setIsBulkGradeModalOpen(false)} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-300 hover:text-rose-500 transition-all">
                  <X size={18}/>
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="p-6 rounded-3xl bg-blue-50/50 border border-blue-100/50 space-y-3">
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Source Submission</p>
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-blue-100 flex items-center justify-center font-black text-xs text-blue-400 overflow-hidden">
                         {bulkGradeData.sub.v2_profiles?.avatar_url ? (
                            <img src={bulkGradeData.sub.v2_profiles.avatar_url} className="w-full h-full object-contain drop-shadow-sm"/>
                         ) : (
                            bulkGradeData.sub.v2_profiles?.full_name?.charAt(0)
                         )}
                      </div>
                      <div>
                         <p className="text-sm font-black text-slate-800">{bulkGradeData.sub.v2_profiles?.full_name}</p>
                         <p className="text-[10px] font-bold text-blue-500">Score: {bulkGradeData.sub.grade || 0}</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Select Members to Grade</p>
                   {bulkGradeData.members.map((m) => (
                      <button 
                        key={m.profile_id}
                        onClick={() => toggleBulkGradeMember(m.profile_id)}
                        className={`w-full p-4 rounded-2xl flex items-center justify-between border-2 transition-all ${m.selected ? 'bg-white border-blue-500 shadow-lg shadow-blue-500/5' : 'bg-slate-50 border-transparent opacity-60'}`}
                      >
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center font-black text-xs text-slate-400 overflow-hidden">
                               {m.v2_profiles?.avatar_url ? (
                                  <img src={m.v2_profiles.avatar_url} className="w-full h-full object-contain drop-shadow-sm"/>
                               ) : (
                                  m.v2_profiles?.full_name?.charAt(0)
                               )}
                            </div>
                            <span className={`text-sm font-bold ${m.selected ? 'text-slate-900' : 'text-slate-400'}`}>{m.v2_profiles?.full_name}</span>
                         </div>
                         <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${m.selected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-300'}`}>
                            <Check size={14} strokeWidth={4}/>
                         </div>
                      </button>
                   ))}
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100">
                <Button 
                   onClick={handleApplyBulkGrade}
                   disabled={isLoading || bulkGradeData.members.filter(m => m.selected).length === 0}
                   className="w-full h-14 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all text-xs tracking-widest uppercase"
                >
                  {isLoading ? 'Syncing...' : `Apply Grade to ${bulkGradeData.members.filter(m => m.selected).length} Selected Members`}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RESULTS MODAL - Premium Experience */}
      <AnimatePresence>
        {isResultModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-2xl">
             <motion.div 
               initial={{ opacity: 0, scale: 0.8, y: 100 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.8, y: 100 }}
               className="w-full max-w-md bg-white rounded-[56px] shadow-3xl overflow-hidden text-center relative p-12 space-y-8"
             >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"/>
                
                <div className="space-y-4">
                   <div className={`w-24 h-24 rounded-[36px] mx-auto flex items-center justify-center shadow-2xl ${lastQuizResult >= 80 ? 'bg-emerald-500 text-white shadow-emerald-500/30' : lastQuizResult >= 60 ? 'bg-blue-600 text-white shadow-blue-600/30' : 'bg-rose-500 text-white shadow-rose-500/30'}`}>
                      {lastQuizResult >= 80 ? <Award size={48}/> : lastQuizResult >= 60 ? <Check size={48} strokeWidth={3}/> : <Zap size={48}/>}
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-3xl font-black text-[#0F172A] tracking-tighter">
                         {lastQuizResult >= 80 ? 'Incredible Work!' : lastQuizResult >= 60 ? 'Great Progress!' : 'Evaluation Results'}
                      </h3>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Student dynamic score summary</p>
                   </div>
                </div>

                <div className="p-10 rounded-[44px] bg-slate-50 border border-slate-100 space-y-2">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Achieved Score</p>
                   <div className="flex items-baseline justify-center gap-2">
                      <span className={`text-6xl font-black ${lastQuizResult >= 80 ? 'text-emerald-500' : lastQuizResult >= 60 ? 'text-blue-600' : 'text-rose-500'}`}>{lastQuizResult}</span>
                      <span className="text-xl font-black text-slate-300">/100</span>
                   </div>
                </div>

                <div className="space-y-4">
                   <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-[280px] mx-auto">
                      Hasil kuis telah berhasil disinkronkan ke dalam Grading Matrix seluruh siswa secara otomatis.
                   </p>
                   <Button 
                      onClick={() => setIsResultModalOpen(false)}
                      className="w-full h-16 rounded-[24px] bg-slate-900 text-white font-black text-sm shadow-xl shadow-slate-950/20 active:scale-95 transition-all"
                   >
                      Back to Dashboard
                   </Button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GROUP MANAGEMENT MODAL */}
      <AnimatePresence>
        {isGroupModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 30 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 30 }}
               className="w-full max-w-5xl max-h-[85vh] bg-white rounded-[48px] shadow-3xl overflow-hidden flex flex-col"
             >
                <div className="p-10 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                         <Users size={32}/>
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">Challenge Grouping</h3>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Organize and assign students to collaborative teams.</p>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <button 
                        onClick={() => handleShuffleGroups(5)}
                        className="px-8 py-3 bg-blue-50 text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-blue-100 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"
                      >
                         <Zap size={14}/> Magic Shuffle (5 Teams)
                      </button>
                      <button 
                        onClick={() => setIsGroupModalOpen(false)}
                        className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"
                      >
                         <X size={20}/>
                      </button>
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto p-10 bg-slate-50/30">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(() => {
                         const groupNames = Array.from(new Set(students.map(s => s.group_name || 'Unassigned'))).sort();
                         return groupNames.map((gn) => (
                            <Card key={gn} className={`p-6 border-none shadow-xl rounded-[32px] ${gn === 'Unassigned' ? 'bg-slate-100/50 grayscale opacity-60' : 'bg-white'} overflow-visible`}>
                               <div className="flex items-start justify-between mb-6">
                                  <div className="flex-1 mr-4">
                                     {editingGroup === gn ? (
                                        <div className="space-y-2">
                                           <input 
                                             type="text" 
                                             value={editGroupName} 
                                             onChange={(e) => setEditGroupName(e.target.value)} 
                                             placeholder="Group Name"
                                             className="w-full text-xs font-black uppercase tracking-widest text-[#0F172A] border-b-2 border-indigo-200 bg-indigo-50/30 px-3 py-1.5 outline-none rounded-t-xl focus:bg-indigo-50 transition-all"
                                             autoFocus
                                          />
                                           <input 
                                             type="text" 
                                             value={editGroupLink} 
                                             onChange={(e) => setEditGroupLink(e.target.value)} 
                                             placeholder="WhatsApp Group Link (https://chat.whatsapp.com/...)"
                                             className="w-full text-[10px] font-medium text-blue-600 border-b-2 border-slate-200 bg-slate-50/50 px-3 py-1.5 outline-none rounded-t-xl focus:bg-slate-50 transition-all"
                                          />
                                           <div className="flex gap-2 pt-2">
                                              <button onClick={() => handleSaveGroupConfig(gn)} className="flex-1 py-2 bg-indigo-600 text-white text-[10px] font-black tracking-widest uppercase rounded-xl shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all">SAVE</button>
                                              <button onClick={() => setEditingGroup(null)} className="flex-1 py-2 bg-slate-100 text-slate-500 text-[10px] font-black tracking-widest uppercase rounded-xl hover:bg-slate-200 transition-all">CANCEL</button>
                                           </div>
                                        </div>
                                     ) : (
                                        <div className="flex flex-col items-start gap-1">
                                           <h4 
                                              className="font-black text-xs uppercase tracking-widest text-[#0F172A] flex items-center gap-2 group cursor-pointer" 
                                              onClick={() => gn !== 'Unassigned' && (setEditingGroup(gn), setEditGroupName(gn), setEditGroupLink(students.find(s => s.group_name === gn)?.group_wa_link || ''))}
                                           >
                                              {gn}
                                              {gn !== 'Unassigned' && <Edit size={14} className="opacity-0 group-hover:opacity-100 transition-all hover:text-indigo-600 text-slate-300"/>}
                                           </h4>
                                           <div className="flex flex-wrap gap-2 items-center mt-1">
                                               {students.find(s => s.group_name === gn)?.group_wa_link ? (
                                                  <a href={students.find(s => s.group_name === gn)?.group_wa_link} target="_blank" rel="noreferrer" className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded truncate hover:bg-emerald-100 transition-all">
                                                     Whatsapp Group Link ✓
                                                  </a>
                                               ) : gn !== 'Unassigned' ? (
                                                  <span className="text-[9px] font-bold text-slate-400 border border-slate-200 border-dashed px-2 py-1 rounded">No WA Link</span>
                                               ) : null}
                                           </div>
                                        </div>
                                     )}
                                  </div>
                                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 shrink-0 mt-0.5">
                                     {students.filter(s => (s.group_name || 'Unassigned') === gn).length} STU
                                  </span>
                                </div>
                               <div className="space-y-3">
                                  {students.filter(s => (s.group_name || 'Unassigned') === gn).map((s) => (
                                     <div key={s.id} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-sm group">
                                        <div className="flex items-center gap-3">
                                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${s.is_leader ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
                                              {s.is_leader ? <Star size={12} fill="white"/> : s.v2_profiles?.full_name?.charAt(0)}
                                           </div>
                                           <span className="text-xs font-bold text-slate-700">{s.v2_profiles?.full_name}</span>
                                        </div>
                                        <button 
                                          onClick={() => handleToggleLeader(s.id, !!s.is_leader)}
                                          className={`p-2 rounded-lg transition-all ${s.is_leader ? 'text-amber-500 bg-amber-50' : 'text-slate-200 hover:text-amber-500 hover:bg-amber-50'}`}
                                        >
                                           <Award size={14}/>
                                        </button>
                                     </div>
                                  ))}
                               </div>
                            </Card>
                         ));
                      })()}
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SCHEDULE MANAGEMENT MODAL */}
      <AnimatePresence>
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 30 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 30 }}
               className="w-full max-w-4xl max-h-[85vh] bg-white rounded-[48px] shadow-3xl overflow-hidden flex flex-col"
             >
                <div className="p-10 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                         <CalendarCheck size={32}/>
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">Live Sessions</h3>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Schedule and manage virtual meetings.</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setIsScheduleModalOpen(false)}
                     className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"
                   >
                      <X size={20}/>
                   </button>
                </div>

                <div className="flex flex-col md:flex-row h-full overflow-hidden">
                   {/* Create Schedule Form */}
                   <div className="w-full md:w-1/3 p-8 border-r border-slate-100 bg-slate-50/50 space-y-6 overflow-y-auto">
                      <h4 className="font-black text-xs uppercase tracking-widest text-[#0F172A]">Add New Session</h4>
                      <div className="space-y-4">
                         <input 
                            placeholder="Session Title (e.g. Q&A Modul 1)" 
                            value={scheduleForm.title}
                            onChange={e => setScheduleForm({...scheduleForm, title: e.target.value})}
                            className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:border-emerald-500 outline-none"
                        />
                         <div className="grid grid-cols-2 gap-4">
                            <input 
                               type="date"
                               value={scheduleForm.date}
                               onChange={e => setScheduleForm({...scheduleForm, date: e.target.value})}
                               className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:border-emerald-500 outline-none text-slate-500"
                           />
                            <input 
                               type="time" 
                               value={scheduleForm.time}
                               onChange={e => setScheduleForm({...scheduleForm, time: e.target.value})}
                               className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:border-emerald-500 outline-none text-slate-500 cursor-text"
                           />
                         </div>
                         <input 
                            placeholder="Meeting Link (Zoom/GMeet)" 
                            value={scheduleForm.meet_link}
                            onChange={e => setScheduleForm({...scheduleForm, meet_link: e.target.value})}
                            className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:border-emerald-500 outline-none"
                        />
                         <Button 
                            onClick={handleSaveSchedule}
                            disabled={isLoading}
                            className="w-full h-14 bg-emerald-500 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all"
                         >
                            {isLoading ? "Saving..." : "Add Schedule"}
                         </Button>
                      </div>
                   </div>

                   {/* Scheduled List */}
                   <div className="flex-1 bg-white p-8 overflow-y-auto space-y-6">
                      <h4 className="font-black text-xs uppercase tracking-widest text-slate-400">Upcoming Sessions</h4>
                      <div className="space-y-4">
                         {(batch?.schedules || []).length === 0 ? (
                            <div className="text-center p-10 opacity-30">
                               <CalendarDays size={48} className="mx-auto mb-4"/>
                               <p className="font-black">No sessions scheduled.</p>
                            </div>
                         ) : (
                            (batch?.schedules || []).map((sch: any) => (
                               <div key={sch.id} className="flex items-center justify-between p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-emerald-200 transition-all group">
                                  <div className="flex items-center gap-5">
                                     <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex flex-col items-center justify-center font-black">
                                        <span className="text-lg leading-none">{new Date(sch.date).getDate()}</span>
                                        <span className="text-[9px] uppercase tracking-widest">{new Date(sch.date).toLocaleString('default', { month: 'short' })}</span>
                                     </div>
                                     <div>
                                        <h5 className="font-black text-slate-800 text-sm">{sch.title}</h5>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mt-1">
                                           <Clock size={10}/> {sch.time}
                                           {sch.meet_link && <span className="text-emerald-500 bg-emerald-50 px-2 rounded ml-2">Has Link</span>}
                                        </p>
                                     </div>
                                  </div>
                                  <button 
                                     onClick={() => handleDeleteSchedule(sch.id)}
                                     className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                  >
                                     <Trash2 size={14}/>
                                  </button>
                               </div>
                            ))
                         )}
                       </div>
                    </div>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

      {/* FIXED DROPDOWN PORTAL - bypasses all overflow constraints */}
      {openActionMenuId && (() => {
        const mem = students.find(s => s.id === openActionMenuId);
        if (!mem) return null;
        return (
          <>
            <div className="fixed inset-0 z-[150]" onClick={() => setOpenActionMenuId(null)}/>
            <div
              className="fixed z-[151] w-56 bg-white border border-slate-100 rounded-3xl shadow-2xl shadow-slate-300/40 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
              style={{ top: menuPos.top, right: menuPos.right }}
            >
              <button 
                onClick={() => { setSelectedStudentDetail(mem); setIsDetailModalOpen(true); setOpenActionMenuId(null); }}
                className="w-full flex items-center gap-3 px-5 py-4 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-all text-left"
              >
                <Eye size={15}/> Lihat Profile Card
              </button>
              <div className="border-t border-slate-50"/>
              <button onClick={() => { setStudentActionTarget({ ...mem, mode: 'cert' }); setCertUrl(mem.certificate_url || ''); setOpenActionMenuId(null); }} className="w-full flex items-center gap-3 px-5 py-4 text-xs font-bold text-slate-600 hover:bg-amber-50 hover:text-amber-600 transition-all text-left">
                <Medal size={15}/> Upload Sertifikat
              </button>
              <button onClick={() => { setStudentActionTarget({ ...mem, mode: 'name' }); setEditStudentName(mem.v2_profiles?.full_name || ''); setOpenActionMenuId(null); }} className="w-full flex items-center gap-3 px-5 py-4 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all text-left">
                <Edit size={15}/> Edit Nama
              </button>
              <button onClick={() => { setStudentActionTarget({ ...mem, mode: 'group' }); setMoveGroupTarget(mem.group_name || ''); setOpenActionMenuId(null); }} className="w-full flex items-center gap-3 px-5 py-4 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-left">
                <ShuffleIcon size={15}/> Pindah/Hapus Grup
              </button>
              <div className="border-t border-slate-100"/>
              <button onClick={() => { handleRemoveStudent(mem); }} className="w-full flex items-center gap-3 px-5 py-4 text-xs font-bold text-rose-500 hover:bg-rose-50 transition-all text-left">
                <UserX size={15}/> Hapus dari Batch
              </button>
            </div>
          </>
        );
      })()}

      {/* STUDENT MANAGEMENT MODAL */}
      <AnimatePresence>
        {studentActionTarget && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-lg" onClick={() => setStudentActionTarget(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-[44px] shadow-2xl overflow-hidden"
            >
              {studentActionTarget.mode === 'cert' && (
                <div className="p-10 space-y-8">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0"><Medal size={28}/></div>
                    <div>
                      <h3 className="text-xl font-black text-[#0F172A]">Upload Sertifikat</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{studentActionTarget.v2_profiles?.full_name}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">URL Sertifikat (Google Drive, PDF, dll)</label>
                    <input value={certUrl} onChange={e => setCertUrl(e.target.value)} placeholder="https://drive.google.com/file/..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-amber-400 outline-none"/>
                    {certUrl && <p className="text-[10px] text-emerald-600 font-bold">✓ URL terdeteksi</p>}
                    {studentActionTarget.certificate_url && !certUrl && <p className="text-[10px] text-rose-500 font-bold">Kosongkan dan simpan untuk menghapus sertifikat.</p>}
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleSaveCertificate} disabled={isLoading} className="flex-1 h-14 bg-amber-500 text-white font-black rounded-2xl shadow-lg shadow-amber-500/20 hover:bg-amber-600">{isLoading ? 'Menyimpan...' : 'Simpan Sertifikat'}</Button>
                    <Button onClick={() => setStudentActionTarget(null)} className="flex-1 h-14 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200">Batal</Button>
                  </div>
                </div>
              )}

              {studentActionTarget.mode === 'name' && (
                <div className="p-10 space-y-8">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0"><Edit size={28}/></div>
                    <div>
                      <h3 className="text-xl font-black text-[#0F172A]">Edit Nama Student</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {studentActionTarget.id?.slice(0,8)}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Lengkap</label>
                    <input value={editStudentName} onChange={e => setEditStudentName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-blue-400 outline-none"/>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleUpdateStudentName} disabled={isLoading} className="flex-1 h-14 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-700">{isLoading ? 'Menyimpan...' : 'Simpan Nama'}</Button>
                    <Button onClick={() => setStudentActionTarget(null)} className="flex-1 h-14 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200">Batal</Button>
                  </div>
                </div>
              )}

              {studentActionTarget.mode === 'group' && (() => {
                const groupNames = [...new Set(students.map(s => s.group_name).filter(Boolean))] as string[];
                return (
                  <div className="p-10 space-y-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0"><ShuffleIcon size={28}/></div>
                      <div>
                        <h3 className="text-xl font-black text-[#0F172A]">Pindah Grup</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{studentActionTarget.v2_profiles?.full_name}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pilih Tujuan Grup</label>
                      <select value={moveGroupTarget} onChange={e => setMoveGroupTarget(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-indigo-400 outline-none">
                        <option value="">-- Pilih Grup --</option>
                        {groupNames.map(gn => <option key={gn} value={gn}>{gn}</option>)}
                        <option value="__remove__">⛔ Hapus dari Grup</option>
                      </select>
                      {studentActionTarget.group_name && <p className="text-[10px] text-slate-400 font-bold">Saat ini: {studentActionTarget.group_name}</p>}
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleMoveStudentGroup} disabled={isLoading || !moveGroupTarget} className="flex-1 h-14 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700">{isLoading ? 'Memproses...' : 'Terapkan'}</Button>
                      <Button onClick={() => setStudentActionTarget(null)} className="flex-1 h-14 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200">Batal</Button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STUDENT DETAIL MODAL (ID CARD + ANALYTICS) */}
      <AnimatePresence>
        {isDetailModalOpen && selectedStudentDetail && (() => {
           const mem = selectedStudentDetail;
           
          //Analytics Component Reuse
           const tasks = curriculum.filter((c: any) => c.type !== 'material' && c.is_published !== false);
            const studentSubmissions = allSubmissions.filter(s => s.profile_id === mem.v2_profiles?.id);
            const tasksForAnalytics = curriculum.filter((t: any) => t.type !== 'material');
            
            let totalPT = 0, countPT = 0;
            let totalAssign = 0, countAssign = 0;
            let totalGC = 0, countGC = 0;
            
            tasksForAnalytics.forEach((t: any) => {
               const res = studentSubmissions.find(s => s.curriculum_id === t.id);
               const score = res ? (res.score || res.grade || 0) : 0;
               if (t.type === 'post_test') { totalPT += score; countPT++; }
               else if (t.type === 'individual_assignment' || t.type === 'assignment') { totalAssign += score; countAssign++; }
               else if (t.type === 'challenge') { totalGC += score; countGC++; }
            });

            const avgPT = totalPT / (tasksForAnalytics.filter(tr => tr.type === 'post_test').length || 1);
            const avgAssign = totalAssign / (tasksForAnalytics.filter(tr => tr.type === 'individual_assignment' || tr.type === 'assignment').length || 1);
            const avgGC = totalGC / (tasksForAnalytics.filter(tr => tr.type === 'challenge').length || 1);
            
            const attendList = Object.values(mem.attendance || {});
            const attendCount = attendList.filter(v => v === 'P').length;
            const totalSessions = batch?.schedules?.length || 0;
            const attendScore = totalSessions > 0 ? (attendCount / totalSessions) * 100 : 0;
            const plusPoints = (mem.plus_points || {}) as any;
            const plusTotal = Object.values(plusPoints).reduce((a: any, b: any) => (parseInt(a) || 0) + (parseInt(b) || 0), 0) as number;
            const participationScore = Object.keys(plusPoints).length > 0 ? Math.round(plusTotal / 4) : 0;
            const finalKeaktifan = (attendScore * 0.5) + (participationScore * 0.5);

           // Unified Formula: (PT + Assign + GC + Keaktifan)/4
           const finalAvg = (avgPT + avgAssign + avgGC + finalKeaktifan) / 4;

           const getGradingLabels = (avg: number) => {
              const s = Math.round(avg);
              if (s >= 90) return { label: 'A+ (Superstar)', color: 'text-purple-600 bg-purple-50' };
              if (s >= 85) return { label: 'A (Very Good)', color: 'text-indigo-600 bg-indigo-50' };
              if (s >= 80) return { label: 'B+ (Good)', color: 'text-blue-600 bg-blue-50' };
              if (s >= 70) return { label: 'B (Average)', color: 'text-amber-600 bg-amber-50' };
              if (s >= 60) return { label: 'C (Below Avg)', color: 'text-orange-600 bg-orange-50' };
              return { label: 'D (Very Poor)', color: 'text-rose-600 bg-rose-50' };
           };
           const grade = getGradingLabels(finalAvg);

           return (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-[#0F172A]/80 backdrop-blur-xl" onClick={() => setIsDetailModalOpen(false)}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-4xl bg-white rounded-[56px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden relative"
              >
                <button 
                  onClick={() => setIsDetailModalOpen(false)}
                  className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-slate-100/50 hover:bg-slate-200 text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center z-[310]"
                >
                  <X size={20}/>
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className={`p-10 relative overflow-hidden bg-gradient-to-br ${batch?.name?.toLowerCase()?.includes('ruang sosmed') ? 'from-sky-600 to-blue-800' : 'from-indigo-600 to-blue-800'}`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2"/>
                    <IdCardContent 
                       batch={batch}
                       currentUser={mem.v2_profiles}
                       me={mem}
                       resolvedParams={resolvedParams}
                   />
                  </div>

                  <div className="p-10 space-y-10 bg-white">
                    <div className="space-y-6">
                      <div className="px-4 py-2 rounded-2xl bg-blue-50 border border-blue-100 text-[10px] font-black text-blue-600 uppercase tracking-widest w-fit">Academic Matrix</div>
                      <h3 className="text-2xl font-black text-[#0F172A] tracking-tighter leading-none">Overall Progress</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 space-y-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">GPA Score</p>
                        <p className="text-3xl font-black text-blue-600">{Math.round(finalAvg)}<span className="text-sm font-bold text-slate-400">/100</span></p>
                      </div>
                      <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 space-y-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Presence</p>
                        <p className="text-3xl font-black text-emerald-600">{attendCount}<span className="text-sm font-bold text-slate-400">/{totalSessions}</span></p>
                      </div>
                    </div>

                    <div className={`p-8 rounded-[36px] ${grade.color} border border-current flex flex-col items-center justify-center text-center gap-2`}>
                      <Award size={32}/>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Achievement Grade</p>
                        <h4 className="text-xl font-black">{grade.label}</h4>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm"/>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Student</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-tighter">Cohort {resolvedParams.id.substring(0,4)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
           );
        })()}
      </AnimatePresence>

      {/* QUIZ REVIEW & FEEDBACK MODAL */}
      <AnimatePresence>
        {isQuizReviewModalOpen && activeQuizReview && (() => {
           const quizDef = curriculum.find((c: any) => c.id === activeQuizReview.curriculum_id);
           const questions = quizDef?.quiz_data?.questions || [];
           const allReports = questions.map((q: any, qi: number) => {
              const studentAnswer = activeQuizReview.answers_json?.[qi];
              const isCorrect = studentAnswer === q.correct;
              const isText = q.type === 'long_text' || !q.options;

              return {
                 number: qi + 1,
                 type: isText ? 'text' : 'mc',
                 questionHtml: q.text,
                 studentChoice: isText ? studentAnswer : (studentAnswer !== undefined ? q.options[studentAnswer] : "Tidak Dijawab"),
                 correctChoice: isText ? "Manual Review" : q.options[q.correct],
                 isCorrect
              };
           });

           return (
             <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="w-full max-w-2xl max-h-[90vh] bg-white rounded-[40px] shadow-3xl overflow-hidden border border-slate-100 flex flex-col"
                >
                   <div className="p-8 border-b border-slate-100 flex items-start justify-between bg-slate-50/50 shrink-0">
                      <div className="space-y-2">
                         <div className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black w-fit uppercase tracking-widest border border-blue-200 shadow-inner">
                           Post-Test Inspection
                         </div>
                         <h2 className="text-2xl font-black text-[#0F172A] tracking-tighter pt-2">
                           {activeQuizReview.v2_profiles?.full_name || 'Student'}
                         </h2>
                         <div className="flex items-center gap-4 pt-1">
                            <p className="text-xs font-bold text-slate-400">Score: <span className={activeQuizReview.score >= 80 ? "text-emerald-500" : "text-rose-500"}>{activeQuizReview.score}</span>/100</p>
                            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
                               <label className="text-[9px] font-black text-blue-600 uppercase">Adjust:</label>
                               <input 
                                  type="number" 
                                  defaultValue={activeQuizReview.score}
                                  className="w-10 bg-transparent border-none text-xs font-black text-blue-700 focus:outline-none"
                                  onBlur={(e) => {
                                     const newScore = parseInt(e.target.value) || 0;
                                     if (!isNaN(newScore)) {
                                        supabase.from('v2_quiz_results').update({ score: newScore }).eq('id', activeQuizReview.id).then(() => {
                                           fetchAllSubmissions();
                                        });
                                     }
                                  }}
                               />
                            </div>
                         </div>
                      </div>
                      <button onClick={() => setIsQuizReviewModalOpen(false)} className="p-3 bg-white border border-slate-100 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm">
                         <X size={20}/>
                      </button>
                   </div>

                   <div className="flex-1 overflow-y-auto p-8 space-y-10">
                      <div className="space-y-4">
                         <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center font-black text-xs border border-blue-100 shadow-sm">
                               {allReports.length}
                            </div>
                            <div>
                               <h3 className="text-lg font-black text-slate-800 tracking-tight">Question Analysis</h3>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Response Report</p>
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-1 gap-6">
                            {allReports.map((report: any, idx: number) => (
                               <div key={idx} className={`p-6 bg-white border ${report.isCorrect || report.type === 'text' ? 'border-slate-100' : 'border-rose-100 bg-rose-50/20'} rounded-[32px] shadow-sm space-y-4 relative overflow-hidden group`}>
                                  <div className="flex gap-4 items-start relative z-10">
                                     <span className={`shrink-0 w-8 h-8 rounded-xl ${report.isCorrect || report.type === 'text' ? 'bg-slate-100 text-slate-500' : 'bg-rose-100 text-rose-600'} flex items-center justify-center text-xs font-black shadow-sm`}>{report.number}</span>
                                     <div className="space-y-4 flex-1">
                                        <p className="text-[15px] font-black text-slate-800 leading-snug">{report.questionHtml}</p>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                           <div className="space-y-1.5">
                                              <span className={`px-2 py-0.5 rounded-md ${report.isCorrect || report.type === 'text' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'} text-[9px] font-black uppercase tracking-wider shadow-inner`}>Student Answer</span>
                                              <p className={`text-sm ${report.type === 'text' ? 'font-medium text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100' : (report.isCorrect ? 'font-black text-emerald-600' : 'font-bold text-rose-600')}`}>
                                                 {report.studentChoice || <span className="italic opacity-50 text-slate-400 underline decoration-dotted">No Answer Provided</span>}
                                              </p>
                                           </div>
                                           {report.type === 'mc' && !report.isCorrect && (
                                              <div className="space-y-1.5">
                                                 <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-wider shadow-inner">Correct Key</span>
                                                 <p className="text-sm font-black text-emerald-600">{report.correctChoice}</p>
                                              </div>
                                           )}
                                           {report.type === 'text' && (
                                              <div className="space-y-1.5">
                                                 <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-wider shadow-inner">Review Note</span>
                                                 <p className="text-xs font-bold text-amber-600 italic">Open-ended question. Adjust score above if needed.</p>
                                              </div>
                                           )}
                                        </div>
                                     </div>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>


                   </div>
                   
                   <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end shrink-0">
                      <Button onClick={() => setIsQuizReviewModalOpen(false)} className="w-full md:w-auto px-10 h-14 rounded-[20px] bg-blue-600 hover:bg-blue-700 text-white font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                         Close Review
                      </Button>
                   </div>
                </motion.div>
             </div>
           );
        })()}
      </AnimatePresence>

      {/* COMMUNITY BOARD MODAL */}
      <AnimatePresence>
        {isAnnModalOpen && (
           <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-3xl max-h-[90vh] bg-white rounded-[40px] shadow-3xl overflow-hidden flex flex-col border border-white/20"
              >
                 <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-blue-50/50 shrink-0">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                          <Layout size={24}/>
                       </div>
                       <div>
                          <h3 className="text-xl font-black text-slate-900 tracking-tight">{editingAnnId ? 'Update Info' : 'New Board Post'}</h3>
                          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Community Board Management</p>
                       </div>
                    </div>
                    <button onClick={() => setIsAnnModalOpen(false)} className="p-4 bg-white rounded-2xl text-slate-300 hover:text-rose-500 transition-all shadow-sm">
                       <X size={20}/>
                    </button>
                 </div>

                 <div className="flex-1 overflow-y-auto p-10 space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">CATEGORY</label>
                           <select 
                              value={annForm.category}
                              onChange={(e) => setAnnForm({ ...annForm, category: e.target.value })}
                              className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 px-6 font-bold text-sm focus:border-blue-500 focus:outline-none transition-all"
                           >
                              <option value="Pengumuman">📢 Pengumuman</option>
                              <option value="Artikel">📰 Artikel / Bacaan</option>
                              <option value="Tips">💡 Tips & Trick</option>
                              <option value="Update">🚀 System Update</option>
                              <option value="Umum">✨ Umum</option>
                           </select>
                        </div>
                        <div className="flex items-center gap-4 px-6 h-14 bg-amber-50 rounded-2xl border border-amber-100 mt-6 md:mt-0">
                            <input 
                                type="checkbox"
                                id="is_pinned"
                                checked={annForm.is_pinned}
                                onChange={(e) => setAnnForm({ ...annForm, is_pinned: e.target.checked })}
                                className="w-5 h-5 rounded-md border-amber-200 text-amber-500 focus:ring-amber-500"
                            />
                            <label htmlFor="is_pinned" className="text-xs font-black text-amber-700 cursor-pointer">PINNED POST (Prioritas Atas)</label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">TITLE</label>
                        <input 
                           value={annForm.title}
                           onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                           placeholder="Judul Info Keren Kamu..."
                           className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 px-8 text-sm font-bold focus:border-blue-500 focus:outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Featured Image</label>
                        <div className="flex items-center gap-6 p-6 bg-slate-50 border border-slate-100 rounded-[32px]">
                           <div className="w-24 h-24 rounded-2xl bg-white border border-slate-100 overflow-hidden flex-shrink-0 relative group">
                              {annForm.image_url ? (
                                 <img src={annForm.image_url} alt="Preview" className="w-full h-full object-contain drop-shadow-sm"/>
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center text-slate-200">
                                    <Camera size={30}/>
                                 </div>
                              )}
                              {isUploading && (
                                 <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                    <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
                                 </div>
                              )}
                           </div>
                           <div className="flex-1 space-y-3">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload foto artikel/info (Auto-compressed)</p>
                              <div className="flex gap-2">
                                 <label className="cursor-pointer px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all">
                                    {isUploading ? 'Uploading...' : 'Pilih Foto'}
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading}/>
                                 </label>
                                 {annForm.image_url && (
                                    <button 
                                      onClick={() => setAnnForm({...annForm, image_url: ''})}
                                      className="px-5 py-2.5 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                                    >
                                       Hapus
                                    </button>
                                 )}
                              </div>
                           </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">SUMMARY (Feed Preview)</label>
                        <textarea 
                           value={annForm.summary}
                           onChange={(e) => setAnnForm({ ...annForm, summary: e.target.value })}
                           placeholder="Deskripsi singkat yang tampil di feed..."
                           className="w-full h-24 rounded-2xl bg-slate-50 border border-slate-100 p-6 text-sm font-bold focus:border-blue-500 focus:outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">FULL CONTENT (Detailed Article)</label>
                        <textarea 
                           value={annForm.content}
                           onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                           placeholder="Tulis artikel lengkap di sini..."
                           className="w-full h-64 rounded-[32px] bg-slate-50 border border-slate-100 p-8 text-sm font-medium leading-relaxed focus:border-blue-500 focus:outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Gallery Section */}
                    <div className="space-y-4">
                       <div className="flex items-center justify-between ml-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gallery Foto Artikel</label>
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{annForm.gallery_images?.length || 0}/4 Foto</span>
                       </div>
                       <div className="grid grid-cols-4 gap-3">
                          {(annForm.gallery_images || []).map((url: string, idx: number) => (
                             <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 group">
                                <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-contain drop-shadow-sm"/>
                                <button  
                                   onClick={() => setAnnForm((prev: any) => ({ ...prev, gallery_images: prev.gallery_images.filter((_: any, i: number) => i !== idx) }))}
                                   className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-all"
                                >
                                   <X size={20}/>
                                </button>
                             </div>
                          ))}
                          {(annForm.gallery_images?.length || 0) < 4 && (
                             <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group">
                                {isGalleryUploading ? (
                                   <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
                                ) : (
                                   <>
                                      <Camera size={22} className="text-slate-300 group-hover:text-blue-500 transition-colors mb-1"/>
                                      <span className="text-[9px] font-black text-slate-300 group-hover:text-blue-500 uppercase tracking-widest">Add Photos</span>
                                   </>
                                )}
                                <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} disabled={isGalleryUploading}/>
                             </label>
                          )}
                       </div>
                    </div>
                 </div>

                 <div className="p-8 border-t border-slate-50 bg-slate-50/50 shrink-0">
                    <button 
                        onClick={handleSaveAnnouncement}
                        disabled={isLoading}
                        className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black text-sm uppercase shadow-xl shadow-slate-900/10 hover:bg-blue-600 transition-all flex items-center justify-center gap-3"
                    >
                       <Zap size={20}/> {editingAnnId ? 'Update Information' : 'Publish to Students'}
                    </button>
                 </div>
              </motion.div>
           </div>
        )}
      </AnimatePresence>

      {/* CUSTOM GROUP BUILDER MODAL */}
      <AnimatePresence>
        {isCustomGroupModalOpen && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="w-full max-w-2xl max-h-[85vh] bg-white rounded-[40px] shadow-3xl overflow-hidden flex flex-col border border-white/20"
             >
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-blue-50/50 shrink-0">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                         <Users size={24}/>
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-slate-900 tracking-tight">Custom Group Builder</h3>
                         <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Assign Specific Students</p>
                      </div>
                   </div>
                   <button onClick={() => setIsCustomGroupModalOpen(false)} className="p-3 text-slate-400 hover:text-rose-500 transition-all rounded-xl hover:bg-white"><X size={20}/></button>
                </div>

                <div className="p-8 overflow-y-auto space-y-6">
                   <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">GROUP NAME</label>
                       <input 
                           value={customGroupForm.name}
                           onChange={e => setCustomGroupForm({...customGroupForm, name: e.target.value})}
                           placeholder="e.g. Frontend Team Alpha"
                           className="w-full h-14 rounded-2xl bg-neutral-50 px-6 font-bold text-sm border border-slate-100 focus:outline-none focus:ring-2 ring-blue-500/20"
                       />
                   </div>
                   
                   <div className="space-y-4">
                       <div className="flex items-center justify-between ml-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">SELECT MEMBERS</label>
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{customGroupForm.members.length} / {students.length}</span>
                       </div>
                       <div className="bg-slate-50 border border-slate-100 rounded-[24px] p-2 max-h-64 overflow-y-auto space-y-1">
                           {students.map(s => (
                               <button 
                                  key={s.id}
                                  onClick={() => {
                                      const newMembers = customGroupForm.members.includes(s.profile_id) 
                                          ? customGroupForm.members.filter(id => id !== s.profile_id)
                                          : [...customGroupForm.members, s.profile_id];
                                      setCustomGroupForm({...customGroupForm, members: newMembers});
                                  }}
                                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${customGroupForm.members.includes(s.profile_id) ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-transparent text-slate-600 hover:bg-white'}`}
                               >
                                   <div className="flex items-center gap-3">
                                       <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${customGroupForm.members.includes(s.profile_id) ? 'bg-white/20' : 'bg-slate-200'}`}>{s.v2_profiles?.full_name?.charAt(0) || '?'}</div>
                                       <span className="font-bold text-sm">{s.v2_profiles?.full_name || 'Anonymous'}</span>
                                   </div>
                                   <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${customGroupForm.members.includes(s.profile_id) ? 'border-white bg-white text-blue-600' : 'border-slate-300'}`}>
                                       {customGroupForm.members.includes(s.profile_id) && <Check size={12} strokeWidth={4}/>}
                                   </div>
                               </button>
                           ))}
                       </div>
                   </div>
                </div>

                <div className="p-8 border-t border-slate-100 bg-slate-50 flex gap-4 shrink-0">
                   <Button onClick={handleSaveCustomGroup} className="flex-1 h-16 rounded-[24px] bg-blue-600 hover:bg-blue-700 text-white font-black shadow-xl shadow-blue-500/20 transition-all">
                      Save Database
                   </Button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🛸 REAL-TIME ONLINE NOTIFICATIONS (TOASTS) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-3 pointer-events-none">
         <AnimatePresence>
            {toasts.map((toast) => (
               <motion.div
                  key={toast.id}
                  initial={{ opacity: 0, y: 50, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                  className="px-6 py-4 bg-[#0F172A]/90 backdrop-blur-2xl border border-white/10 rounded-[28px] shadow-2xl flex items-center gap-4 min-w-[320px] pointer-events-auto"
               >
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center p-0.5 border border-blue-400/30 overflow-hidden">
                     {toast.avatar ? (
                        <img src={toast.avatar} className="w-full h-full object-contain" alt=""/>
                     ) : (
                        <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center text-white font-black text-xs">
                           {toast.name.charAt(0)}
                        </div>
                     )}
                  </div>
                  <div className="flex-1">
                     <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Live Connection</p>
                     <p className="text-sm font-black text-white">{toast.name} <span className="text-emerald-400 ml-1">Joined</span></p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]"/>
               </motion.div>
            ))}
         </AnimatePresence>
      </div>

       {/* PHOTO LIGHTBOX (Preview) */}
       <AnimatePresence>
         {lightboxImg && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={() => setLightboxImg(null)}
             className="fixed inset-0 z-[500] flex items-center justify-center p-6 md:p-12 bg-slate-950/90 backdrop-blur-2xl cursor-zoom-out"
           >
             <motion.div
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               onClick={(e) => e.stopPropagation()}
               className="relative w-full max-w-5xl max-h-[90vh] flex items-center justify-center"
             >
               <img 
                 src={lightboxImg} 
                 alt="Lightbox Preview" 
                 className="w-auto h-auto max-w-full max-h-[85vh] rounded-[32px] shadow-2xl border border-white/10"
               />
               <button 
                 onClick={() => setLightboxImg(null)}
                 className="absolute top-4 right-4 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl text-white hover:bg-white/20 transition-all shadow-2xl"
               >
                 <X size={24}/>
               </button>
             </motion.div>
           </motion.div>
         )}
        </AnimatePresence>

        {/* CREDENTIAL GENERATION CONFIRMATION MODAL */}
        <AnimatePresence>
          {isCredentialModalOpen && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
              <motion.div 
                 initial={{ scale: 0.9, opacity: 0, y: 20 }}
                 animate={{ scale: 1, opacity: 1, y: 0 }}
                 exit={{ scale: 0.9, opacity: 0, y: 20 }}
                 className="bg-white rounded-[44px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-white/20"
              >
                 <div className="p-10 text-center space-y-6">
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                       <Award size={36}/>
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">Generate Credentials?</h3>
                       <p className="text-slate-400 text-sm font-medium px-4 text-center">
                          Sistem akan membuat nomor seri otomatis untuk seluruh siswa. Data yang sudah ada sebelumnya akan ditimpa.
                       </p>
                    </div>
                    <div className="flex flex-col gap-3">
                       <Button 
                          onClick={executeAutoGenerateCredentials}
                          className="h-14 rounded-2xl bg-blue-600 text-white font-black text-sm shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-all"
                       >
                          Ya, Generate Sekarang
                       </Button>
                       <Button 
                          onClick={() => setIsCredentialModalOpen(false)}
                          className="h-14 rounded-2xl bg-slate-50 text-slate-400 font-bold text-sm hover:bg-slate-100 transition-all border-none"
                       >
                          Batalkan
                       </Button>
                    </div>
                 </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* CREDENTIAL SUCCESS MODAL */}
        <AnimatePresence>
          {isCredentialSuccess && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
              <motion.div 
                 initial={{ scale: 0.9, opacity: 0, y: 20 }}
                 animate={{ scale: 1, opacity: 1, y: 0 }}
                 exit={{ scale: 0.9, opacity: 0, y: 20 }}
                 className="bg-white rounded-[44px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-white/20"
              >
                 <div className="p-10 text-center space-y-6">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                       <CheckCircle2 size={36}/>
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">Kredensial Berhasil! 🎉</h3>
                       <p className="text-slate-400 text-sm font-medium px-4 text-center">
                          Nomor kredensial telah berhasil dihasilkan untuk semua siswa di batch ini. 🚀✨
                       </p>
                    </div>
                    <Button 
                       onClick={() => setIsCredentialSuccess(false)}
                       className="h-14 rounded-2xl bg-slate-900 text-white font-black text-sm shadow-xl hover:scale-[1.02] transition-all"
                    >
                       Mantap, Tutup
                    </Button>
                 </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

    </div>
  );
}
