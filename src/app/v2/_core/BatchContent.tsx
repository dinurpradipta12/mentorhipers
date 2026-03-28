"use client";



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
  ShuffleIcon,
  ArrowRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
// Server Actions replaced with fetch calls to Edge-compatible API routes

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
         d: Math.floor(distance / (1000 * 60 * 60 * 24)),
         h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
         m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
         s: Math.floor((distance % (1000 * 60)) / 1000)
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

export default function BatchContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter(); 
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
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  
  // Registration Modal State
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ fullName: '', username: '', password: '' });

  // LMS Management State
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
  
  // Registration Success Interaction
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [regSuccessData, setRegSuccessData] = useState<any>(null);

  // Quiz & Submission Interaction
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
  const [gradingConfig, setGradingConfig] = useState<any>({
     post_test_weight: 40,
     assignment_weight: 40,
     challenge_weight: 10,
     attendance_weight: 10
  });

  const [activeQuizReview, setActiveQuizReview] = useState<any>(null);
  const [isQuizReviewModalOpen, setIsQuizReviewModalOpen] = useState(false);
  const [viewingCurriculum, setViewingCurriculum] = useState<any>(null);

  // Results Modal
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [lastQuizResult, setLastQuizResult] = useState<number>(0);

  // Student Management State
  const [studentActionTarget, setStudentActionTarget] = useState<any>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const [editStudentName, setEditStudentName] = useState('');
  const [certUrl, setCertUrl] = useState('');
  const [moveGroupTarget, setMoveGroupTarget] = useState('');

  useEffect(() => {
    const initPage = async () => {
      setIsLoading(true);
      console.log("🚀 Starting V2 Batch Initialization...");
      await fetchUserData();
      
      await Promise.all([
        fetchBatchDetail(),
        fetchCurriculum(),
        fetchStudents(),
        fetchAllSubmissions()
      ]);
      console.log("✅ Initialization Complete.");
      setIsLoading(false);
    };
    
    initPage();

    // Restore last active tab from localStorage
    const savedTab = localStorage.getItem(`batch_tab_${resolvedParams.id}`);
    if (savedTab) setActiveTab(savedTab);

    // 3. Realtime Listener for Instant Presence Updates
    const channel = supabase
      .channel('attendance_sync')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'v2_memberships',
        filter: `workspace_id=eq.${resolvedParams.id}`
      }, (payload) => {
        console.log("⚡ Realtime Membership Update:", payload.new.id);
        setStudents(prev => prev.map(s => s.id === payload.new.id ? { ...s, ...payload.new } : s));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [resolvedParams.id]);

   const fetchUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    // 2. CHECK LEGACY BYPASS (From localStorage)
    const legacyAdmin = typeof window !== 'undefined' ? localStorage.getItem('v2_legacy_admin') === 'true' : false;
    const isArunika = (user?.email?.toLowerCase().includes('arunika')) || legacyAdmin;

    if (isArunika) {
       setCurrentUser({ full_name: 'Admin Arunika', role: 'admin', email: user?.email || 'arunika@legacy' });
       const savedTab = typeof window !== 'undefined' ? localStorage.getItem(`batch_tab_${resolvedParams.id}`) : null;
       if (!savedTab) setActiveTab('students');
    }

    if (!user && !legacyAdmin) return;

    try {
      if (user) {
         const { data: profile } = await supabase.from('v2_profiles').select('*').eq('id', user.id).single();
         
         if (profile) {
           const updatedUser = { ...profile, email: user.email, role: isArunika ? 'admin' : profile.role };
           setCurrentUser(updatedUser);
           
           if (updatedUser.role === 'student' && !isArunika) {
              router.push(`/v2/portal/${resolvedParams.id}`);
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
     // Fetch all submissions for the whole batch for Matrix calculation
     const { data: subData } = await supabase
       .from('v2_submissions')
       .select('*, v2_profiles(full_name)')
       .eq('workspace_id', resolvedParams.id);
     
     const { data: qData } = await supabase
       .from('v2_quiz_results')
       .select('*, v2_profiles(full_name)')
       .eq('workspace_id', resolvedParams.id);
       
     let combined: any[] = [];
     if (subData) combined = [...subData];
     if (qData) combined = [...combined, ...qData];
     
     setAllSubmissions(combined);
  };

  const handleShare = () => {
    // Masking '/v2/' from student portal link
    const shareUrl = `${window.location.origin}/portal/${resolvedParams.id}`;
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
           const grIdx = Math.floor(i / (Math.ceil(students.length / num)));
           const gName = `Team ${String.fromCharCode(65 + grIdx)}`; // Team A, B, C...
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

  // --- STUDENT MANAGEMENT HANDLERS ---
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

      const res = await fetch('/api/v2/update-schedules', {
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

      const res = await fetch('/api/v2/update-schedules', {
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
      // Call Edge API Route (replacing Server Action - Cloudflare Pages compatible)
      const response = await fetch('/api/v2/register-student', {
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
      
      const loginUrl = `${window.location.origin}/v2/login`;
      const waMessage = `Halo ${newStudent.fullName}! Selamat bergabung di ${batch?.name || "Mentorhipers"}.\n\nSilakan login di ${loginUrl} dengan detail berikut:\nUsername: ${newStudent.username}\nPassword: ${newStudent.password}\n\nSelamat belajar! 🚀`;

      // Simpan data kreden untuk modal sukses
      setRegSuccessData({
        ...newStudent,
        waMessage,
        batchName: batch?.name
      });
      
      setIsRegModalOpen(false);
      setIsSuccessModalOpen(true);
      setNewStudent({ fullName: '', username: '', password: '' });
      
      // Refresh list
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

     setIsLoading(true);
     try {
        if (editingLmsItem && editingLmsItem.id) {
           const { error } = await supabase.from('v2_curriculums').update(lmsForm).eq('id', editingLmsItem.id);
           if (error) throw error;
        } else {
           const { error } = await supabase.from('v2_curriculums').insert([{ ...lmsForm, workspace_id: resolvedParams.id }]);
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
        // Enforce 1x attempt
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

        const score = Math.round((correctCount / questions.length) * 100);

        // 1. Save Result
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

        // 2. Sync to Grading Matrix (v2_memberships)
        // Find which index this quiz belongs to (e.g. PT1, PT2, etc) based on module name or order
        const ptIndex = curriculum.filter(c => c.type === 'post_test').findIndex(c => c.id === activeQuiz.id);
        
        if (ptIndex !== -1) {
           const myMembership = students.find(s => s.profile_id === currentUser.id);
           if (myMembership) {
              const newGrades = { ...myMembership.grades };
              if (!newGrades.post_tests) newGrades.post_tests = [0,0,0,0,0,0];
              newGrades.post_tests[ptIndex] = score;
              
              await supabase.from('v2_memberships').update({ grades: newGrades }).eq('id', myMembership.id);
              fetchStudents(); // Refresh local students state
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
        const table = c.type === 'post_test' ? 'v2_quiz_results' : 'v2_submissions';
        const { data, error } = await supabase
           .from(table)
           .select('*, v2_profiles(full_name, avatar_url)')
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
        fetchAllSubmissions(); // Update global state
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
        fetchAllSubmissions(); // Update global state

        // CASCADING LOGIC FOR GROUP CHALLENGES
        // ... (Keep existing logic)
        const currentSub = submissionsData.find(s => s.id === subId);
        const task = curriculum.find(t => t.id === currentSub?.curriculum_id);
        
        if (task?.type === 'challenge') {
           const studentMembership = students.find(s => s.profile_id === currentSub?.profile_id);
           if (studentMembership?.is_leader && studentMembership.group_name) {
              const members = students.filter(s => s.group_name === studentMembership.group_name && !s.is_leader);
              for (const m of members) {
                 const attendanceCount = Object.values(m.attendance || {}).filter(v => v === 'P').length;
                 if (attendanceCount >= 10) { 
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

         // Bulk update grades via promise.all or a custom RPC
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
    const { data } = await supabase.from('v2_workspaces').select('*').eq('id', resolvedParams.id).single();
    if (data) setBatch(data);
  };

  const fetchStudents = async () => {
    try {
      console.log(`🔍 Querying students for Workspace ID: ${resolvedParams.id}`);
      const { data, error } = await supabase
        .from('v2_memberships')
        .select('*, v2_profiles(*)')
        .eq('workspace_id', resolvedParams.id);
      
      if (error) {
        console.error("❌ Fetch Students Error:", error.message);
        return;
      }
      
      console.log(`👥 Found ${data?.length || 0} students for this batch.`);
      if (data) setStudents(data);
    } catch (err: any) {
      console.error("❌ Unexpected Error in fetchStudents:", err.message);
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
         // Auto-select first material
         const firstMaterial = data.find((c: any) => c.type === 'material') || data[0];
         setSelectedLesson(firstMaterial);
      }
    }
  };

  if (!isLoading && !batch) return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-20 text-center space-y-6">
       <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center shadow-inner">
          <EyeOff size={32} />
       </div>
       <div>
          <h2 className="text-2xl font-black text-[#0F172A]">Akses Terbatas</h2>
          <p className="text-slate-400 font-medium max-w-sm mx-auto mt-2">Anda tidak memiliki izin untuk mengakses Batch ini. Silakan hubungi mentor jika ini adalah kesalahan.</p>
       </div>
       <Button onClick={() => window.location.href = '/v2/login'} className="bg-slate-900 text-white rounded-2xl h-14 px-8 font-bold">Back to Login</Button>
    </div>
  );

  const isAdmin = currentUser?.role === 'admin' || currentUser?.email?.includes('arunika');
  const isAdminView = isAdmin && !isPreviewMode;

  const TABS = [
    ...(isAdminView ? [{ id: "students", label: "Student List & Groups", icon: <Users size={16} /> }] : []),
    { id: "learning", label: isAdminView ? "Class Material (LMS)" : "Learning Journey", icon: <PlayCircle size={16} /> },
    { id: "assignments", label: isAdminView ? "Manage Tasks" : "My Assignments", icon: <ClipboardList size={16} /> },
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
            className="bg-emerald-500 text-white p-4 rounded-3xl flex items-center justify-center gap-3 font-bold text-xs shadow-lg shadow-emerald-500/20"
          >
            <Eye size={16} /> Simulasi tampilan murid (Preview mode)
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 py-10 px-10 bg-gradient-to-r from-[#0ea5e9] to-[#1e3a8a] rounded-[44px] text-white overflow-hidden relative shadow-2xl shadow-blue-900/20">
        {/* Glow */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-white/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-sky-300/20 blur-[100px] rounded-full" />

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            {isAdminView && (
              <Link href="/v2/batch" className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10 group">
                <ChevronRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
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
                                 <div className="relative">
                                   <button 
                                     onClick={(e) => {
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
                                     <MoreVertical size={18} />
                                   </button>
                                 </div>
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
                       <div className="space-y-8">
                          <div className="flex items-center justify-between">
                             <div className="space-y-1">
                                <h3 className="text-xl font-black text-[#0F172A]">Batch Ecosystem</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time Class Insights</p>
                             </div>
                             <Award className="text-amber-500" size={24} />
                          </div>

                          {/* 1. STAR STUDENT OF THE WEEK */}
                          {(() => {
                             // Logic: Highest average score + attendance this week
                             const analytics = students.map(mem => {
                                const sub = allSubmissions.filter(s => s.profile_id === mem.v2_profiles?.id);
                                let total = 0, count = 0;
                                curriculum.filter(t => t.type !== 'material').forEach(t => {
                                   const res = sub.find(s => s.curriculum_id === t.id);
                                   if (res) { total += (res.score || res.grade || 0); count++; }
                                });
                                const avg = count > 0 ? total / count : 0;
                                const attendanceCount = Object.values(mem.attendance || {}).filter(v => v === 'P').length;
                                return { mem, avg, attendance: attendanceCount };
                             }).sort((a, b) => b.avg - a.avg || b.attendance - a.attendance);

                             const star = analytics[0];
                             if (!star || star.avg === 0) return null;

                             return (
                                <div className="p-6 rounded-[32px] bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 relative overflow-hidden group">
                                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                                      <Star size={60} fill="currentColor" className="text-amber-500" />
                                   </div>
                                   <div className="relative z-10 flex items-center gap-4">
                                      <div className="w-14 h-14 rounded-2xl bg-white border-2 border-amber-200 flex items-center justify-center font-black text-amber-600 shadow-sm overflow-hidden">
                                         {star.mem.v2_profiles?.avatar_url ? (
                                            <img src={star.mem.v2_profiles.avatar_url} className="w-full h-full object-cover" />
                                         ) : star.mem.v2_profiles?.full_name?.charAt(0)}
                                      </div>
                                      <div>
                                         <div className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest w-fit mb-1 shadow-sm">Star Student</div>
                                         <h4 className="text-sm font-black text-slate-800">{star.mem.v2_profiles?.full_name}</h4>
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
                                      const avgAttendance = members.reduce((acc, m) => acc + Object.values(m.attendance || {}).filter(v => v === 'P').length, 0) / members.length;
                                      
                                      return (
                                         <div key={gName} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all">
                                            <div className="flex items-center gap-3">
                                               <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-blue-600 shadow-sm">
                                                  <Users size={14} />
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
                                      let riskScore = (absents * 2) + pending;
                                      return { mem, absents, pending, score: riskScore };
                                   }).filter(r => r.score > 2).sort((a, b) => b.score - a.score).slice(0, 2);

                                   if (risky.length === 0) return (
                                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                                         <CheckCircle2 size={14} className="text-emerald-500" />
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
                                            <MessageSquare size={14} />
                                         </button>
                                      </div>
                                   ));
                                })()}
                             </div>
                          </div>

                          <Button className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:scale-105 transition-all flex items-center justify-center gap-3 mt-4">
                             <Share2 size={16} /> Broadcast Batch Insight
                          </Button>
                       </div>
                    </Card>

                   <Card className="p-10 border-none shadow-xl shadow-slate-200/50 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-[44px] relative overflow-hidden">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
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
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
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
                                    src={selectedLesson.video_url}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                               ) : (
                                   <div className="w-full h-full flex flex-col items-center justify-center text-white relative">
                                      {/* Waiting Screen / Countdown */}
                                      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/40 to-slate-900 z-0 animate-pulse" />
                                      <div className="relative z-10 text-center space-y-8 p-12">
                                         <div className="w-24 h-24 bg-white/10 rounded-[32px] flex items-center justify-center mx-auto mb-10 border border-white/20 backdrop-blur-xl animate-bounce">
                                            <Play size={40} fill="white" className="ml-2" />
                                         </div>
                                         <div className="space-y-4">
                                            <h3 className="text-4xl font-black tracking-tighter">Live kelas akan dimulai dalam</h3>
                                            {selectedLesson.due_date ? (
                                               <Countdown targetDate={selectedLesson.due_date} />
                                            ) : (
                                               <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Waktu tayang belum dijadwalkan oleh mentor.</p>
                                            )}
                                         </div>
                                         <div className="pt-10">
                                            <div className="px-8 py-4 bg-white/5 rounded-2xl border border-white/10 inline-flex items-center gap-3">
                                               <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
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
                                  {selectedLesson.type === 'post_test' ? <FileText size={40} /> : <Target size={40} />}
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
                            <BookOpen size={64} className="mx-auto" />
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
                               <Plus size={20} />
                            </button>
                         ) : (
                            <Sparkles className="text-blue-500" size={20} />
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
                                        selectedLesson?.id === item.id ? <Play size={16} fill="white" /> : <PlayCircle size={18} />
                                     ) : item.type === 'post_test' ? (
                                        <FileText size={18} />
                                     ) : (
                                        <Target size={18} />
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
                                     <button onClick={(e) => { e.stopPropagation(); openLmsModal(item); }} className="p-2 bg-white shadow-lg rounded-lg text-slate-400 hover:text-blue-600 transition-all"><Edit size={14} /></button>
                                     <button onClick={(e) => { e.stopPropagation(); handleDeleteLms(item.id); }} className="p-2 bg-white shadow-lg rounded-lg text-slate-400 hover:text-rose-500 transition-all"><Trash2 size={14} /></button>
                                  </div>
                               )}
                            </div>
                         ))}
                      </div>
                   </Card>

                    {/* Class Assets */}
                    {selectedLesson && selectedLesson.assets_json && selectedLesson.assets_json.length > 0 && (
                       <Card className="p-10 border-none shadow-2xl shadow-blue-900/10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white rounded-[44px] space-y-8 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full pointer-events-none" />
                          <h3 className="text-xl font-black tracking-tight px-2">Classroom Assets</h3>
                          <div className="space-y-4">
                             {selectedLesson.assets_json.map((asset: any, i: number) => (
                                <a 
                                  key={i}
                                  href={asset.url}
                                  target="_blank"
                                  className="flex items-center justify-between p-6 rounded-[32px] bg-white/10 border border-white/10 hover:bg-white/20 transition-all group backdrop-blur-md shadow-lg"
                                >
                                   <div className="flex items-center gap-5">
                                      <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black shadow-lg shadow-blue-500/20"><Download size={20} /></div>
                                      <div className="space-y-1">
                                         <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Resource {i + 1}</p>
                                         <span className="text-sm font-bold tracking-tight">{asset.name}</span>
                                      </div>
                                   </div>
                                   <ChevronRight size={18} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                                </a>
                             ))}
                          </div>
                      </Card>
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
                        <Plus size={18} /> New Task
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
                                     {c.type === 'post_test' ? <FileText size={24} /> : <Target size={24} />}
                                  </div>
                                  <div>
                                     <h4 className="text-base md:text-lg font-black text-[#0F172A] group-hover:text-blue-600 transition-colors uppercase tracking-tight">{c.title}</h4>
                                     <div className="flex items-center gap-3 mt-1.5 opacity-60">
                                        <p className="text-[10px] font-black uppercase tracking-widest">{c.type.replace('_', ' ')}</p>
                                        <div className="w-1 h-1 rounded-full bg-slate-400" />
                                        <p className="text-[10px] font-bold">Due: {c.due_date ? new Date(c.due_date).toLocaleDateString() : 'No Deadline'}</p>
                                     </div>
                                  </div>
                               </div>
                               
                               <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                                  <div className="flex flex-col items-center justify-center px-4 md:border-r border-slate-100 md:mr-2">
                                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Submissions</p>
                                     <div className="flex items-end gap-1">
                                        <span className={`text-xl font-black leading-none ${isFullySubmitted ? 'text-emerald-500' : 'text-blue-600'}`}>{submittedCount}</span>
                                        <span className="text-sm font-bold text-slate-400 leading-none mb-0.5">/ {totalStudents}</span>
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
                                          {c.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                                          <span>{c.is_published ? 'LIVE' : 'DRAFT'}</span>
                                        </button>
                                        <button onClick={() => openLmsModal(c)} className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"><Edit size={16} /></button>
                                        <button onClick={() => handleDeleteLms(c.id)} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all"><Trash2 size={16} /></button>
                                     </div>
                                  )}
                                     <Button 
                                       onClick={() => isAdminView ? handleViewSubmissions(c) : handleTakeQuiz(c)}
                                       className={`h-12 px-6 rounded-[16px] font-black text-xs transition-all flex items-center gap-2 group/btn ${isFullySubmitted ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' : 'bg-slate-50 text-slate-500 hover:bg-blue-600 hover:text-white'}`}
                                     >
                                        {isAdminView ? 'View Submissions' : 'Submit Task'}
                                        <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                     </Button>
                                  </div>
                               </div>
                            </div>
                         </Card>
                         );
                      })
                   ) : (
                      <div className="p-20 text-center opacity-40">
                         <ClipboardList size={44} className="mx-auto mb-4" />
                         <p className="font-bold text-xs uppercase tracking-widest">Belum ada tugas yang aktif.</p>
                      </div>
                   )}
                </div>
             </div>
          )}

          {activeTab === 'grades' && (
             <div className="space-y-10">
                <div className="flex items-center justify-between px-6">
                   <div className="space-y-1">
                       <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">Grading Matrix Raport</h3>
                       <p className="text-xs text-slate-400 font-bold">Dynamic performance breakdown based on assignments and kuis.</p>
                    </div>
                 </div>

                 <Card className="p-0 border-none shadow-2xl shadow-slate-200/50 bg-white overflow-hidden rounded-[44px]">
                    <div className="overflow-x-auto">
                       {students.length > 0 ? (
                          <table className="w-full border-collapse">
                             <thead>
                                <tr className="bg-slate-900 text-white">
                                   <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest border-r border-white/5 sticky left-0 z-20 bg-slate-900">Student Profiles</th>
                                   
                                   {/* DINAMIS HEADER BERDASARKAN TUGAS */}
                                   {curriculum.filter(t => t.type !== 'material').map((c) => (
                                      <th key={c.id} className="px-6 py-6 text-center text-[10px] font-black uppercase tracking-widest min-w-[140px] border-r border-white/10">
                                         {c.title}
                                      </th>
                                   ))}

                                   <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white">AVG SCORE</th>
                                   <th className="px-8 py-4 text-center text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white">GRADE</th>
                                </tr>
                             </thead>
                             <tbody>
                                {students.map((mem) => {
                                   const studentSubmissions = allSubmissions.filter(s => s.profile_id === mem.v2_profiles?.id);
                                   // For quizzes, we need to fetch quiz results globally too. For now, we'll use a placeholder or assume they are part of allSubmissions if the schema allows.
                                   // Assuming quiz results are also in `allSubmissions` for simplicity, or a separate `allQuizResults` state would be needed.
                                   // For this implementation, I'll assume `allSubmissions` can contain both types if `grade` is present for non-quiz and `score` for quiz.
                                   // A more robust solution would fetch `v2_quiz_results` separately.
                                   
                                   let totalPT = 0, countPT = 0;
                                   let totalAssign = 0, countAssign = 0;
                                   let totalGC = 0, countGC = 0;
                                   
                                   const tasks = curriculum.filter(t => t.type !== 'material');
                                   
                                   const scores = tasks.map(t => {
                                      let score: number | null = null;
                                       
                                       // LETS WORK WITH AUTO-0 LOGIC
                                       // Threshold: Due Date + 24 Hours
                                       const now = new Date().getTime();
                                       const hasDueDate = !!t.due_date;
                                       const deadlineElapsed = hasDueDate ? (new Date(t.due_date).getTime() + 86400000) < now : false;

                                       if (t.type === 'post_test') {
                                          const quizResult = studentSubmissions.find(s => s.curriculum_id === t.id && s.score !== undefined); 
                                          score = quizResult ? (quizResult.score || 0) : (deadlineElapsed ? 0 : null);
                                       } else {
                                          const sub = studentSubmissions.find(s => s.curriculum_id === t.id);
                                          score = sub ? (sub.grade || 0) : (deadlineElapsed ? 0 : null);
                                       }
                                       
                                       // Aggregate for Summary (If Null, it means still waiting / grace period)
                                       const actualScore = score === null ? 0 : score;
                                       if (t.type === 'post_test') { totalPT += actualScore; countPT++; }
                                       else if (t.type === 'challenge') { totalGC += actualScore; countGC++; }
                                       else if (t.type === 'individual_assignment') { totalAssign += actualScore; countAssign++; }
                                       
                                       return { val: score, isAutoZero: (score === 0 && !studentSubmissions.find(s => s.curriculum_id === t.id)) };
                                    });

                                   const avgPT = countPT > 0 ? totalPT / countPT : 0;
                                   const avgAssign = countAssign > 0 ? totalAssign / countAssign : 0;
                                   const avgGC = countGC > 0 ? totalGC / countGC : 0;
                                   const attendCount = Object.values(mem.attendance || {}).filter(v => v === 'P').length;
                                   const modulesCount = curriculum.filter((c: any) => c.type === 'material').length;
                                   const totalSessions = modulesCount + 2; 
                                   const attendScore = totalSessions > 0 ? (attendCount / totalSessions) * 100 : 0;
                                   
                                   const plusPointsTotal = Object.values(mem.plus_points || {}).reduce((a: any, b: any) => (parseInt(a) || 0) + (parseInt(b) || 0), 0) as number;
                                   const finalKeaktifan = Math.min(100, attendScore + plusPointsTotal);

                                   const finalAvg = (
                                      (avgPT * gradingConfig.post_test_weight) +
                                      (avgAssign * gradingConfig.assignment_weight) +
                                      (avgGC * gradingConfig.challenge_weight) +
                                      (finalKeaktifan * gradingConfig.attendance_weight)
                                   ) / (gradingConfig.post_test_weight + gradingConfig.assignment_weight + gradingConfig.challenge_weight + gradingConfig.attendance_weight);
                                   
                                   const getGrading = (avg: number) => {
                                      if (avg >= 90) return { label: 'A+ (Superstar)', color: 'text-purple-600 bg-purple-50' };
                                      if (avg >= 85) return { label: 'A (Very Good)', color: 'text-indigo-600 bg-indigo-50' };
                                      if (avg >= 80) return { label: 'B+ (Good)', color: 'text-blue-600 bg-blue-50' };
                                      if (avg >= 70) return { label: 'B (Average)', color: 'text-amber-600 bg-amber-50' };
                                      if (avg >= 60) return { label: 'C (Below Avg)', color: 'text-orange-600 bg-orange-50' };
                                      return { label: 'D (Very Poor)', color: 'text-rose-600 bg-rose-50' };
                                   };
                                   const grade = getGrading(finalAvg);

                                   return (
                                      <tr key={mem.id} className="border-b border-slate-100 hover:bg-slate-50 transition-all">
                                         <td className="px-8 py-5 border-r border-slate-100 bg-slate-50/50 sticky left-0 z-10">
                                            <div className="flex items-center gap-4">
                                               <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-[10px] text-slate-400">
                                                  {mem.v2_profiles?.full_name?.charAt(0)}
                                               </div>
                                               <p className="text-sm font-black text-[#0F172A]">{mem.v2_profiles?.full_name}</p>
                                            </div>
                                         </td>
                                         {scores.map((s: any, idx) => {
                                             const t = tasks[idx];
                                             if (t.type === 'post_test') {
                                                const qr = studentSubmissions.find(si => si.curriculum_id === t.id && si.score !== undefined);
                                                return (
                                                   <td key={idx} className="px-6 py-4 text-center border-r border-slate-100">
                                                      {qr ? (
                                                         <button 
                                                            onClick={() => { setActiveQuizReview(qr); setIsQuizReviewModalOpen(true); }}
                                                            className="px-4 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-[14px] font-black text-xs transition-all ring-1 ring-blue-100 shadow-sm"
                                                         >
                                                            {qr.score} Point
                                                         </button>
                                                      ) : (
                                                         s.isAutoZero ? (
                                                           <div className="flex flex-col items-center">
                                                              <span className="text-xl font-black text-rose-500">0</span>
                                                              <span className="text-[8px] font-black text-rose-300 uppercase leading-none">ABSENT/TIMEOUT</span>
                                                           </div>
                                                         ) : (
                                                           <span className="text-slate-200 font-bold">-</span>
                                                         )
                                                      )}
                                                   </td>
                                                );
                                             } else {
                                                const sub = studentSubmissions.find(si => si.curriculum_id === t.id);
                                                return (
                                                   <td key={idx} className="px-6 py-4 text-center border-r border-slate-100">
                                                      {sub ? (
                                                        <span className="text-sm font-bold text-slate-600">{sub.grade}</span>
                                                      ) : (
                                                        s.isAutoZero ? (
                                                           <div className="flex flex-col items-center">
                                                              <span className="text-xl font-black text-rose-500">0</span>
                                                              <span className="text-[8px] font-black text-rose-300 uppercase leading-none">ABSENT/TIMEOUT</span>
                                                           </div>
                                                        ) : (
                                                          <span className="text-slate-200 font-bold">-</span>
                                                        )
                                                      )}
                                                   </td>
                                                );
                                             }
                                          })}
                                         <td className="px-8 py-5 text-center bg-blue-50/20 text-blue-600 font-black text-xl border-r border-slate-100">{Math.round(finalAvg)}</td>
                                         <td className="px-8 py-5 text-center border-r border-slate-100">
                                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase whitespace-nowrap ${grade.color}`}>
                                               {grade.label}
                                            </span>
                                         </td>
                                      </tr>
                                   );
                                })}
                             </tbody>
                          </table>
                       ) : (
                          <div className="p-40 text-center">
                             <BarChart4 size={44} className="mx-auto mb-4 opacity-10" />
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
                                <tr className="bg-slate-900 text-white">
                                   <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest sticky left-0 z-20 bg-slate-900">Student Profiles</th>
                                   {['Diskusi', 'Aktif Grup', 'Challenge Presence', 'Presentation'].map(cat => (
                                      <th key={cat} className="px-6 py-6 text-center text-[10px] font-black uppercase text-blue-200/60">{cat}</th>
                                   ))}
                                   <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white">TOTAL BONUS</th>
                                </tr>
                             </thead>
                             <tbody>
                                {students.map((mem) => {
                                   const plus = (mem.plus_points || {}) as any;
                                   const sumPlus = Object.values(plus).reduce((a: any, b: any) => (parseInt(a) || 0) + (parseInt(b) || 0), 0);

                                   return (
                                      <tr key={mem.id} className="border-b border-slate-100 hover:bg-slate-50 transition-all">
                                         <td className="px-8 py-4 border-r border-slate-100 sticky left-0 z-10 bg-slate-50/50">
                                            <p className="text-xs font-black text-slate-900">{mem.v2_profiles?.full_name}</p>
                                         </td>
                                         {['Diskusi', 'Aktif Grup', 'Challenge Presence', 'Presentation'].map(cat => (
                                            <td key={cat} className="px-4 py-4 text-center border-r border-slate-100">
                                               <input 
                                                  type="number"
                                                  defaultValue={plus[cat] || 0}
                                                  onBlur={(e) => handleSavePlusPoints(mem.id, cat, e.target.value)}
                                                  className="w-16 h-10 border-none bg-transparent text-center font-black text-blue-600 focus:bg-white focus:ring-2 ring-blue-500/10 rounded-xl"
                                               />
                                            </td>
                                         ))}
                                         <td className="px-8 py-4 text-center bg-emerald-50 text-emerald-600 font-black text-sm">+{sumPlus as any}</td>
                                      </tr>
                                   )
                                })}
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
                      <Check size={18} /> Sync Attendance
                   </Button>
                </div>

                <Card className="p-0 border-none shadow-2xl shadow-slate-200/50 bg-white overflow-hidden rounded-[44px]">
                   <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                           <tr className="bg-slate-900 text-white">
                              <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest border-r border-white/5 sticky left-0 z-20 bg-slate-900">Student Name</th>
                              {(() => {
                                 const modules = curriculum.filter((c: any) => c.type === 'material').map((c: any) => c.title);
                                 const specials = ['Present Day', 'Graduation'];
                                 const allSlots = [...modules, ...specials];
                                 return allSlots.map((label, i) => (
                                    <th key={i} className="w-16 min-w-[64px] px-2 py-4 text-center text-[8px] font-black border-r border-white/5 whitespace-nowrap uppercase tracking-tighter opacity-60">{label}</th>
                                 ));
                              })()}
                              <th className="px-8 py-4 text-center text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white">Total</th>
                           </tr>
                        </thead>
                        <tbody>
                           {students.map((mem) => {
                              const att = mem.attendance || {};
                              const presentCount = Object.values(att).filter(v => v === 'P').length;

                              return (
                                 <tr key={mem.id} className="border-b border-slate-100 hover:bg-slate-50 transition-all">
                                    <td className="px-8 py-5 text-sm font-black text-[#0F172A] border-r border-slate-100 bg-slate-50/50 sticky left-0 z-10">{mem.v2_profiles?.full_name}</td>
                                    {(() => {
                                       const modulesCount = curriculum.filter((c: any) => c.type === 'material').length;
                                       const totalSlots = modulesCount + 2; 
                                       return [...Array(totalSlots)].map((_, i) => {
                                          const sessionId = `s${i+1}`;
                                          const status = att[sessionId] || '-';
                                          const getBadge = (st: string) => {
                                             if (st === 'P') return <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20"><Check size={14} strokeWidth={4} /></div>;
                                             if (st === 'S') return <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-[10px]">S</div>;
                                             if (st === 'I') return <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black text-[10px]">I</div>;
                                             if (st === 'A') return <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black text-[10px]">A</div>;
                                             return <span className="opacity-10 text-[10px] font-black">·</span>;
                                          };

                                          return (
                                             <td key={i} className="w-16 min-w-[64px] text-center border-r border-slate-100 group/cell relative p-0">
                                                <div className="flex items-center justify-center h-14">
                                                   <button 
                                                     onClick={() => {
                                                        const newAtt = { ...mem.attendance || {} };
                                                        const current = newAtt[sessionId];
                                                        newAtt[sessionId] = current === 'P' ? 'A' : current === 'A' ? 'S' : current === 'S' ? '-' : 'P';
                                                        setStudents(students.map(s => s.id === mem.id ? { ...s, attendance: newAtt } : s));
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
                                    <td className="px-8 py-5 text-center font-black text-emerald-600 bg-emerald-50/30">{presentCount}</td>
                                 </tr>
                              );
                           })}
                        </tbody>
                      </table>
                      {students.length === 0 && (
                         <div className="p-20 text-center">
                            <CheckCircle2 size={44} className="mx-auto mb-4 opacity-10" />
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
                <button onClick={() => setIsRegModalOpen(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all"><X size={24} /></button>
              </div>

              <div className="p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">FULL NAME</label>
                  <input 
                    value={newStudent.fullName || ''}
                    onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
                    placeholder="e.g. Budi Santoso"
                    className="w-full h-14 rounded-2xl bg-neutral-50 px-6 font-bold text-sm border border-slate-100 focus:outline-none focus:ring-2 ring-blue-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">UNIQUE USERNAME</label>
                  <input 
                    value={newStudent.username || ''}
                    onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value.toLowerCase().trim() })}
                    placeholder="e.g. budisantoso"
                    className="w-full h-14 rounded-2xl bg-neutral-50 px-6 font-bold text-sm border border-slate-100 focus:outline-none focus:ring-2 ring-blue-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">TEMP PASSWORD</label>
                  <input 
                    value={newStudent.password || ''}
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
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />

               <div className="p-14 relative z-10 space-y-10 text-center">
                  <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[36px] flex items-center justify-center mx-auto shadow-inner">
                     <CheckCircle2 size={44} />
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
                        <Share2 size={24} /> Copy WA Message
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
                     <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Settings size={24} /></div>
                     <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">{editingLmsItem ? 'Edit Curriculum' : 'Add New Curriculum'}</h3>
                  </div>
                  <button onClick={() => setIsLmsModalOpen(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all"><X size={24} /></button>
               </div>

               <div className="p-10 overflow-y-auto space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">ITEM TYPE</label>
                        <select 
                           value={lmsForm.type}
                           onChange={(e) => setLmsForm({ ...lmsForm, type: e.target.value })}
                           className="w-full h-14 rounded-2xl bg-neutral-50 px-6 font-bold text-sm border border-slate-100 focus:outline-none focus:ring-2 ring-blue-500/20"
                        >
                           <option value="material">Video Material</option>
                           <option value="post_test">Post Test</option>
                           <option value="individual_assignment">Individual Task</option>
                           <option value="challenge">Group Challenge</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">MODULE NAME</label>
                        <input 
                           value={lmsForm.module_name || ''}
                           onChange={(e) => setLmsForm({ ...lmsForm, module_name: e.target.value })}
                           placeholder="e.g. Modul 01: Fundamental"
                           className="w-full h-14 rounded-2xl bg-neutral-50 px-6 font-bold text-sm border border-slate-100 focus:outline-none focus:ring-2 ring-blue-500/20"
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
                           className="w-full h-14 rounded-2xl bg-neutral-50 px-6 font-bold text-sm border border-slate-100 focus:outline-none focus:ring-2 ring-blue-500/20"
                        />
                     </div>
                      <div className="space-y-2">
                         <label className={`text-[10px] font-black uppercase tracking-widest ml-2 ${lmsForm.type === 'material' ? 'text-blue-500' : 'text-rose-500'}`}>
                            {lmsForm.type === 'material' ? 'LIVE CLASS DATE (COUNTDOWN)' : 'SET DEADLINE (DUE DATE)'}
                         </label>
                         <input 
                            type="datetime-local"
                            value={lmsForm.due_date ? new Date(new Date(lmsForm.due_date).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                            onChange={(e) => setLmsForm({ ...lmsForm, due_date: e.target.value })}
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
                           className="w-full h-14 rounded-2xl bg-neutral-50 px-6 font-bold text-sm border border-slate-100 focus:outline-none focus:ring-2 ring-blue-500/20"
                        />
                     </div>
                  )}

                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">CONTENT / DESCRIPTION</label>
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
                           {lmsForm.is_published ? <Eye size={20} /> : <EyeOff size={20} />}
                           {lmsForm.is_published ? 'READY TO PUBLISH (LIVE)' : 'SAVE AS DRAFT (HIDDEN)'}
                        </button>
                     </div>
                  </div>

                  {/* QUIZ BUILDER (If Post Test) */}
                  {lmsForm.type === 'post_test' && (
                     <div className="p-10 rounded-[44px] bg-slate-900 space-y-8">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20"><Sparkles size={20} /></div>
                              <h4 className="text-xl font-black text-white px-2">Quiz Builder Engine</h4>
                           </div>
                           <button 
                             onClick={() => {
                                const newQuiz = { ...lmsForm.quiz_data || { questions: [] } };
                                newQuiz.questions = [...(newQuiz.questions || []), { id: Date.now(), text: '', options: ['', ''], correct: 0 }];
                                setLmsForm({ ...lmsForm, quiz_data: newQuiz });
                             }}
                             className="h-12 px-6 rounded-xl bg-white/10 text-white text-xs font-black hover:bg-white/20 transition-all border border-white/10"
                           >+ Add Question</button>
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
                                 ><Trash2 size={16} /></button>

                                  <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Question {qi + 1}</label>
                                    <input 
                                       value={q.text || ''}
                                       onChange={(e) => {
                                          const newQuiz = { ...lmsForm.quiz_data };
                                          newQuiz.questions[qi].text = e.target.value;
                                          setLmsForm({ ...lmsForm, quiz_data: newQuiz });
                                       }}
                                       placeholder="What is the color of the sky?"
                                       className="w-full h-14 rounded-2xl bg-white/5 border border-white/5 px-6 text-white font-bold text-sm focus:border-blue-500/40 focus:outline-none transition-all"
                                    />
                                 </div>

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
                                             <Check size={14} />
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
                              <button onClick={() => setLmsForm({ ...lmsForm, assets_json: (lmsForm.assets_json || []).filter((_: any, idx: number) => idx !== i) })} className="p-3 text-rose-500"><Trash2 size={16} /></button>
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
                         <FileText size={32} />
                      </div>
                      <div>
                         <h2 className="text-2xl font-black text-[#0F172A] tracking-tighter">{activeQuiz.title}</h2>
                         <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{activeQuiz.module_name || "Assessment"}</p>
                      </div>
                   </div>
                   <button onClick={() => setIsQuizModalOpen(false)} className="p-4 bg-slate-50 rounded-2xl text-slate-300 hover:text-rose-500 transition-all">
                      <X size={24} />
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
                                     {quizAnswers[qi] === oi && <Check size={12} strokeWidth={4} />}
                                  </div>
                               </button>
                            ))}
                         </div>
                      </div>
                   ))}
                </div>

                <div className="p-10 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                   <p className="text-sm font-bold text-slate-400">
                      Answered: <span className="text-blue-600">{Object.keys(quizAnswers).length}</span> / {activeQuiz.quiz_data.questions.length}
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
                         <Users size={32} />
                      </div>
                      <div>
                         <h2 className="text-2xl font-black text-[#0F172A] tracking-tighter">Student Submissions</h2>
                         <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{viewingCurriculum.title}</p>
                      </div>
                   </div>
                   <button onClick={() => setIsSubmissionsModalOpen(false)} className="p-4 bg-slate-50 rounded-2xl text-slate-300 hover:text-rose-500 transition-all">
                      <X size={24} />
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                   {submissionsData.length > 0 ? (
                      <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                         {submissionsData.map((sub, i) => (
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
                                       <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-inner flex items-center justify-center font-black text-xs text-slate-400 uppercase overflow-hidden shrink-0">
                                          {sub.v2_profiles?.avatar_url ? (
                                             <img src={sub.v2_profiles.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                          ) : (
                                             <span className="text-slate-300">{sub.v2_profiles?.full_name?.charAt(0) || 'S'}</span>
                                          )}
                                       </div>
                                       <div>
                                          <h4 className="font-black text-slate-900 group-hover:text-blue-700 transition-colors duration-300">{sub.v2_profiles?.full_name || 'Anonymous'}</h4>
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(sub.created_at).toLocaleString()}</p>
                                       </div>
                                    </div>
                                   {viewingCurriculum?.type === 'post_test' ? (
                                      <div className="px-5 py-2 rounded-2xl bg-emerald-50 text-emerald-600 font-bold text-xs">
                                         PASSED
                                      </div>
                                   ) : (
                                      <button 
                                        onClick={() => handlePreviewSub(sub)}
                                        className="h-12 px-6 rounded-2xl bg-blue-600 text-white font-black text-[10px] uppercase flex items-center gap-2 hover:bg-slate-900 transition-all"
                                      >
                                         Preview Link <Download size={14} />
                                      </button>
                                   )}
                                </div>

                                {viewingCurriculum?.type === 'post_test' ? (
                                 <div className="space-y-1 flex items-end justify-between">
                                    <div>
                                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">FINAL SCORE</p>
                                       <div className="text-4xl font-black text-emerald-500 tracking-tighter group-hover:text-amber-500 transition-colors leading-none">{sub.score}</div>
                                    </div>
                                    <div className="px-5 py-2.5 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 shadow-sm border border-blue-100">
                                       Inspect Quiz <ArrowRight size={12} />
                                    </div>
                                 </div>
                              ) : (
                                <div className="space-y-8">
                                   {viewingCurriculum?.type === 'challenge' && (
                                      <div className="p-8 rounded-[36px] bg-blue-50/50 border border-blue-100 space-y-6">
                                         <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><Sparkles size={14} /> Group Criterion Breakdown</p>
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
                                                            const avg = Math.round(Object.values(newScores).reduce((a: number, b: unknown) => a + (b as number), 0) / 4);
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
                                            onClick={() => {
                                               const avg = sub.grade || 0;
                                               handleSaveGrade(sub.id, avg.toString(), sub.criteria_scores);
                                               alert("Group Assessment Saved! 🛸");
                                            }}
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
                                               defaultValue={sub.grade}
                                               onChange={(e) => {
                                                  setSubmissionsData(prev => prev.map(s => s.id === sub.id ? { ...s, grade: parseInt(e.target.value) } : s));
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
                            <Clock size={40} />
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
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />
                
                <div className="space-y-4">
                   <div className={`w-24 h-24 rounded-[36px] mx-auto flex items-center justify-center shadow-2xl ${lastQuizResult >= 80 ? 'bg-emerald-500 text-white shadow-emerald-500/30' : lastQuizResult >= 60 ? 'bg-blue-600 text-white shadow-blue-600/30' : 'bg-rose-500 text-white shadow-rose-500/30'}`}>
                      {lastQuizResult >= 80 ? <Award size={48} /> : lastQuizResult >= 60 ? <Check size={48} strokeWidth={3} /> : <Zap size={48} />}
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
                         <Users size={32} />
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
                         <Zap size={14} /> Magic Shuffle (5 Teams)
                      </button>
                      <button 
                        onClick={() => setIsGroupModalOpen(false)}
                        className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"
                      >
                         <X size={20} />
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
                                              {gn !== 'Unassigned' && <Edit size={14} className="opacity-0 group-hover:opacity-100 transition-all hover:text-indigo-600 text-slate-300" />}
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
                                              {s.is_leader ? <Star size={12} fill="white" /> : s.v2_profiles?.full_name?.charAt(0)}
                                           </div>
                                           <span className="text-xs font-bold text-slate-700">{s.v2_profiles?.full_name}</span>
                                        </div>
                                        <button 
                                          onClick={() => handleToggleLeader(s.id, !!s.is_leader)}
                                          className={`p-2 rounded-lg transition-all ${s.is_leader ? 'text-amber-500 bg-amber-50' : 'text-slate-200 hover:text-amber-500 hover:bg-amber-50'}`}
                                        >
                                           <Award size={14} />
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
                         <CalendarCheck size={32} />
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
                      <X size={20} />
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
                            placeholder="Meeting Link (Zoom / GMeet)" 
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
                               <CalendarDays size={48} className="mx-auto mb-4" />
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
                                           <Clock size={10} /> {sch.time}
                                           {sch.meet_link && <span className="text-emerald-500 bg-emerald-50 px-2 rounded ml-2">Has Link</span>}
                                        </p>
                                     </div>
                                  </div>
                                  <button 
                                     onClick={() => handleDeleteSchedule(sch.id)}
                                     className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                  >
                                     <Trash2 size={14} />
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
            <div className="fixed inset-0 z-[150]" onClick={() => setOpenActionMenuId(null)} />
            <div
              className="fixed z-[151] w-56 bg-white border border-slate-100 rounded-3xl shadow-2xl shadow-slate-300/40 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
              style={{ top: menuPos.top, right: menuPos.right }}
            >
              <button onClick={() => { setStudentActionTarget({ ...mem, mode: 'cert' }); setCertUrl(mem.certificate_url || ''); setOpenActionMenuId(null); }} className="w-full flex items-center gap-3 px-5 py-4 text-xs font-bold text-slate-600 hover:bg-amber-50 hover:text-amber-600 transition-all text-left">
                <Medal size={15} /> Upload Sertifikat
              </button>
              <button onClick={() => { setStudentActionTarget({ ...mem, mode: 'name' }); setEditStudentName(mem.v2_profiles?.full_name || ''); setOpenActionMenuId(null); }} className="w-full flex items-center gap-3 px-5 py-4 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all text-left">
                <Edit size={15} /> Edit Nama
              </button>
              <button onClick={() => { setStudentActionTarget({ ...mem, mode: 'group' }); setMoveGroupTarget(mem.group_name || ''); setOpenActionMenuId(null); }} className="w-full flex items-center gap-3 px-5 py-4 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-left">
                <ShuffleIcon size={15} /> Pindah / Hapus Grup
              </button>
              <div className="border-t border-slate-100" />
              <button onClick={() => { handleRemoveStudent(mem); }} className="w-full flex items-center gap-3 px-5 py-4 text-xs font-bold text-rose-500 hover:bg-rose-50 transition-all text-left">
                <UserX size={15} /> Hapus dari Batch
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
                    <div className="w-14 h-14 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0"><Medal size={28} /></div>
                    <div>
                      <h3 className="text-xl font-black text-[#0F172A]">Upload Sertifikat</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{studentActionTarget.v2_profiles?.full_name}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">URL Sertifikat (Google Drive, PDF, dll)</label>
                    <input value={certUrl} onChange={e => setCertUrl(e.target.value)} placeholder="https://drive.google.com/file/..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-amber-400 outline-none" />
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
                    <div className="w-14 h-14 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0"><Edit size={28} /></div>
                    <div>
                      <h3 className="text-xl font-black text-[#0F172A]">Edit Nama Student</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {studentActionTarget.id?.slice(0,8)}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Lengkap</label>
                    <input value={editStudentName} onChange={e => setEditStudentName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-blue-400 outline-none" />
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
                      <div className="w-14 h-14 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0"><ShuffleIcon size={28} /></div>
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

      {/* QUIZ REVIEW & FEEDBACK MODAL */}
      <AnimatePresence>
        {isQuizReviewModalOpen && activeQuizReview && (() => {
           const quizDef = curriculum.find((c: any) => c.id === activeQuizReview.curriculum_id);
           const questions = quizDef?.quiz_data?.questions || [];
           const wrongAnswers = questions.map((q: any, qi: number) => {
              const studentAnswer = activeQuizReview.answers_json?.[qi];
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
                         <p className="text-xs font-bold text-slate-400">Score Achieved: <span className={activeQuizReview.score >= 80 ? "text-emerald-500" : activeQuizReview.score >= 60 ? "text-amber-500" : "text-rose-500"}>{activeQuizReview.score}</span> / 100</p>
                      </div>
                      <button onClick={() => setIsQuizReviewModalOpen(false)} className="p-3 bg-white border border-slate-100 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm">
                         <X size={20} />
                      </button>
                   </div>

                   <div className="flex-1 overflow-y-auto p-8 space-y-10">
                      {/* WRONG ANSWERS REPORT */}
                      {wrongAnswers.length > 0 ? (
                         <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-6">
                               <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center font-black text-xs border border-rose-100 shadow-sm">
                                  {wrongAnswers.length}
                               </div>
                               <div>
                                  <h3 className="text-lg font-black text-slate-800 tracking-tight">Koreksi Jawaban Salah</h3>
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
                      ) : (
                         <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-[24px] flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                               <Award fill="currentColor" size={24} />
                            </div>
                            <div>
                               <h4 className="text-base font-black text-emerald-700">Perfect Score!</h4>
                               <p className="text-xs font-medium text-emerald-600">They answered all questions correctly without a single mistake.</p>
                            </div>
                         </div>
                      )}

                      {/* CLASS FEEDBACK */}
                      <div className="space-y-4">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 text-amber-500 flex items-center justify-center shrink-0 border border-amber-100 shadow-sm">
                               <MessageSquare size={16} fill="currentColor" />
                            </div>
                            <div>
                               <h3 className="text-lg font-black text-slate-800 tracking-tight">Class Feedback</h3>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">From Student's Perspective</p>
                            </div>
                         </div>
                         <div className="w-full p-6 rounded-[24px] bg-slate-50 border border-slate-100 text-sm font-medium text-slate-600 leading-relaxed shadow-inner">
                            {activeQuizReview.answers_json?.feedback ? (
                               `"${activeQuizReview.answers_json.feedback}"`
                            ) : (
                               <span className="italic text-slate-400">No additional feedback provided by the student for this module.</span>
                            )}
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

    </div>
  );
}
