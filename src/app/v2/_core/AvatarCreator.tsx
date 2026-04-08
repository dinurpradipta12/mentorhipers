"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, RotateCcw, Sparkles, User, Palette, Shirt, Eye, Smile } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// 🎨 AVATAR CONFIGURATIONS (Including Hijab & Variations)
const OPTIONS = {
  top: [
    { id: 'hijab', label: 'Hijab', category: 'Head Cover' },
    { id: 'turban', label: 'Turban', category: 'Head Cover' },
    { id: 'longHair', label: 'Long Hair', category: 'Hair' },
    { id: 'shortHair', label: 'Short Hair', category: 'Hair' },
    { id: 'bob', label: 'Bob Cut', category: 'Hair' },
    { id: 'curly', label: 'Curly', category: 'Hair' },
    { id: 'shaggy', label: 'Shaggy', category: 'Hair' },
    { id: 'shaved', label: 'Shaved', category: 'Hair' },
    { id: 'hat', label: 'Casual Hat', category: 'Hair' },
  ],
  skinColor: [
    { id: 'edb98a', label: 'Light' },
    { id: 'f8d25c', label: 'Yellowish' },
    { id: 'fd9841', label: 'Tan' },
    { id: 'ae5d29', label: 'Brown' },
    { id: '614335', label: 'Dark' },
  ],
  clothing: [
    { id: 'blazer', label: 'Professional Blazer' },
    { id: 'hoodie', label: 'Casual Hoodie' },
    { id: 'overall', label: 'Overall' },
    { id: 'shirt', label: 'Classic Shirt' },
    { id: 'graphicShirt', label: 'Graphic Tee' },
  ],
  eyes: [
    { id: 'default', label: 'Normal' },
    { id: 'happy', label: 'Happy' },
    { id: 'surprised', label: 'Surprised' },
    { id: 'wink', label: 'Wink' },
    { id: 'squint', label: 'Squint' },
  ],
  backgroundColor: [
    { id: 'b6e3f4', label: 'Cloud Blue' },
    { id: 'c0aede', label: 'Lavender' },
    { id: 'd1d4f9', label: 'Indigo Soft' },
    { id: 'ffd5dc', label: 'Rose Pink' },
    { id: 'ffdfbf', label: 'Peach' },
  ]
};

// 🛠 Mapping system for DiceBear Avataaars
const DICEBEAR_MAP = {
  hijab: 'top=hijab&accessories=none&hairColor=2c1b18',
  turban: 'top=turban&accessories=none',
  longHair: 'top=longHairStraight&accessories=none',
  shortHair: 'top=shortHairShortFlat&accessories=none',
  bob: 'top=bob&accessories=none',
  curly: 'top=curly&accessories=none',
  shaggy: 'top=shaggy&accessories=none',
  shaved: 'top=sides&accessories=none',
  hat: 'top=hat&accessories=none',
};

interface AvatarCreatorProps {
  onSave: (url: string) => void;
  onCancel: () => void;
  initialName?: string;
}

export default function AvatarCreator({ onSave, onCancel, initialName }: AvatarCreatorProps) {
  const [activeTab, setActiveTab] = useState<'top' | 'skinColor' | 'clothing' | 'eyes' | 'backgroundColor'>('top');
  const [selections, setSelections] = useState({
    top: 'hijab',
    skinColor: 'edb98a',
    clothing: 'blazer',
    eyes: 'default',
    backgroundColor: 'b6e3f4'
  });

  const avatarUrl = useMemo(() => {
    const topParams = DICEBEAR_MAP[selections.top as keyof typeof DICEBEAR_MAP] || `top=${selections.top}`;
    return `https://api.dicebear.com/7.x/avataaars/svg?${topParams}&skinColor=${selections.skinColor}&clothing=${selections.clothing}&eyes=${selections.eyes}&backgroundColor=${selections.backgroundColor}`;
  }, [selections]);

  const handleRandomize = () => {
    const random = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)].id;
    setSelections({
      top: random(OPTIONS.top),
      skinColor: random(OPTIONS.skinColor),
      clothing: random(OPTIONS.clothing),
      eyes: random(OPTIONS.eyes),
      backgroundColor: random(OPTIONS.backgroundColor)
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-5xl mx-auto p-4 lg:p-0">
      {/* 🖼 PREVIEW SECTION */}
      <div className="lg:w-1/3 flex flex-col items-center gap-6">
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
          <motion.div 
            key={avatarUrl}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-64 h-64 lg:w-72 lg:h-72 rounded-[40px] bg-slate-900 border-4 border-white/10 overflow-hidden relative shadow-2xl"
          >
             <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
          </motion.div>
          
          <button 
            onClick={handleRandomize}
            className="absolute bottom-4 right-4 p-3 bg-white text-slate-950 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-xl font-black text-white">Identity Concept</h3>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">{initialName || 'New Student'}</p>
        </div>
      </div>

      {/* ⚙️ CUSTOMIZER SECTION */}
      <div className="flex-1 bg-slate-900/50 border border-white/5 rounded-[40px] p-6 lg:p-8 flex flex-col gap-8 backdrop-blur-xl">
        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'top', icon: User, label: 'Style' },
            { id: 'skinColor', icon: Palette, label: 'Skin' },
            { id: 'clothing', icon: Shirt, label: 'Outfit' },
            { id: 'eyes', icon: Eye, label: 'Vibe' },
            { id: 'backgroundColor', icon: Palette, label: 'BG' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Options Grid */}
        <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {OPTIONS[activeTab as keyof typeof OPTIONS].map((option: any) => (
              <button
                key={option.id}
                onClick={() => setSelections({ ...selections, [activeTab]: option.id })}
                className={`group relative p-4 rounded-3xl border-2 transition-all text-left overflow-hidden ${
                  selections[activeTab as keyof typeof selections] === option.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/5 bg-white/5 hover:border-white/20'
                }`}
              >
                {activeTab === 'backgroundColor' || activeTab === 'skinColor' ? (
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-xl shadow-inner border border-black/10" 
                      style={{ backgroundColor: `#${option.id}` }} 
                    />
                    <span className="text-[10px] font-black uppercase tracking-tight text-white group-hover:text-blue-400 transition-colors">
                      {option.label}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                      selections[activeTab as keyof typeof selections] === option.id ? 'text-blue-400' : 'text-slate-500'
                    }`}>
                      {option.category || activeTab}
                    </span>
                    <span className="text-sm font-black text-white">{option.label}</span>
                  </div>
                )}

                {selections[activeTab as keyof typeof selections] === option.id && (
                  <div className="absolute top-3 right-3 text-blue-500">
                    <Check size={16} strokeWidth={4} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-white/5">
          <Button 
            variant="ghost" 
            onClick={onCancel}
            className="flex-1 h-14 rounded-2xl text-slate-400 hover:text-white"
          >
            Nanti Saja
          </Button>
          <Button 
            onClick={() => onSave(avatarUrl)}
            className="flex-[2] h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-xl shadow-blue-600/20"
          >
            <Sparkles className="mr-2" size={18} />
            Simpan Identitas
          </Button>
        </div>
      </div>
    </div>
  );
}
