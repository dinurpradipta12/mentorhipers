"use client";

import React from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  Layers, 
  Lightbulb, 
  CheckSquare, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const BottomNavigation = ({ 
  activeTab, 
  onTabChange 
}: { 
  activeTab?: string; 
  onTabChange?: (tab: string) => void;
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[min(95vw,500px)]">
      <div className="bg-white/70 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-3 px-5 flex items-center justify-between">
        <NavItem 
          icon={<LayoutDashboard className="w-5 h-5" />} 
          label="Dash" 
          active={activeTab === "dashboard"}
          onClick={() => onTabChange?.("dashboard")}
        />
        <NavItem 
          icon={<Calendar className="w-5 h-5" />} 
          label="Plan" 
          active={activeTab === "calendar"}
          onClick={() => onTabChange?.("calendar")}
        />
        
        {/* Special FAB-like center button */}
        <div className="relative -top-6">
          <motion.button
            whileHover={{ scale: 1.15, y: -4 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onTabChange?.("content")}
            className={cn(
              "w-16 h-16 rounded-[2rem] shadow-accent flex items-center justify-center text-white ring-8 ring-white transition-all duration-500",
              activeTab === "content" ? "bg-accent" : "bg-gradient-to-br from-slate-800 to-slate-950"
            )}
          >
            <Layers className="w-7 h-7" />
          </motion.button>
        </div>

        <NavItem 
          icon={<Lightbulb className="w-5 h-5" />} 
          label="Ideas" 
          active={activeTab === "ideas"}
          onClick={() => onTabChange?.("ideas")}
        />
        <NavItem 
          icon={<CheckSquare className="w-5 h-5" />} 
          label="Tasks" 
          active={activeTab === "reports"}
          onClick={() => onTabChange?.("reports")}
        />
      </div>
    </div>
  );
};

const NavItem = ({ 
  icon, 
  label, 
  active = false,
  onClick
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1.5 p-2 px-3 rounded-2xl transition-all duration-300 relative group",
      active ? "text-accent" : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/30"
    )}
  >
    {active && (
      <motion.div 
        layoutId="active-pill"
        className="absolute inset-0 bg-accent/5 rounded-2xl -z-10"
      />
    )}
    <div className={cn(
      "transition-all duration-500",
      active && "scale-110 -translate-y-1"
    )}>
      {icon}
    </div>
    <span className={cn(
      "text-[9px] uppercase tracking-widest font-bold transition-all duration-300",
      active ? "opacity-100" : "opacity-40"
    )}>
      {label}
    </span>
  </button>
);

export default BottomNavigation;
