"use client";



import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
   Zap,
   ArrowRight,
   User,
   Lock,
   Sparkles,
   GraduationCap,
   ShieldCheck,
   LayoutDashboard,
   Box,
   ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabaseV2 as supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function LoginContentDesktop() {
   const router = useRouter();
   const [loading, setLoading] = useState(false);
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [error, setError] = useState("");


   const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError("");

      try {
         // INTERCEPT FOR USERNAME / ADMIN LOGIN
         let loginIdentifier = email;
         
         // 1. ARUNIKA ADMIN MAPPING
         if (email === "arunika" && password === "ar4925") {
            loginIdentifier = "arunika@mentorhipers.local";
         } 
         // 2. STUDENT USERNAME MAPPING
         else if (email && !email.includes('@')) {
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
            // Intelligent Redirect
            const { data: profile } = await supabase.from('v2_profiles').select('role').eq('id', data.user.id).single();
            if (profile && profile.role !== 'admin') {
               const { data: membership } = await supabase.from('v2_memberships').select('workspace_id').eq('profile_id', data.user.id).single();
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-blue-500/30 selection:text-white">
         {/* Background Magic */}
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,_#1e1b4b_0%,_transparent_50%),radial-gradient(circle_at_70%_80%,_#0f172a_0%,_transparent_50%)]" />
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[length:40px_40px]" />

         {/* Floating Blobs */}
         <div className="absolute -top-[10%] -right-[15%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse" />
         <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full" />

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
                     alt="Mentorhipers Logo"
                  />
               </div>

               <div className="space-y-8">
                  <h2 className="text-5xl md:text-6xl font-black text-white leading-tight tracking-tight">
                     Elevate your <br />
                     <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Creative Career.</span>
                  </h2>
                  <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md">
                     Satu portal terpadu untuk murid Akademi dan tim Agensi B2B. Masuk untuk mengelola tugas, nilai, dan roadmap konten Anda.
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-4 max-w-md">
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
                     <GraduationCap className="text-blue-400" size={24} />
                     <p className="text-xs font-black text-white">LMS Academy</p>
                     <p className="text-[10px] font-bold text-slate-500">Pusat pengerjaan tugas murid batch & grading.</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
                     <ShieldCheck className="text-indigo-400" size={24} />
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
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />

                  <div className="mb-12 space-y-2">
                     <h3 className="text-3xl font-black text-white tracking-tight">Portal Login</h3>
                     <p className="text-slate-400 text-sm font-medium">Gunakan kredensial akun yang diberikan oleh mentor Anda.</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-8">
                     {error && (
                        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold animate-in fade-in slide-in-from-top-2 flex items-center gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                           {error}
                        </div>
                     )}

                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 ml-2">Username / Admin Email</label>
                        <div className="relative group/input">
                           <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within/input:text-blue-500 transition-colors" />
                           <input
                              type="text"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="e.g. budisantoso atau nama@agency.com"
                              className="w-full h-16 rounded-3xl bg-slate-900 border border-white/5 pl-14 pr-6 text-white font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all placeholder:text-slate-700"
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
                           <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within/input:text-blue-500 transition-colors" />
                           <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full h-16 rounded-3xl bg-slate-900 border border-white/5 pl-14 pr-6 text-white font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all placeholder:text-slate-700"
                              required
                           />
                        </div>
                     </div>

                     <Button
                        disabled={loading}
                        className="w-full h-20 rounded-[32px] bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black text-lg shadow-2xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-4 hover:brightness-110"
                     >
                        {loading ? (
                           <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                           <>
                              Access Platform
                              <ChevronRight size={24} />
                           </>
                        )}
                     </Button>
                  </form>

                  <div className="mt-12 text-center">
                     <p className="text-slate-500 text-[10px] font-black">
                        Secured by Mentorhipers Enterprise Engine
                     </p>
                  </div>
               </Card>
            </motion.div>
         </div>

         <footer className="absolute bottom-10 text-[10px] font-black text-slate-700">
            V2 Portal Environment (BETA)
         </footer>
      </div>
   );
}
