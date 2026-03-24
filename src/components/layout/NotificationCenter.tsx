"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, Info, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
  created_at: string;
  is_read: boolean;
}

export default function NotificationCenter({ clientId }: { clientId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<Notification | null>(null);

  // 1. Fetch Existing Notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) setNotifications(data);
    };

    fetchNotifications();

    // 2. Realtime Subscription
    const channel = supabase
      .channel(`notifications-${clientId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `client_id=eq.${clientId}`,
        },
        (payload: any) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev]);
          
          // Show Toast (Popup Notification)
          setActiveToast(newNotif);
          setTimeout(() => setActiveToast(null), 8000); // 8 Seconds duration
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId]);

  const markAllAsRead = async () => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("client_id", clientId)
      .eq("is_read", false);

    if (!error) {
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white"><Check className="w-5 h-5 stroke-[3px]" /></div>;
      case "warning": return <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white"><AlertTriangle className="w-5 h-5 stroke-[3px]" /></div>;
      default: return <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white"><Info className="w-5 h-5 stroke-[2.5px]" /></div>;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <>
      {/* 1. Floating Bell Icon */}
      <div className="fixed top-8 right-12 z-[100]">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl flex items-center justify-center text-slate-600 group hover:text-accent transition-colors"
        >
          <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
          
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full border-4 border-white flex items-center justify-center shadow-lg">
              {unreadCount}
            </span>
          )}
        </motion.button>

        {/* 2. Dropdown Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, y: 10, scale: 0.95, x: 20 }}
              className="absolute top-16 right-0 w-80 md:w-96 bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden z-50 origin-top-right text-left"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-sans font-extrabold text-slate-900 leading-none">Notifications</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Aktivitas Terbaru</p>
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto p-4 space-y-3 no-scrollbar text-left">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center space-y-3">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto">
                        <Bell className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-xs font-bold text-slate-400">Belum ada notifikasi.</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <motion.div
                      key={n.id}
                      className={`p-4 rounded-3xl border transition-all ${n.is_read ? 'bg-slate-50/50 border-slate-100/50' : 'bg-accent/5 border-accent/10'}`}
                    >
                      <div className="flex gap-4 items-start">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          n.type === 'success' ? 'bg-emerald-100 text-emerald-600' : n.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {n.type === 'success' ? <Check className="w-4 h-4" /> : n.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                        </div>
                        <div className="space-y-1 overflow-hidden">
                          <h4 className={`text-sm font-extrabold truncate ${n.is_read ? 'text-slate-700' : 'text-slate-900'}`}>{n.title}</h4>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">{n.message}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Toast Popup (Top Right Style) */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, x: 100, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            className="fixed top-24 right-8 z-[1000] w-[90vw] max-w-sm"
          >
            <div className="bg-white/95 backdrop-blur-2xl border border-white rounded-[2rem] p-6 shadow-2xl flex items-start gap-5 relative overflow-hidden group">
              {/* Type-based Left Border Accent */}
              <div className={`absolute top-0 left-0 bottom-0 w-2 ${
                activeToast.type === 'success' ? 'bg-emerald-500' : activeToast.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
              }`} />

              <div className="shrink-0">
                  {getIcon(activeToast.type)}
              </div>

              <div className="flex-1 space-y-1 text-left">
                <h4 className="text-[#202224] font-extrabold text-lg tracking-tight leading-tight">{activeToast.title}</h4>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  {activeToast.message}
                </p>
              </div>

              <button 
                onClick={() => setActiveToast(null)}
                className="shrink-0 p-1 rounded-lg hover:bg-slate-100 text-slate-300 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>

              {/* Progress timer bar */}
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 8, ease: "linear" }}
                className={`absolute bottom-0 left-0 h-1 ${
                  activeToast.type === 'success' ? 'bg-emerald-500' : activeToast.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                }`} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
