"use client";

import React, { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Users, 
  Layers, 
  Target, 
  Calendar, 
  Plus, 
  ChevronRight, 
  Settings, 
  Zap, 
  Sparkles, 
  LogOut,
  LayoutDashboard,
  Search,
  MessageSquare,
  ArrowUpRight,
  Shield
} from "lucide-react";
import { supabaseV2 as supabase } from "@/lib/supabase";
import { getCachedSession, isLegacyAdmin } from "@/lib/authCache";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AgencyContent({ id }: { id: string }) {
  const resolvedParams = { id };
  const [activeTab, setActiveTab] = useState("dashboard");
  const [workspace, setWorkspace] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      await fetchWorkspaceDetail();
      await fetchMembers();
    };
    init();
  }, [resolvedParams.id]);

  const checkAuth = async () => {
   //Use cached session — avoids network call on every mount
    const legacyAdmin = isLegacyAdmin();
    if (legacyAdmin) {
      setIsAuthorized(true);
      return;
    }

    const session = await getCachedSession();
    if (!session) {
      router.push('/ruang-sosmed/login');
      return;
    }

   //Check if global admin or has membership in THIS workspace
    const { data: profile } = await supabase.from('v2_profiles').select('role').eq('id', session.user.id).single();
    
    if (profile?.role === 'admin') {
      setIsAuthorized(true);
      return;
    }

    const { data: membership } = await supabase.from('v2_memberships')
      .select('id')
      .eq('workspace_id', resolvedParams.id)
      .eq('profile_id', session.user.id)
      .maybeSingle();

    if (membership) {
      setIsAuthorized(true);
    } else {
      router.push('/ruang-sosmed/login');
    }
  };

  const fetchWorkspaceDetail = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('v2_workspaces').select('*').eq('id', resolvedParams.id).single();
    if (data) setWorkspace(data);
    setIsLoading(false);
  };

  const fetchMembers = async () => {
    const { data } = await supabase
      .from('v2_memberships')
      .select('*, v2_profiles(*)')
      .eq('workspace_id', resolvedParams.id);
    if (data) setMembers(data);
  };

  const TABS = [
    { id: "dashboard", label: "Team Dashboard", icon: <LayoutDashboard size={16}/> },
    { id: "content", label: "Content Plan", icon: <Layers size={16}/> },
    { id: "roadmap", label: "Shared Roadmap", icon: <Target size={16}/> },
    { id: "members", label: "Team Members", icon: <Users size={16}/> }
  ];

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"/>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
          Verifying Workspace Access...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 xl:p-12 space-y-12 max-w-[1700px] mx-auto min-h-screen">
      {/* Agency Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 py-10 px-10 bg-gradient-to-br from-emerald-600 to-teal-800 rounded-[44px] text-white overflow-hidden relative shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"/>
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/ruang-sosmed/agency" className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10 group">
              <ChevronRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform"/>
            </Link>
            <div className="px-3 py-1 rounded-full bg-white/20 text-white text-[9px] font-black uppercase tracking-widest border border-white/10">
              Agency Workspace
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-4">
               {workspace?.name || "Loading Agency..."}
            </h1>
            <div className="flex flex-wrap gap-6 items-center opacity-70">
              <p className="flex items-center gap-2 text-sm font-bold"><Shield size={14}/> Registered Agency</p>
              <div className="h-1 w-1 rounded-full bg-white/30"/>
              <p className="flex items-center gap-2 text-sm font-bold"><Users size={14}/> {members.length}/10 Members Actives</p>
              <div className="h-1 w-1 rounded-full bg-white/30"/>
              <p className="flex items-center gap-2 text-sm font-bold"><Sparkles size={14}/> Shared Content Environment</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex gap-4 xl:mb-2">
           <Button className="h-14 px-8 rounded-2xl bg-white text-emerald-900 font-bold text-sm shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3">
             <Plus size={18}/> New Content Task
           </Button>
           <Button className="h-14 px-8 rounded-2xl bg-white/10 text-white font-bold text-sm border border-white/10 hover:bg-white/20 transition-all">
             <Settings size={18}/>
           </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 p-2 bg-emerald-50/50 border border-emerald-100/50 rounded-3xl w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-8 py-4 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest transition-all ${activeTab === t.id ? "bg-white text-emerald-600 shadow-lg shadow-emerald-500/5 border border-emerald-100/50" : "text-slate-400 hover:text-emerald-700"}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.2 }}
           className="min-h-[500px]"
        >
          {activeTab === 'dashboard' && (
             <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <Card className="p-10 bg-white border-none shadow-xl shadow-slate-200/50 rounded-[44px] xl:col-span-2 space-y-10">
                   <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-black text-[#0F172A]">Recent Agency Activities</h3>
                      <Link href="#" className="text-xs font-bold text-emerald-600 flex items-center gap-2">View Activity Log <ArrowUpRight size={14}/></Link>
                   </div>
                   <div className="space-y-6">
                      {[1, 2, 3].map((i) => (
                         <div key={i} className="flex items-center gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white transition-all cursor-pointer">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-emerald-600">
                               <Layers size={20}/>
                            </div>
                            <div className="flex-1">
                               <p className="text-sm font-black text-[#0F172A]">New TikTok Content Plan Created</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">By Denny • 2 hours ago</p>
                            </div>
                            <div className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest">In Progress</div>
                         </div>
                      ))}
                   </div>
                </Card>

                <div className="space-y-8">
                   <Card className="p-10 bg-slate-900 text-white border-none shadow-2xl rounded-[44px] space-y-6 relative overflow-hidden">
                      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full"/>
                      <h3 className="text-xl font-black relative z-10">Agency Roadmap</h3>
                      <p className="text-white/40 text-sm leading-relaxed relative z-10">Fokus utama agensi bulan ini: Melakukan scale content volume ke 3x sehari per platform.</p>
                      <Button className="w-full h-14 bg-emerald-500 text-white font-bold rounded-2xl hover:scale-105 transition-all relative z-10 border-none">
                         Open Roadmap
                      </Button>
                   </Card>

                   <Card className="p-10 bg-white border-none shadow-xl shadow-slate-200/50 rounded-[44px] space-y-6">
                      <h3 className="text-xl font-black text-[#0F172A]">Project Members</h3>
                      <div className="space-y-4">
                         {members.map((m) => (
                            <div key={m.id} className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden"/>
                               <div className="flex-1">
                                  <p className="text-xs font-black text-[#0F172A]">{m.v2_profiles?.full_name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.v2_profiles?.role}</p>
                               </div>
                            </div>
                         ))}
                         {members.length === 0 && <p className="text-xs font-bold text-slate-300 italic text-center py-4">No members yet.</p>}
                      </div>
                      <Button className="w-full h-12 bg-slate-50 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-100 transition-all border border-slate-100">
                         Manage Team
                      </Button>
                   </Card>
                </div>
             </div>
          )}

          {activeTab === 'content' && (
             <div className="py-20 text-center space-y-6">
                <Layers size={44} className="mx-auto text-slate-200"/>
                <h3 className="text-xl font-black text-[#0F172A]">Collaborative Content Plan</h3>
                <p className="text-slate-400 text-sm font-medium max-w-sm mx-auto italic">Area ini akan menampilkan grid konten yang bisa diakses dan diedit bersama oleh seluruh anggota tim agensi.</p>
             </div>
          )}

          {activeTab === 'roadmap' && (
             <div className="py-20 text-center space-y-6">
                <Target size={44} className="mx-auto text-slate-200"/>
                <h3 className="text-xl font-black text-[#0F172A]">Team Strategic Roadmap</h3>
                <p className="text-slate-400 text-sm font-medium max-w-sm mx-auto italic">Satu rute perjalanan yang sama untuk dipantau oleh Manager dan Karyawan.</p>
             </div>
          )}

          {activeTab === 'members' && (
             <Card className="p-0 border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden rounded-[44px]">
               <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                 <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">Active Team Members</h3>
                 <Button className="bg-emerald-600 text-white h-12 px-6 rounded-xl font-bold text-sm">Add Member</Button>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">FullName</th>
                        <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Access Role</th>
                        <th className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                       {members.map((m) => (
                          <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                             <td className="px-10 py-6 font-black text-sm text-slate-900">{m.v2_profiles?.full_name}</td>
                             <td className="px-10 py-6">
                                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black border border-emerald-100 uppercase tracking-widest">{m.v2_profiles?.role || 'member'}</span>
                             </td>
                             <td className="px-10 py-6 text-xs font-bold text-emerald-500">Online Now</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
               </div>
             </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
