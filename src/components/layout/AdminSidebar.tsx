"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Users, Settings, LogOut, LayoutDashboard, FileText, Target, User, Calendar as CalendarIcon, Sparkles
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminSidebarProps {
  isSidebarOpen: boolean;
  appSettings: {
    app_name: string;
    app_logo: string;
    app_favicon: string;
  };
}

const AdminNavItem = ({ label, icon, active = false, href = "#", collapsed = false }: any) => (
  <Link href={href} className={`w-full flex items-center gap-4 px-8 py-5 transition-all duration-300 ${
    active 
      ? "bg-[#4880FF] text-white" 
      : "text-[#202224] opacity-50 hover:opacity-100 hover:bg-slate-50 font-medium"
  } ${collapsed ? "justify-center px-0" : ""}`}>
    <div className={`transition-colors duration-300 ${active ? "text-white" : "text-slate-400"}`}>
       {React.cloneElement(icon as any, { size: 18 })}
    </div>
    {!collapsed && <span className="text-[14px] font-bold tracking-tight">{label}</span>}
  </Link>
);

export default function AdminSidebar({ isSidebarOpen, appSettings }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isSidebarOpen ? 240 : 80 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 bottom-0 bg-white border-r border-[#E0E0E0] flex flex-col z-50 shadow-sm overflow-hidden"
    >
      <div className="sidebar-logo-container p-4">
         {isSidebarOpen ? (
           <div className="w-full flex items-center justify-center">
              {appSettings.app_logo ? (
                <img src={appSettings.app_logo} className="w-[180px] h-full max-h-[64px] object-contain" alt="Admin Logo" />
              ) : (
                <h1 className="text-[20px] font-extrabold text-[#202224] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis flex items-center">
                   Admin<span className="text-[#4880FF]">Stack</span>
                </h1>
              )}
           </div>
         ) : (
           <div className="w-10 h-10 rounded-xl bg-[#4880FF] flex items-center justify-center overflow-hidden shrink-0 shadow-lg shadow-blue-500/20">
              {appSettings.app_favicon ? (
                <img src={appSettings.app_favicon} className="w-full h-full object-contain p-1" alt="Favicon" />
              ) : (
                <span className="text-white font-black text-xl">{appSettings.app_name ? appSettings.app_name.charAt(0).toUpperCase() : "A"}</span>
              )}
           </div>
         )}
      </div>

      <nav className="flex flex-col flex-1">
         <AdminNavItem 
            label="Dashboard" 
            icon={<LayoutDashboard />} 
            href="/admin/dashboard" 
            active={pathname === "/admin/dashboard"}
            collapsed={!isSidebarOpen} 
         />
         <AdminNavItem 
            label="Calendar" 
            icon={<CalendarIcon />} 
            href="/admin/calendar" 
            active={pathname === "/admin/calendar"}
            collapsed={!isSidebarOpen} 
         />
         <AdminNavItem 
            label="Mentee Monitoring" 
            icon={<Users />} 
            href="/admin/mentor" 
            active={pathname === "/admin/mentor"}
            collapsed={!isSidebarOpen} 
         />
         <AdminNavItem 
            label="Goals Control" 
            icon={<Target />} 
            href="/admin/goals" 
            active={pathname === "/admin/goals"}
            collapsed={!isSidebarOpen} 
         />
         <AdminNavItem 
            label="Mentor Profile" 
            icon={<User />} 
            href="/admin/profile" 
            active={pathname === "/admin/profile"}
            collapsed={!isSidebarOpen} 
         />
         <AdminNavItem 
            label="Invoice" 
            icon={<FileText />} 
            href="#" 
            active={pathname === "/admin/invoice"}
            collapsed={!isSidebarOpen} 
         />
         
         <div className="mt-auto mb-10 space-y-2">
             <div className={`px-4 mb-4 ${!isSidebarOpen ? 'px-2' : ''}`}>
               <Link href="/v2/login" className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all overflow-hidden relative group ${!isSidebarOpen ? 'justify-center px-0' : ''}`}>
                  <div className="absolute -right-4 -top-4 w-12 h-12 bg-white/10 blur-xl rounded-full group-hover:scale-150 transition-transform" />
                  <Sparkles size={18} className="shrink-0 relative z-10" />
                  {isSidebarOpen && <span className="text-[12px] font-black uppercase tracking-widest relative z-10">Switch to V2</span>}
               </Link>
            </div>
            <AdminNavItem 
              label="App Settings" 
              icon={<Settings />} 
              href="/admin/settings" 
              active={pathname === "/admin/settings"}
              collapsed={!isSidebarOpen} 
            />
            <AdminNavItem 
              label="Logout" 
              icon={<LogOut />} 
              href="/login" 
              collapsed={!isSidebarOpen} 
            />
         </div>
      </nav>
    </motion.aside>
  );
}
