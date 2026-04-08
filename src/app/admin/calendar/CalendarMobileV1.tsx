"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  MoreVertical,
  Bell,
  Search,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Users
} from "lucide-react";
import Link from "next/link";

interface CalendarMobileV1Props {
  clients: any[];
  allEvents: any[];
  currentDate: Date;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  setIsScheduleModalOpen: (val: boolean) => void;
}

export default function CalendarMobileV1({
  clients,
  allEvents,
  currentDate,
  handlePrevMonth,
  handleNextMonth,
  setIsScheduleModalOpen
}: CalendarMobileV1Props) {
  const [activeTab, setActiveTab] = useState('calendar');

  // Filter events for current month
  const monthEvents = allEvents.filter(ev => {
    const d = new Date(ev.time);
    return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans pb-32">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif !important; }
      `}</style>

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 pt-10 pb-4">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-xl font-black text-slate-900 leading-none">Schedule</h1>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage Meetings</p>
            </div>
            <button 
              onClick={() => setIsScheduleModalOpen(true)}
              className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
            >
               <Plus size={20}/>
            </button>
         </div>
      </header>

      <main className="flex-1 px-6 pt-8 space-y-8">
         {/* MONTH SELECTOR */}
         <div className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between">
            <button onClick={handlePrevMonth} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
               <ChevronLeft size={18}/>
            </button>
            <div className="text-center">
               <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block mb-0.5">Viewing</span>
               <h3 className="text-sm font-black text-slate-900 capitalize">{currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</h3>
            </div>
            <button onClick={handleNextMonth} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
               <ChevronRight size={18}/>
            </button>
         </div>

         {/* AGENDA LIST */}
         <div className="space-y-6 pb-10">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upcoming Events</h3>
               <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{monthEvents.length} Sessions</span>
            </div>

            {monthEvents.length > 0 ? (
              <div className="space-y-4">
                {monthEvents.map((ev, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={idx} 
                    className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group"
                  >
                     <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: ev.clientColor || '#4880FF' }} />
                     
                     <div className="flex justify-between items-start">
                        <div className="space-y-4 w-full">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                 <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Clock size={12}/>
                                 </div>
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {new Date(ev.time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {new Date(ev.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                 </span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider ${ev.type === 'mentoring' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                 {ev.type}
                              </span>
                           </div>

                           <div className="flex flex-col gap-1">
                              <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{ev.title}</h4>
                              <div className="flex items-center gap-2">
                                 <div className="w-5 h-5 rounded-full bg-slate-100 overflow-hidden">
                                    <img src={ev.clientAvatar || `https://i.pravatar.cc/150?u=${ev.clientId}`} className="w-full h-full object-cover" />
                                 </div>
                                 <span className="text-[11px] font-bold text-slate-500">{ev.clientName}</span>
                              </div>
                           </div>

                           <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                              <button className="flex-1 h-10 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors">Reschedule</button>
                              <button className="w-10 h-10 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl flex items-center justify-center transition-colors"><Trash2 size={16}/></button>
                           </div>
                        </div>
                     </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-4">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                    <CalendarIcon size={32}/>
                 </div>
                 <p className="text-xs font-bold text-slate-400">Tidak ada jadwal untuk bulan ini.</p>
              </div>
            )}
         </div>
      </main>

      {/* BOTTOM NAVIGATION */}
      <nav className="fixed bottom-8 left-6 right-6 h-20 bg-white/80 backdrop-blur-2xl rounded-[32px] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-around px-4 z-[100]">
         <Link href="/admin/dashboard" className="relative flex flex-col items-center justify-center gap-1 text-slate-400 font-bold">
            <LayoutDashboard size={20}/>
            <span className="text-[8px] uppercase tracking-tighter">Dashboard</span>
         </Link>
         <button onClick={() => setActiveTab('calendar')} className="relative flex flex-col items-center justify-center gap-1 text-blue-600 scale-105 font-black">
            <CalendarIcon size={20} strokeWidth={3}/>
            <span className="text-[8px] uppercase tracking-tighter">Schedule</span>
            <motion.div layoutId="m-cal-dot" className="absolute -bottom-2 w-5 h-1 bg-blue-600 rounded-full"/>
         </button>
         <Link href="/admin/dashboard?tab=settings" className="relative flex flex-col items-center justify-center gap-1 text-slate-400 font-bold">
            <Settings size={20}/>
            <span className="text-[8px] uppercase tracking-tighter">Settings</span>
         </Link>
      </nav>
    </div>
  );
}
