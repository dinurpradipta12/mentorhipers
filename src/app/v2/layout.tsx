"use client";

import React, { useState, useEffect } from "react";
import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function V2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [appSettings, setAppSettings] = useState<any>(null);
  const [mentorProfile, setMentorProfile] = useState<any>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data: settings } = await supabase.from('app_settings').select('*').eq('id', 1).single();
    if (settings) setAppSettings(settings);

    const { data: mentor } = await supabase.from('mentor_profile').select('*').eq('id', 1).single();
    if (mentor) setMentorProfile(mentor);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-blue-100 selection:text-blue-700">
      {/* V2 Branding / Header */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 z-50 flex items-center justify-between px-8 shadow-sm">
        <Link href="/v2" className="flex items-center group">
          {appSettings?.app_logo && (
            <img src={appSettings.app_logo} className="h-10 w-auto object-contain transition-transform group-hover:scale-105" alt="Logo" />
          )}
          {!appSettings?.app_logo && (
            <span className="font-black text-xl tracking-tighter">MH</span>
          )}
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href="/admin/dashboard" className="px-6 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 border border-slate-100">
            <LogOut size={14} className="rotate-180" /> Back to V1
          </Link>
          
          <div className="h-8 w-px bg-slate-100" />
          
          <div className="flex items-center gap-4 pl-2">
             <div className="text-right hidden sm:block">
                <p className="text-[11px] font-black leading-none">{mentorProfile?.name || "Premium Mentor"}</p>
                <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Online</p>
             </div>
             <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shadow-inner flex items-center justify-center text-slate-300">
                {mentorProfile?.avatar ? (
                  <img src={mentorProfile.avatar} className="w-full h-full object-cover" alt="Avatar" />
                ) : (
                  <User size={20} />
                )}
             </div>
          </div>
        </div>
      </nav>

      <main className="pt-20 min-h-screen">
        {children}
      </main>

      {/* Footer Branding */}
      <footer className="py-10 text-center opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Gradual Rollout System (V1.9.0)</p>
      </footer>
    </div>
  );
}
