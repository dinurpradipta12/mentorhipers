"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Settings, 
  Plus, 
  Search, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  FileText,
  Trash2,
  X,
  Clock,
  User,
  Target
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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

interface InputFieldProps {
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
}

const InputField = ({ label, placeholder, type = "text", value, onChange }: InputFieldProps) => (
  <div className="space-y-2 text-left">
    <label className="text-[12px] font-bold text-[#202224] opacity-60 ml-2">{label}</label>
    <input 
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-14 rounded-xl bg-[#F5F6FA] border border-[#D5D5D5] px-6 font-bold text-sm focus:outline-none focus:ring-2 ring-blue-500/20 transition-all"
      placeholder={placeholder}
    />
  </div>
);

export default function AdminCalendarPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appSettings, setAppSettings] = useState({
    app_name: "Mentorhipers",
    app_logo: ""
  });
  const [mentorProfile, setMentorProfile] = useState({
    name: "Mentor",
    avatar: ""
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    title: "",
    time: "",
    type: "mentoring",
    clientId: ""
  });
  const router = useRouter();

  const fetchClients = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setClients(data);
    setIsLoading(false);
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

    // Load Cache for Branding
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

    const fetchGlobalSettings = async () => {
      const { data: settingsData } = await supabase.from('app_settings').select('*').eq('id', 1).single();
      if (settingsData) {
        setAppSettings({
          app_name: settingsData.app_name || "Mentorhipers",
          app_logo: settingsData.app_logo || "",
        });
      }
      setIsLoaded(true);
    };

    const fetchMentorProfile = async () => {
      const { data } = await supabase.from('mentor_profile').select('name, avatar').eq('id', 1).single();
      if (data) {
        setMentorProfile({
          name: data.name || "Mentor",
          avatar: data.avatar || ""
        });
        localStorage.setItem('mentor_name', data.name || "");
        localStorage.setItem('mentor_avatar', data.avatar || "");
      }
    };

    fetchClients();
    fetchGlobalSettings();
    fetchMentorProfile();
  }, [router]);

  const toggleSidebar = () => {
     const newState = !isSidebarOpen;
     setIsSidebarOpen(newState);
     localStorage.setItem("mh_admin_sidebar", newState.toString());
  };

  // Calendar Logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const allEvents = clients.flatMap(c => 
    (c.schedule || []).map((s: any) => ({
      ...s,
      clientName: c.full_name,
      clientId: c.id,
      clientColor: c.color || "#4880FF", 
      clientAvatar: c.profile_url
    }))
  ).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  const handleAddSchedule = async () => {
    if (!scheduleData.clientId || !scheduleData.title || !scheduleData.time) {
      alert("Mohon lengkapi data."); return;
    }
    const client = clients.find(c => c.id === scheduleData.clientId);
    const updatedSchedule = [...(client.schedule || []), { id: Date.now(), ...scheduleData, status: "upcoming" }];
    
    const { error } = await supabase.from("clients").update({ schedule: updatedSchedule }).eq("id", scheduleData.clientId);
    if (!error) {
      setIsScheduleModalOpen(false);
      setScheduleData({ title: "", time: "", type: "mentoring", clientId: "" });
      fetchClients();
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex font-sans overflow-x-hidden">
      <style jsx global>{`
        .bg-grid-line {
          background-image: linear-gradient(45deg, #f1f5f9 25%, transparent 25%), linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f1f5f9 75%), linear-gradient(-45deg, transparent 75%, #f1f5f9 75%);
          background-size: 10px 10px;
          background-position: 0 0, 0 5px, 5px 5px, 5px 0;
          opacity: 0.5;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* SIDEBAR */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 240 : 80 }}
        transition={{ duration: isLoaded ? 0.3 : 0, ease: "easeInOut" }}
        className="fixed left-0 top-0 bottom-0 bg-white border-r border-[#E0E0E0] flex flex-col z-50 shadow-sm overflow-hidden"
      >
        <div className="sidebar-logo-container">
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
           <AdminNavItem label="Dashboard" icon={<LayoutDashboard />} href="/admin/dashboard" collapsed={!isSidebarOpen} />
           <AdminNavItem label="Calendar" icon={<CalendarIcon />} active href="/admin/calendar" collapsed={!isSidebarOpen} />
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

      {/* MAIN CONTENT Area */}
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

        {/* CALENDAR PAGE CONTENT */}
        <div className="p-6 xl:p-10 flex flex-col gap-10">
           <div className="flex items-center justify-between">
              <h2 className="text-[32px] font-extrabold text-[#202224] tracking-tight">Calendar</h2>
           </div>

           <div className="grid grid-cols-12 gap-6 xl:gap-8">
              {/* LEFT COL: Sidebar Info (3 cols) */}
              <div className="col-span-12 lg:col-span-4 xl:col-span-3">
                 <Card className="p-8 h-full bg-white border-none shadow-[0px_10px_30px_rgba(0,0,0,0.02)] rounded-[14px] flex flex-col gap-8 text-left">
                    <Button onClick={() => setIsScheduleModalOpen(true)} className="w-full h-[60px] bg-[#4880FF] text-white rounded-[14px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                       <Plus size={20} />
                       Add New Event
                    </Button>

                    <div className="space-y-6">
                       <h4 className="text-[16px] font-extrabold text-[#202224]">You are going to</h4>
                       <div className="space-y-6">
                          {allEvents.slice(0, 5).map((ev, idx) => (
                             <div key={idx} className="flex gap-4 items-start">
                                <div className="w-[48px] h-[48px] rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                                   <img src={ev.clientAvatar || `https://i.pravatar.cc/150?u=${ev.clientId}`} className="w-full h-full object-cover" />
                                </div>
                                <div className="space-y-1">
                                   <p className="text-[14px] font-extrabold text-[#202224] leading-tight">{ev.title}</p>
                                   <p className="text-[11px] font-bold text-[#202224] opacity-40">
                                      {new Date(ev.time).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                   </p>
                                </div>
                             </div>
                          ))}
                       </div>
                       <Button variant="ghost" className="w-full h-[48px] bg-[#F5F6FA] text-[#202224] font-bold text-[13px] rounded-xl hover:bg-[#E0E0E0]">See More</Button>
                    </div>
                 </Card>
              </div>

              {/* RIGHT COL: Main Calendar (9 cols) */}
              <div className="col-span-12 lg:col-span-8 xl:col-span-9">
                 <Card className="p-6 xl:p-10 bg-white border-none shadow-[0px_10px_30px_rgba(0,0,0,0.02)] rounded-[14px] overflow-x-auto no-scrollbar">
                    <div className="min-w-[800px]">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-10">
                           <button className="text-[14px] font-bold text-[#202224] opacity-60 hover:opacity-100">Today</button>
                           <div className="flex items-center gap-6">
                              <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 rounded-lg transition-all"><ChevronLeft size={20} /></button>
                              <h3 className="text-[20px] font-extrabold text-[#202224] capitalize">{currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</h3>
                              <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 rounded-lg transition-all"><ChevronRight size={20} /></button>
                           </div>
                           <div className="flex bg-[#F5F6FA] p-1 rounded-xl">
                              {['Day', 'Week', 'Month'].map(t => (
                                 <button key={t} className={`px-6 py-2 rounded-lg text-[13px] font-bold transition-all ${t === 'Month' ? "bg-[#4880FF] text-white shadow-md shadow-blue-500/20" : "text-[#202224] opacity-60 hover:opacity-100"}`}>{t}</button>
                              ))}
                           </div>
                        </div>

                        {/* Weekday labels */}
                        <div className="grid grid-cols-7 border-t border-l border-slate-100 mb-10">
                           {['MON', 'TUE', 'WED', 'THE', 'FRI', 'SAT', 'SUN'].map(day => (
                              <div key={day} className="py-4 border-r border-b border-slate-100 text-[12px] font-extrabold text-[#202224] opacity-80 bg-slate-50/30">
                                 {day}
                              </div>
                           ))}
                           {Array.from({ length: (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1) }).map((_, i) => (
                              <div key={`empty-${i}`} className="min-h-[140px] border-r border-b border-slate-100 bg-grid-line opacity-10" />
                           ))}
                           {Array.from({ length: daysInMonth }).map((_, i) => {
                              const dayNum = i + 1;
                              const dayEvents = allEvents.filter(ev => {
                                const d = new Date(ev.time);
                                return d.getDate() === dayNum && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
                              });
                              
                              return (
                                <div key={i} className="min-h-[140px] border-r border-b border-slate-100 p-4 text-left relative group hover:bg-slate-50/50 transition-all">
                                   <span className="text-[14px] font-extrabold text-[#202224]/30 group-hover:text-[#202224]/80 transition-all">{dayNum}</span>
                                   <div className="mt-2 space-y-1">
                                      {dayEvents.map((ev, eidx) => (
                                         <div 
                                           key={eidx} 
                                           className="px-2 py-1.5 rounded-md text-[10px] font-bold truncate border-l-4 shadow-sm"
                                           style={{ backgroundColor: `${ev.clientColor}15`, borderColor: ev.clientColor, color: ev.clientColor }}
                                         >
                                            {ev.title}
                                         </div>
                                      ))}
                                   </div>
                                </div>
                              );
                           })}
                           {Array.from({ length: (42 - (daysInMonth + (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1))) }).map((_, i) => (
                              <div key={`end-${i}`} className="min-h-[140px] border-r border-b border-slate-100 bg-grid-line opacity-10" />
                           ))}
                        </div>
                    </div>
                 </Card>
              </div>
           </div>
        </div>
      </motion.main>

      {/* SCHEDULE MODAL */}
      <AnimatePresence>
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsScheduleModalOpen(false)} className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-[20px] shadow-2xl p-10 flex flex-col">
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-[20px] font-extrabold text-[#202224]">Buat Event Baru</h3>
                  <button onClick={() => setIsScheduleModalOpen(false)} className="w-10 h-10 rounded-full bg-[#F5F6FA] flex items-center justify-center text-[#202224]"><X className="w-5 h-5" /></button>
               </div>
               
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[12px] font-bold text-[#202224] opacity-60 ml-2">Pilih Client</label>
                     <select value={scheduleData.clientId} onChange={(e) => setScheduleData({...scheduleData, clientId: e.target.value})} className="w-full h-14 rounded-xl bg-[#F5F6FA] border border-[#D5D5D5] px-6 font-bold text-sm focus:outline-none">
                        <option value="">-- Pilih Mentee --</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                     </select>
                  </div>
                  <InputField label="Judul Event" placeholder="Meeting Strategy" value={scheduleData.title} onChange={(val: string) => setScheduleData({...scheduleData, title: val})} />
                  <div className="grid grid-cols-2 gap-4">
                     <InputField label="Waktu / Tanggal" type="datetime-local" value={scheduleData.time} onChange={(val: string) => setScheduleData({...scheduleData, time: val})} />
                     <div className="space-y-2">
                        <label className="text-[12px] font-bold text-[#202224] opacity-60 ml-2">Tipe</label>
                        <select value={scheduleData.type} onChange={(e) => setScheduleData({...scheduleData, type: e.target.value})} className="w-full h-14 rounded-xl bg-[#F5F6FA] border border-[#D5D5D5] px-6 font-bold text-sm focus:outline-none">
                           <option value="mentoring">Mentoring</option>
                           <option value="task">Tugas</option>
                        </select>
                     </div>
                  </div>
               </div>
               <Button onClick={handleAddSchedule} className="mt-10 w-full h-[60px] rounded-xl bg-[#4880FF] text-white font-bold text-[16px]">Simpan Event</Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <NotificationCenterAdmin />
    </div>
  );
}
