"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Settings, 
  Plus, 
  Search, 
  ChevronLeft,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  FileText,
  Bell,
  Trash2,
  X,
  Clock,
  MoreVertical,
  Menu,
  Inbox,
  Star,
  Send,
  FileEdit,
  AlertCircle,
  Archive,
  MoreHorizontal,
  Info,
  CheckCircle2,
  Zap,
  Calendar as CalendarIcon,
  Filter,
  RefreshCcw,
  User,
  ExternalLink,
  Target
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import NotificationCenterAdmin from "@/components/layout/NotificationCenterAdmin";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AdminHeader from "@/components/layout/AdminHeader";

// --- Components ---

const AdminNavItem = ({ label, icon, active = false, href = "#", collapsed = false }: any) => (
  <Link href={href} className={`w-full flex items-center gap-4 px-8 py-5 transition-all duration-300 ${
    active 
      ? "bg-[#4880FF] text-white" 
      : "text-[#202224] opacity-50 hover:opacity-100 hover:bg-slate-50 font-medium"
  } ${collapsed ? "justify-center px-0" : ""}`}>
    <div className={`transition-colors duration-300 ${active ? "text-white" : "text-slate-400"}`}>
       {React.cloneElement(icon as any, { size: 18 })}
    </div>
    {!collapsed && <span className="text-[14px] font-bold tracking-tight">{label}</span>}
  </Link>
);

