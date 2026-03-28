"use client";

import React, { useState, useEffect } from "react";
import { 
  Menu, RefreshCcw
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AdminHeaderProps {
  title?: string;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  showSearch?: boolean;
  children?: React.ReactNode;
}

export default function AdminHeader({ title, isSidebarOpen, toggleSidebar, showSearch = true, children }: AdminHeaderProps) {
  const [profile, setProfile] = useState<{
    name: string;
    avatar: string;
    manual_status: string;
    status_message: string;
  }>({
    name: "Admin",
    avatar: "",
    manual_status: "auto",
    status_message: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.from('mentor_profile').select('*').eq('id', 1).single();
      if (data) {
        setProfile({
          name: data.name,
          avatar: data.avatar,
          manual_status: data.manual_status || "auto",
          status_message: data.status_message || ""
        });
      }
    };
    fetchProfile();

    const channel = supabase
      .channel('header_profile_sync')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'mentor_profile' }, (payload) => {
        if (payload.new) {
          setProfile((prev) => ({
            ...prev,
            manual_status: payload.new.manual_status,
            status_message: payload.new.status_message
          }));
        }
      })
      .subscribe();

    return () => {
       supabase.removeChannel(channel);
    };
  }, []);

  const handleStatusChange = async (newStatus: string) => {
    setProfile((prev) => ({ ...prev, manual_status: newStatus }));
    await supabase.from('mentor_profile').update({ manual_status: newStatus }).eq('id', 1);
  };

  const handleMessageChange = (val: string) => {
    setProfile((prev) => ({ ...prev, status_message: val }));
    
    // Auto-save debounce
    if ((window as any).headerStatusTimeout) clearTimeout((window as any).headerStatusTimeout);
    (window as any).headerStatusTimeout = setTimeout(async () => {
      await supabase.from('mentor_profile').update({ status_message: val }).eq('id', 1);
    }, 800);
  };

  const triggerAppUpdate = async () => {
    if (confirm("Kirim sinyal 'App Update' ke seluruh layar mentee sekarang?")) {
      const newVersion = `v.${Date.now()}`;
      await supabase.from('app_settings').update({ app_version: newVersion }).eq('id', 1);
      alert("Sinyal Update Sistem berhasil disebarkan!");
    }
  };

  return (
    <div 
      className="fixed top-0 z-40 px-6 pointer-events-none transition-all duration-300" 
      style={{ 
        paddingTop: 'calc(env(safe-area-inset-top, 20px) + 20px)',
        left: isSidebarOpen ? '240px' : '80px',
        width: isSidebarOpen ? 'calc(100% - 240px)' : 'calc(100% - 80px)'
      }}
    >
      <header className="bg-white/80 backdrop-blur-xl border border-white/20 px-8 flex items-center justify-between rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] pointer-events-auto mx-auto max-w-[1700px] w-full transition-all duration-500 hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)]" style={{ minHeight: '80px' }}>
        <div className="flex items-center gap-6">
          <button onClick={toggleSidebar} className="p-2 hover:bg-slate-50/50 rounded-lg text-slate-400 transition-all active:scale-95">
             <Menu size={20} />
          </button>
          {title ? (
             <h2 className="text-[20px] font-extrabold text-[#202224] tracking-tight">{title}</h2>
          ) : showSearch ? (
             <div className="relative w-[300px] xl:w-[400px]">
                <Menu className="absolute left-5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#202224] opacity-40" />
                <input 
                  placeholder="Search" 
                  className="w-full h-[38px] rounded-full bg-slate-50/50 border border-[#D5D5D5] pl-12 pr-6 text-[14px] font-semibold focus:outline-none focus:ring-4 ring-accent/5 transition-all"
                />
             </div>
          ) : null}
       </div>

       <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-3 pr-6 border-r border-[#E0E0E0]/50">
            <input 
                value={profile.status_message || ""}
                onChange={(e) => handleMessageChange(e.target.value)}
                placeholder="Status..."
                className="h-[46px] w-[200px] xl:w-[280px] bg-slate-50/50 border border-slate-100 text-slate-700 text-[13px] font-bold rounded-2xl px-5 outline-none focus:ring-4 ring-accent/10 transition-all placeholder:font-medium placeholder:text-slate-300"
            />
            <select 
              value={profile.manual_status} 
              onChange={(e) => handleStatusChange(e.target.value)}
              className="h-[46px] bg-slate-50/50 border border-slate-100 text-slate-700 text-[13px] font-bold rounded-2xl px-4 outline-none focus:ring-4 ring-accent/10 cursor-pointer appearance-none hover:bg-white transition-all min-w-[140px] text-center"
            >
               <option value="auto">🤖 Auto Status</option>
               <option value="online">🟢 Available</option>
               <option value="busy">🔴 In Meeting</option>
               <option value="away">🟡 Away</option>
            </select>
            
            <button onClick={triggerAppUpdate} className="flex items-center justify-center w-[46px] h-[46px] rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition-all active:scale-95 group" title="Refresh Mentees View">
               <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-700" />
            </button>
            {children}
          </div>

          <div className="flex items-center gap-4 pl-2">
             <div className="text-right hidden sm:block">
                <p className="text-[14px] font-extrabold text-[#202224]">{profile.name}</p>
                <p className="text-[12px] font-bold text-[#202224] opacity-60 uppercase tracking-widest scale-[0.8] origin-right">Mentor</p>
             </div>
             <div className="w-[48px] h-[48px] rounded-2xl overflow-hidden border-2 border-white shadow-sm relative">
                <img src={profile.avatar || `https://i.pravatar.cc/150?u=mentor`} alt={profile.name} className="w-full h-full object-cover" />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${profile.manual_status === 'busy' ? 'bg-rose-500' : profile.manual_status === 'away' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
             </div>
          </div>
       </div>
      </header>
    </div>
  );
}
