"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Settings, 
  Plus, 
  Search, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  Calendar,
  User,
  X,
  Check,
  Target,
  ChevronLeft,
  ChevronRight,
  Inbox,
  LogOut,
  LayoutDashboard,
  FileText,
  Star,
  Trash2,
  Zap,
  Menu
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/Badge";
import NotificationCenterAdmin from "@/components/layout/NotificationCenterAdmin";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/layout/AdminHeader";

// --- Components ---

interface AdminNavItemProps {
  label: string;
  icon: React.ReactElement;
  active?: boolean;
  href?: string;
  collapsed?: boolean;
}

const AdminNavItem = ({ label, icon, active = false, href = "#", collapsed = false }: AdminNavItemProps) => (
  <Link href={href} className={`w-full flex items-center gap-4 px-8 py-5 transition-all duration-300 ${
    active 
      ? "bg-[#4880FF] text-white" 
      : "text-[#202224] opacity-50 hover:opacity-100 hover:bg-slate-50 font-medium"
  } ${collapsed ? "justify-center px-0" : ""}`}>
    <div className={`transition-colors duration-300 ${active ? "text-white" : "text-slate-400"}`}>
       {React.cloneElement(icon, { size: 18 } as any)}
    </div>
    {!collapsed && <span className="text-[14px] font-bold tracking-tight">{label}</span>}
  </Link>
);

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactElement;
  trend: string;
  isNegative?: boolean;
  iconBg: string;
}

const StatCard = ({ label, value, icon, trend, isNegative, iconBg }: StatCardProps) => (
  <Card className="p-8 bg-white border-none shadow-[0px_10px_30px_rgba(0,0,0,0.02)] rounded-[14px] relative group hover:shadow-[0px_10px_40px_rgba(0,0,0,0.06)] transition-all duration-500">
    <div className="flex justify-between items-start mb-6">
      <div className="space-y-1 text-left">
        <p className="text-[14px] font-bold text-[#202224] opacity-60 tracking-tight">{label}</p>
        <h4 className="text-[28px] font-bold text-[#202224] tracking-tight">{value}</h4>
      </div>
      <div className={`w-[60px] h-[60px] rounded-[22px] ${iconBg} flex items-center justify-center`}>
         {React.cloneElement(icon, { size: 28 } as any)}
      </div>
    </div>
    <div className="flex items-center gap-2">
       <div className="flex items-center">
          {isNegative ? (
             <TrendingUp className="w-4 h-4 text-[#F93C65] rotate-180" />
          ) : (
             <TrendingUp className="w-4 h-4 text-[#00B69B]" />
          )}
          <span className={`text-[14px] font-bold ml-1 ${isNegative ? 'text-[#F93C65]' : 'text-[#00B69B]'}`}>{trend}%</span>
       </div>
       <span className="text-[14px] font-bold text-[#202224] opacity-40">dari bulan lalu</span>
    </div>
  </Card>
);

interface InputFieldProps {
  label: string;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (val: string) => void;
}

