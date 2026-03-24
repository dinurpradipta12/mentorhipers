"use client";

import React, { useState, use, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";

import BottomBar from "@/components/layout/BottomBar";
import NotificationCenter from "@/components/layout/NotificationCenter";
import { SectionLabel } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Plus,
  Search,
  MapPin,
  Calendar as CalendarIcon,
  Zap,
  Target,
  Clock,
  Video,
  GraduationCap,
  BookOpen,
  LayoutDashboard,
  Calendar,
  Layers,
  Lightbulb,
  CheckSquare,
  ArrowRight,
  Sparkles,
  Instagram,
  TrendingUp,
  MessageSquare,
  Play,
  ArrowUpRight,
  Award,
  ShieldCheck,
  VideoIcon,
  Users,
  Edit3,
  X,
  Save,
  User,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Upload,
  AlertTriangle,
  Eye,
  MousePointerClick,
  Table,
  FileText,
  PlayCircle,
  BarChart2,
  BarChart3,
  PlayCircle as PlayIcon,
  ExternalLink,
  Columns,
  Filter,
  ChevronDown,
  Library, // Added Library icon
  Music,
  Route,
  Milestone,
  Flag,
  Check,
  Star,
  Link as LinkIcon,
  Globe,
  PlusCircle,
  Hash,
  Activity,
  CreditCard
} from "lucide-react";

// Mock data for a specific client page
const CLIENT_DATA = {
  id: "ID-123",
  name: "Jessica Alvera",
  niche: "Fashion & Lifestyle Positioning",
  progress: 65,
  status: "Optimizing Niche",
  paymentDue: "12 Apr",
  sessions: "14 / 20",
};

const getTimezoneLabel = () => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (tz === 'Asia/Jakarta' || tz === 'Asia/Pontianak' || tz === 'Asia/Bangkok') return 'WIB';
  if (tz === 'Asia/Makassar' || tz === 'Asia/Denpasar' || tz === 'Asia/Singapore') return 'WITA';
  if (tz === 'Asia/Jayapura') return 'WIT';

  const offset = new Date().getTimezoneOffset();
  if (offset === -420) return 'WIB';
  if (offset === -480) return 'WITA';
  if (offset === -540) return 'WIT';

  return '';
};

const formatIndonesianDate = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    const dayName = days[d.getDay()];
    const dayNum = d.getDate();
    const monthName = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');

    return `${dayName}, ${dayNum} ${monthName} ${year} - ${hours}.${minutes} ${getTimezoneLabel()}`;
  } catch (e) {
    return dateStr;
  }
};

const ScheduleItem = ({ title, time, status, type, onClick, isActive }: any) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between group cursor-pointer p-2 rounded-2xl transition-all ${isActive ? "bg-slate-50 shadow-sm ring-1 ring-slate-100" : "hover:bg-slate-50/50"
      }`}
  >
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${status === "Next" ? "bg-accent text-white shadow-accent-sm scale-105" : "bg-slate-50 text-slate-400"
        }`}>
        {type === "zoom" ? <CalendarIcon className="w-4 h-4" /> : type === "group" ? <Users className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
      </div>
      <div>
        <h6 className={`text-[11px] font-bold ${isActive ? "text-slate-900" : "text-slate-600"}`}>{title}</h6>
        <p className="text-[9px] text-muted-foreground font-medium">{formatIndonesianDate(time)}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {status === "Next" && (
        <div className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-[8px] font-bold border border-emerald-100">
          Live
        </div>
      )}
      <ChevronRight className={`w-3 h-3 text-slate-300 transition-transform ${isActive ? "rotate-90 text-accent" : "group-hover:translate-x-1"}`} />
    </div>
  </div>
);

