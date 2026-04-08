"use client";

import React from "react";
import { QrCode, ShieldCheck, Fingerprint, Star } from "lucide-react";

interface IdCardContentProps {
  batch: any;
  currentUser: any;
  me: any;
  resolvedParams: any;
}

export default function IdCardContent({ batch, currentUser, me, resolvedParams }: IdCardContentProps) {
  const isRuangSosmed = batch?.name?.toLowerCase()?.includes('ruang sosmed');

  return (
    <div className={`relative w-full max-w-[420px] mx-auto overflow-hidden rounded-[56px] shadow-2xl border border-white/20 p-10 lg:p-12 ${isRuangSosmed ? 'bg-gradient-to-br from-[#1e40af] to-[#1e3a8a]' : 'bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]'}`}>
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2"/>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2"/>
      
      <div className="relative z-10 space-y-10">
        {/* Header ID */}
        <div className="flex items-center justify-between">
           <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-sky-400"/>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Verified Scholar</p>
              </div>
              <p className="text-white font-black text-2xl italic tracking-tighter">Ruang Sosmed.</p>
           </div>
           <Fingerprint size={44} className="text-white/20"/>
        </div>

        {/* Profile Area */}
        <div className="flex flex-col items-center gap-6 py-4">
           <div className="relative">
              {/* Outer Glow */}
              <div className="absolute -inset-4 bg-white/5 blur-xl rounded-full"/>
              <div className="w-44 h-44 rounded-[52px] border-4 border-white/20 p-2 transform transition-transform hover:rotate-0 rotate-3 bg-white/5 backdrop-blur-md">
                  <div 
                    className="w-full h-full rounded-[42px] overflow-hidden shadow-2xl relative flex items-center justify-center"
                    style={{ backgroundColor: currentUser?.avatar_url?.includes('bg=') ? decodeURIComponent(currentUser.avatar_url.split('bg=')[1]) : '#ffffff' }}
                  >
                     {currentUser?.avatar_url ? (
                        <img src={currentUser.avatar_url} className="w-full h-full object-contain scale-[1.1] translate-y-0.5" alt="Avatar"/>
                     ) : (
                        <div className={`w-full h-full flex items-center justify-center ${isRuangSosmed ? 'text-blue-500' : 'text-indigo-600'} text-6xl font-black italic`}>{currentUser?.full_name?.charAt(0)}</div>
                     )}
                  </div>
              </div>
           </div>

           <div className="text-center space-y-3">
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase whitespace-pre-line leading-tight drop-shadow-md">{currentUser?.full_name}</h2>
              <div className="px-6 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-sky-300 text-[10px] font-black uppercase tracking-[0.3em] w-fit mx-auto shadow-inner">
                 RS-{resolvedParams.id.substring(0,4).toUpperCase()}-{(currentUser?.id?.substring(0,6) || "STU").toUpperCase()}
              </div>
           </div>
        </div>

        {/* Footer Info */}
        <div className="pt-8 border-t border-white/10 flex items-center justify-between gap-4">
           <div className="grid grid-cols-1 gap-5">
              <div className="space-y-1">
                 <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Active Batch</p>
                 <p className="text-xs font-black text-white uppercase tracking-tight">{batch?.name || "Member Batch"}</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Authorized Date</p>
                 <p className="text-xs font-black text-white uppercase tracking-tight">
                   {new Date(me?.created_at || Date.now()).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                 </p>
              </div>
           </div>
           
           {/* Decorative QR Container */}
           <div className="p-5 bg-white/10 border border-white/10 rounded-[32px] backdrop-blur-xl group hover:bg-white transition-all duration-500 shadow-2xl">
              <QrCode size={48} className={`text-white group-hover:${isRuangSosmed ? 'text-blue-600' : 'text-indigo-600'} transition-all`}/>
           </div>
        </div>

        {/* Signature/Star Overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none scale-[3] -z-10 text-white">
           <Star size={120} fill="currentColor"/>
        </div>
      </div>
    </div>
  );
}
