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

   const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError("");

      if (email === "arunika" && password === "ar4925") {
         await supabase.auth.signOut();
         localStorage.setItem("v2_legacy_admin", "true");
         router.push('/v2');
         return;
      }

      try {
         let loginIdentifier = email;
         if (email && !email.includes('@')) {
            loginIdentifier = `${email.toLowerCase().trim()}@mentorhipers.local`;
         }

         const { data, error: authError } = await supabase.auth.signInWithPassword({
            email: loginIdentifier,
            password
         });

         if (authError) {
            setError(authError.message === "Invalid login credentials" ? "Username atau Password salah." : authError.message);
            setLoading(false);
            return;
         }

         if (data.user) {
            // Invalidate cache so the new session is picked up immediately
            invalidateSessionCache();
            const { data: profile } = await supabase
              .from('v2_profiles')
              .select('role')
              .eq('id', data.user.id)
              .maybeSingle();

            if (profile && profile.role !== 'admin') {
               const { data: membership } = await supabase
                 .from('v2_memberships')
                 .select('workspace_id')
                 .eq('profile_id', data.user.id)
                 .maybeSingle();

               if (membership?.workspace_id) {
                  router.push(`/v2/portal/${membership.workspace_id}`);
                  return;
               }
            }
            router.push('/v2');
         }
      } catch (err) {
         setError("Terjadi kesalahan sistem.");
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col p-8 font-sans selection:bg-blue-500/30">
         {/* Top Branding Section */}
         <div className="pt-12 pb-16 space-y-8 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="flex items-center gap-4">
               <img src="/logo.png" className="h-10 w-auto brightness-0 invert" alt="Logo" />
               <div className="h-4 w-[1px] bg-white/20" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Student Portal</p>
            </div>
            
            <div className="space-y-4">
               <h1 className="text-4xl font-black tracking-tighter leading-none">
                  Welcome to <br />
                  <span className="text-blue-500">Mentorhipers.</span>
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
                     <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                     {error}
                  </div>
               )}

               <div className="space-y-6">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Your Username</label>
                     <div className="relative">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
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
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
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
                  disabled={loading}
                  className="w-full h-16 rounded-[24px] bg-blue-600 text-white font-black text-sm shadow-2xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-4 hover:bg-blue-500"
               >
                  {loading ? (
                     <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                     <>
                        Access Platform
                        <ArrowRight size={18} />
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
