"use client";

import React, { useEffect, useState } from "react";
import { RefreshCw, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const AppUpdateNotifier = () => {
  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    let currentVersion = "";

    const fetchInitialVersion = async () => {
      const { data } = await supabase.from('app_settings').select('app_version').single();
      if (data?.app_version) {
        currentVersion = data.app_version;
      }
    };
    
    fetchInitialVersion();

    const channel = supabase.channel('app_updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'app_settings' },
        (payload: { new: { app_version?: string } }) => {
          if (currentVersion && payload.new.app_version && payload.new.app_version !== currentVersion) {
            setHasUpdate(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!hasUpdate) return null;

  return (
    <div className="fixed inset-x-0 bottom-[100px] z-[9999] flex justify-center px-4 animate-in slide-in-from-bottom flex-col items-center pointer-events-none">
      <div className="bg-slate-900 border border-slate-700 shadow-2xl shadow-[#4880FF]/20 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 max-w-md w-full mx-auto pointer-events-auto ring-4 ring-slate-900/10">
        <div className="w-12 h-12 rounded-xl bg-[#4880FF]/20 text-[#4880FF] flex items-center justify-center shrink-0">
          <Zap size={24} className="fill-[#4880FF]" />
        </div>
        <div className="text-center md:text-left flex-1">
          <h4 className="text-sm font-black text-white">Update Sistem Tersedia! 🚀</h4>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-relaxed">Sistem berhasil di-deploy ke versi terbaru oleh Admin. Klik segarkan untuk menikmati fitur terbaru.</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="w-full md:w-auto px-5 h-10 rounded-xl bg-[#4880FF] text-white font-black text-xs hover:bg-blue-600 transition-colors uppercase tracking-widest shrink-0 flex items-center justify-center gap-2 active:scale-95"
        >
          <RefreshCw size={14} className="" />
          Segarkan
        </button>
      </div>
    </div>
  );
};
