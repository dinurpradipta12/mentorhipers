"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, Trash2, X, Sparkles, Star, BookOpen, MessageCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseV2 as supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'material' | 'assignment' | 'grade' | 'feedback' | 'announcement';
  link: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell({ profileId }: { profileId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!profileId) return;

    fetchNotifications();

    // Real-time subscription
    const channel = supabase
      .channel(`notifications_${profileId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'v2_notifications',
        filter: `profile_id=eq.${profileId}`
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        // Bisa tambahkan toast suara di sini jika mau
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profileId]);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.is_read).length);
  }, [notifications]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('v2_notifications')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (data) setNotifications(data);
  };

  const markAsRead = async (id: string) => {
    await supabase.from('v2_notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllAsRead = async () => {
    await supabase.from('v2_notifications').update({ is_read: true }).eq('profile_id', profileId);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from('v2_notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'grade': return <Star className="text-amber-500" size={16}/>;
      case 'material': return <BookOpen className="text-blue-500" size={16}/>;
      case 'feedback': return <MessageCircle className="text-emerald-500" size={16}/>;
      case 'announcement': return <AlertCircle className="text-rose-500" size={16}/>;
      default: return <Sparkles className="text-purple-500" size={16}/>;
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-xl hover:shadow-blue-500/10 transition-all relative group"
      >
        <Bell size={20} className={unreadCount > 0 ? "animate-swing" : ""}/>
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center">
            <span className="text-[8px] font-black text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)}/>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 mt-4 w-80 md:w-96 bg-white rounded-[32px] border border-slate-100 shadow-2xl z-[110] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Notifications</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{unreadCount} New items today</p>
                </div>
                <button onClick={markAllAsRead} className="text-[10px] font-black text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1.5 p-2 bg-blue-50 rounded-xl border border-blue-100">
                  <Check size={12}/> Mark all read
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto overflow-x-hidden custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-200">
                      <Bell size={32}/>
                    </div>
                    <p className="text-xs font-bold text-slate-400">Belum ada notifikasi.</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => { markAsRead(n.id); if (n.link) window.location.href = n.link; }}
                      className={`p-5 flex gap-4 transition-all cursor-pointer relative group ${!n.is_read ? 'bg-blue-50/30' : 'hover:bg-slate-50'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center shadow-sm ${!n.is_read ? 'bg-white' : 'bg-slate-50'}`}>
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <h4 className={`text-xs font-black truncate ${!n.is_read ? 'text-slate-900' : 'text-slate-500'}`}>{n.title}</h4>
                        <p className="text-[11px] font-medium text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-2">{format(new Date(n.created_at), 'MMM d, HH:mm')}</p>
                      </div>
                      
                      {!n.is_read && <div className="absolute top-6 right-6 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"/>}
                      
                      <button 
                        onClick={(e) => deleteNotification(n.id, e)}
                        className="absolute bottom-5 right-5 w-7 h-7 bg-white opacity-0 group-hover:opacity-100 rounded-lg shadow-sm border border-slate-100 flex items-center justify-center text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all scale-90 group-hover:scale-100"
                      >
                        <Trash2 size={12}/>
                      </button>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-4 border-t border-slate-50 bg-slate-50/50">
                  <Button className="w-full h-10 bg-white border border-slate-200 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-slate-900">View All Archive</Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes swing {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-10deg); }
          60% { transform: rotate(5deg); }
          80% { transform: rotate(-5deg); }
        }
        .animate-swing {
          animation: swing 1s ease-in-out infinite;
          transform-origin: top center;
        }
      `}</style>
    </div>
  );
}
