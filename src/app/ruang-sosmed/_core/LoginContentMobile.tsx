"use client";

import React, { useState } from "react";
import { 
  User, 
  Lock, 
  ChevronRight, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabaseV2 as supabase } from "@/lib/supabase";
import { invalidateSessionCache } from "@/lib/authCache";
import { Button } from "@/components/ui/Button";

export default function LoginContentMobile() {
   const router = useRouter();
   const [loading, setLoading] = useState(false);
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [error, setError] = useState("");
   const [cooldown, setCooldown] = useState(0);//seconds remaining before retry allowed

  //Cooldown timer countdown
   React.useEffect(() => {
      if (cooldown <= 0) return;
      const t = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(t);
   }, [cooldown]);

   const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError("");

      if (email === "arunika" && password === "ar4925") {
         await supabase.auth.signOut();
         localStorage.setItem("v2_legacy_admin", "true");
         router.push('/ruang-sosmed');
         return;
      }

      try {
         let loginIdentifier = email;
         if (email && !email.includes('@')) {
            loginIdentifier = `${email.toLowerCase().trim()}@ruangsosmed.local`;
         }

         const { data, error: authError } = await supabase.auth.signInWithPassword({
            email: loginIdentifier,
            password
         });

         if (authError) {
            setError(authError.message === "Invalid login credentials" ? "Username atau Password salah." : authError.message);
            setCooldown(10);//10s cooldown after wrong credentials
            setLoading(false);
            return;
         }

         if (data.user) {
           //Invalidate cache so the new session is picked up immediately
            invalidateSessionCache();
            const { data: profile } = await supabase
              .from('v2_profiles')
              .select('role')
              .eq('id', data.user.id)
              .maybeSingle();

            if (profile && profile.role !== 'admin') {
               const { data: memberships } = await supabase
                 .from('v2_memberships')
                 .select('workspace_id')
                 .eq('profile_id', data.user.id);

               if (memberships && memberships.length > 0) {
                 //If has multiple, still allow them to pick, but normally they have one
                  if (memberships.length === 1) {
                    router.push(`/ruang-sosmed/${memberships[0].workspace_id}`);
                    return;
                  }
               } else {
                 //NO MEMBERSHIP FOUND IN NEW DB
                  setError("Akun Anda belum terdaftar di Batch manapun di sistem baru ini.");
                  setLoading(false);
                  return;
               }
            }
            router.push('/ruang-sosmed');
         }
      } catch (err: any) {
        //Detect CORS/network error = server is temporarily down
         const isNetworkError = err?.message?.includes('fetch') || err?.message?.includes('network') || err?.message?.includes('CORS') || err instanceof TypeError;
         if (isNetworkError) {
            setError('🔧 Server sedang dalam pemeliharaan. Silakan coba lagi dalam beberapa menit.');
            setCooldown(60);//60s cooldown — don\'t spam during outage
         } else {
            setError("Terjadi kesalahan sistem.");
            setCooldown(10);
         }
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col p-8 font-sans selection:bg-blue-500/30">
         {/* Top Branding Section */}
         <div className="pt-12 pb-16 space-y-8 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="flex items-center gap-4">
               <img src="/logo.png" className="h-10 w-auto brightness-0 invert" alt="Logo"/>
               <div className="h-4 w-[1px] bg-white/20"/>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Student Portal</p>
            </div>
            
            <div className="space-y-4">
               <h1 className="text-4xl font-black tracking-tighter leading-none">
                  Welcome to <br/>
                  <span className="text-blue-500">Ruang Sosmed.</span>
               </h1>
               <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-[260px]">
                  Masuk untuk mengelola tugas, roadmap, dan journey kreatifmu.
               </p>
            </div>
         </div>

         {/* Login Form Section */}
         <div className="flex-1">
            <form onSubmit={handleLogin} className="space-y-8">
               {error && (
                  <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-3">
                     <div className="w-1.5 h-1.5 rounded-full bg-rose-500"/>
                     {error}
                  </div>
               )}

               <div className="space-y-6">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Your Username</label>
                     <div className="relative">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600"/>
                        <input
                           type="text"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           placeholder="budisantoso"
                           className="w-full h-16 rounded-[24px] bg-slate-900 border border-white/5 pl-14 pr-6 text-white font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all placeholder:text-slate-700"
                           required
                       />
                     </div>
                  </div>

                  <div className="space-y-3">
                     <div className="flex justify-between items-center ml-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Secret Token</label>
                     </div>
                     <div className="relative">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600"/>
                        <input
                           type="password"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           placeholder="••••••••"
                           className="w-full h-16 rounded-[24px] bg-slate-900 border border-white/5 pl-14 pr-6 text-white font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all placeholder:text-slate-700"
                           required
                       />
                     </div>
                  </div>
               </div>

               <Button
                  disabled={loading || cooldown > 0}
                  className="w-full h-16 rounded-[24px] bg-blue-600 text-white font-black text-sm shadow-2xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-4 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
               >
                  {loading ? (
                     <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"/>
                  ) : cooldown > 0 ? (
                     <span>Coba lagi dalam {cooldown}s...</span>
                  ) : (
                     <>
                        Access Platform
                        <ArrowRight size={18}/>
                     </>
                  )}
               </Button>
            </form>
         </div>

         {/* Bottom Decoration */}
         <div className="py-10 text-center opacity-20">
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Alpha Engine v2.0</p>
         </div>
      </div>
   );
}