const CategoryItem = ({ label, icon, count, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-6 py-3.5 rounded-xl transition-all ${
      active ? "bg-[#4880FF] text-white" : "text-[#202224] opacity-60 hover:bg-slate-50 hover:opacity-100"
    }`}
  >
    <div className="flex items-center gap-4">
       {React.cloneElement(icon as any, { size: 18 })}
       <span className="text-[14px] font-bold tracking-tight">{label}</span>
    </div>
    {count !== undefined && (
      <span className={`text-[12px] font-extrabold ${active ? "text-white/80" : "text-[#202224] opacity-40"}`}>{count}</span>
    )}
  </button>
);

const LabelItem = ({ label, color, active }: any) => (
  <button className="w-full flex items-center gap-4 px-6 py-2.5 text-[#202224] opacity-60 hover:opacity-100 transition-all">
    <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: color }} />
    <span className="text-[14px] font-bold">{label}</span>
  </button>
);

export default function MenteeMonitoringPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Inbox");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [appSettings, setAppSettings] = useState({
    app_name: typeof window !== 'undefined' ? (localStorage.getItem('app_name') || "Mentorhipers") : "Mentorhipers",
    app_logo: typeof window !== 'undefined' ? (localStorage.getItem('app_logo') || "") : ""
  });
  const [composeData, setComposeData] = useState({
    clientId: "",
    note: "",
    notify: true
  });
  const [mentorProfile, setMentorProfile] = useState({
    name: typeof window !== 'undefined' ? (localStorage.getItem('mentor_name') || "Mentor") : "Mentor",
    avatar: typeof window !== 'undefined' ? (localStorage.getItem('mentor_avatar') || "") : ""
  });
  const router = useRouter();

  useEffect(() => {
    const sessionStr = localStorage.getItem("mh_session");
    if (!sessionStr) { router.push("/login"); return; }
    const session = JSON.parse(sessionStr);
    if (session.role !== "admin") { router.push("/login"); return; }

    const savedSidebar = localStorage.getItem("mh_admin_sidebar");
    if (savedSidebar !== null) { setIsSidebarOpen(savedSidebar === "true"); }
    setIsLoaded(true);

    // Fetch initial requests from Supabase
    const fetchRequests = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('mentee_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching requests:', error);
      } else {
        setRequests(data || []);
      }
      setIsLoading(false);
    };

    const fetchClients = async () => {
      const { data } = await supabase.from("clients").select("id, full_name, profile_url");
      setClients(data || []);
    };

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

    fetchRequests();
    fetchClients();
    fetchGlobalSettings();

    // Subscribe to Realtime changes
    const channel = supabase
      .channel('mentee_requests_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mentee_requests' },
        (payload: any) => {
          console.log('Realtime update:', payload);
          fetchRequests(); // Refresh when data changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  // Deep linking mechanism
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const reqId = searchParams.get('reqId');
    
    if (reqId && requests.length > 0) {
      const target = requests.find(r => String(r.id) === String(reqId));
      if (target) {
        setSelectedRequest(target);
        const url = new URL(window.location.href);
        url.searchParams.delete('reqId');
        window.history.replaceState({}, '', url.pathname);
      }
    }
  }, [requests.length, router]);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem("mh_admin_sidebar", newState.toString());
  };

  const handleAction = async (type: 'approve' | 'feedback' | 'schedule') => {
    if (!selectedRequest?.client_id) {
       alert("Gagal mengirim notifikasi: Client ID tidak ditemukan.");
       return;
    }

    try {
      if (type === 'schedule') {
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('id, schedule')
          .eq('id', selectedRequest.client_id)
          .single();
        
        if (clientError) throw clientError;

        const meta = selectedRequest.metadata || {};
        const eventTitle = meta.subject || "Mentoring Session";
        const utcTime = meta.utcTime; // New field from BottomBar
        
        let eventISO;
        if (utcTime) {
          eventISO = utcTime;
        } else {
          const eventDate = meta.date || new Date().toISOString().split('T')[0];
          const eventTime = meta.time || "10:00";
          eventISO = `${eventDate}T${eventTime}:00`;
        }

        const currentSchedule = Array.isArray(clientData.schedule) ? clientData.schedule : [];
        const nextId = currentSchedule.length > 0 ? Math.max(...currentSchedule.map((s: any) => s.id || 0)) + 1 : 1;
        
        const newEvent = {
          id: nextId,
          title: eventTitle,
          time: eventISO,
          type: "zoom",
          status: "upcoming"
        };

        await supabase.from('clients').update({ schedule: [...currentSchedule, newEvent] }).eq('id', selectedRequest.client_id);
        
        // Update mentor's global busy slots
        const eventDateObj = new Date(eventISO);
        // Assume 1 hour mentoring session
        const eventEndObj = new Date(eventDateObj.getTime() + 60 * 60 * 1000); 
        const { data: mProfile } = await supabase.from('mentor_profile').select('busy_slots').limit(1).single();
        const currentSlots = mProfile?.busy_slots && Array.isArray(mProfile.busy_slots) ? mProfile.busy_slots : [];
        const newSlot = { start: eventDateObj.toISOString(), end: eventEndObj.toISOString() };
        await supabase.from('mentor_profile').update({ busy_slots: [...currentSlots, newSlot] }).eq('id', 1);
      }

      await supabase.from('notifications').insert([{
        client_id: selectedRequest.client_id,
        title: type === 'approve' ? "Request Approved! ✅" : type === 'feedback' ? "Feedback Diterima ⚡" : "Jadwal Terkonfirmasi 📅",
        message: type === 'approve' ? "Mentor baru saja menyetujui permintaan kamu." : type === 'feedback' ? "Mentor memberikan feedback baru untuk kamu." : `Jadwal meeting "${selectedRequest.metadata?.subject || 'Mentoring'}" sudah resmi ditambahkan ke kalender kamu.`,
        type: type === 'approve' ? 'success' : type === 'feedback' ? 'info' : 'warning'
      }]);

      alert(`Berhasil mengirimkan ${type === 'schedule' ? 'jadwal & ' : ''}notifikasi ke mentee!`);
    } catch (err: any) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  const handleSendNote = async () => {
    if (!composeData.clientId || !composeData.note) {
      alert("Please select a mentee and write a note.");
      return;
    }

    setIsSending(true);
    
    // 1. Update client's mentor_note
    const { error: clientError } = await supabase
      .from("clients")
      .update({ mentors_note: composeData.note })
      .eq("id", composeData.clientId);

    if (clientError) {
      alert("Error updating note: " + clientError.message);
      setIsSending(false);
      return;
    }

    // 2. If notify is true, send a notification
    if (composeData.notify) {
      await supabase.from("notifications").insert([{
        client_id: composeData.clientId,
        title: "New Note from Mentor",
        message: composeData.note.substring(0, 100) + "...",
        type: "feedback",
        status: "unread"
      }]);
    }

    setIsSending(false);
    setIsComposeOpen(false);
    setComposeData({ clientId: "", note: "", notify: true });
    alert("Note sent successfully! 🚀");
  };

  const getLabelColor = (label: string) => {
    switch(label) {
      case 'Primary': return '#20C997';
      case 'Work': return '#FEB052';
      case 'Friends': return '#A461D8';
      case 'Social': return '#4880FF';
      default: return '#D5D5D5';
    }
  };

  const filteredRequests = activeCategory === "Inbox" 
    ? requests 
    : requests.filter(r => r.category === activeCategory || (activeCategory === "Starred" && r.isStarred));

  const handleDeleteBatch = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Hapus ${selectedIds.length} pesan terpilih?`)) {
      const { error } = await supabase.from('mentee_requests').delete().in('id', selectedIds);
      if (!error) {
        setRequests(requests.filter(r => !selectedIds.includes(r.id)));
        setSelectedIds([]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex overflow-x-hidden font-sans">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ADMIN SIDEBAR */}
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
           <AdminNavItem label="Dashboard" icon={<LayoutDashboard />} href="/admin/dashboard" collapsed={!isSidebarOpen} />
           <AdminNavItem label="Calendar" icon={<CalendarIcon />} href="/admin/calendar" collapsed={!isSidebarOpen} />
           <AdminNavItem label="Mentee Monitoring" icon={<Users />} active href="/admin/mentor" collapsed={!isSidebarOpen} />
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
        className="flex-1 flex flex-col min-h-screen"
      >
        <AdminHeader 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
        />

        <div className="flex-1 flex p-6 xl:p-10 gap-8 overflow-hidden">
           <div className="w-[280px] hidden lg:flex flex-col gap-8 shrink-0">
              <Card className="flex-1 bg-white border-none shadow-[0px_10px_30px_rgba(0,0,0,0.02)] rounded-[20px] p-6 flex flex-col overflow-y-auto no-scrollbar">
                 <Button 
                    onClick={() => setIsComposeOpen(true)}
                    className="w-full h-[56px] bg-[#4880FF] text-white rounded-[16px] font-extrabold text-[14px] mb-10 flex items-center justify-center gap-3"
                 >
                    <Plus size={18} /> Compose
                 </Button>

                 <div className="space-y-2">
                    <p className="text-[12px] font-extrabold text-[#202224] opacity-30 uppercase tracking-widest px-6 mb-4">My Monitoring</p>
                    <CategoryItem label="Inbox" icon={<Inbox />} count={requests.filter(r => r.status === 'unread').length} active={activeCategory === 'Inbox'} onClick={() => setActiveCategory('Inbox')} />
                    <CategoryItem label="Starred" icon={<Star />} active={activeCategory === 'Starred'} onClick={() => setActiveCategory('Starred')} />
                    <CategoryItem label="Submissions" icon={<FileEdit />} active={activeCategory === 'Submission'} onClick={() => setActiveCategory('Submission')} />
                    <CategoryItem label="Call Requests" icon={<Clock />} active={activeCategory === 'Call Request'} onClick={() => setActiveCategory('Call Request')} />
                    <CategoryItem label="Discussion" icon={<Send />} active={activeCategory === 'Discussion'} onClick={() => setActiveCategory('Discussion')} />
                    <CategoryItem label="Draft" icon={<FileText />} active={activeCategory === 'Draft'} onClick={() => setActiveCategory('Draft')} />
                    <CategoryItem label="Bin" icon={<Trash2 />} active={activeCategory === 'Bin'} onClick={() => setActiveCategory('Bin')} />
                 </div>

                 <div className="mt-10 space-y-2">
                    <p className="text-[12px] font-extrabold text-[#202224] opacity-30 uppercase tracking-widest px-6 mb-4">Labels</p>
                    <LabelItem label="Primary" color="#20C997" />
                    <LabelItem label="Social" color="#4880FF" />
                    <LabelItem label="Work" color="#FEB052" />
                    <LabelItem label="Friends" color="#A461D8" />
                    <button className="flex items-center gap-3 px-6 py-4 text-[#4880FF] text-[14px] font-bold hover:underline">
                       <Plus size={16} /> Create New Label
                    </button>
                 </div>
              </Card>
           </div>

           <div className="flex-1 flex flex-col gap-6 min-w-0">
              <div className="flex items-center justify-between">
                 <h2 className="text-[32px] font-extrabold text-[#202224] tracking-tight">Mentee Monitoring</h2>
              </div>

              <Card className="flex-1 bg-white border-none shadow-[0px_10px_30px_rgba(0,0,0,0.02)] rounded-[20px] overflow-hidden flex flex-col">
                 <div className="h-[80px] border-b border-[#F5F6FA] flex items-center justify-between px-8 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center gap-6">
                       <div className="w-[400px] relative hidden lg:block">
                          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#202224] opacity-30" />
                          <input 
                            placeholder="Search mail" 
                            className="w-full h-[50px] rounded-full bg-[#F5F6FA] border border-[#D5D5D5]/50 pl-14 pr-6 text-[14px] font-semibold focus:outline-none focus:ring-1 ring-[#4880FF]/30"
                          />
                       </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {selectedIds.length > 0 && (
                          <div className="flex items-center gap-3 px-4 py-2 bg-red-50 rounded-xl border border-red-100 mr-2">
                             <span className="text-[12px] font-black text-red-500 uppercase tracking-widest">{selectedIds.length} Selected</span>
                          </div>
                        )}
                        <button 
                          onClick={handleDeleteBatch}
                          className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${selectedIds.length > 0 ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-[#F5F6FA] text-slate-300 pointer-events-none'}`}
                        >
                          <Trash2 size={20} />
                        </button>
                    </div>
                 </div>

                 <div className="flex-1 overflow-y-auto no-scrollbar">
                    {filteredRequests.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                         <Inbox size={64} opacity={0.3} />
                         <p className="font-bold">Tidak ada request di kategori ini</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#F5F6FA]">
                        {filteredRequests.map((req) => (
                          <div 
                            key={req.id} 
                            onClick={() => setSelectedRequest(req)}
                            className={`flex items-center gap-4 px-8 py-6 cursor-pointer transition-all hover:bg-[#F5F6FA]/50 group relative ${req.status === 'unread' ? 'bg-white' : 'bg-[#F9FAFB]/50'}`}
                          >
                             {req.status === 'unread' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4880FF]" />}
                             
                             <div className="flex items-center gap-5 shrink-0">
                                <input 
                                  type="checkbox" 
                                  checked={selectedIds.includes(req.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedIds([...selectedIds, req.id]);
                                    } else {
                                      setSelectedIds(selectedIds.filter(id => id !== req.id));
                                    }
                                  }}
                                  className="w-5 h-5 rounded border-[#D5D5D5] transition-all cursor-pointer" 
                                  onClick={(e) => e.stopPropagation()} 
                                />
                                <button className={`transition-all ${req.isStarred ? 'text-[#FEB052]' : 'text-slate-200 hover:text-[#FEB052]'}`} onClick={(e) => { e.stopPropagation(); req.isStarred = !req.isStarred; setRequests([...requests]); }}>
                                   <Star size={18} fill={req.isStarred ? '#FEB052' : 'none'} />
                                </button>
                             </div>

                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-100">
                                  <img src={req.sender_avatar || `https://i.pravatar.cc/150?u=${req.sender_name}`} alt="" className="w-full h-full object-cover" />
                                </div>
                                <span className={`w-36 font-bold truncate ${req.status === 'unread' ? 'text-[#202224]' : 'text-slate-400'}`}>
                                  {req.sender_name}
                                </span>
                             </div>

                             <div className="flex-1 min-w-0 flex items-center gap-4">
                                <div className="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shrink-0" style={{ backgroundColor: `${getLabelColor(req.label)}15`, color: getLabelColor(req.label) }}>{req.label}</div>
                                <div className="flex-1 truncate">
                                   <span className={`text-[14px] mr-2 ${req.status === 'unread' ? 'font-extrabold text-[#202224]' : 'font-bold text-[#202224] opacity-60'}`}>{req.subject}</span>
                                   <span className="text-[14px] font-bold text-[#202224] opacity-30 truncate"> - {req.snippet}</span>
                                </div>
                             </div>

                             <div className="w-[80px] shrink-0 text-right">
                                <span className="text-[13px] font-extrabold text-[#202224] opacity-40">{req.time}</span>
                             </div>

                             <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all bg-[#F5F6FA] p-1.5 rounded-lg shadow-sm border border-slate-200">
                                <button title="Delete" onClick={(e) => { e.stopPropagation(); setSelectedIds([req.id]); handleDeleteBatch(); }} className="p-2 hover:text-red-500"><Trash2 size={16} /></button>
                                <button title="Mark as unread" className="p-2 hover:text-blue-500"><RefreshCcw size={16} /></button>
                             </div>
                          </div>
                        ))}
                      </div>
                    )}
                 </div>
              </Card>
           </div>
        </div>
      </motion.main>

      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedRequest(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
             <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="h-[90px] border-b border-[#F5F6FA] flex items-center justify-between px-10">
                   <div className="flex items-center gap-4">
                      <button onClick={() => setSelectedRequest(null)} className="w-[44px] h-[44px] rounded-full bg-[#F5F6FA] flex items-center justify-center hover:bg-slate-100 transition-all"><X size={20} /></button>
                      <h3 className="text-[18px] font-extrabold text-[#202224]">Request Detail</h3>
                   </div>
                   <div className="flex items-center gap-3">
                      <button className="p-3 text-slate-400 hover:text-[#4880FF] transition-all"><Star size={20} fill={selectedRequest.isStarred ? '#FEB052' : 'none'} color={selectedRequest.isStarred ? '#FEB052' : 'currentColor'} /></button>
                      <button className="p-3 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={20} /></button>
                      <button className="p-3 text-slate-400 hover:text-blue-500 transition-all"><MoreHorizontal size={20} /></button>
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-10 text-left no-scrollbar">
                   <div className="flex justify-between items-start">
                      <div className="flex gap-6">
                         <div className="w-[70px] h-[70px] rounded-2xl overflow-hidden border-4 border-slate-50 shadow-sm relative">
                            <img src={selectedRequest.sender_avatar || `https://i.pravatar.cc/150?u=${selectedRequest.sender_name}`} className="w-full h-full object-cover" />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#20C997] border-2 border-white flex items-center justify-center text-white">
                               <CheckCircle2 size={12} />
                            </div>
                         </div>
                         <div className="space-y-1">
                            <h4 className="text-[24px] font-extrabold text-[#202224] tracking-tight">{selectedRequest.sender_name || 'Mentee'}</h4>
                            <div className="flex items-center gap-3">
                               <span className="text-[13px] font-bold text-[#202224] opacity-40">{selectedRequest.sender_email || 'No email provided'}</span>
                               <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                               <span className="text-[13px] font-bold text-[#4880FF]">{selectedRequest.category}</span>
                            </div>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[12px] font-extrabold text-[#202224] opacity-30 uppercase tracking-widest mb-1">Received</p>
                         <p className="text-[14px] font-extrabold text-[#202224]">{selectedRequest.created_at ? new Date(selectedRequest.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '00:00'}, Today</p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="p-6 rounded-2xl bg-[#F5F6FA] border border-slate-100">
                         <h3 className="text-[18px] font-extrabold text-[#202224]">{selectedRequest.subject}</h3>
                      </div>
                      <div className="text-slate-600 leading-relaxed space-y-4 whitespace-pre-wrap">
                        {selectedRequest.category === 'Call Request' && selectedRequest.metadata?.utcTime ? (
                           <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 mb-4">
                              <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Converted to Your Local Time</p>
                              <p className="text-lg font-black text-blue-600">
                                 {new Date(selectedRequest.metadata.utcTime as string).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} | {new Date(selectedRequest.metadata.utcTime as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                           </div>
                        ) : null}
                        {selectedRequest.content || selectedRequest.snippet}
                      </div>
                   </div>

                   <div className="pt-10 border-t border-[#F5F6FA] space-y-6">
                      <h4 className="text-[16px] font-extrabold text-[#202224]">Review & Feedback</h4>
                      <div className="grid grid-cols-2 gap-6">
                         <Button onClick={() => handleAction('approve')} className="h-[60px] rounded-2xl border-2 border-[#20C997] text-[#20C997] hover:bg-[#20C997]/5 font-extrabold text-[14px] flex items-center justify-center gap-3">
                            <CheckCircle2 size={20} /> Approve Request
                         </Button>
                         <Button onClick={() => handleAction('feedback')} className="h-[60px] rounded-2xl border-2 border-[#4880FF] text-[#4880FF] hover:bg-[#4880FF]/5 font-extrabold text-[14px] flex items-center justify-center gap-3">
                            <Zap size={20} /> Give Feedback
                         </Button>
                      </div>
                      
                      {selectedRequest.category === 'Call Request' && (
                        <Card className="p-6 bg-[#FEB052]/5 border-2 border-[#FEB052]/20 rounded-2xl flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-[#FEB052] flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                                 <CalendarIcon size={24} />
                              </div>
                              <div>
                                 <p className="text-[14px] font-extrabold text-[#202224]">Schedule into Calendar</p>
                                 <p className="text-[12px] font-bold text-[#202224] opacity-40">Add this session to your mentoring schedule</p>
                              </div>
                           </div>
                           <Button onClick={() => handleAction('schedule')} className="bg-white text-[#FEB052] border border-[#FEB052] h-[44px] px-6 rounded-xl font-bold hover:bg-[#FEB052] hover:text-white transition-all">Setup Now</Button>
                        </Card>
                      )}

                      <div className="space-y-4">
                         <label className="text-[12px] font-bold text-[#202224] opacity-30 uppercase tracking-widest ml-2">Internal Note (Mentor Only)</label>
                         <textarea 
                           className="w-full h-[120px] rounded-2xl bg-[#F5F6FA] border border-[#D5D5D5] p-6 font-bold text-sm focus:outline-none focus:ring-1 ring-[#4880FF]/30 placeholder:opacity-30" 
                           placeholder="Tambahkan catatan untuk diri sendiri mengenai mentee ini..."
                         />
                      </div>
                   </div>
                </div>

                <div className="h-[100px] border-t border-[#F5F6FA] p-8 bg-[#F9FAFB]/50 flex items-center gap-4">
                   <div className="flex-1 relative">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#202224] opacity-20" />
                      <input className="w-full h-[56px] rounded-2xl border-none bg-white px-14 font-bold text-sm shadow-sm" placeholder="Type a reply..." />
                   </div>
                   <button className="w-[56px] h-[56px] rounded-2xl bg-[#4880FF] text-white flex items-center justify-center shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                      <Send size={20} />
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isComposeOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsComposeOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="relative w-full max-w-xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="h-[90px] border-b border-[#F5F6FA] flex items-center justify-between px-10">
                <h3 className="text-[18px] font-extrabold text-[#202224]">Compose New Note</h3>
                <button onClick={() => setIsComposeOpen(false)} className="w-[44px] h-[44px] rounded-full bg-[#F5F6FA] flex items-center justify-center hover:bg-slate-100 transition-all"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-6 text-left no-scrollbar">
                <div className="space-y-2">
                  <label htmlFor="mentee-select" className="text-[12px] font-bold text-[#202224] opacity-30 uppercase tracking-widest ml-2">To Mentee</label>
                  <select
                    id="mentee-select"
                    className="w-full h-[56px] rounded-2xl bg-[#F5F6FA] border border-[#D5D5D5] px-6 font-bold text-sm focus:outline-none focus:ring-1 ring-[#4880FF]/30"
                    value={composeData.clientId}
                    onChange={(e) => setComposeData({ ...composeData, clientId: e.target.value })}
                  >
                    <option value="">Select a mentee</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>{client.full_name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="note-content" className="text-[12px] font-bold text-[#202224] opacity-30 uppercase tracking-widest ml-2">Note Content</label>
                  <textarea
                    id="note-content"
                    className="w-full h-[180px] rounded-2xl bg-[#F5F6FA] border border-[#D5D5D5] p-6 font-bold text-sm focus:outline-none focus:ring-1 ring-[#4880FF]/30 placeholder:opacity-30"
                    placeholder="Write your note here..."
                    value={composeData.note}
                    onChange={(e) => setComposeData({ ...composeData, note: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="notify-mentee"
                    checked={composeData.notify}
                    onChange={(e) => setComposeData({ ...composeData, notify: e.target.checked })}
                    className="w-5 h-5 rounded border-[#D5D5D5] transition-all cursor-pointer"
                  />
                  <label htmlFor="notify-mentee" className="text-[14px] font-bold text-[#202224] opacity-70">Notify mentee about this note</label>
                </div>
              </div>

              <div className="h-[100px] border-t border-[#F5F6FA] p-8 bg-[#F9FAFB]/50 flex items-center justify-end">
                <Button
                  onClick={handleSendNote}
                  disabled={isSending}
                  className="h-[56px] px-8 bg-[#4880FF] text-white rounded-2xl font-extrabold text-[14px] flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                >
                  {isSending ? "Sending..." : "Send Note"}
                  <Send size={18} />
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <NotificationCenterAdmin />
    </div>
  );
}
