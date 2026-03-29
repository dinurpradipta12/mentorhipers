"use client";



import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  ArrowLeft,
  Zap, 
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseV2 as supabase } from "@/lib/supabase";

export default function SelectionContent() {
  const [roleChecked, setRoleChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleRoute = async () => {
      // 1. Check Legacy Admin
      if (typeof window !== 'undefined' && localStorage.getItem('v2_legacy_admin') === 'true') {
         setRoleChecked(true);
         return; 
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      
      // If no session, redirect to login
      if (!session) {
        router.push('/v2/login');
        return;
      }

      const { data: profile } = await supabase.from('v2_profiles').select('role').eq('id', session.user.id).single();
      
      if (profile) {
        if (profile.role === 'admin') {
          // User is admin, show the selection screen
          setRoleChecked(true);
        } else {
          // User is student, find their membership and redirect them
          const { data: membership } = await supabase.from('v2_memberships')
            .select('workspace_id')
            .eq('profile_id', session.user.id)
            .maybeSingle();

          if (membership?.workspace_id) {
            router.push(`/v2/portal/${membership.workspace_id}`);
          } else {
            // No membership found, could be an error or newly registered
            // For safety, redirect to login or a generic 404
            router.push('/v2/login');
          }
        }
      } else {
        // No profile found? Likely not a V2 user.
        router.push('/login');
      }
    };
    handleRoute();
  }, [router]);

  const OPTIONS = [
    {
      id: "school",
      title: "School / Bootcamp Mode",
      type: "SCHEME A",
      description: "LMS for batch classes. Manage up to 50 students, assignments, attendance, and 12+ grading points.",
      icon: <img src="/logo_rs.png" className="w-24 h-24 object-contain" alt="School Logo" />,
      color: "from-blue-600 to-indigo-700",
      accent: "bg-blue-500",
      features: ["6x Post-tests", "3x Assignments", "Group Challenges", "Batch Analytics"],
      link: "/v2/batch"
    },
    {
      id: "agency",
      title: "Agency / Team Mode",
      type: "SCHEME B",
      description: "Collaborative B2B Workspace. Shared roadmap, content plans, and tasks for teams up to 10 members.",
      icon: <img src="/logo.png" className="w-24 h-24 object-contain" alt="Agency Logo" />,
      color: "from-emerald-600 to-teal-700",
      accent: "bg-emerald-500",
      features: ["10 Members Max", "Shared Dashboard", "Real-time Roadmap", "Cross-Team Content"],
      link: "/v2/agency"
    }
  ];

  if (!roleChecked) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
          Verifying Identity...
        </p>
      </div>
    );
  }

   return (
    <div className="p-6 md:p-12 xl:p-24 relative min-h-screen overflow-hidden bg-white">
      {/* Decorative Blur BG */}
      <div className="absolute top-20 right-20 w-80 h-80 bg-blue-400/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-400/10 blur-[120px] rounded-full -z-10" />

      {/* Admin V1 Return Button */}
      <div className="flex justify-between items-center mb-12 sm:mb-20">
         <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black border border-blue-100 inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            V2 Workspace Selection
          </div>
        <Link 
          href="/admin/dashboard" 
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-[#0F172A] hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all font-black text-[9px] uppercase tracking-[0.15em] group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          Switch to V1
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1400px] mx-auto space-y-12 sm:space-y-20"
      >
        {/* Intro */}
        <div className="max-w-3xl">
          <h1 className="text-[32px] sm:text-5xl md:text-6xl font-black text-[#0F172A] leading-[1.1] tracking-tight">
            Level up your <span className="text-blue-600 italic">mentoring</span> experience.
          </h1>
          <p className="mt-6 text-slate-500 font-medium text-base sm:text-lg leading-relaxed max-w-xl">
            Pilih ekosistem yang sesuai dengan strategi bisnis Anda saat ini. Kami memisahkan arsitektur LMS Kelas dengan Kolaborasi Agensi.
          </p>
        </div>

        {/* Binary Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
          {OPTIONS.map((opt) => (
            <Link key={opt.id} href={opt.link}>
              <motion.div
                whileHover={{ y: -10 }}
                className="relative group cursor-pointer bg-white border border-slate-100 rounded-[32px] sm:rounded-[44px] p-8 sm:p-12 xl:p-14 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all h-full overflow-hidden"
              >
                {/* Background Pattern */}
                <div className={`absolute -right-20 -top-20 w-64 h-64 blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-700 bg-gradient-to-br ${opt.color}`} />
                
                <div className="relative z-10 space-y-8 sm:space-y-12">
                  <div className="flex items-start justify-between -mt-2">
                    <div className="w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center p-2">
                      {opt.icon}
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-400 font-black text-[9px] border border-slate-100 uppercase tracking-widest">
                      {opt.type}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">{opt.title}</h3>
                    <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">{opt.description}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {opt.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${opt.accent}`} />
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 tracking-tight">{f}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 sm:pt-6">
                    <div className="flex items-center gap-4 group-hover:gap-6 transition-all duration-300">
                      <span className={`text-xs sm:text-sm font-black ${opt.id === 'school' ? 'text-blue-600' : 'text-emerald-600'}`}>Setup Workspace</span>
                      <ArrowRight size={18} className={opt.id === 'school' ? 'text-blue-600' : 'text-emerald-600'} />
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Footer Info */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-10 border-t border-slate-100 opacity-60">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span className="text-[10px] font-black">Parallel Database V2.0</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-500" />
              <span className="text-[10px] font-black">Edge-Runtime Ready</span>
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400">Click a card to initialize the environment</p>
        </div>
      </motion.div>
    </div>
  );
}
