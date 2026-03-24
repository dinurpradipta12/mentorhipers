"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Settings, Plus, Search, LogOut, LayoutDashboard, FileText, Bell, Trash2, X, Clock, Menu, Inbox, Star, Send, FileEdit, CheckCircle2, Zap, Calendar as CalendarIcon, Filter, RefreshCcw, User, Camera, Instagram, Linkedin, Twitter, Globe, Save, Sparkles, Medal, Award, Target
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import NotificationCenterAdmin from "@/components/layout/NotificationCenterAdmin";
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

export default function MentorProfileCMS() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    name: "Dinur Pradipta",
    headline: "Professional Social Media & Branding Mentor",
    bio: "Helping brands and individuals scale their digital presence through strategic content planning and personal branding mentoring. With over 5+ years of experience in the industry.",
    avatar: "https://i.pravatar.cc/150?u=dinur",
    location: "Jakarta, Indonesia",
    specialties: ["Social Media Strategy", "Personal Branding", "Content Planning", "Public Speaking"],
    manual_status: "auto",
    status_message: "",
    socials: {
      instagram: "dinur_pradipta",
      linkedin: "dinurpradipta",
      twitter: "dinurpradipta",
      website: "mentorhipers.com"
    },
    booking_settings: {
      start_hour: 9,
      end_hour: 21,
      working_days: [1, 2, 3, 4, 5]
    }
  });

  const [appSettings, setAppSettings] = useState({
    app_name: typeof window !== 'undefined' ? (localStorage.getItem('app_name') || "Mentorhipers") : "Mentorhipers",
    app_logo: typeof window !== 'undefined' ? (localStorage.getItem('app_logo') || "") : ""
  });

  useEffect(() => {
    const sessionStr = localStorage.getItem("mh_session");
    if (!sessionStr) { router.push("/login"); return; }
    const session = JSON.parse(sessionStr);
    if (session.role !== "admin") { router.push("/login"); return; }

    const savedSidebar = localStorage.getItem("mh_admin_sidebar");
    if (savedSidebar !== null) setIsSidebarOpen(savedSidebar === "true");

    const fetchAllData = async () => {
      // Fetch existing mentor data
      const { data: mentorData } = await supabase
        .from('mentor_profile')
        .select('*')
        .eq('id', 1)
        .single();
      
      if (mentorData) {
        setProfile({
          name: mentorData.name || "",
          headline: mentorData.headline || "",
          bio: mentorData.bio || "",
          avatar: mentorData.avatar || "",
          location: mentorData.location || "",
          specialties: Array.isArray(mentorData.specialties) ? mentorData.specialties : (mentorData.specialties?.split(',').map((s:string)=>s.trim()) || []),
          manual_status: mentorData.manual_status || "auto",
          status_message: mentorData.status_message || "",
          socials: mentorData.social_links || { instagram: "", linkedin: "", twitter: "", website: "" },
          booking_settings: mentorData.booking_settings || { start_hour: 9, end_hour: 21, working_days: [1, 2, 3, 4, 5] }
        });
      }

      // Fetch Global App Settings
      const { data: settingsData } = await supabase.from('app_settings').select('*').eq('id', 1).single();
      if (settingsData) {
        setAppSettings({
          app_name: settingsData.app_name || "Mentorhipers",
          app_logo: settingsData.app_logo || "",
        });
      }
      setIsLoaded(true);
    };
    
    fetchAllData();
  }, [router]);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem("mh_admin_sidebar", newState.toString());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBookingSettingsChange = (newSettings: any) => {
    setProfile(prev => ({ ...prev, booking_settings: newSettings }));
    
    if ((window as any).bookingSettingsTimeout) clearTimeout((window as any).bookingSettingsTimeout);
    (window as any).bookingSettingsTimeout = setTimeout(async () => {
      await supabase.from('mentor_profile').update({ booking_settings: newSettings }).eq('id', 1);
    }, 800);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Upsert to Supabase
    const payloadToSave = {
      id: 1, // Fixed ID for single mentor
      name: profile.name,
      headline: profile.headline,
      bio: profile.bio,
      avatar: profile.avatar,
      location: profile.location,
      specialties: profile.specialties,
      manual_status: profile.manual_status,
      status_message: profile.status_message,
      social_links: profile.socials,
      booking_settings: profile.booking_settings
    };

    const { error } = await supabase
      .from('mentor_profile')
      .upsert([payloadToSave]); // Fixed ID for single mentor

    setTimeout(() => {
      setIsSaving(false);
      if (!error) alert("Profil berhasil diperbarui! 🎉");
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
        <div className="h-[100px] flex items-center justify-center mb-4 mt-2 transition-all overflow-hidden px-5">
           {isSidebarOpen ? (
             <div className="w-full h-full flex items-center justify-center">
                {appSettings.app_logo ? (
                  <img src={appSettings.app_logo} className="w-[180px] h-full max-h-[64px] object-contain" alt="Admin Logo" />
                ) : (
                  <h1 className="text-[20px] font-extrabold text-[#202224] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis flex items-center">
                     Admin<span className="text-[#4880FF]">Stack</span>
                  </h1>
                )}
             </div>
           ) : (
             <div className="w-10 h-10 rounded-xl bg-[#4880FF] flex items-center justify-center text-white font-black text-xl shrink-0">
                {appSettings.app_name ? appSettings.app_name.charAt(0).toUpperCase() : "A"}
             </div>
           )}
        </div>

        <nav className="flex flex-col flex-1">
           <AdminNavItem label="Dashboard" icon={<LayoutDashboard />} href="/admin/dashboard" collapsed={!isSidebarOpen} />
           <AdminNavItem label="Calendar" icon={<CalendarIcon />} href="/admin/calendar" collapsed={!isSidebarOpen} />
           <AdminNavItem label="Mentee Monitoring" icon={<Users />} href="/admin/mentor" collapsed={!isSidebarOpen} />
           <AdminNavItem label="Goals Control" icon={<Target />} href="/admin/goals" collapsed={!isSidebarOpen} />
           <AdminNavItem label="Mentor Profile" icon={<User />} active href="/admin/profile" collapsed={!isSidebarOpen} />
           <AdminNavItem label="Invoice" icon={<FileText />} href="#" collapsed={!isSidebarOpen} />
           
           <div className="mt-auto mb-10 space-y-2">
              <AdminNavItem label="App Settings" icon={<Settings />} href="/admin/settings" collapsed={!isSidebarOpen} />
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
          title="Mentor Profile CMS" 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
        />

        <div className="flex-1 flex flex-col xl:flex-row p-10 gap-10 overflow-x-hidden">
           
           {/* CMS FORMS AREA */}
           <div className="flex-[1.5] space-y-8 no-scrollbar pb-20">
              
              {/* 1. Basic Info */}
              <section className="space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#4880FF]/10 text-[#4880FF] flex items-center justify-center"><User size={20} /></div>
                    <h3 className="text-[18px] font-black text-[#202224]">Identity & Branding</h3>
                 </div>
                 
                 <Card className="p-8 border-none bg-white shadow-[0px_10px_30px_rgba(0,0,0,0.02)] rounded-[32px] space-y-8">
                    <div className="flex items-center gap-8">
                       <div className="relative group shrink-0">
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                          />
                          <img src={profile.avatar} className="w-[120px] h-[120px] rounded-[40px] object-cover ring-4 ring-slate-50 border-4 border-white shadow-xl" />
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-[#202224] text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
                          >
                             <Camera size={18} />
                          </button>
                       </div>
                       <div className="flex-1 space-y-4">
                          <div className="space-y-2">
                             <label className="text-[11px] font-black text-[#202224] opacity-30 uppercase tracking-[2px] ml-1">Full Name</label>
                             <input value={profile.name || ""} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full h-[56px] bg-[#F5F6FA] rounded-2xl px-6 font-bold text-[#202224] focus:outline-none focus:ring-2 ring-[#4880FF]/20" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[11px] font-black text-[#202224] opacity-30 uppercase tracking-[2px] ml-1">Professional Headline</label>
                             <input value={profile.headline || ""} onChange={e => setProfile({...profile, headline: e.target.value})} className="w-full h-[56px] bg-[#F5F6FA] rounded-2xl px-6 font-bold text-[#202224] focus:outline-none focus:ring-2 ring-[#4880FF]/20" />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[11px] font-black text-[#202224] opacity-30 uppercase tracking-[2px] ml-1">Professional Bio</label>
                       <textarea value={profile.bio || ""} onChange={e => setProfile({...profile, bio: e.target.value})} className="w-full h-[120px] bg-[#F5F6FA] rounded-3xl p-6 font-bold text-[#202224] leading-relaxed focus:outline-none focus:ring-2 ring-[#4880FF]/20 no-scrollbar" />
                    </div>
                 </Card>
              </section>

              {/* 2. Social & Links */}
              <section className="space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center"><Globe size={20} /></div>
                    <h3 className="text-[18px] font-black text-[#202224]">Social Presence</h3>
                 </div>

                 <Card className="p-8 border-none bg-white shadow-[0px_10px_30px_rgba(0,0,0,0.02)] rounded-[32px] grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <div className="flex items-center gap-2 mb-2 ml-1 opacity-40 uppercase tracking-[2px]">
                          <Instagram size={14} /> <span className="text-[11px] font-black">Instagram</span>
                       </div>
                       <input value={profile.socials.instagram || ""} onChange={e => setProfile({...profile, socials: {...profile.socials, instagram: e.target.value}})} className="w-full h-[56px] bg-[#F5F6FA] rounded-2xl px-6 font-bold text-[#202224]" placeholder="@username" />
                    </div>
                    <div className="space-y-2">
                       <div className="flex items-center gap-2 mb-2 ml-1 opacity-40 uppercase tracking-[2px]">
                          <Linkedin size={14} /> <span className="text-[11px] font-black">LinkedIn</span>
                       </div>
                       <input value={profile.socials.linkedin || ""} onChange={e => setProfile({...profile, socials: {...profile.socials, linkedin: e.target.value}})} className="w-full h-[56px] bg-[#F5F6FA] rounded-2xl px-6 font-bold text-[#202224]" placeholder="linkedin.com/in/..." />
                    </div>
                    <div className="space-y-2">
                       <div className="flex items-center gap-2 mb-2 ml-1 opacity-40 uppercase tracking-[2px]">
                          <Twitter size={14} /> <span className="text-[11px] font-black">X / Twitter</span>
                       </div>
                       <input value={profile.socials.twitter || ""} onChange={e => setProfile({...profile, socials: {...profile.socials, twitter: e.target.value}})} className="w-full h-[56px] bg-[#F5F6FA] rounded-2xl px-6 font-bold text-[#202224]" placeholder="@username" />
                    </div>
                    <div className="space-y-2">
                       <div className="flex items-center gap-2 mb-2 ml-1 opacity-40 uppercase tracking-[2px]">
                          <Globe size={14} /> <span className="text-[11px] font-black">Personal Website</span>
                       </div>
                       <input value={profile.socials.website || ""} onChange={e => setProfile({...profile, socials: {...profile.socials, website: e.target.value}})} className="w-full h-[56px] bg-[#F5F6FA] rounded-2xl px-6 font-bold text-[#202224]" placeholder="https://..." />
                    </div>
                 </Card>
              </section>

               {/* 3. Booking & Availability */}
               <section className="space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><Clock size={20} /></div>
                     <h3 className="text-[18px] font-black text-[#202224]">Booking & Availability</h3>
                  </div>

                  <Card className="p-8 border-none bg-white shadow-[0px_10px_30px_rgba(0,0,0,0.02)] rounded-[32px] space-y-10">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <label className="text-[11px] font-black text-[#202224] opacity-30 uppercase tracking-[2px] ml-1">Working Start Hour</label>
                         <select 
                           value={profile.booking_settings.start_hour} 
                           onChange={e => handleBookingSettingsChange({...profile.booking_settings, start_hour: parseInt(e.target.value)})}
                           className="w-full h-[56px] bg-[#F5F6FA] rounded-2xl px-6 font-bold text-[#202224] focus:outline-none"
                         >
                           {Array.from({length: 24}, (_, i) => (
                             <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                           ))}
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[11px] font-black text-[#202224] opacity-30 uppercase tracking-[2px] ml-1">Working End Hour</label>
                         <select 
                           value={profile.booking_settings.end_hour} 
                           onChange={e => handleBookingSettingsChange({...profile.booking_settings, end_hour: parseInt(e.target.value)})}
                           className="w-full h-[56px] bg-[#F5F6FA] rounded-2xl px-6 font-bold text-[#202224] focus:outline-none"
                         >
                           {Array.from({length: 24}, (_, i) => (
                             <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                           ))}
                         </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[11px] font-black text-[#202224] opacity-30 uppercase tracking-[2px] ml-1">Available Working Days</label>
                      <div className="flex flex-wrap gap-3">
                        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day, idx) => {
                          const isActive = profile.booking_settings.working_days.includes(idx);
                          return (
                            <button
                              key={day}
                              onClick={() => {
                                const current = [...profile.booking_settings.working_days];
                                if (isActive) {
                                  handleBookingSettingsChange({...profile.booking_settings, working_days: current.filter(d => d !== idx)});
                                } else {
                                  handleBookingSettingsChange({...profile.booking_settings, working_days: [...current, idx].sort()});
                                }
                              }}
                              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${isActive ? 'bg-accent text-white shadow-lg shadow-accent/20 scale-105' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
               </section>
            </div>

           {/* LIVE PREVIEW AREA */}
           <div className="flex-1 flex flex-col gap-6 sticky top-[130px] h-fit">
              <div className="flex items-center gap-3">
                 <Sparkles className="text-amber-500" size={18} />
                 <h3 className="text-[14px] font-black text-[#202224] opacity-30 uppercase tracking-[2px]">Public Preview Card</h3>
              </div>

              <motion.div 
                layout
                className="w-full bg-white rounded-[40px] shadow-[0px_40px_80px_rgba(72,128,255,0.1)] overflow-hidden border border-[#4880FF]/10"
              >
                 <div className="h-24 bg-gradient-to-r from-[#4880FF] to-[#A461D8] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-8" />
                 </div>
                 
                 <div className="px-10 pb-10 -mt-12 text-center relative z-10">
                    <img src={profile.avatar} className="w-[100px] h-[100px] rounded-[32px] mx-auto border-4 border-white shadow-2xl object-cover mb-4" />
                    <h2 className="text-[24px] font-black text-[#202224] tracking-tight">{profile.name}</h2>
                    <p className="text-[14px] font-bold text-[#4880FF] mt-1">{profile.headline}</p>
                    
                    <div className="flex flex-wrap justify-center gap-2 mt-6">
                       {profile.specialties.map((s, i) => (
                         <span key={i} className="px-4 py-1.5 rounded-full bg-[#F5F6FA] text-[11px] font-black text-slate-500 uppercase tracking-widest">{s}</span>
                       ))}
                    </div>

                    <p className="text-[14px] text-slate-500 font-medium leading-[1.8] mt-8 line-clamp-3 italic">
                       "{profile.bio}"
                    </p>

                    <div className="h-[1px] bg-slate-100 w-full my-8" />

                    <div className="flex justify-center gap-6">
                       <Instagram className="text-slate-300 hover:text-pink-500 transition-colors cursor-pointer" size={24} />
                       <Linkedin className="text-slate-300 hover:text-blue-700 transition-colors cursor-pointer" size={24} />
                       <Twitter className="text-slate-300 hover:text-sky-500 transition-colors cursor-pointer" size={24} />
                    </div>

                    <Button className="w-full h-[56px] bg-[#202224] text-white rounded-2xl font-black text-[14px] mt-10 tracking-[1px] hover:bg-[#4880FF] transition-all">
                       VIEW SCHEDULE
                    </Button>
                 </div>
              </motion.div>

              <div className="p-6 rounded-[32px] bg-[#4880FF]/5 border border-[#4880FF]/10 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-[#4880FF] text-white flex items-center justify-center shrink-0">
                    <Medal size={24} />
                 </div>
                 <div>
                    <h4 className="text-[13px] font-black text-[#4880FF] uppercase tracking-widest">Mentor Verified</h4>
                    <p className="text-[11px] text-[#202224] opacity-50 font-bold mt-0.5">Your profile is currently live and visible to mentees.</p>
                 </div>
              </div>
           </div>
        </div>
      </motion.main>

      <NotificationCenterAdmin />
    </div>
  );
}