const InputField = ({ label, placeholder, type = "text", icon, value, onChange }: InputFieldProps) => (
  <div className="space-y-2 text-left">
    <label className="text-[12px] font-bold text-[#202224] opacity-60 ml-2">{label}</label>
    <div className="relative">
      {icon && (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">
          {icon}
        </div>
      )}
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-14 rounded-xl bg-[#F5F6FA] border border-[#D5D5D5] flex items-center ${icon ? "pl-12 pr-6" : "px-6"} font-bold text-sm focus:outline-none focus:ring-2 ring-blue-500/20 placeholder:text-slate-300 transition-all`}
        placeholder={placeholder}
      />
    </div>
  </div>
);

export default function AdminDashboardV2() {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [appSettings, setAppSettings] = useState({
    app_name: "Mentorhipers",
    app_logo: ""
  });
  const [mentorProfile, setMentorProfile] = useState({
    name: "Mentor",
    avatar: ""
  });

  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    full_name: "", niche: "", username: "", password: "",
    start_date: "", end_date: "", next_due_date: "",
    termin1: "", termin2: "", termin3: "",
    instagram: "", tiktok: "",
    color: "#4880FF", // Default blue
    enabled_features: {
      dashboard: true,
      content_plan: true,
      timeline: true,
      reports: true
    }
  });

  const [scheduleData, setScheduleData] = useState({
    title: "",
    time: "",
    type: "mentoring",
    clientId: ""
  });

  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  const fetchClients = async () => {
    setIsLoading(true);
    // Fetch Clients
    const { data: clientData, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setClients(clientData || []);

    // Fetch Global App Settings
    const { data: settingsData } = await supabase.from('app_settings').select('*').eq('id', 1).single();
    if (settingsData) {
      setAppSettings({
        app_name: settingsData.app_name || "Mentorhipers",
        app_logo: settingsData.app_logo || "",
      });
    }

    // Fetch Mentor Profile
    const { data: mentorData } = await supabase.from('mentor_profile').select('name, avatar').eq('id', 1).single();
    if (mentorData) {
      setMentorProfile({
        name: mentorData.name || "Mentor",
        avatar: mentorData.avatar || ""
      });
      localStorage.setItem('mentor_name', mentorData.name || "");
      localStorage.setItem('mentor_avatar', mentorData.avatar || "");
    }

    setIsLoading(false);
    setIsLoaded(true);
  };
  
  const handleDeleteSchedule = async (clientId: string, eventId: number) => {
    if (!confirm("Hapus jadwal ini?")) return;
    
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const updatedSchedule = (client.schedule || []).filter((s: any) => s.id !== eventId);

    const { error } = await supabase
      .from("clients")
      .update({ schedule: updatedSchedule })
      .eq("id", clientId);

    if (!error) {
      fetchClients();
    } else {
      alert("Gagal menghapus: " + error.message);
    }
  };

  useEffect(() => {
    const sessionStr = localStorage.getItem("mh_session");
    if (!sessionStr) { router.push("/login"); return; }
    const session = JSON.parse(sessionStr);
    if (session.role !== "admin") { router.push("/login"); return; }

    // Sidebar Persistence
    const savedSidebar = localStorage.getItem("mh_admin_sidebar");
    if (savedSidebar !== null) {
       setIsSidebarOpen(savedSidebar === "true");
    }

    // Load Branding Cache
    const cachedName = localStorage.getItem('app_name');
    const cachedLogo = localStorage.getItem('app_logo');
    const cachedMentorName = localStorage.getItem('mentor_name');
    const cachedMentorAvatar = localStorage.getItem('mentor_avatar');

    if (cachedName || cachedLogo) {
      setAppSettings({
        app_name: cachedName || "Mentorhipers",
        app_logo: cachedLogo || ""
      });
    }

    if (cachedMentorName || cachedMentorAvatar) {
      setMentorProfile({
        name: cachedMentorName || "Mentor",
        avatar: cachedMentorAvatar || ""
      });
    }

    setIsLoaded(true);
    fetchClients();
  }, [router]);

  const toggleSidebar = () => {
     const newState = !isSidebarOpen;
     setIsSidebarOpen(newState);
     localStorage.setItem("mh_admin_sidebar", newState.toString());
  };

  const handleRegisterClient = async () => {
    const payload = {
      full_name: formData.full_name, 
      niche: formData.niche, 
      username: formData.username, 
      password: formData.password,
      start_date: formData.start_date || null, 
      end_date: formData.end_date || null, 
      next_due_date: formData.next_due_date || null,
      payment_data: { 
        termin1: formData.termin1 || null, 
        termin2: formData.termin2 || null, 
        termin3: formData.termin3 || null 
      },
      social_media: { 
        instagram: formData.instagram || "", 
        tiktok: formData.tiktok || "" 
      },
      color: formData.color,
      enabled_features: formData.enabled_features
    };

    let error;
    if (editingClientId) {
      const { error: updateError } = await supabase.from("clients").update(payload).eq("id", editingClientId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from("clients").insert([payload]);
      error = insertError;
    }

    if (!error) {
       setIsRegisterModalOpen(false); setEditingClientId(null); fetchClients();
       setFormData({ 
          full_name: "", niche: "", username: "", password: "", start_date: "", end_date: "", next_due_date: "", termin1: "", termin2: "", termin3: "", instagram: "", tiktok: "", color: "#4880FF",
          enabled_features: { dashboard: true, content_plan: true, timeline: true, reports: true }
        });
    } else {
       alert("Error saving: " + error.message);
    }
  };

  const handleAddSchedule = async () => {
    if (!scheduleData.clientId || !scheduleData.title || !scheduleData.time) {
      alert("Mohon lengkapi semua data jadwal.");
      return;
    }

    const selectedClient = clients.find(c => c.id === scheduleData.clientId);
    if (!selectedClient) return;

    const newEvent = {
       id: Date.now(),
       title: scheduleData.title,
       time: scheduleData.time,
       type: scheduleData.type,
       status: "upcoming"
    };

    const updatedSchedule = [...(selectedClient.schedule || []), newEvent];

    const { error } = await supabase
      .from("clients")
      .update({ schedule: updatedSchedule })
      .eq("id", scheduleData.clientId);

    if (!error) {
      setIsScheduleModalOpen(false);
      setScheduleData({ title: "", time: "", type: "mentoring", clientId: "" });
      fetchClients();
    } else {
      alert("Gagal menambah jadwal: " + error.message);
    }
  };

  const handleEditClick = (client: any) => {
    setEditingClientId(client.id);
    setFormData({
      full_name: client.full_name || "", niche: client.niche || "", username: client.username || "", password: client.password || "",
      start_date: client.start_date || "", end_date: client.end_date || "", next_due_date: client.next_due_date || "",
      termin1: client.payment_data?.termin1 || "", termin2: client.payment_data?.termin2 || "", termin3: client.payment_data?.termin3 || "",
      instagram: client.social_media?.instagram || "", tiktok: client.social_media?.tiktok || "",
      color: client.color || "#4880FF",
      enabled_features: client.enabled_features || { dashboard: true, content_plan: true, timeline: true, reports: true }
    });
    setIsRegisterModalOpen(true);
  };

  const copyToClipboard = (id: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const url = `${window.location.origin}/board/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id); setTimeout(() => setCopiedId(null), 2000);
  };

  const calculateRemainingWeeks = (endDate: string) => {
    if (!endDate) return "0 Minggu";
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${Math.max(0, Math.ceil(diffDays / 7))} Minggu`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex overflow-x-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif !important; }
        .bg-topo {
           background-image: url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 20 Q 50 10 90 20 T 170 20 T 250 20 T 330 20 T 410 20' fill='none' stroke='%23E0E0E0' stroke-width='0.5'/%3E%3Cpath d='M10 50 Q 50 40 90 50 T 170 50 T 250 50 T 330 50 T 410 50' fill='none' stroke='%23E0E0E0' stroke-width='0.5'/%3E%3C/svg%3E");
           background-size: cover; opacity: 0.1;
        }
      `}</style>

      {/* SIDEBAR */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 240 : 80 }}
        transition={{ duration: isLoaded ? 0.3 : 0, ease: "easeInOut" }}
        className="fixed left-0 top-0 bottom-0 bg-white border-r border-[#E0E0E0] flex flex-col z-50 shadow-sm overflow-hidden"
      >
        <div className="h-[100px] flex items-center justify-center mb-4 mt-2 transition-all overflow-hidden px-5">
           {isSidebarOpen ? (
             <div className="w-full h-full flex items-center justify-center">
                {appSettings.app_logo ? (
                  <img src={appSettings.app_logo} className="w-[180px] h-full max-h-[64px] object-contain" alt="Admin Logo" />
                ) : (
                  <h1 className="text-[20px] font-extrabold text-[#202224] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis flex items-center">
                     Admin<span className="text-[#4880FF]">Stack</span>
                  </h1>
                )}
             </div>
           ) : (
             <div className="w-10 h-10 rounded-xl bg-[#4880FF] flex items-center justify-center text-white font-black text-xl shrink-0">
                {appSettings.app_name ? appSettings.app_name.charAt(0).toUpperCase() : "A"}
             </div>
           )}
        </div>

        <nav className="flex flex-col flex-1">
           <AdminNavItem label="Dashboard" icon={<LayoutDashboard />} active href="/admin/dashboard" collapsed={!isSidebarOpen} />
           <AdminNavItem label="Calendar" icon={<Calendar />} href="/admin/calendar" collapsed={!isSidebarOpen} />
           <AdminNavItem label="Mentee Monitoring" icon={<Users />} href="/admin/mentor" collapsed={!isSidebarOpen} />
           <AdminNavItem label="Goals Control" icon={<Target />} href="/admin/goals" collapsed={!isSidebarOpen} />
           <AdminNavItem label="Mentor Profile" icon={<User />} href="/admin/profile" collapsed={!isSidebarOpen} />
           <AdminNavItem label="Invoice" icon={<FileText />} href="#" collapsed={!isSidebarOpen} />
           
           <div className="mt-auto mb-10 space-y-2">
              <AdminNavItem label="App Settings" icon={<Settings />} href="/admin/settings" collapsed={!isSidebarOpen} />
              <AdminNavItem label="Logout" icon={<LogOut />} href="/login" collapsed={!isSidebarOpen} />
           </div>
        </nav>
      </motion.aside>

      {/* MAIN CONTENT AREA */}
      <motion.main 
        initial={false}
        animate={{ 
          marginLeft: isSidebarOpen ? 240 : 80,
          width: `calc(100% - ${isSidebarOpen ? 240 : 80}px)`
        }}
        transition={{ duration: isLoaded ? 0.3 : 0, ease: "easeInOut" }}
        className="flex-1 flex flex-col min-h-screen font-sans"
      >
        {/* TOP HEADER */}
        <AdminHeader isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        {/* PAGE CONTENT */}
        <div className="p-6 xl:p-10 space-y-10">
           <div>
              <h2 className="text-[32px] font-extrabold text-[#202224] tracking-tight text-left">Dashboard</h2>
           </div>

           {/* Stats Section */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <StatCard label="Total Mentee" value={clients.length.toString()} icon={<Users />} trend="8.5" iconBg="bg-[#E2EAFD] text-[#4880FF]" />
              <StatCard label="Board Active" value={clients.filter(c => c.status !== 'Completed').length.toString()} icon={<Target />} trend="1.3" iconBg="bg-[#FEF4E9] text-[#FEB052]" />
              <StatCard label="Completed" value={clients.filter(c => c.status === 'Completed').length.toString()} icon={<CheckCircle2 />} trend="4.3" isNegative iconBg="bg-[#E6F9F6] text-[#20C997]" />
              <StatCard label="Avg. Progress" value="35%" icon={<TrendingUp />} trend="1.8" iconBg="bg-[#FEECEF] text-[#F93C65]" />
           </div>

           {/* Layout Grid */}
           <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
              {/* LEFT: Calendar Card */}
              <div className="xl:col-span-4 lg:col-span-12 space-y-8">
                 <Card className="rounded-[14px] border-none shadow-[0px_10px_30px_rgba(0,0,0,0.02)] bg-white overflow-hidden p-8">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-[18px] font-extrabold text-[#202224] capitalize">
                         {currentCalendarDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                       </h3>
                       <div className="flex gap-2">
                          <button 
                            onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1))}
                            className="w-[32px] h-[32px] rounded-lg bg-[#F5F6FA] flex items-center justify-center text-[#202224] opacity-60 hover:opacity-100 transition-all font-bold"
                          >
                           <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1))}
                            className="w-[32px] h-[32px] rounded-lg bg-[#F5F6FA] flex items-center justify-center text-[#202224] opacity-60 hover:opacity-100 transition-all font-bold"
                          >
                           <ChevronRight className="w-4 h-4" />
                          </button>
                       </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center mb-6 font-bold">
                       {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                          <span key={`${d}-${i}`} className="text-[12px] text-[#202224] opacity-30 py-2">{d}</span>
                       ))}
                       
                       {Array.from({ length: new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), 1).getDay() }).map((_, i) => (
                         <div key={`empty-${i}`} className="h-[52px]" />
                       ))}

                       {Array.from({ length: new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 0).getDate() }, (_, i) => {
                          const day = i + 1;
                          const today = new Date();
                          const isToday = today.getDate() === day && today.getMonth() === currentCalendarDate.getMonth() && today.getFullYear() === currentCalendarDate.getFullYear();
                          
                          const hasEvent = clients.some(c => (c.schedule || []).some((s: any) => {
                             const eventDate = new Date(s.time);
                             return eventDate.getDate() === day && eventDate.getMonth() === currentCalendarDate.getMonth() && eventDate.getFullYear() === currentCalendarDate.getFullYear();
                          }));

                          return (
                             <div key={i} className={`relative flex items-center justify-center h-[52px] rounded-full transition-all cursor-pointer ${isToday ? 'bg-[#4880FF] text-white' : 'hover:bg-slate-50'}`}>
                                <span className={`text-[14px] font-bold ${isToday ? 'text-white' : 'text-[#202224]'}`}>{day}</span>
                                {hasEvent && <div className={`absolute bottom-2 w-[6px] h-[6px] rounded-full ${isToday ? 'bg-white' : 'bg-[#4880FF]'}`} />}
                             </div>
                          );
                       })}
                    </div>

                    <div className="mt-8 pt-8 border-t border-[#F5F6FA] space-y-6 text-left">
                       <div className="flex items-center justify-between">
                          <p className="text-[12px] font-extrabold text-[#202224] opacity-40 uppercase tracking-[0.1em]">Upcoming Task & Event</p>
                          <button onClick={() => setIsScheduleModalOpen(true)} className="p-2 rounded-lg bg-[#4880FF]/10 text-[#4880FF] hover:bg-[#4880FF]/20 transition-all font-sans"><Plus size={16} /></button>
                       </div>
                       <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
                          {clients.flatMap(c => (c.schedule || []).map((s: any) => ({ ...s, clientName: c.full_name, clientId: c.id })))
                           .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
                           .slice(0, 10)
                           .map((event: any, idx: number) => (
                             <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-[#F5F6FA] group hover:border-[#4880FF]/30 transition-all font-sans relative">
                                <div className={`w-[44px] h-[44px] rounded-xl flex items-center justify-center ${event.type === 'mentoring' ? 'bg-[#E6F9F6] text-[#20C997]' : 'bg-[#FEECEF] text-[#F93C65]'}`}>
                                   {event.type === 'mentoring' ? <Zap className="w-5 h-5 text-[#20C997]" /> : <Calendar className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 overflow-hidden pr-8">
                                   <p className="text-[14px] font-extrabold text-[#202224] truncate">{event.title}</p>
                                   <p className="text-[11px] text-[#202224] opacity-40 font-bold">
                                     {new Date(event.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • {event.clientName}
                                   </p>
                                 </div>
                                <button onClick={() => handleDeleteSchedule(event.clientId, event.id)} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-rose-300 hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
                             </div>
                          ))}
                       </div>
                       <Button className="w-full rounded-xl h-[56px] bg-[#4880FF] text-white font-bold text-[14px]">Lihat Detail Jadwal</Button>
                    </div>
                 </Card>
              </div>

              {/* RIGHT: Mentee Boards section */}
              <div className="xl:col-span-8 lg:col-span-12 space-y-8 bg-white rounded-[14px] p-6 xl:p-10 shadow-[0px_10px_30px_rgba(0,0,0,0.02)] text-left">
                 <div className="flex items-center justify-between mb-10">
                    <h3 className="text-[28px] font-extrabold text-[#202224] tracking-tight">Active Mentee Boards</h3>
                    <Button 
                      onClick={() => {
                        setEditingClientId(null);
                        setFormData({ 
                           full_name: "", niche: "", username: "", password: "", start_date: "", end_date: "", next_due_date: "", termin1: "", termin2: "", termin3: "", instagram: "", tiktok: "", color: "#4880FF",
                           enabled_features: { dashboard: true, content_plan: true, timeline: true, reports: true }
                        });
                        setIsRegisterModalOpen(true);
                      }} 
                      className="rounded-lg h-[46px] px-8 bg-[#4880FF] text-white font-bold text-[14px]"
                    >
                      Register New Mentee
                    </Button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {clients.map(client => (
                       <motion.div key={client.id} className="relative bg-white rounded-[32px] p-8 border border-[#F5F6FA] shadow-[0px_10px_40px_rgba(0,0,0,0.03)] overflow-hidden">
                          <div className="absolute inset-0 bg-topo z-0" />
                          <div className="relative z-10 flex flex-col h-full">
                             <div className="flex items-start justify-between mb-8">
                                <div className="relative">
                                   <div className="w-[80px] h-[80px] rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-100">
                                      {client.profile_url ? <img src={client.profile_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-blue-100 text-3xl">MH</div>}
                                   </div>
                                </div>
                                <div className={`px-4 py-1.5 rounded-lg text-[11px] font-bold tracking-tight ${client.status === 'Completed' || client.status === 'Nonaktif' ? 'bg-[#FEECEF] text-[#F93C65]' : 'bg-[#E6F9F6] text-[#20C997]'}`}>
                                   Mentoring {client.status || "Aktif"}
                                </div>
                             </div>

                             <div className="mb-6 space-y-1">
                                <h4 className="text-[22px] font-extrabold text-[#202224] leading-tight underline decoration-blue-500/10">{client.full_name}</h4>
                                <p className="text-[14px] font-bold text-[#202224] opacity-40">{client.niche || "Social Media Specialist"}</p>
                             </div>

                             <div className="space-y-4 mb-8">
                                <div className="space-y-1">
                                   <p className="text-[11px] font-bold text-[#202224] opacity-30 uppercase tracking-widest">Periode Mentoring</p>
                                   <p className="text-[14px] font-bold text-[#202224] text-left">{formatDate(client.start_date)} - {formatDate(client.end_date)}</p>
                                   <p className="text-[12px] font-bold text-[#202224] opacity-30 text-left">Tersisa {calculateRemainingWeeks(client.end_date)} Waktu Mentoring</p>
                                </div>
                             </div>

                             <div className="flex items-center gap-3 mt-auto">
                                <Link href={`/board/${client.id}?admin=true`} className="flex-[2] h-[48px] bg-[#4880FF] text-white rounded-[14px] text-[13px] font-bold flex items-center justify-center">
                                   Lihat board
                                </Link>
                                <button onClick={() => handleEditClick(client)} className="flex-[1.5] h-[48px] bg-[#F5F6FA] text-[#202224] rounded-[14px] text-[13px] font-bold">
                                   Edit
                                </button>
                                <button onClick={(e) => copyToClipboard(client.id, e)} className="flex-1 h-[48px] bg-[#20C997]/10 text-[#20C997] rounded-[14px] text-[13px] font-bold flex items-center justify-center transition-all active:scale-95">
                                   {copiedId === client.id ? <Check size={18} /> : "Share"}
                                </button>
                             </div>
                          </div>
                       </motion.div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </motion.main>

      {/* REGISTRATION MODAL */}
      <AnimatePresence>
        {isRegisterModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsRegisterModalOpen(false)} className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-4xl bg-white rounded-[20px] shadow-2xl p-10 overflow-hidden flex flex-col max-h-[90vh]">
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-[24px] font-bold text-[#202224]">{editingClientId ? "Update Mentee" : "Register New Mentee"}</h3>
                  <button onClick={() => setIsRegisterModalOpen(false)} className="w-10 h-10 rounded-full bg-[#F5F6FA] flex items-center justify-center text-[#202224]"><X className="w-5 h-5" /></button>
               </div>
               
               <div className="flex-1 overflow-y-auto space-y-10 no-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <InputField label="Full Name" placeholder="Jessica Alvera" value={formData.full_name} onChange={(val: string) => setFormData({...formData, full_name: val})} />
                    <InputField label="Niche / Business" placeholder="Fashion & Lifestyle" value={formData.niche} onChange={(val: string) => setFormData({...formData, niche: val})} />
                    <InputField label="Portal Username" placeholder="jessica_alvera" value={formData.username} onChange={(val: string) => setFormData({...formData, username: val})} />
                    <InputField label="Portal Password" type="password" placeholder="••••••••" value={formData.password} onChange={(val: string) => setFormData({...formData, password: val})} />
                    <InputField label="Mentoring Start" type="date" value={formData.start_date} onChange={(val: string) => setFormData({...formData, start_date: val})} />
                    <InputField label="Mentoring End" type="date" value={formData.end_date} onChange={(val: string) => setFormData({...formData, end_date: val})} />
                    <div className="space-y-2">
                       <label className="text-[12px] font-bold text-[#202224] opacity-60 ml-2">Calendar Color</label>
                       <div className="flex items-center gap-4 h-14 rounded-xl bg-[#F5F6FA] border border-[#D5D5D5] px-6">
                          <input type="color" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} className="w-8 h-8 rounded-md border-none cursor-pointer" />
                          <span className="text-sm font-bold opacity-40 uppercase">{formData.color}</span>
                       </div>
                    </div>
                         <div className="md:col-span-2 space-y-4">
                       <label className="text-[14px] font-extrabold text-[#202224] flex items-center gap-2">
                          <Zap className="w-4 h-4 text-[#4880FF]" /> Service Package Template
                       </label>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                             { id: 'full', label: 'Full Mentoring & Handling', icon: <Zap size={14} />, features: { dashboard: true, content_plan: true, timeline: true, reports: true } },
                             { id: 'mentoring', label: 'Mentoring Only', icon: <User size={14} />, features: { dashboard: true, content_plan: false, timeline: true, reports: false } }, // Mentoring: Hide Stats (reports)
                             { id: 'handling', label: 'Handling Only', icon: <Plus size={14} />, features: { dashboard: true, content_plan: true, timeline: false, reports: true } } // Handling: Hide Timeline (roadmap)
                          ].map(pkg => (

                             <button
                                key={pkg.id}
                                onClick={() => setFormData({ ...formData, enabled_features: pkg.features })}
                                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                                   JSON.stringify(formData.enabled_features) === JSON.stringify(pkg.features)
                                   ? "bg-[#4880FF]/10 border-[#4880FF] text-[#4880FF]"
                                   : "bg-white border-slate-100 text-slate-400 opacity-60 hover:opacity-100"
                                }`}
                             >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${JSON.stringify(formData.enabled_features) === JSON.stringify(pkg.features) ? 'bg-[#4880FF] text-white shadow-lg shadow-[#4880FF]/30' : 'bg-slate-50'}`}>
                                   {pkg.icon}
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-tight">{pkg.label}</span>
                             </button>
                          ))}
                       </div>
                    </div>

                    <div className="md:col-span-2 p-8 rounded-[2rem] bg-[#F5F6FA] border-2 border-dashed border-[#D5D5D5]/50 space-y-6">
                        <label className="text-[12px] font-black uppercase tracking-[0.2em] text-[#202224] opacity-30 flex items-center gap-2">
                           Module Access Control (Review & Manual Adjust)
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           {[
                              { id: 'dashboard', label: 'Dashboard' },
                              { id: 'content_plan', label: 'Content Plan' },
                              { id: 'timeline', label: 'Timeline' },
                              { id: 'reports', label: 'Account Stats' }
                           ].map(feature => (
                              <label key={feature.id} className="group flex items-center gap-3 p-4 rounded-2xl bg-white border border-transparent shadow-sm cursor-pointer hover:border-[#4880FF] transition-all relative overflow-hidden">
                                 {formData.enabled_features[feature.id as keyof typeof formData.enabled_features] && (
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#4880FF]" />
                                 )}
                                 <input
                                    type="checkbox"
                                    checked={formData.enabled_features[feature.id as keyof typeof formData.enabled_features]}
                                    onChange={(e) => setFormData({
                                       ...formData,
                                       enabled_features: {
                                          ...formData.enabled_features,
                                          [feature.id]: e.target.checked
                                       }
                                    })}
                                    className="w-5 h-5 accent-[#4880FF] relative z-10"
                                 />
                                 <span className={`text-xs font-bold relative z-10 transition-colors ${formData.enabled_features[feature.id as keyof typeof formData.enabled_features] ? 'text-[#202224]' : 'text-slate-400'}`}>{feature.label}</span>
                              </label>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>

               <Button onClick={handleRegisterClient} className="mt-10 w-full h-[60px] rounded-xl bg-[#4880FF] text-white font-bold text-[16px]">
                  {editingClientId ? "Update Mentee Data" : "Initialize Mentee Board"}
               </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SCHEDULE MODAL */}
      <AnimatePresence>
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsScheduleModalOpen(false)} className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-[20px] shadow-2xl p-10 flex flex-col">
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-[20px] font-extrabold text-[#202224]">Buat Jadwal Baru</h3>
                  <button onClick={() => setIsScheduleModalOpen(false)} className="w-10 h-10 rounded-full bg-[#F5F6FA] flex items-center justify-center text-[#202224]"><X className="w-5 h-5" /></button>
               </div>
               
               <div className="space-y-6 text-left">
                  <div className="space-y-2">
                     <label className="text-[12px] font-bold text-[#202224] opacity-60 ml-2">Pilih Client</label>
                     <select value={scheduleData.clientId} onChange={(e) => setScheduleData({...scheduleData, clientId: e.target.value})} className="w-full h-14 rounded-xl bg-[#F5F6FA] border border-[#D5D5D5] px-6 font-bold text-sm focus:outline-none">
                        <option value="">-- Pilih Mentee --</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                     </select>
                  </div>
                  <InputField label="Judul Kegiatan" placeholder="Zoom Mentoring #2" value={scheduleData.title} onChange={(val: string) => setScheduleData({...scheduleData, title: val})} />
                  <div className="grid grid-cols-2 gap-4">
                     <InputField label="Waktu / Tanggal" type="datetime-local" value={scheduleData.time} onChange={(val: string) => setScheduleData({...scheduleData, time: val})} />
                     <div className="space-y-2">
                        <label className="text-[12px] font-bold text-[#202224] opacity-60 ml-2">Tipe</label>
                        <select value={scheduleData.type} onChange={(e) => setScheduleData({...scheduleData, type: e.target.value})} className="w-full h-14 rounded-xl bg-[#F5F6FA] border border-[#D5D5D5] px-6 font-bold text-sm focus:outline-none">
                           <option value="mentoring">Mentoring</option>
                           <option value="task">Tugas</option>
                           <option value="offline">Offline</option>
                        </select>
                     </div>
                  </div>
               </div>
               <Button onClick={handleAddSchedule} className="mt-10 w-full h-[60px] rounded-xl bg-[#4880FF] text-white font-bold text-[16px]">Simpan Jadwal</Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <NotificationCenterAdmin />
    </div>
  );
}
