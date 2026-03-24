"use client";

import React from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

const AppLoading = () => {
  const [logo, setLogo] = React.useState("/favicon.ico");

  React.useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data } = await supabase.from('app_settings').select('app_logo').eq('id', 1).single();
        if (data?.app_logo) {
          setLogo(data.app_logo);
        }
      } catch (err) {
        console.error("Failed to fetch loading logo:", err);
      }
    };
    fetchLogo();
  }, []);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-white">
      <div className="relative">
        {/* Glow Effect Surround */}
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-[#4880FF] blur-[100px] rounded-full -m-20"
        />

        {/* Logo Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex flex-col items-center"
        >
          {/* Main Breathing Logo */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <img 
               src={logo} 
               alt="Loading icon" 
               className="h-20 w-auto object-contain drop-shadow-2xl" 
            />
          </motion.div>


          {/* Progress Bar (Halus & Tipis) */}
          <div className="mt-8 w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
              className="h-full w-2/3 bg-gradient-to-r from-transparent via-[#4880FF] to-transparent"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AppLoading;
