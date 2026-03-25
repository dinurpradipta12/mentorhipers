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
import AdminSidebar from "@/components/layout/AdminSidebar";

/**
 * StatCard
 */
const StatCard = ({ label, value, icon, trend, isNegative, iconBg }: any) => (
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

/**
 * InputField
 */
const InputField = ({ label, placeholder, type = "text", icon, value, onChange }: any) => (
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
      app_logo: "",
      app_favicon: ""
   });
   const [mentorProfile, setMentorProfile] = useState({
      name: "Mentor",
      avatar: ""
   });
   const [stats, setStats] = useState({
      total: { current: 0, trend: "0.0" },
      active: { current: 0, trend: "0.0" },
      completed: { current: 0, trend: "0.0" },
      avgProgress: { current: 0, trend: "0.0" }
   });

   const router = useRouter();

   // Form State
   const [formData, setFormData] = useState({
      full_name: "", niche: "", username: "", password: "",
      start_date: "", end_date: "", next_due_date: "",
      termin1: "", termin2: "", termin3: "",
      instagram: "", tiktok: "",
      color: "#4880FF",
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
      const { data: clientData, error } = await supabase
         .from("clients")
         .select("*")
         .order("created_at", { ascending: false });

      if (!error && clientData) {
         setClients(clientData);
         const thirtyDaysAgo = new Date();
         thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
         const totalCurrent = clientData.length;
         const totalPrevious = clientData.filter(c => new Date(c.created_at) < thirtyDaysAgo).length;
         const totalTrend = totalPrevious > 0 ? ((totalCurrent - totalPrevious) / totalPrevious * 100).toFixed(1) : "0.0";
         const activeMentees = clientData.filter(c => c.status !== 'Completed');
         const completedMentees = clientData.filter(c => c.status === 'Completed');
         const progressArray = clientData.map(c => {
            const tasks = c.tasks || [];
            const completed = tasks.filter((t: any) => t.status === 'Completed' || t.checked === true).length;
            return tasks.length > 0 ? (completed / tasks.length * 100) : 0;
         });
         const avgProgTotal = progressArray.length > 0 ? (progressArray.reduce((prev, curr) => prev + curr, 0) / progressArray.length) : 0;

         setStats({
            total: { current: totalCurrent, trend: totalTrend },
            active: { current: activeMentees.length, trend: (totalTrend === "0.0" ? "0.0" : (parseFloat(totalTrend) * 0.8).toFixed(1)) },
            completed: { current: completedMentees.length, trend: "0.0" },
            avgProgress: { current: Math.round(avgProgTotal), trend: "0.0" }
         });
      }

      const { data: settingsData } = await supabase.from('app_settings').select('*').eq('id', 1).single();
      if (settingsData) {
         setAppSettings({
            app_name: settingsData.app_name || "Mentorhipers",
            app_logo: settingsData.app_logo || "",
            app_favicon: settingsData.app_favicon || ""
         });
         localStorage.setItem('app_name', settingsData.app_name || "Mentorhipers");
         localStorage.setItem('app_logo', settingsData.app_logo || "");
         localStorage.setItem('app_favicon', settingsData.app_favicon || "");
      }

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

   useEffect(() => {
      const sessionStr = localStorage.getItem("mh_session");
      if (!sessionStr) { router.push("/login"); return; }
      const session = JSON.parse(sessionStr);
      if (session.role !== "admin") { router.push("/login"); return; }

      const savedSidebar = localStorage.getItem("mh_admin_sidebar");
      if (savedSidebar !== null) {
         setIsSidebarOpen(savedSidebar === "true");
      }

      const cachedName = localStorage.getItem('app_name');
      const cachedLogo = localStorage.getItem('app_logo');
      const cachedFavicon = localStorage.getItem('app_favicon');
      const cachedMentorName = localStorage.getItem('mentor_name');
      const cachedMentorAvatar = localStorage.getItem('mentor_avatar');

      if (cachedName || cachedLogo || cachedFavicon) {
         setAppSettings({
            app_name: cachedName || "Mentorhipers",
            app_logo: cachedLogo || "",
            app_favicon: cachedFavicon || ""
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
         alert("Mohon lengkapi semua data jadwal."); return;
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
      const { error } = await supabase.from("clients").update({ schedule: updatedSchedule }).eq("id", scheduleData.clientId);
      if (!error) {
         setIsScheduleModalOpen(false);
         setScheduleData({ title: "", time: "", type: "mentoring", clientId: "" });
         fetchClients();
      } else {
         alert("Gagal menambah jadwal: " + error.message);
      }
   };

   const handleDeleteSchedule = async (clientId: string, eventId: number) => {
      if (!confirm("Hapus jadwal ini?")) return;
      const client = clients.find(c => c.id === clientId);
      if (!client) return;
      const updatedSchedule = (client.schedule || []).filter((s: any) => s.id !== eventId);
      const { error } = await supabase.from("clients").update({ schedule: updatedSchedule }).eq("id", clientId);
      if (!error) { fetchClients(); }
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
      const weeks = Math.ceil(diffDays / 7);
      return `${Math.max(0, weeks)} Minggu`;
   };

   const formatDate = (dateStr: string) => {
      if (!dateStr) return "-";
      return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
   };

   return (
      <div className="min-h-screen bg-[#F5F6FA] flex overflow-x-hidden font-sans">
         <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
            * { font-family: 'Plus Jakarta Sans', sans-serif !important; }
            .no-scrollbar::-webkit-scrollbar { display: none; }
         `}</style>

         {/* ADMIN SIDEBAR */}
         <AdminSidebar isSidebarOpen={isSidebarOpen} appSettings={appSettings} />

         {/* MAIN CONTENT AREA */}
         <motion.main
            initial={false}
            animate={{
               marginLeft: isSidebarOpen ? 240 : 80,
               width: `calc(100% - ${isSidebarOpen ? 240 : 80}px)`
            }}
            transition={{ duration: isLoaded ? 0.3 : 0, ease: "easeInOut" }}
            className="flex-1 flex flex-col min-h-screen"
         >
            {/* TOP HEADER */}
            <AdminHeader isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            {/* PAGE CONTENT */}
            <div className="p-6 xl:p-10 pt-32 xl:pt-36 space-y-10">
               <div className="flex items-center justify-between">
                  <h2 className="text-[32px] font-extrabold text-[#202224] tracking-tight text-left">Dashboard</h2>
                  <div className="flex gap-4">
                     <Button 
                        onClick={() => setIsScheduleModalOpen(true)}
                        className="rounded-xl h-[48px] px-6 bg-[#4880FF]/10 text-[#4880FF] font-bold text-[13px] border border-[#4880FF]/20 hover:bg-[#4880FF] hover:text-white transition-all shadow-sm"
                     >
                        <Plus size={18} className="mr-2" /> Add Schedule
                     </Button>
                  </div>
               </div>

               {/* Stats Section */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <StatCard label="Total Mentee" value={stats.total.current.toString()} icon={<Users />} trend={stats.total.trend} iconBg="bg-[#E2EAFD] text-[#4880FF]" />
                  <StatCard label="Board Active" value={stats.active.current.toString()} icon={<Target />} trend={stats.active.trend} iconBg="bg-[#FEF4E9] text-[#FEB052]" />
                  <StatCard label="Completed" value={stats.completed.current.toString()} icon={<CheckCircle2 />} trend={stats.completed.trend} isNegative={parseFloat(stats.completed.trend) < 0} iconBg="bg-[#E6F9F6] text-[#20C997]" />
                  <StatCard label="Avg. Progress" value={`${stats.avgProgress.current}%`} icon={<TrendingUp />} trend={stats.avgProgress.trend} iconBg="bg-[#FEECEF] text-[#F93C65]" />
               </div>

               {/* Layout Grid */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  {/* LEFT: Calendar Card */}
                  <div className="lg:col-span-4 space-y-8">
                     <Card className="rounded-[20px] border-none shadow-[0px_10px_30px_rgba(0,0,0,0.02)] bg-white overflow-hidden p-8">
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
                                 <div key={i} className={`relative flex items-center justify-center h-[52px] rounded-full transition-all cursor-pointer ${isToday ? 'bg-[#4880FF] text-white shadow-lg shadow-blue-500/20' : 'hover:bg-slate-50'}`}>
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
                                    <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8FAFC] border border-transparent group hover:border-[#4880FF]/30 hover:bg-white transition-all font-sans relative">
                                       <div className={`w-[44px] h-[44px] rounded-xl flex items-center justify-center ${event.type === 'mentoring' ? 'bg-[#E6F9F6] text-[#20C997]' : 'bg-[#FEECEF] text-[#F93C65]'}`}>
                                          {event.type === 'mentoring' ? <Zap className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
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
                           <Link href="/admin/calendar">
                              <Button variant="ghost" className="w-full rounded-xl h-[56px] bg-[#F5F6FA] text-[#202224] font-bold text-[14px] hover:bg-slate-100 mt-4 transition-all">Lihat Detail Jadwal</Button>
                           </Link>
                        </div>
                     </Card>
                  </div>

                  {/* RIGHT: Mentee Boards section */}
                  <div className="lg:col-span-8 space-y-8 bg-white rounded-[20px] p-8 shadow-[0px_10px_30px_rgba(0,0,0,0.02)] text-left flex flex-col">
                     <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[24px] font-extrabold text-[#202224] tracking-tight">Active Mentee Boards</h3>
                        <Button
                           onClick={() => {
                              setEditingClientId(null);
                              setFormData({
                                 full_name: "", niche: "", username: "", password: "", start_date: "", end_date: "", next_due_date: "", termin1: "", termin2: "", termin3: "", instagram: "", tiktok: "", color: "#4880FF",
                                 enabled_features: { dashboard: true, content_plan: true, timeline: true, reports: true }
                              });
                              setIsRegisterModalOpen(true);
                           }}
                           className="rounded-xl h-[50px] px-8 bg-[#4880FF] text-white font-extrabold text-[14px] shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                        >
                           Register New Mentee
                        </Button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {clients.map(client => (
                           <motion.div key={client.id} className="relative bg-white rounded-[24px] p-8 border border-slate-100 shadow-[0px_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0px_10px_30px_rgba(0,0,0,0.04)] transition-all overflow-hidden group">
                              <div className="relative z-10 flex flex-col h-full">
                                 <div className="flex items-start justify-between mb-8">
                                    <div className="relative">
                                       <div className="w-[84px] h-[84px] rounded-full overflow-hidden border-4 border-slate-50 shadow-sm bg-slate-100">
                                          {client.profile_url ? <img src={client.profile_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-slate-300 text-3xl">MH</div>}
                                       </div>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${client.status === 'Completed' || client.status === 'Nonaktif' ? 'bg-[#FEECEF] text-[#F93C65]' : 'bg-[#E6F9F6] text-[#20C997]'}`}>
                                       {client.status || "Aktif"}
                                    </div>
                                 </div>

                                 <div className="mb-6 space-y-1">
                                    <h4 className="text-[20px] font-extrabold text-[#202224] leading-tight">{client.full_name}</h4>
                                    <p className="text-[13px] font-bold text-[#4880FF]">{client.niche || "Mentee"}</p>
                                 </div>

                                 <div className="space-y-4 mb-8 bg-slate-50/50 p-6 rounded-2xl border border-slate-100/50">
                                    <div className="space-y-2">
                                       <p className="text-[10px] font-black text-[#202224] opacity-30 uppercase tracking-[0.2em]">Mentoring Period</p>
                                       <p className="text-[13px] font-extrabold text-[#202224] text-left">{formatDate(client.start_date)} — {formatDate(client.end_date)}</p>
                                       <span className="text-[11px] font-bold text-[#4880FF] text-left inline-flex items-center gap-2">
                                          <span className="w-1.5 h-1.5 rounded-full bg-[#4880FF] animate-pulse inline-block" />
                                          {calculateRemainingWeeks(client.end_date)} tersisa
                                       </span>
                                    </div>
                                 </div>

                                 <div className="flex items-center gap-3 mt-auto">
                                    <Link href={`/board/${client.id}?admin=true`} className="flex-[2] h-[52px] bg-[#4880FF] text-white rounded-[16px] text-[13px] font-extrabold flex items-center justify-center shadow-lg shadow-blue-500/10 active:scale-95 transition-all">
                                       Lihat Board
                                    </Link>
                                    <button onClick={() => handleEditClick(client)} className="flex-[1.2] h-[52px] bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-[16px] text-[13px] font-bold transition-all">
                                       Edit
                                    </button>
                                    <button 
                                       onClick={(e) => copyToClipboard(client.id, e)} 
                                       className={`flex-1 h-[52px] ${copiedId === client.id ? 'bg-[#20C997] text-white' : 'bg-[#20C997]/10 text-[#20C997]'} hover:bg-[#20C997] hover:text-white rounded-[16px] text-[13px] font-bold flex items-center justify-center transition-all active:scale-95`}
                                       title="Copy Board Link"
                                    >
                                       {copiedId === client.id ? <Check size={18} /> : <span>Share</span>}
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
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsRegisterModalOpen(false)} className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" />
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-4xl bg-white rounded-[20px] shadow-2xl p-10 overflow-hidden flex flex-col max-h-[90vh]">
                     <div className="flex justify-between items-center mb-10">
                        <h3 className="text-[24px] font-bold text-[#202224]">{editingClientId ? "Update Mentee" : "Register New Mentee"}</h3>
                        <button onClick={() => setIsRegisterModalOpen(false)} className="w-10 h-10 rounded-full bg-[#F5F6FA] flex items-center justify-center text-[#202224] hover:bg-rose-50 hover:text-rose-500 transition-all"><X className="w-5 h-5" /></button>
                     </div>

                     <div className="flex-1 overflow-y-auto space-y-10 no-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                           <InputField label="Full Name" placeholder="Jessica Alvera" value={formData.full_name} onChange={(val: string) => setFormData({ ...formData, full_name: val })} />
                           <InputField label="Niche / Business" placeholder="Fashion & Lifestyle" value={formData.niche} onChange={(val: string) => setFormData({ ...formData, niche: val })} />
                           <InputField label="Portal Username" placeholder="jessica_alvera" value={formData.username} onChange={(val: string) => setFormData({ ...formData, username: val })} />
                           <InputField label="Portal Password" type="password" placeholder="••••••••" value={formData.password} onChange={(val: string) => setFormData({ ...formData, password: val })} />
                           <InputField label="Mentoring Start" type="date" value={formData.start_date} onChange={(val: string) => setFormData({ ...formData, start_date: val })} />
                           <InputField label="Mentoring End" type="date" value={formData.end_date} onChange={(val: string) => setFormData({ ...formData, end_date: val })} />
                           <div className="space-y-2">
                              <label className="text-[12px] font-bold text-[#202224] opacity-60 ml-2">Calendar Color</label>
                              <div className="flex items-center gap-4 h-14 rounded-xl bg-[#F5F6FA] border border-[#D5D5D5] px-6">
                                 <input type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="w-8 h-8 rounded-md border-none cursor-pointer" />
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
                                    { id: 'mentoring', label: 'Mentoring Only', icon: <User size={14} />, features: { dashboard: true, content_plan: false, timeline: true, reports: false } },
                                    { id: 'handling', label: 'Handling Only', icon: <Plus size={14} />, features: { dashboard: true, content_plan: true, timeline: false, reports: true } }
                                 ].map(pkg => (
                                    <button
                                       key={pkg.id}
                                       onClick={() => setFormData({ ...formData, enabled_features: pkg.features })}
                                       className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${JSON.stringify(formData.enabled_features) === JSON.stringify(pkg.features)
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
                                 Manual Feature Control
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

                     <Button onClick={handleRegisterClient} className="mt-10 w-full h-[60px] rounded-xl bg-[#4880FF] text-white font-bold text-[16px] shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
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
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsScheduleModalOpen(false)} className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" />
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-[20px] shadow-2xl p-10 flex flex-col">
                     <div className="flex justify-between items-center mb-10">
                        <h3 className="text-[20px] font-extrabold text-[#202224]">Buat Jadwal Baru</h3>
                        <button onClick={() => setIsScheduleModalOpen(false)} className="w-10 h-10 rounded-full bg-[#F5F6FA] flex items-center justify-center text-[#202224] hover:bg-rose-50 hover:text-rose-500 transition-all"><X className="w-5 h-5" /></button>
                     </div>

                     <div className="space-y-6 text-left">
                        <div className="space-y-2">
                           <label className="text-[12px] font-bold text-[#202224] opacity-60 ml-2">Pilih Client</label>
                           <select value={scheduleData.clientId} onChange={(e) => setScheduleData({ ...scheduleData, clientId: e.target.value })} className="w-full h-14 rounded-xl bg-[#F5F6FA] border border-[#D5D5D5] px-6 font-bold text-sm focus:outline-none focus:ring-1 ring-[#4880FF]">
                              <option value="">-- Pilih Mentee --</option>
                              {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                           </select>
                        </div>
                        <InputField label="Judul Kegiatan" placeholder="Zoom Mentoring #2" value={scheduleData.title} onChange={(val: string) => setScheduleData({ ...scheduleData, title: val })} />
                        <div className="grid grid-cols-2 gap-4">
                           <InputField label="Waktu / Tanggal" type="datetime-local" value={scheduleData.time} onChange={(val: string) => setScheduleData({ ...scheduleData, time: val })} />
                           <div className="space-y-2">
                              <label className="text-[12px] font-bold text-[#202224] opacity-60 ml-2">Tipe</label>
                              <select value={scheduleData.type} onChange={(e) => setScheduleData({ ...scheduleData, type: e.target.value })} className="w-full h-14 rounded-xl bg-[#F5F6FA] border border-[#D5D5D5] px-6 font-bold text-sm focus:outline-none">
                                 <option value="mentoring">Mentoring</option>
                                 <option value="task">Tugas</option>
                                 <option value="offline">Offline</option>
                              </select>
                           </div>
                        </div>
                     </div>
                     <Button onClick={handleAddSchedule} className="mt-10 w-full h-[60px] rounded-xl bg-[#4880FF] text-white font-bold text-[16px] shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Simpan Jadwal</Button>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
         <NotificationCenterAdmin />
      </div>
   );
}
