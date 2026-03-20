"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Badge";
import { Zap, ArrowRight, User, Lock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 1. Admin Developer Credentials
    if (username === "arunika" && password === "ar4925") {
      localStorage.setItem("mh_session", JSON.stringify({ role: "admin", username: "arunika" }));
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 1000);
      return;
    } 

    // 2. Client Portal Login via Supabase
    try {
      const { data: client, error: authError } = await supabase
        .from("clients")
        .select("id, username, password")
        .eq("username", username)
        .single();

      if (authError || !client) {
        setError("User tidak ditemukan atau kredensial salah.");
        setLoading(false);
        return;
      }

      if (client.password === password) {
        // Successful client login
        localStorage.setItem("mh_session", JSON.stringify({ role: "client", clientId: client.id }));
        router.push(`/board/${client.id}`);
      } else {
        setError("Password yang Anda masukkan salah.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Login unexpected error:", err);
      setError("Terjadi kesalahan sistem. Silahkan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-white">
      {/* Left Column - Form */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 sm:p-20 relative z-10 bg-white">
        <div className="max-w-md w-full">
          <div className="flex items-center gap-2 mb-12">
            <h1 className="text-3xl font-calistoga tracking-tight">
              Mentor<span className="gradient-text">hipers</span>
            </h1>
          </div>

          <SectionLabel label="Secure Access" className="mb-6" />
          <h2 className="text-4xl font-calistoga mb-2 leading-tight">
            Selamat Datang <span className="gradient-text">Kembali!</span>
          </h2>
          <p className="text-muted-foreground mb-10 text-sm">
            Masukan kredensial yang telah diberikan oleh admin untuk mengakses dashboard mentoring pribadi kamu.
          </p>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Username / Client ID</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. MH-2024-CLIENT" 
                  className="w-full h-14 rounded-2xl border border-border/50 bg-[#FAFAFA] pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent/40 shadow-sm transition-all text-slate-800"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full h-14 rounded-2xl border border-border/50 bg-[#FAFAFA] pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent/40 shadow-sm transition-all text-slate-800"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit"
              size="lg" 
              className="w-full rounded-2xl h-14 shadow-accent-lg group mt-4"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </div>
              ) : (
                <>
                  Masuk ke Dashboard
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-12 text-center text-xs text-muted-foreground">
            Lupa password atau tidak punya akses? <br />
            Silahkan hubungi <span className="text-accent font-bold cursor-pointer hover:underline">Admin Mentorhipers</span>
          </p>
        </div>
      </div>

      {/* Right Column - Brand/Visual Section */}
      <div className="hidden lg:flex lg:col-span-7 bg-[#0F172A] relative overflow-hidden items-center justify-center">
        {/* Animated Background Textures */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent opacity-40" />
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[length:32px_32px]" />
        
        {/* Glowing Radial Accents */}
        <div className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] bg-accent/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-accent-secondary/15 blur-[100px] rounded-full" />

        {/* Hero Illustration Wrapper */}
        <div className="relative z-10 w-full max-w-2xl px-12">
          {/* Rotating Ring */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -left-20 w-[140px] h-[140px] border-2 border-dashed border-white/10 rounded-full flex items-center justify-center opacity-40"
          >
            <div className="w-[100px] h-[100px] border border-white/5 rounded-full" />
          </motion.div>

          <div className="flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <h3 className="text-5xl font-calistoga text-white italic leading-tight">
                Empowering your <br />
                <span className="gradient-text italic">Visual Presence.</span>
              </h3>
              <p className="text-white/50 text-lg mt-6 max-w-lg leading-relaxed">
                Platform mentoring visual yang didesain khusus untuk membantu kamu membangun personal brand yang kuat dan berpengaruh di media sosial.
              </p>
            </motion.div>

            {/* Floating Visual Cards */}
            <div className="relative h-[300px] mt-12">
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-0"
              >
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 w-64 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center">
                      <Zap className="text-white w-5 h-5 fill-white" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Performance</p>
                      <p className="text-sm font-bold text-white">Niche Analytics</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[70%] bg-accent" />
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[45%] bg-accent-secondary" />
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-20 right-0"
              >
                <Card className="bg-slate-900 border border-white/10 p-6 w-64 shadow-2xl rotate-3">
                  <div className="flex items-center justify-between mb-4">
                    <Sparkles className="text-accent-secondary w-5 h-5" />
                    <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">New Content</span>
                  </div>
                  <p className="text-sm text-white/90 font-medium mb-4">"10 Strategi Jitu Membangun Personal Brand..."</p>
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-7 h-7 rounded-full border-2 border-slate-900 bg-slate-700" />
                    ))}
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