export default function SharedBoardPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get("admin") === "true";

  const [activeTab, setActiveTab] = useState("dashboard");
  const [hasRestoredTab, setHasRestoredTab] = useState(false);

  // Restore active tab on mount
  useEffect(() => {
    const savedTab = localStorage.getItem(`board_tab_${resolvedParams.id}`);
    if (savedTab) {
      setActiveTab(savedTab);
    }
    setHasRestoredTab(true);
  }, []);

  // Save active tab on change
  useEffect(() => {
    if (hasRestoredTab) {
      localStorage.setItem(`board_tab_${resolvedParams.id}`, activeTab);
    }
  }, [activeTab, hasRestoredTab]);

  const [planView, setPlanView] = useState("table");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Reactive Client Board State
  const [boardData, setBoardData] = useState<any>({
    id: resolvedParams.id,
    name: "Loading...",
    profile_url: null,
    niche: "",
    currentPhase: 1,
    platformStats: {
      instagram: {
        followers: "0",
        engagement: "0%",
        reach: "0",
        views: "0",
        interactions: "0",
        percentages: { followers: 0, engagement: 0, reach: 0, views: 0, interactions: 0 }
      },
      tiktok: {
        followers: "0",
        engagement: "0%",
        views: "0",
        interactions: "0",
        percentages: { followers: 0, engagement: 0, views: 0, interactions: 0 }
      }
    },
    platforms: ["Instagram", "TikTok"],
    selectedPlatform: "Instagram",
    tasks: [],
    checklist: {
      items: [
        { id: 1, text: "Update Instagram Bio with CTA", done: true },
        { id: 2, text: "Research 10 trending audio", done: false },
        { id: 3, text: "Record Hooks for 3 Reels", done: false },
        { id: 4, text: "Analyze competitor top post", done: false }
      ],
      suggestion: "Fokus pada engagement hari ini, coba balas semua komen sebelum jam 12!"
    },
    schedule: [],
    roadmap: [
      { id: 1, title: "Foundation", description: "Niche, Bio, & Visual Branding Identity" },
      { id: 2, title: "Validation", description: "Content Strategy & Audience Engagement" },
      { id: 3, title: "Monetization", description: "Scale, Ads, & Product Ecosystem" }
    ],
    content_plan: [],
    plan_settings: { allow_edit: false },
    mentors_note: "Jangan lupa buat cek kembali lighting saat syuting modul 3 ya. Pastikan bayangan di wajah gak terlalu keras. Progress kamu di modul riset sudah bagus banget!",
    timeline_items: [
       {
         id: 1,
         activity: "Competitor Analysis & Hook Research",
         detail: "Fokus minggu ini adalah membedah 10 akun kompetitor teratas di niche Anda.",
         start_day: 10,
         end_day: 17,
         color: "bg-accent/40 text-accent"
       }
    ],
    app_settings: {
      app_name: "Mentorhipers",
      app_logo: ""
    },
    enabled_features: {
      dashboard: true,
      content_plan: true,
      timeline: true,
      reports: true
    }
  });

  const [liveStatus, setLiveStatus] = useState("online");

  useEffect(() => {
    const checkStatus = () => {
      const { manual_status, busy_slots } = boardData.mentor_persona || {};
      if (manual_status && manual_status !== "auto") {
        setLiveStatus(manual_status);
        return;
      }
      
      let isBusy = false;
      const now = new Date();
      if (Array.isArray(busy_slots)) {
         for(const slot of busy_slots) {
            const start = new Date(slot.start);
            const end = new Date(slot.end);
            if (now >= start && now <= end) {
               isBusy = true;
               break;
            }
         }
      }
      setLiveStatus(isBusy ? "busy" : "online");
    };
    checkStatus();
    const timer = setInterval(checkStatus, 60000); // Check every minute
    return () => clearInterval(timer);
  }, [boardData.mentor_persona]);

  useEffect(() => {
    const fetchBoardData = async () => {
      // 1. Privacy Shield
      const sessionStr = localStorage.getItem("mh_session");
      if (!sessionStr) {
        window.location.href = "/login";
        return;
      }

      const session = JSON.parse(sessionStr);
      // Admin bypass, but client must match their ID
      if (session.role === "client" && session.clientId !== resolvedParams.id) {
        window.location.href = "/login";
        return;
      }

      setIsLoading(true);
      if (!supabase) {
        console.error("Supabase client is not initialized. Please check your .env.local file.");
        setIsLoading(false);
        return;
      }

      // 2. Fetch Global App Settings
      const { data: settingsData } = await supabase.from('app_settings').select('*').eq('id', 1).single();
      if (settingsData) {
        setBoardData((prev: any) => ({
          ...prev,
          app_settings: {
            app_name: settingsData.app_name || "Mentorhipers",
            app_logo: settingsData.app_logo || ""
          }
        }));
      }

      // 3. Fetch Client Data
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", resolvedParams.id)
        .single();

      if (data) {
        setBoardData((prev: any) => ({
          ...prev,
          name: data.full_name,
          niche: data.niche,
          start_date: data.start_date,
          end_date: data.end_date,
          profile_url: data.profile_url,
          payment_data: data.payment_data,
          platformStats: data.platform_stats || prev.platformStats,
          platforms: data.platforms || ["Instagram", "TikTok"],
          currentPhase: data.current_phase || prev.currentPhase,
          tasks: data.tasks || [
            { label: "Onboarding", status: "Active" },
            { label: "Content Strategy", status: "Locked" }
          ],
          checklist: data.checklist || prev.checklist,
          schedule: data.schedule || [],
          roadmap: data.roadmap || prev.roadmap,
           content_plan: data.content_plan || [],
           plan_settings: data.plan_settings || { allow_edit: false },
            mentors_note: data.mentors_note || prev.mentors_note,
            timeline_items: data.timeline_items || prev.timeline_items,
            enabled_features: data.enabled_features || { dashboard: true, content_plan: true, timeline: true, reports: true }
        }));
      }

      // 3. Fetch Mentor Profile for the card safely
      const { data: mentorDataResult, error: mentorError } = await supabase.from('mentor_profile').select('*').limit(1);
      if (mentorDataResult && mentorDataResult.length > 0) {
        const mentorData = mentorDataResult[0];
        setBoardData((prev: any) => ({
          ...prev,
          mentor_persona: {
            name: mentorData.name,
            photo: mentorData.avatar,
            title: mentorData.headline,
            skills: mentorData.specialties ? (Array.isArray(mentorData.specialties) ? mentorData.specialties.join(',') : mentorData.specialties) : "Content Specialist",
            manual_status: mentorData.manual_status || "auto",
            status_message: mentorData.status_message || "",
            busy_slots: mentorData.busy_slots || []
          }
        }));
      } else if (mentorError) {
        console.error("Mentor profile fetch failed:", mentorError);
      }

      setIsLoading(false);
    };

    fetchBoardData();

    // -- REALTIME SUBSCRIPTION FOR THIS CLIENT --
    const channel = supabase
      .channel(`client-board-${resolvedParams.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'clients',
          filter: `id=eq.${resolvedParams.id}`
        },
        (payload: any) => {
          console.log('Admin updated this client data!', payload);
          const updated = payload.new as any;
          setBoardData((prev: any) => ({
            ...prev,
            name: updated.full_name,
            niche: updated.niche,
            start_date: updated.start_date,
            end_date: updated.end_date,
            profile_url: updated.profile_url,
            payment_data: updated.payment_data,
            platformStats: updated.platform_stats || prev.platformStats,
            platforms: updated.platforms || prev.platforms,
            tasks: updated.tasks || prev.tasks,
            checklist: updated.checklist || prev.checklist,
            schedule: updated.schedule || prev.schedule,
            roadmap: updated.roadmap || prev.roadmap,
            currentPhase: updated.current_phase || prev.currentPhase,
            content_plan: updated.content_plan || prev.content_plan,
            plan_settings: updated.plan_settings || prev.plan_settings,
            mentors_note: updated.mentors_note || prev.mentors_note,
            timeline_items: updated.timeline_items || prev.timeline_items,
            enabled_features: updated.enabled_features || prev.enabled_features
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'mentor_profile'
        },
        (payload: any) => {
          console.log('Mentor updated their profile!', payload);
          const mentorData = payload.new as any;
          setBoardData((prev: any) => ({
            ...prev,
            mentor_persona: {
              ...prev.mentor_persona,
              name: mentorData.name || prev.mentor_persona?.name,
              photo: mentorData.avatar || prev.mentor_persona?.photo,
              title: mentorData.headline || prev.mentor_persona?.title,
              skills: mentorData.specialties ? (Array.isArray(mentorData.specialties) ? mentorData.specialties.join(',') : mentorData.specialties) : prev.mentor_persona?.skills,
              manual_status: mentorData.manual_status || prev.mentor_persona?.manual_status || "auto",
              status_message: mentorData.status_message !== undefined ? mentorData.status_message : prev.mentor_persona?.status_message,
              busy_slots: mentorData.busy_slots || prev.mentor_persona?.busy_slots || []
            }
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'app_settings'
        },
        (payload: any) => {
          console.log('App settings updated globally!', payload);
          const settingsData = payload.new as any;
          setBoardData((prev: any) => ({
            ...prev,
            app_settings: {
              app_name: settingsData.app_name || prev.app_settings?.app_name,
              app_logo: settingsData.app_logo || prev.app_settings?.app_logo
            }
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [resolvedParams.id]);

  const syncBoardUpdate = async (field: string, value: any) => {
    // 1. Update local state immediately for snappy UI
    setBoardData((prev: any) => ({ ...prev, [field]: value }));

    // 2. Sync to Supabase in background
    try {
      // Column Mapping Map
      const colMap: any = {
         name: "full_name",
         currentPhase: "current_phase",
         platformStats: "platform_stats",
         mentors_note: "mentors_note",
         timeline_items: "timeline_items"
      };

      const targetCol = colMap[field] || field;

      const { error } = await supabase
        .from("clients")
        .update({ [targetCol]: value })
        .eq("id", resolvedParams.id);

      if (error) throw error;
      console.log(`Synced ${field} to Supabase as ${targetCol}`);
    } catch (err: any) {
      console.error(`Failed to sync ${field}:`, err.message || err.details || (typeof err === 'object' ? JSON.stringify(err) : err));
    }
  };

  const saveBoardData = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("clients")
        .update({
          platform_stats: boardData.platformStats,
          platforms: boardData.platforms,
          tasks: boardData.tasks,
          checklist: boardData.checklist,
          schedule: boardData.schedule,
          roadmap: boardData.roadmap,
          current_phase: boardData.currentPhase
        })
        .eq("id", resolvedParams.id);

      if (error) throw error;
      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error("Error saving data:", err);
      alert("Gagal menyimpan data: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBoard = (newData: any) => {
    setBoardData({ ...boardData, ...newData });
    setIsEditModalOpen(false);
  };


  const updateScheduleItem = (id: number, field: string, value: any) => {
    const newSchedule = boardData.schedule.map((item: any) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    syncBoardUpdate("schedule", newSchedule);
  };

  const addScheduleItem = () => {
    const newId = boardData.schedule.length > 0 ? Math.max(...boardData.schedule.map((s: any) => s.id)) + 1 : 1;
    const newItem = {
      id: newId,
      title: "New Session Topic",
      time: new Date().toISOString(),
      type: "zoom",
      status: "Upcoming",
      description: "Tuliskan deskripsi sesi mentoring di sini..."
    };
    syncBoardUpdate("schedule", [...boardData.schedule, newItem]);
  };


  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${boardData.id}-${Math.random()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update Database
      const { error: dbError } = await supabase
        .from("clients")
        .update({ profile_url: publicUrl })
        .eq("id", boardData.id);

      if (dbError) throw dbError;

      setBoardData({ ...boardData, profile_url: publicUrl });
    } catch (error: any) {
      alert("Error uploading image: " + error.message + ". Pastikan bucket 'avatars' sudah di-set ke PUBLIC di Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  const removeScheduleItem = (id: number) => {
    syncBoardUpdate("schedule", boardData.schedule.filter((s: any) => s.id !== id));
  };

  const calculateRemainingWeeks = (endDate: string) => {
    if (!endDate) return "0 Minggu";
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.max(0, Math.ceil(diffDays / 7));
    return `${weeks} Minggu`;
  };

  const getPaymentStatus = (paymentData: any) => {
    if (!paymentData) return "Belum Ada Data";
    if (paymentData.termin3) return "Lunas (Full)";
    if (paymentData.termin2) return "Termin 2 Aktif";
    if (paymentData.termin1) return "Termin 1 Lunas";
    return "Menunggu Pembayaran";
  };

  const getInitials = (name: string) => {
    if (!name || name === "Loading...") return "??";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getDayDiff = (endDate: string) => {
    if (!endDate) return 999;
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Auto-fallback if active tab is disabled
  useEffect(() => {
    if (boardData.enabled_features) {
      const { dashboard, content_plan, timeline, reports } = boardData.enabled_features;
      const isCalendarDisabled = activeTab === 'calendar' && !content_plan;
      const isTimelineDisabled = activeTab === 'timeline' && !timeline;
      const isReportsDisabled = activeTab === 'reports' && !reports;
      
      if (isCalendarDisabled || isTimelineDisabled || isReportsDisabled) {
         setActiveTab("dashboard");
      }
    }
  }, [activeTab, boardData.enabled_features]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-sans font-extrabold text-slate-400">
        Loading personal board data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 overflow-x-hidden" style={{ zoom: 0.85 }}>
      {/* Onboarding Lockscreen */}
      <AnimatePresence>
        {!boardData.profile_url && !isAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-white flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-accent/5 blur-[120px] rounded-full -z-10" />

            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="max-w-md w-full text-center space-y-10"
            >
              <div className="space-y-4">
                <SectionLabel label="Setup Your Identity" className="mx-auto" />
                <h2 className="text-4xl font-sans font-extrabold">Hello, <span className="italic text-accent">{boardData.name}</span></h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Selamat datang di portal eksklusif Mentorhipers. Sebelum memulai, silakan pasang foto profil terbaik Anda untuk mempersonalisasi pengalaman mentoring Anda.
                </p>
              </div>

              <div className="relative mx-auto w-32 h-32 group">
                <div className="w-full h-full rounded-[2.5rem] bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                  <User className="w-12 h-12 text-slate-300" />
                </div>
              </div>

              <div className="space-y-4">
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                <Button
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  className="w-full h-16 rounded-2xl bg-accent text-white font-bold shadow-accent-lg flex items-center justify-center gap-3"
                  disabled={isLoading}
                >
                  <Upload className="w-5 h-5" />
                  {isLoading ? "Uploading..." : "Upload Photo & Access Board"}
                </Button>
                <p className="text-[10px] text-slate-400 font-bold">
                  PNG, JPG or JPEG up to 5MB
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      <main className="mx-auto pt-12 transition-all duration-700 ease-in-out max-w-[1800px] px-4 md:px-8 xl:px-12">
        {/* TOP BRANDING HEADER (Option A) */}
        <motion.div 
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex items-center gap-4 mb-10 px-1 opacity-60 hover:opacity-100 transition-opacity"
        >
           {boardData.app_settings?.app_logo ? (
              <img src={boardData.app_settings.app_logo} className="h-8 max-w-[150px] object-contain" alt="App Logo" />
           ) : (
              <h1 className="text-[18px] font-extrabold text-[#202224] tracking-tight">
                 Admin<span className="text-[#4880FF]">Stack</span>
              </h1>
           )}
           <div className="h-4 w-px bg-slate-300 mx-1" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Mentee Board</span>
        </motion.div>

        {/* Landscape Header Section */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-16 relative"
        >
          {/* Decorative background accent */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent/5 blur-[120px] rounded-full -z-10" />

          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="relative group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-24 h-24 rounded-[2rem] bg-slate-100 flex items-center justify-center overflow-hidden shadow-accent-lg border-4 border-white group-hover:shadow-accent-xl transition-all duration-500"
              >
                {boardData.profile_url ? (
                  <img src={boardData.profile_url} alt={boardData.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center text-white text-3xl font-sans font-extrabold">
                    {getInitials(boardData.name)}
                  </div>
                )}
              </motion.div>
              {/* Dynamic Status Indicator Logo */}
              <motion.div
                animate={getDayDiff(boardData.end_date) < 7 ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : { rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center z-10 ${getDayDiff(boardData.end_date) < 7 ? 'bg-amber-400 text-white' : 'bg-emerald-500 text-white'}`}
              >
                {getDayDiff(boardData.end_date) < 7 ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Zap className="w-5 h-5 fill-current" />
                )}
              </motion.div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Mentoring Aktif
                </div>
              </div>

              <h2 className="text-4xl md:text-5xl font-sans font-extrabold tracking-tight text-foreground leading-tight">
                {boardData.name}
              </h2>

              <div className="flex flex-wrap gap-6 items-center">
                <p className="text-muted-foreground flex items-center gap-2 text-sm font-sans">
                  <Target className="w-4 h-4 text-accent" />
                  Niche: <span className="font-semibold text-foreground">{boardData.niche}</span>
                </p>
                <div className="h-1 w-1 rounded-full bg-border md:block hidden" />
                <p className="text-muted-foreground flex items-center gap-2 text-sm font-sans">
                  <CalendarIcon className="w-4 h-4 text-accent" />
                  Sisa Mentoring: <span className="font-semibold text-foreground">{calculateRemainingWeeks(boardData.end_date)}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 xl:mb-2">
            <motion.div 
               whileHover={{ scale: 1.02, y: -2 }}
               className={`flex items-center gap-6 p-4 pr-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group`}
            >
               {/* Background Glow */}
               <div className={`absolute -right-8 -top-8 w-24 h-24 blur-3xl opacity-20 pointer-events-none transition-colors duration-1000 ${liveStatus === 'busy' ? 'bg-rose-400' : liveStatus === 'away' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
               
               <div className="flex flex-col items-end gap-1 relative z-10 pl-4">
                  <div className="flex items-center gap-2">
                     <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${liveStatus === 'busy' ? 'text-rose-500' : liveStatus === 'away' ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {liveStatus === 'busy' ? 'Busy Reviewing' : liveStatus === 'away' ? 'Mentor Away' : 'Mentor Online'}
                     </span>
                     <div className="relative">
                        <div className={`w-2 h-2 rounded-full ${liveStatus === 'busy' ? 'bg-rose-500' : liveStatus === 'away' ? 'bg-amber-500' : 'bg-emerald-500'} ${liveStatus === 'online' ? 'animate-pulse' : ''}`} />
                        {liveStatus === 'online' && <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />}
                     </div>
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 truncate max-w-[150px] italic">
                     {boardData.mentor_persona?.status_message || "Ready to help you scale!"}
                  </p>
               </div>

               <div className={`w-14 h-14 rounded-2xl bg-white p-1 border-2 transition-all duration-500 relative z-10 ${liveStatus === 'busy' ? 'border-rose-100 shadow-rose-500/10' : liveStatus === 'away' ? 'border-amber-100 shadow-amber-500/10' : 'border-emerald-100 shadow-emerald-500/10'}`}>
                  {boardData.mentor_persona?.photo ? (
                     <img src={boardData.mentor_persona.photo} alt="Mentor" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                     <div className="w-full h-full bg-slate-50 flex items-center justify-center rounded-xl text-slate-300">
                        <User className="w-6 h-6" />
                     </div>
                  )}
               </div>
            </motion.div>

            {isAdmin && (
              <Button
                onClick={() => setIsEditModalOpen(true)}
                className="rounded-2xl bg-white border-2 border-accent text-accent hover:bg-accent hover:text-white font-bold h-16 px-8 shadow-sm transition-all flex items-center gap-2"
              >
                <Edit3 className="w-5 h-5" />
                Manage Board
              </Button>
            )}


          </div>
        </motion.div>

        {/* Expansive Content Area */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="space-y-12 pb-12"
              >
                {/* 1. Growth Pulse Section */}
                {boardData.enabled_features.reports && (
                  <section>
                    <div className="flex items-end justify-between mb-8">
                      <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <h3 className="text-2xl font-sans font-extrabold">Account <span className="italic text-accent">Stats</span></h3>
                        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
                          {boardData.platforms.map((platform: string) => (
                            <button
                              key={platform}
                              onClick={() => setBoardData({ ...boardData, selectedPlatform: platform })}
                              className={`px-6 py-2 rounded-xl text-[10px] font-bold transition-all ${boardData.selectedPlatform === platform ? "bg-white text-accent shadow-sm ring-1 ring-slate-200" : "text-slate-400 hover:text-slate-600"
                                }`}
                            >
                              {platform}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="text-xs font-bold text-muted-foreground/60 tracking-widest bg-muted/30 px-4 py-2 rounded-full border border-border/50">
                        Last 30 Days
                      </div>
                    </div>
                    <div className={`grid grid-cols-1 ${boardData.selectedPlatform.toLowerCase() === 'instagram' ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-6`}>
                      <StatCard
                        label="Total Followers"
                        value={boardData.platformStats[boardData.selectedPlatform.toLowerCase()]?.followers || "0"}
                        percent={boardData.platformStats[boardData.selectedPlatform.toLowerCase()]?.percentages?.followers || 0}
                        icon={Users}
                        platform={boardData.selectedPlatform}
                      />
                      <StatCard
                        label="Engagement Rate"
                        value={boardData.platformStats[boardData.selectedPlatform.toLowerCase()]?.engagement || "0%"}
                        percent={boardData.platformStats[boardData.selectedPlatform.toLowerCase()]?.percentages?.engagement || 0}
                        icon={Zap}
                        platform={boardData.selectedPlatform}
                      />
                      {boardData.selectedPlatform.toLowerCase() === 'instagram' && (
                        <StatCard
                          label="Total Reach"
                          value={boardData.platformStats.instagram.reach}
                          percent={boardData.platformStats.instagram.percentages.reach}
                          icon={Target}
                          platform="Instagram"
                        />
                      )}
                      <StatCard
                        label="Total Views"
                        value={boardData.platformStats[boardData.selectedPlatform.toLowerCase()]?.views || "0"}
                        percent={boardData.platformStats[boardData.selectedPlatform.toLowerCase()]?.percentages?.views || 0}
                        icon={Eye}
                        platform={boardData.selectedPlatform}
                      />
                      <StatCard
                        label="Total Interaksi"
                        value={boardData.platformStats[boardData.selectedPlatform.toLowerCase()]?.interactions || "0"}
                        percent={boardData.platformStats[boardData.selectedPlatform.toLowerCase()]?.percentages?.interactions || 0}
                        icon={MousePointerClick}
                        platform={boardData.selectedPlatform}
                      />
                    </div>
                  </section>
                )}

                <div className="space-y-10">
                  {/* ROW 1: ROADMAP SECTION (Always Top Focus) */}
                  <div className="w-full">
                    {/* 2. Mentoring Phase Roadmap */}
                    <Card className="p-10 relative overflow-hidden group border-none bg-white shadow-sm rounded-[3rem]">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/50 blur-[120px] rounded-full -mr-40 -mt-40 transition-colors duration-700" />

                      <div className="relative z-10 w-full">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                          <div>
                            <h3 className="text-4xl font-sans font-extrabold leading-tight text-slate-900">Mentoring <span className="italic text-accent">Roadmap</span></h3>
                          </div>
                          <div className="bg-emerald-50/50 px-8 py-4 rounded-full border border-emerald-100 text-emerald-600 font-bold text-xs flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Current: Phase 0{boardData.currentPhase}
                          </div>
                        </div>

                        {/* Phase Visualization */}
                        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                          {/* Connector Line */}
                          {boardData.roadmap.length > 1 && (
                            <div className="hidden md:block absolute top-[26px] left-[10%] right-[10%] h-0.5 bg-slate-100 -z-10" />
                          )}

                          {boardData.roadmap.map((phase: any, index: number) => (
                            <PhaseStep
                              key={phase.id}
                              phase={String(index + 1).padStart(2, '0')}
                              title={phase.title}
                              status={boardData.currentPhase > index + 1 ? "completed" : boardData.currentPhase === index + 1 ? "active" : "upcoming"}
                              description={phase.description}
                              color={index === 0 ? "blue" : index === 1 ? "emerald" : "amber"}
                            />
                          ))}
                        </div>


                      </div>
                    </Card>
                  </div>

                  {/* ROW 2: HUB CONTENT (Grid 8/4) */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                    {/* Left Column (8/12): Main Action & Focus */}
                    <div className="xl:col-span-8 space-y-10">
                      
                      {/* Learning Mission & Focus (ONLY IN MENTORING MODE) */}
                      {boardData.enabled_features.timeline && !boardData.enabled_features.reports && (
                        <Card className="p-8 rounded-[2.5rem] border-none bg-gradient-to-br from-[#4880FF]/10 to-indigo-50/50 relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 blur-3xl rounded-full -mr-20 -mt-20" />
                           <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                              <div className="flex items-center gap-5">
                                 <div className="w-14 h-14 rounded-2xl bg-[#4880FF] text-white flex items-center justify-center shadow-lg shadow-[#4880FF]/30">
                                    <Target size={24} />
                                 </div>
                                 <div className="text-left">
                                    <h4 className="text-lg font-black text-slate-900 leading-tight">Learning Goals & <span className="text-accent italic">Mission</span></h4>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Focus Minggu ini: {boardData.roadmap[boardData.currentPhase - 1]?.title || 'Foundation Stage'}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-2">
                                 <div className="px-5 py-2.5 rounded-2xl bg-white/80 backdrop-blur-sm border border-[#4880FF]/10 shadow-sm">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5 text-left">Progress Kurikulum</span>
                                    <div className="flex items-center gap-3">
                                       <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                          <div className="h-full bg-[#4880FF] rounded-full" style={{ width: `${(boardData.currentPhase / boardData.roadmap.length) * 100}%` }} />
                                       </div>
                                       <span className="text-xs font-black text-slate-900">{Math.round((boardData.currentPhase / boardData.roadmap.length) * 100)}%</span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </Card>
                      )}

                      {/* Mentee Priority Action Items (Moved to Left Side) */}
                      <Card className="p-10 rounded-[3rem] border border-border bg-white shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-60 h-60 bg-emerald-50/30 blur-[80px] rounded-full -mr-32 -mt-32" />
                        <h4 className="text-sm font-extrabold tracking-widest mb-10 flex items-center gap-3">
                          <CheckSquare className="w-5 h-5 text-emerald-500" />
                          Priority <span className="italic">Action Items</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                          {boardData.checklist.items
                            .filter((item: any) => {
                               if (!item.category || item.category === 'general') return true;
                               if (item.category === 'mentoring' && boardData.enabled_features.timeline) return true;
                               if (item.category === 'handling' && boardData.enabled_features.content_plan) return true;
                               return false;
                            })
                            .map((item: any) => (
                              <ActionItem key={item.id} text={item.text} done={item.done} category={item.category} />
                            ))}
                        </div>

                        {boardData.checklist.items.length === 0 && (
                          <div className="py-20 text-center space-y-4 opacity-30">
                             <CheckSquare size={48} className="mx-auto" />
                             <p className="text-xs font-bold tracking-widest">TIDAK ADA TUGAS AKTIF</p>
                          </div>
                        )}
                      </Card>

                      {/* 3. Content Queue (Only if handling on) */}
                      {boardData.enabled_features.content_plan && (
                      <section>
                        <h3 className="text-xl font-sans font-extrabold mb-6 flex items-center gap-3">
                          <Layers className="w-5 h-5 text-accent" />
                          Next <span className="italic">to Post</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {(() => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const next7Days = new Date(today);
                            next7Days.setDate(today.getDate() + 7);
                            next7Days.setHours(23, 59, 59, 999);

                            const upcomingContent = boardData.content_plan
                              .filter((item: any) => {
                                if (!item.date) return false;
                                const itemDate = new Date(item.date);
                                return itemDate >= today && itemDate <= next7Days;
                              })
                              .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                              .slice(0, 3);

                            if (upcomingContent.length === 0) {
                              return (
                                <div className="col-span-3 p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 border-dashed text-center">
                                  <p className="text-xs font-sans font-bold text-slate-400">Belum ada konten yang dijadwalkan dalam 7 hari ke depan.</p>
                                  <button onClick={() => setActiveTab("calendar")} className="mt-4 text-[10px] font-black text-accent uppercase tracking-widest hover:underline">Buka Content Plan</button>
                                </div>
                              );
                            }

                            const formatQueueDate = (dateStr: string) => {
                              const d = new Date(dateStr);
                              const now = new Date();
                              const todayCheck = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                              const itemDateCheck = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                              const diffDays = Math.round((itemDateCheck.getTime() - todayCheck.getTime()) / (1000 * 60 * 60 * 24));

                              if (diffDays === 0) return "Today";
                              if (diffDays === 1) return "Tomorrow";
                              return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                            };

                            return upcomingContent.map((item: any) => (
                              <ContentQueueItem
                                key={item.id}
                                title={item.headline || "Tanpa Judul"}
                                type={item.platform === "TikTok" ? "Reels" : "Carousel"}
                                date={formatQueueDate(item.date)}
                                status={item.status}
                              />
                            ));
                          })()}
                        </div>
                      </section>
                    )}
                  </div>

                  {/* Right Column: 4/12 */}
                  <div className="xl:col-span-4 space-y-8">
                    {/* 4. Mentoring Calendar & Schedule */}
                    <Card className="p-8 rounded-[2.5rem] border border-border bg-white shadow-sm relative">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h4 className="text-sm font-extrabold tracking-widest flex items-center gap-2">
                            Mentoring <span className="italic">Calendar</span>
                          </h4>
                          <p className="text-[10px] text-muted-foreground font-bold mt-1">March 2024</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 rounded-xl border border-border hover:bg-slate-50 transition-colors">
                            <ChevronLeft className="w-3 h-3 text-slate-400" />
                          </button>
                          <button className="p-2 rounded-xl border border-border hover:bg-slate-50 transition-colors">
                            <ChevronRight className="w-3 h-3 text-slate-400" />
                          </button>
                        </div>
                      </div>

                      {/* Mini Calendar View using Real State */}
                      <div className="grid grid-cols-7 gap-y-2 text-center mb-8">
                        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                          <span key={i} className="text-[9px] font-bold text-slate-300 capitalize">{day}</span>
                        ))}
                        {Array.from({ length: 31 }, (_, i) => {
                          const today = new Date();
                          const dayNum = i + 1;
                          const scheduleForDay = boardData.schedule.find((s: any) => {
                            const d = new Date(s.time);
                            return !isNaN(d.getTime()) &&
                              d.getDate() === dayNum &&
                              d.getMonth() === today.getMonth() &&
                              d.getFullYear() === today.getFullYear();
                          });
                          const isToday = dayNum === today.getDate();
                          return (
                            <div key={i} className="flex items-center justify-center p-1">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold transition-all relative ${isToday ? "bg-accent text-white shadow-accent-sm" :
                                  scheduleForDay ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"
                                }`}>
                                {dayNum}
                                {scheduleForDay && !isToday && (
                                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-400" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="space-y-6 pt-6 border-t border-slate-50">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-[10px] font-bold tracking-widest text-slate-400">Upcoming Schedule</h5>
                          <div className="h-1px flex-1 mx-4 bg-slate-50" />
                        </div>

                        <div className="space-y-4 relative">
                          {boardData.schedule.map((item: any) => (
                            <div key={item.id} className="relative">
                              <ScheduleItem
                                key={item.id}
                                title={item.title}
                                time={item.time}
                                status={item.status}
                                type={item.type}
                                onClick={() => setSelectedScheduleId(selectedScheduleId === item.id ? null : item.id)}
                                isActive={selectedScheduleId === item.id}
                              />

                              {/* Popup Detail pada SISI KIRI (Agar tidak terpotong card) */}
                              <AnimatePresence>
                                {selectedScheduleId === item.id && (
                                  <motion.div
                                    initial={{ opacity: 0, x: 40, scale: 0.95 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: 40, scale: 0.95 }}
                                    className="absolute right-full top-0 mr-4 w-72 p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl shadow-slate-950/60 border border-white/10 z-[110] backdrop-blur-xl"
                                  >
                                    <div className="flex items-center justify-between mb-6">
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.type === "zoom" ? "bg-indigo-500/10 text-indigo-400" : "bg-emerald-500/10 text-emerald-400"
                                        }`}>
                                        {item.type === "zoom" ? <CalendarIcon className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
                                      </div>
                                      <button onClick={(e) => { e.stopPropagation(); setSelectedScheduleId(null); }}>
                                        <X className="w-4 h-4 text-slate-500 hover:text-white transition-colors" />
                                      </button>
                                    </div>
                                    <h5 className="text-base font-bold text-white mb-2 leading-tight">{item.title}</h5>
                                    <p className="text-[11px] text-slate-400 leading-relaxed mb-6">
                                      {item.description}
                                    </p>
                                    <div className="flex flex-col gap-3 mb-6">
                                      <div className="flex items-center justify-between text-[9px] py-1 border-b border-white/5">
                                        <span className="text-slate-500 font-bold tracking-widest">Time</span>
                                        <span className="text-white font-bold">{formatIndonesianDate(item.time)}</span>
                                      </div>
                                      <div className="flex items-center justify-between text-[9px] py-1 border-b border-white/5">
                                        <span className="text-slate-500 font-bold tracking-widest">Platform</span>
                                        <span className="text-white font-bold">{item.type}</span>
                                      </div>
                                    </div>

                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>

                        <Button className="w-full rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-none font-bold text-xs h-12 transition-all">
                          View All Schedule
                        </Button>
                      </div>
                    </Card>




                  </div>
                </div>
              </div>
            </motion.div>
            )}

            {activeTab === "calendar" && (
              <motion.div
                key="content-plan"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <ContentPlanHub
                  data={boardData}
                  isAdmin={isAdmin}
                  view={planView}
                  setView={setPlanView}
                  onUpdate={syncBoardUpdate}
                />
              </motion.div>
            )}
             {activeTab === "timeline" && (
               <motion.div
                 key="timeline"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
               >
                 <MentoringTimelineHub 
                    data={{ ...boardData, liveStatus }} 
                    isAdmin={isAdmin}
                    onUpdate={syncBoardUpdate}
                 />
               </motion.div>
             )}
             {activeTab === "reports" && (
                <motion.div
                  key="goals"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <GoalsRoadmapView 
                     clientId={resolvedParams.id} 
                     isAdmin={isAdmin}
                     paymentData={boardData.payment_data}
                     getPaymentStatus={getPaymentStatus}
                  />
                </motion.div>
              )}
          </AnimatePresence>
        </div>
      </main>

      <BottomBar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        enabledFeatures={boardData.enabled_features}
        clientInfo={{ 
          id: resolvedParams.id, 
          name: boardData.name, 
          avatar: boardData.profile_url 
        }} 
      />

      {/* Real-time Notification Center */}
      <NotificationCenter clientId={resolvedParams.id} />

      {/* Admin Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-7xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white/20"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                      <Edit3 className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-sans font-extrabold">Quick Update Dashboard</h2>
                      <p className="text-xs text-muted-foreground font-medium tracking-widest mt-1">Management Mode</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="p-3 rounded-2xl hover:bg-slate-50 text-slate-400 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="max-h-[75vh] min-h-[500px] overflow-y-auto custom-scrollbar px-8 pb-12">
                  <div className="grid grid-cols-12 gap-8 items-start">
                    {/* Column 1: Dashboard Stats */}
                    <div className="col-span-12 xl:col-span-3 space-y-8 xl:sticky xl:top-0">
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold tracking-widest text-slate-400 ml-2">Active Phase</label>
                        <select
                          className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 px-6 font-bold text-sm focus:outline-none focus:ring-2 ring-accent/20 appearance-none shadow-sm"
                          value={boardData.currentPhase}
                          onChange={(e) => setBoardData({ ...boardData, currentPhase: parseInt(e.target.value) })}
                        >
                          <option value={1}>Fase 01: Foundation</option>
                          <option value={2}>Fase 02: Validation</option>
                          <option value={3}>Fase 03: Monetization</option>
                        </select>
                      </div>

                      {boardData.enabled_features.reports && (
                        <>
                          <div className="p-5 rounded-[2rem] bg-[#E1306C]/5 border border-[#E1306C]/10 space-y-5">
                            <h4 className="text-[10px] font-bold tracking-[0.2em] text-[#E1306C] flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#E1306C]" /> Instagram
                            </h4>
                            <div className="grid grid-cols-1 gap-3">
                              {['followers', 'engagement', 'reach', 'views', 'interactions'].map((key) => (
                                <div key={key} className="space-y-1">
                                  <label className="text-[8px] font-bold text-slate-400 ml-1">{key}</label>
                                  <input
                                    className="w-full h-10 rounded-xl bg-white border border-slate-100 px-3 font-bold text-xs shadow-sm"
                                    value={boardData.platformStats.instagram[key as keyof typeof boardData.platformStats.instagram]}
                                    onChange={(e) => setBoardData({
                                      ...boardData,
                                      platformStats: { ...boardData.platformStats, instagram: { ...boardData.platformStats.instagram, [key]: e.target.value } }
                                    })}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="p-5 rounded-[2rem] bg-slate-900/5 border border-slate-200 space-y-5">
                            <h4 className="text-[10px] font-bold tracking-[0.2em] text-slate-900 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-900" /> TikTok
                            </h4>
                            <div className="grid grid-cols-1 gap-3">
                              {['followers', 'engagement', 'views', 'interactions'].map((key) => (
                                <div key={key} className="space-y-1">
                                  <label className="text-[8px] font-bold text-slate-400 ml-1">{key}</label>
                                  <input
                                    className="w-full h-10 rounded-xl bg-white border border-slate-100 px-3 font-bold text-xs shadow-sm"
                                    value={boardData.platformStats.tiktok[key as keyof typeof boardData.platformStats.tiktok]}
                                    onChange={(e) => setBoardData({
                                      ...boardData,
                                      platformStats: { ...boardData.platformStats, tiktok: { ...boardData.platformStats.tiktok, [key]: e.target.value } }
                                    })}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Column 2: Content Management */}
                    <div className="col-span-12 xl:col-span-6 space-y-10 border-x border-slate-50 px-8">
                      {/* Schedule */}
                      <div className="space-y-5">
                        <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                          <h4 className="text-[10px] font-bold tracking-[0.2em] text-indigo-500">Mentoring Schedule</h4>
                          <button onClick={addScheduleItem} className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100"><Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="space-y-4">
                          {boardData.schedule.map((item: any) => (
                            <div key={item.id} className="p-5 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-3 group/item hover:bg-white hover:shadow-md transition-all">
                              <div className="flex gap-4">
                                <div className="flex-1 space-y-2">
                                  <input className="w-full bg-transparent font-bold text-sm focus:outline-none" value={item.title} onChange={(e) => updateScheduleItem(item.id, "title", e.target.value)} placeholder="Topic Title" />
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[8px] font-bold text-slate-300 ml-1">Select Date & Time</label>
                                    <input
                                      type="datetime-local"
                                      className="w-full bg-white border border-slate-100 rounded-lg px-3 py-1 text-[10px] text-indigo-600 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-200"
                                      value={item.time.length > 16 ? new Date(new Date(item.time).getTime() - new Date(item.time).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : item.time}
                                      onChange={(e) => {
                                        // Konversi input local admin ke ISO UTC untuk database
                                        const localDate = new Date(e.target.value);
                                        updateScheduleItem(item.id, "time", localDate.toISOString());
                                      }}
                                    />
                                  </div>
                                </div>
                                <button onClick={() => removeScheduleItem(item.id)} className="p-2 rounded-lg text-red-300 opacity-0 group-hover/item:opacity-100 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                              </div>
                              <textarea className="w-full bg-white border border-slate-100 rounded-xl p-3 text-[10px] text-slate-500 focus:outline-none resize-none" rows={2} value={item.description} onChange={(e) => updateScheduleItem(item.id, "description", e.target.value)} placeholder="Description" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Roadmap */}
                      {boardData.enabled_features.timeline && (
                        <div className="space-y-5 pt-5 border-t border-slate-100">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-bold tracking-[0.2em] text-accent">Roadmap Manager</h4>
                            <button
                              onClick={() => {
                                const newId = boardData.roadmap.length > 0 ? Math.max(...boardData.roadmap.map((p: any) => p.id)) + 1 : 1;
                                setBoardData({ ...boardData, roadmap: [...boardData.roadmap, { id: newId, title: "New Phase", description: "Phase desc" }] });
                              }}
                              className="p-2 rounded-xl bg-accent/5 text-accent hover:bg-accent/10"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {boardData.roadmap.map((phase: any, index: number) => (
                              <div key={phase.id} className="p-4 rounded-[2rem] bg-slate-50 border border-slate-100 group/phase relative hover:bg-white hover:shadow-sm transition-all">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-[8px] font-bold text-slate-300">Phase 0{index + 1}</span>
                                  <button
                                    onClick={() => setBoardData({ ...boardData, roadmap: boardData.roadmap.filter((p: any) => p.id !== phase.id) })}
                                    className="text-red-200 hover:text-red-400 opacity-0 group-hover/phase:opacity-100 transition-all"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                                <input className="w-full bg-transparent font-bold text-xs mb-1 focus:outline-none" value={phase.title} onChange={(e) => {
                                  const res = boardData.roadmap.map((p: any) => p.id === phase.id ? { ...p, title: e.target.value } : p);
                                  setBoardData({ ...boardData, roadmap: res });
                                }} />
                                <textarea className="w-full bg-transparent text-[9px] text-slate-400 focus:outline-none resize-none" rows={2} value={phase.description} onChange={(e) => {
                                  const res = boardData.roadmap.map((p: any) => p.id === phase.id ? { ...p, description: e.target.value } : p);
                                  setBoardData({ ...boardData, roadmap: res });
                                }} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Column 3: Mentoring Ops (Right) */}
                    <div className="col-span-12 xl:col-span-3 space-y-10">
                      {/* Mentor Checklist Manager */}
                      <div className="space-y-6 p-6 rounded-[2.5rem] bg-indigo-50/30 border border-indigo-100 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-bold tracking-[0.2em] text-indigo-600">Mentor Checklist</h4>
                          <button
                            onClick={() => {
                              const newId = boardData.checklist.items.length > 0 ? Math.max(...boardData.checklist.items.map((i: any) => i.id)) + 1 : 1;
                              setBoardData({
                                ...boardData,
                                checklist: {
                                  ...boardData.checklist,
                                  items: [...boardData.checklist.items, { id: newId, text: "New Task", done: false, category: "general" }]
                                }
                              });
                            }}
                            className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          {boardData.checklist.items.map((check: any) => (
                            <div key={check.id} className="flex items-start gap-2 group/check">
                              <button
                                onClick={() => {
                                  const res = boardData.checklist.items.map((i: any) => i.id === check.id ? { ...i, done: !i.done } : i);
                                  setBoardData({ ...boardData, checklist: { ...boardData.checklist, items: res } });
                                }}
                                className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all ${check.done ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'}`}
                              >
                                {check.done && <CheckSquare className="w-3 h-3" />}
                              </button>
                              <input
                                className={`flex-1 bg-transparent text-[11px] focus:outline-none transition-all ${check.done ? 'text-slate-300 line-through' : 'text-slate-600 font-medium'}`}
                                value={check.text}
                                onChange={(e) => {
                                  const res = boardData.checklist.items.map((i: any) => i.id === check.id ? { ...i, text: e.target.value } : i);
                                  setBoardData({ ...boardData, checklist: { ...boardData.checklist, items: res } });
                                }}
                              />
                              <div className="flex items-center gap-1 opacity-10 md:opacity-100 group-hover/check:opacity-100 transition-opacity">
                                {[
                                  { id: 'general', icon: <Zap size={10} /> },
                                  { id: 'mentoring', icon: <GraduationCap size={10} /> },
                                  { id: 'handling', icon: <Video size={10} /> }
                                ].map((cat) => (
                                  <button
                                    key={cat.id}
                                    onClick={() => {
                                      const res = boardData.checklist.items.map((i: any) => i.id === check.id ? { ...i, category: cat.id } : i);
                                      setBoardData({ ...boardData, checklist: { ...boardData.checklist, items: res } });
                                    }}
                                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${check.category === cat.id ? 'bg-indigo-100 text-indigo-600' : 'text-slate-300 hover:text-slate-400'}`}
                                  >
                                    {cat.icon}
                                  </button>
                                ))}
                              </div>
                              <button
                                onClick={() => {
                                  const res = boardData.checklist.items.filter((i: any) => i.id !== check.id);
                                  setBoardData({ ...boardData, checklist: { ...boardData.checklist, items: res } });
                                }}
                                className="text-red-300 opacity-0 group-hover/check:opacity-100 hover:text-red-500 transition-all"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="pt-4 border-t border-indigo-100">
                          <label className="text-[8px] font-bold text-indigo-400 mb-2 block">Mentor's Suggestion</label>
                          <textarea
                            className="w-full bg-white/50 border border-indigo-100 rounded-2xl p-3 text-[10px] text-indigo-700 placeholder:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            rows={3}
                            value={boardData.checklist.suggestion}
                            onChange={(e) => setBoardData({ ...boardData, checklist: { ...boardData.checklist, suggestion: e.target.value } })}
                            placeholder="Give some words of wisdom..."
                          />
                        </div>
                      </div>

                      {/* Active Phase Tasks Section */}
                      {boardData.enabled_features.timeline && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h4 className="text-[10px] font-bold tracking-[0.2em] text-accent">Active Phase Tasks</h4>
                            <button
                              onClick={() => setBoardData({ ...boardData, tasks: [...boardData.tasks, { label: "New Task", status: "Locked" }] })}
                              className="p-1.5 rounded-lg bg-accent/5 text-accent hover:bg-accent/10"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="space-y-3">
                            {boardData.tasks.map((task: any, index: number) => (
                              <div key={index} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 group/task relative hover:bg-white hover:shadow-sm transition-all">
                                <input className="w-full bg-transparent font-bold text-[10px] focus:outline-none" value={task.label} onChange={(e) => {
                                  const res = boardData.tasks.map((t: any, i: number) => i === index ? { ...t, label: e.target.value } : t);
                                  setBoardData({ ...boardData, tasks: res });
                                }} />
                                <div className="flex justify-between items-center">
                                  <select
                                    className="text-[9px] font-bold bg-white px-2 py-0.5 rounded border border-slate-100 appearance-none focus:outline-none"
                                    value={task.status}
                                    onChange={(e) => {
                                      const res = boardData.tasks.map((t: any, i: number) => i === index ? { ...t, status: e.target.value } : t);
                                      setBoardData({ ...boardData, tasks: res });
                                    }}
                                  >
                                    <option value="Active">Active</option>
                                    <option value="Done">Done</option>
                                    <option value="Locked">Locked</option>
                                  </select>
                                  <button onClick={() => setBoardData({ ...boardData, tasks: boardData.tasks.filter((_: any, i: number) => i !== index) })} className="text-red-200 hover:text-red-400 opacity-0 group-hover/task:opacity-100 transition-all text-[10px]">Delete</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-10 pt-0 border-t border-slate-50 flex justify-center">
                  <Button
                    onClick={saveBoardData}
                    disabled={isLoading}
                    className="w-full max-w-sm h-16 rounded-[2rem] bg-accent text-white hover:bg-accent-secondary font-bold text-lg shadow-accent-lg flex items-center justify-center gap-3 mt-6 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-6 h-6" />
                        Save & Publish Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Content Plan Components ---

const ContentPlanHub = ({ data, isAdmin, onUpdate, view, setView }: any) => {
  const [filters, setFilters] = useState({ platform: "All", search: "" });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedKanbanId, setSelectedKanbanId] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);



  const allItems = data.content_plan || [];
  const draftItems = allItems.filter((i: any) => i.isDraft);
  const sortedItems = allItems.filter((i: any) => !i.isDraft).sort((a: any, b: any) => {
    const t1 = new Date(a.date).getTime();
    const t2 = new Date(b.date).getTime();
    if (t1 && t2 && t1 !== t2) return t1 - t2;
    if (!t1 && t2) return 1;
    if (t1 && !t2) return -1;
    return a.id.localeCompare(b.id);
  });

  const content = [...draftItems, ...sortedItems].filter((item: any) => {
    const matchesPlatform = filters.platform === "All" || item.platform === filters.platform;
    const matchesSearch = !filters.search ||
      item.headline?.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.objective?.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.pillar?.toLowerCase().includes(filters.search.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  const canEdit = isAdmin || data.plan_settings?.allow_edit;

  const updateItem = (id: string, field: string, value: any) => {
    if (!canEdit) return;
    const newPlan = data.content_plan.map((item: any) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onUpdate("content_plan", newPlan);
  };

  const addItem = () => {
    if (!canEdit) return;
    const newItem = {
      id: Math.random().toString(36).substring(2, 11),
      date: "",
      status: "Planning",
      platform: "Instagram",
      headline: "",
      objective: "",
      pillar: "",
      value: "",
      script_link: "",
      result_link: "",
      post_link: "",
      isDraft: true,
      metrics: {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        reach: 0,
        reposts: 0,
        retention: 0
      }
    };
    onUpdate("content_plan", [newItem, ...(data.content_plan || [])]);
  };

  const removeItem = (id: string) => {
    if (!isAdmin) return;
    if (confirm("Hapus rencana konten ini?")) {
      const newPlan = (data.content_plan || []).filter((i: any) => i.id !== id);
      onUpdate("content_plan", newPlan);
    }
  };

  return (
    <div className="space-y-6 pb-40 w-full">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 px-1">
        {(filters.platform === "All" || filters.platform === "Instagram") && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
            <Instagram className="w-4 h-4 text-[#E1306C]" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-800">@{data.name?.toLowerCase().replace(/\s/g, '') || "username"}</span>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500">
                <span className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 flex items-center gap-1">
                   <strong className="text-slate-900 font-black">{data.platformStats.instagram.followers}</strong> Followers
                </span>
                <span className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 flex items-center gap-1">
                   <strong className="text-slate-900 font-black">{data.platformStats.instagram.engagement}</strong> ER
                </span>
              </div>
            </div>
          </div>
        )}

        {(filters.platform === "All" || filters.platform === "TikTok") && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500 delay-75">
            <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" /></svg>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-800">@{data.name?.toLowerCase().replace(/\s/g, '') || "username"}</span>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500">
                <span className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 flex items-center gap-1">
                   <strong className="text-slate-900 font-black">{data.platformStats.tiktok.followers}</strong> Followers
                </span>
                <span className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 flex items-center gap-1">
                   <strong className="text-slate-900 font-black">{data.platformStats.tiktok.engagement}</strong> ER
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hub Header & Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/40 shadow-sm">
          <button
            onClick={() => setView("table")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${view === "table" ? "bg-accent text-white shadow-accent-sm" : "text-slate-400 hover:text-slate-600"
              }`}
          >
            <Table className="w-4 h-4" /> Table
          </button>
          <button
            onClick={() => setView("kanban")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${view === "kanban" ? "bg-accent text-white shadow-accent-sm" : "text-slate-400 hover:text-slate-600"
              }`}
          >
            <Columns className="w-4 h-4" /> Kanban
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${view === "calendar" ? "bg-accent text-white shadow-accent-sm" : "text-slate-400 hover:text-slate-600"
              }`}
          >
            <CalendarIcon className="w-4 h-4" /> Calendar
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          <div className="flex items-center gap-3">
            <select
              className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl px-6 py-3.5 text-[10px] font-black tracking-widest text-slate-600 focus:outline-none shadow-sm appearance-none min-w-[160px] text-center"
              value={filters.platform}
              onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
            >
              <option value="All">All Platforms</option>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="LinkedIn">LinkedIn</option>
            </select>

            <button
              onClick={() => setIsReportOpen(true)}
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-slate-900 shadow-lg shadow-slate-200/50 text-white font-bold text-xs hover:bg-slate-800 hover:-translate-y-0.5 transition-all active:translate-y-0"
            >
              <BarChart3 className="w-5 h-5 flex-shrink-0" />
              Report
            </button>

            {canEdit && (
              <button
                onClick={addItem}
                className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-accent text-white font-bold text-xs shadow-accent-lg hover:shadow-accent-xl hover:-translate-y-0.5 transition-all active:translate-y-0 whitespace-nowrap"
              >
                <Plus className="w-5 h-5 flex-shrink-0" />
                Tambahkan Konten
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => onUpdate("plan_settings", { allow_edit: !data.plan_settings?.allow_edit })}
                title={`Client Edit: ${data.plan_settings?.allow_edit ? 'Enabled' : 'Disabled'}`}
                className={`flex items-center justify-center w-[52px] h-[52px] rounded-2xl transition-all shadow-sm ${data.plan_settings?.allow_edit ? "bg-emerald-500 text-white shadow-emerald-sm" : "bg-white text-slate-400 border border-white/40"
                  }`}
              >
                <ShieldCheck className={`w-5 h-5 ${data.plan_settings?.allow_edit ? 'animate-pulse' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* View Renderers */}
      <AnimatePresence mode="wait">
        {view === "table" && (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="bg-white rounded-[3rem] border border-white/40 shadow-xl shadow-slate-200/40 overflow-hidden min-h-[600px] flex flex-col w-full"
          >
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-separate border-spacing-0 min-w-[1400px]">
                <thead className="bg-slate-50/50 sticky top-0 z-20">
                  <tr>
                    <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 w-44">Jadwal Upload</th>
                    <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 w-44">Status Content</th>
                    <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 w-44">Content Value</th>
                    <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 w-40 text-center">Platform</th>
                    <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Content Headline</th>
                    <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 w-56 text-center">Script Link</th>
                    <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 w-56 text-center">Hasil Konten Link</th>
                    <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 w-16 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {content.map((item: any) => (
                    <React.Fragment key={item.id}>
                      <tr 
                         className={`group transition-all relative ${
                           item.isDraft ? 'z-30 bg-white scale-[1.01] shadow-2xl border-2 border-accent/50 ring-4 ring-accent/5' : 
                           item.status === "Uploaded" ? 'bg-emerald-50/60 hover:bg-emerald-100/40' : 
                           item.status === "Revisi" ? 'bg-rose-50/60 hover:bg-rose-100/40' : 
                           item.status === "Scheduled" ? 'bg-amber-50/60 hover:bg-amber-100/40' : 
                           expandedId === item.id ? 'bg-slate-50/80 shadow-inner' : 'hover:bg-slate-100/30'
                         }`}
                      >
                        <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col items-center gap-1 min-w-[150px]">
                            <div 
                             className="relative group/date cursor-pointer flex flex-col items-center"
                             onClick={(e) => {
                               const input = e.currentTarget.querySelector('input');
                               if (input && (input as any).showPicker) (input as any).showPicker();
                             }}
                            >
                               <input
                                 type="date"
                                 className="absolute opacity-0 w-0 h-0 pointer-events-none"
                                 value={item.date ? new Date(item.date).toISOString().split('T')[0] : ""}
                                 onChange={(e) => {
                                   if (!e.target.value) return;
                                   const newDate = new Date(e.target.value);
                                   const oldDateStr = item.date || new Date().toISOString();
                                   const oldDate = new Date(oldDateStr);
                                   newDate.setHours(oldDate.getHours(), oldDate.getMinutes());
                                   updateItem(item.id, "date", newDate.toISOString());
                                 }}
                                 disabled={!canEdit}
                               />
                               <div className="text-[12px] font-medium tracking-tight text-slate-900 capitalize flex items-center gap-2">
                                 {!item.date && <Calendar className="w-3 h-3 text-accent animate-pulse" />}
                                 {item.date ? new Date(item.date).toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                 }) : "Pilih Tanggal"}
                              </div>
                              <div className="text-[10px] text-slate-400 font-normal tracking-widest mt-1">
                                 {item.date ? new Date(item.date).getFullYear() : "-"}
                              </div>
                             </div>
                          </div>
                        </td>
                        <td className="px-3 py-4" onClick={(e: any) => e.stopPropagation()}>
                          <select
                            className={`w-full px-3 py-1.5 rounded-lg text-[9px] font-medium tracking-widest focus:outline-none appearance-none cursor-pointer border shadow-sm transition-all ${
                               item.status === "Uploaded" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                               item.status === "Scheduled" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                               item.status === "Revisi" ? "bg-rose-50 text-rose-600 border-rose-100" :
                               item.status === "Pengajuan" ? "bg-amber-50 text-amber-600 border-amber-100" :
                               item.status === "Progress Desain" ? "bg-purple-50 text-purple-600 border-purple-100" :
                               item.status === "Progress Scripting" ? "bg-blue-50 text-blue-600 border-blue-100" :
                               "bg-white text-slate-400 border-slate-100"
                            }`}
                            value={item.status}
                            onChange={(e) => updateItem(item.id, "status", e.target.value)}
                            disabled={!canEdit}
                          >
                             <option value="Planning">Planning</option>
                             <option value="Progress Scripting">Progress Scripting</option>
                             <option value="Progress Desain">Progress Desain</option>
                             <option value="Pengajuan">Pengajuan</option>
                             <option value="Revisi">Revisi</option>
                             <option value="Scheduled">Scheduled</option>
                             <option value="Uploaded">Uploaded</option>
                          </select>
                        </td>
                        <td className="px-5 py-4" onClick={(e: any) => e.stopPropagation()}>
                             <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                 <DebouncedInput
                                    className="flex-1 bg-transparent font-bold text-[10px] text-slate-600 focus:outline-none border-b border-transparent hover:border-slate-100 transition-all tracking-widest"
                                    value={item.value}
                                    placeholder="Value..."
                                    onChange={(val: any) => updateItem(item.id, "value", val)}
                                    disabled={!canEdit}
                                 />
                             </div>
                        </td>
                        <td className="px-5 py-4 text-center" onClick={(e: any) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-white border border-slate-100 shadow-sm">
                              {item.platform === "Instagram" && <Instagram className="w-3.5 h-3.5 text-[#E1306C]" />}
                              {item.platform === "TikTok" && <Zap className="w-3.5 h-3.5 text-black" />}
                              {item.platform === "LinkedIn" && <ExternalLink className="w-3.5 h-3.5 text-blue-600" />}
                            </div>
                            <select
                              className="bg-transparent text-[11px] font-medium text-slate-900 focus:outline-none cursor-pointer tracking-tight"
                              value={item.platform}
                              onChange={(e) => updateItem(item.id, "platform", e.target.value)}
                              disabled={!canEdit}
                            >
                              <option value="Instagram">Instagram</option>
                              <option value="TikTok">TikTok</option>
                              <option value="LinkedIn">LinkedIn</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                           <DebouncedInput 
                             className="w-full bg-transparent font-bold text-sm text-slate-900 focus:outline-none placeholder:text-slate-200"
                             value={item.headline}
                             placeholder="Ketik Headline..."
                             isTextArea
                             onChange={(val: any) => updateItem(item.id, "headline", val)}
                             disabled={!canEdit}
                           />
                        </td>
                        <td className="px-3 py-4" onClick={(e: any) => e.stopPropagation()}>
                            <div className="flex flex-col gap-1.5 group/link">
                              <input 
                                 type="text" 
                                 className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-2 text-[10px] font-medium text-slate-600 focus:outline-none focus:ring-4 ring-accent/5 transition-all"
                                 placeholder="Paste link script..."
                                 value={item.script_link || ""}
                                 onChange={(e) => updateItem(item.id, "script_link", e.target.value)}
                                 disabled={!canEdit}
                              />
                              {item.script_link && (
                                 <a 
                                    href={item.script_link} 
                                    target="_blank" 
                                    className="flex items-center justify-center gap-2 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[9px] font-black tracking-widest hover:bg-blue-100 transition-all border border-blue-100/50"
                                 >
                                    <FileText className="w-2.5 h-2.5" />
                                    Open Script
                                 </a>
                              )}
                            </div>
                        </td>
                        <td className="px-3 py-4" onClick={(e: any) => e.stopPropagation()}>
                            <div className="flex flex-col gap-1.5 group/link">
                              <input 
                                 type="text" 
                                 className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-2 text-[10px] font-medium text-slate-600 focus:outline-none focus:ring-4 ring-accent/5 transition-all"
                                 placeholder="Paste link hasil..."
                                 value={item.result_link || ""}
                                 onChange={(e) => updateItem(item.id, "result_link", e.target.value)}
                                 disabled={!canEdit}
                              />
                              {item.result_link && (
                                 <a 
                                    href={item.result_link} 
                                    target="_blank" 
                                    className="flex items-center justify-center gap-2 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[9px] font-black tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100/50"
                                 >
                                    <PlayCircle className="w-2.5 h-2.5" />
                                    Open Link
                                 </a>
                              )}
                            </div>
                        </td>
                         <td className="px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-2">
                              {isAdmin && item.isDraft && (
                                <button
                                  onClick={() => updateItem(item.id, "isDraft", false)}
                                  className="px-4 py-2 rounded-xl bg-accent text-white font-bold text-[10px] shadow-accent-sm hover:shadow-accent-md hover:scale-105 transition-all"
                                >
                                  Apply
                                </button>
                              )}
                              
                              <button
                                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                className={`p-2.5 rounded-xl transition-all shadow-sm ${expandedId === item.id ? 'bg-accent text-white rotate-180' : 'bg-slate-50 text-slate-400 hover:bg-accent/10 hover:text-accent'}`}
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>

                              {isAdmin && (
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="p-3 rounded-xl text-slate-200 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                      </tr>

                      {/* Dropdown Detail Row */}
                      <AnimatePresence initial={false}>
                        {expandedId === item.id && (
                          <motion.tr
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="bg-slate-50/50 overflow-hidden"
                          >
                            <td colSpan={isAdmin ? 8 : 7} className="px-10 py-8 border-b border-slate-100">
                               <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                                  {/* Left: Detail Info */}
                                  <div className="xl:col-span-4 space-y-6">
                                     <div>
                                        <label className="text-[10px] font-black text-slate-400 tracking-widest mb-3 block">Objective Content</label>
                                        <DebouncedInput 
                                           className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-xs text-slate-600 focus:outline-none min-h-[100px] shadow-sm"
                                           value={item.objective}
                                           placeholder="Tulis tujuan konten..."
                                           isTextArea
                                           onChange={(val: any) => updateItem(item.id, "objective", val)}
                                           disabled={!canEdit}
                                        />
                                     </div>
                                     <div className="grid grid-cols-2 gap-4">
                                        <div>
                                           <label className="text-[10px] font-black text-slate-400 tracking-widest mb-3 block">Pillar</label>
                                           <input 
                                              className="w-full bg-white border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-accent shadow-sm focus:outline-none disabled:opacity-50"
                                              value={item.pillar || ""}
                                              onChange={(e) => updateItem(item.id, "pillar", e.target.value)}
                                              placeholder="Platform pillar..."
                                              disabled={!canEdit}
                                           />
                                        </div>
                                        <div>
                                           <label className="text-[10px] font-black text-slate-400 tracking-widest mb-3 block">Link Live Posting</label>
                                           <div className="relative">
                                              <input 
                                                 className="w-full bg-white border border-slate-100 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-slate-900 shadow-sm focus:outline-none disabled:opacity-50"
                                                 value={item.post_link || ""}
                                                 onChange={(e) => updateItem(item.id, "post_link", e.target.value)}
                                                 placeholder="Paste link..."
                                                 disabled={!canEdit}
                                              />
                                              {item.post_link && (
                                                 <a href={item.post_link} target="_blank" className="absolute right-2 top-1/2 -translate-y-1/2 text-accent">
                                                    <ExternalLink className="w-4 h-4" />
                                                 </a>
                                              )}
                                           </div>
                                        </div>
                                     </div>
                                  </div>

                                  {/* Right: Metrics */}
                                  <div className="xl:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                                     <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                           <div className="w-12 h-12 rounded-2xl bg-accent/5 flex items-center justify-center border border-accent/10">
                                              <BarChart3 className="w-6 h-6 text-accent" />
                                           </div>
                                           <div>
                                              <h4 className="text-sm font-black text-slate-900 tracking-[0.2em]">Metrics Input</h4>
                                              <p className="text-[10px] text-slate-400 font-bold tracking-widest">Platform: {item.platform}</p>
                                           </div>
                                        </div>
                                        <div className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl border border-emerald-100">
                                           <span className="text-[10px] font-black block opacity-50 tracking-widest mb-0.5">Est. Engagement Rate</span>
                                           <span className="text-xl font-black">
                                              {item.metrics?.views ? ((
                                                (Number(item.metrics.likes || 0) + 
                                                 Number(item.metrics.comments || 0) + 
                                                 Number(item.metrics.shares || 0) + 
                                                 Number(item.metrics.saves || 0)) / item.metrics.views * 100
                                              ).toFixed(2)) : "0.00"}%
                                           </span>
                                        </div>
                                     </div>

                                     <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <MetricItem label="Total Views" value={item.metrics?.views} disabled={!canEdit} onChange={(v: any) => updateItem(item.id, "metrics", { ...item.metrics, views: v })} />
                                        <MetricItem label="Likes" value={item.metrics?.likes} disabled={!canEdit} onChange={(v: any) => updateItem(item.id, "metrics", { ...item.metrics, likes: v })} />
                                        <MetricItem label="Comments" value={item.metrics?.comments} disabled={!canEdit} onChange={(v: any) => updateItem(item.id, "metrics", { ...item.metrics, comments: v })} />
                                        <MetricItem label="Shares" value={item.metrics?.shares} disabled={!canEdit} onChange={(v: any) => updateItem(item.id, "metrics", { ...item.metrics, shares: v })} />
                                        <MetricItem label="Saves" value={item.metrics?.saves} disabled={!canEdit} onChange={(v: any) => updateItem(item.id, "metrics", { ...item.metrics, saves: v })} />
                                        
                                        {item.platform === "Instagram" ? (
                                           <>
                                              <MetricItem label="Reach" value={item.metrics?.reach} disabled={!canEdit} onChange={(v: any) => updateItem(item.id, "metrics", { ...item.metrics, reach: v })} />
                                              <MetricItem label="Reposts" value={item.metrics?.reposts} disabled={!canEdit} onChange={(v: any) => updateItem(item.id, "metrics", { ...item.metrics, reposts: v })} />
                                           </>
                                        ) : (
                                           <>
                                              <MetricItem label="Retention (s)" value={item.metrics?.retention} disabled={!canEdit} onChange={(v: any) => updateItem(item.id, "metrics", { ...item.metrics, retention: v })} />
                                           </>
                                        )}
                                     </div>
                                  </div>
                               </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}

                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {view === "kanban" && (
          <motion.div
            key="kanban"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-7 gap-4 w-full"
          >
            {["Planning", "Progress Scripting", "Progress Desain", "Pengajuan", "Revisi", "Scheduled", "Uploaded"].map((status) => {
              const statusColors: any = {
                "Planning": "text-slate-400 bg-slate-50",
                "Progress Scripting": "text-blue-500 bg-blue-50",
                "Progress Desain": "text-purple-500 bg-purple-50",
                "Pengajuan": "text-amber-500 bg-amber-50",
                "Revisi": "text-rose-500 bg-rose-50",
                "Scheduled": "text-indigo-500 bg-indigo-50",
                "Uploaded": "text-emerald-500 bg-emerald-50"
              };
              const colorClass = statusColors[status] || "text-slate-400 bg-slate-50";

              return (
                <div 
                  key={status} 
                  className="space-y-4"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('bg-accent/5', 'ring-2', 'ring-accent/20', 'rounded-3xl');
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('bg-accent/5', 'ring-2', 'ring-accent/20', 'rounded-3xl');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('bg-accent/5', 'ring-2', 'ring-accent/20', 'rounded-3xl');
                    const itemId = e.dataTransfer.getData("itemId");
                    if (itemId) updateItem(itemId, "status", status);
                  }}
                >
                  <div className="flex items-center justify-between px-2">
                    <h6 className={`text-[9px] font-black tracking-[0.1em] uppercase truncate px-2.5 py-1 rounded-lg ${colorClass}`}>{status}</h6>
                    <span className="w-5 h-5 rounded-lg bg-white flex items-center justify-center text-[9px] font-black text-slate-400 border border-slate-100 shadow-sm">
                      {content.filter(i => i.status === status).length}
                    </span>
                  </div>
                  <div className="space-y-2.5 min-h-[700px] p-0.5 transition-all duration-300">
                    {content.filter(i => i.status === status).map((item) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("itemId", item.id);
                          e.currentTarget.style.opacity = "0.5";
                        }}
                        onDragEnd={(e) => {
                          e.currentTarget.style.opacity = "1";
                        }}
                        onClick={() => setSelectedKanbanId(item.id)}
                        className="bg-white p-3 rounded-[1.2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-accent/5 hover:border-accent/30 transition-all group flex flex-col gap-2 relative cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                             {item.platform === "Instagram" ? <Instagram className="w-3 h-3 text-pink-500" /> : <svg className="w-3 h-3 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74(c2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" /></svg>}
                             <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase">{item.platform}</span>
                          </div>
                          {item.date && (
                             <div className="text-[8px] font-bold text-accent bg-accent/5 px-2 py-0.5 rounded-full">
                                {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                             </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <h5 className="text-[10px] font-black text-slate-800 leading-tight group-hover:text-accent transition-colors line-clamp-2">
                             {item.headline || "Tanpa Judul"}
                          </h5>
                          <p className="text-[9px] text-slate-400 font-medium line-clamp-1 mb-1">
                             {item.value || "No Value"}
                          </p>
                          
                          {item.post_link ? (
                             <a 
                                href={item.post_link} 
                                target="_blank" 
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-accent text-white hover:bg-accent-hover transition-all shadow-accent-sm"
                             >
                                <ExternalLink className="w-3 h-3" />
                                <span className="text-[8px] font-bold uppercase tracking-widest">Post Link</span>
                             </a>
                          ) : (
                             <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-200 cursor-not-allowed">
                                <ExternalLink className="w-3 h-3" />
                                <span className="text-[8px] font-bold uppercase tracking-widest">No Link</span>
                             </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {view === "calendar" && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="bg-white rounded-[3.5rem] border border-white/40 shadow-xl p-10"
          >
            <div className="grid grid-cols-7 gap-3">
              {["MINGGU", "SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"].map(d => (
                <div key={d} className="py-4 text-center text-[10px] font-black text-slate-300 tracking-[0.2em]">{d}</div>
              ))}
              {Array.from({ length: 35 }, (_, i) => {
                const monthStartOffset = 0; // Simplified
                const dayNum = i + 1 - monthStartOffset;
                const itemsOnDay = content.filter(c => new Date(c.date).getDate() === dayNum);
                const isToday = dayNum === new Date().getDate();

                return (
                  <div key={i} className={`min-h-[140px] p-4 rounded-3xl border transition-all ${dayNum > 0 && dayNum <= 31 ? (isToday ? 'bg-white border-accent/20 shadow-xl shadow-accent/5' : 'bg-slate-50/30 border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50') : 'bg-transparent border-transparent opacity-20'
                    }`}>
                    {dayNum > 0 && dayNum <= 31 && (
                      <div className="h-full flex flex-col">
                        <div className={`text-sm font-sans font-extrabold mb-3 ml-1 flex items-center justify-center w-7 h-7 rounded-full transition-all ${isToday ? 'bg-accent text-white not-italic font-bold shadow-accent-sm scale-110' : 'text-slate-300'}`}>
                          {dayNum}
                        </div>
                        <div className="space-y-2 flex-1 scrollbar-hide overflow-y-auto">
                          {itemsOnDay.map(c => (
                            <div key={c.id} className={`p-2 rounded-xl text-[9px] font-bold leading-tight border transition-all ${c.status === 'Uploaded' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-100/50' :
                                c.status === 'Scheduled' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                  c.status === 'Revisi' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                    'bg-accent/5 text-accent border border-accent/10'
                              }`}>
                              <div className="text-[7px] mb-1 opacity-60 tracking-tighter truncate font-black">{c.platform}</div>
                              <div className="line-clamp-2">{c.headline}</div>
                            </div>
                          ))}
                          {canEdit && itemsOnDay.length === 0 && (
                            <button className="w-full h-8 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-accent/40 hover:text-accent transition-all">
                              <Plus className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedKanbanId && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedKanbanId(null)}
              className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-[100]"
            />
            {/* Side Panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-full max-w-[450px] bg-white shadow-2xl z-[101] flex flex-col overflow-hidden"
            >
              {(() => {
                const item = content.find(i => i.id === selectedKanbanId);
                if (!item) return null;
                return (
                  <>
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                       <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center`}>
                             <FileText className="w-4 h-4" />
                          </div>
                          <h3 className="font-black text-slate-800 tracking-tight">Detail Konten</h3>
                       </div>
                       <button 
                         onClick={() => setSelectedKanbanId(null)}
                         className="w-10 h-10 rounded-full hover:bg-white hover:shadow-sm flex items-center justify-center text-slate-400 transition-all"
                       >
                         <X className="w-5 h-5" />
                       </button>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-10 space-y-10">
                       {/* Headline */}
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-300 tracking-[0.2em] uppercase">Headline Konten</label>
                          <DebouncedInput 
                            isTextArea
                            className="w-full bg-slate-50/50 border border-slate-100 rounded-3xl p-5 text-lg font-black text-slate-800 placeholder:text-slate-200 focus:bg-white focus:ring-4 ring-accent/5 transition-all outline-none disabled:opacity-50"
                            value={item.headline}
                            onChange={(val: string) => updateItem(item.id, "headline", val)}
                            placeholder="Tulis judul yang menarik..."
                            disabled={!canEdit}
                          />
                       </div>

                       {/* Status & Platform & Date Row */}
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-300 tracking-[0.2em] uppercase">Status</label>
                             <select
                               className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold text-slate-700 outline-none disabled:opacity-50"
                               value={item.status}
                               onChange={(e) => updateItem(item.id, "status", e.target.value)}
                               disabled={!canEdit}
                             >
                                {["Planning", "Progress Scripting", "Progress Desain", "Pengajuan", "Revisi", "Scheduled", "Uploaded"].map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                             </select>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-300 tracking-[0.2em] uppercase">Platform</label>
                             <select
                               className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold text-slate-700 outline-none disabled:opacity-50"
                               value={item.platform}
                               onChange={(e) => updateItem(item.id, "platform", e.target.value)}
                               disabled={!canEdit}
                             >
                                <option value="Instagram">Instagram</option>
                                <option value="TikTok">TikTok</option>
                                <option value="LinkedIn">LinkedIn</option>
                             </select>
                          </div>
                          <div className="col-span-2 space-y-3">
                             <label className="text-[10px] font-black text-slate-300 tracking-[0.2em] uppercase">Jadwal Upload</label>
                             <div className="relative group/date">
                                <input 
                                  type="date"
                                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold text-slate-700 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                  value={item.date}
                                  onChange={(e) => updateItem(item.id, "date", e.target.value)}
                                  disabled={!canEdit}
                                />
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-hover/date:text-accent pointer-events-none transition-colors">
                                   <CalendarIcon className="w-4 h-4" />
                                </div>
                             </div>
                          </div>
                       </div>

                       {/* Content Value & Pillar */}
                       <div className="space-y-6">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-300 tracking-[0.2em] uppercase">Objective / Tujuan</label>
                             <DebouncedInput 
                               isTextArea
                               className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-5 text-xs text-slate-600 outline-none focus:bg-white transition-all min-h-[100px]"
                               value={item.objective}
                               onChange={(val: string) => updateItem(item.id, "objective", val)}
                               placeholder="Apa tujuan dari konten ini?"
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-300 tracking-[0.2em] uppercase">Content Value / Pillar</label>
                             <input 
                               type="text"
                               className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold text-slate-700 outline-none focus:bg-white transition-all disabled:opacity-50"
                               value={item.value}
                               onChange={(e) => updateItem(item.id, "value", e.target.value)}
                               placeholder="Nilai yang ingin disampaikan..."
                               disabled={!canEdit}
                             />
                          </div>
                       </div>

                       {/* Links Section */}
                       <div className="bg-slate-50/50 rounded-[2rem] p-6 space-y-6 border border-slate-100">
                          <label className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase flex items-center gap-2">
                             <Sparkles className="w-3.5 h-3.5 text-accent" /> Link & Dokumentasi
                          </label>
                          <div className="space-y-4">
                             <div className="space-y-2">
                                <label className="text-[8px] font-black text-slate-300 tracking-widest ml-1">LINK POSTINGAN LIVE</label>
                                <input 
                                  type="text"
                                  className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-accent shadow-sm focus:ring-4 ring-accent/5 outline-none transition-all disabled:opacity-50"
                                  value={item.post_link}
                                  onChange={(e) => updateItem(item.id, "post_link", e.target.value)}
                                  placeholder="https://..."
                                  disabled={!canEdit}
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[8px] font-black text-slate-300 tracking-widest ml-1">LINK RESULT/HASIL</label>
                                <input 
                                  type="text"
                                  className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 shadow-sm focus:ring-4 ring-slate-100 outline-none transition-all disabled:opacity-50"
                                  value={item.result_link}
                                  onChange={(e) => updateItem(item.id, "result_link", e.target.value)}
                                  placeholder="https://..."
                                  disabled={!canEdit}
                                />
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-8 py-6 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
                       <button
                         onClick={() => {
                            removeItem(item.id);
                            setSelectedKanbanId(null);
                         }}
                         className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all font-bold text-xs"
                       >
                          <Trash2 className="w-4 h-4" /> Hapus Konten
                       </button>
                       <button
                         onClick={() => setSelectedKanbanId(null)}
                         className="px-8 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-lg shadow-slate-200 active:scale-95 transition-all"
                       >
                          Simpan & Selesai
                       </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isReportOpen && (
          <MonthlyReportModal 
            data={data} 
            onClose={() => setIsReportOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// --- Mentoring Timeline Components ---

// --- Mentoring Timeline Components ---

const MentoringTimelineHub = ({ data, isAdmin, onUpdate }: any) => {
  // Local drafts for Admin to "Apply" before syncing
  const [draftItems, setDraftItems] = useState(data.timeline_items || []);
  const [draftRoadmap, setDraftRoadmap] = useState(data.roadmap || []);
  const [draftNote, setDraftNote] = useState(data.mentors_note || "");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [viewDate, setViewDate] = useState(new Date());

  // Sync internal state if data changes from external (e.g. initial load)
  useEffect(() => {
    if (!isAdmin) {
      setDraftItems(data.timeline_items || []);
      setDraftRoadmap(data.roadmap || []);
      setDraftNote(data.mentors_note || "");
    }
  }, [data.timeline_items, data.roadmap, data.mentors_note, isAdmin]);
  
  const liveStatus = data.liveStatus || "online"; // Use passed down status
  
  const updateDraftItem = (id: number, field: string, value: any) => {
    setDraftItems((prev: any) => prev.map((i: any) => i.id === id ? { ...i, [field]: value } : i));
  };

  const addDraftItem = () => {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    const newItem = {
      id: Date.now(),
      activity: "Aktivitas Baru",
      detail: "Detail aktivitas...",
      start_date: today,
      end_date: nextWeekStr,
      color: "bg-accent/40 text-accent"
    };
    setDraftItems([...draftItems, newItem]);
  };

  const removeDraftItem = (id: number) => {
    setDraftItems(draftItems.filter((i: any) => i.id !== id));
  };

  const updateDraftRoadmap = (id: number, field: string, value: any) => {
    setDraftRoadmap((prev: any) => prev.map((r: any) => r.id === id ? { ...r, [field]: value } : r));
  };

  const colorPresets = [
    { name: "Blue", class: "bg-accent/40 text-accent" },
    { name: "Emerald", class: "bg-emerald-500/40 text-emerald-700" },
    { name: "Rose", class: "bg-rose-500/40 text-rose-700" },
    { name: "Amber", class: "bg-amber-500/40 text-amber-700" },
    { name: "Purple", class: "bg-purple-500/40 text-purple-700" },
    { name: "Slate", class: "bg-slate-900/40 text-slate-900" }
  ];

  const handlePublish = async () => {
    setIsSyncing(true);
    try {
      // Perform all updates
      await Promise.all([
        onUpdate("timeline_items", draftItems),
        onUpdate("roadmap", draftRoadmap),
        onUpdate("mentors_note", draftNote)
      ]);
      setLastSynced(new Date());
      // Small delay for UI satisfaction
      setTimeout(() => setIsSyncing(false), 800);
    } catch (err) {
      setIsSyncing(false);
      alert("Gagal sinkronisasi data.");
    }
  };

  // Determine items to display (Draft for Admin, Real for Client)
  const displayItems = isAdmin ? draftItems : (data.timeline_items || []);
  const displayRoadmap = isAdmin ? draftRoadmap : (data.roadmap || []);
  const displayNote = isAdmin ? draftNote : (data.mentors_note || "");

  return (
    <div className="space-y-10 pb-40">
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
             <h2 className="text-4xl font-sans font-extrabold text-slate-900 leading-tight">Mentoring <span className="italic text-accent">Timeline</span> {isAdmin && <span className="text-xs font-black bg-accent text-white px-2 py-0.5 rounded-md ml-2 uppercase tracking-widest">Admin Mode</span>}</h2>
             <div className="flex items-center gap-3 mt-2">
                {isAdmin && lastSynced && (
                   <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 animate-in fade-in slide-in-from-left-2 transition-all">
                      Last Live: {lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                )}
             </div>
          </div>
          <div className="flex gap-4">
             {isAdmin && (
                <button 
                  onClick={handlePublish}
                  disabled={isSyncing}
                  className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all flex items-center gap-2 ${isSyncing ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'}`}
                >
                   {isSyncing ? <Zap className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-accent" />}
                   {isSyncing ? "Syncing..." : "Sync to Client Page"}
                </button>
             )}
             <div className="px-6 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Phase:</span>
                   {isAdmin ? (
                      <select 
                        value={data.currentPhase}
                        onChange={(e) => onUpdate("current_phase", Number(e.target.value))}
                        className="text-[10px] font-black text-accent bg-transparent outline-none cursor-pointer"
                      >
                         {[1, 2, 3, 4, 5].map(p => <option key={p} value={p}>Phase {p}</option>)}
                      </select>
                   ) : (
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{data.currentPhase}</span>
                   )}
                </div>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* LEFT: Calendar & Activity Detail (5/12) */}
          <div className="xl:col-span-5 space-y-8">
             <Card className="p-8 rounded-[3.5rem] border-none bg-white shadow-sm overflow-hidden relative text-center">
                <div className="flex items-center justify-between mb-8 px-4">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-accent" /> Timeline Map
                   </h3>
                   <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                      <div className="flex items-center gap-2 mr-2">
                        <button 
                          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                          className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-accent hover:bg-accent/10 transition-all active:scale-95"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="min-w-[100px] text-center capitalize">{viewDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                        <button 
                          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                          className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-accent hover:bg-accent/10 transition-all active:scale-95"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                      {isAdmin && (
                         <button 
                           onClick={addDraftItem}
                           className="bg-accent text-white px-3 py-1 rounded-full flex items-center gap-1 hover:scale-105 transition-all shadow-accent-sm active:scale-95 whitespace-nowrap"
                         >
                            <Plus className="w-3 h-3" /> Add Timeline
                         </button>
                      )}
                   </div>
                </div>
                
                <div className="grid grid-cols-7 gap-1 mb-8 overflow-hidden rounded-3xl border border-slate-50">
                   {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => (
                      <span key={`${d}-${idx}`} className="text-[10px] font-black text-slate-200 py-3">{d}</span>
                   ))}
                   {/* Empty slots for start day */}
                   {Array.from({ length: new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay() }).map((_, i) => (
                      <div key={`empty-${i}`} className="min-h-[52px] border-[0.5px] border-slate-50 opacity-10" />
                   ))}
                   {/* Days of the month */}
                   {Array.from({ length: new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate() }, (_, i) => {
                      const day = i + 1;
                      const dateObj = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                      
                      // Calculate program day (Day X of program)
                      let programDay = day; // default fallback
                      if (data.start_date) {
                        const start = new Date(data.start_date);
                        start.setHours(0, 0, 0, 0);
                        const curr = new Date(dateObj);
                        curr.setHours(0, 0, 0, 0);
                        const diffTime = curr.getTime() - start.getTime();
                        programDay = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
                      }

                      const activeItems = displayItems.filter((item: any) => {
                        if (!item.start_date || !item.end_date) return false;
                        const s = new Date(item.start_date);
                        s.setHours(0, 0, 0, 0);
                        const e = new Date(item.end_date);
                        e.setHours(0, 0, 0, 0);
                        return dateObj >= s && dateObj <= e;
                      });
                      const isToday = day === new Date().getDate() && viewDate.getMonth() === new Date().getMonth() && viewDate.getFullYear() === new Date().getFullYear();
                      
                      return (
                         <div key={i} className="relative flex flex-col items-center justify-center min-h-[52px] border-[0.5px] border-slate-50 transition-all group overflow-hidden">
                            {/* Full background block for active activities */}
                            <div className="absolute inset-0 flex flex-col gap-[1px]">
                               {activeItems.map((item: any, idx: number) => (
                                  <div 
                                    key={idx} 
                                    className={`flex-1 w-full ${item.color.split(' ')[0]} ${item.start_date && new Date(item.start_date).toDateString() === dateObj.toDateString() ? 'rounded-l-lg ml-0.5' : ''} ${item.end_date && new Date(item.end_date).toDateString() === dateObj.toDateString() ? 'rounded-r-lg mr-0.5' : ''} transition-all duration-300 opacity-80`} 
                                  />
                               ))}
                            </div>
                            
                            <span className={`text-[11px] font-black relative z-10 transition-colors ${activeItems.length > 0 ? 'text-slate-900 group-hover:scale-125 font-black' : isToday ? 'text-white' : 'text-slate-300'}`}>
                               {day}
                            </span>
                            {isToday && !activeItems.length && <div className="absolute inset-0 m-auto w-8 h-8 rounded-xl bg-accent shadow-accent-sm -z-0" />}
                            {isToday && activeItems.length > 0 && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white shadow-sm z-20" />}
                            
                            {/* Progam Day Indicator (small hint) */}
                            {programDay > 0 && (
                              <div className="absolute bottom-1 right-1 text-[6px] font-black opacity-10 group-hover:opacity-100 transition-opacity">
                                D{programDay}
                              </div>
                            )}
                         </div>
                      );
                   })}
                </div>

                <div className="space-y-6 pt-4 text-left">
                   <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] px-4">Active Activity Details</h3>
                   <div className="space-y-4 max-h-[500px] overflow-y-auto px-4 custom-scrollbar pb-4">
                      {displayItems.length === 0 && (
                         <div className="p-10 text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto">
                               <CalendarIcon className="w-6 h-6 text-slate-200" />
                            </div>
                            <p className="text-xs font-bold text-slate-400">Belum ada aktivitas di timeline.</p>
                         </div>
                      )}
                      
                      {displayItems.map((item: any) => (
                         <div key={item.id} className="p-6 rounded-[2rem] border border-slate-100 relative group/card transition-all hover:shadow-xl hover:shadow-slate-100/50 bg-white overflow-hidden">
                            {/* Color indicator bar */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${item.color.split(' ')[0]}`} />
                            
                            <div className="flex items-start justify-between mb-4">
                               <div className="space-y-1 flex-1">
                                  {isAdmin ? (
                                     <input 
                                       className="bg-transparent font-black text-sm text-slate-900 focus:outline-none w-full border-b border-black/5"
                                       value={item.activity}
                                       onChange={(e) => updateDraftItem(item.id, "activity", e.target.value)}
                                       placeholder="Nama Aktivitas..."
                                     />
                                  ) : (
                                     <h4 className="text-sm font-black text-slate-900">{item.activity}</h4>
                                  )}
                                   <div className="flex items-center gap-2">
                                      <Clock className="w-3 h-3 opacity-30" />
                                      <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest">
                                        {item.start_date ? new Date(item.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : "???"} - {item.end_date ? new Date(item.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : "???"}
                                      </span>
                                   </div>
                               </div>
                               {isAdmin && (
                                  <button onClick={() => removeDraftItem(item.id)} className="p-2.5 rounded-xl bg-white/50 text-rose-500 shadow-sm opacity-0 group-hover/card:opacity-100 transition-all hover:bg-rose-500 hover:text-white">
                                     <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                               )}
                            </div>

                            {isAdmin ? (
                               <div className="space-y-4 mt-6">
                                  <div className="grid grid-cols-2 gap-4">
                                     <div>
                                         <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Start Date</label>
                                         <input type="date" className="w-full bg-white/50 rounded-xl px-4 py-2 text-[10px] font-bold focus:bg-white transition-all shadow-inner outline-none" value={item.start_date || ""} onChange={(e) => updateDraftItem(item.id, "start_date", e.target.value)} />
                                      </div>
                                      <div>
                                         <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">End Date</label>
                                         <input type="date" className="w-full bg-white/50 rounded-xl px-4 py-2 text-[10px] font-bold focus:bg-white transition-all shadow-inner outline-none" value={item.end_date || ""} onChange={(e) => updateDraftItem(item.id, "end_date", e.target.value)} />
                                      </div>
                                   </div>
                                  
                                  <div>
                                     <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Theme Color</label>
                                     <div className="flex gap-2 p-2 bg-white/30 rounded-2xl">
                                        {colorPresets.map(c => (
                                           <button 
                                             key={c.name} 
                                             onClick={() => updateDraftItem(item.id, "color", c.class)}
                                             className={`w-6 h-6 rounded-lg ${c.class.split(' ')[0]} ${item.color === c.class ? 'ring-2 ring-black ring-offset-2' : ''} transition-all`}
                                           />
                                        ))}
                                     </div>
                                  </div>

                                  <textarea 
                                    className="w-full bg-white/50 rounded-2xl p-4 text-[11px] text-slate-600 focus:bg-white outline-none min-h-[80px] shadow-inner font-medium leading-relaxed"
                                    value={item.detail}
                                    onChange={(e) => updateDraftItem(item.id, "detail", e.target.value)}
                                    placeholder="Apa yang dilakukan di sesi ini?..."
                                  />
                               </div>
                            ) : (
                               <p className="text-[11px] text-slate-600 font-medium leading-relaxed pt-2 opacity-80">
                                  "{item.detail}"
                               </p>
                            )}
                         </div>
                      ))}
                   </div>
                </div>
                {isAdmin && <div className="absolute top-2 right-2 text-[8px] font-black text-accent/20 uppercase tracking-widest rotate-12">Draft Mode Active</div>}
             </Card>
          </div>

          {/* CENTER: Learning Path (4/12) */}
          <div className="xl:col-span-4">
             <Card className="p-10 rounded-[3.5rem] border-none bg-white shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-3xl rounded-full -mr-32 -mt-32" />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-10 flex items-center gap-2 relative z-10">
                   <Route className="w-4 h-4 text-accent" /> Learning Path
                </h3>

                <div className="relative pl-10 space-y-12 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-50 relative z-10 text-left">
                   {displayRoadmap.map((phase: any, index: number) => {
                      const isActive = data.currentPhase === index + 1;
                      const isCompleted = data.currentPhase > index + 1;
                      return (
                         <div key={phase.id} className="relative">
                            <div className={`absolute -left-10 top-0 w-6 h-6 rounded-lg transition-all border-4 ${isCompleted ? 'bg-emerald-500 border-white shadow-emerald-sm' : isActive ? 'bg-accent border-white shadow-accent-sm scale-125' : 'bg-white border-slate-100'}`}>
                               {isCompleted && <Check className="w-3 h-3 text-white m-auto" />}
                            </div>
                            <div className="space-y-1">
                               <div className="flex items-center gap-3 mb-1">
                                  {isAdmin ? (
                                     <input 
                                       className={`text-sm font-black bg-transparent border-b border-transparent focus:border-accent outline-none w-full ${isActive ? 'text-accent font-black' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}
                                       value={phase.title}
                                       onChange={(e) => updateDraftRoadmap(phase.id, "title", e.target.value)}
                                     />
                                  ) : (
                                     <h4 className={`text-sm font-black transition-colors ${isActive ? 'text-accent' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        Fase 0{index + 1}: {phase.title}
                                     </h4>
                                  )}
                                  {isCompleted && !isAdmin && <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 uppercase tracking-widest">Done</span>}
                               </div>
                               
                               {isAdmin ? (
                                  <textarea 
                                    className="text-[11px] text-slate-400 font-medium leading-relaxed w-full bg-slate-50 rounded-xl p-3 focus:outline-none min-h-[60px]"
                                    value={phase.description}
                                    onChange={(e) => updateDraftRoadmap(phase.id, "description", e.target.value)}
                                  />
                               ) : (
                                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-[90%]">{phase.description}</p>
                               )}
                               
                               {isActive && (
                                  <div className="mt-4 grid grid-cols-1 gap-2">
                                     {data.tasks.slice(0, 3).map((task: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
                                           <div className={`w-3 h-3 rounded-md transition-colors ${task.status === 'Done' ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                                              <span className="text-[10px] font-bold text-slate-600">{task.label || task.text}</span>
                                        </div>
                                     ))}
                                  </div>
                               )}
                            </div>
                         </div>
                      );
                   })}
                </div>
             </Card>
          </div>

          {/* RIGHT: Mentor Interaction (3/12) */}
          <div className="xl:col-span-3 space-y-8">
             <Card className="p-8 rounded-[3rem] border border-slate-100 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden relative group flex flex-col">
                {/* Subtle background glow effect */}
                <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-1000 ${liveStatus === 'busy' ? 'bg-rose-400' : liveStatus === 'away' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                
                {/* 1. MENTOR IDENTITY & LIVE PRESENCE */}
                <div className="relative z-10 flex flex-col items-center">
                   
                   {/* Avatar with Status Ring */}
                   <div className="relative mb-6">
                      <div className={`w-28 h-28 rounded-[2.5rem] bg-white p-1.5 shadow-xl relative z-20 transition-all duration-500 ring-4 ${liveStatus === 'busy' ? 'ring-rose-50 shadow-rose-500/10' : liveStatus === 'away' ? 'ring-amber-50 shadow-amber-500/10' : 'ring-emerald-50 shadow-emerald-500/10'}`}>
                         <div className="w-full h-full rounded-[2.1rem] overflow-hidden bg-slate-100">
                            {data.mentor_persona?.photo ? (
                               <img src={data.mentor_persona.photo} className="w-full h-full object-cover" />
                            ) : (
                               <div className="w-full h-full flex items-center justify-center text-2xl font-sans font-extrabold text-slate-300">MH</div>
                            )}
                         </div>
                      </div>
                      
                      {/* Priority Status Badge (Overlapping Avatar) */}
                      <div className={`absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full border-[3px] border-white shadow-xl flex items-center gap-2 ${liveStatus === 'busy' ? 'bg-slate-900 border-rose-500/10' : liveStatus === 'away' ? 'bg-slate-900 border-amber-500/10' : 'bg-slate-900 border-emerald-500/10'}`}>
                         <div className={`w-2.5 h-2.5 rounded-full ${liveStatus === 'busy' ? 'bg-rose-500 animate-pulse shadow-rose-sm' : liveStatus === 'away' ? 'bg-amber-500 shadow-amber-sm' : 'bg-emerald-500 shadow-emerald-sm'}`} />
                         <span className="text-[9px] font-black text-white uppercase tracking-widest mt-0.5">
                            {liveStatus === 'busy' ? 'In a Meeting' : liveStatus === 'away' ? 'Away' : 'Available'}
                         </span>
                      </div>
                   </div>

                   {/* Name & Role */}
                   <div className="mt-4 mb-6 text-center relative z-20">
                      <h4 className="text-lg font-black text-slate-900 tracking-tight">{data.mentor_persona?.name || "Mentor Mentoreshp"}</h4>
                      <p className="text-[9px] font-black text-[#4880FF] uppercase tracking-widest mt-1.5">{data.mentor_persona?.title || "Active Mentor"}</p>
                   </div>

                   {/* Speech Bubble for Dynamic Status Note */}
                   <div className="relative w-full flex flex-col items-center z-10">
                      {/* Pointer tip pointing towards name */}
                      <div className="w-4 h-4 bg-slate-50 rotate-45 absolute -top-2 rounded-sm border-t border-l border-slate-200/60" />
                      <div className="bg-slate-50 border border-slate-200/60 rounded-[2rem] p-5 w-full shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col items-center text-center relative mt-0">
                         {data.mentor_persona?.status_message ? (
                           <span className="text-[12px] font-bold text-slate-700 leading-relaxed italic">"{data.mentor_persona.status_message}"</span>
                         ) : (
                           <span className="text-[11px] font-medium text-slate-400 italic">No custom status update.</span>
                         )}
                      </div>
                   </div>
                </div>

                {/* DIVIDER */}
                <div className="w-full h-px bg-slate-100 my-8 relative">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                      Mentor's Note
                   </div>
                </div>

                {/* 2. MENTOR'S NOTE AREA */}
                <div className="flex flex-col flex-1">
                   {isAdmin ? (
                      <textarea 
                        className="flex-1 min-h-[140px] text-slate-600 text-[13px] leading-relaxed font-sans font-bold p-6 rounded-[2rem] bg-slate-50 border border-slate-200 outline-none focus:ring-2 ring-accent/20 transition-all placeholder:font-medium placeholder:text-slate-400 resize-none no-scrollbar"
                        value={data.mentors_note || ""}
                        onChange={(e) => onUpdate("mentors_note", e.target.value)}
                        placeholder="Write an encouraging note or feedback for your mentee..."
                      />
                   ) : (
                      <div className="flex-1 min-h-[140px] text-slate-600 text-[13px] leading-relaxed font-sans font-bold p-6 rounded-[2rem] bg-slate-50 border border-slate-200 italic flex items-center justify-center text-center">
                         {data.mentors_note ? `"${data.mentors_note}"` : "Mentor hasn't left a note yet."}
                      </div>
                   )}

                   <button 
                     onClick={() => !isAdmin && window.dispatchEvent(new Event('openBookingModal'))}
                     className={`mt-6 w-full h-[56px] rounded-[1.5rem] font-black text-[13px] uppercase tracking-wider shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${isAdmin ? 'bg-[#4880FF] text-white hover:bg-blue-600 shadow-blue-500/20' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20'}`}
                   >
                      {isAdmin ? "Apply Changes" : "Book Consultation"}
                   </button>
                </div>
             </Card>
          </div>
       </div>
    </div>
  );
};

// --- Helper Components ---

const DebouncedInput = ({ value, onChange, placeholder, className, isTextArea, disabled }: any) => {
  const [localValue, setLocalValue] = useState(value || "");

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 800); // Wait 800ms after user stops typing
    return () => clearTimeout(timer);
  }, [localValue]);

  if (isTextArea) {
    return (
      <textarea
        className={`${className} resize-none overflow-hidden h-auto min-h-[1em]`}
        value={localValue}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          setLocalValue(e.target.value);
          e.target.style.height = 'auto';
          e.target.style.height = e.target.scrollHeight + 'px';
        }}
        rows={1}
      />
    );
  }

  return (
    <input
      type="text"
      className={className}
      value={localValue}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => setLocalValue(e.target.value)}
    />
  );
};



const StatCard = ({ label, value, percent, icon: Icon, platform }: any) => {
  const isIG = platform?.toLowerCase() === 'instagram';
  const accentColor = isIG ? "text-[#E1306C]" : "text-slate-900";
  const bgColor = isIG ? "bg-[#E1306C]/5" : "bg-slate-900/5";

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="p-8 pb-10 rounded-[2.5rem] bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl shadow-slate-200/30 relative overflow-hidden group transition-all duration-500"
    >
      <div className={`absolute -top-10 -right-10 w-32 h-32 blur-[60px] rounded-full -z-10 transition-colors duration-700 ${isIG ? 'bg-[#E1306C]/10' : 'bg-slate-400/10'}`} />

      <div className="flex items-center justify-between mb-8">
        <div className={`w-12 h-12 rounded-2xl ${bgColor} flex items-center justify-center ${accentColor} transition-transform duration-500 group-hover:scale-110 shadow-sm`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        {!!percent && percent !== 0 && (
          <div className={`text-[10px] font-bold px-3 py-1 rounded-full border ${percent > 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
            {percent > 0 ? '+' : ''}{percent}%
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 font-sans">{label}</p>
        <h4 className={`text-4xl font-bold font-sans font-extrabold ${accentColor}`}>{value}</h4>
      </div>

      {!!percent && (
        <div className="mt-8 h-1.5 w-full bg-slate-100/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(Math.abs(percent), 100)}%` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            className={`h-full rounded-full ${isIG ? 'bg-[#E1306C]' : 'bg-slate-900'}`}
          />
        </div>
      )}
    </motion.div>
  );
};


const ReportNote = ({ label, text, status }: any) => (
  <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-muted/30 transition-all border border-transparent hover:border-border">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${status === "Done" ? "bg-emerald-500" : status === "Active" ? "bg-accent" : "bg-amber-500"
      }`}>
      {status === "Done" ? <CheckSquare className="w-5 h-5" /> : status === "Active" ? <Zap className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
    </div>
    <div>
      <h5 className="font-bold text-sm mb-1">{label}</h5>
      <p className="text-xs text-muted-foreground/80 leading-relaxed font-sans">{text}</p>
    </div>
  </div>
);

const PhaseStep = ({ phase, title, status, description, color }: any) => (
  <div className="flex flex-col items-center text-center space-y-4">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-4 border-white shadow-md transition-all duration-500 ${status === "completed" ? "bg-blue-500 text-white" :
        status === "active" ? "bg-emerald-500 text-white scale-110 ring-8 ring-emerald-500/10" : "bg-slate-100 text-slate-400"
      }`}>
      {status === "completed" ? <CheckSquare className="w-6 h-6" /> : <span className="text-lg font-sans font-extrabold">{phase}</span>}
    </div>
    <div className="space-y-1">
      <h5 className={`font-bold text-sm tracking-wide ${status === "upcoming" ? "text-slate-400" : "text-slate-900"}`}>{title}</h5>
      <p className="text-[10px] text-muted-foreground leading-tight px-4 max-w-[200px] font-medium">{description}</p>
    </div>
  </div>
);

const JourneyItem = ({ label, status }: any) => (
  <div className="flex items-center gap-4 group cursor-default">
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${status === "Done" ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
        status === "Active" ? "bg-white border-accent text-accent shadow-sm animate-pulse" : "bg-slate-50 border-border text-slate-300"
      }`}>
      {status === "Done" ? <CheckSquare className="w-4 h-4" /> : status === "Active" ? <Play className="w-3 h-3 translate-x-0.5" /> : <ShieldCheck className="w-4 h-4" />}
    </div>
    <span className={`text-[11px] font-bold tracking-wider transition-colors ${status === "Locked" ? "text-slate-300" : "text-slate-700 group-hover:text-slate-900"
      }`}>{label}</span>
  </div>
);

const ContentQueueItem = ({ title, type, date, status }: any) => (
  <Card className="p-6 bg-white border border-border shadow-sm hover:shadow-md transition-all group rounded-[2rem]">
    <div className="flex items-center justify-between mb-4">
      <span className={`text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-full ${status === "Ready" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
          status === "Scheduled" ? "bg-accent/5 text-accent border border-accent/10" : "bg-amber-50 text-amber-600 border border-amber-100"
        }`}>
        {status}
      </span>
      <div className="text-muted-foreground group-hover:text-accent transition-colors">
        {type === "Reels" ? <VideoIcon className="w-4 h-4" /> : type === "Carousel" ? <Layers className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
      </div>
    </div>
    <h5 className="font-bold text-sm mb-3 line-clamp-1">{title}</h5>
    <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-2">
      <Clock className="w-3 h-3" /> {date}
    </p>
  </Card>
);
const ActionItem = ({ text, done, category }: any) => (
  <div className="flex items-center gap-4 group cursor-pointer p-1">
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 shadow-sm ${done ? "bg-emerald-50 text-emerald-500" : "bg-white border border-slate-100 text-slate-300 group-hover:border-accent group-hover:text-accent"}`}>
       {done ? <CheckCircle2 size={16} /> : (
         category === 'mentoring' ? <GraduationCap size={16} /> :
         category === 'handling' ? <Video size={16} /> :
         <Zap size={16} />
       )}
    </div>
    <span className={`text-[11px] font-bold tracking-tight transition-all duration-500 ${done ? "text-slate-300 line-through" : "text-slate-600 group-hover:text-slate-900"}`}>{text}</span>
  </div>
);

const MetricItem = ({ label, value, onChange, disabled = false }: any) => {
  const [localValue, setLocalValue] = useState(value || 0);
  const [isFocused, setIsFocused] = useState(false);

  // Only sync external changes if NOT focused
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value || 0);
    }
  }, [value, isFocused]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value && !isFocused) {
        onChange(Number(localValue));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localValue, value, isFocused]);

  const handleBlur = () => {
    setIsFocused(false);
    if (localValue !== value) {
      onChange(Number(localValue));
    }
  };


  return (
    <div className="flex flex-col gap-1.5 group/metric">
      <label className="text-[10px] font-black text-slate-300 tracking-widest mb-1 group-hover/metric:text-accent transition-colors">{label}</label>
      <input 
        type="number"
        className={`w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-xs font-black text-slate-700 focus:outline-none focus:ring-4 ring-accent/5 focus:bg-white transition-all text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        value={localValue}
        onFocus={() => !disabled && setIsFocused(true)}
        disabled={disabled}
        onBlur={handleBlur}
        onChange={(e) => setLocalValue(e.target.value)}
      />

    </div>
  );
};
const MonthlyReportModal = ({ data, onClose }: any) => {
  const [reportFilter, setReportFilter] = useState({
    platform: "All",
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);


  const content = (data.content_plan || []).filter((item: any) => {
    if (!item.date) return false;
    
    const itemDate = new Date(item.date);
    const start = new Date(reportFilter.startDate);
    const end = new Date(reportFilter.endDate);
    
    const matchesPlatform = reportFilter.platform === "All" || item.platform === reportFilter.platform;
    const matchesDate = itemDate >= start && itemDate <= end;
    
    return matchesPlatform && matchesDate;
  });

  // Calculate Aggregated Metrics
  const aggregatedStats = content.reduce((acc: any, item: any) => {
    const m = item.metrics || {};
    acc.views += Number(m.views || 0);
    acc.likes += Number(m.likes || 0);
    acc.comments += Number(m.comments || 0);
    acc.shares += Number(m.shares || 0);
    acc.saves += Number(m.saves || 0);
    acc.reposts += Number(m.reposts || 0);
    return acc;
  }, { views: 0, likes: 0, comments: 0, shares: 0, saves: 0, reposts: 0 });

  // Reach (Instagram only) - calculated independently of main content filter to always reflect IG in the period
  const totalReachIG = (data.content_plan || []).filter((item: any) => {
    if (!item.date) return false;
    const itemDate = new Date(item.date);
    const start = new Date(reportFilter.startDate);
    const end = new Date(reportFilter.endDate);
    return item.platform === "Instagram" && itemDate >= start && itemDate <= end;
  }).reduce((sum: number, item: any) => sum + Number(item.metrics?.reach || 0), 0);

  // Repost (Instagram only) - following same logic as reach for consistency
  const totalRepostIG = (data.content_plan || []).filter((item: any) => {
    if (!item.date) return false;
    const itemDate = new Date(item.date);
    const start = new Date(reportFilter.startDate);
    const end = new Date(reportFilter.endDate);
    return item.platform === "Instagram" && itemDate >= start && itemDate <= end;
  }).reduce((sum: number, item: any) => sum + Number(item.metrics?.reposts || 0), 0);

  const totalInteraksi = aggregatedStats.likes + aggregatedStats.comments + aggregatedStats.shares + aggregatedStats.saves;
  
  // Helper to parse follower strings like "1.2k" or "1,200"
  const parseFollowers = (v: any) => {
    if (!v) return 0;
    const s = String(v).toLowerCase().trim();
    
    // Handle k/m suffixes
    if (s.includes('k') || s.includes('m')) {
      // For suffixes, we keep the dot for parseFloat (e.g., 1.2k)
      // but remove commas which might be used as thousand separators (e.g., 1,200k)
      const numStr = s.replace(/[km]/g, '').replace(/,/g, '');
      let num = parseFloat(numStr);
      if (isNaN(num)) return 0;
      if (s.includes('k')) num *= 1000;
      if (s.includes('m')) num *= 1000000;
      return num;
    }
    
    // For non-suffix numbers, remove all punctuation (dots or commas) 
    // and treat as a whole integer.
    const cleanStr = s.replace(/[^0-9]/g, '');
    const num = parseInt(cleanStr, 10);
    return isNaN(num) ? 0 : num;
  };

  const currentFollowers = reportFilter.platform === "Instagram" 
    ? parseFollowers(data.platformStats?.instagram?.followers)
    : reportFilter.platform === "TikTok"
      ? parseFollowers(data.platformStats?.tiktok?.followers)
      : (parseFollowers(data.platformStats?.instagram?.followers) + parseFollowers(data.platformStats?.tiktok?.followers));

  const erPercent = (currentFollowers > 0) 
    ? (totalInteraksi / currentFollowers) 
    : 0;



  // Platform Split
  const igCount = content.filter((i: any) => i.platform === "Instagram").length;
  const tkCount = content.filter((i: any) => i.platform === "TikTok").length;

  // Top/Low Perform
  const sortedByPerf = [...content].sort((a: any, b: any) => {
    const getScore = (i: any) => (i.metrics?.likes || 0) + (i.metrics?.comments || 0) + (i.metrics?.shares || 0);
    return getScore(b) - getScore(a);
  });

  const topItems = sortedByPerf.slice(0, 2);
  const lowItems = sortedByPerf.slice(-2).reverse();

  // Pillar Distribution
  const pillarMap = content.reduce((acc: any, item: any) => {
    const pillar = item.value || "Lainnya"; // Using 'value' from content plan as Pillar
    acc[pillar] = (acc[pillar] || 0) + 1;
    return acc;
  }, {});

  const pillarData = Object.entries(pillarMap).map(([name, value]) => ({ name, value: value as number }));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-[95vw] lg:max-w-[90vw] xl:max-w-[1600px] max-h-[95vh] bg-[#f8fafc] rounded-[3.5rem] shadow-2xl overflow-hidden border border-white/20 flex flex-col"
      >
        {/* Header */}
        <div className="px-10 py-6 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-sans font-extrabold font-black text-slate-900">Full Monthly Report Dashboard</h2>
              <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">Performance Analysis & Distribution</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl hover:bg-slate-100 text-slate-400 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filters Area */}
        <div className="px-10 py-6 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-4">
            <select 
              className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-4 ring-accent/5 transition-all"
              value={reportFilter.platform}
              onChange={(e) => setReportFilter({...reportFilter, platform: e.target.value})}
            >
              <option value="All">Semua Platform</option>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
            </select>
            
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2">
              <input 
                type="date"
                className="bg-transparent text-[10px] font-bold text-slate-600 outline-none"
                value={reportFilter.startDate}
                onChange={(e) => setReportFilter({...reportFilter, startDate: e.target.value})}
              />
              <span className="text-slate-300 text-xs">-</span>
              <input 
                type="date"
                className="bg-transparent text-[10px] font-bold text-slate-600 outline-none"
                value={reportFilter.endDate}
                onChange={(e) => setReportFilter({...reportFilter, endDate: e.target.value})}
              />
            </div>
          </div>
          <div className="px-5 py-2 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black tracking-widest uppercase border border-emerald-100">
             Filters Applied
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
          {/* Main Highlights Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4">
             <MetricCard label="REACH (IG)" value={totalReachIG.toLocaleString()} color="blue" />
             <MetricCard label="VIEWS" value={aggregatedStats.views.toLocaleString()} color="amber" />
             <MetricCard label="ER %" value={`${erPercent.toFixed(2)}%`} color="rose" />
             <MetricCard label="INTERAKSI" value={totalInteraksi.toLocaleString()} color="indigo" />
             <MetricCard label="LIKES" value={aggregatedStats.likes.toLocaleString()} color="pink" />
             <MetricCard label="COMMENT" value={aggregatedStats.comments.toLocaleString()} color="blue" />
             <MetricCard label="SHARE" value={aggregatedStats.shares.toLocaleString()} color="emerald" />
             <MetricCard label="SAVE" value={aggregatedStats.saves.toLocaleString()} color="amber" />
             <MetricCard label="REPOST (IG)" value={totalRepostIG.toLocaleString()} color="slate" />
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Charts */}
            <div className="lg:col-span-8 space-y-8">
               <Card className="p-8 rounded-[2.5rem] border-none shadow-sm h-[350px] relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase flex items-center gap-2">
                       <TrendingUp className="w-4 h-4 text-accent" /> Daily Performance Growth
                    </h3>
                    <div className="flex items-center gap-4 text-[9px] font-bold">
                       <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-accent" /> REACH</span>
                       <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400" /> VIEWS</span>
                    </div>
                  </div>
                  <div className="h-56 w-full bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 p-4 relative">
                    {content.length > 0 ? (
                      <DailyGrowthChart data={(data.content_plan || []).filter((item: any) => {
                        const start = new Date(reportFilter.startDate);
                        const end = new Date(reportFilter.endDate);
                        if (!item.date) return false;
                        const itemDate = new Date(item.date);
                        return itemDate >= start && itemDate <= end;
                      })} reportFilter={reportFilter} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-[10px] font-sans font-extrabold text-slate-300">Data visualisasi harian otomatis menyesuaikan periode terpilih...</p>
                      </div>
                    )}
                  </div>
               </Card>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="p-8 rounded-[2.5rem] border-none shadow-sm">
                    <h3 className="text-[10px] font-black tracking-widest text-emerald-500 uppercase flex items-center gap-2 mb-6">
                       <CheckCircle2 className="w-4 h-4" /> Top Perform
                    </h3>
                    <div className="space-y-4">
                       {topItems.length > 0 ? topItems.map((item: any, i) => (
                         <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/50">
                            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">{i+1}</div>
                            <div className="flex-1 min-w-0">
                               <p className="text-xs font-bold text-slate-800 line-clamp-1">{item.headline}</p>
                               <p className="text-[9px] font-bold text-emerald-600 mt-1 uppercase tracking-tighter">{item.metrics?.likes || 0} Likes • {item.metrics?.reach || 0} Reach</p>
                            </div>
                         </div>
                       )) : (
                         <p className="text-[10px] text-slate-300 py-4">Belum ada data...</p>
                       )}
                    </div>
                  </Card>

                  <Card className="p-8 rounded-[2.5rem] border-none shadow-sm">
                    <h3 className="text-[10px] font-black tracking-widest text-rose-500 uppercase flex items-center gap-2 mb-6">
                       <AlertTriangle className="w-4 h-4" /> Low Perform
                    </h3>
                    <div className="space-y-4">
                       {lowItems.length > 0 ? lowItems.map((item: any, i) => (
                         <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-rose-50/50 border border-rose-100/50">
                            <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-black">{i+1}</div>
                            <div className="flex-1 min-w-0">
                               <p className="text-xs font-bold text-slate-800 line-clamp-1">{item.headline}</p>
                               <p className="text-[9px] font-bold text-rose-600 mt-1 uppercase tracking-tighter">{item.metrics?.likes || 0} Likes • {item.metrics?.reach || 0} Reach</p>
                            </div>
                         </div>
                       )) : (
                         <p className="text-[10px] text-slate-300 py-4">Belum ada data...</p>
                       )}
                    </div>
                  </Card>
               </div>
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-4 space-y-8">
               <Card className="p-8 rounded-[3rem] bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden h-[350px]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-[60px] rounded-full" />
                  <div className="relative z-10 flex flex-col h-full justify-between">
                     <div>
                        <h3 className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase mb-8">Production Summary</h3>
                        <div className="flex items-end gap-3">
                           <span className="text-7xl font-sans font-extrabold font-black">{content.length}</span>
                           <div className="mb-4">
                              <p className="text-lg font-black leading-none">Konten</p>
                              <p className="text-[9px] font-bold text-slate-500 tracking-widest uppercase mt-1">Digital Portfolio</p>
                           </div>
                        </div>
                     </div>
                     
                     <div className="pt-8 border-t border-white/10 flex items-center justify-between">
                        <div className="space-y-1">
                           <p className="text-[8px] font-black text-slate-500 tracking-widest uppercase">Platform Split</p>
                           <div className="flex gap-4">
                              <div><span className="text-base font-black">{tkCount}</span> <span className="text-[9px] text-slate-500 font-bold uppercase">TikTok</span></div>
                              <div><span className="text-base font-black">{igCount}</span> <span className="text-[9px] text-slate-500 font-bold uppercase">Instagram</span></div>
                           </div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                           <Layers className="w-6 h-6 text-accent" />
                        </div>
                     </div>
                  </div>
               </Card>

               <Card className="p-8 rounded-[2.5rem] border-none shadow-sm">
                  <h3 className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-8">Pillar Distribution</h3>
                  <div className="flex flex-col items-center justify-center py-4">
                     <div className="relative w-40 h-40">
                         {/* Simple CSS Donut */}
                         <div className="absolute inset-0 rounded-full border-[12px] border-slate-50" />
                         <div className="absolute inset-0 rounded-full border-[12px] border-accent border-l-transparent border-t-transparent" />
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-slate-900">{pillarData.length}</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Pillars</span>
                         </div>
                     </div>
                     <div className="mt-8 w-full space-y-3">
                        {pillarData.slice(0, 4).map((p, i) => (
                          <div key={p.name} className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${i===0 ? 'bg-accent' : i===1 ? 'bg-indigo-400' : i===2 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                                <span className="text-[10px] font-bold text-slate-600 line-clamp-1">{p.name}</span>
                             </div>
                             <span className="text-[10px] font-black text-slate-900">{p.value} Post</span>
                          </div>
                        ))}
                     </div>
                  </div>
               </Card>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <Card className="p-8 rounded-[2.5rem] border-none shadow-sm">
                <h3 className="text-[10px] font-black tracking-widest text-slate-400 uppercase flex items-center gap-2 mb-8">
                   <Clock className="w-4 h-4" /> Post Frequency
                </h3>
                <div className="h-40 flex items-end justify-between px-4">
                   {(() => {
                     // 1. Aggregasi berdasarkan hari (0=Min, 1=Sen, ...)
                     const dayCounts = [0, 0, 0, 0, 0, 0, 0];
                     content.forEach((item: any) => {
                       if (item.date) {
                         const d = new Date(item.date);
                         dayCounts[d.getDay()] += 1;
                       }
                     });

                     // Mapping index to Labels & rearrange to start from Monday (Sen)
                     const mapping = [
                       { label: "Sen", index: 1 },
                       { label: "Sel", index: 2 },
                       { label: "Rab", index: 3 },
                       { label: "Kam", index: 4 },
                       { label: "Jum", index: 5 },
                       { label: "Sab", index: 6 },
                       { label: "Min", index: 0 },
                     ];

                     const maxVal = Math.max(...dayCounts, 1);

                     return mapping.map((item) => {
                       const count = dayCounts[item.index];
                       const height = (count / maxVal) * 100;
                       
                       return (
                          <div key={item.label} className="flex flex-col items-center gap-4 group flex-1">
                             <div className="text-[8px] font-black text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity mb-1">{count}</div>
                             <motion.div 
                               initial={{ height: 0 }}
                               animate={{ height: count > 0 ? `${Math.max(height, 5)}%` : "2%" }}
                               className={`w-full max-w-[32px] rounded-xl transition-all duration-500 ${count > 0 ? 'bg-accent/20 group-hover:bg-accent ring-1 ring-accent/10' : 'bg-slate-50'}`}
                             />
                             <span className={`text-[9px] font-bold uppercase tracking-widest ${count > 0 ? 'text-slate-600' : 'text-slate-300'}`}>{item.label}</span>
                          </div>
                       )
                     });
                   })()}
                </div>
             </Card>
             <Card className="p-8 rounded-[2.5rem] border-none shadow-sm">
                <h3 className="text-[10px] font-black tracking-widest text-slate-400 uppercase flex items-center gap-2 mb-8">
                   <Sparkles className="w-4 h-4 text-amber-400" /> Peak Insights
                </h3>
                <div className="space-y-4">
                   <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                      <p className="text-[8px] font-black text-emerald-600 mb-1 tracking-widest uppercase">Highest Interaction</p>
                      <p className="text-xs font-bold text-slate-800">{topItems[0]?.headline || "Belum ada data"}</p>
                   </div>
                   <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
                      <p className="text-[8px] font-black text-rose-600 mb-1 tracking-widest uppercase">Lowest Interaction</p>
                      <p className="text-xs font-bold text-slate-800">{lowItems[0]?.headline || "Belum ada data"}</p>
                   </div>
                </div>
             </Card>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const MetricCard = ({ label, value, color }: any) => {
  return (
    <div className="bg-white p-4 py-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-3 group hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-500">
      <span className="text-[8px] font-bold text-slate-300 tracking-[0.2em] uppercase">{label}</span>
      <h4 className="text-xl font-medium text-slate-800 leading-none tracking-tight">{value}</h4>
    </div>
  );
};

const DailyGrowthChart = ({ data, reportFilter }: any) => {
  // 1. Calculate Daily Data Points
  const getDailyDataPoints = () => {
    const start = new Date(reportFilter.startDate);
    const end = new Date(reportFilter.endDate);
    const diffMs = end.getTime() - start.getTime();
    
    // Add 1 to ensure inclusion of both start and end days
    const totalDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1);

    // If visualizing more than 14 days, group them into ~7 data points to avoid crowding
    // Otherwise, show day by day.
    const maxDataPoints = totalDays <= 14 ? totalDays : 7;
    const blockSize = totalDays / maxDataPoints;

    return Array.from({ length: maxDataPoints }).map((_, i) => {
      const dStart = new Date(start);
      dStart.setDate(start.getDate() + (i * blockSize));
      const dEnd = new Date(start);
      dEnd.setDate(start.getDate() + ((i + 1) * blockSize));

      const inBlock = data.filter((item: any) => {
        const itemDate = new Date(item.date);
        return itemDate >= dStart && itemDate < dEnd;
      });

      // Just for labeling
      const isSingleDay = blockSize <= 1.5;
      const label = isSingleDay 
        ? dStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
        : `${dStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}-${new Date(dEnd.getTime() - 1000*60*60*24).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`;

      return {
        name: label,
        reach: inBlock.reduce((sum: number, item: any) => sum + Number(item.metrics?.reach || 0), 0),
        views: inBlock.reduce((sum: number, item: any) => sum + Number(item.metrics?.views || 0), 0)
      };
    });
  };

  const chartData = getDailyDataPoints();

  return (
    <div className="w-full h-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0052FF" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#0052FF" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
            dy={10}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
            cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Area 
            type="monotone" 
            dataKey="views" 
            stroke="#fbbf24" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorViews)" 
            activeDot={{ r: 6, strokeWidth: 0, fill: '#fbbf24' }}
          />
          <Area 
            type="monotone" 
            dataKey="reach" 
            stroke="#0052FF" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorReach)" 
            activeDot={{ r: 6, strokeWidth: 0, fill: '#0052FF' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const GoalsRoadmapView = ({ clientId, isAdmin, paymentData, getPaymentStatus }: { clientId: string; isAdmin: boolean; paymentData: any; getPaymentStatus: any }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [clientVision, setClientVision] = useState<any>({
    statement: "Membangun personal brand yang Berpengaruh.",
    focus: ["Market Authority", "Consistent Value Rendering", "Monetization Readiness"],
    color: "#0F172A"
  });
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [evidenceLink, setEvidenceLink] = useState("");

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch Vision
    const { data: cData } = await supabase.from('clients').select('vision_statement, roadmap_focus, roadmap_color').eq('id', clientId).single();
    if (cData) {
      setClientVision({
        statement: cData.vision_statement || "Membangun personal brand yang Berpengaruh.",
        focus: cData.roadmap_focus || ["Market Authority", "Consistent Value Rendering", "Monetization Readiness"],
        color: cData.roadmap_color || "#0F172A"
      });
    }

    // Fetch Tasks
    const { data } = await supabase
      .from('mentee_tasks')
      .select('*')
      .eq('client_id', clientId)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (data) setTasks(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!clientId) return;
    
    fetchData();

    // SETUP REALTIME SYNC
    const channel = supabase
      .channel(`roadmap_realtime_${clientId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'mentee_tasks',
          filter: `client_id=eq.${clientId}`
        },
        () => fetchData()
      )
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'clients',
          filter: `id=eq.${clientId}`
        },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId]);

  const handleUpdateStatus = async (taskId: string, status: string) => {
     const { error } = await supabase.from('mentee_tasks').update({ status }).eq('id', taskId);
     if (!error) fetchData();
  };

  const handleSubmitEvidence = async () => {
    if (!selectedTask || !evidenceLink) return;
    const { error } = await supabase.from('mentee_tasks').update({ 
      evidence_link: evidenceLink,
      status: 'Under Review'
    }).eq('id', selectedTask.id);
    if (!error) { setSelectedTask(null); setEvidenceLink(""); fetchData(); }
  };

  const completedTasks = tasks.filter(t => t.status === 'Completed');
  const progressPercent = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-10 duration-700 pb-20">
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-4">
          <div className="space-y-4">
             <SectionLabel label="Personal Branding Roadmap" />
             <h2 className="text-4xl md:text-5xl font-sans font-extrabold tracking-tight text-foreground leading-[1.1]">
               Goals & <span className="gradient-text">Roadmap.</span>
             </h2>
             <p className="text-muted-foreground font-medium text-lg max-w-xl">Langkah-langkah strategis untuk membangun otoritas personal brand kamu.</p>
          </div>

          <Card className="p-8 bg-white border-border/50 shadow-2xl shadow-accent/5 rounded-[32px] md:w-80 shrink-0">
              <div className="flex items-center justify-between mb-6">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Overall Progress</p>
                    <h4 className="text-2xl font-black text-foreground">{Math.round(progressPercent)}%</h4>
                 </div>
                 <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                    <Target size={24} />
                 </div>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                 <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} className="h-full bg-accent" />
              </div>
          </Card>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
             {loading ? (
                <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" /></div>
             ) : tasks.length === 0 ? (
                <Card className="p-20 text-center border-dashed border-2 bg-transparent rounded-[32px]">
                  <Zap size={48} className="text-muted-foreground/20 mx-auto mb-6" />
                  <p className="text-muted-foreground font-bold">Belum ada roadmap yang ditugaskan oleh mentor.</p>
                </Card>
             ) : (
                <div className="space-y-6">
                   {tasks.map(task => (
                      <Card key={task.id} className={`p-8 md:p-10 overflow-hidden border-none shadow-[0px_10px_40px_rgba(0,0,0,0.03)] rounded-[32px] transition-all duration-500 border-l-[6px] ${
                        task.status === 'Completed' ? 'border-emerald-500' : 
                        task.status === 'Under Review' ? 'border-amber-500' : 'border-accent'
                      }`}>
                         <div className="flex flex-col md:flex-row justify-between gap-8">
                            <div className="space-y-4 flex-1">
                               <div className="flex items-center gap-3">
                                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[2px] border ${
                                    task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                    task.status === 'Under Review' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-accent/5 text-accent border-accent/10'
                                  }`}>{task.status}</span>
                                  <span className="text-[11px] font-black text-muted-foreground/50 uppercase tracking-widest">{task.category}</span>
                               </div>
                               <h4 className="text-2xl font-sans font-extrabold tracking-tight text-foreground">{task.title}</h4>
                               <p className="text-muted-foreground text-[15px] font-medium leading-relaxed max-w-2xl">{task.description}</p>
                               
                               {task.mentor_feedback && (
                                 <div className="mt-8 p-6 bg-accent/[0.03] border border-accent/10 rounded-3xl flex gap-4 items-start shadow-sm">
                                    <MessageSquare size={18} className="text-accent shrink-0 mt-1" />
                                    <div className="space-y-1">
                                       <p className="text-[10px] font-black text-accent uppercase tracking-widest">Mentor Feedback</p>
                                       <p className="text-sm font-bold text-foreground italic leading-relaxed">"{task.mentor_feedback}"</p>
                                    </div>
                                 </div>
                               )}
                            </div>

                            <div className="flex flex-col gap-3 min-w-[200px]">
                               {task.status !== 'Completed' && (
                                  <Button className="w-full h-14 rounded-2xl font-black tracking-widest text-[11px] uppercase shadow-accent-lg" onClick={() => setSelectedTask(task)}>Submit Proof</Button>
                               )}
                               {task.evidence_link && (
                                  <a href={task.evidence_link} target="_blank" className="text-center p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-accent font-bold text-xs flex items-center justify-center gap-2 border border-slate-100 transition-all"><LinkIcon size={14} /> View Submission</a>
                               )}
                            </div>
                         </div>
                      </Card>
                   ))}
                </div>
             )}
          </div>

          <div className="lg:col-span-4 space-y-8">
              <Card 
                className="p-8 text-white rounded-[40px] shadow-2xl shadow-accent/20 overflow-hidden relative border-none min-h-[400px]"
                style={{ backgroundColor: clientVision.color }}
              >
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 blur-[80px] rounded-full" />
                 <h4 className="text-3xl font-black tracking-tight leading-loose relative z-10 whitespace-pre-wrap">{clientVision.statement}</h4>
                 <div className="space-y-4 pt-10 relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Upcoming Focus</p>
                    <div className="space-y-4">
                       {Array.isArray(clientVision.focus) && clientVision.focus.map((f: string) => (
                          <div key={f} className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-accent animate-pulse" /><p className="text-sm font-bold opacity-70 tracking-tight">{f}</p></div>
                       ))}
                    </div>
                 </div>
              </Card>
              
              <Card className="p-8 bg-white border-border/50 rounded-[40px] shadow-xl shadow-accent/5">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center"><Star size={20} /></div>
                    <h5 className="font-black text-lg text-foreground">Butuh Bantuan Strategi?</h5>
                 </div>
                 <p className="text-sm font-medium text-muted-foreground leading-relaxed mb-6">Jika kamu bingung dengan roadmap di atas, silakan hubungi mentor di Inbox Mentee.</p>
                 <Button variant="outline" className="w-full h-12 rounded-2xl font-black tracking-widest text-[11px] uppercase border-2">Tanya Mentor</Button>
              </Card>

              <div className="p-10 rounded-[3rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center group hover:border-accent/40 transition-all duration-500">
                 <div className="w-20 h-20 rounded-[2.5rem] bg-white shadow-xl flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                    <CreditCard size={32} />
                 </div>
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-2">Program Bill Status</h4>
                 <p className="text-xl font-black text-slate-900 group-hover:text-accent transition-colors">
                    {getPaymentStatus(paymentData)}
                 </p>
              </div>
          </div>
       </div>

       <AnimatePresence>
          {selectedTask && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
               <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg p-10 space-y-8">
                  <div className="flex items-center justify-between">
                     <h3 className="text-3xl font-black text-foreground tracking-tight">Kirim Bukti Tugas</h3>
                     <button onClick={() => setSelectedTask(null)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all"><X size={20} /></button>
                  </div>
                  <div className="space-y-6">
                     <input placeholder="Link Dokumentasi (G-Drive, Sosmed, dll)" value={evidenceLink} onChange={(e) => setEvidenceLink(e.target.value)} className="w-full h-16 rounded-[24px] bg-[#FAFAFA] border border-slate-100 px-6 font-bold text-sm focus:outline-none focus:ring-4 ring-accent/10 transition-all text-slate-700" />
                  </div>
                  <Button onClick={handleSubmitEvidence} className="w-full h-16 rounded-[24px] shadow-accent-lg font-black tracking-widest text-[16px] uppercase">Submit to Mentor</Button>
               </motion.div>
            </div>
          )}
       </AnimatePresence>
    </div>
  );
};


