"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Layers,
  BarChart3,
  Target,
  Clock,
  ExternalLink,
  ChevronRight,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Instagram,
  Play,
  MessageSquare,
  FileText,
  Star,
  Settings,
  Bell,
  Search,
  Plus,
  Link as LinkIcon,
  Trash2,
  Check
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

interface BoardMobileV1Props {
  boardData: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  calculateRemainingWeeks: (date: string) => string;
}

export default function BoardMobileV1({
  boardData,
  activeTab,
  setActiveTab,
  isAdmin,
  calculateRemainingWeeks
}: BoardMobileV1Props) {
  
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans pb-32">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif !important; }
      `}</style>
      
      {/* 1. STICKY HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 pt-10 pb-4">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <span className="font-black text-xs">{getInitials(boardData.name)}</span>
               </div>
               <div className="flex flex-col">
                  <h1 className="text-sm font-black text-slate-900 leading-none truncate max-w-[150px]">{boardData.name}</h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{boardData.niche}</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Bell size={16}/>
               </div>
               {isAdmin && (
                 <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-wider border border-blue-100">
                   Admin Mode
                 </div>
               )}
            </div>
         </div>
      </header>

      <main className="flex-1 px-6 pt-8 space-y-8">
         
         {activeTab === 'dashboard' && (
           <div className="space-y-8 pb-10">
              {/* PRIMARY STATS */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Clock size={18}/></div>
                    <div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sisa Waktu</p>
                       <p className="text-lg font-black text-slate-900">{calculateRemainingWeeks(boardData.end_date)}</p>
                    </div>
                 </div>
                 <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center"><Target size={18}/></div>
                    <div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current Phase</p>
                       <p className="text-lg font-black text-slate-900">{boardData.currentPhase || 1} / 3</p>
                    </div>
                 </div>
              </div>

              {/* MENTOR'S NOTE */}
              <div className="bg-blue-600 rounded-[32px] p-8 shadow-xl shadow-blue-600/20 relative overflow-hidden">
                 <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                 <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><Star size={16} className="text-white fill-white"/></div>
                       <h3 className="text-xs font-black text-white uppercase tracking-widest">Mentor's Guidance</h3>
                    </div>
                    <p className="text-sm font-bold text-white/90 leading-relaxed italic">
                      "{boardData.mentors_note || 'Tetap semangat! Fokus pada kualitas konten dan konsistensi posting.'}"
                    </p>
                 </div>
              </div>

              {/* TASKS / MILESTONES */}
              <div className="space-y-4">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Roadmap & Status</h3>
                 <div className="space-y-3">
                    {boardData.tasks?.map((task: any, idx: number) => (
                      <div key={idx} className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${task.status === 'Active' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-300'}`}>
                               {task.status === 'Active' ? <Zap size={14}/> : <Clock size={14}/>}
                            </div>
                            <span className={`text-xs font-black ${task.status === 'Active' ? 'text-slate-900' : 'text-slate-400'}`}>{task.label}</span>
                         </div>
                         <span className={`text-[9px] font-black uppercase tracking-widest ${task.status === 'Active' ? 'text-blue-600' : 'text-slate-300'}`}>{task.status}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
         )}

         {activeTab === 'calendar' && (
           <div className="space-y-6 pb-10">
              <div className="flex items-center justify-between">
                 <h2 className="text-xl font-black text-slate-900 leading-tight">Content Plan</h2>
                 <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Calendar size={18}/></div>
              </div>
              <div className="bg-white border border-slate-100 rounded-[32px] p-6 text-center space-y-4 shadow-sm border-dashed">
                 <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300"><ExternalLink size={24}/></div>
                 <p className="text-xs font-bold text-slate-500">Gunakan versi desktop untuk mengelola Content Plan secara penuh.</p>
                 <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest">View as Table</button>
              </div>
           </div>
         )}

         {activeTab === 'timeline' && (
           <div className="space-y-6 pb-10">
              <div className="flex items-center justify-between">
                 <h2 className="text-xl font-black text-slate-900 leading-tight">Master Timeline</h2>
                 <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Layers size={18}/></div>
              </div>
              <div className="space-y-4">
                {boardData.timeline_items?.map((item: any) => (
                  <div key={item.id} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm space-y-4">
                     <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Day {item.start_day} - {item.end_day}</span>
                        <h4 className="text-sm font-black text-slate-900">{item.activity}</h4>
                     </div>
                     <p className="text-[11px] font-bold text-slate-400 leading-relaxed">{item.detail}</p>
                  </div>
                ))}
              </div>
           </div>
         )}

         {activeTab === 'reports' && (
           <div className="space-y-8 pb-10">
              <div className="flex items-center justify-between">
                 <h2 className="text-xl font-black text-slate-900 leading-tight">Growth Reports</h2>
                 <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><BarChart3 size={18}/></div>
              </div>
              
              <div className="space-y-6">
                {Object.entries(boardData.platformStats || {}).map(([platform, stats]: [any, any]) => (
                  <div key={platform} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                     <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${platform === 'instagram' ? 'bg-rose-50 text-rose-500' : 'bg-slate-900 text-white'}`}>
                           {platform === 'instagram' ? <Instagram size={18}/> : <TrendingUp size={18}/>}
                        </div>
                        <h4 className="text-sm font-black text-slate-900 capitalize">{platform} Insights</h4>
                     </div>
                     <div className="grid grid-cols-2 gap-8">
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Followers</p>
                           <p className="text-xl font-black text-slate-900">{stats.followers}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Growth</p>
                           <p className="text-xl font-black text-emerald-500">+{stats.percentages?.followers || 0}%</p>
                        </div>
                     </div>
                  </div>
                ))}
              </div>
           </div>
         )}
      </main>

      {/* BOTTOM NAVIGATION */}
      <nav className="fixed bottom-8 left-6 right-6 h-20 bg-white/80 backdrop-blur-2xl rounded-[32px] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-around px-4 z-[100]">
         <button onClick={() => setActiveTab('dashboard')} className={`relative flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'dashboard' ? 'text-blue-600 scale-105 font-black' : 'text-slate-400 font-bold'}`}>
            <LayoutDashboard size={20} strokeWidth={activeTab === 'dashboard' ? 3 : 2}/>
            <span className="text-[8px] uppercase tracking-tighter">Dashboard</span>
            {activeTab === 'dashboard' && <motion.div layoutId="m-board-dot" className="absolute -bottom-2 w-5 h-1 bg-blue-600 rounded-full"/>}
         </button>
         <button onClick={() => setActiveTab('calendar')} className={`relative flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'calendar' ? 'text-blue-600 scale-105 font-black' : 'text-slate-400 font-bold'}`}>
            <Calendar size={20} strokeWidth={activeTab === 'calendar' ? 3 : 2}/>
            <span className="text-[8px] uppercase tracking-tighter">Content</span>
            {activeTab === 'calendar' && <motion.div layoutId="m-board-dot" className="absolute -bottom-2 w-5 h-1 bg-blue-600 rounded-full"/>}
         </button>
         <button onClick={() => setActiveTab('timeline')} className={`relative flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'timeline' ? 'text-blue-600 scale-105 font-black' : 'text-slate-400 font-bold'}`}>
            <Layers size={20} strokeWidth={activeTab === 'timeline' ? 3 : 2}/>
            <span className="text-[8px] uppercase tracking-tighter">Timeline</span>
            {activeTab === 'timeline' && <motion.div layoutId="m-board-dot" className="absolute -bottom-2 w-5 h-1 bg-blue-600 rounded-full"/>}
         </button>
         <button onClick={() => setActiveTab('reports')} className={`relative flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'reports' ? 'text-blue-600 scale-105 font-black' : 'text-slate-400 font-bold'}`}>
            <BarChart3 size={20} strokeWidth={activeTab === 'reports' ? 3 : 2}/>
            <span className="text-[8px] uppercase tracking-tighter">Stats</span>
            {activeTab === 'reports' && <motion.div layoutId="m-board-dot" className="absolute -bottom-2 w-5 h-1 bg-blue-600 rounded-full"/>}
         </button>
      </nav>
    </div>
  );
}
