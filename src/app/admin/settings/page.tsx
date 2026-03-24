"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, Settings, LogOut, LayoutDashboard, Menu, Save, CheckCircle2, LayoutTemplate, Camera, X, Globe, Calendar as CalendarIcon, FileText, Target, User
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/layout/AdminHeader";

// --- Components ---
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

export default function AppSettingsCMS() {
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Start with empty defaults — same on server AND client to avoid hydration mismatch
  const [settings, setSettings] = useState({
    app_name: "Mentorhipers",
    app_logo: "",
    app_favicon: "",
    tablet_zoom: "0.8"
  });

  useEffect(() => {
    setMounted(true);
    
    // Auth Check
    const session = localStorage.getItem("mh_session");
    if (!session || JSON.parse(session).role !== "admin") {
      router.push("/login");
      return;
    }

    const fetchSettings = async () => {
      const { data } = await supabase.from('app_settings').select('*').eq('id', 1).single();
      if (data) {
        setSettings({
          app_name: data.app_name || "Mentorhipers",
          app_logo: data.app_logo || "",
          app_favicon: data.app_favicon || "",
          tablet_zoom: localStorage.getItem('tablet_zoom_value') || "0.8",
        });
      }
      setIsLoaded(true);
    };
    
    fetchSettings();
  }, [router]);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'app_logo' | 'app_favicon') => {
    const file = e.target.files?.[0];
    if (file) {
      // Periksa ukuran file (Maks 1MB untuk logo/favicon)
      if (file.size > 1 * 1024 * 1024) {
        alert("Ukuran file terlalu besar! Maksimal 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('app_settings')
      .update(settings)
      .eq('id', 1);

    setTimeout(() => {
      setIsSaving(false);
      if (!error) alert("Global App Settings berhasil diperbarui! 🎉 Segarkan layar Mentee untuk melihat perubahannya.");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex overflow-x-hidden font-sans">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ADMIN SIDEBAR */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 240 : 80 }}
        transition={{ duration: isLoaded ? 0.3 : 0, ease: "easeInOut" }}
        className="fixed left-0 top-0 bottom-0 bg-white border-r border-[#E0E0E0] flex flex-col z-50 shadow-sm overflow-hidden"
      >
        <div className="sidebar-logo-container">
           {isSidebarOpen ? (
             <div className="w-full flex items-center justify-center">
                {settings.app_logo ? (
                  <img src={settings.app_logo} className="w-[180px] h-full max-h-[64px] object-contain" alt="Admin Logo" />
                ) : (
                  <h1 className="text-[20px] font-extrabold text-[#202224] tracking-tight">
                     Admin<span className="text-[#4880FF]">Stack</span>
                  </h1>
                )}
              </div>
           ) : (
             <div className="w-10 h-10 rounded-xl bg-[#4880FF] flex items-center justify-center text-white font-black text-xl shrink-0">
                {settings.app_name ? settings.app_name.charAt(0).toUpperCase() : "A"}
             </div>
           )}
        </div>

        <nav className="flex flex-col flex-1">
           <AdminNavItem label="Dashboard" icon={<LayoutDashboard />} href="/admin/dashboard" collapsed={!isSidebarOpen} />
           <AdminNavItem label="Calendar" icon={<CalendarIcon />} href="/admin/calendar" collapsed={!isSidebarOpen} />
           <AdminNavItem label="Mentee Monitoring" icon={<Users />} href="/admin/mentor" collapsed={!isSidebarOpen} />
           <AdminNavItem label="Goals Control" icon={<Target />} href="/admin/goals" collapsed={!isSidebarOpen} />
           <AdminNavItem label="Mentor Profile" icon={<User />} href="/admin/profile" collapsed={!isSidebarOpen} />
           <AdminNavItem label="Invoice" icon={<FileText />} href="#" collapsed={!isSidebarOpen} />
           
           <div className="mt-auto mb-10 space-y-2">
              <AdminNavItem label="App Settings" icon={<Settings />} active href="/admin/settings" collapsed={!isSidebarOpen} />
              <AdminNavItem label="Logout" icon={<LogOut />} href="/login" collapsed={!isSidebarOpen} />
           </div>
        </nav>
      </motion.aside>

      {/* MAIN CONTENT AREA */}
      <motion.main 
        initial={false}
        animate={{ 
          marginLeft: isSidebarOpen ? 240 : 80,
          width: `calc(100% - ${isSidebarOpen ? 240 : 80}px)`
        }}
        transition={{ duration: isLoaded ? 0.3 : 0, ease: "easeInOut" }}
        className="flex-1 flex flex-col min-h-screen"
      >
        <AdminHeader 
          title="Global System Settings" 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar}
        >
          <Button onClick={handleSave} disabled={isSaving} className="bg-[#4880FF] text-white px-8 h-[46px] rounded-2xl font-extrabold flex items-center gap-3 shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
             <Save size={18} /> {isSaving ? "Applying..." : "Apply Config"}
          </Button>
        </AdminHeader>

        <div className="flex-1 p-10 max-w-4xl">
           
           <Card className="p-10 rounded-[2rem] border border-slate-100 bg-white shadow-sm space-y-10">
              <div className="flex items-start gap-5 border-b border-slate-100 pb-8">
                 <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                    <Settings size={28} />
                 </div>
                 <div>
                    <h3 className="text-xl font-extrabold text-slate-800">Application Preferences</h3>
                    <p className="text-[13px] font-bold text-slate-400 mt-2 leading-relaxed">Sesuaikan identitas utama sistem The Mentorhipers. Perubahan yang Anda simpan di sini akan tersinkronisasi massal dan terdistribusi ke seluruh browser pengguna The Mentorhipers secara ajaib berkat sistem Realtime kita.</p>
                 </div>
              </div>

              <div className="space-y-8">
                  {/* APP NAME */}
                  <div className="space-y-3">
                     <label className="text-[11px] font-black text-[#202224] opacity-40 uppercase tracking-[2px] ml-1">Nama Aplikasi LMS</label>
                     <input 
                        type="text"
                        value={settings.app_name}
                        onChange={(e) => setSettings({...settings, app_name: e.target.value})}
                        className="w-full h-14 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-2xl px-6 outline-none focus:ring-2 ring-accent/20 transition-all placeholder:text-slate-300"
                        placeholder="Misal: Mentorhipers Academy"
                     />
                     <p className="text-[10px] font-bold text-slate-400 ml-1">Ini akan mengubah otomatis tag judul (Tab Browser) Mentee dan default avatar Sidebar Admin.</p>
                  </div>

                  {/* ADMIN SIDEBAR LOGO */}
                  <div className="space-y-3">
                     <label className="text-[11px] font-black text-[#202224] opacity-40 uppercase tracking-[2px] ml-1">Upload Logo Aplikasi (Sidebar)</label>
                     <div className="flex gap-4 items-center">
                        <label className="flex-1 h-32 bg-slate-50 border-2 border-dashed border-slate-200 text-slate-400 text-sm font-bold rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all hover:border-[#4880FF]/50 grow group">
                           <input 
                              type="file"
                              accept="image/png, image/jpeg, image/svg+xml"
                              onChange={(e) => handleFileUpload(e, 'app_logo')}
                              className="hidden"
                           />
                           <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                              <Camera size={14} className="text-[#4880FF]" />
                           </div>
                           <span className="text-[11px] opacity-60">Klik untuk upload logo CMS (.PNG/.SVG maks 1MB)</span>
                        </label>

                        {settings.app_logo && (
                           <div className="w-32 h-32 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden p-3 shrink-0 relative group">
                              <img src={settings.app_logo} className="w-full h-full object-contain" alt="Preview Logo" />
                              <button onClick={() => setSettings({...settings, app_logo: ""})} className="absolute top-2 right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md">
                                 <X size={12} />
                              </button>
                           </div>
                        )}
                     </div>
                  </div>

                   {/* FAVICON */}
                  <div className="space-y-3">
                     <label className="text-[11px] font-black text-[#202224] opacity-40 uppercase tracking-[2px] ml-1">Upload Favicon Browser Tab</label>
                     <div className="flex gap-4 items-center">
                        <label className="flex-1 h-32 bg-slate-50 border-2 border-dashed border-slate-200 text-slate-400 text-sm font-bold rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all hover:border-[#4880FF]/50 grow group">
                           <input 
                              type="file"
                              accept="image/png, image/x-icon"
                              onChange={(e) => handleFileUpload(e, 'app_favicon')}
                              className="hidden"
                           />
                           <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                              <Globe size={14} className="text-[#4880FF]" />
                           </div>
                           <span className="text-[11px] opacity-60">Klik untuk upload ikon tab browser (.PNG/.ICO maks 1MB)</span>
                        </label>
                        {settings.app_favicon && (
                           <div className="w-32 h-32 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden p-6 shrink-0 relative group">
                              <img src={settings.app_favicon} className="w-full h-full object-contain shadow-sm" alt="Preview Favicon" />
                              <button onClick={() => setSettings({...settings, app_favicon: ""})} className="absolute top-2 right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md">
                                 <X size={12} />
                              </button>
                           </div>
                        )}
                     </div>
                     <p className="text-[10px] font-bold text-slate-400 ml-1">Sistem akan memancarkan webhook Realtime untuk mengganti ikon tab browser mentee secara instan ke gambar ini.</p>
                  </div>

                  {/* TABLET ZOOM SLIDER */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                     <div className="flex justify-between items-end">
                        <div className="space-y-1">
                           <label className="text-[11px] font-black text-[#202224] opacity-40 uppercase tracking-[2px] ml-1">Skala Tampilan Tablet</label>
                           <p className="text-[10px] font-bold text-slate-400 ml-1">Perkecil tampilan UI di layar tablet agar lebih lega. Default: 80%.</p>
                        </div>
                        <span className="text-sm font-black text-[#4880FF] bg-blue-50 px-3 py-1.5 rounded-lg">{Math.round(parseFloat(settings.tablet_zoom) * 100)}%</span>
                     </div>
                     <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-slate-400 shrink-0">50%</span>
                        <input 
                           type="range"
                           min="0.5"
                           max="1.0"
                           step="0.05"
                           value={settings.tablet_zoom}
                           onChange={(e) => {
                              const val = e.target.value;
                              setSettings({...settings, tablet_zoom: val});
                              document.documentElement.style.setProperty('--tablet-zoom', val);
                              localStorage.setItem('tablet_zoom_value', val);
                           }}
                           className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#4880FF]"
                        />
                        <span className="text-[10px] font-bold text-slate-400 shrink-0">100%</span>
                     </div>
                     <div className="flex gap-2 flex-wrap">
                        {[
                           { label: "60%", value: "0.6" },
                           { label: "70%", value: "0.7" },
                           { label: "80% (Default)", value: "0.8" },
                           { label: "90%", value: "0.9" },
                           { label: "100% (Normal)", value: "1.0" },
                        ].map((preset) => (
                           <button
                              key={preset.value}
                              onClick={() => {
                                 setSettings({...settings, tablet_zoom: preset.value});
                                 document.documentElement.style.setProperty('--tablet-zoom', preset.value);
                                 localStorage.setItem('tablet_zoom_value', preset.value);
                              }}
                              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                                 settings.tablet_zoom === preset.value
                                    ? "bg-[#4880FF] text-white shadow-sm" 
                                    : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                              }`}
                           >
                              {preset.label}
                           </button>
                        ))}
                     </div>
                  </div>

              </div>
           </Card>

        </div>
      </motion.main>
    </div>
  );
}
