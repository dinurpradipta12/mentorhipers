"use client";

import React, { useState, useEffect } from "react";
import { LogOut, User, Upload } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function V2LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {

  const [mentorProfile, setMentorProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchSettings();
    checkRole();
  }, []);

  const checkRole = async () => {
    // 1. USE getSession() instead of getUser() in Layout to avoid auth-lock competition with Page
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    if (user) {
       const { data: profile } = await supabase.from('v2_profiles').select('*').eq('id', user.id).single();
       if (profile) {
          setUserProfile(profile);
          if (profile.role === 'admin') {
             setIsAdmin(true);
          } else {
             setIsAdmin(false);
             if (!profile.avatar_url) {
                setShowOnboarding(true);
             }
          }
       }
    } else {
       setIsAdmin(false);
    }
  };

  const fetchSettings = async () => {
    const { data: mentor } = await supabase.from('mentor_profile').select('*').eq('id', 1).single();
    if (mentor) setMentorProfile(mentor);
  };

  const router = useRouter();
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      if (!userProfile?.id) return;
      const fileExt = file.name.split('.').pop();
      const fileName = `${userProfile.id}-${Math.random()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from("v2_profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userProfile.id);

      if (dbError) throw dbError;

      setUserProfile({ ...userProfile, avatar_url: publicUrl });
      setShowOnboarding(false);

      // Auto-Redirect to Portal
      const { data: membership } = await supabase.from('v2_memberships').select('workspace_id').eq('profile_id', userProfile.id).single();
      if (membership?.workspace_id) {
         router.push(`/v2/portal/${membership.workspace_id}`);
      }

    } catch (error: any) {
      alert("Error uploading image: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const pathname = usePathname();
  const isLoginPage = pathname === "/v2/login";

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-blue-100 selection:text-blue-700">
      {/* V2 Branding / Header */}
      {/* V2 Branding / Header */}
      {!isLoginPage && isAdmin && (
        <nav className="fixed top-0 left-0 right-0 h-24 bg-slate-950 border-b border-white/5 z-50 flex items-center justify-between px-10 shadow-2xl">
          <Link href="/v2" className="flex items-center group">
            <img 
              src={pathname.startsWith('/v2/batch') ? '/logo_rs.png' : '/logo.png'} 
              className="h-14 w-auto object-contain transition-all group-hover:scale-105 brightness-0 invert" 
              alt="Workspace Logo" 
            />
          </Link>
          
          <div className="flex items-center gap-6">
            {isAdmin && (
              <Link href="/admin/dashboard" className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 border border-white/5">
                <LogOut size={14} className="rotate-180" /> Back to V1
              </Link>
            )}
            
            <div className="h-8 w-px bg-white/10" />
            
            <div className="flex items-center gap-4 pl-2">
               <div className="text-right hidden sm:block">
                  <p className="text-[11px] font-black leading-none text-white">{mentorProfile?.name || "Premium Mentor"}</p>
                  <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Online</p>
               </div>
               <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 overflow-hidden shadow-inner flex items-center justify-center text-white/20">
                  {mentorProfile?.avatar ? (
                    <img src={mentorProfile.avatar} className="w-full h-full object-cover" alt="Avatar" />
                  ) : (
                    <User size={20} />
                  )}
               </div>
            </div>
          </div>
        </nav>
      )}

      <main className={`${(isLoginPage || !isAdmin) ? 'pt-0' : 'pt-24'} min-h-screen relative`}>
        {/* Onboarding Lockscreen */}
        <AnimatePresence>
          {showOnboarding && !isLoginPage && !isAdmin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] bg-slate-900/40 backdrop-blur-xl flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ y: 40, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 25 }}
                className="max-w-md w-full bg-white rounded-[44px] shadow-2xl p-10 text-center space-y-10 border border-slate-100 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full -mt-20 -mr-20 pointer-events-none" />
                
                <div className="space-y-4 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black border border-blue-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    Setup Your Identity
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    Hello, <span className="text-blue-600">{userProfile?.full_name?.split(' ')[0] || 'Student'}</span>!
                  </h2>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    Selamat datang di ekosistem Mentorhipers. Sebagai langkah pertama, silakan unggah foto profil (avatar) Anda agar teman-teman Batch mudah mengenali Anda.
                  </p>
                </div>

                <div className="relative mx-auto w-32 h-32 group z-10">
                  <div className="w-full h-full rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-400 group-hover:bg-blue-50/50">
                    <User className="w-12 h-12 text-slate-300 group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <input
                    id="avatar-onboarding-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                  <button
                    onClick={() => document.getElementById('avatar-onboarding-upload')?.click()}
                    disabled={isUploading}
                    className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-5 h-5" />
                    {isUploading ? "Uploading..." : "Upload Photo & Mulai Belajar"}
                  </button>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    PNG / JPG (Maks 5MB)
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {children}
      </main>

      {/* Footer Branding */}
      <footer className="py-10 text-center opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Gradual Rollout System (V1.9.0)</p>
      </footer>
    </div>
  );
}
