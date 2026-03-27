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
    <div className="relative z-10 space-y-10">
      {/* Header ID */}
      <div className="flex items-center justify-between">
         <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-sky-300" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Verified Scholar</p>
            </div>
            <p className="text-white font-black text-xl italic">{isRuangSosmed ? 'Ruang Sosmed.' : 'Mentorhipers.'}</p>
         </div>
         <Fingerprint size={40} className="text-white/20" />
      </div>

      {/* Profile Area */}
      <div className="flex flex-col items-center gap-6 py-6">
         <div className="relative">
            <div className="w-40 h-40 rounded-[48px] border-4 border-white/30 p-2 transform rotate-3">
               <div className="w-full h-full rounded-[38px] overflow-hidden bg-white shadow-2xl">
                  {currentUser?.avatar_url ? (
                     <img src={currentUser.avatar_url} className="w-full h-full object-cover" />
                  ) : (
                     <div className={`w-full h-full flex items-center justify-center ${isRuangSosmed ? 'text-blue-500' : 'text-indigo-600'} text-5xl font-black`}>{currentUser?.full_name?.charAt(0)}</div>
                  )}
               </div>
            </div>
         </div>

         <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase whitespace-pre-line leading-tight">{currentUser?.full_name}</h2>
            <div className="px-5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-sky-200 text-[9px] font-black uppercase tracking-[0.2em] w-fit mx-auto">
               {isRuangSosmed ? 'RS' : 'MH'}-{resolvedParams.id.substring(0,4).toUpperCase()}-{(currentUser?.id?.substring(0,6) || "STU").toUpperCase()}
            </div>
         </div>
      </div>

      {/* Footer Info */}
      <div className="pt-8 border-t border-white/10 flex items-center justify-between">
         <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
               <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Active Batch</p>
               <p className="text-xs font-bold text-white uppercase">{batch?.name || "Member Batch"}</p>
            </div>
            <div className="space-y-1">
               <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Authorized Date</p>
               <p className="text-xs font-bold text-white">{new Date(me?.created_at || Date.now()).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
            </div>
         </div>
         
         {/* Decorative QR */}
         <div className="p-4 bg-white/10 border border-white/20 rounded-3xl backdrop-blur-md group hover:bg-white transition-all">
            <QrCode size={40} className={`text-white group-hover:${isRuangSosmed ? 'text-blue-500' : 'text-indigo-600'} transition-all`} />
         </div>
      </div>

      {/* Signature / Stamp Overlay */}
      <div className="absolute bottom-10 right-1/2 translate-x-1/2 opacity-5 pointer-events-none scale-150 -z-10">
         <Star size={100} fill="currentColor" className="text-white" />
      </div>
    </div>
  );
}
