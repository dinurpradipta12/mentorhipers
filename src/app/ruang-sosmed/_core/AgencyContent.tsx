"use client";

import React, { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Users, 
  Layers, 
  Target, 
  Plus, 
  ChevronRight, 
  ChevronLeft,
  Settings, 
  Zap, 
  Sparkles, 
  LogOut,
  LayoutDashboard,
  Search,
  MessageSquare,
  ArrowUpRight,
  ArrowRight,
  Shield,
  Table2,
  Kanban,
  FileText,
  Play,
  Link as LinkIcon,
  Calendar as CalendarIcon,
  Trash2,
  AlertCircle,
  AlertTriangle,
  X,
  Video,
  UserPlus,
  ShieldCheck,
  User,
  Copy,
  Check,
  ExternalLink,
  Palette,
  Edit,
  Edit3,
  BarChart2,
  TrendingUp,
  Heart,
  Eye,
  Share2,
  MessageCircle,
  Star,
  Clock,
  RefreshCw,
  TrendingDown,
  Lightbulb,
  Trophy,
  MinusCircle,
  AtSign,
  Quote, Music,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  MoreVertical
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip 
} from "recharts";
import { supabaseV2 as supabase } from "@/lib/supabase";
import { getCachedSession, isLegacyAdmin } from "@/lib/authCache";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AvatarCreator from "./AvatarCreator";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const statusConfig: Record<string, { label: string, color: string, bg: string, border: string, dot: string }> = {
  draft: { label: 'Draft', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', dot: 'bg-slate-400' },
  in_progress: { label: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', dot: 'bg-blue-500' },
  review: { label: 'In Review', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', dot: 'bg-amber-500' },
  approved: { label: 'Approved', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', dot: 'bg-emerald-500' },
  uploaded: { label: 'Uploaded', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', dot: 'bg-purple-500' }
};

export default function AgencyContent({ id, subTab }: { id: string, subTab?: string }) {
  const router = useRouter();
  const resolvedParams = { id };
  const [activeTab, setActiveTab] = useState<string>(subTab || "dashboard");

  const formatNumber = (num: any) => {
    const n = Number(num) || 0;
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  // Sync active tab to URL for persistence across refreshes
  useEffect(() => {
    if (activeTab) {
      const targetPath = `/ruang-sosmed/agency/${id}/${activeTab}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
    }
  }, [activeTab, id]);
  const [workspace, setWorkspace] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [contentPlans, setContentPlans] = useState<any[]>([]);
  const [contentView, setContentView] = useState<'table' | 'kanban' | 'calendar'>('table');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [tempLinkValue, setTempLinkValue] = useState("");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<any | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'this_month' | 'last_month' | 'all_time' | 'custom'>('this_month');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | 'all'>('all');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountForm, setAccountForm] = useState({ name: '', platform: 'tiktok', handle: '', avatar_url: '', current_followers: 0 });
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedPreviewTask, setSelectedPreviewTask] = useState<any>(null);
  const [editingMetricsTask, setEditingMetricsTask] = useState<any | null>(null);
  const [metricsForm, setMetricsForm] = useState<any>({
    reach: 0, views: 0, likes: 0, comments: 0, shares: 0, saves: 0, reposts: 0, profile_visit: 0, follows: 0, avg_watch_time: 0, new_followers: 0
  });
  const [activeChartMetric, setActiveChartMetric] = useState<'views' | 'interactions' | 'followers'>('views');
  const [intelligenceScopes, setIntelligenceScopes] = useState<any[]>([]);
  const [intelligenceWorkflow, setIntelligenceWorkflow] = useState<any[]>([]);
  const [intelligenceId, setIntelligenceId] = useState<string | null>(null);


  const [isIntelligenceModalOpen, setIsIntelligenceModalOpen] = useState(false);
  const [intelligenceModalConfig, setIntelligenceModalConfig] = useState<any>({
     type: 'stage', // stage, role, task
     mode: 'add', // add, edit
     index: -1,
     subIndex: -1,
     data: { title: '', role: '', desc: '', task: '' }
  });

  const [confirmConfig, setConfirmConfig] = useState<any>({
     isOpen: false,
     title: "",
     message: "",
     onConfirm: () => {},
     type: 'danger'
  });

  const openConfirm = (title: string, message: string, onConfirm: () => void, type: 'danger' | 'info' = 'danger') => {
     setConfirmConfig({ isOpen: true, title, message, onConfirm, type });
  };

  const openIntelligenceModal = (type: string, mode: string, index: number = -1, subIndex: number = -1) => {
     let initialData = { title: '', role: '', desc: '', task: '' };
     if (mode === 'edit') {
        if (type === 'stage') {
           const s = intelligenceWorkflow[index];
           initialData = { title: s.title, role: s.role, desc: s.desc, task: '' };
        } else if (type === 'role') {
           initialData = { title: intelligenceScopes[index].role, role: '', desc: '', task: '' };
        }
     }
     setIntelligenceModalConfig({ type, mode, index, subIndex, data: initialData });
     setIsIntelligenceModalOpen(true);
  };

  const handleIntelligenceSubmit = async () => {
     const { type, mode, index, data } = intelligenceModalConfig;
     let nextWorkflow = [...intelligenceWorkflow];
     let nextScopes = [...intelligenceScopes];

     if (type === 'stage') {
        if (mode === 'add') {
           const nextStep = String(intelligenceWorkflow.length + 1).padStart(2, '0');
           nextWorkflow.push({
              step: nextStep,
              title: data.title,
              role: data.role,
              desc: data.desc,
              color: "bg-slate-50 text-slate-600",
              icon_type: 'Target' // Store icon type as string for DB
           });
        } else {
           nextWorkflow[index] = { ...nextWorkflow[index], title: data.title, role: data.role, desc: data.desc };
        }
     } else if (type === 'role') {
        if (mode === 'add') {
           nextScopes.push({ role: data.title, tasks: [] });
        } else {
           nextScopes[index].role = data.title;
        }
     } else if (type === 'task') {
        nextScopes[index].tasks.push(data.task);
     }

     try {
        const payload = {
           workspace_id: id,
           workflow: nextWorkflow,
           scopes: nextScopes,
           updated_at: new Date().toISOString()
        };

        if (intelligenceId) {
           await supabase.from('v2_agency_intelligence').update(payload).eq('id', intelligenceId);
        } else {
           await supabase.from('v2_agency_intelligence').insert([payload]);
        }
        setIsIntelligenceModalOpen(false);
     } catch (err: any) {
        alert("Gagal sinkronisasi ke server: " + err.message);
     }
  };

  const fetchIntelligence = async () => {
     const { data, error } = await supabase
        .from('v2_agency_intelligence')
        .select('*')
        .eq('workspace_id', id)
        .maybeSingle();

     if (data) {
        setIntelligenceId(data.id);
        setIntelligenceWorkflow(data.workflow || []);
        setIntelligenceScopes(data.scopes || []);
     } else {
        // Fallback or Initial setup
        const defaultWorkflow = [
           { step: "01", title: "Idea & Research", role: "Specialist", color: "bg-emerald-50 text-emerald-600", icon_type: "Lightbulb", desc: "Pencarian tren, riset hashtag & audit sound." },
           { step: "02", title: "Copywriting", role: "Copywriter", color: "bg-blue-50 text-blue-600", icon_type: "FileText", desc: "Pembuatan Headline, Script Video & Caption." },
           { step: "03", title: "Visual Design", role: "Designer", color: "bg-purple-50 text-purple-600", icon_type: "Palette", desc: "Produksi Grafis, Editing Video & Revisions." },
           { step: "04", title: "Internal Review", role: "Admin", color: "bg-amber-50 text-amber-600", icon_type: "ShieldCheck", desc: "Pengecekan kualitas & sinkronisasi brief." },
           { step: "05", title: "Client Approval", role: "Client", color: "bg-rose-50 text-rose-600", icon_type: "Star", desc: "Final review & persetujuan tayang klien." },
           { step: "06", title: "Scheduling", role: "Admin", color: "bg-slate-900 text-white", icon_type: "Zap", desc: "Input ke Content Plan & Live Posting." }
        ];
        const defaultScopes = [
           { role: "Specialist", tasks: ["Audit Kompetitor", "Trend Spotting", "Hashtag Optimization"] },
           { role: "Admin / Manager", tasks: ["Client Communication", "Scheduling", "Quality Control"] },
           { role: "Creative / Design", tasks: ["Static Post Design", "Short-video Editing", "Asset Management"] },
           { role: "Client Owner", tasks: ["Strategy Approval", "Feedback Provision", "Brand Voice Check"] }
        ];
        setIntelligenceWorkflow(defaultWorkflow);
        setIntelligenceScopes(defaultScopes);
     }
  };

  const handleRemoveTaskFromScope = (scopeIndex: number, taskIndex: number) => {
     openConfirm(
        "Hapus Jobdesk",
        "Apakah Anda yakin ingin menghapus jobdesk ini? Tindakan ini permanen.",
        async () => {
           const nextScopes = [...intelligenceScopes];
           nextScopes[scopeIndex].tasks.splice(taskIndex, 1);
           await supabase.from('v2_agency_intelligence').update({ scopes: nextScopes, updated_at: new Date().toISOString() }).eq('workspace_id', id);
        }
     );
  };

  const handleRemoveStage = (index: number) => {
     openConfirm(
        "Hapus Tahapan Produksi",
        "Tahapan ini akan dihapus dari alur kerja. Nomor urut tahapan lain akan disesuaikan otomatis.",
        async () => {
           let nextWorkflow = [...intelligenceWorkflow];
           nextWorkflow.splice(index, 1);
           const reindexed = nextWorkflow.map((s, i) => ({
              ...s,
              step: String(i + 1).padStart(2, '0')
           }));
           await supabase.from('v2_agency_intelligence').update({ workflow: reindexed, updated_at: new Date().toISOString() }).eq('workspace_id', id);
        }
     );
  };

  const handleRemoveScope = (index: number) => {
      openConfirm(
         "Hapus Seluruh Role",
         "Seluruh jabatan beserta daftar jobdesknya akan dihapus permanen dari Intelligence Hub.",
         async () => {
            const nextScopes = [...intelligenceScopes];
            nextScopes.splice(index, 1);
            await supabase.from('v2_agency_intelligence').update({ scopes: nextScopes, updated_at: new Date().toISOString() }).eq('workspace_id', id);
         }
      );
  };



  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    platform: "tiktok",
    content_url: "",
    due_date: "",
    content_pillar: "",
    headline: "",
    script_url: "",
    result_url: "",
    published_url: "",
    status: "draft",
    reach: 0,
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    reposts: 0,
    profile_visit: 0,
    follows: 0,
    avg_watch_time: 0,
    new_followers: 0,
    account_id: ""
  });
  const [memberForm, setMemberForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "team_member",
    avatar_url: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isChoosingAvatar, setIsChoosingAvatar] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: "", avatar_url: "" });
  const [meetings, setMeetings] = useState<any[]>([]);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingFilter, setMeetingFilter] = useState<"upcoming" | "past">("upcoming");
  const [editingMeeting, setEditingMeeting] = useState<any | null>(null);
  const [meetingForm, setMeetingForm] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    meeting_link: "",
    category: "internal"
  });
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);

  const messages = [
    `Halo, ${currentUserProfile?.full_name?.split(' ')[0] || 'Boss'}! Siap viral hari ini? 🚀`,
    "Metric Interaksi stabil nih, mantap! 📈",
    "Ada ide konten baru buat minggu depan? 💡",
    "Jangan lupa istirahat & ngopi ya, Boss ☕",
    "Cek analitik buat liat pertumbuhan terbaru 📊",
    "Ready to Scale with Mentorhipers! ✨",
    "Waktunya update statistik performa hari ini? ✅",
    "Status: All systems growing! 🌿"
  ];

  useEffect(() => {
    if (isProfilePopupOpen) {
      setIsBubbleVisible(false);
      return;
    }

    const cycle = () => {
      setIsBubbleVisible(true);
      // Show for 6 seconds
      const hideTimeout = setTimeout(() => {
        setIsBubbleVisible(false);
        // Prepare next index
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
      }, 6000);
      return hideTimeout;
    };

    // Initial delay before first appearance
    const startDelay = setTimeout(cycle, 10000); // 10s after closing popup/load

    // Repeat cycle every 45 seconds to be less intrusive
    const interval = setInterval(cycle, 45000);

    return () => {
      clearTimeout(startDelay);
      clearInterval(interval);
    };
  }, [messages.length, isProfilePopupOpen]);

  const [roadmapForm, setRoadmapForm] = useState({
    title: "",
    description: "",
    target_date: "",
    progress: 0,
    status: "planned"
  });
  const [selectedRoadmapMemberIds, setSelectedRoadmapMemberIds] = useState<string[]>([]);
  const [selectedMeetingAttendeeIds, setSelectedMeetingAttendeeIds] = useState<string[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<any>(null);
  const [copying, setCopying] = useState(false);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  useEffect(() => {
    if (selectedPeriod !== 'all' && selectedPeriod !== 'unscheduled') {
      const [year, month] = selectedPeriod.split('-').map(Number);
      const newDate = new Date(year, month - 1, 1);
      if (newDate.getMonth() !== currentCalendarDate.getMonth() || newDate.getFullYear() !== currentCalendarDate.getFullYear()) {
        setCurrentCalendarDate(newDate);
      }
    }
  }, [selectedPeriod]);

  const isAdmin = isLegacyAdmin() || userRole === 'owner' || userRole === 'admin';

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      await fetchWorkspaceDetail();
      await fetchMembers();
      fetchRoadmaps();
      fetchContentPlans();
      fetchAccounts();
      fetchIntelligence();
    };

    init();

    // 8. Subscribe to Intelligence Realtime
    const intelligenceSub = supabase
      .channel(`intelligence_sync_${id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'v2_agency_intelligence',
        filter: `workspace_id=eq.${id}`
      }, (payload) => {
        if (payload.new) {
           const newData = payload.new as any;
           setIntelligenceId(newData.id);
           setIntelligenceWorkflow(newData.workflow || []);
           setIntelligenceScopes(newData.scopes || []);
        }
      });
    
    intelligenceSub.subscribe();

    // Real-time listener for meetings
    const meetingChannel = supabase.channel(`meetings_sync_${resolvedParams.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'v2_agency_meetings',
        filter: `workspace_id=eq.${resolvedParams.id}`
      }, () => {
        fetchMeetings();
      });
    
    meetingChannel.subscribe();

    return () => {
      supabase.removeChannel(intelligenceSub);
      supabase.removeChannel(meetingChannel);
    };
  }, [id, isAdmin, selectedAccountId]);

  const checkAuth = async () => {
    const legacyAdmin = isLegacyAdmin();
    const session = await getCachedSession();

    if (!session && !legacyAdmin) {
      router.push("/ruang-sosmed/login");
      return;
    }

    if (legacyAdmin) {
      setIsAuthorized(true);
      setUserRole("admin");
      // For Legacy Admin, we use a local state but try to load from localStorage first
      const storedProfile = localStorage.getItem("v2_legacy_profile");
      if (storedProfile) {
        try {
          setCurrentUserProfile({ id: 'legacy-admin', full_name: JSON.parse(storedProfile).full_name || "Dinur", avatar_url: JSON.parse(storedProfile).avatar_url || JSON.parse(storedProfile).avatar || JSON.parse(storedProfile).photo || "", role: "admin" });
        } catch (e) {
          setCurrentUserProfile({ id: 'legacy-admin', full_name: "Dinur", role: "admin" });
        }
      } else {
        setCurrentUserProfile({ id: 'legacy-admin', full_name: "Dinur", role: "admin" });
      }
    }

    if (session) {
      // 1. Cek Profil Global & Membership secara paralel
      const [profileRes, membershipRes] = await Promise.all([
        supabase.from("v2_profiles").select("id, full_name, avatar_url, role").eq("id", session.user.id).maybeSingle(),
        supabase.from("v2_memberships").select("id, role").eq("workspace_id", resolvedParams.id).eq("profile_id", session.user.id).maybeSingle()
      ]);

      const profile = profileRes.data;
      const membership = membershipRes.data;

      if (profile?.role === "admin" || membership || legacyAdmin) {
        setIsAuthorized(true);
        if (profile) setCurrentUserProfile(profile);
        const effectiveRole = profile?.role === "admin" ? "admin" : (membership?.role || (legacyAdmin ? "admin" : "team_member"));
        setUserRole(effectiveRole);
      } else {
        router.push("/ruang-sosmed/login");
      }
    }
  };

  const handleUpdateMyProfile = async () => {
    setIsSubmitting(true);
    try {
      const session = await getCachedSession();
      
      if (!session) {
        if (isLegacyAdmin()) {
           // Local update for legacy admins with persistence via localStorage
           const newProfile = {
             ...currentUserProfile,
             full_name: profileForm.full_name,
             avatar_url: profileForm.avatar_url
           };
           setCurrentUserProfile(newProfile);
           localStorage.setItem("v2_legacy_profile", JSON.stringify(newProfile));
           setIsProfileModalOpen(false);
           return;
        }
        alert("Sesi berakhir. Silakan login kembali.");
        return;
      }
      
      const { error } = await supabase.from('v2_profiles').update({
        full_name: profileForm.full_name,
        avatar_url: profileForm.avatar_url
      }).eq('id', session.user.id);

      if (error) {
        console.error("❌ Update Profile Error:", error);
        throw new Error(error.message);
      }
      
      setIsProfileModalOpen(false);
      await checkAuth(); // Refresh profile info
    } catch (e: any) {
      console.error("❌ Catch Error Profile:", e);
      alert("Gagal update profil: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openMyProfileModal = () => {
    if (!currentUserProfile) return;
    setProfileForm({
      full_name: currentUserProfile.full_name || "",
      avatar_url: currentUserProfile.avatar_url || ""
    });
    setIsProfileModalOpen(true);
  };

  const fetchWorkspaceDetail = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('v2_workspaces').select('*').eq('id', resolvedParams.id).single();
    if (data) setWorkspace(data);
    setIsLoading(false);
  };

  const fetchMembers = async () => {
    const { data: memberships, error } = await supabase
      .from('v2_memberships')
      .select('*')
      .eq('workspace_id', resolvedParams.id);

    if (error) { console.error('fetchMembers error:', error); return; }
    if (!memberships || memberships.length === 0) { setMembers([]); return; }

    const profileIds = memberships.map((m: any) => m.profile_id).filter(Boolean);
    const { data: profiles } = await supabase
      .from('v2_profiles')
      .select('*')
      .in('id', profileIds);

    const merged = memberships.map((m: any) => ({
      ...m,
      profile: profiles?.find((p: any) => p.id === m.profile_id) || null
    }));

    setMembers(merged);
  };

  const fetchRoadmaps = async () => {
    const { data } = await supabase
      .from('v2_agency_roadmaps')
      .select(`
        *,
        milestones:v2_agency_roadmap_milestones(*, assignee:v2_profiles!assigned_to(*)),
        kpi_members:v2_agency_roadmap_members(*, profile:v2_profiles(*))
      `)
      .eq('workspace_id', resolvedParams.id)
      .order('target_date', { ascending: true });
    if (data) {
      setRoadmaps(data);
      // Refresh selected roadmap detail if it's open
      setSelectedRoadmap((prev: any) => prev ? (data.find((r: any) => r.id === prev.id) || prev) : null);
    }
  };

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('v2_agency_accounts')
        .select('*')
        .eq('workspace_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAccounts(data || []);
      if (data && data.length > 0 && selectedAccountId === 'all') {
         // Optionally default to first account if you want, but 'all' is better for overview
      }
    } catch (err: any) {
      console.error("Error fetching accounts:", err.message);
    }
  };

  const handleAddAccount = async () => {
    if (!accountForm.name || !accountForm.platform) return;
    setIsSubmitting(true);
    try {
      const payload = {
        workspace_id: id,
        name: accountForm.name,
        platform: accountForm.platform,
        handle: accountForm.handle,
        avatar_url: accountForm.avatar_url,
        current_followers: accountForm.current_followers
      };

      if (editingAccountId) {
        const { error } = await supabase
          .from('v2_agency_accounts')
          .update(payload)
          .eq('id', editingAccountId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('v2_agency_accounts')
          .insert([payload]);
        if (error) throw error;
      }

      setAccountForm({ name: '', platform: 'tiktok', handle: '', avatar_url: '', current_followers: 0 });
      setEditingAccountId(null);
      setIsAccountModalOpen(false);
      fetchAccounts();
    } catch (err: any) {
      alert("Gagal menyimpan akun: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = (accId: string) => {
    openConfirm(
       "Hapus Akon Identitas",
       "Seluruh konten terkait akan kehilangan relasi akun ini. Apakah Anda yakin?",
       async () => {
          try {
            const { error } = await supabase
              .from('v2_agency_accounts')
              .delete()
              .eq('id', accId);
            if (error) throw error;
            fetchAccounts();
            if (selectedAccountId === accId) setSelectedAccountId('all');
          } catch (err: any) {
            alert("Gagal menghapus akun: " + err.message);
          }
       }
    );
  };

  const openMetricsModal = (task: any) => {
    setEditingMetricsTask(task);
    setMetricsForm({
      reach: task.reach || 0,
      views: task.views || 0,
      likes: task.likes || 0,
      comments: task.comments || 0,
      shares: task.shares || 0,
      saves: task.saves || 0,
      reposts: task.reposts || 0,
      profile_visit: task.profile_visit || 0,
      follows: task.follows || 0,
      avg_watch_time: task.avg_watch_time || 0,
      new_followers: task.new_followers || 0
    });
    setIsMetricsModalOpen(true);
  };

  const handleUpdateMetrics = async () => {
    if (!editingMetricsTask) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('v2_agency_content_plans')
        .update({
          ...metricsForm
        })
        .eq('id', editingMetricsTask.id);

      if (error) throw error;
      setIsMetricsModalOpen(false);
      fetchContentPlans();
    } catch (err: any) {
      alert("Gagal update metrik: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchContentPlans = async () => {
    try {
      let query = supabase
        .from('v2_agency_content_plans')
        .select('*')
        .eq('workspace_id', id)
        .order('due_date', { ascending: true });

      if (selectedAccountId !== 'all') {
        query = query.eq('account_id', selectedAccountId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setContentPlans(data || []);
    } catch (err: any) {
      console.error("Error fetching content plans:", err.message);
    }
  };

  const fetchMeetings = async () => {
    if (!resolvedParams.id) return;
    try {
      const { data, error } = await supabase
        .from('v2_agency_meetings')
        .select('*')
        .eq('workspace_id', resolvedParams.id)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('fetchMeetings Error:', error.message);
        return;
      }
      
      setMeetings(data || []);
    } catch (err) {
      console.error('Error fetching meetings:', err);
    }
  };
  const handleCreateRoadmap = async () => {
    setIsSubmitting(true);
    try {
      const { data: newRoadmap, error } = await supabase
        .from('v2_agency_roadmaps')
        .insert({ ...roadmapForm, workspace_id: resolvedParams.id })
        .select()
        .single();

      if (error) throw error;

      // If members were selected, save their assignments
      if (selectedRoadmapMemberIds.length > 0 && newRoadmap) {
        const memberRows = selectedRoadmapMemberIds.map(profileId => ({
          roadmap_id: newRoadmap.id,
          profile_id: profileId
        }));
        const { error: memberError } = await supabase.from('v2_agency_roadmap_members').insert(memberRows);
        if (memberError) throw memberError;
      }
      
      setIsRoadmapModalOpen(false);
      setRoadmapForm({ title: "", description: "", target_date: "", progress: 0, status: "planned" });
      setSelectedRoadmapMemberIds([]);
      fetchRoadmaps();
    } catch (e: any) {
      alert("Gagal membuat roadmap: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRoadmapStatus = async (id: string, newStatus: string, newProgress: number) => {
    try {
      const { error } = await supabase
        .from('v2_agency_roadmaps')
        .update({ status: newStatus, progress: newProgress })
        .eq('id', id);

      if (error) throw error;
      fetchRoadmaps();
    } catch (e: any) {
      alert("Gagal update roadmap: " + e.message);
    }
  };

  const handleDeleteRoadmap = (id: string) => {
    openConfirm(
       "Hapus Fase Strategi",
       "Fase ini beserta seluruh milestone di dalamnya akan dihapus permanen.",
       async () => {
          try {
            const { error } = await supabase.from('v2_agency_roadmaps').delete().eq('id', id);
            if (error) throw error;
            fetchRoadmaps();
          } catch (e: any) {
            alert("Gagal hapus roadmap: " + e.message);
          }
       }
    );
  };

  const handleToggleMilestone = async (milestoneId: string, isCompleted: boolean, roadmapId: string) => {
    try {
      const { error } = await supabase
        .from('v2_agency_roadmap_milestones')
        .update({ is_completed: isCompleted })
        .eq('id', milestoneId);

      if (error) throw error;
      
      // Re-calculate roadmap progress based on milestones
      const { data: milestones } = await supabase
        .from('v2_agency_roadmap_milestones')
        .select('is_completed')
        .eq('roadmap_id', roadmapId);
      
      if (milestones && milestones.length > 0) {
        const completed = milestones.filter(m => m.is_completed).length;
        const progress = Math.round((completed / milestones.length) * 100);
        const status = progress === 100 ? 'completed' : (progress > 0 ? 'in_progress' : 'planned');
        
        await supabase
          .from('v2_agency_roadmaps')
          .update({ progress, status })
          .eq('id', roadmapId);
      }

      fetchRoadmaps();
    } catch (e: any) {
      console.error("Error toggling milestone:", e);
    }
  };

  const handleAssignMilestone = async (milestoneId: string, assignedTo: string | null) => {
    try {
      await supabase
        .from('v2_agency_roadmap_milestones')
        .update({ assigned_to: assignedTo })
        .eq('id', milestoneId);
      fetchRoadmaps();
    } catch (e: any) {
      console.error("Error assigning milestone:", e);
    }
  };

  const handleAddKpiMember = async (roadmapId: string, profileId: string) => {
    try {
      const { error } = await supabase.from('v2_agency_roadmap_members').insert({ roadmap_id: roadmapId, profile_id: profileId });
      if (error) throw error;
      await fetchRoadmaps();
      
      // Update selectedRoadmap if it's currently open to reflect changes
      if (selectedRoadmap && selectedRoadmap.id === roadmapId) {
         const { data } = await supabase
            .from('v2_agency_roadmaps')
            .select('*, milestones:v2_agency_roadmap_milestones(*), kpi_members:v2_agency_roadmap_members(*, profile:v2_profiles(*))')
            .eq('id', roadmapId)
            .single();
         if (data) setSelectedRoadmap(data);
      }
    } catch (e: any) {
      console.error("Error adding KPI member:", e);
      alert("Gagal menambahkan member: " + (e.message || "Unauthorized"));
    }
  };

  const handleRemoveKpiMember = async (roadmapId: string, profileId: string) => {
    try {
      const { error } = await supabase.from('v2_agency_roadmap_members')
        .delete()
        .eq('roadmap_id', roadmapId)
        .eq('profile_id', profileId);
      if (error) throw error;
      await fetchRoadmaps();

      // Update selectedRoadmap if it's currently open to reflect changes
      if (selectedRoadmap && selectedRoadmap.id === roadmapId) {
         const { data } = await supabase
            .from('v2_agency_roadmaps')
            .select('*, milestones:v2_agency_roadmap_milestones(*), kpi_members:v2_agency_roadmap_members(*, profile:v2_profiles(*))')
            .eq('id', roadmapId)
            .single();
         if (data) setSelectedRoadmap(data);
      }
    } catch (e: any) {
      console.error("Error removing KPI member:", e);
      alert("Gagal menghapus member: " + (e.message || "Unauthorized"));
    }
  };

  const handleAddMilestone = async (roadmapId: string, title: string, assignedTo?: string | null) => {
    if (!title.trim()) return;
    try {
      const { error } = await supabase.from('v2_agency_roadmap_milestones').insert({
        roadmap_id: roadmapId,
        title: title.trim(),
        is_completed: false,
        assigned_to: assignedTo || null
      });
      if (error) throw error;
      fetchRoadmaps();
    } catch (e: any) {
      alert("Gagal tambah milestone: " + e.message);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    try {
      const { error } = await supabase.from('v2_agency_roadmap_milestones').delete().eq('id', milestoneId);
      if (error) throw error;
      fetchRoadmaps();
    } catch (e: any) {
      console.error("Error deleting milestone:", e);
    }
  };

  const handleCreateMeeting = async () => {
    setIsSubmitting(true);
    try {
      const session = await getCachedSession();
      let meetingId = editingMeeting?.id;
      
      if (editingMeeting) {
         const { error } = await supabase.from('v2_agency_meetings').update({
           title: meetingForm.title,
           description: meetingForm.description,
           start_time: meetingForm.start_time,
           end_time: meetingForm.end_time || null,
           meeting_link: meetingForm.meeting_link,
           category: meetingForm.category
         }).eq('id', editingMeeting.id);
         
         if (error) throw error;

         // Sync attendees: delete then re-insert for simplicity in this version
         await supabase.from('v2_agency_meeting_attendees').delete().eq('meeting_id', meetingId);
      } else {
         const { data, error } = await supabase.from('v2_agency_meetings').insert({
           ...meetingForm,
           end_time: meetingForm.end_time || null,
           workspace_id: resolvedParams.id,
           created_by: session?.user.id
         }).select().single();

         if (error) throw error;
         meetingId = data.id;
      }

      // Insert attendees
      if (selectedMeetingAttendeeIds.length > 0 && meetingId) {
         const attendeeRows = selectedMeetingAttendeeIds.map(profileId => ({
            meeting_id: meetingId,
            profile_id: profileId
         }));
         const { error: attendeeError } = await supabase.from('v2_agency_meeting_attendees').insert(attendeeRows);
         if (attendeeError) throw attendeeError;
      }
      
      setIsMeetingModalOpen(false);
      setEditingMeeting(null);
      setSelectedMeetingAttendeeIds([]);
      setMeetingForm({ title: "", description: "", start_time: "", end_time: "", meeting_link: "", category: "internal" });
      await fetchMeetings();
    } catch (e: any) {
      alert("Gagal menyimpan meeting: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMeeting = (id: string) => {
    openConfirm(
       "Hapus Jadwal Meeting",
       "Jadwal meeting ini akan dihapus permanen dari kalender tim.",
       async () => {
          try {
            const { error } = await supabase.from('v2_agency_meetings').delete().eq('id', id);
            if (error) throw error;
            fetchMeetings();
          } catch (e: any) {
            alert("Gagal menghapus meeting: " + e.message);
          }
       }
    );
  };

  const openEditMeetingModal = (meeting: any) => {
    setEditingMeeting(meeting);
    
    // Formatting date to work with datetime-local
    let formattedDate = "";
    if (meeting.start_time) {
      const d = new Date(meeting.start_time);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      formattedDate = d.toISOString().slice(0,16);
    }
    
    setMeetingForm({
      title: meeting.title || "",
      description: meeting.description || "",
      start_time: formattedDate,
      end_time: meeting.end_time || "",
      meeting_link: meeting.meeting_link || "",
      category: meeting.category || "internal"
    });

    // Populate attendees if they exist
    if (meeting.attendees) {
       setSelectedMeetingAttendeeIds(meeting.attendees.map((a: any) => a.profile_id));
    } else {
       setSelectedMeetingAttendeeIds([]);
    }

    setIsMeetingModalOpen(true);
  };

  const handleOpenNewTask = () => {
    setEditingTask(null);
    let defaultDate = "";
    if (selectedPeriod !== "all" && selectedPeriod !== "unscheduled") {
       const now = new Date();
       const nowStr = now.toISOString().substring(0, 7);
       if (selectedPeriod === nowStr) {
          defaultDate = now.toISOString().split('T')[0];
       } else {
          defaultDate = `${selectedPeriod}-01`;
       }
    }
    
    setTaskForm({ 
      title: "", description: "", platform: "tiktok", content_url: "", due_date: defaultDate,
      content_pillar: "", headline: "", script_url: "", result_url: "", published_url: "", status: "draft",
      reach: 0, views: 0, likes: 0, comments: 0, shares: 0, saves: 0, reposts: 0, profile_visit: 0, follows: 0, avg_watch_time: 0, new_followers: 0,
      account_id: selectedAccountId === 'all' ? (accounts[0]?.id || "") : selectedAccountId
    });
    setIsTaskModalOpen(true);
  };

  const handleCreateTask = async () => {
    console.log("🚀 Starting Task Creation...");
    if (!taskForm.title) {
       console.warn("⚠️ Title is missing.");
       return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get session
      const session = await getCachedSession();
      console.log("🔑 Session status:", session ? "Found" : "Not Found");
      
      const legacyAdmin = isLegacyAdmin(); const userId = session?.user?.id || null; 
      console.log("📍 Workspace ID:", resolvedParams.id);
      console.log("📝 Data to insert:", { ...taskForm, workspace_id: resolvedParams.id, created_by: userId });

        const { data: task, error: taskError } = await supabase
          .from('v2_agency_content_plans')
          .insert([{
            ...taskForm,
            due_date: taskForm.due_date || null,
            workspace_id: resolvedParams.id,
            created_by: userId,
            status: 'draft'
          }])
        .select()
        .single();

      if (taskError) {
         console.error("❌ Database Error (Content Plan):", taskError);
         throw new Error(`DB Error: ${taskError.message}`);
      }

      console.log("✅ Task created successfully:", task.id);
      setIsTaskModalOpen(false);

      let defaultDate = "";
      if (selectedPeriod !== "all" && selectedPeriod !== "unscheduled") {
         const now = new Date();
         const nowStr = now.toISOString().substring(0, 7);
         if (selectedPeriod === nowStr) {
            defaultDate = now.toISOString().split('T')[0];
         } else {
            defaultDate = `${selectedPeriod}-01`;
         }
      }

      setTaskForm({ 
        title: "", description: "", platform: "tiktok", content_url: "", due_date: defaultDate,
        content_pillar: "", headline: "", script_url: "", result_url: "", published_url: "", status: "draft",
        reach: 0, views: 0, likes: 0, comments: 0, shares: 0, saves: 0, reposts: 0, profile_visit: 0, follows: 0, avg_watch_time: 0, new_followers: 0,
        account_id: selectedAccountId === 'all' ? (accounts[0]?.id || "") : selectedAccountId
      });
      fetchContentPlans();
    } catch (err: any) {
      console.error("🛑 handleCreateTask Catch Block:", err);
      alert("Gagal menyimpan: " + err.message);
      setIsTaskModalOpen(true); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = (membershipId: string) => {
    openConfirm(
       "Hapus Anggota",
       "Akses anggota ini ke workspace akan dicabut segera.",
       async () => {
          try {
            const { error } = await supabase.from('v2_memberships').delete().eq('id', membershipId);
            if (error) throw error;
            fetchMembers();
          } catch (e: any) {
            alert("Gagal menghapus anggota: " + e.message);
          }
       }
    );
  };

  const handleUpdatePostLink = async (id: string, url: string) => {
    if (!url) return;
    try {
      const { error } = await supabase
        .from('v2_agency_content_plans')
        .update({ published_url: url })
        .eq('id', id);
      
      if (error) throw error;
      setEditingLinkId(null);
      fetchContentPlans();
    } catch (e: any) {
      alert("Gagal update link: " + e.message);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('v2_agency_content_plans')
        .delete()
        .eq('id', taskToDelete.id);
      if (error) throw error;
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
      fetchContentPlans();
    } catch (e: any) {
      alert("Gagal hapus: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenPreview = (task: any) => {
    setSelectedPreviewTask(task);
    setIsPreviewModalOpen(true);
  };

  const openEditModal = (task: any) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title || "",
      description: task.description || "",
      platform: task.platform || "tiktok",
      content_url: task.content_url || "",
      due_date: task.due_date || "",
      content_pillar: task.content_pillar || "",
      headline: task.headline || "",
      script_url: task.script_url || "",
      result_url: task.result_url || "",
      published_url: task.published_url || "",
      status: task.status || "draft",
      reach: task.reach || 0,
      views: task.views || 0,
      likes: task.likes || 0,
      comments: task.comments || 0,
      shares: task.shares || 0,
      saves: task.saves || 0,
      reposts: task.reposts || 0,
      profile_visit: task.profile_visit || 0,
      follows: task.follows || 0,
      avg_watch_time: task.avg_watch_time || 0,
      new_followers: task.new_followers || 0,
      account_id: task.account_id || ""
    });
    setIsTaskModalOpen(true);
  };

  const [editingMember, setEditingMember] = useState<any | null>(null);

  const handleAddMember = async () => {
    if (!memberForm.email || (!editingMember && !memberForm.password) || !memberForm.full_name) return;
    setIsSubmitting(true);
    
    try {
      if (editingMember) {
        // 1. Update Profile (Full Name)
        const { error: profileError } = await supabase.from('v2_profiles').update({
          full_name: memberForm.full_name
        }).eq('id', editingMember.profile_id);
        
        if (profileError) throw profileError;

        // 2. Update Membership (Role)
        const { error: memberError } = await supabase.from('v2_memberships').update({
          role: memberForm.role
        }).eq('id', editingMember.id);

        if (memberError) throw memberError;

      } else {
        // Create New Member Flow
        const virtualEmail = memberForm.email.includes('@') ? memberForm.email : `${memberForm.email}@ruangsosmed.v2.local`;

        // 1. Sign up the user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: virtualEmail,
          password: memberForm.password,
          options: {
            data: {
              full_name: memberForm.full_name
            }
          }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Gagal membuat user auth");

        // 2. Ensure profile exists (Upsert to be sure)
        const { error: profileError } = await supabase.from('v2_profiles').upsert({
          id: authData.user.id,
          full_name: memberForm.full_name,
          email: virtualEmail,
          role: 'user'
        });

        if (profileError && profileError.code !== '23505') throw profileError;

        // 3. Create Membership
        const { error: memberError } = await supabase.from('v2_memberships').insert({
          workspace_id: resolvedParams.id,
          profile_id: authData.user.id,
          role: memberForm.role
        });

        if (memberError) throw memberError;

        setSuccessData({
          full_name: memberForm.full_name,
          username: memberForm.email,
          password: memberForm.password
        });
        setIsSuccessModalOpen(true);
      }

      setIsMemberModalOpen(false);
      setEditingMember(null);
      setMemberForm({ full_name: "", email: "", password: "", role: "team_member", avatar_url: "" });
      fetchMembers();
    } catch (e: any) {
      alert("Gagal memproses data anggota: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditMemberModal = (member: any) => {
    setEditingMember(member);
    setMemberForm({
      full_name: member.profile?.full_name || "",
      email: member.profile?.email?.split('@')[0] || "",
      password: "", 
      role: member.role || "team_member",
      avatar_url: member.profile?.avatar_url || ""
    });
    setIsMemberModalOpen(true);
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('v2_agency_content_plans')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;
      fetchContentPlans();
    } catch (e: any) {
      alert("Gagal update status: " + e.message);
    }
  };

  const TABS = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16}/> },
    { id: "roadmap", label: "Strategy", icon: <Target size={16}/> },
    { id: "content", label: "Content Plan", icon: <Layers size={16}/> },
    { id: "meetings", label: "Meeting Schedule", icon: <Video size={16}/> },
    { id: "analytics", label: "Performance", icon: <BarChart2 size={16}/> },
    { id: "intelligence", label: "Team Flow", icon: <Lightbulb size={16}/> },
    ...(isAdmin ? [{ id: "members", label: "Manage Team", icon: <Users size={16}/> }] : [])
  ];

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"/>
        <p className="text-[10px] font-black text-slate-400  tracking-widest animate-pulse">
          Verifying Workspace Access...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 xl:p-10 space-y-8 max-w-[1700px] mx-auto min-h-screen">
      {/* Agency Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 py-8 px-10 bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#134e4a] rounded-[44px] text-white overflow-hidden relative shadow-2xl">
        {/* Pattern & Mesh Effects */}
        <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23ffffff'/%3E%3C/svg%3E")` }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3 animate-pulse"/>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/20 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4"/>
       
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link href="/ruang-sosmed/agency" className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10 group">
                <ChevronRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform"/>
              </Link>
            )}
            <div className="px-3 py-1 rounded-full bg-white/20 text-white text-[9px] font-black  tracking-widest border border-white/10">
              Agency Workspace
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-4">
               {workspace?.name || "Loading Agency..."}
            </h1>
            <div className="flex flex-wrap gap-6 items-center opacity-70">
              <p className="flex items-center gap-2 text-sm font-bold"><Shield size={14}/> Registered Agency</p>
              <div className="h-1 w-1 rounded-full bg-white/30"/>
              <p className="flex items-center gap-2 text-sm font-bold"><Users size={14}/> {members.length}/10 Members Actives</p>
              <div className="h-1 w-1 rounded-full bg-white/30"/>
              <p className="flex items-center gap-2 text-sm font-bold"><Sparkles size={14}/> Shared Content Environment</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-end gap-6 self-stretch justify-between">
           {/* Identity Widget in Flow */}
           <div className="flex flex-col items-end gap-2 mt-0">
              <div className="flex items-center gap-3 mb-2">
                 <select 
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2 text-[10px] font-black text-white hover:bg-white/20 transition-all outline-none"
                 >
                    <option value="all" className="text-slate-900 font-bold">All Accounts Combined</option>
                    {accounts.map(acc => (
                       <option key={acc.id} value={acc.id} className="text-slate-900 font-bold">
                          {acc.platform}: {acc.name}
                       </option>
                    ))}
                 </select>
                 {isAdmin && (
                    <button 
                       onClick={() => setIsAccountModalOpen(true)}
                       className="p-2 bg-white/10 border border-white/10 rounded-xl text-white hover:bg-emerald-500 hover:border-emerald-400 transition-all shadow-lg"
                       title="Manage Accounts"
                    >
                       <Settings size={14}/>
                    </button>
                 )}
              </div>

           </div>

           <div className="flex gap-4 xl:mb-2">
           <Button 
             onClick={handleOpenNewTask}
             className="h-14 px-8 rounded-2xl bg-white text-emerald-900 font-bold text-sm shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3"
           >
             <Plus size={18}/> New Content Task
           </Button>
        </div>
      </div>
    </div>

      {/* Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex gap-4 p-2 bg-emerald-50/50 border border-emerald-100/50 rounded-3xl w-fit">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-8 py-4 rounded-2xl flex items-center gap-3 text-xs font-black  tracking-widest transition-all ${activeTab === t.id ? "bg-white text-emerald-600 shadow-lg shadow-emerald-500/5 border border-emerald-100/50" : "text-slate-400 hover:text-emerald-700"}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.2 }}
           className="min-h-[500px]"
        >
          {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                 {/* 1. Universal Stats Row */}
                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                       { label: "Strategic KPI", value: `${Math.round(roadmaps.reduce((acc: any, curr: any) => acc + curr.progress, 0) / (roadmaps.length || 1))}%`, icon: <Target className="text-emerald-500"/>, sub: "Goal progress" },
                       { label: "Production Line", value: contentPlans.length, icon: <Layers className="text-blue-500"/>, sub: "Active assets" },
                       { label: "Team Velocity", value: members.length, icon: <Users className="text-purple-500"/>, sub: "Collaborators" },
                       { label: "Pipeline Status", value: contentPlans.filter((c:any) => c.status === 'approved' || c.status === 'uploaded').length, icon: <Zap className="text-emerald-500"/>, sub: "Ready & Posted" },
                    ].map((stat, i) => (
                       <Card key={i} className="p-6 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[32px] hover:scale-[1.02] transition-all">
                          <div className="flex items-center gap-4 mb-4">
                             <div className="p-3 bg-slate-50 rounded-2xl">{stat.icon}</div>
                             <div className="flex-1">
                                <p className="text-[10px] font-black text-slate-400  tracking-widest">{stat.label}</p>
                                <p className="text-[10px] font-bold text-slate-300 italic">{stat.sub}</p>
                             </div>
                          </div>
                          <h4 className="text-3xl font-black text-[#0F172A] italic">{stat.value}</h4>
                       </Card>
                    ))}
                 </div>

                 <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* 2. Critical Reminders & Focus */}
                    <div className="xl:col-span-2 space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Next Meeting Reminder */}
                          <Card className="p-8 bg-white border border-slate-100 shadow-xl shadow-slate-100/50 rounded-[40px] relative overflow-hidden group">
                             <div className="absolute -left-1 w-2 h-full bg-emerald-500 top-0"/>
                             <div className="relative z-10 space-y-6">
                                <div className="flex items-center justify-between">
                                   <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black  tracking-widest border border-emerald-100 inline-flex items-center gap-2">
                                      <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"/>
                                      Live Sync Ready
                                   </div>
                                   <Video size={20} className="text-slate-300"/>
                                </div>
                                <div>
                                   <h4 className="text-2xl font-black text-[#0F172A] italic mb-1 line-clamp-1">
                                      {meetings.length > 0 ? meetings[0].title : 'No Pending Syncs'}
                                   </h4>
                                   <p className="text-slate-400 text-xs font-medium">
                                      {meetings.length > 0 ? new Date(meetings[0].start_time).toLocaleString('id-ID', { weekday: 'long', hour: '2-digit', minute: '2-digit' }) : 'Your schedule is clear.'}
                                   </p>
                                </div>
                                {meetings.length > 0 && meetings[0].meeting_link && (
                                   <Button 
                                     onClick={() => window.open(meetings[0].meeting_link, '_blank')}
                                     className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                                   >
                                      Join Meeting
                                   </Button>
                                )}
                             </div>
                          </Card>
                           <Card className="flex-1 p-8 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[44px] space-y-6 group hover:scale-[1.02] transition-all relative overflow-hidden">
                              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:scale-110 transition-transform shadow-sm">
                                 {(() => {
                                    const nextTask = contentPlans.filter(c => c.status !== "published")[0];
                                    const plat = nextTask?.platform?.toLowerCase();
                                    if (plat === "instagram") return <Instagram size={20} className="text-rose-500"/>;
                                    if (plat === "youtube") return <Youtube size={20} className="text-red-500"/>;
                                    if (plat === "facebook") return <Facebook size={20} className="text-blue-600"/>;
                                    if (plat === "threads") return <AtSign size={20} className="text-slate-900"/>;
                                    if (plat === "tiktok") return <Music size={20} className="text-slate-900"/>;
                                    return <Layers size={20}/>;
                                 })()}
                              </div>
                             <div className="flex items-center justify-between">
                                <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black  tracking-widest border border-blue-100">Next Post Due</div>
                                <CalendarIcon size={20} className="text-slate-200"/>
                             </div>
                             <div>
                                <h4 className="text-xl font-black text-[#0F172A] italic mb-1 line-clamp-1">
                                   {contentPlans.filter(c => c.status !== 'published')[0]?.title || 'Buffer Empty'}
                                </h4>
                                <p className="text-slate-400 text-xs font-medium">
                                   {contentPlans.filter(c => c.status !== 'published')[0]?.due_date ? new Date(contentPlans.filter(c => c.status !== 'published')[0].due_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }) : 'Ready to strategize?'}
                                </p>
                             </div>
                             <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: '45%' }}
                                  className="h-full bg-blue-500"
                                />
                             </div>
                          </Card>
                       </div>

                       {/* Agency Pulse: Integrated Workload & Recent Output Hub */}
                       <Card className="p-10 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[44px] space-y-8">
                          <div className="flex flex-col xl:flex-row gap-8">
                             {/* Workload Radar */}
                             <div className="flex-1 space-y-6">
                                <div className="space-y-1">
                                   <div className="flex items-center gap-2">
                                      <Zap size={20} className="text-amber-500 fill-amber-500"/>
                                      <h3 className="text-2xl font-black text-[#0F172A] italic">Workload Radar</h3>
                                   </div>
                                   <p className="text-slate-400 text-[10px] font-black  tracking-widest pl-7">Active Member Task Distribution</p>
                                </div>
                                <div className="space-y-4">
                                    {(() => {
                                        const pendingPlans = contentPlans.filter(c => c.status !== 'published');
                                        
                                        const workloads = members.map(m => {
                                           const tasks = pendingPlans.filter(c => c.created_by === m.profile_id);
                                           return { id: m.id, name: m.profile?.full_name || 'Member', avatar: m.profile?.avatar_url, activeTasks: tasks.length };
                                        }).filter(w => w.activeTasks > 0).sort((a,b) => b.activeTasks - a.activeTasks).slice(0,3);
                                        
                                        const unassignedTasks = pendingPlans.filter(c => !c.created_by);
                                        if (unassignedTasks.length > 0) {
                                           workloads.push({ id: 'system', name: 'Unassigned / System', avatar: '', activeTasks: unassignedTasks.length });
                                        }

                                        return workloads.length > 0 ? workloads.map(w => (
                                            <div key={w.id} className="flex items-center gap-4 group">
                                               <div className="w-10 h-10 rounded-[14px] bg-slate-50 border border-slate-100 overflow-hidden shadow-sm group-hover:scale-110 transition-transform">
                                                  <img src={w.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${w.name}`} className="w-full h-full object-contain p-1" alt="avatar"/>
                                               </div>
                                               <div className="flex-1">
                                                  <p className="text-sm font-bold text-[#0F172A]">{w.name}</p>
                                                  <p className="text-[10px] font-bold text-slate-400">Handling <span className="text-amber-600">{w.activeTasks}</span> pending actions</p>
                                               </div>
                                               <div className="h-2 flex-1 max-w-[80px] bg-slate-100 rounded-full overflow-hidden">
                                                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.min(w.activeTasks * 20, 100)}%` }}/>
                                               </div>
                                            </div>
                                        )) : (
                                            <div className="p-6 text-center bg-slate-50 rounded-[24px] border border-slate-100/50">
                                               <Target size={24} className="mx-auto text-slate-300 mb-2"/>
                                               <p className="text-xs font-bold text-slate-400">All tasks cleared.</p>
                                            </div>
                                        );
                                    })()}
                                </div>
                             </div>
                             
                             {/* Recent Output */}
                             <div className="flex-1 space-y-6">
                                <div className="space-y-1">
                                   <div className="flex items-center gap-2">
                                      <Sparkles size={20} className="text-emerald-500 fill-emerald-50"/>
                                      <h3 className="text-2xl font-black text-[#0F172A] italic">Recent Output</h3>
                                   </div>
                                   <p className="text-slate-400 text-[10px] font-black  tracking-widest pl-7">Latest Content Movement</p>
                                </div>
                                <div className="space-y-4">
                                   {contentPlans.slice(0, 3).map(cp => (
                                      <div key={cp.id} className="flex gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all cursor-pointer">
                                         <div className={`w-10 h-10 rounded-[14px] bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${cp.platform === "tiktok" ? "text-[#0F172A]" : cp.platform === "threads" ? "text-slate-950" : "text-rose-500"}`}>
                                            {cp.platform === "tiktok" ? <Play size={16} className="fill-current"/> : cp.platform === "threads" ? <AtSign size={16}/> : <Palette size={16}/>}
                                         </div>
                                         <div className="flex-1">
                                            <p className="text-xs font-bold text-slate-600 leading-tight">
                                               <span className="font-black text-[#0F172A]">
                                                  {(() => {
                                                     const creator = members.find(m => m.profile?.id === cp.created_by)?.profile;
                                                     return creator?.full_name ? creator.full_name.split(' ')[0] : 'System';
                                                  })()}
                                               </span> updated <span className="italic truncate inline-flex max-w-[120px] ml-1 align-bottom">"{cp.title}"</span>
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1  tracking-wider">
                                               {cp.status.replace('_', ' ')} • {new Date(cp.created_at).toLocaleTimeString('id-id', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                         </div>
                                      </div>
                                   ))}
                                   {contentPlans.length === 0 && (
                                       <div className="p-6 text-center bg-slate-50 rounded-[24px] border border-slate-100/50">
                                          <LayoutDashboard size={24} className="mx-auto text-slate-300 mb-2"/>
                                          <p className="text-xs font-bold text-slate-400">No output recorded yet.</p>
                                       </div>
                                   )}
                                </div>
                             </div>
                          </div>
                       </Card>
                    </div>

                    {/* 3. Team Performance & Quick View */}
                    <div className="space-y-8">
                       <Card className="p-8 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[40px] space-y-8">
                          <div className="space-y-1">
                             <h4 className="text-lg font-black text-[#0F172A] italic">Core Authorities</h4>
                             <p className="text-[9px] font-black text-slate-400  tracking-[0.2em]">Active Collaborators</p>
                          </div>
                          <div className="space-y-6">
                             {members.slice(0, 5).map((m: any) => (
                                <div key={m.id} className="flex items-center gap-5 group">
                                   <div className="relative">
                                      <div className="w-14 h-14 rounded-[22px] bg-white overflow-hidden border border-slate-100 shadow-sm group-hover:scale-105 transition-all">
                                         <img 
                                            src={m.profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${m.profile?.full_name}`} 
                                            className="w-full h-full object-contain p-2 relative z-10"
                                            alt={m.profile?.full_name}
                                         />
                                      </div>
                                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-[3px] border-white shadow-sm z-20"/>
                                   </div>
                                   <div className="flex-1 overflow-hidden">
                                      <p className="text-xs font-black text-[#0F172A] truncate italic">{m.profile?.full_name}</p>
                                      <p className="text-[9px] font-bold text-slate-400  tracking-widest truncate">{m.role || 'Authority'}</p>
                                   </div>
                                   <Link href="#" className="p-2 text-slate-200 hover:text-emerald-500 transition-colors"><MessageSquare size={14}/></Link>
                                </div>
                             ))}
                          </div>
                          <Button 
                             onClick={() => setActiveTab('members')}
                             className="w-full h-12 bg-slate-50 text-slate-500 hover:bg-emerald-500 hover:text-white rounded-xl text-[10px] font-black  tracking-widest transition-all"
                          >
                             Manage Workspace Team
                          </Button>
                       </Card>

                       {/* Strategic Progress Widget */}
                       <Card className="p-8 bg-emerald-600 text-white rounded-[40px] shadow-2xl relative overflow-hidden group">
                          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-all duration-1000"/>
                          <div className="relative z-10 space-y-6">
                             <div className="space-y-1">
                                <p className="text-[9px] font-black  tracking-widest text-emerald-200">Current Phase Focus</p>
                                <h4 className="text-xl font-black italic">{roadmaps.find(r => r.status === 'in_progress')?.title || 'Next Strategy Ready'}</h4>
                             </div>
                             <div className="space-y-3">
                                {(() => {
                                   const activePhase = roadmaps.find(r => r.status === 'in_progress');
                                   if (!activePhase) return (
                                      <p className="text-[10px] font-bold text-emerald-200 italic opacity-50">Strategic landscape is clear for now.</p>
                                   );
                                   
                                   const isMember = activePhase.kpi_members?.some((km: any) => km.profile_id === currentUserProfile?.id);
                                   if (isMember) {
                                      const myMilestones = activePhase.milestones?.filter((m: any) => m.assigned_to === currentUserProfile?.id) || [];
                                      const myTotal = myMilestones.length;
                                      const myCompleted = myMilestones.filter((m: any) => m.is_completed).length;
                                      const myProgress = myTotal > 0 ? Math.round((myCompleted / myTotal) * 100) : 0;
                                      return (
                                         <div className="space-y-4">
                                            <div className="p-4 bg-white/10 rounded-2xl border border-white/5 shadow-inner">
                                               <div className="flex justify-between items-center mb-1">
                                                  <span className="text-[9px] font-black  tracking-widest text-emerald-100">Your Actions</span>
                                                  <span className="text-sm font-black">{myProgress}%</span>
                                               </div>
                                               <div className="h-1.5 w-full bg-emerald-900/30 rounded-full overflow-hidden">
                                                  <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${myProgress}%` }}/>
                                               </div>
                                            </div>
                                            <div className="flex justify-between items-end">
                                               <div className="space-y-0.5">
                                                  <p className="text-[10px] font-black  tracking-widest text-emerald-100 italic">Total Force</p>
                                                  <p className="text-2xl font-black italic tracking-tighter">{activePhase.progress}%</p>
                                               </div>
                                               <Target size={20} className="text-emerald-300 opacity-50 mb-1"/>
                                            </div>
                                         </div>
                                      );
                                   }
                                   
                                   return (
                                       <>
                                         <div className="flex justify-between items-end">
                                            <p className="text-[32px] font-black italic">{activePhase.progress || 0}%</p>
                                            <Target size={24} className="text-emerald-300 opacity-50"/>
                                         </div>
                                         <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden">
                                            <motion.div 
                                              initial={{ width: 0 }}
                                              animate={{ width: `${activePhase.progress || 0}%` }}
                                              className="h-full bg-white"
                                            />
                                          </div>

                                       </>
                                      
                                   );
                                })()}
                             </div>
                          </div>
                       </Card>
                    </div>
                 </div>
              </div>
           )}

           {activeTab === "content" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                       <h3 className="text-3xl font-black text-[#0F172A] italic">
                          Content Production Line
                          {selectedAccountId !== "all" && (
                             <span className="text-emerald-500 ml-2">
                                — {accounts.find(a => a.id === selectedAccountId)?.name}
                             </span>
                          )}
                       </h3>
                       <p className="text-slate-400 text-sm font-medium italic">Manage your content lifecycle from strategy to publishing.</p>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-slate-100/50 p-2 rounded-2xl border border-slate-100">
                        <select 
                           value={selectedPeriod}
                           onChange={(e) => setSelectedPeriod(e.target.value)}
                           className="bg-transparent border-none text-[10px] font-black  tracking-widest text-[#0F172A] px-4 py-2 focus:outline-none cursor-pointer"
                        >
                           <option value="all">All Time</option>
                           <option value="unscheduled">Unscheduled</option>
                           <optgroup label="Periods">
                              {(() => {
                                 const options = [];
                                 const now = new Date();
                                 for (let i = -6; i <= 6; i++) {
                                    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
                                    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                                    const label = d.toLocaleDateString('id-id', { month: 'long', year: 'numeric' });
                                    options.push(<option key={val} value={val}>{label}</option>);
                                 }
                                 return options;
                              })()}
                           </optgroup>
                        </select>
                        <div className="w-[1px] h-6 bg-slate-200 mx-1"/>
                        {[
                          { id: "table", icon: <Table2 size={16}/> },
                          { id: "kanban", icon: <Kanban size={16}/> },
                          { id: "calendar", icon: <CalendarIcon size={16}/> }
                        ].map((v) => (
                         <button 
                           key={v.id}
                           onClick={() => setContentView(v.id as any)}
                           className={`p-3 rounded-xl transition-all ${contentView === v.id ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                         >
                           {v.icon}
                         </button>
                       ))}
                       <div className="w-[1px] h-6 bg-slate-200 mx-1"/>
                       <Button onClick={handleOpenNewTask} className="bg-emerald-600 text-white h-11 px-6 rounded-xl font-bold text-xs">
                         <Plus size={16} className="mr-2"/> New Content
                       </Button>
                    </div>
                 </div>

                 <div className="flex flex-wrap items-center gap-3">
                    {["all", "tiktok", "instagram", "threads", "youtube", "facebook"].map(plat => (
                       <button
                         key={plat}
                         onClick={() => setPlatformFilter(plat)}
                         className={`px-5 py-2 rounded-xl text-[10px] font-black  tracking-widest transition-all ${platformFilter === plat ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "bg-white text-slate-400 hover:text-slate-600 border border-slate-100"}`}
                       >
                         {plat === "all" ? "All Platforms" : plat}
                       </button>
                    ))}
                 </div>

                 {(() => {
                    const filteredPlans = contentPlans.filter(p => {
                        const matchesPlatform = platformFilter === "all" || p.platform === platformFilter;
                        if (!matchesPlatform) return false;
                        
                        if (selectedPeriod === "all") return true;
                        if (selectedPeriod === "unscheduled") return !p.due_date;
                        
                        if (!p.due_date) return false;
                        
                        try {
                           const d = new Date(p.due_date);
                           const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                           return yearMonth === selectedPeriod;
                        } catch (e) {
                           return false;
                        }
                     });

                    return (
                       <>
                         {contentView === "table" && (
                            <Card className="p-0 border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden rounded-[40px]">
                               <div className="overflow-x-auto">
                                  <table className="w-full">
                                     <thead>
                                        <tr className="bg-slate-50/50">
                                           <th className="px-8 py-5 text-left text-[10px] font-black  tracking-widest text-slate-400">Content / Pillar</th>
                                           <th className="px-8 py-5 text-left text-[10px] font-black  tracking-widest text-slate-400">Platform</th>
                                           <th className="px-8 py-5 text-left text-[10px] font-black  tracking-widest text-slate-400">Phase</th>
                                           <th className="px-8 py-5 text-left text-[10px] font-black  tracking-widest text-slate-400">Pic</th>
                                           <th className="px-8 py-5 text-left text-[10px] font-black  tracking-widest text-slate-400">Due Date</th>
                                           <th className="px-8 py-5 text-left text-[10px] font-black  tracking-widest text-slate-400">Assets</th>
                                           <th className="px-8 py-5 text-left text-[10px] font-black  tracking-widest text-slate-400">Live Link</th>
                                           <th className="px-8 py-5 text-right text-[10px] font-black  tracking-widest text-slate-400">Action</th>
                                        </tr>
                                     </thead>
                                     <tbody>
                                        {filteredPlans.map((plan) => (
                                           <tr key={plan.id} className={`border-b border-slate-50 hover:bg-slate-50/30 transition-all relative ${plan.status === "approved" ? "bg-emerald-50/10" : ""}`}>
                                              <td className="px-8 py-6 relative">
                                                 {plan.status === "approved" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"/>}
                                                 <div className="space-y-1">
                                                    <p className="text-sm font-black text-[#0F172A] flex items-center gap-2">
                                                       {plan.headline || plan.title}
                                                       {plan.status === "approved" && <ShieldCheck size={14} className="text-emerald-500 animate-pulse flex-shrink-0"/>}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                       <span className="text-[9px] font-black px-2 py-0.5 rounded bg-slate-100 text-slate-500 ">{plan.content_pillar || "No Pillar"}</span>
                                                    </div>
                                                 </div>
                                              </td>
                                              <td className="px-8 py-6">
                                                 <span className="text-[10px] font-black  text-slate-400">{plan.platform}</span>
                                              </td>
                                              <td className="px-8 py-6">
                                                  <select 
                                                    value={plan.status} 
                                                    onChange={(e) => handleUpdateTaskStatus(plan.id, e.target.value)} 
                                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black  w-fit border outline-none cursor-pointer hover:scale-105 transition-all appearance-none text-center ${ 
                                                      statusConfig[plan.status]?.bg || "bg-slate-50"
                                                    } ${ 
                                                      statusConfig[plan.status]?.color || "text-slate-600"
                                                    } ${ 
                                                      statusConfig[plan.status]?.border || "border-slate-100"
                                                    }`} 
                                                  > 
                                                    {Object.entries(statusConfig).map(([key, config]) => (
                                                      <option key={key} value={key}>{config.label}</option>
                                                    ))}
                                                  </select>
                                              </td>
                                              <td className="px-8 py-6">
                                                  {(() => {
                                                     const picId = (plan.assigned_to && plan.assigned_to !== "" ? plan.assigned_to : null) || plan.created_by;
                                                     let pic = members.find(m => (m.profile?.id || m.user?.id) === picId)?.profile || members.find(m => m.profile_id === picId)?.profile; if (!pic && (!picId || picId === 'legacy-admin')) { const d = members.find(m => (m.profile?.full_name || m.user?.full_name)?.toLowerCase().includes('dinur')); pic = d?.profile || d?.user; }
                                                     if (!pic && (currentUserProfile?.id === picId || (!picId && isLegacyAdmin()))) pic = currentUserProfile; 
                                                     const displayName = pic?.full_name || (!picId && isLegacyAdmin() ? currentUserProfile?.full_name : null) || (picId === 'legacy-admin' || !picId ? "Dinur" : "Unassigned");

                                                     return (
                                                        <div className="flex items-center gap-2 group/pic relative">
                                                           <span className="text-[10px] font-bold text-slate-600 truncate max-w-[80px]">{displayName}</span>
                                                        </div>
                                                     );
                                                  })()}
                                               </td>
                                              <td className="px-8 py-6 text-xs font-bold text-slate-600">
                                                 {plan.due_date ? new Date(plan.due_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
                                              </td>
                                              <td className="px-8 py-6">
                                                 <div className="flex flex-wrap items-center gap-2">
                                                    {plan.script_url && (
                                                       <a href={plan.script_url} target="_blank" className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all text-xs font-bold" title="Script">
                                                          <FileText size={14}/>
                                                          <span>Script</span>
                                                       </a>
                                                    )}
                                                    {plan.result_url && (
                                                       <a href={plan.result_url} target="_blank" className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all text-xs font-bold" title="Result Content">
                                                          <Video size={14}/>
                                                          <span>Konten</span>
                                                       </a>
                                                    )}
                                                    {!plan.script_url && !plan.result_url && <span className="text-[10px] text-slate-300 font-bold italic">No Assets</span>}
                                                 </div>
                                              </td>
                                              <td className="px-8 py-6">
                                                 <div className="flex items-center gap-2">
                                                    {plan.published_url ? (
                                                       <a href={plan.published_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold text-[9px] hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                                                          <LinkIcon size={12}/> Link Post
                                                       </a>
                                                    ) : editingLinkId === plan.id ? (
                                                       <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                                                          <input 
                                                            value={tempLinkValue}
                                                            onChange={(e) => setTempLinkValue(e.target.value)}
                                                            placeholder="Paste link..."
                                                            className="h-9 w-40 rounded-lg bg-slate-50 border border-slate-200 px-3 text-[10px] font-bold focus:outline-none ring-2 ring-emerald-500/10"
                                                          />
                                                          <button 
                                                             onClick={() => handleUpdatePostLink(plan.id, tempLinkValue)}
                                                             className="h-9 px-3 bg-emerald-600 text-white rounded-lg font-bold text-[9px] hover:bg-emerald-700 transition-all shrink-0"
                                                          >
                                                            Save
                                                          </button>
                                                          <button 
                                                             onClick={() => setEditingLinkId(null)}
                                                             className="p-2 text-slate-400 hover:text-red-500 transition-all"
                                                          >
                                                            <X size={14}/>
                                                          </button>
                                                       </div>
                                                    ) : (
                                                       <button 
                                                         onClick={() => { setEditingLinkId(plan.id); setTempLinkValue(""); }}
                                                         className="px-4 py-2 bg-slate-50 text-slate-400 border border-slate-100 rounded-xl font-bold text-[9px] hover:bg-slate-100 transition-all flex items-center gap-2"
                                                       >
                                                         <Plus size={10}/> Input Post Link
                                                       </button>
                                                    )}
                                                 </div>
                                              </td>
                                              <td className="px-8 py-6 text-right">
                                                 <div className="flex items-center justify-end gap-2 text-slate-300">
                                                    {plan.status === "uploaded" && (
                                                       <button 
                                                          onClick={() => openMetricsModal(plan)}
                                                          className="p-2 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all"
                                                          title="Update Performance Metrics"
                                                       >
                                                          <BarChart2 size={16}/>
                                                       </button>
                                                    )}
                                                    <button onClick={() => openEditModal(plan)} className="p-2 hover:bg-slate-100 hover:text-emerald-600 rounded-lg transition-all" title="Edit Content"><Settings size={16}/></button>
                                                    <button onClick={() => { setTaskToDelete(plan); setIsDeleteModalOpen(true); }} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all" title="Delete"><Trash2 size={16}/></button>
                                                 </div>
                                              </td>
                                           </tr>
                                        ))}
                                     </tbody>
                                  </table>
                               </div>
                            </Card>
                         )}

                         {contentView === "kanban" && (
                            <div className="flex gap-8 overflow-x-auto pb-10 no-scrollbar">
                               {Object.entries(statusConfig).map(([status, config]) => (
                                  <div key={status} className="flex-shrink-0 w-[400px] space-y-6">
                                     <div className="flex items-center justify-between px-4">
                                        <div className="flex items-center gap-3">
                                           <div className={`w-3 h-3 rounded-full ${config.dot} shadow-sm shadow-black/5`}/>
                                           <h4 className="text-sm font-black text-[#0F172A]  tracking-widest">{config.label}</h4>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-300 bg-slate-100 px-3 py-1.5 rounded-xl">
                                          {filteredPlans.filter(p => p.status === status).length}
                                        </span>
                                     </div>
                                     
                                     <div className="space-y-4 min-h-[400px]">
                                        {filteredPlans.filter(p => p.status === status).map((plan) => (
                                           <Card key={plan.id} className="p-6 bg-white border border-slate-100 shadow-lg shadow-slate-200/50 rounded-3xl space-y-4 hover:border-emerald-200 transition-all cursor-grab active:cursor-grabbing">
                                              <div className="flex items-center justify-between">
                                                 <span className="text-[9px] font-black text-slate-400  tracking-widest">{plan.platform}</span>
                                                 <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{plan.content_pillar || "Default"}</span>
                                              </div>
                                              <h5 className="text-sm font-black text-[#0F172A] leading-snug">{plan.headline || plan.title}</h5>
                                              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                                  <div className="flex items-center gap-2"> 
                                                     {(() => {
                                                         const picId = (plan.assigned_to && plan.assigned_to !== "" ? plan.assigned_to : null) || plan.created_by;
                                                         let pic = members.find(m => (m.profile?.id || m.user?.id) === picId)?.profile || members.find(m => m.profile_id === picId)?.profile; if (!pic && (!picId || picId === 'legacy-admin')) { const d = members.find(m => (m.profile?.full_name || m.user?.full_name)?.toLowerCase().includes('dinur')); pic = d?.profile || d?.user; }
                                                         if (!pic && (currentUserProfile?.id === picId || (!picId && isLegacyAdmin()))) pic = currentUserProfile; 
                                                         const displayName = pic?.full_name || (!picId && isLegacyAdmin() ? currentUserProfile?.full_name : null) || (picId === 'legacy-admin' || !picId ? "Dinur" : "Unassigned");

                                                          return <span className="text-[10px] font-bold text-slate-500 italic">{displayName}</span>;

                                                     })()}
                                                  </div>
                                                 <span className="text-[9px] font-black text-slate-300 ">{plan.due_date ? new Date(plan.due_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }) : "-"}</span>
                                              </div>
                                           </Card>
                                        ))}
                                     </div>
                                  </div>
                               ))}
                            </div>
                         )}

                         {contentView === "calendar" && (() => {
                           const year = currentCalendarDate.getFullYear();
                           const month = currentCalendarDate.getMonth();
                           const daysInMonth = new Date(year, month + 1, 0).getDate();
                           const firstDayOfMonth = new Date(year, month, 1).getDay();
                           const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
                           const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

                           return (
                             <Card className="p-10 bg-white border-none shadow-2xl shadow-slate-200/40 rounded-[44px] space-y-8 animate-in fade-in zoom-in-95 duration-500">
                               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                                 <div className="flex items-center gap-5">
                                   <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center shadow-inner">
                                      <CalendarIcon size={32}/>
                                   </div>
                                   <div>
                                     <h3 className="text-3xl font-black text-[#0F172A] tracking-tight">{monthNames[month]} {year}</h3>
                                     <div className="flex items-center gap-2 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
                                        <p className="text-[10px] font-black text-slate-400  tracking-[0.2em]">
                                          {filteredPlans.filter(p => {
                                            if (!p.due_date) return false;
                                            const d = new Date(p.due_date);
                                            return d.getMonth() === month && d.getFullYear() === year;
                                          }).length} Tasks This Month
                                        </p>
                                     </div>
                                   </div>
                                 </div>
                                 <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-[24px] border border-slate-100/50">
                                   <button 
                                     onClick={() => setCurrentCalendarDate(new Date(year, month - 1, 1))}
                                     className="w-12 h-12 flex items-center justify-center bg-white hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-sm"
                                   >
                                     <ChevronLeft size={20}/>
                                   </button>
                                   <button 
                                     onClick={() => setCurrentCalendarDate(new Date())}
                                     className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black  tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:scale-105 active:scale-95 transition-all"
                                   >
                                     Today
                                   </button>
                                   <button 
                                     onClick={() => setCurrentCalendarDate(new Date(year, month + 1, 1))}
                                     className="w-12 h-12 flex items-center justify-center bg-white hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-sm"
                                   >
                                     <ChevronRight size={20}/>
                                   </button>
                                 </div>
                               </div>

                               <div className="grid grid-cols-7 gap-3">
                                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                                     <div key={day} className="py-4 text-center text-[10px] font-black  text-slate-300 tracking-[0.4em]">{day}</div>
                                  ))}
                                  {blanks.map(b => (
                                     <div key={`blank-${b}`} className="min-h-[160px] rounded-[32px] bg-slate-50/20 border border-slate-50/30"></div>
                                  ))}
                                  {days.map(day => {
                                     const plansOnThisDay = filteredPlans.filter(p => {
                                        if (!p.due_date) return false;
                                        const d = new Date(p.due_date);
                                        return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
                                     });
                                     const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

                                     return (
                                        <div key={day} className={`min-h-[160px] p-4 rounded-[32px] border transition-all group ${isToday ? "bg-emerald-50/30 border-emerald-100" : "border-slate-100/50 hover:bg-slate-50"}`}>
                                           <div className="flex items-center justify-between mb-2">
                                             <span className={`text-xs font-black ${isToday ? "w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20" : "text-slate-400"}`}>{day}</span>
                                           </div>
                                           <div className="space-y-2">
                                              {plansOnThisDay.map(plan => (
                                                <div key={plan.id} onClick={() => handleOpenPreview(plan)} className="p-2 bg-white rounded-xl border border-slate-50 shadow-sm cursor-pointer hover:border-emerald-500 transition-all">
                                                   <p className="text-[9px] font-black text-[#0F172A] line-clamp-1 truncate">{plan.headline || plan.title}</p>
                                                </div>
                                              ))}
                                              {plansOnThisDay.length === 0 && (
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50/50 rounded-2xl p-3 flex items-center justify-center border border-dashed border-slate-200">
                                                   <Plus size={12} className="text-slate-300"/>
                                                </div>
                                              )}
                                           </div>
                                        </div>
                                     );
                                  })}
                               </div>
                              </Card>
                            );

                          })()}
                        </>
                     );
                 })()}

                 {contentPlans.length === 0 && (
                    <div className="py-40 text-center space-y-6 bg-white rounded-[44px] border border-slate-50 shadow-sm">
                       <Layers size={60} className="mx-auto text-slate-100"/>
                       <div className="space-y-2">
                          <h3 className="text-xl font-black text-[#0F172A]">Belum Ada Antrean Konten</h3>
                          <p className="text-slate-400 text-sm font-medium max-w-sm mx-auto italic">Mulai kolaborasi dengan menambahkan tugas konten pertama tim Anda.</p>
                       </div>
                    </div>
                 )}
              </div>
           )}
          {activeTab === 'meetings' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                       <h2 className="text-3xl font-black text-[#0F172A] italic">Sync & Meetings</h2>
                       <p className="text-slate-500 text-sm font-medium mt-1">Jangan lewatkan kolaborasi tim dan sync client terdekat.</p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                       <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                          <button 
                             onClick={() => setMeetingFilter('upcoming')}
                             className={`px-5 py-2 rounded-xl text-[10px] font-black  tracking-widest transition-all ${meetingFilter === 'upcoming' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                             Upcoming
                          </button>
                          <button 
                             onClick={() => setMeetingFilter('past')}
                             className={`px-5 py-2 rounded-xl text-[10px] font-black  tracking-widest transition-all ${meetingFilter === 'past' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                             Past Sync
                          </button>
                       </div>
                       <Button 
                          onClick={() => {
                            setEditingMeeting(null);
                            setMeetingForm({ title: "", description: "", start_time: "", end_time: "", meeting_link: "", category: "internal" });
                            setIsMeetingModalOpen(true);
                          }}
                          className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black text-sm shadow-xl shadow-slate-900/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                       >
                          <Video size={18}/> Schedule Sync
                       </Button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                   {(() => {
                      const filteredMeetings = meetings.filter(m => {
                         const isPast = new Date(m.end_time || m.start_time) < new Date();
                         return meetingFilter === 'upcoming' ? !isPast : isPast;
                      });

                      return filteredMeetings.length > 0 ? filteredMeetings.map((meeting) => {
                         const isLive = new Date() >= new Date(meeting.start_time) && new Date() <= new Date(meeting.end_time || new Date(new Date(meeting.start_time).getTime() + 3600000));
                         const isPast = new Date(meeting.end_time || meeting.start_time) < new Date();
                         
                         return (
                            <Card key={meeting.id} className={`p-8 border-none bg-white shadow-2xl shadow-slate-200/50 rounded-[40px] space-y-6 group hover:border-emerald-200 transition-all relative overflow-hidden ${isPast ? 'opacity-70 grayscale-[0.3]' : ''}`}>
                               {isLive && <div className="absolute top-0 right-0 px-6 py-2 bg-rose-500 text-white text-[10px] font-black  tracking-widest rounded-bl-3xl animate-pulse">Live Now</div>}
                               {isPast && <div className="absolute top-0 right-0 px-6 py-2 bg-slate-100 text-slate-400 text-[10px] font-black  tracking-widest rounded-bl-3xl">Finished</div>}
                               
                               <div className="flex items-start justify-between">
                                  <div className={`p-4 rounded-2xl ${
                                     isPast ? 'bg-slate-50 text-slate-400' :
                                     meeting.category === 'client' ? 'bg-blue-50 text-blue-600' : 
                                     meeting.category === 'review' ? 'bg-amber-50 text-amber-600' : 
                                     'bg-emerald-50 text-emerald-600'
                                  }`}>
                                     {meeting.category === 'client' ? <Users size={24}/> : <Video size={24}/>}
                                  </div>
                               <div className="flex gap-4">
                                  {isAdmin && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); openEditMeetingModal(meeting); }}
                                        className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                                      >
                                        <Edit size={14}/>
                                      </button>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteMeeting(meeting.id); }}
                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                      >
                                        <Trash2 size={14}/>
                                      </button>
                                    </div>
                                  )}
                                  <div className="text-right">
                                     <p className="text-[10px] font-black text-slate-400  tracking-widest">{meeting.category}</p>
                                     <p className="text-sm font-black text-[#0F172A] mt-1">{new Date(meeting.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                  </div>
                               </div>
                            </div>

                            <div className="space-y-2">
                               <h3 className="text-lg font-black text-[#0F172A] leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2">{meeting.title}</h3>
                               <p className="text-slate-500 text-xs font-medium leading-relaxed line-clamp-2">{meeting.description || 'Agenda kolaborasi mingguan agensi.'}</p>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between gap-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-100 p-1">
                                     <img 
                                        src={meeting.creator?.avatar_url || currentUserProfile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${meeting.creator?.full_name || (currentUserProfile?.full_name || 'A')}`} 
                                        className="w-full h-full object-contain" 
                                     />
                                  </div>
                                  <div className="flex flex-col">
                                     <span className="text-[10px] font-black text-slate-400  tracking-tighter">Organized by</span>
                                     <span className="text-[11px] font-bold text-[#0F172A] leading-none">
                                        {meeting.creator?.full_name || (currentUserProfile?.full_name || "Dinur")}
                                     </span>
                                  </div>
                               </div>
                               <div className="flex items-center gap-2">
                                  {/* Attendee Avatars */}
                                  <div className="flex -space-x-2 mr-2">
                                     {(meeting.attendees || []).slice(0, 3).map((a: any) => (
                                        <div key={a.id} className="w-7 h-7 rounded-lg border-2 border-white bg-slate-50 overflow-hidden shadow-sm">
                                           <img src={a.profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${a.profile?.full_name}`} className="w-full h-full object-contain" alt="attendee"/>
                                        </div>
                                     ))}
                                     {(meeting.attendees?.length || 0) > 3 && (
                                        <div className="w-7 h-7 rounded-lg border-2 border-white bg-slate-900 text-white flex items-center justify-center text-[8px] font-black">
                                           +{(meeting.attendees?.length || 0) - 3}
                                        </div>
                                     )}
                                  </div>
                                  {meeting.meeting_link && (
                                     <a 
                                        href={meeting.meeting_link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="h-10 px-4 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-900/10 text-[10px] font-black  tracking-widest"
                                     >
                                        Join Meeting <ArrowUpRight size={14}/>
                                     </a>
                                  )}
                               </div>
                            </div>
                         </Card>
                      )
                   }) : (
                      <div className="col-span-full py-24 text-center space-y-6">
                         <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto">
                            <CalendarIcon size={40} className="text-slate-200"/>
                         </div>
                         <div className="space-y-2">
                            <h3 className="text-xl font-black text-[#0F172A]">Belum ada jadwal tersimpan</h3>
                            <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto italic">Tentukan koordinasi tim Anda dengan membuat jadwal sinkronisasi pertama.</p>
                         </div>
                         <Button 
                            onClick={() => {
                              setEditingMeeting(null);
                              setMeetingForm({ title: "", description: "", start_time: "", end_time: "", meeting_link: "", category: "internal" });
                              setIsMeetingModalOpen(true);
                            }}
                            className="bg-emerald-600 text-white h-14 px-10 rounded-2xl font-black shadow-xl shadow-emerald-500/20"
                         >
                            Schedule Now
                         </Button>
                      </div>
                       );
                    })()}
                </div>
             </div>
          )}

          {activeTab === 'roadmap' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                       <h3 className="text-3xl font-black text-[#0F172A] italic">
                          Strategic Roadmap
                          {selectedAccountId !== 'all' && (
                             <span className="text-emerald-500 ml-2">
                                — {accounts.find(a => a.id === selectedAccountId)?.name}
                             </span>
                          )}
                       </h3>
                       <p className="text-slate-400 text-sm font-medium italic">High-level strategic phases for this agency operations.</p>
                    </div>
                    {isAdmin && (
                      <Button onClick={() => setIsRoadmapModalOpen(true)} className="bg-slate-900 text-white h-14 px-8 rounded-2xl font-black text-sm shadow-xl shadow-slate-900/10">
                         <Plus size={18} className="mr-2"/> New Phase
                      </Button>
                    )}
                 </div>

                 {roadmaps.length === 0 ? (
                    <div className="py-20 text-center space-y-6">
                       <Target size={44} className="mx-auto text-slate-200"/>
                       <h3 className="text-xl font-black text-[#0F172A]">No Strategic Goals</h3>
                       {isAdmin && <Button onClick={() => setIsRoadmapModalOpen(true)} className="bg-emerald-500 text-white h-12 px-8 rounded-xl font-bold">Set First Goal</Button>}
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {roadmaps.map((phase) => (
                          <Card 
                            key={phase.id} 
                            onClick={() => setSelectedRoadmap(phase)}
                            className="p-6 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[40px] hover:border-emerald-500 transition-all cursor-pointer group relative overflow-hidden"
                          >
                             <div className="flex items-center justify-between mb-4">
                                <span className={`px-3 py-1 rounded-full text-[8px] font-black  tracking-[0.2em] ${
                                   phase.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 
                                   phase.status === 'in_progress' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'
                                }`}>
                                   {phase.status.replace('_', ' ')}
                                </span>
                                <span className="text-[9px] font-black text-slate-300  italic">
                                   {phase.target_date ? new Date(phase.target_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : 'PLAN'}
                                </span>
                             </div>

                             <h4 className="text-lg font-black text-[#0F172A] leading-tight mb-2 group-hover:text-emerald-600 transition-colors">{phase.title}</h4>
                             <p className="text-slate-400 text-[11px] font-medium line-clamp-2 mb-6">{phase.description}</p>

                             <div className="space-y-2 mt-auto">
                                <div className="flex items-center justify-between">
                                   <span className="text-[9px] font-black text-slate-300 ">Growth Progress</span>
                                   <span className="text-[10px] font-black text-emerald-600">{phase.progress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                   <motion.div 
                                     initial={{ width: 0 }}
                                     animate={{ width: `${phase.progress}%` }}
                                     className={`h-full ${phase.status === 'completed' ? 'bg-emerald-500' : 'bg-emerald-400'}`}
                                   />
                                </div>
                             </div>

                             <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                   <div className="w-2 h-2 rounded-full bg-slate-200"/>
                                   <span className="text-[10px] font-bold text-slate-400 italic">
                                      {phase.milestones?.filter((m:any) => m.is_completed).length || 0}/{phase.milestones?.length || 0} Milestones
                                   </span>
                                </div>
                                <div className="flex -space-x-2">
                                   {(phase.kpi_members || []).slice(0, 4).map((km: any) => (
                                      <div key={km.id} className="w-7 h-7 rounded-xl border-2 border-white bg-slate-50 overflow-hidden shadow-sm">
                                         <img src={km.profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${km.profile?.full_name}`} className="w-full h-full object-contain" alt="member"/>
                                      </div>
                                   ))}
                                   {(phase.kpi_members?.length || 0) === 0 && (
                                      <span className="text-[9px] font-bold text-slate-300 italic">No members</span>
                                   )}
                                </div>
                             </div>
                          </Card>
                       ))}
                    </div>
                 )}
              </div>
           )}

          {activeTab === 'members' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                       <h3 className="text-3xl font-black text-[#0F172A] italic">Workspace Authorities</h3>
                       <p className="text-slate-400 text-sm font-medium italic">Control team access and assignment roles within this agency environment.</p>
                    </div>
                    {isAdmin && (
                      <Button onClick={() => setIsMemberModalOpen(true)} className="bg-slate-900 text-white h-14 px-8 rounded-2xl font-black text-sm shadow-xl shadow-slate-900/10">
                         <UserPlus size={18} className="mr-2"/> Invite New Authority
                      </Button>
                    )}
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {members.map((member) => (
                      <Card 
                         key={member.id} 
                         onClick={() => isAdmin && openEditMemberModal(member)}
                         className={`p-8 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[40px] space-y-6 group hover:border-emerald-200 transition-all relative overflow-hidden ${isAdmin ? 'cursor-pointer' : ''}`}
                      >
                         <div className="absolute top-0 right-0 p-6">
                            {member.profile?.role === 'owner' ? (
                               <ShieldCheck className="text-emerald-500" size={24}/>
                            ) : isAdmin ? (
                               <button 
                                 onClick={() => handleRemoveMember(member.id)}
                                 className="p-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-lg shadow-red-500/10"
                               >
                                  <Trash2 size={16}/>
                               </button>
                            ) : null}
                         </div>

                         <div className="flex items-center gap-5">
                            <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                               {member.profile?.avatar_url ? (
                                  <img src={member.profile.avatar_url} className="w-full h-full object-contain p-2" />
                               ) : (
                                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                     <User size={32}/>
                                  </div>
                               )}
                            </div>
                            <div className="space-y-1">
                               <h4 className="text-xl font-black text-[#0F172A] leading-tight">{member.profile?.full_name || "New Authority"}</h4>
                               <p className="text-emerald-500 text-[10px] font-black  tracking-widest bg-emerald-50 px-2 py-0.5 rounded w-fit">{member.role || "Member"}</p>
                            </div>
                         </div>

                         <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                            <div className="space-y-0.5">
                               <p className="text-[9px] font-black text-slate-300  tracking-widest">Linked Identity</p>
                               <p className="text-xs font-bold text-slate-500 truncate max-w-[150px]">{member.profile?.email || 'hidden.identity@ms'}</p>
                            </div>
                            <div className="flex gap-2">
                               <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black">Active</div>
                            </div>
                         </div>
                      </Card>
                   ))}

                    {isAdmin && (
                      <button 
                         onClick={() => setIsMemberModalOpen(true)}
                         className="p-8 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center gap-4 hover:bg-slate-50 hover:border-emerald-300 transition-all group min-h-[250px]"
                      >
                         <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-emerald-500 group-hover:scale-110 transition-all shadow-sm">
                            <Plus size={24}/>
                         </div>
                         <div className="text-center">
                            <p className="text-sm font-black text-slate-400 group-hover:text-emerald-600 transition-colors">Expand Team Access</p>
                            <p className="text-[10px] font-medium text-slate-300">Bring more experts to this space</p>
                         </div>
                      </button>
                    )}
                </div>
             </div>
          )}

          {activeTab === 'analytics' && (() => {
                const getPeriodData = (period: string, customRange?: { start: string, end: string }) => {
                  return contentPlans.filter(p => {
                    if (p.status !== 'uploaded') return false;
                    if (selectedAccountId !== 'all' && p.account_id !== selectedAccountId) return false;
                    if (!p.due_date) return false;
                    const itemDate = new Date(p.due_date);
                    const now = new Date();

                    if (period === 'this_month') {
                      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
                    } else if (period === 'last_month') {
                      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
                      return itemDate.getMonth() === lastMonth.getMonth() && itemDate.getFullYear() === lastMonth.getFullYear();
                    } else if (period === 'prev_last_month') {
                       const target = new Date(now.getFullYear(), now.getMonth() - 2);
                       return itemDate.getMonth() === target.getMonth() && itemDate.getFullYear() === target.getFullYear();
                    } else if (period === 'custom' && customRange?.start && customRange?.end) {
                      const start = new Date(customRange.start);
                      const end = new Date(customRange.end);
                      end.setHours(23, 59, 59, 999);
                      return itemDate >= start && itemDate <= end;
                    } else if (period === 'prev_custom' && customRange?.start && customRange?.end) {
                       const start = new Date(customRange.start);
                       const end = new Date(customRange.end);
                       const duration = end.getTime() - start.getTime();
                       const prevEnd = new Date(start.getTime() - 1);
                       const prevStart = new Date(prevEnd.getTime() - duration);
                       return itemDate >= prevStart && itemDate <= prevEnd;
                    }
                    return true;
                  });
                };

                const currentContent = getPeriodData(analyticsPeriod, customDateRange);
                const prevPeriodKey = analyticsPeriod === 'this_month' ? 'last_month' : analyticsPeriod === 'last_month' ? 'prev_last_month' : analyticsPeriod === 'custom' ? 'prev_custom' : 'all_time';
                const prevContent = getPeriodData(prevPeriodKey, customDateRange);

                const calcStats = (list: any[]) => {
                   const views = list.reduce((acc, p) => acc + (Number(p.views) || 0), 0);
                   const interactions = list.reduce((acc, p) => acc + (Number(p.likes||0) + Number(p.comments||0) + Number(p.shares||0) + Number(p.saves||0)), 0);
                   const followers = list.reduce((acc, p) => acc + (Number(p.new_followers || p.follows) || 0), 0);
                   const baseFollowers = selectedAccountId === 'all' 
                      ? accounts.reduce((sum, acc) => sum + (acc.current_followers || 0), 0)
                      : (accounts.find(a => a.id === selectedAccountId)?.current_followers || 0);
                   const totalFollowers = baseFollowers + followers;
                   const er = totalFollowers > 0 ? (interactions / totalFollowers) * 100 : 0;
                   return { views, interactions, followers, totalFollowers, er, count: list.length };
                };

                const stats = calcStats(currentContent);
                const prevStats = calcStats(prevContent);

                const getDiff = (curr: number, prev: number) => {
                   if (prev === 0) return curr > 0 ? 100 : 0;
                   return ((curr - prev) / prev) * 100;
                };

                const diffs = {
                   views: getDiff(stats.views, prevStats.views),
                   er: getDiff(stats.er, prevStats.er),
                   content: getDiff(stats.count, prevStats.count),
                   interactions: getDiff(stats.interactions, prevStats.interactions),
                   followers: getDiff(stats.followers, prevStats.followers)
                };

                const totalViews = stats.views;
                const totalInteractions = stats.interactions;
                const totalFollowersGained = stats.followers;
                const totalFollowersOverall = stats.totalFollowers;
                const erRate = stats.er.toFixed(2);
                const uploadedContent = currentContent;

                return (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div className="space-y-1">
                      <h3 className="text-3xl font-black text-[#0F172A] italic">
                         Content Performance
                         {selectedAccountId !== 'all' && (
                            <span className="text-emerald-500 ml-2">
                               — {accounts.find(a => a.id === selectedAccountId)?.name}
                            </span>
                         )}
                      </h3>
                      <p className="text-slate-400 text-sm font-medium italic">Measurable impact of your agency's published content.</p>
                   </div>
                   <div className="flex flex-col md:flex-row items-center gap-4">
                       {analyticsPeriod === 'custom' && (
                          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                             <input 
                                type="date" 
                                value={customDateRange.start}
                                onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[10px] font-black  outline-none focus:ring-2 ring-emerald-500/20"
                             />
                             <span className="text-slate-400 font-bold text-xs">to</span>
                             <input 
                                type="date" 
                                value={customDateRange.end}
                                onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[10px] font-black  outline-none focus:ring-2 ring-emerald-500/20"
                             />
                          </div>
                       )}
                       <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                          {[
                            { id: 'this_month', label: 'This Month' },
                            { id: 'last_month', label: 'Last Month' },
                            { id: 'all_time', label: 'All Time' },
                            { id: 'custom', label: 'Custom Range' }
                          ].map(p => (
                            <button
                              key={p.id}
                              onClick={() => setAnalyticsPeriod(p.id as any)}
                              className={`px-6 py-2.5 rounded-xl text-[10px] font-black  tracking-widest transition-all ${analyticsPeriod === p.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                              {p.label}
                            </button>
                          ))}
                       </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
                   {[
                      { label: "Total Views", value: formatNumber(totalViews), diff: diffs.views, icon: <Eye size={20}/>, bg: "bg-blue-50", text: "text-blue-600", activeBg: "group-hover:bg-blue-600" },
                      { label: "Engagement Rate", value: erRate + "%", diff: diffs.er, icon: <TrendingUp size={20}/>, bg: "bg-rose-50", text: "text-rose-600", activeBg: "group-hover:bg-rose-600" },
                      { label: "Content Uploaded", value: uploadedContent.length, diff: diffs.content, icon: <Layers size={20}/>, bg: "bg-emerald-50", text: "text-emerald-600", activeBg: "group-hover:bg-emerald-600" },
                      { label: "Total Interactions", value: formatNumber(totalInteractions), diff: diffs.interactions, icon: <Sparkles size={20}/>, bg: "bg-purple-50", text: "text-purple-600", activeBg: "group-hover:bg-purple-600" },
                      { 
                        label: "New Followers", 
                        value: "+" + formatNumber(totalFollowersGained), 
                        diff: diffs.followers,
                        subValue: `Total: ${formatNumber(totalFollowersOverall)}`,
                        icon: <UserPlus size={20}/>, 
                        bg: "bg-amber-50", 
                        text: "text-amber-600", 
                        activeBg: "group-hover:bg-amber-600" 
                      }
                   ].map((kpi, i) => (
                      <Card key={i} className="p-6 bg-white border-none shadow-2xl shadow-slate-200/50 rounded-[32px] space-y-4 group hover:scale-[1.02] transition-all">
                         <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.bg} ${kpi.text} ${kpi.activeBg} group-hover:text-white transition-all shadow-inner`}>
                            {kpi.icon}
                         </div>
                         <div className="space-y-0.5">
                            <div className="flex items-center justify-between">
                               <p className="text-[9px] font-black text-slate-400  tracking-widest leading-none">{kpi.label}</p>
                               {kpi.diff !== undefined && analyticsPeriod !== 'all_time' && (
                                  <div className={`flex items-center gap-0.5 text-[10px] font-black ${kpi.diff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                     {kpi.diff >= 0 ? <ArrowUpRight size={10}/> : <TrendingDown size={10}/>}
                                     {Math.abs(kpi.diff).toFixed(0)}%
                                  </div>
                               )}
                            </div>
                            <h4 className="text-2xl font-black text-[#0F172A] tracking-tight">{kpi.value}</h4>
                            {(kpi as any).subValue && (
                               <p className="text-[10px] font-black text-slate-500 italic mt-2 border-t border-slate-100 pt-2 flex items-center justify-between">
                                  <span>Total Followers Overall</span>
                                  <span className="text-emerald-600 font-black tracking-tight">{kpi.subValue?.replace('Total: ', '')}</span>
                               </p>
                            )}
                         </div>
                      </Card>
                   ))}
                </div>

                   <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                      {/* Left: Growth Chart */}
                      <div className="xl:col-span-2 p-8 bg-slate-50/50 rounded-[32px] border border-slate-100 space-y-6">
                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                               <h4 className="text-sm font-black text-[#0F172A] tracking-tight flex items-center gap-2">
                                  <TrendingUp size={16} className="text-emerald-500"/>
                                  Growth Performance Trend
                               </h4>
                               <p className="text-[10px] font-bold text-slate-400  tracking-widest">Daily stats visualizer — last 30 days</p>
                            </div>
                            <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
                               {[
                                 { id: 'views', label: 'Views', icon: <Eye size={12}/> },
                                 { id: 'interactions', label: 'Interactions', icon: <Sparkles size={12}/> },
                                 { id: 'followers', label: 'Followers', icon: <UserPlus size={12}/> }
                               ].map(m => (
                                 <button 
                                   key={m.id}
                                   onClick={() => setActiveChartMetric(m.id as any)}
                                   className={`px-4 py-2 rounded-lg text-[9px] font-black  transition-all flex items-center gap-2 ${activeChartMetric === m.id ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                                 >
                                   {m.icon} {m.label}
                                 </button>
                               ))}
                            </div>
                         </div>

                         <div className="h-[300px] w-full">
                            {(() => {
                               // Generate dates for chart
                               const data: any[] = [];
                               let daysToRender = 30;
                               let startDate = new Date();
                               startDate.setDate(startDate.getDate() - 29);

                               if (analyticsPeriod === 'custom' && customDateRange.start && customDateRange.end) {
                                  const start = new Date(customDateRange.start);
                                  const end = new Date(customDateRange.end);
                                  const diffTime = Math.abs(end.getTime() - start.getTime());
                                  daysToRender = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                                  startDate = start;
                               } else if (analyticsPeriod === 'this_month') {
                                  startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
                                  daysToRender = new Date().getDate();
                               } else if (analyticsPeriod === 'last_month') {
                                  startDate = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
                                  daysToRender = new Date(new Date().getFullYear(), new Date().getMonth(), 0).getDate();
                               }

                               for (let i = 0; i < daysToRender; i++) {
                                  const date = new Date(startDate);
                                  date.setDate(date.getDate() + i);
                                  // Use local date format YYYY-MM-DD instead of UTC to avoid time-zone shifts
                                  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                                  
                                  const dayContent = uploadedContent.filter(c => {
                                     if (!c.due_date) return false;
                                     // Ensure we compare just the date part if it's a full timestamp
                                     const taskDate = c.due_date.split('T')[0];
                                     return taskDate === dateStr;
                                  });
                                  const val = activeChartMetric === 'views' 
                                    ? dayContent.reduce((sum, c) => sum + (Number(c.views) || 0), 0)
                                    : activeChartMetric === 'interactions'
                                    ? dayContent.reduce((sum, c) => sum + (Number(c.likes||0) + Number(c.comments||0) + Number(c.shares||0) + Number(c.saves||0)), 0)
                                    : dayContent.reduce((sum, c) => sum + (Number(c.new_followers || c.follows) || 0), 0);

                                  data.push({
                                     name: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                                     value: val
                                  });
                               }

                               return (
                                  <ResponsiveContainer width="100%" height="100%">
                                     <AreaChart data={data}>
                                        <defs>
                                           <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                              <stop offset="5%" stopColor={activeChartMetric === 'views' ? '#3B82F6' : activeChartMetric === 'interactions' ? '#A855F7' : '#F59E0B'} stopOpacity={0.1}/>
                                              <stop offset="95%" stopColor={activeChartMetric === 'views' ? '#3B82F6' : activeChartMetric === 'interactions' ? '#A855F7' : '#F59E0B'} stopOpacity={0}/>
                                           </linearGradient>
                                        </defs>
                                        <XAxis 
                                          dataKey="name" 
                                          axisLine={false} 
                                          tickLine={false} 
                                          tick={{ fontSize: 9, fontWeight: 800, fill: '#94A3B8' }}
                                          interval={5}
                                        />
                                        <YAxis 
                                          axisLine={false} 
                                          tickLine={false} 
                                          tick={{ fontSize: 9, fontWeight: 800, fill: '#94A3B8' }}
                                          tickFormatter={(val) => formatNumber(val)}
                                        />
                                        <RechartsTooltip 
                                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 900 }}
                                        />
                                        <Area 
                                          type="monotone" 
                                          dataKey="value" 
                                          stroke={activeChartMetric === 'views' ? '#3B82F6' : activeChartMetric === 'interactions' ? '#A855F7' : '#F59E0B'} 
                                          strokeWidth={4}
                                          fillOpacity={1} 
                                          fill="url(#colorValue)" 
                                          animationDuration={1500}
                                        />
                                     </AreaChart>
                                  </ResponsiveContainer>
                               );
                            })()}
                         </div>
                      </div>

                      {/* Right: Leaderboard */}
                      <div className="space-y-8">
                         {/* Top 3 */}
                         <div className="space-y-4">
                            <div className="flex items-center justify-between">
                               <h5 className="text-[10px] font-black  tracking-widest text-slate-400 flex items-center gap-2">
                                  <Trophy size={14} className="text-amber-500"/>
                                  Top 3 Performers
                               </h5>
                               <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded italic">Based on Views</span>
                            </div>
                            <div className="space-y-3">
                               {uploadedContent
                                 .sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0))
                                 .slice(0, 3)
                                 .map((p, idx) => (
                                    <div key={p.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-50 shadow-sm hover:shadow-md transition-all group">
                                       <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xs italic group-hover:bg-amber-600 group-hover:text-white transition-all">
                                          #{idx + 1}
                                       </div>
                                       <div className="flex-1 min-w-0">
                                          <p className="text-xs font-black text-[#0F172A] truncate">{p.headline || p.title}</p>
                                          <p className="text-[10px] font-bold text-slate-400 italic">{formatNumber(p.views)} Views</p>
                                       </div>
                                       <a href={p.published_url} target="_blank" className="p-2 text-slate-300 hover:text-slate-900 transition-all"><ArrowUpRight size={14}/></a>
                                    </div>
                                 ))}
                            </div>
                         </div>

                         {/* Bottom 3 */}
                         <div className="space-y-4">
                            <div className="flex items-center justify-between">
                               <h5 className="text-[10px] font-black  tracking-widest text-slate-400 flex items-center gap-2">
                                  <TrendingDown size={14} className="text-red-500"/>
                                  Needs Attention
                               </h5>
                               <span className="text-[9px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded italic">Bottom 3</span>
                            </div>
                            <div className="space-y-3">
                               {uploadedContent
                                 .sort((a, b) => (Number(a.views) || 0) - (Number(b.views) || 0))
                                 .slice(0, 3)
                                 .map((p, idx) => (
                                    <div key={p.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-50 shadow-sm hover:shadow-md transition-all opacity-80 hover:opacity-100">
                                       <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center font-black text-xs italic">
                                          #{uploadedContent.length - 2 + idx < 1 ? idx + 1 : uploadedContent.length - 2 + idx}
                                       </div>
                                       <div className="flex-1 min-w-0">
                                          <p className="text-xs font-black text-[#0F172A] truncate">{p.headline || p.title}</p>
                                          <p className="text-[10px] font-bold text-slate-400 italic">{formatNumber(p.views)} Views</p>
                                       </div>
                                       <div className="p-2 text-slate-200"><MinusCircle size={14}/></div>
                                    </div>
                                 ))}
                            </div>
                         </div>
                      </div>
                   </div>

                   <Card className="p-10 bg-white border-none shadow-2xl shadow-slate-200/40 rounded-[44px] space-y-10">
                   <div className="flex items-center justify-between">
                      <h4 className="text-xl font-black text-[#0F172A]">Detailed Asset Breakdown</h4>
                      <div className="flex items-center gap-3">
                         <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"/>
                         <span className="text-[10px] font-black  tracking-[0.2em] text-slate-400">Live Tracking Data ({analyticsPeriod.replace('_', ' ')})</span>
                      </div>
                   </div>

                   <div className="overflow-x-auto">
                      <table className="w-full">
                         <thead>
                            <tr className="border-b border-slate-50">
                                <th className="pb-6 text-left text-[10px] font-black  tracking-widest text-slate-300">Content Identity</th>
                                <th className="pb-6 text-center text-[10px] font-black  tracking-widest text-slate-300">Platform</th>
                                <th className="pb-6 text-center text-[10px] font-black  tracking-widest text-slate-300">Posting Date</th>
                                <th className="pb-6 text-right text-[10px] font-black  tracking-widest text-slate-300">Views</th>
                                <th className="pb-6 text-right text-[10px] font-black  tracking-widest text-slate-300">ER %</th>
                                <th className="pb-6 text-right text-[10px] font-black  tracking-widest text-slate-300">Action</th>

                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {uploadedContent.length > 0 ? (
                               uploadedContent.map((p, i) => {
                                 const itemInteractions = (Number(p.likes) || 0) + (Number(p.comments) || 0) + (Number(p.saves) || 0) + (Number(p.shares) || 0);
                                 const itemER = p.views > 0 ? ((itemInteractions / p.views) * 100).toFixed(2) : '0.00';
                                 
                                 return (
                                  <tr key={i} className="group hover:bg-slate-50/50 transition-all">
                                     <td className="py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-all shadow-sm">
                                               {(() => {
                                                  const plat = p.platform?.toLowerCase();
                                                  if (plat === "instagram") return <Instagram size={20} className="text-rose-500"/>;
                                                  if (plat === "youtube") return <Youtube size={20} className="text-red-500"/>;
                                                  if (plat === "facebook") return <Facebook size={20} className="text-blue-600"/>;
                                                  if (plat === "threads") return <AtSign size={20} className="text-slate-900"/>;
                                                  if (plat === "tiktok") return <Music size={20} className="text-slate-900"/>;
                                                  return <Layers size={20}/>;
                                               })()}
                                            </div>
                                           <div>
                                              <p className="text-sm font-black text-[#0F172A] line-clamp-1">{p.headline || p.title}</p>
                                              <p className="text-[9px] font-bold text-slate-400  tracking-widest mt-1">{p.content_pillar || 'No Pillar'}</p>
                                           </div>
                                        </div>
                                     </td>
                                     <td className="py-6 text-center">
                                        <span className="text-[10px] font-black text-slate-400  bg-slate-100 px-3 py-1 rounded-lg">{p.platform}</span>
                                     </td>
                                     <td className="py-6 text-center">
                                        <span className="text-[11px] font-black text-[#0F172A] italic">{p.due_date ? new Date(p.due_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }) : "-"}</span>
                                     </td>
                                     <td className="py-6 text-right font-black text-[#0F172A] text-sm italic">
                                        {formatNumber(p.views)}
                                     </td>
                                     <td className="py-6 text-right font-black text-emerald-600 text-sm">
                                        {itemER}%
                                     </td>
                                     <td className="py-6 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                           <button 
                                              onClick={() => openMetricsModal(p)}
                                              className="p-2.5 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-all"
                                              title="Update Performance Metrics"
                                           >
                                              <BarChart2 size={14}/>
                                           </button>
                                           <a href={p.published_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-900 text-white rounded-xl inline-flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-slate-900/10"><ExternalLink size={14}/></a>
                                        </div>
                                     </td>
                                  </tr>
                                 );
                               })
                            ) : (
                               <tr>
                                  <td colSpan={6} className="py-24 text-center space-y-6">
                                     <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto">
                                        <BarChart2 size={32} className="text-slate-200"/>
                                     </div>
                                     <div className="space-y-2">
                                        <h3 className="text-lg font-black text-slate-400  tracking-widest">No Data in This Period</h3>
                                        <p className="text-xs text-slate-400 italic max-w-xs mx-auto">Belum ada konten yang di-upload pada periode ini. Coba ganti filter periode atau upload konten baru.</p>
                                     </div>
                                  </td>
                               </tr>
                            )}
                         </tbody>
                      </table>
                   </div>
                </Card>
             </div>
             );
          })()}

          {activeTab === 'intelligence' && (
             <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                   <div className="space-y-2">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black">
                            <Lightbulb size={20}/>
                         </div>
                         <h3 className="text-3xl font-black text-[#0F172A] italic">Team Intelligence Hub</h3>
                      </div>
                      <p className="text-slate-500 font-medium max-w-2xl mt-2 italic">Standard Operating Procedure (SOP) & Alur Koordinasi Kerja Ruang Sosmed Agency.</p>
                   </div>
                   <div className="flex gap-3">
                      {isAdmin && (
                         <Button 
                            onClick={() => openIntelligenceModal('role', 'add')}
                            className="bg-emerald-600 text-white h-14 px-8 rounded-2xl font-black text-xs shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-2"
                         >
                            <Plus size={16}/> Tambah Role Baru
                         </Button>
                      )}
                      <div className="px-5 py-2.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
                         <span className="text-[10px] font-black text-slate-400  tracking-widest capitalize">Live Documentation</span>
                      </div>
                   </div>
                </div>

                {/* Visual Workflow Section */}
                <div className="space-y-8">
                   <div className="flex items-center justify-between px-4">
                      <h4 className="text-lg font-black text-[#0F172A] flex items-center gap-3 italic">
                         <Zap size={20} className="text-purple-500"/>
                         Content Production Lifecycle
                      </h4>
                      <div className="flex items-center gap-4">
                         {isAdmin && (
                            <button 
                               onClick={() => openIntelligenceModal('stage', 'add')}
                               className="px-4 py-2 bg-purple-50 text-purple-600 rounded-xl font-black text-[10px] hover:bg-purple-600 hover:text-white transition-all flex items-center gap-2"
                            >
                               <Plus size={14}/> Tambah Tahapan
                            </button>
                         )}
                         <span className="text-[10px] font-black text-slate-400 italic">Drag cards to re-order alurnya (Soon)</span>
                      </div>
                   </div>
                </div>

                <div className="relative">
                   {/* Connecting Line (Desktop) */}
                   <div className="hidden lg:block absolute top-[60px] left-20 right-20 h-1 bg-gradient-to-r from-emerald-100 via-purple-100 to-blue-100 z-0"/>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 relative z-10">
                      {intelligenceWorkflow.map((item, idx) => {
                         const IconComp = 
                            item.icon_type === 'Lightbulb' ? <Lightbulb size={24}/> :
                            item.icon_type === 'FileText' ? <FileText size={24}/> :
                            item.icon_type === 'Palette' ? <Palette size={24}/> :
                            item.icon_type === 'ShieldCheck' ? <ShieldCheck size={24}/> :
                            item.icon_type === 'Star' ? <Star size={24}/> :
                            item.icon_type === 'Zap' ? <Zap size={24}/> : <Target size={24}/>;

                         return (
                            <motion.div 
                              whileHover={{ y: -10 }}
                              key={idx} 
                              className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6 relative group transition-all hover:border-emerald-200 flex flex-col justify-between"
                            >
                               <div className="space-y-6">
                                  <div className="flex items-center justify-between">
                                     <div className={`w-16 h-16 rounded-3xl ${item.color} flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>
                                        {IconComp}
                                     </div>
                                     {isAdmin && (
                                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                           <button onClick={() => openIntelligenceModal('stage', 'edit', idx)} className="p-1.5 text-slate-300 hover:text-emerald-500 transition-colors"><Edit size={12}/></button>
                                           <button onClick={() => handleRemoveStage(idx)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={12}/></button>
                                        </div>
                                     )}
                                  </div>
                                  <div className="space-y-2">
                                     <p className="text-[10px] font-black  tracking-widest opacity-30 italic">STAGE {item.step}</p>
                                     <h5 className="text-sm font-black text-[#0F172A] leading-tight">{item.title}</h5>
                                     <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">{item.desc}</p>
                                  </div>
                               </div>
                               <div className="pt-4 border-t border-slate-50">
                                  <span className="text-[9px] font-black  tracking-widest bg-slate-50 text-slate-500 px-3 py-1.5 rounded-xl uppercase">{item.role}</span>
                               </div>
                            </motion.div>
                         );
                      })}
                   </div>
                </div>

                {/* Role Scopes Section */}
                <div className="space-y-8 mt-12">
                   <div className="flex items-center justify-between px-4">
                      <h4 className="text-lg font-black text-[#0F172A] flex items-center gap-3 italic">
                         <Target size={20} className="text-emerald-500"/>
                         Authority Matrix & Scopes
                      </h4>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {intelligenceScopes.map((r, i) => (
                         <Card key={i} className="p-8 bg-white border border-slate-50 rounded-[40px] shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
                            <div>
                               <div className="flex items-center justify-between mb-6">
                                  <h5 className="text-lg font-black text-[#0F172A] italic">{r.role} Scope</h5>
                                  <div className="flex gap-2">
                                     {isAdmin && (
                                        <>
                                           <button 
                                             onClick={() => openIntelligenceModal('role', 'edit', i)}
                                             className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                             title="Edit Role Name"
                                           >
                                             <Edit size={14}/>
                                           </button>
                                           <button 
                                             onClick={() => openIntelligenceModal('task', 'add', i)}
                                             className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                             title="Tambah Jobdesk"
                                           >
                                             <Plus size={14}/>
                                           </button>
                                           <button 
                                             onClick={() => handleRemoveScope(i)}
                                             className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                             title="Hapus Role"
                                           >
                                             <Trash2 size={14}/>
                                           </button>
                                        </>
                                     )}
                                  </div>
                               </div>
                               <ul className="space-y-4">
                                  {r.tasks.length > 0 ? r.tasks.map((t: string, idx: number) => (
                                     <li key={idx} className="flex items-center justify-between group/task">
                                        <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"/> {t}
                                        </div>
                                        {isAdmin && (
                                           <button 
                                             onClick={() => handleRemoveTaskFromScope(i, idx)}
                                             className="p-1 text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover/task:opacity-100"
                                           >
                                              <X size={12}/>
                                           </button>
                                        )}
                                     </li>
                                  )) : (
                                     <li className="text-[10px] text-slate-300 italic font-medium">Belum ada jobdesk yang didaftarkan.</li>
                                  )}
                               </ul>
                            </div>
                            {isAdmin && (
                               <div className="mt-8 pt-4 border-t border-slate-50 flex justify-end">
                                  <button 
                                     onClick={() => openConfirm("Hapus Role", `Apakah Anda yakin ingin menghapus role ${r.role}?`, () => handleRemoveScope(i))}
                                     className="text-[9px] font-black text-red-300 hover:text-red-600 flex items-center gap-1 transition-colors uppercase tracking-widest"
                                  >
                                     <Trash2 size={10}/> Remove Role
                                  </button>
                               </div>
                            )}
                         </Card>
                      ))}
                   </div>
                </div>
             </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Task Modal */}
      <AnimatePresence>
        {isTaskModalOpen && (
          <div onClick={() => setIsTaskModalOpen(false)} className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md cursor-pointer">
            <motion.div onClick={(e) => e.stopPropagation()} 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[44px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100"
            >
              <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-emerald-50/30">
                <div className="space-y-1">
                  <p className="text-[10px] font-black  tracking-[0.2em] text-emerald-600">Production Workflow</p>
                  <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">{editingTask ? 'Edit Content Task' : 'New Content Task'}</h3>
                </div>
                <button onClick={() => { setIsTaskModalOpen(false); setEditingTask(null); }} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-slate-100"><Plus size={24} className="rotate-45"/></button>
              </div>

              <div className="p-10 space-y-8 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-3 gap-8">
                   <div className="space-y-2 col-span-3">
                      <label className="text-[10px] font-black  tracking-widest text-slate-400 ml-2">Content Headline</label>
                      <input 
                        value={taskForm.headline}
                        onChange={(e) => setTaskForm({ ...taskForm, headline: e.target.value, title: e.target.value })}
                        placeholder="Headline Konten yang menarik perhatian"
                        className="w-full h-16 rounded-2xl bg-slate-50 px-8 font-bold text-lg focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100 shadow-inner"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black  tracking-widest text-slate-400 ml-2">Content Pillar</label>
                      <input 
                        value={taskForm.content_pillar}
                        onChange={(e) => setTaskForm({ ...taskForm, content_pillar: e.target.value })}
                        placeholder="Educational, Sales, etc."
                        className="w-full h-16 rounded-2xl bg-slate-50 px-8 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100"
                      />
                   </div>

                   <div className="space-y-2">
                       <label className="text-[10px] font-black  tracking-widest text-slate-400 ml-2">Target Account</label>
                       <select 
                         value={taskForm.account_id}
                         onChange={(e) => {
                            const acc = accounts.find(a => a.id === e.target.value);
                            setTaskForm({ 
                               ...taskForm, 
                               account_id: e.target.value, 
                               platform: acc?.platform || taskForm.platform 
                            });
                         }}
                         className="w-full h-16 rounded-2xl bg-slate-50 px-8 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100 appearance-none pointer-events-auto"
                       >
                          <option value="">Select Profile</option>
                          {accounts.map(acc => (
                             <option key={acc.id} value={acc.id}>{acc.name} ({acc.platform})</option>
                          ))}
                       </select>
                   </div>

                   <div className="space-y-2">
                       <label className="text-[10px] font-black  tracking-widest text-slate-400 ml-2">Content Platform</label>
                       <select 
                         value={taskForm.platform}
                         onChange={(e) => setTaskForm({ ...taskForm, platform: e.target.value })}
                         className="w-full h-16 rounded-2xl bg-slate-50 px-8 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100 shadow-inner"
                       >
                          <option value="tiktok">TikTok</option>
                          <option value="instagram">Instagram</option>
                          <option value="threads">Threads</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="short">YouTube Shorts</option>
                          <option value="facebook">Facebook</option>
                       </select>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black  tracking-widest text-slate-400 ml-2">Posting Date</label>
                      <input 
                        type="date"
                        value={taskForm.due_date}
                        onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                        className="w-full h-16 rounded-2xl bg-slate-50 px-8 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black  tracking-widest text-slate-400 ml-2">Script Link (GDrive/Doc)</label>
                      <input 
                        value={taskForm.script_url}
                        onChange={(e) => setTaskForm({ ...taskForm, script_url: e.target.value })}
                        placeholder="https://docs.google.com/..."
                        className="w-full h-16 rounded-2xl bg-slate-50 px-8 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black  tracking-widest text-slate-400 ml-2">Content File (Raw/Result)</label>
                      <input 
                        value={taskForm.result_url}
                        onChange={(e) => setTaskForm({ ...taskForm, result_url: e.target.value })}
                        placeholder="Link file video/image"
                        className="w-full h-16 rounded-2xl bg-slate-50 px-8 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black  tracking-widest text-slate-400 ml-2">Live Post Link</label>
                      <input 
                        value={taskForm.published_url}
                        onChange={(e) => setTaskForm({ ...taskForm, published_url: e.target.value })}
                        placeholder="https://tiktok.com/..."
                        className="w-full h-16 rounded-2xl bg-slate-50 px-8 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100"
                      />
                   </div>
                   <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-black  tracking-widest text-slate-400 ml-2">Production Status</label>
                      <select 
                        value={taskForm.status}
                        onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                        className="w-full h-16 rounded-2xl bg-slate-50 px-8 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100 appearance-none"
                      >
                         {Object.entries(statusConfig).map(([key, config]) => (
                           <option key={key} value={key}>{config.label}</option>
                         ))}
                      </select>
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black  tracking-widest text-slate-400 ml-2">Brief / Description</label>
                  <textarea 
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    placeholder="Tuliskan arahan konten di sini..."
                    className="w-full h-32 rounded-2xl bg-slate-50 p-8 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100 resize-none"
                 />
                </div>
              </div>

              <div className="p-10 pt-4 bg-slate-50/50">
                <Button 
                  disabled={isSubmitting || !taskForm.title}
                  onClick={async () => {
                    if (editingTask) {
                       setIsSubmitting(true);
                       const { error } = await supabase.from('v2_agency_content_plans').update(taskForm).eq('id', editingTask.id);
                       if (!error) {
                          setIsTaskModalOpen(false);
                          setEditingTask(null);
                          fetchContentPlans();
                       } else {
                          alert(error.message);
                       }
                       setIsSubmitting(false);
                    } else {
                       handleCreateTask();
                    }
                  }}
                  className="w-full h-20 rounded-3xl bg-emerald-600 text-white font-black text-lg shadow-2xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Processing..." : (editingTask ? "Update Content Plan" : "Create Content Task")}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Member Modal */}
      <AnimatePresence>
        {isMemberModalOpen && (
          <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[44px] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border border-slate-100"
            >
              <div className="p-8 border-b border-slate-50 bg-slate-50/50 text-center">
                <h3 className="text-xl font-black text-[#0F172A] tracking-tight">{editingMember ? "Edit Team Member" : "Add Team Member"}</h3>
                <p className="text-[10px] font-bold text-slate-400  tracking-widest mt-1">Workspace Expansion</p>
              </div>

              {editingMember && (
                <div className="px-8 pt-8 flex justify-center">
                   <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden shadow-sm">
                      <img 
                        src={memberForm.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${memberForm.full_name}`} 
                        className="w-full h-full object-contain"
                        alt="Preview"
                      />
                   </div>
                </div>
              )}

              <div className="p-8 space-y-6">
                 <div className="space-y-2">
                     <label className="text-[10px] font-black  tracking-widest text-slate-400 ml-2">Full Name</label>
                     <input 
                       value={memberForm.full_name}
                       onChange={(e) => setMemberForm({ ...memberForm, full_name: e.target.value })}
                       placeholder="Enter member's full name"
                       className="w-full h-14 rounded-xl bg-slate-50 px-6 font-bold text-xs focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100"
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black  tracking-widest text-slate-400 ml-2">USERNAME (FOR LOGIN)</label>
                     <input 
                       value={memberForm.email}
                       onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                       placeholder="e.g. arunika"
                       className="w-full h-14 rounded-xl bg-slate-50 px-6 font-bold text-xs focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100"
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black  tracking-widest text-slate-400 ml-2">Password</label>
                     <input 
                       type="text"
                       value={memberForm.password}
                       onChange={(e) => setMemberForm({ ...memberForm, password: e.target.value })}
                       placeholder="Set temporary password"
                       className="w-full h-14 rounded-xl bg-slate-50 px-6 font-bold text-xs focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100"
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black  tracking-widest text-slate-400 ml-2">Role/Position</label>
                     <input 
                       value={memberForm.role}
                       onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                       placeholder="e.g. Content Creator"
                       className="w-full h-14 rounded-xl bg-slate-50 px-6 font-bold text-xs focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100"
                     />
                  </div>
               </div>

              <div className="p-8 pt-2">
                <div className="flex gap-4">
                   <Button onClick={() => setIsMemberModalOpen(false)} className="flex-1 h-14 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs hover:bg-slate-200 transition-all border-none">Cancel</Button>
                   <Button 
                      disabled={isSubmitting || !memberForm.email || (!editingMember && !memberForm.password) || !memberForm.full_name}
                      onClick={handleAddMember}
                      className="flex-[2] h-14 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                   >
                     {isSubmitting ? "Processing..." : (editingMember ? "Update Member" : "Confirm & Create")}
                   </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div 
             onClick={() => setIsDeleteModalOpen(false)} 
             className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md cursor-pointer"
          >
            <motion.div 
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden p-10 space-y-8"
            >
              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto">
                <AlertCircle className="text-red-500" size={40}/>
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-[#0F172A]">Hapus Konten?</h3>
                <p className="text-slate-400 text-sm font-medium italic">
                  Yakin ingin menghapus <span className="text-slate-600 font-bold">"{taskToDelete?.headline || taskToDelete?.title}"</span>? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="h-16 rounded-2xl bg-slate-100 text-slate-500 font-black text-sm hover:bg-slate-200 transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={handleDeleteTask}
                  disabled={isSubmitting}
                  className="h-16 rounded-2xl bg-red-500 text-white font-black text-sm hover:bg-red-600 shadow-xl shadow-red-500/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal for New Member */}
      <AnimatePresence>
        {isSuccessModalOpen && successData && (
          <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[44px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-white/20"
            >
              <div className="p-10 pt-12 text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                    <ShieldCheck size={28}/>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-[#0F172A] tracking-tight">Akun Berhasil Dibuat!</h3>
                  <p className="text-slate-400 text-sm font-medium italic px-4">
                    Akses untuk <span className="text-emerald-600 font-bold">{successData.full_name}</span> telah aktif. Silakan bagikan detail login ini.
                  </p>
                </div>
              </div>

              <div className="px-10 space-y-4">
                <div className="p-8 bg-slate-50 border border-slate-100 rounded-[32px] space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Sparkles size={64} className="text-slate-900"/>
                  </div>
                  
                  <div className="relative z-10 space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black  tracking-widest text-slate-400">
                      <span>Login Detail</span>
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Secure</span>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                         <div className="space-y-0.5">
                            <p className="text-[9px] font-black text-slate-300  tracking-widest">Username</p>
                            <p className="font-black text-[#0F172A]">{successData.username}</p>
                         </div>
                         <button 
                           onClick={() => {
                             navigator.clipboard.writeText(successData.username);
                             setCopying(true);
                             setTimeout(() => setCopying(false), 2000);
                           }}
                           className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-emerald-600"
                         >
                           <Copy size={16}/>
                         </button>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                         <div className="space-y-0.5">
                            <p className="text-[9px] font-black text-slate-300  tracking-widest">Password</p>
                            <p className="font-black text-[#0F172A] font-mono tracking-widest">{successData.password}</p>
                         </div>
                         <button 
                           onClick={() => {
                             navigator.clipboard.writeText(successData.password);
                             setCopying(true);
                             setTimeout(() => setCopying(false), 2000);
                           }}
                           className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-emerald-600"
                         >
                           <Copy size={16}/>
                         </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 pt-8 space-y-3">
                <Button 
                  onClick={() => {
                    const message = `Halo ${successData.full_name},\n\nAkun Ruang Sosmed kamu sudah aktif!\nBerikut detail login kamu:\n\nUsername: ${successData.username}\nPassword: ${successData.password}\n\nSilakan login di https://ruangsosmed.com/login\n\nSelamat berkarya!`;
                    navigator.clipboard.writeText(message);
                    setCopying(true);
                    setTimeout(() => setCopying(false), 2000);
                  }}
                  className="w-full h-16 rounded-2xl bg-[#075E54] hover:bg-[#128C7E] text-white font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
                >
                  {copying ? <Check size={18}/> : <MessageSquare size={18}/>}
                  {copying ? "Berhasil Disalin!" : "Salin Pesan WhatsApp"}
                </Button>
                
                <button 
                  onClick={() => setIsSuccessModalOpen(false)}
                  className="w-full h-14 rounded-2xl bg-white text-slate-400 font-bold text-xs hover:text-slate-600 transition-all border border-slate-100"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* My Profile Modal */}
      <AnimatePresence>
        {/* Meeting Scheduler Modal */}
        {isMeetingModalOpen && (
           <div 
              onClick={() => setIsMeetingModalOpen(false)} 
              className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md cursor-pointer"
           >
             <motion.div 
               onClick={(e) => e.stopPropagation()}
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-xl bg-white rounded-[44px] shadow-2xl overflow-hidden"
             >
               <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                   <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                     <CalendarIcon size={24}/>
                   </div>
                   <div>
                     <h3 className="text-xl font-black text-[#0F172A]">{editingMeeting ? 'Edit Meeting Schedule' : 'Schedule Team Sync'}</h3>
                     <p className="text-slate-400 text-xs font-bold  tracking-widest mt-1">Collab Scheduler</p>
                   </div>
                 </div>
                 <button onClick={() => setIsMeetingModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-all">
                   <X size={20}/>
                 </button>
               </div>

               <div className="p-10 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400  tracking-widest ml-1">Meeting Title</label>
                   <input 
                     type="text"
                     value={meetingForm.title}
                     onChange={(e) => setMeetingForm({...meetingForm, title: e.target.value})}
                     className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all"
                     placeholder="e.g. Weekly Content Review"
                   />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400  tracking-widest ml-1">Start Time</label>
                      <input 
                        type="datetime-local"
                        value={meetingForm.start_time}
                        onChange={(e) => setMeetingForm({...meetingForm, start_time: e.target.value})}
                        className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400  tracking-widest ml-1">Category</label>
                      <select 
                        value={meetingForm.category}
                        onChange={(e) => setMeetingForm({...meetingForm, category: e.target.value})}
                        className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                      >
                         <option value="internal">Internal Sync</option>
                         <option value="client">Client Meeting</option>
                         <option value="review">Content Review</option>
                      </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400  tracking-widest ml-1">Meeting Link (Opt)</label>
                   <div className="relative">
                      <LinkIcon size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"/>
                      <input 
                        type="url"
                        value={meetingForm.meeting_link}
                        onChange={(e) => setMeetingForm({...meetingForm, meeting_link: e.target.value})}
                        className="w-full h-14 pl-14 pr-6 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all"
                        placeholder="https://meet.google.com/xxx-xxxx-xxx"
                      />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400  tracking-widest ml-1">Agenda / Description</label>
                   <textarea 
                     value={meetingForm.description}
                     onChange={(e) => setMeetingForm({...meetingForm, description: e.target.value})}
                     className="w-full h-32 p-6 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                     placeholder="Tuliskan poin-poin bahasan meeting..."
                   />
                 </div>

                 <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400  tracking-widest ml-1">Invite Members</label>
                   <div className="flex flex-wrap gap-2">
                      {members.map((m: any) => {
                         const isInvited = selectedMeetingAttendeeIds.includes(m.profile_id);
                         return (
                            <button
                               key={m.id}
                               type="button"
                               onClick={() => {
                                  setSelectedMeetingAttendeeIds(prev => 
                                     isInvited ? prev.filter(id => id !== m.profile_id) : [...prev, m.profile_id]
                                  );
                               }}
                               className={`flex items-center gap-2 p-1.5 pr-4 rounded-xl border-2 transition-all ${
                                  isInvited ? 'bg-emerald-50 border-emerald-500 shadow-sm' : 'bg-slate-50 border-transparent text-slate-400'
                                }`}
                            >
                               <div className="w-8 h-8 rounded-lg bg-white overflow-hidden shadow-sm">
                                  <img 
                                     src={m.profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${m.profile?.full_name}`} 
                                     className="w-full h-full object-contain" 
                                     alt="avatar"
                                  />
                               </div>
                               <span className={`text-[10px] font-bold ${isInvited ? 'text-emerald-700' : 'text-slate-400'}`}>{m.profile?.full_name}</span>
                            </button>
                         );
                      })}
                   </div>
                 </div>
               </div>

               <div className="p-10 pt-0">
                 <Button 
                   disabled={isSubmitting || !meetingForm.title || !meetingForm.start_time}
                   onClick={handleCreateMeeting}
                   className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black shadow-xl shadow-slate-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                 >
                   {isSubmitting ? "Scheduling..." : (editingMeeting ? "Save Changes" : "Create Schedule")}
                 </Button>
               </div>
             </motion.div>
           </div>
        )}

        {isProfileModalOpen && (
          <div onClick={() => setIsProfileModalOpen(false)} className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md cursor-pointer">
            <motion.div onClick={(e) => e.stopPropagation()} 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`bg-white rounded-[40px] shadow-2xl w-full ${isChoosingAvatar ? 'max-w-5xl' : 'max-w-lg'} transition-all duration-500 overflow-hidden flex flex-col border border-white/20`}
            >
              <div className="p-10 pb-6 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                    <User size={24}/>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">Edit My Profile</h3>
                    <p className="text-slate-400 text-xs font-medium italic">Update your public identity details.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-colors"
                >
                  <X size={20}/>
                </button>
              </div>

              <div className="p-10 space-y-8">
                 {isChoosingAvatar ? (
                    <div className="bg-slate-950 rounded-[40px] p-8">
                       <AvatarCreator 
                          initialName={profileForm.full_name}
                          onSave={(url) => {
                             setProfileForm({ ...profileForm, avatar_url: url });
                             setIsChoosingAvatar(false);
                          }}
                          onCancel={() => setIsChoosingAvatar(false)}
                       />
                    </div>
                 ) : (
                     <>

                       <div className="flex justify-center">
                          <button 
                            onClick={() => setIsChoosingAvatar(true)}
                            className="relative group cursor-pointer"
                          >
                             <div className="w-32 h-32 rounded-[40px] bg-slate-50 border-4 border-white shadow-xl overflow-hidden group-hover:scale-105 transition-transform">
                                <img 
                                  src={profileForm.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profileForm.full_name || 'A'}`} 
                                  className="w-full h-full object-contain p-3"
                                />
                             </div>
                             <div className="absolute -bottom-2 -right-2 p-3 bg-emerald-600 text-white rounded-2xl shadow-lg border-4 border-white group-hover:scale-110 transition-all">
                                <Palette size={16}/>
                             </div>
                          </button>
                       </div>

                       <div className="space-y-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black  tracking-widest text-slate-400 ml-2">Full Name</label>
                             <input 
                               value={profileForm.full_name}
                               onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                               className="w-full h-16 rounded-2xl bg-slate-50 px-8 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100"
                               placeholder="Your full name"
                             />
                          </div>

                          <div className="space-y-2">
                             <label className="text-[10px] font-black  tracking-widest text-slate-400 ml-2">Avatar Preview Url</label>
                             <input 
                               value={profileForm.avatar_url}
                               onChange={(e) => setProfileForm({ ...profileForm, avatar_url: e.target.value })}
                               className="w-full h-16 rounded-2xl bg-slate-50 px-8 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100"
                               placeholder="https://image-url.com/..."
                             />
                          </div>

                          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                             <Shield size={16} className="text-amber-600 mt-1 flex-shrink-0"/>
                             <p className="text-[10px] font-medium text-amber-800 leading-relaxed italic">
                                Role/Jabatan Anda saat ini adalah <span className="font-bold">{userRole}</span>. Hubungi Admin Utama jika Anda ingin melakukan perubahan akses level.
                             </p>
                          </div>
                           </div>

                     </>

                    
                 )}
              </div>

              {!isChoosingAvatar && (
                 <div className="p-10 pt-0">
                   <Button 
                     disabled={isSubmitting || !profileForm.full_name}
                     onClick={handleUpdateMyProfile}
                     className="w-full h-16 rounded-2xl bg-emerald-600 text-white font-black shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                   >
                     {isSubmitting ? "Updating..." : "Save Changes"}
                   </Button>
                 </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Roadmap Modal */}
      <AnimatePresence>
        {isRoadmapModalOpen && (
          <div onClick={() => setIsRoadmapModalOpen(false)} className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md cursor-pointer">
            <motion.div onClick={(e) => e.stopPropagation()} 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-white/20"
            >
              <div className="p-10 pb-6 flex items-center justify-between border-b border-slate-50 bg-slate-900 text-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl">
                    <Target size={24}/>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">New Strategy Phase</h3>
                    <p className="text-white/40 text-[10px] font-black  tracking-[0.2em] mt-1">Milestone Creator</p>
                  </div>
                </div>
                <button onClick={() => setIsRoadmapModalOpen(false)} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all"><X size={20}/></button>
              </div>

              <div className="p-10 space-y-8">
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black  tracking-widest text-slate-400 ml-2">Phase Title</label>
                       <input 
                         value={roadmapForm.title}
                         onChange={(e) => setRoadmapForm({ ...roadmapForm, title: e.target.value })}
                         placeholder="e.g. Foundation & Branding"
                         className="w-full h-16 rounded-2xl bg-slate-50 px-8 font-bold text-sm focus:outline-none focus:ring-4 ring-slate-900/5 border border-slate-100"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black  tracking-widest text-slate-400 ml-2">Strategic Goal Details</label>
                       <textarea 
                         value={roadmapForm.description}
                         onChange={(e) => setRoadmapForm({ ...roadmapForm, description: e.target.value })}
                         placeholder="What are the main objectives of this phase?"
                         className="w-full min-h-[120px] rounded-2xl bg-slate-50 p-8 font-bold text-sm focus:outline-none focus:ring-4 ring-slate-900/5 border border-slate-100 resize-none"
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black  tracking-widest text-slate-400 ml-2">Target Date</label>
                           <input 
                             type="date"
                             value={roadmapForm.target_date}
                             onChange={(e) => setRoadmapForm({ ...roadmapForm, target_date: e.target.value })}
                             className="w-full h-16 rounded-2xl bg-slate-50 px-8 font-bold text-sm focus:outline-none focus:ring-4 ring-slate-900/5 border border-slate-100"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black  tracking-widest text-slate-400 ml-2">Initial Progress</label>
                           <input 
                             type="number"
                             min="0"
                             max="100"
                             value={roadmapForm.progress}
                        onChange={(e) => setRoadmapForm({ ...roadmapForm, progress: parseInt(e.target.value) })}
                             className="w-full h-16 rounded-2xl bg-slate-50 px-8 font-bold text-sm focus:outline-none focus:ring-4 ring-slate-900/5 border border-slate-100"
                           />
                        </div>
                    </div>

                    {/* Member Picker */}
                    <div className="space-y-3">
                       <label className="text-[10px] font-black  tracking-widest text-slate-400 ml-2">Assign Team Members</label>
                       <div className="flex flex-wrap gap-3">
                          {members.map((m: any) => {
                             const isSelected = selectedRoadmapMemberIds.includes(m.profile_id);
                             return (
                                <button
                                   key={m.id}
                                   type="button"
                                   onClick={() => {
                                      setSelectedRoadmapMemberIds(prev => 
                                         isSelected 
                                            ? prev.filter(id => id !== m.profile_id)
                                            : [...prev, m.profile_id]
                                      );
                                   }}
                                   className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all ${
                                      isSelected 
                                         ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10' 
                                         : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                                   }`}
                                >
                                   <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 overflow-hidden">
                                      <img src={m.profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${m.profile?.full_name}`} className="w-full h-full object-contain" alt="avatar"/>
                                   </div>
                                   <span className={`text-xs font-bold ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`}>
                                      {m.profile?.full_name || 'Member'}
                                   </span>
                                   {isSelected && <Check size={14} className="text-emerald-500"/>}
                                </button>
                             );
                          })}
                       </div>
                       {selectedRoadmapMemberIds.length > 0 && (
                          <p className="text-[10px] font-bold text-emerald-600 ml-2">{selectedRoadmapMemberIds.length} member(s) selected</p>
                       )}
                    </div>
                 </div>

                 <Button 
                   disabled={isSubmitting || !roadmapForm.title}
                   onClick={handleCreateRoadmap}
                   className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-sm hover:scale-[1.02] transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50 disabled:grayscale"
                 >
                   {isSubmitting ? "Sychronizing..." : "Initialize Phase"}
                 </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Roadmap Detail Drawer */}
      <AnimatePresence>
        {selectedRoadmap && (
           <div className="fixed inset-0 w-screen h-screen z-[9999] flex justify-end">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedRoadmap(null)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-100"
              >
                 <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                          <Target size={24}/>
                       </div>
                       <div>
                          <h3 className="text-xl font-black text-[#0F172A] tracking-tight">{selectedRoadmap.title}</h3>
                          <p className="text-[10px] font-black text-emerald-600  tracking-widest mt-1">Strategic Objective Details</p>
                       </div>
                    </div>
                    <button onClick={() => setSelectedRoadmap(null)} className="p-3 bg-white rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all">
                       <X size={20}/>
                    </button>
                 </div>

                 <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
                    {/* Status & Analytics */}
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100/50">
                          <p className="text-[9px] font-black text-slate-400  tracking-widest mb-3">Target Completion</p>
                          <p className="text-lg font-black text-[#0F172A]">{selectedRoadmap.target_date ? new Date(selectedRoadmap.target_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }) : 'Flexible'}</p>
                       </div>
                       <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100/50">
                          <p className="text-[9px] font-black text-slate-400  tracking-widest mb-3">Overall Progress</p>
                          <p className="text-2xl font-black text-emerald-600 italic">{selectedRoadmap.progress}%</p>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h5 className="text-[10px] font-black text-slate-400  tracking-[0.2em] ml-2">Strategic Brief</h5>
                       <div className="p-8 bg-emerald-50/30 border border-emerald-100/50 rounded-[40px]">
                          <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{selectedRoadmap.description}"</p>
                       </div>
                    </div>

                     {/* Per-Member Progress */}
                     {(selectedRoadmap.kpi_members?.length || 0) > 0 && (
                        <div className="space-y-5">
                           <h5 className="text-[10px] font-black text-slate-400  tracking-[0.2em] ml-2">Member Contribution</h5>
                           <div className="space-y-3">
                              {selectedRoadmap.kpi_members?.map((km: any) => {
                                 const memberMilestones = selectedRoadmap.milestones?.filter((m: any) => m.assigned_to === km.profile_id) || [];
                                 const completedCount = memberMilestones.filter((m: any) => m.is_completed).length;
                                 const totalCount = memberMilestones.length;
                                 const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                                 
                                 return (
                                    <div key={km.id} className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100">
                                       <div className="w-10 h-10 rounded-[14px] bg-white border border-slate-100 overflow-hidden shadow-sm">
                                          <img src={km.profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${km.profile?.full_name}`} className="w-full h-full object-contain" alt="avatar"/>
                                       </div>
                                       <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between mb-1">
                                             <p className="text-sm font-bold text-[#0F172A] truncate">{km.profile?.full_name || 'Member'}</p>
                                             <span className="text-[10px] font-black text-emerald-600">{percent}%</span>
                                          </div>
                                          <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden">
                                             <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${percent}%` }}/>
                                          </div>
                                          <p className="text-[9px] font-bold text-slate-400 mt-1">{completedCount}/{totalCount} milestones completed</p>
                                       </div>
                                       {isAdmin && (
                                          <button
                                             onClick={() => handleRemoveKpiMember(selectedRoadmap.id, km.profile_id)}
                                             className="p-2 text-slate-200 hover:text-red-400 transition-colors"
                                          >
                                             <X size={14}/>
                                          </button>
                                       )}
                                    </div>
                                 );
                              })}
                           </div>
                        </div>
                     )}

                     {/* Add Members (Admin) */}
                     {isAdmin && (
                        <div className="space-y-4">
                           <h5 className="text-[10px] font-black text-slate-400  tracking-[0.2em] ml-2">Manage Members</h5>
                           <div className="flex flex-wrap gap-2">
                              {members.filter((m: any) => !(selectedRoadmap.kpi_members || []).some((km: any) => km.profile_id === m.profile_id)).map((m: any) => (
                                 <button
                                    key={m.id}
                                    onClick={() => handleAddKpiMember(selectedRoadmap.id, m.profile_id)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-50 border border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all"
                                 >
                                    <div className="w-6 h-6 rounded-lg bg-white border overflow-hidden">
                                       <img src={m.profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${m.profile?.full_name}`} className="w-full h-full object-contain" alt="avatar"/>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400">{m.profile?.full_name}</span>
                                    <Plus size={12} className="text-slate-300"/>
                                 </button>
                              ))}
                              {members.filter((m: any) => !(selectedRoadmap.kpi_members || []).some((km: any) => km.profile_id === m.profile_id)).length === 0 && (
                                 <p className="text-[10px] font-bold text-slate-300 italic p-4">All members are assigned to this KPI.</p>
                              )}
                           </div>
                        </div>
                     )}

                     {/* Milestones Management */}
                    <div className="space-y-6">
                       <div className="flex items-center justify-between px-2">
                          <h5 className="text-[10px] font-black text-slate-400  tracking-[0.2em]">Execution Checklist</h5>
                          <span className="text-[10px] font-bold text-slate-300 italic">{selectedRoadmap.milestones?.filter((m:any) => m.is_completed).length || 0}/{selectedRoadmap.milestones?.length || 0} Objectives</span>
                       </div>

                       <div className="space-y-3">
                          {selectedRoadmap.milestones?.map((m: any) => (
                             <div 
                                key={m.id}
                                className={`p-5 rounded-3xl border transition-all ${
                                  m.is_completed ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-slate-100 shadow-sm'
                                }`}
                              >
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                       <button 
                                         onClick={() => handleToggleMilestone(m.id, !m.is_completed, selectedRoadmap.id)}
                                         className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${
                                           m.is_completed ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'border-slate-200 bg-white'
                                         }`}
                                       >
                                          {m.is_completed && <Check size={16} strokeWidth={4}/>}
                                       </button>
                                       <span className={`text-sm font-bold ${m.is_completed ? 'text-slate-300 line-through' : 'text-slate-700'}`}>{m.title}</span>
                                    </div>
                                    {isAdmin && (
                                       <button 
                                         onClick={() => handleDeleteMilestone(m.id)}
                                         className="p-2 text-slate-200 hover:text-red-400 transition-colors"
                                       >
                                          <Trash2 size={16}/>
                                       </button>
                                    )}
                                 </div>
                                 {/* Assignee row */}
                                 <div className="mt-3 pl-11 flex items-center gap-2">
                                    {m.assignee ? (
                                       <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl">
                                          <div className="w-5 h-5 rounded-lg bg-white border overflow-hidden">
                                             <img src={m.assignee.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${m.assignee.full_name}`} className="w-full h-full object-contain" alt="assignee"/>
                                          </div>
                                          <span className="text-[10px] font-bold text-slate-500">{m.assignee.full_name}</span>
                                          {isAdmin && (
                                             <button onClick={() => handleAssignMilestone(m.id, null)} className="text-slate-300 hover:text-red-400 transition-colors">
                                                <X size={10}/>
                                             </button>
                                          )}
                                       </div>
                                    ) : isAdmin ? (
                                       <select
                                          className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-400"
                                          value=""
                                          onChange={(e) => { if (e.target.value) handleAssignMilestone(m.id, e.target.value); }}
                                       >
                                          <option value="">Assign to...</option>
                                          {(selectedRoadmap.kpi_members || []).map((km: any) => (
                                             <option key={km.profile_id} value={km.profile_id}>{km.profile?.full_name}</option>
                                          ))}
                                       </select>
                                    ) : (
                                       <span className="text-[10px] font-bold text-slate-300 italic">Unassigned</span>
                                    )}
                                 </div>
                              </div>
                          ))}

                          {isAdmin && (
                             <div className="px-2">
                                <input 
                                  placeholder="Type new milestone & press Enter..."
                                  className="w-full h-14 px-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[24px] text-sm font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                       handleAddMilestone(selectedRoadmap.id, (e.target as HTMLInputElement).value);
                                       (e.target as HTMLInputElement).value = '';
                                    }
                                  }}
                                />
                             </div>
                          )}
                       </div>
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && (
                       <div className="pt-10 border-t border-slate-100">
                          <p className="text-[10px] font-black text-slate-300  tracking-widest text-center mb-6">Zone Management</p>
                          <div className="grid grid-cols-2 gap-4">
                             <Button 
                               onClick={() => handleDeleteRoadmap(selectedRoadmap.id)}
                               className="h-14 bg-red-50 text-red-500 border border-red-100 rounded-2xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
                             >
                               Delete Strategy
                             </Button>
                             <div className="flex gap-2">
                                {['planned', 'in_progress', 'completed'].map((s) => (
                                   <button 
                                     key={s}
                                     onClick={() => handleUpdateRoadmapStatus(selectedRoadmap.id, s, s === 'completed' ? 100 : (s === 'planned' ? 0 : 50))}
                                     className={`flex-1 h-14 rounded-2xl text-[8px] font-black  tracking-tighter transition-all ${
                                       selectedRoadmap.status === s ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                     }`}
                                   >
                                      {s.replace('_', ' ')}
                                   </button>
                                ))}
                             </div>
                          </div>
                       </div>
                    )}
                 </div>
              </motion.div>
           </div>
        )}
      </AnimatePresence>

      {/* Social Accounts Management Modal */}
      <AnimatePresence>
        {isAccountModalOpen && (
          <div onClick={() => setIsAccountModalOpen(false)} className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md cursor-pointer">
            <motion.div onClick={(e) => e.stopPropagation()} 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[44px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-100"
            >
              <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20">
                    <User size={24}/>
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">Manage Social Profiles</h3>
                    <p className="text-[10px] font-black  tracking-widest text-slate-400">Add or remove the social media accounts you manage.</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsAccountModalOpen(false);
                    setEditingAccountId(null);
                    setAccountForm({ name: '', platform: 'tiktok', handle: '', avatar_url: '', current_followers: 0 });
                  }} 
                  className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-slate-100"
                >
                  <Plus size={24} className="rotate-45"/>
                </button>
              </div>

              <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                {/* Left: Account List */}
                <div className="flex-[1.5] p-10 overflow-y-auto no-scrollbar border-r border-slate-50 bg-slate-50/20">
                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black  tracking-widest text-slate-400">Registered Accounts ({accounts.length})</h4>
                      <div className="grid grid-cols-1 gap-4">
                         {accounts.length > 0 ? (
                            accounts.map(acc => (
                               <div key={acc.id} className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center justify-between group hover:border-emerald-200 transition-all shadow-sm">
                                  <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-lg font-black text-slate-300 overflow-hidden border border-slate-100">
                                        {acc.avatar_url ? (
                                           <img src={acc.avatar_url} className="w-full h-full object-contain" />
                                        ) : (
                                           <div className="flex flex-col items-center justify-center">
                                              {acc.platform === 'threads' ? <AtSign size={20} className="text-slate-400"/> : acc.platform?.[0]}
                                           </div>
                                        )}
                                     </div>
                                     <div>
                                        <p className="text-sm font-black text-[#0F172A]">{acc.name}</p>
                                        <div className="flex items-center gap-2">
                                           <p className="text-[10px] font-bold text-slate-400  tracking-widest">{acc.platform} • {acc.handle || '@no_handle'}</p>
                                           <div className="w-1 h-1 rounded-full bg-slate-300"/>
                                           <p className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded italic">
                                              {acc.current_followers?.toLocaleString() || 0} Followers
                                           </p>
                                        </div>
                                     </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                     <button 
                                       onClick={() => {
                                         setEditingAccountId(acc.id);
                                         setAccountForm({
                                           name: acc.name,
                                           platform: acc.platform,
                                           handle: acc.handle || '',
                                           avatar_url: acc.avatar_url || '',
                                           current_followers: acc.current_followers || 0
                                         });
                                       }}
                                       className="p-3 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                                     >
                                       <Settings size={16}/>
                                     </button>
                                     <button 
                                       onClick={() => handleDeleteAccount(acc.id)}
                                       className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                     >
                                       <Trash2 size={16}/>
                                     </button>
                                  </div>
                               </div>
                            ))
                         ) : (
                            <div className="py-20 text-center space-y-4">
                               <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-200">
                                  <UserPlus size={32}/>
                               </div>
                               <p className="text-xs font-bold text-slate-400 italic">Belum ada akun yang terdaftar.</p>
                            </div>
                         )}
                      </div>
                   </div>
                </div>

                {/* Right: Add/Edit Form */}
                <div className="flex-1 p-10 bg-white space-y-8">
                   <h4 className="text-[10px] font-black  tracking-widest text-slate-400">
                      {editingAccountId ? 'Edit Account Profile' : 'Add New Account'}
                   </h4>
                   <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 ml-1">PROFILE NAME (ex: Client A Official)</label>
                        <input 
                           value={accountForm.name}
                           onChange={(e) => setAccountForm({...accountForm, name: e.target.value})}
                           className="w-full h-14 rounded-2xl bg-slate-50 px-6 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100"
                           placeholder="Nama tampilan di dashboard"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 ml-1">Platform</label>
                        <select 
                           value={accountForm.platform}
                           onChange={(e) => setAccountForm({...accountForm, platform: e.target.value})}
                           className="w-full h-14 rounded-2xl bg-slate-50 px-6 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100"
                        >
                            <option value="tiktok">TikTok</option>
                            <option value="instagram">Instagram</option>
                            <option value="threads">Threads</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="short">YouTube Shorts</option>
                            <option value="facebook">Facebook</option>
                         </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 ml-1">Handle / Username</label>
                        <input 
                           value={accountForm.handle}
                           onChange={(e) => setAccountForm({...accountForm, handle: e.target.value})}
                           className="w-full h-14 rounded-2xl bg-slate-50 px-6 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100"
                           placeholder="@username"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 ml-1">AVATAR URL (Optional)</label>
                        <input 
                           value={accountForm.avatar_url}
                           onChange={(e) => setAccountForm({...accountForm, avatar_url: e.target.value})}
                           className="w-full h-14 rounded-2xl bg-slate-50 px-6 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100"
                           placeholder="https://..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 ml-1">Total Followers Saat Ini</label>
                        <input 
                           type="number"
                           value={accountForm.current_followers}
                           onChange={(e) => setAccountForm({...accountForm, current_followers: Number(e.target.value)})}
                           className="w-full h-14 rounded-2xl bg-slate-50 px-6 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100"
                           placeholder="0"
                        />
                        <p className="text-[9px] text-slate-400 italic px-1">Digunakan sebagai basis perhitungan Engagement Rate (ER).</p>
                      </div>

                      <Button 
                        onClick={handleAddAccount}
                        disabled={isSubmitting || !accountForm.name}
                        className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black text-sm shadow-xl shadow-slate-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                         {isSubmitting ? "Saving..." : (editingAccountId ? "Update Profile" : "Register Account Profile")}
                      </Button>
                      
                      {editingAccountId && (
                         <button 
                            onClick={() => {
                               setEditingAccountId(null);
                               setAccountForm({ name: '', platform: 'tiktok', handle: '', avatar_url: '', current_followers: 0 });
                            }}
                            className="w-full text-center text-[10px] font-black  text-slate-400 hover:text-slate-900 transition-all"
                         >
                            Cancel Editing & Create New
                         </button>
                      )}
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Performance Metrics Modal */}
      <AnimatePresence>
        {isMetricsModalOpen && editingMetricsTask && (
          <div onClick={() => setIsMetricsModalOpen(false)} className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md cursor-pointer">
            <motion.div onClick={(e) => e.stopPropagation()} 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[44px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-100"
            >
              <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-purple-50/30">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Zap size={28}/>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black  tracking-[0.2em] text-purple-600">Metric Tracker</p>
                    <h3 className="text-2xl font-black text-[#0F172A] tracking-tight truncate max-w-md">Stats: {editingMetricsTask.headline || editingMetricsTask.title}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                   <div className="hidden sm:flex bg-white px-6 py-3 rounded-2xl border border-purple-100 shadow-sm items-center gap-3">
                      <TrendingUp size={18} className="text-emerald-500"/>
                      <p className="text-[10px] font-black text-slate-400  tracking-widest">
                        Engagement Rate: <span className="text-sm text-emerald-600 ml-1">
                          {metricsForm.views > 0 
                            ? (((Number(metricsForm.likes || 0) + Number(metricsForm.comments || 0) + Number(metricsForm.saves || 0) + Number(metricsForm.shares || 0)) / Number(metricsForm.views)) * 100).toFixed(2) 
                            : '0.00'}%
                        </span>
                      </p>
                   </div>
                   <button onClick={() => setIsMetricsModalOpen(false)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-slate-100"><Plus size={24} className="rotate-45"/></button>
                </div>
              </div>

              <div className="p-10 space-y-10 overflow-y-auto no-scrollbar">
                 <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-6">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] font-black  tracking-widest text-slate-400">Input Achievement Data</h4>
                       <span className="text-[10px] font-black px-4 py-1 bg-purple-100 text-purple-600 rounded-full  italic tracking-tighter">Live calculation enabled</span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {editingMetricsTask.platform === 'threads' ? (
                           <>
                             {[
                               { id: 'views', label: 'Views', icon: <Eye size={12}/> },
                               { id: 'likes', label: 'Likes', icon: <Heart size={12}/> },
                               { id: 'comments', label: 'Replies', icon: <MessageCircle size={12}/> },
                               { id: 'saves', label: 'Quotes', icon: <Quote size={12}/> },
                               { id: 'reposts', label: 'Repost', icon: <RefreshCw size={12}/> },
                               { id: 'follows', label: 'Follows', icon: <UserPlus size={12}/> }
                             ].map(m => (
                               <div key={m.id} className="space-y-2">
                                 <label className="flex items-center gap-2 text-[9px] font-black  text-slate-400 ml-1">
                                   {m.icon} {m.label}
                                 </label>
                                 <input 
                                   type="number"
                                   value={metricsForm[m.id]}
                                   onChange={(e) => setMetricsForm({ ...metricsForm, [m.id]: Number(e.target.value) })}
                                   className="w-full h-14 rounded-2xl bg-white border border-slate-100 px-6 font-black text-sm focus:outline-none focus:ring-4 ring-purple-500/10 transition-all shadow-sm"
                                 />
                               </div>
                             ))}
                           </>
                        ) : editingMetricsTask.platform === 'tiktok' ? (
                          <>
                            {[
                              { id: 'views', label: 'Total Views', icon: <Eye size={12}/> },
                              { id: 'likes', label: 'Likes', icon: <Heart size={12}/> },
                              { id: 'comments', label: 'Comments', icon: <MessageCircle size={12}/> },
                              { id: 'saves', label: 'Saves', icon: <Star size={12}/> },
                              { id: 'shares', label: 'Shares', icon: <Share2 size={12}/> },
                              { id: 'avg_watch_time', label: 'Avg Watch Time (s)', icon: <Clock size={12}/> },
                              { id: 'new_followers', label: 'New Followers', icon: <UserPlus size={12}/> }
                            ].map(m => (
                              <div key={m.id} className="space-y-2">
                                <label className="flex items-center gap-2 text-[9px] font-black  text-slate-400 ml-1">
                                  {m.icon} {m.label}
                                </label>
                                <input 
                                  type="number"
                                  value={metricsForm[m.id]}
                                  onChange={(e) => setMetricsForm({ ...metricsForm, [m.id]: Number(e.target.value) })}
                                  className="w-full h-14 rounded-2xl bg-white border border-slate-100 px-6 font-black text-sm focus:outline-none focus:ring-4 ring-purple-500/10 transition-all shadow-sm"
                                />
                              </div>
                            ))}
                          </>
                       ) : (
                          <>
                            {[
                              { id: 'reach', label: 'Reach', icon: <Zap size={12}/> },
                              { id: 'views', label: 'Views', icon: <Eye size={12}/> },
                              { id: 'likes', label: 'Likes', icon: <Heart size={12}/> },
                              { id: 'comments', label: 'Comments', icon: <MessageCircle size={12}/> },
                              { id: 'shares', label: 'Shares', icon: <Share2 size={12}/> },
                              { id: 'saves', label: 'Saves', icon: <Star size={12}/> },
                              { id: 'reposts', label: 'Reposts', icon: <RefreshCw size={12}/> },
                              { id: 'profile_visit', label: 'Profile Visit', icon: <User size={12}/> },
                              { id: 'follows', label: 'Follows', icon: <UserPlus size={12}/> }
                            ].map(m => (
                              <div key={m.id} className="space-y-2">
                                <label className="flex items-center gap-2 text-[9px] font-black  text-slate-400 ml-1">
                                  {m.icon} {m.label}
                                </label>
                                <input 
                                  type="number"
                                  value={metricsForm[m.id]}
                                  onChange={(e) => setMetricsForm({ ...metricsForm, [m.id]: Number(e.target.value) })}
                                  className="w-full h-14 rounded-2xl bg-white border border-slate-100 px-6 font-black text-sm focus:outline-none focus:ring-4 ring-purple-500/10 transition-all shadow-sm"
                                />
                              </div>
                            ))}
                          </>
                       )}
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <button 
                       onClick={() => setIsMetricsModalOpen(false)}
                       className="flex-1 h-16 rounded-2xl bg-slate-100 text-slate-500 font-black text-sm hover:bg-slate-200 transition-all"
                    >
                       Tutup
                    </button>
                    <button 
                       onClick={handleUpdateMetrics}
                       disabled={isSubmitting}
                       className="flex-[2] h-16 rounded-2xl bg-purple-600 text-white font-black text-sm shadow-xl shadow-purple-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                       {isSubmitting ? "Menyimpan Data..." : "Simpan Statistik Performa"}
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isProfilePopupOpen && (
          <div 
            className="fixed inset-0 w-screen h-screen z-[9999] cursor-default" 
            onClick={() => setIsProfilePopupOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating Profile Popup (Bottom Right) */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-2">
        <AnimatePresence>
          {/* Chat Bubble Effect */}
          {!isProfilePopupOpen && isBubbleVisible && (
             <motion.div
               initial={{ opacity: 0, y: 10, scale: 0.8 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: 10, scale: 0.8 }}
               className="relative mb-2"
             >
                <div className="bg-white/80 backdrop-blur-md border border-slate-100 px-4 py-2 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.1)]">
                   <p className="text-[10px] font-black text-slate-600 tracking-wide whitespace-nowrap animate-in fade-in slide-in-from-bottom-1 duration-500" key={currentMessageIndex}>
                      {messages[currentMessageIndex]}
                   </p>
                </div>
                {/* Bubble Tail */}
                <div className="absolute -bottom-1 right-8 w-3 h-3 bg-white border-r border-b border-slate-100 rotate-45" />
             </motion.div>
          )}

          {isProfilePopupOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="w-72 bg-white/80 backdrop-blur-2xl border border-white/20 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-6 space-y-6"
            >
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <div className="w-16 h-16 shrink-0">
                   <img 
                      src={currentUserProfile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUserProfile?.full_name}`} 
                      className="w-full h-full object-contain drop-shadow-[0_5px_10px_rgba(0,0,0,0.1)]"
                   />
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-xs font-black text-[#0F172A] truncate">{currentUserProfile?.full_name}</p>
                   <p className="text-[10px] font-black text-slate-400  tracking-widest mt-0.5">{userRole || 'Team Member'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                 <button 
                   onClick={() => { setIsProfilePopupOpen(false); openMyProfileModal(); }}
                   className="flex items-center gap-3 w-full p-3 rounded-2xl hover:bg-slate-50 text-slate-600 transition-all group"
                 >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                       <Settings size={14}/>
                    </div>
                    <span className="text-xs font-bold">Profile Settings</span>
                 </button>

                 <button 
                   onClick={async () => {
                     await supabase.auth.signOut();
                     localStorage.removeItem("v2_legacy_admin");
                     router.push("/ruang-sosmed/login");
                   }}
                   className="flex items-center gap-3 w-full p-3 rounded-2xl hover:bg-rose-50 text-rose-600 transition-all group"
                 >
                    <div className="w-8 h-8 rounded-lg bg-rose-100/50 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all">
                       <LogOut size={14}/>
                    </div>
                    <span className="text-xs font-bold">Sign Out</span>
                 </button>
              </div>

              {isAdmin && (
                <div className="pt-2">
                   <div className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-[8px] font-black  tracking-widest flex items-center justify-center gap-2 border border-emerald-100">
                      <ShieldCheck size={12}/> Authority Access
                   </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Preview Modal */}
        <AnimatePresence>
          {isPreviewModalOpen && selectedPreviewTask && (
            <div onClick={() => setIsPreviewModalOpen(false)} className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl cursor-pointer">
              <motion.div onClick={(e) => e.stopPropagation()} 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-[44px] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100"
              >
                <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-emerald-50/20">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 ${
                      selectedPreviewTask.platform === "tiktok" ? "bg-slate-950 text-white" :
                      selectedPreviewTask.platform === "instagram" ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white" :
                      selectedPreviewTask.platform === "threads" ? "bg-black text-white" : 
                      selectedPreviewTask.platform === "facebook" ? "bg-[#1877F2] text-white" :
                      selectedPreviewTask.platform === "youtube" ? "bg-[#FF0000] text-white" :
                      selectedPreviewTask.platform === "linkedin" ? "bg-[#0A66C2] text-white" : "bg-emerald-600 text-white"
                    }`}>
                      {selectedPreviewTask.platform === "tiktok" ? <Play size={24} className="fill-current"/> :
                       selectedPreviewTask.platform === "threads" ? <AtSign size={24}/> : 
                       selectedPreviewTask.platform === "instagram" ? <Instagram size={24}/> :
                       selectedPreviewTask.platform === "facebook" ? <Facebook size={24}/> :
                       selectedPreviewTask.platform === "youtube" ? <Youtube size={24}/> :
                       selectedPreviewTask.platform === "linkedin" ? <Linkedin size={24}/> : <Layers size={24}/>}
                    </div>
                    <div>
                      <p className="text-[10px] font-black  tracking-[0.3em] text-emerald-600">Content Preview</p>
                      <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">{selectedPreviewTask.platform} Content Detail</h3>
                    </div>
                  </div>
                  <button onClick={() => setIsPreviewModalOpen(false)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-slate-100"><Plus size={24} className="rotate-45"/></button>
                </div>

                <div className="p-10 overflow-y-auto no-scrollbar space-y-10">
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <span className="px-5 py-2 rounded-xl bg-slate-100 text-[10px] font-bold text-slate-500  tracking-widest">{selectedPreviewTask.content_pillar || "No Pillar"}</span>
                         <span className={`px-5 py-2 rounded-xl text-[10px] font-black  tracking-widest shadow-sm ${
                            selectedPreviewTask.status === 'published' ? 'bg-emerald-100 text-emerald-600' :
                            selectedPreviewTask.status === 'approved' ? 'bg-blue-100 text-blue-600' :
                            selectedPreviewTask.status === 'review' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                         }`}>
                            {selectedPreviewTask.status.replace('_', ' ')}
                         </span>
                      </div>
                      <h2 className="text-3xl font-black text-[#0F172A] leading-tight">{selectedPreviewTask.headline || selectedPreviewTask.title}</h2>
                      {selectedPreviewTask.description && (
                         <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                             <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{selectedPreviewTask.description}"</p>
                         </div>
                      )}
                   </div>

                   <div className="grid grid-cols-3 gap-6">
                      <div className="p-6 bg-white border border-slate-100 rounded-3xl space-y-2 shadow-sm">
                         <p className="text-[9px] font-black text-slate-400  tracking-widest">Target Account</p>
                         <p className="font-bold text-[#0F172A] truncate">{accounts.find(a => a.id === selectedPreviewTask.account_id)?.name || "Main Profile"}</p>
                      </div>
                      <div className="p-6 bg-white border border-slate-100 rounded-3xl space-y-2 shadow-sm">
                         <p className="text-[9px] font-black text-slate-400  tracking-widest">Content Creator</p>
                         <div className="flex items-center gap-2">
                            {(() => {
                               const picId = (selectedPreviewTask.assigned_to && selectedPreviewTask.assigned_to !== "" ? selectedPreviewTask.assigned_to : null) || selectedPreviewTask.created_by;
                               let pic = members.find(m => (m.profile?.id || m.user?.id) === picId)?.profile || members.find(m => m.profile_id === picId)?.profile; 
                               if (!pic && (!picId || picId === 'legacy-admin')) {
                                  const d = members.find(m => (m.profile?.full_name || m.profile?.full_name || m.user?.full_name)?.toLowerCase().includes('dinur')); 
                                  pic = d?.profile || d?.profile || d?.user;
                               }
                               if (!pic && (currentUserProfile?.id === picId || (!picId && isLegacyAdmin()))) pic = currentUserProfile; 
                               const displayName = pic?.full_name || (!picId && isLegacyAdmin() ? currentUserProfile?.full_name : null) || (picId === 'legacy-admin' || !picId ? "Dinur" : "Unassigned");
                               return (
                                   <p className="font-bold text-[#0F172A] truncate text-xs">{displayName}</p>
                               );
                            })()}
                         </div>
                      </div>
                      <div className="p-6 bg-white border border-slate-100 rounded-3xl space-y-2 shadow-sm">
                         <p className="text-[9px] font-black text-slate-400  tracking-widest">Scheduled For</p>
                         <p className="font-bold text-emerald-600">{selectedPreviewTask.due_date ? new Date(selectedPreviewTask.due_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }) : "Unscheduled"}</p>
                      </div>
                   </div>

                   <div className="flex gap-4">
                      {selectedPreviewTask.script_url && (
                         <a href={selectedPreviewTask.script_url} target="_blank" className="flex-1 h-16 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-3 hover:border-emerald-500 transition-all group">
                             <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FileText size={16}/>
                             </div>
                             <span className="text-xs font-black text-[#0F172A] ">Open Script</span>
                         </a>
                      )}
                      {selectedPreviewTask.result_url && (
                         <a href={selectedPreviewTask.result_url} target="_blank" className="flex-1 h-16 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-3 hover:border-emerald-500 transition-all group">
                             <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Video size={16}/>
                             </div>
                             <span className="text-xs font-black text-[#0F172A] ">View Asset</span>
                         </a>
                      )}
                   </div>
                </div>

                <div className="p-10 bg-slate-50 border-t border-slate-100 flex gap-4">
                   <button 
                      onClick={() => { setIsPreviewModalOpen(false); openEditModal(selectedPreviewTask); }} 
                      className="flex-1 h-16 bg-slate-900 text-white rounded-[20px] font-black text-sm shadow-xl shadow-slate-900/10 hover:scale-105 active:scale-95 transition-all"
                   >
                     Edit Content Detail
                   </button>
                   <button 
                      onClick={() => { setIsPreviewModalOpen(false); setEditingMetricsTask(selectedPreviewTask); setMetricsForm({...selectedPreviewTask}); setIsMetricsModalOpen(true); }} 
                      className="px-10 h-16 bg-purple-600 text-white rounded-[20px] font-black text-sm shadow-xl shadow-purple-600/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                   >
                     <Zap size={18}/> Metrics
                   </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Universal Confirmation Modal */}
        <AnimatePresence>
          {confirmConfig.isOpen && (
            <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 exit={{ scale: 0.9, opacity: 0 }}
                 className="bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100"
               >
                  <div className="p-10 text-center space-y-6">
                     <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-lg ${confirmConfig.type === 'danger' ? 'bg-rose-50 text-rose-500 shadow-rose-200/50' : 'bg-emerald-50 text-emerald-500 shadow-emerald-200/50'}`}>
                        <AlertTriangle size={32}/>
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-xl font-black text-[#0F172A]">{confirmConfig.title}</h3>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed italic px-4">{confirmConfig.message}</p>
                     </div>
                     <div className="flex gap-3 pt-4">
                        <button 
                           onClick={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
                           className="flex-1 h-16 rounded-2xl bg-slate-50 text-slate-400 font-black text-xs hover:bg-slate-100 transition-all"
                        >
                           Batalkan
                        </button>
                        <button 
                           onClick={() => {
                              confirmConfig.onConfirm();
                              setConfirmConfig({ ...confirmConfig, isOpen: false });
                           }}
                           className={`flex-1 h-16 rounded-2xl text-white font-black text-xs shadow-xl transition-all hover:scale-105 active:scale-95 ${confirmConfig.type === 'danger' ? 'bg-rose-500 shadow-rose-500/20' : 'bg-emerald-600 shadow-emerald-600/20'}`}
                        >
                           Ya, Lanjutkan
                        </button>
                     </div>
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Intelligence Form Modal */}
        <AnimatePresence>
          {isIntelligenceModalOpen && (
            <div onClick={() => setIsIntelligenceModalOpen(false)} className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md cursor-pointer">
              <motion.div 
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-[44px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-100"
              >
                <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-[#0F172A] tracking-tight capitalize">
                       {intelligenceModalConfig.mode} {intelligenceModalConfig.type}
                    </h3>
                    <p className="text-[10px] font-black text-emerald-600  tracking-widest mt-1 uppercase">Intelligence Hub Config</p>
                  </div>
                  <button onClick={() => setIsIntelligenceModalOpen(false)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-slate-50"><X size={20}/></button>
                </div>

                <div className="p-10 space-y-6">
                   {intelligenceModalConfig.type !== 'task' ? (
                      <>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black  tracking-widest text-slate-400 ml-2">Stage/Role Title</label>
                           <input 
                              value={intelligenceModalConfig.data.title}
                              onChange={(e) => setIntelligenceModalConfig({...intelligenceModalConfig, data: {...intelligenceModalConfig.data, title: e.target.value}})}
                              placeholder="e.g. Video Production"
                              className="w-full h-16 rounded-2xl bg-slate-50 px-8 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100 shadow-inner"
                           />
                        </div>
                        {intelligenceModalConfig.type === 'stage' && (
                           <>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black  tracking-widest text-slate-400 ml-2">Responsible Role (PIC)</label>
                                 <input 
                                    value={intelligenceModalConfig.data.role}
                                    onChange={(e) => setIntelligenceModalConfig({...intelligenceModalConfig, data: {...intelligenceModalConfig.data, role: e.target.value}})}
                                    placeholder="e.g. Designer"
                                    className="w-full h-16 rounded-2xl bg-slate-50 px-8 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100 shadow-inner"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black  tracking-widest text-slate-400 ml-2">Job Description Summary</label>
                                 <textarea 
                                    value={intelligenceModalConfig.data.desc}
                                    onChange={(e) => setIntelligenceModalConfig({...intelligenceModalConfig, data: {...intelligenceModalConfig.data, desc: e.target.value}})}
                                    placeholder="Brief task overview..."
                                    className="w-full h-24 rounded-2xl bg-slate-50 p-6 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100 shadow-inner resize-none"
                                 />
                              </div>
                           </>
                        )}
                      </>
                   ) : (
                      <div className="space-y-2">
                         <label className="text-[10px] font-black  tracking-widest text-slate-400 ml-2">Jobdesk Description</label>
                         <input 
                            value={intelligenceModalConfig.data.task}
                            onChange={(e) => setIntelligenceModalConfig({...intelligenceModalConfig, data: {...intelligenceModalConfig.data, task: e.target.value}})}
                            placeholder="e.g. Create 3 alternative layouts"
                            className="w-full h-16 rounded-2xl bg-slate-50 px-8 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100 shadow-inner"
                         />
                      </div>
                   )}
                </div>

                <div className="p-10 pt-0">
                   <Button 
                      onClick={handleIntelligenceSubmit}
                      disabled={intelligenceModalConfig.type === 'task' ? !intelligenceModalConfig.data.task : !intelligenceModalConfig.data.title}
                      className="w-full h-20 rounded-3xl bg-slate-900 text-white font-black text-lg shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                   >
                      Save Configuration
                   </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>


        <button 
           onClick={() => setIsProfilePopupOpen(!isProfilePopupOpen)}
           className={`w-24 h-24 transition-all hover:scale-110 active:scale-95 z-[101] ${isProfilePopupOpen ? 'rotate-12' : ''}`}
        >
           <img 
              src={currentUserProfile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUserProfile?.full_name}`} 
              className="w-full h-full object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.25)]"
           />
        </button>
      </div>
    </div>
  );
}

