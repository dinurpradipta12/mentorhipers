"use client";

import React, { useState, use, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

import BottomBar from "@/components/layout/BottomBar";
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
  ChevronDown
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
    plan_settings: { allow_edit: false }
  });

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
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", resolvedParams.id)
        .single();

      if (data) {
        setBoardData({
          ...boardData,
          name: data.full_name,
          niche: data.niche,
          end_date: data.end_date,
          profile_url: data.profile_url,
          payment_data: data.payment_data,
          // Mapping other data if available or using defaults
          platformStats: data.platform_stats || boardData.platformStats,
          platforms: data.platforms || ["Instagram", "TikTok"],
          currentPhase: data.current_phase || boardData.currentPhase,
          tasks: data.tasks || [
            { label: "Onboarding", status: "Active" },
            { label: "Content Strategy", status: "Locked" }
          ],
          checklist: data.checklist || boardData.checklist,
          schedule: data.schedule || [],
          roadmap: data.roadmap || boardData.roadmap,
          content_plan: data.content_plan || [],
          plan_settings: data.plan_settings || { allow_edit: false }
        });
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
        (payload) => {
          console.log('Admin updated this client data!', payload);
          const updated = payload.new as any;
          setBoardData((prev: any) => ({
            ...prev,
            name: updated.full_name,
            niche: updated.niche,
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
            plan_settings: updated.plan_settings || prev.plan_settings
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
      const { error } = await supabase
        .from("clients")
        .update({ [field === 'name' ? 'full_name' : field === 'content_plan' ? 'content_plan' : field]: value })
        .eq("id", resolvedParams.id);

      if (error) throw error;
      console.log(`Synced ${field} to Supabase`);
    } catch (err) {
      console.error(`Failed to sync ${field}:`, err);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-serif text-slate-400 italic">
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
                <h2 className="text-4xl font-serif">Hello, <span className="italic text-accent">{boardData.name}</span></h2>
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
                  <div className="w-full h-full bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center text-white text-3xl font-serif">
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

              <h2 className="text-4xl md:text-5xl font-serif tracking-tight text-foreground leading-tight">
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
            <div className="flex flex-col items-center justify-center px-8 py-4 rounded-3xl bg-white border border-border/50 shadow-sm glass-card">
              <span className="text-[10px] font-bold text-muted-foreground mb-1">Status Pembayaran</span>
              <span className="text-sm font-bold text-accent">{getPaymentStatus(boardData.payment_data)}</span>
            </div>

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
                <section>
                  <div className="flex items-end justify-between mb-8">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <h3 className="text-2xl font-serif">Account <span className="italic text-accent">Stats</span></h3>
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

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                  {/* Left Column: 8/12 */}
                  <div className="xl:col-span-8 space-y-10">
                    {/* 2. Mentoring Phase Roadmap */}
                    <Card className="p-10 relative overflow-hidden group border-none bg-white shadow-sm rounded-[3rem]">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/50 blur-[120px] rounded-full -mr-40 -mt-40 transition-colors duration-700" />

                      <div className="relative z-10 w-full">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                          <div>
                            <h3 className="text-4xl font-serif leading-tight text-slate-900">Mentoring <span className="italic text-accent">Roadmap</span></h3>
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

                        {/* Current Phase Tasks */}
                        <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100/50">
                          <h4 className="text-[10px] font-bold text-slate-400 mb-6 tracking-[0.2em] flex items-center gap-2">
                            Active in Fase 0{boardData.currentPhase} <ArrowRight className="w-3 h-3" />
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            {boardData.tasks.map((task, i) => (
                              <JourneyItem key={i} label={task.label} status={task.status} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* 3. Content Queue */}
                    <section>
                      <h3 className="text-xl font-serif mb-6 flex items-center gap-3">
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
                                <p className="text-xs font-serif italic text-slate-400">Belum ada konten yang dijadwalkan dalam 7 hari ke depan.</p>
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
                  </div>

                  {/* Right Column: 4/12 */}
                  <div className="xl:col-span-4 space-y-8">
                    {/* 4. Mentoring Calendar & Schedule */}
                    <Card className="p-8 rounded-[2.5rem] border border-border bg-white shadow-sm relative">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h4 className="text-sm font-bold tracking-widest flex items-center gap-2">
                            Mentoring <span className="italic">Calendar</span>
                          </h4>
                          <p className="text-[10px] text-muted-foreground font-medium mt-1">March 2024</p>
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
                          const scheduleForDay = boardData.schedule.find(s => {
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
                          {boardData.schedule.map((item) => (
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

                    {/* 5. Action Items */}
                    <Card className="p-8 pb-10 rounded-[2.5rem] border border-border bg-white shadow-sm overflow-hidden relative">
                      <h4 className="text-sm font-bold tracking-widest mb-8 flex items-center gap-3">
                        <CheckSquare className="w-4 h-4 text-accent" />
                        Mentor <span className="italic">Checklist</span>
                      </h4>
                      <div className="space-y-6">
                        {boardData.checklist.items.map((item: any) => (
                          <ActionItem key={item.id} text={item.text} done={item.done} />
                        ))}
                      </div>

                      <div className="mt-10 p-5 rounded-2xl bg-muted/30 border border-border/50">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0">
                            <Lightbulb className="w-4 h-4" />
                          </div>
                          <p className="text-[11px] leading-relaxed text-muted-foreground italic mt-0.5">
                            "{boardData.checklist.suggestion}"
                          </p>
                        </div>
                      </div>
                    </Card>
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
          </AnimatePresence>
        </div>
      </main>

      <BottomBar activeTab={activeTab} onTabChange={setActiveTab} />

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
                      <h2 className="text-2xl font-serif">Quick Update Dashboard</h2>
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
                          {boardData.schedule.map((item) => (
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
                                  items: [...boardData.checklist.items, { id: newId, text: "New Task", done: false }]
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
                            className="w-full bg-white/50 border border-indigo-100 rounded-2xl p-3 text-[10px] italic text-indigo-700 placeholder:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            rows={3}
                            value={boardData.checklist.suggestion}
                            onChange={(e) => setBoardData({ ...boardData, checklist: { ...boardData.checklist, suggestion: e.target.value } })}
                            placeholder="Give some words of wisdom..."
                          />
                        </div>
                      </div>

                      {/* Active Phase Tasks Section */}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
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
                    {isAdmin && <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 w-16"></th>}
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
                        {isAdmin && (
                          <td className="px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-2">
                              {item.isDraft && (
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

                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-3 rounded-xl text-slate-200 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
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
                                              className="w-full bg-white border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-accent shadow-sm focus:outline-none"
                                              value={item.pillar || ""}
                                              onChange={(e) => updateItem(item.id, "pillar", e.target.value)}
                                              placeholder="Platform pillar..."
                                           />
                                        </div>
                                        <div>
                                           <label className="text-[10px] font-black text-slate-400 tracking-widest mb-3 block">Link Live Posting</label>
                                           <div className="relative">
                                              <input 
                                                 className="w-full bg-white border border-slate-100 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-slate-900 shadow-sm focus:outline-none"
                                                 value={item.post_link || ""}
                                                 onChange={(e) => updateItem(item.id, "post_link", e.target.value)}
                                                 placeholder="Paste link..."
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
                                        <MetricItem label="Total Views" value={item.metrics?.views} onChange={(v: any) => updateItem(item.id, "metrics", { ...item.metrics, views: v })} />
                                        <MetricItem label="Likes" value={item.metrics?.likes} onChange={(v: any) => updateItem(item.id, "metrics", { ...item.metrics, likes: v })} />
                                        <MetricItem label="Comments" value={item.metrics?.comments} onChange={(v: any) => updateItem(item.id, "metrics", { ...item.metrics, comments: v })} />
                                        <MetricItem label="Shares" value={item.metrics?.shares} onChange={(v: any) => updateItem(item.id, "metrics", { ...item.metrics, shares: v })} />
                                        <MetricItem label="Saves" value={item.metrics?.saves} onChange={(v: any) => updateItem(item.id, "metrics", { ...item.metrics, saves: v })} />
                                        
                                        {item.platform === "Instagram" ? (
                                           <>
                                              <MetricItem label="Reach" value={item.metrics?.reach} onChange={(v: any) => updateItem(item.id, "metrics", { ...item.metrics, reach: v })} />
                                              <MetricItem label="Reposts" value={item.metrics?.reposts} onChange={(v: any) => updateItem(item.id, "metrics", { ...item.metrics, reposts: v })} />
                                           </>
                                        ) : (
                                           <>
                                              <MetricItem label="Retention (s)" value={item.metrics?.retention} onChange={(v: any) => updateItem(item.id, "metrics", { ...item.metrics, retention: v })} />
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
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
                          <p className="text-[9px] text-slate-400 font-medium italic line-clamp-1 mb-1">
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
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
                        <div className={`text-sm font-serif italic mb-3 ml-1 flex items-center justify-center w-7 h-7 rounded-full transition-all ${isToday ? 'bg-accent text-white not-italic font-bold shadow-accent-sm scale-110' : 'text-slate-300'}`}>
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
                            className="w-full bg-slate-50/50 border border-slate-100 rounded-3xl p-5 text-lg font-black text-slate-800 placeholder:text-slate-200 focus:bg-white focus:ring-4 ring-accent/5 transition-all outline-none"
                            value={item.headline}
                            onChange={(val) => updateItem(item.id, "headline", val)}
                            placeholder="Tulis judul yang menarik..."
                          />
                       </div>

                       {/* Status & Platform & Date Row */}
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-300 tracking-[0.2em] uppercase">Status</label>
                             <select
                               className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold text-slate-700 outline-none"
                               value={item.status}
                               onChange={(e) => updateItem(item.id, "status", e.target.value)}
                             >
                                {["Planning", "Progress Scripting", "Progress Desain", "Pengajuan", "Revisi", "Scheduled", "Uploaded"].map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                             </select>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-300 tracking-[0.2em] uppercase">Platform</label>
                             <select
                               className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold text-slate-700 outline-none"
                               value={item.platform}
                               onChange={(e) => updateItem(item.id, "platform", e.target.value)}
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
                                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                                  value={item.date}
                                  onChange={(e) => updateItem(item.id, "date", e.target.value)}
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
                               onChange={(val) => updateItem(item.id, "objective", val)}
                               placeholder="Apa tujuan dari konten ini?"
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-300 tracking-[0.2em] uppercase">Content Value / Pillar</label>
                             <input 
                               type="text"
                               className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold text-slate-700 outline-none focus:bg-white transition-all"
                               value={item.value}
                               onChange={(e) => updateItem(item.id, "value", e.target.value)}
                               placeholder="Nilai yang ingin disampaikan..."
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
                                  className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-accent shadow-sm focus:ring-4 ring-accent/5 outline-none transition-all"
                                  value={item.post_link}
                                  onChange={(e) => updateItem(item.id, "post_link", e.target.value)}
                                  placeholder="https://..."
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[8px] font-black text-slate-300 tracking-widest ml-1">LINK RESULT/HASIL</label>
                                <input 
                                  type="text"
                                  className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 shadow-sm focus:ring-4 ring-slate-100 outline-none transition-all"
                                  value={item.result_link}
                                  onChange={(e) => updateItem(item.id, "result_link", e.target.value)}
                                  placeholder="https://..."
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
};;



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
        <h4 className={`text-4xl font-bold font-serif ${accentColor}`}>{value}</h4>
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
      {status === "completed" ? <CheckSquare className="w-6 h-6" /> : <span className="text-lg font-serif">{phase}</span>}
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

const ActionItem = ({ text, done }: any) => (
  <div className="flex items-center justify-between group cursor-pointer">
    <div className="flex items-center gap-4">
      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${done ? "bg-accent border-accent" : "border-border group-hover:border-accent"
        }`}>
        {done && <CheckSquare className="w-3 h-3 text-white" />}
      </div>
      <span className={`text-xs font-semibold ${done ? "text-muted-foreground line-through decoration-emerald-500/50" : "text-slate-700"}`}>
        {text}
      </span>
    </div>
    <ArrowUpRight className="w-3 h-3 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
  </div>
);

const MetricItem = ({ label, value, onChange }: any) => {
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
        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-xs font-black text-slate-700 focus:outline-none focus:ring-4 ring-accent/5 focus:bg-white transition-all text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-sm"
        value={localValue}
        onFocus={() => setIsFocused(true)}
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
    // Include items that are in progress or done
    const allowedStatuses = ["Uploaded", "Published", "Awaiting Upload", "Ongoing"];
    if (!allowedStatuses.includes(item.status)) return false;
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
    const s = String(v).toLowerCase().replace(/,/g, '');
    let num = parseFloat(s.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return 0;
    if (s.includes('k')) num *= 1000;
    if (s.includes('m')) num *= 1000000;
    return num;
  };

  const currentFollowers = reportFilter.platform === "Instagram" 
    ? parseFollowers(data.platformStats?.instagram?.followers)
    : reportFilter.platform === "TikTok"
      ? parseFollowers(data.platformStats?.tiktok?.followers)
      : (parseFollowers(data.platformStats?.instagram?.followers) + parseFollowers(data.platformStats?.tiktok?.followers));

  const erPercent = currentFollowers > 0 ? (totalInteraksi / currentFollowers) * 100 : 0;



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
    const pillar = item.pillar || item.value || "Lainnya";
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
              <h2 className="text-xl font-serif font-black text-slate-900">Full Monthly Report Dashboard</h2>
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
                       <TrendingUp className="w-4 h-4 text-accent" /> Weekly Performance Growth
                    </h3>
                    <div className="flex items-center gap-4 text-[9px] font-bold">
                       <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-accent" /> REACH</span>
                       <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400" /> VIEWS</span>
                    </div>
                  </div>
                  <div className="h-48 w-full bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 flex items-center justify-center">
                     <p className="text-[10px] font-serif italic text-slate-300">Data visualisasi mingguan otomatis menyesuaikan periode terpilih...</p>
                  </div>
                  <div className="absolute bottom-6 left-8 right-8 flex justify-between text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                     <span>Minggu 1</span>
                     <span>Minggu 2</span>
                     <span>Minggu 3</span>
                     <span>Minggu 4</span>
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
                         <p className="text-[10px] italic text-slate-300 py-4">Belum ada data...</p>
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
                         <p className="text-[10px] italic text-slate-300 py-4">Belum ada data...</p>
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
                           <span className="text-7xl font-serif font-black">{content.length}</span>
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
                   {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day, i) => {
                     const height = 20 + (Math.random() * 60); // Mock data for now
                     return (
                        <div key={day} className="flex flex-col items-center gap-4 group">
                           <motion.div 
                             initial={{ height: 0 }}
                             animate={{ height: `${height}%` }}
                             className="w-10 rounded-xl bg-slate-100 group-hover:bg-accent transition-all duration-500"
                           />
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{day}</span>
                        </div>
                     )
                   })}
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
