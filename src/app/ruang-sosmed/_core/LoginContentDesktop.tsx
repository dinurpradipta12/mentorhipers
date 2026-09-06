"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
   ArrowRight,
   User,
   Lock,
   Sparkles,
   GraduationCap,
   ShieldCheck,
   ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabaseV2 as supabase } from "@/lib/supabase";
import { invalidateSessionCache } from "@/lib/authCache";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import AvatarCreator from "./AvatarCreator";

export default function LoginContentDesktop() {
   const router = useRouter();
   const [loading, setLoading] = useState(false);
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [error, setError] = useState("");
   const [cooldown, setCooldown] = useState(0);
   const [showAvatarModal, setShowAvatarModal] = useState(false);
   const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
   const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
   const [loggedInName, setLoggedInName] = useState<string>("");

  //Cooldown countdown timer
   React.useEffect(() => {
      if (cooldown <= 0) return;
      const t = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(t);
   }, [cooldown]);
   const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError("");

      try {
        // ENSURE CLEAN STATE: Clear any existing session before trying to sign in
        await supabase.auth.signOut();
        localStorage.removeItem("v2_legacy_admin");
        
         //INTERCEPT FOR USERNAME/ADMIN LOGIN
         let loginIdentifier = email;
         
        //1. ARUNIKA ADMIN BYPASS (LOCAL ONLY)
         if (email === "arunika" && password === "ar4925") {
            localStorage.setItem("v2_legacy_admin", "true");
            router.push('/ruang-sosmed');
            return;
         } 
        //2. USERNAME MAPPING (Academy & Agency)
         else if (email && !email.includes('@')) {
            loginIdentifier = `${email.toLowerCase().trim()}@ruangsosmed.v2.local`;
         }

         let { data, error: authError } = await supabase.auth.signInWithPassword({
            email: loginIdentifier,
            password
         });

         // FALLBACK CHAIN: Try @ruangsosmed.local then @mentorhipers.local
         if (authError && email && !email.includes('@')) {
            const domains = ['@ruangsosmed.local', '@mentorhipers.local'];
            for (const domain of domains) {
               const retryEmail = `${email.toLowerCase().trim()}${domain}`;
               const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                  email: retryEmail,
                  password
               });
               
               if (!retryError) {
                  data = retryData;
                  authError = null;
                  break;
               }
            }
         }

         if (authError) {
            setError(authError.message === "Invalid login credentials" ? "Username atau Password salah." : authError.message);
            setCooldown(10);
            setLoading(false);
            return;
         }

         if (data.user) {
            invalidateSessionCache();

            // Fetch profile to check avatar & role
            const { data: profile } = await supabase
              .from('v2_profiles')
              .select('role, avatar_url, full_name')
              .eq('id', data.user.id)
              .maybeSingle();

            // Determine redirect destination
            let redirectTo = '/ruang-sosmed';
            if (profile && profile.role !== 'admin') {
               const { data: memberships } = await supabase
                 .from('v2_memberships')
                 .select('workspace_id, v2_workspaces(type)')
                 .eq('profile_id', data.user.id);

               if (memberships && memberships.length > 0) {
                  if (memberships.length === 1 && (memberships[0] as any).v2_workspaces?.type === 'agency') {
                    redirectTo = `/ruang-sosmed/agency/${memberships[0].workspace_id}`;
                  }
               } else {
                  setError("Akun Anda belum terdaftar di Batch manapun. Admin belum memasukkan data Anda ke Project Baru ini.");
                  setLoading(false);
                  return;
               }
            }

            // If no avatar yet → show avatar picker first
            if (!profile?.avatar_url) {
               setLoggedInUserId(data.user.id);
               setLoggedInName(profile?.full_name || '');
               setPendingRedirect(redirectTo);
               setShowAvatarModal(true);
               setLoading(false);
               return;
            }

            router.push(redirectTo);
         }
      } catch (err: any) {
         const isNetworkError = err?.message?.includes('fetch') || err?.message?.includes('network') || err instanceof TypeError;
         if (isNetworkError) {
            setError('🔧 Server sedang dalam pemeliharaan. Silakan coba lagi dalam beberapa menit.');
            setCooldown(60);
         } else {
            setError("Terjadi kesalahan sistem.");
            setCooldown(10);
         }
         setLoading(false);
      }
   };

   return (
      <>
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-blue-500/30 selection:text-white">
         {/* Background Magic */}
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,_#1e1b4b_0%,_transparent_50%),radial-gradient(circle_at_70%_80%,_#0f172a_0%,_transparent_50%)]"/>
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[length:40px_40px]"/>

         {/* Floating Blobs */}
         <div className="absolute -top-[10%] -right-[15%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse"/>
         <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full"/>

         <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-20 relative z-10 items-center">
            {/* Left: Brand & Info */}
            <motion.div
               initial={{ opacity: 0, x: -50 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8 }}
               className="space-y-12"
            >
               <div className="flex items-center gap-5">
                  <img
                     src="/logo.png"
                     className="h-20 w-auto object-contain transition-all hover:scale-105 brightness-0 invert"
                     alt="Ruang Sosmed Logo"
                 />
               </div>

               <div className="space-y-8">
                  <h2 className="text-5xl md:text-6xl font-black text-white leading-tight tracking-tight">
                     Elevate your <br/>
                     <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Creative Career.</span>
                  </h2>
                  <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md">
                     Satu portal terpadu untuk murid Akademi dan tim Agensi B2B. Masuk untuk mengelola tugas, nilai, dan roadmap konten Anda.
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-4 max-w-md">
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
                     <GraduationCap className="text-blue-400" size={24}/>
                     <p className="text-xs font-black text-white">LMS Academy</p>
                     <p className="text-[10px] font-bold text-slate-500">Pusat pengerjaan tugas murid batch & grading.</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
                     <ShieldCheck className="text-indigo-400" size={24}/>
                     <p className="text-xs font-black text-white">B2B Agency</p>
                     <p className="text-[10px] font-bold text-slate-500">Ruang kolaborasi tim & roadmap klien agensi.</p>
                  </div>
               </div>
            </motion.div>

            {/* Right: Login Card */}
            <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.8, delay: 0.2 }}
            >
               <Card className="bg-white/5 backdrop-blur-3xl border-white/10 rounded-[56px] p-12 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2"/>

                  <div className="mb-12 space-y-2">
                     <h3 className="text-3xl font-black text-white tracking-tight">Portal Login</h3>
                     <p className="text-slate-400 text-sm font-medium">Gunakan kredensial akun yang diberikan oleh mentor Anda.</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-8">
                     {error && (
                        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold animate-in fade-in slide-in-from-top-2 flex items-center gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-rose-500"/>
                           {error}
                        </div>
                     )}

                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 ml-2">Username/Admin Email</label>
                        <div className="relative group/input">
                           <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within/input:text-blue-500 transition-colors"/>
                           <input
                              type="text"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="e.g. budisantoso atau nama@agency.com"
                              className="w-full h-16 rounded-3xl bg-slate-900 border border-white/5 pl-14 pr-6 text-white font-bold text-base focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all placeholder:text-slate-700"
                              required
                          />
                        </div>
                     </div>

                     <div className="space-y-3">
                        <div className="flex justify-between items-center ml-2">
                           <label className="text-[10px] font-black text-slate-500">Secret Token</label>
                           <button type="button" className="text-[10px] font-black text-blue-500 hover:text-blue-400 transition-all">Forgot token?</button>
                        </div>
                        <div className="relative group/input">
                           <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within/input:text-blue-500 transition-colors"/>
                           <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full h-16 rounded-3xl bg-slate-900 border border-white/5 pl-14 pr-6 text-white font-bold text-base focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all placeholder:text-slate-700"
                              required
                          />
                        </div>
                     </div>

                     <Button
                        disabled={loading || cooldown > 0}
                        className="w-full h-20 rounded-[32px] bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black text-lg shadow-2xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-4 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                     >
                        {loading ? (
                           <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"/>
                        ) : cooldown > 0 ? (
                           <span className="text-base">Coba lagi dalam {cooldown}s...</span>
                        ) : (
                           <>
                              Access Platform
                              <ChevronRight size={24}/>
                           </>
                        )}
                     </Button>
                  </form>

                  <div className="mt-12 text-center">
                     <p className="text-slate-500 text-[10px] font-black">
                        Secured by Ruang Sosmed Enterprise Engine
                     </p>
                  </div>
               </Card>
            </motion.div>
         </div>

         <footer className="absolute bottom-10 text-[10px] font-black text-slate-700">
            V2 Portal Environment (BETA)
         </footer>
      </div>

      {/* Avatar Selection Modal — shown for first-time users with no avatar */}
      <AnimatePresence>
        {showAvatarModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-full max-w-5xl"
            >
               <div className="bg-slate-900 border border-white/10 rounded-[48px] p-10 lg:p-16 space-y-10 relative overflow-hidden">
                 {/* Decorative background element */}
                 <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"/>
                 
                 <div className="text-center space-y-3 pb-4">
                   <div className="inline-flex p-4 rounded-3xl bg-white/5 border border-white/10 mb-2">
                     <Sparkles className="text-amber-400" size={32}/>
                   </div>
                   <h2 className="text-4xl font-black text-white tracking-tight">Pilih Avatar Kamu!</h2>
                   <p className="text-slate-400 text-lg max-w-md mx-auto">
                     Halo{loggedInName ? `, ${loggedInName.split(' ')[0]}` : ''}! Pilih avatar yang paling mewakili karakter kamu.
                   </p>
                 </div>
                <AvatarCreator
                  initialName={loggedInName}
                  onSave={async (url) => {
                    if (loggedInUserId) {
                      await supabase
                        .from('v2_profiles')
                        .update({ avatar_url: url })
                        .eq('id', loggedInUserId);
                    }
                    setShowAvatarModal(false);
                    router.push(pendingRedirect || '/ruang-sosmed');
                  }}
                  onCancel={() => {
                    setShowAvatarModal(false);
                    router.push(pendingRedirect || '/ruang-sosmed');
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </>
   );
}
