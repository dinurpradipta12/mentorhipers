"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Home, Compass } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFoundContent() {
  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-blue-500/30 selection:text-white">
      {/* Background Magic */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,_#1e1b4b_0%,_transparent_50%),radial-gradient(circle_at_70%_80%,_#0f172a_0%,_transparent_50%)]"/>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[length:40px_40px]"/>

      {/* Floating Blobs */}
      <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[130px] rounded-full animate-pulse"/>
      <div className="absolute bottom-[10%] -right-[10%] w-[30%] h-[30%] bg-indigo-600/10 blur-[100px] rounded-full"/>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl w-full text-center relative z-10 space-y-12"
      >
        <div className="relative">
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-full max-w-lg mx-auto"
          >
             <img 
               src="/not_found_illustration.png" 
               alt="Lost in Space" 
               className="w-full h-auto drop-shadow-[0_20px_50px_rgba(59,130,246,0.3)]"
             />
          </motion.div>

          {/* Glitchy 404 text overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
             <h1 className="text-[120px] md:text-[200px] font-black text-white/5 tracking-tighter select-none">404</h1>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
             <div className="px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest flex items-center gap-3">
               <Compass size={14} className="animate-spin-slow"/>
               Signal Lost in Digital Space
             </div>
             <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
               Halaman Tidak <span className="text-blue-500 italic">Ditemukan.</span>
             </h2>
          </div>
          
          <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium leading-relaxed">
            Sepertinya koordinat yang Anda tuju tidak terdaftar di sistem Ruang Sosmed. 
            Mungkin link sudah kedaluwarsa atau terjadi kesalahan ketik.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
           <Button 
             onClick={() => window.history.back()}
             className="h-16 px-10 rounded-[28px] bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3"
           >
             <ArrowLeft size={18}/> Kembali
           </Button>
           
           <Link href="/ruang-sosmed">
             <Button className="h-16 px-10 rounded-[28px] bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-500/20 transition-all flex items-center gap-3">
               Portal Utama <Home size={18}/>
             </Button>
           </Link>
        </div>
      </motion.div>

      <div className="absolute bottom-10 left-12 right-12 flex justify-between items-center opacity-20 hidden md:flex">
         <p className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Ruang Sosmed OS v2.4.1</p>
         <p className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Protocol: 404_NOT_FOUND</p>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
