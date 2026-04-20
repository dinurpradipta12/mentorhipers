"use client";

import React, { useState, useEffect, useRef } from "react";
import { LogOut, User, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, supabaseV2 } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import AvatarCreator from "./_core/AvatarCreator";
import NotificationBell from "./_core/NotificationBell";
import { isLegacyAdmin } from "@/lib/authCache";

export default function RuangSosmedLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {

  const [mentorProfile, setMentorProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    fetchSettings();
    checkRole();
  }, []);

  const checkRole = async () => {
    const { data: { session } } = await supabaseV2.auth.getSession();
    const user = session?.user;
    
    if (user) {
       const { data: profile } = await supabaseV2.from('v2_profiles').select('*').eq('id', user.id).single();
       if (profile) {
          setUserProfile(profile);
          if (profile.role === 'admin' || isLegacyAdmin()) {
             setIsAdmin(true);
          } else {
             setIsAdmin(false);
             if (!profile.avatar_url) {
                setShowOnboarding(true);
             }
          }
       } else if (isLegacyAdmin()) {
          setIsAdmin(true);
          setUserProfile({ full_name: 'Admin Arunika', role: 'admin' });
       }
    } else {
       setIsAdmin(false);
    }
  };

 //🕒 AUTO LOGOUT (60 Minutes Inactivity)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        console.log("🕒 Inactivity timeout (1 hour) — Logging out...");
        await supabaseV2.auth.signOut();
        window.location.href = "/ruang-sosmed/login";
      }, 60 * 60 * 1000);//1 Hour
    };

   //Initial timer
    resetTimer();

   //Interaction listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, []);

  const fetchSettings = async () => {
    const { data: mentor } = await supabase.from('mentor_profile').select('*').eq('id', 1).single();
    if (mentor) setMentorProfile(mentor);
  };

  const router = useRouter();

  const handleSaveProfileAvatar = async (avatarUrl: string) => {
    if (!userProfile) return;
    setIsUploading(true);
    try {
      const { error } = await supabaseV2.from('v2_profiles').update({ avatar_url: avatarUrl }).eq('id', userProfile.id);
      if (error) throw error;
      
      setUserProfile({ ...userProfile, avatar_url: avatarUrl });
      setShowOnboarding(false);
      setShowSuccessModal(true);
    } catch (err: any) {
      alert("Gagal simpan avatar: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const pathname = usePathname();
  const isLoginPage = pathname === "/ruang-sosmed/login";
  const isPortalPage = pathname.includes("/ruang-sosmed/");

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-blue-100 selection:text-blue-700">
      {!isLoginPage && isAdmin && !pathname.includes('/agency') && (
        <nav className="fixed top-0 left-0 right-0 h-24 bg-white border-b border-slate-100 z-50 flex items-center justify-between px-10 shadow-sm transition-all duration-300">
          <Link href="/ruang-sosmed" className="flex items-center group">
            <img 
              src={pathname.startsWith('/ruang-sosmed/batch') ? '/logo_rs.png' : '/logo.png'} 
              className="h-14 w-auto object-contain transition-all group-hover:scale-105" 
              alt="Workspace Logo" 
           />
          </Link>
          
          <div className="flex items-center gap-6">
            {isAdmin && (
              <Link href="/admin/dashboard" className="px-6 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 border border-slate-100">
                <LogOut size={14} className="rotate-180"/> Back to V1
              </Link>
            )}
            
            <div className="h-8 w-px bg-slate-100"/>
            
            <div className="flex items-center gap-4 pl-2">
               <div className="text-right hidden sm:block">
                  <p className="text-[11px] font-black leading-none text-slate-800">{mentorProfile?.name || "Premium Mentor"}</p>
                  <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Online</p>
               </div>
                <div className="flex items-center gap-4">
                  {userProfile && <NotificationBell profileId={userProfile.id} />}
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 p-1 shadow-sm">
                    <img
                      src={userProfile?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                      className="w-full h-full rounded-xl object-contain"
                      alt="Avatar"
                    />
                  </div>
                </div>
            </div>
          </div>
        </nav>
      )}

      <main className={`${(isLoginPage || !isAdmin || pathname.includes('/agency')) ? 'pt-0' : 'pt-24'} min-h-screen relative`}>
        <AnimatePresence>
          {showSuccessModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
              >
                {/* Decoration */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-600"/>
                
                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600">
                  <Sparkles size={40}/>
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 mb-2 italic">Awesome!</h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                  Identitas visual kamu berhasil dipulihkan. Sekarang kamu siap untuk memulai petualangan di LMS.
                </p>
                
                <Button 
                  onClick={() => {
                    setShowSuccessModal(false);
                    router.push('/ruang-sosmed');
                  }}
                  className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all"
                >
                  Masuk ke LMS <LogOut size={14} className="rotate-180"/>
                </Button>
              </motion.div>
            </motion.div>
          )}

          {showOnboarding && !isLoginPage && !isAdmin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] bg-slate-950 flex flex-col items-center justify-center p-4 lg:p-12 overflow-y-auto"
            >
               <motion.div 
                 initial={{ y: 20, opacity: 0 }} 
                 animate={{ y: 0, opacity: 1 }} 
                 className="w-full max-w-5xl space-y-12"
               >
                  <div className="flex flex-col items-center text-center space-y-4">
                     <div className="px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest">
                        Identity Setup
                     </div>
                     <h2 className="text-5xl font-black text-white tracking-tight leading-none italic">Hello, <span className="text-blue-500">{userProfile?.full_name?.split(' ')[0] || 'Student'}</span>!</h2>
                     <p className="text-slate-400 text-lg max-w-xl leading-relaxed">Selamat datang di ekosistem Ruang Sosmed. Silakan ciptakan avatar yang paling mewakili identitas aslimu.</p>
                  </div>

                  <AvatarCreator 
                    initialName={userProfile?.full_name}
                    onSave={handleSaveProfileAvatar}
                    onCancel={() => setShowOnboarding(false)}
                 />
               </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {children}
      </main>

      <footer className="py-10 text-center opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Gradual Rollout System (V1.9.0)</p>
      </footer>
    </div>
  );
}
