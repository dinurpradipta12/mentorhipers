"use client";

import React, { useState, useEffect } from "react";
import { Bell, Info, X, Inbox, User, Clock, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: "request" | "progress" | "alert";
  created_at: string;
  is_read?: boolean;
}

export default function NotificationCenterAdmin() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<AdminNotification | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<any | null>(null);
  const router = useRouter();

  // 1. Initial Fetch (Last 10 Mentee Requests)
  useEffect(() => {
    const fetchRequests = async () => {
      const { data } = await supabase
        .from("mentee_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) {
        setNotifications(data.map((r: { id: string, sender_name: string, subject: string, created_at: string, status: string }) => ({
          id: r.id,
          title: "Inbox Baru 📩",
          message: `${r.sender_name} - ${r.subject}`,
          type: "request",
          created_at: r.created_at,
          is_read: r.status !== 'unread'
        })));
      }
    };

    fetchRequests();

    // 2. Realtime Listener
    const channel = supabase
      .channel("admin-notifs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mentee_requests" },
        (payload: { new: { id: string, sender_name: string, category: string, subject: string, created_at: string } }) => {
          const r = payload.new;
          const newNotif: AdminNotification = {
            id: r.id,
            title: "Ada Inbox Baru! 📩",
            message: `${r.sender_name} mengirimkan [${r.category}]: ${r.subject}`,
            type: "request",
            created_at: r.created_at,
            is_read: false
          };
          
          setNotifications(prev => [newNotif, ...prev.slice(0, 9)]);
          setActiveToast(newNotif);
          setTimeout(() => setActiveToast(null), 8000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAction = async (n: AdminNotification) => {
    // Show Modal instead of navigating
    const { data } = await supabase
      .from("mentee_requests")
      .select("*")
      .eq("id", n.id)
      .single();

    if (data) {
      setSelectedDetail(data);
    }
    setIsOpen(false);
    setActiveToast(null);
  };

  const markAllAsRead = async () => {
    const { error } = await supabase
      .from("mentee_requests")
      .update({ status: 'read' })
      .eq("status", "unread");

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "request": return <div className="w-10 h-10 rounded-xl bg-[#4880FF] flex items-center justify-center text-white"><Inbox className="w-5 h-5" /></div>;
      case "progress": return <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white"><User className="w-5 h-5" /></div>;
      default: return <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white"><Info className="w-5 h-5" /></div>;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* 1. Floating Bell Icon (Admin Style) */}
      <div className={`fixed bottom-8 right-8 z-[100] ${isMobile ? '!bottom-24 !right-6' : ''}`}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`relative ${isMobile ? 'w-14 h-14' : 'w-[52px] h-[52px]'} rounded-2xl bg-white border border-slate-200 shadow-xl flex items-center justify-center text-[#202224] group hover:bg-[#4880FF] hover:text-white transition-all duration-300`}
        >
          <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
          
          {unreadCount > 0 && (
            <span className={`absolute -top-1 -right-1 ${isMobile ? 'w-5 h-5 text-[9px]' : 'w-6 h-6 text-[10px]'} bg-[#F93C65] text-white font-black rounded-full border-4 border-white flex items-center justify-center shadow-lg`}>
              {unreadCount}
            </span>
          )}
        </motion.button>

        {/* 2. Panel (Opens upward) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={isMobile ? { opacity: 0, y: 100 } : { opacity: 0, y: -10, scale: 0.95, x: 20 }}
              animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={isMobile ? { opacity: 0, y: 100 } : { opacity: 0, y: -10, scale: 0.95, x: 20 }}
              className={`absolute bottom-[70px] right-0 ${isMobile ? 'fixed inset-x-0 bottom-0 top-[15vh] w-full rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.1)]' : 'w-[400px] rounded-[2.5rem] shadow-2xl origin-bottom-right'} bg-white border border-slate-100 overflow-hidden z-20 text-left`}
            >

              {isMobile && (
                <div className="w-full h-1.5 flex justify-center mt-4 mb-2">
                   <div className="w-12 h-1 bg-slate-100 rounded-full" />
                </div>
              )}
              <div className={`${isMobile ? 'p-10' : 'p-8'} border-b border-slate-50 flex items-center justify-between ${isMobile ? 'bg-white' : 'bg-slate-50/50'}`}>

                <div>
                  <h3 className="text-xl font-extrabold text-[#202224] leading-none tracking-tight">System Events</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Mentee Activity Center</p>
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] font-black text-[#4880FF] uppercase tracking-wider hover:underline"
                  >
                    Mark all Read
                  </button>
                )}
              </div>

              <div className="max-h-[450px] overflow-y-auto p-6 space-y-4 no-scrollbar text-left font-sans">
                {notifications.length === 0 ? (
                  <div className="py-16 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto">
                        <Inbox className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-400">Belum ada aktivitas masuk.</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <motion.div
                      key={n.id}
                      onClick={() => handleAction(n)}
                      className={`p-5 rounded-[2rem] border transition-all cursor-pointer hover:shadow-lg active:scale-[0.98] ${n.is_read ? 'bg-white border-slate-100' : 'bg-[#4880FF]/5 border-[#4880FF]/10'}`}
                    >
                      <div className="flex gap-4 items-start">
                        <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center shrink-0 ${
                          n.type === 'request' ? 'bg-[#4880FF]/10 text-[#4880FF]' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          {n.type === 'request' ? <Inbox className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <h4 className={`text-[15px] font-extrabold truncate ${n.is_read ? 'text-[#202224]' : 'text-[#4880FF]'}`}>{n.title}</h4>
                          <p className="text-[13px] text-slate-500 font-medium leading-relaxed line-clamp-2">{n.message}</p>
                          <div className="flex items-center gap-2 pt-1">
                             <Clock className="w-3 h-3 text-slate-300" />
                             <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              
              <div className="p-6 bg-slate-50/50 text-center border-t border-slate-100">
                <button onClick={() => router.push("/admin/mentor")} className="text-xs font-black text-[#4880FF] uppercase tracking-widest hover:underline">Open Full Inbox</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Toast Popup (Top Right) */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, x: 50 }}
            onClick={() => handleAction(activeToast)}
            className="fixed top-24 right-8 z-[1000] w-[90vw] max-w-sm cursor-pointer"
          >
            <div className="bg-white/95 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] p-7 shadow-[0_25px_50px_-12px_rgba(72,128,255,0.25)] flex items-start gap-6 relative overflow-hidden ring-1 ring-[#4880FF]/20 group hover:shadow-[0_25px_60px_-12px_rgba(72,128,255,0.4)] transition-all">
              <div className="absolute top-0 left-0 bottom-0 w-2.5 bg-[#4880FF]" />

              <div className="shrink-0 scale-110">
                  {getIcon(activeToast.type)}
              </div>

              <div className="flex-1 space-y-1.5 text-left text-sans">
                <h4 className="text-[#202224] font-black text-xl tracking-tight leading-tight">{activeToast.title}</h4>
                <p className="text-slate-500 text-[14px] font-bold leading-relaxed font-sans">
                  {activeToast.message}
                </p>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); setActiveToast(null); }}
                className="shrink-0 p-1.5 rounded-xl hover:bg-slate-100 text-slate-300 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>

              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 8, ease: "linear" }}
                className="absolute bottom-0 left-0 h-1.5 bg-[#4880FF]" 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Global Detail Modal (Shows on current page) */}
      <AnimatePresence>
        {selectedDetail && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedDetail(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }} 
               animate={{ opacity: 1, scale: 1, y: 0 }} 
               exit={{ opacity: 0, scale: 0.9, y: 20 }} 
               className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
             >
                <div className="h-[90px] border-b border-[#F5F6FA] flex items-center justify-between px-10">
                   <div className="flex items-center gap-4">
                      <button onClick={() => setSelectedDetail(null)} className="w-[44px] h-[44px] rounded-full bg-[#F5F6FA] flex items-center justify-center hover:bg-slate-100 transition-all"><X size={20} /></button>
                      <h3 className="text-[18px] font-extrabold text-[#202224]">Quick View Request</h3>
                   </div>
                   <button onClick={() => { setSelectedDetail(null); router.push("/admin/mentor"); }} className="text-[#4880FF] font-bold text-sm hover:underline">Go to Inbox</button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-10 text-left no-scrollbar">
                   <div className="flex justify-between items-start">
                      <div className="flex gap-6">
                         <div className="w-[70px] h-[70px] rounded-2xl overflow-hidden border-4 border-slate-50 shadow-sm relative">
                            <img src={selectedDetail.sender_avatar || `https://i.pravatar.cc/150?u=${selectedDetail.sender_name}`} className="w-full h-full object-cover" alt="Sender Avatar" />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#20C997] border-2 border-white flex items-center justify-center text-white">
                               <CheckCircle2 size={12} />
                            </div>
                         </div>
                         <div className="space-y-1">
                            <h4 className="text-[24px] font-extrabold text-[#202224] tracking-tight">{selectedDetail.sender_name}</h4>
                            <div className="flex items-center gap-3">
                               <span className="text-[13px] font-bold text-[#202224] opacity-40">{selectedDetail.sender_email}</span>
                               <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                               <span className="text-[13px] font-bold text-[#4880FF]">{selectedDetail.category}</span>
                            </div>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[12px] font-extrabold text-[#202224] opacity-30 uppercase tracking-widest mb-1">Received</p>
                         <p className="text-[14px] font-extrabold text-[#202224]">{new Date(selectedDetail.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, Today</p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="p-6 rounded-2xl bg-[#F5F6FA] border border-slate-100">
                         <h3 className="text-[18px] font-extrabold text-[#202224]">{selectedDetail.subject}</h3>
                      </div>
                      <div className="text-slate-600 leading-relaxed space-y-4 whitespace-pre-wrap font-sans text-sm font-medium">
                        {selectedDetail.content || selectedDetail.snippet}
                      </div>
                   </div>

                   <div className="pt-10 border-t border-[#F5F6FA]">
                      <Button onClick={() => { setSelectedDetail(null); router.push("/admin/mentor"); }} className="w-full h-[60px] rounded-2xl bg-[#4880FF] text-white font-extrabold text-[16px] shadow-lg shadow-blue-500/20">
                        Process this Request in Inbox
                      </Button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
