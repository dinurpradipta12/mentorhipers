"use client";

import React, { useEffect, useState } from "react";
import { Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

export const AppUpdateNotifier = () => {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [newVersion, setNewVersion] = useState("1.0.0");

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
            setNewVersion(payload.new.app_version);
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
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
          className="fixed bottom-6 right-6 z-[10000] w-[320px]"
        >
          {/* Dark Mode Minimalist UI */}
          <div className="bg-[#2A2A2A] border border-[#3A3A3A] shadow-2xl rounded-[20px] p-8 flex flex-col items-center text-center">
            
            <div className="mb-4 text-white/90">
               <Leaf strokeWidth={1.5} size={48} className="rotate-0 text-white" />
            </div>

            <h3 className="text-white text-[18px] font-semibold mb-1">
              Updated to {newVersion}
            </h3>
            
            <p className="text-[#9A9A9A] text-[15px] mb-6">
              Relaunch to apply
            </p>

            <button 
              onClick={() => window.location.reload()} 
              className="w-full py-3 px-4 rounded-xl border border-[#444444] text-white bg-transparent hover:bg-[#333333] transition-colors font-medium text-[15px]"
            >
              Relaunch
            </button>
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
