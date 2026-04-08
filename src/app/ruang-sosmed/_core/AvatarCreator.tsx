"use client";

import React, { useState, useEffect, memo } from "react";
import { RotateCcw, Check, Sparkles, User, Palette } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

//============================================================
//📁 CONFIG & PRELOADING
//============================================================

const LOCAL_AVATARS = [
  { id: '1',  path: '/avatars/avatar1.svg',  label: 'Character 1' },
  { id: '2',  path: '/avatars/avatar2.svg',  label: 'Character 2' },
  { id: '3',  path: '/avatars/avatar3.svg',  label: 'Character 3' },
  { id: '4',  path: '/avatars/avatar4.svg',  label: 'Character 4' },
  { id: '5',  path: '/avatars/avatar5.svg',  label: 'Character 5' },
  { id: '6',  path: '/avatars/avatar6.svg',  label: 'Character 6' },
  { id: '7',  path: '/avatars/avatar7.svg',  label: 'Character 7' },
  { id: '8',  path: '/avatars/avatar8.svg',  label: 'Character 8' },
  { id: '9',  path: '/avatars/avatar9.svg',  label: 'Character 9' },
  { id: '10', path: '/avatars/avatar10.svg', label: 'Character 10' },
  { id: '11', path: '/avatars/avatar11.svg', label: 'Character 11' },
  { id: '12', path: '/avatars/avatar12.svg', label: 'Character 12' },
];

const COLORS = [
  { id: 'teal',   hex: '#5BC8AF', bg: 'bg-[#5BC8AF]' },
  { id: 'pink',   hex: '#F4A7B9', bg: 'bg-[#F4A7B9]' },
  { id: 'purple', hex: '#B39DDB', bg: 'bg-[#B39DDB]' },
  { id: 'amber',  hex: '#FFCC80', bg: 'bg-[#FFCC80]' },
  { id: 'blue',   hex: '#90CAF9', bg: 'bg-[#90CAF9]' },
  { id: 'dark',   hex: '#37474F', bg: 'bg-[#37474F]' },
];

//Sub-komponen yang di-Memo agar tidak render ulang percuma
const AvatarItem = memo(({ item, isSelected, onClick }: any) => (
  <button
    onClick={() => onClick(item)}
    className={`group relative aspect-square rounded-[32px] border-2 transition-all p-3 flex items-center justify-center ${
      isSelected 
      ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_25px_rgba(59,130,246,0.25)]' 
      : 'border-white/5 bg-white/5 hover:border-white/20'
    }`}
  >
    <img 
        src={item.path} 
        alt={item.label} 
        loading="lazy"
        className="w-full h-full object-contain pointer-events-none group-hover:scale-110 transition-transform duration-300" 
   />
    {isSelected && (
      <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-2 shadow-xl border-2 border-slate-900">
        <Check size={12} className="text-white" strokeWidth={5}/>
      </div>
    )}
  </button>
));

AvatarItem.displayName = "AvatarItem";

interface AvatarCreatorProps {
  onSave: (url: string) => void;
  onCancel: () => void;
  initialName?: string;
}

export default function AvatarCreator({ onSave, onCancel, initialName }: AvatarCreatorProps) {
  const [sel, setSel] = useState(LOCAL_AVATARS[0]);
  const [color, setColor] = useState(COLORS[0]);

 //🚀 OPTIMIZATION: Preload all images on mount
  useEffect(() => {
    LOCAL_AVATARS.forEach((avatar) => {
      const img = new Image();
      img.src = avatar.path;
    });
  }, []);

  const handleRandom = () => {
    setSel(LOCAL_AVATARS[Math.floor(Math.random() * LOCAL_AVATARS.length)]);
    setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10 w-full max-w-5xl mx-auto p-4 lg:p-0">
      <div className="lg:w-[340px] flex-shrink-0 flex flex-col items-center gap-8">
        <div className="relative">
          <div 
            className="absolute -inset-6 blur-3xl opacity-30 transition-all duration-700"
            style={{ backgroundColor: color.hex }}
         />

          <motion.div
            key={sel.id + color.id}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-64 h-64 lg:w-80 lg:h-80 rounded-[60px] border-8 border-white shadow-2xl overflow-hidden flex items-center justify-center relative ${color.bg}`}
          >
            <img 
              src={sel.path} 
              alt={sel.label}
              className="w-full h-full object-contain scale-[1.15] translate-y-3 transition-transform duration-500"
           />
          </motion.div>
          
          <button 
            onClick={handleRandom}
            className="absolute -bottom-2 -right-2 p-4 bg-white text-slate-900 rounded-3xl shadow-2xl hover:scale-110 active:scale-95 transition-all z-20 group"
          >
            <RotateCcw size={22} className="group-hover:rotate-180 transition-transform duration-500"/>
          </button>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-white italic tracking-tighter">Identity Setup</h2>
          <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.4em]">{initialName || 'Discovery Mode'}</p>
        </div>
      </div>

      <div className="flex-1 bg-slate-900/40 border border-white/5 rounded-[60px] p-6 lg:p-10 flex flex-col gap-10 backdrop-blur-2xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <User size={16} className="text-blue-400"/>
              <h3 className="font-black text-sm uppercase tracking-widest">Pilih Karakter</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 pr-3">
            {LOCAL_AVATARS.map((item) => (
              <AvatarItem 
                key={item.id} 
                item={item} 
                isSelected={sel.id === item.id} 
                onClick={setSel} 
             />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 text-white">
            <Palette size={16} className="text-amber-400"/>
            <h3 className="font-black text-sm uppercase tracking-widest">Latar Belakang</h3>
          </div>
          <div className="flex gap-4 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => setColor(c)}
                className={`w-12 h-12 rounded-[20px] transition-all relative ${c.bg} ${
                  color.id === c.id ? 'ring-4 ring-white/30 scale-110 shadow-2xl' : 'opacity-60 scale-90 hover:opacity-100 hover:scale-100'
                }`}
             />
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 mt-auto">
          <Button 
            onClick={() => onSave(`${sel.path}?bg=${encodeURIComponent(color.hex)}`)}
            className="w-full h-20 rounded-[35px] bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all"
          >
            <Sparkles size={22}/> Simpan Identitas
          </Button>
        </div>
      </div>
    </div>
  );
}
