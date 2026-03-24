"use client";

import React, { useEffect, useState } from "react";
import { RefreshCw, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

  return (
    <AnimatePresence>
      {hasUpdate && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          className="fixed bottom-12 right-12 z-[10000] max-w-[340px] w-full"
        >
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.6)] rounded-[2.5rem] p-8 overflow-hidden group relative">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#4880FF]/20 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-[#4880FF]/30 transition-all duration-700" />
            
            <div className="relative z-10 text-left">
              <div className="flex items-center gap-5 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#4880FF]/10 border border-[#4880FF]/20 flex items-center justify-center text-[#4880FF] shadow-lg shadow-[#4880FF]/20">
                  <Zap size={24} className="fill-[#4880FF] animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white leading-tight uppercase tracking-widest">New <span className="text-[#4880FF] italic">Update</span></h4>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Version Live Now</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] leading-relaxed text-slate-300 font-medium">
                  Sistem baru saja diperbarui oleh Admin untuk performa yang lebih maksimal. Silakan segarkan aplikasi.
                </p>
                
                <button 
                  onClick={() => window.location.reload()} 
                  className="w-full h-12 rounded-2xl bg-white text-slate-900 font-black text-[10px] hover:bg-slate-100 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-2 active:scale-95 shadow-xl shadow-white/5"
                >
                  <RefreshCw size={14} />
                  Segarkan Sekarang
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
