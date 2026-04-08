"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Search, 
  Plus, 
  ChevronRight, 
  Calendar, 
  TrendingUp, 
  Target, 
  CheckCircle2, 
  ArrowLeft,
  LayoutDashboard,
  Bell,
  Settings,
  MoreVertical,
  Edit,
  ExternalLink,
  Check,
  Star,
  Zap,
  Clock,
  LogOut,
  Trash2
} from "lucide-react";
import Link from "next/link";

interface DashboardMobileV1Props {
  clients: any[];
  stats: any;
  appSettings: any;
  handleEditClick: (client: any) => void;
  copyToClipboard: (id: string, e: any) => void;
  copiedId: string | null;
  setIsRegisterModalOpen: (val: boolean) => void;
  setIsScheduleModalOpen: (val: boolean) => void;
  mentorProfile: any;
  handleDeleteSchedule: (clientId: string, eventId: number) => void;
}

export default function DashboardMobileV1({ 
  clients, 
  stats, 
  appSettings, 
  handleEditClick, 
  copyToClipboard, 
  copiedId,
  setIsRegisterModalOpen,
  setIsScheduleModalOpen,
  mentorProfile,
  handleDeleteSchedule
}: DashboardMobileV1Props) {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = clients.filter(c => 
    c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.niche?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allSchedules = clients.flatMap(c => (c.schedule || []).map((s: any) => ({ ...s, clientName: c.full_name, clientId: c.id })))
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans pb-32">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif !important; }
      `}</style>
      
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 pt-10 pb-4 flex items-center justify-between shadow-sm">
         <div className="flex items-center gap-3">
            <div className="w-9 h-9 active:scale-90 transition-transform">
               {appSettings.app_logo ? (
                 <img src={appSettings.app_logo} alt="Logo" className="w-full h-full object-contain"/>
               ) : (
                 <div className="w-full h-full bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xs">M</div>
               )}
            </div>
            <div className="flex flex-col">
               <h1 className="text-sm font-black text-slate-900 leading-none">{appSettings.app_name}</h1>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{activeTab === 'home' ? 'Admin Dashboard' : activeTab === 'schedule' ? 'Mentoring Schedule' : 'Settings'}</p>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <div className="relative">
              <Bell size={20} className="text-slate-400" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </div>
            <Link href="/ruang-sosmed/batch" className="h-9 px-4 rounded-xl bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border border-blue-100">
               V2 Admin
            </Link>
         </div>
      </header>

      <main className="flex-1 px-6 space-y-8 pt-8">
         
         {activeTab === 'home' && (
           <>
             {/* SEARCH & ACTIONS */}
             <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                   <input 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Search mentees..." 
                     className="w-full h-12 bg-white border border-slate-100 rounded-2xl pl-12 pr-4 text-xs font-bold focus:outline-none focus:ring-2 ring-blue-500/10 transition-all"
                   />
                </div>
                <button 
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 active:scale-90 transition-transform"
                >
                   <Plus size={20} strokeWidth={3}/>
                </button>
             </div>

             {/* STATS OVERVIEW */}
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm space-y-3">
                   <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Users size={18}/></div>
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Mentee</p>
                      <p className="text-xl font-black text-slate-900">{stats.total.current}</p>
                   </div>
                </div>
                <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm space-y-3">
                   <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center"><TrendingUp size={18}/></div>
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Progress Avg</p>
                      <p className="text-xl font-black text-slate-900">{stats.avgProgress.current}%</p>
                   </div>
                </div>
             </div>

             {/* MENTEE LIST */}
             <div className="space-y-4 pb-10">
                <div className="flex items-center justify-between px-2">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Boards</h3>
                   <span className="text-[10px] font-black text-blue-600">{filteredClients.length} Mentees</span>
                </div>

                {filteredClients.map((client) => (
                  <motion.div 
                    key={client.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6"
                  >
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 rounded-2xl bg-slate-100 border-2 border-slate-50 overflow-hidden shadow-inner">
                              {client.profile_url ? <img src={client.profile_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-lg">MH</div>}
                           </div>
                           <div className="space-y-0.5">
                              <h4 className="text-sm font-black text-slate-900">{client.full_name}</h4>
                              <p className="text-[10px] font-bold text-blue-600">{client.niche}</p>
                           </div>
                        </div>
                        <button onClick={() => handleEditClick(client)} className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                           <MoreVertical size={20}/>
                        </button>
                     </div>

                     <div className="grid grid-cols-2 gap-3 pt-2">
                        <Link 
                          href={`/board/${client.id}?admin=true`}
                          className="h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/10 active:scale-[0.98] transition-all"
                        >
                           <ExternalLink size={14}/> Board
                        </Link>
                        <button 
                          onClick={(e) => copyToClipboard(client.id, e)}
                          className={`h-12 ${copiedId === client.id ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-500'} rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest active:scale-[0.98] transition-all`}
                        >
                           {copiedId === client.id ? <Check size={14}/> : <Zap size={14}/>} {copiedId === client.id ? 'Saved' : 'Share'}
                        </button>
                     </div>
                  </motion.div>
                ))}

                {filteredClients.length === 0 && (
                  <div className="py-20 text-center">
                     <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 mb-4"><Users size={32}/></div>
                     <p className="text-xs font-bold text-slate-400">No mentees found.</p>
                  </div>
                )}
             </div>
           </>
         )}

         {activeTab === 'schedule' && (
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <h2 className="text-xl font-black text-slate-900">Meetings</h2>
                 <button onClick={() => setIsScheduleModalOpen(true)} className="p-2 bg-blue-600 text-white rounded-xl"><Plus size={20}/></button>
              </div>
              <div className="space-y-4">
                 {allSchedules.map((event: any, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-4 relative group">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${event.type === 'mentoring' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {event.type === 'mentoring' ? <Zap size={20}/> : <Calendar size={20}/>}
                       </div>
                       <div className="flex-1">
                          <p className="text-sm font-black text-slate-900 tracking-tight">{event.title}</p>
                          <p className="text-[10px] font-bold text-slate-400">{new Date(event.time).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} • {event.clientName}</p>
                       </div>
                       <button onClick={() => handleDeleteSchedule(event.clientId, event.id)} className="p-2 text-rose-200 hover:text-rose-500"><Trash2 size={16}/></button>
                    </div>
                 ))}
                 {allSchedules.length === 0 && (
                    <div className="py-20 text-center text-slate-400 text-xs font-bold">No upcoming events.</div>
                 )}
              </div>
           </div>
         )}

         {activeTab === 'settings' && (
           <div className="space-y-8">
              <h2 className="text-xl font-black text-slate-900">Admin Settings</h2>
              <div className="grid grid-cols-1 gap-4">
                 <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center font-black">?</div>
                    <div>
                       <p className="text-sm font-black text-slate-900">{mentorProfile.name}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Profile</p>
                    </div>
                 </div>
                 <Link href="/ruang-sosmed/batch" className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><Star size={20}/></div>
                       <p className="text-sm font-black text-slate-900">Switch to V2 Engine</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-300"/>
                 </Link>
              </div>
           </div>
         )}
      </main>

      {/* BOTTOM NAVIGATION */}
      <nav className="fixed bottom-8 left-6 right-6 h-20 bg-white/80 backdrop-blur-2xl rounded-[32px] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-around px-4 z-[100]">
         <button onClick={() => setActiveTab('home')} className={`relative flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'home' ? 'text-blue-600 scale-105 font-black' : 'text-slate-400 font-bold'}`}>
            <LayoutDashboard size={20} strokeWidth={activeTab === 'home' ? 3 : 2}/>
            <span className="text-[8px] uppercase tracking-tighter">Dashboard</span>
            {activeTab === 'home' && <motion.div layoutId="m-nav-dot" className="absolute -bottom-2 w-5 h-1 bg-blue-600 rounded-full"/>}
         </button>
         <button onClick={() => setActiveTab('schedule')} className={`relative flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'schedule' ? 'text-blue-600 scale-105 font-black' : 'text-slate-400 font-bold'}`}>
            <Calendar size={20} strokeWidth={activeTab === 'schedule' ? 3 : 2}/>
            <span className="text-[8px] uppercase tracking-tighter">Schedule</span>
            {activeTab === 'schedule' && <motion.div layoutId="m-nav-dot" className="absolute -bottom-2 w-5 h-1 bg-blue-600 rounded-full"/>}
         </button>
         <button onClick={() => setActiveTab('settings')} className={`relative flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'settings' ? 'text-blue-600 scale-105 font-black' : 'text-slate-400 font-bold'}`}>
            <Settings size={20} strokeWidth={activeTab === 'settings' ? 3 : 2}/>
            <span className="text-[8px] uppercase tracking-tighter">Settings</span>
            {activeTab === 'settings' && <motion.div layoutId="m-nav-dot" className="absolute -bottom-2 w-5 h-1 bg-blue-600 rounded-full"/>}
         </button>
         <button 
           onClick={() => { localStorage.removeItem("mh_session"); window.location.href = "/login"; }}
           className="relative flex flex-col items-center justify-center gap-1 text-rose-400 font-bold"
         >
            <LogOut size={20}/>
            <span className="text-[8px] uppercase tracking-tighter">Logout</span>
         </button>
      </nav>
    </div>
  );
}
