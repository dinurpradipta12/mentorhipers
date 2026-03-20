"use client";

import React from "react";
import { motion } from "framer-motion";
import { SectionLabel } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";
import { 
  Users, 
  Settings, 
  Plus, 
  Search, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  MoreVertical,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart4,
  ExternalLink,
  Calendar,
  DollarSign,
  User,
  Instagram,
  X,
  Copy,
  Check,
  Edit3,
  Target,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [clients, setClients] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [editingClientId, setEditingClientId] = React.useState<string | null>(null);
  const router = useRouter();

  // Form State
  const [formData, setFormData] = React.useState({
    full_name: "",
    niche: "",
    username: "",
    password: "",
    start_date: "",
    end_date: "",
    next_due_date: "",
    termin1: "",
    termin2: "",
    termin3: "",
    instagram: "",
    tiktok: ""
  });

  const fetchClients = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setClients(data);
    if (error) console.error("Error fetching clients:", error);
    setIsLoading(false);
  };

  React.useEffect(() => {
    const sessionStr = localStorage.getItem("mh_session");
    if (!sessionStr) {
       router.push("/login");
       return;
    }
    const session = JSON.parse(sessionStr);
    if (session.role !== "admin") {
       router.push("/login");
       return;
    }
    
    fetchClients();

    // -- REALTIME SUBSCRIPTION --
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clients' },
        (payload) => {
          console.log('Realtime change received!', payload);
          // Refetch to get fresh data or update local state manually
          // For simplicity and to ensure order, we refetch
          fetchClients();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  const handleRegisterClient = async () => {
    const payload = {
      full_name: formData.full_name,
      niche: formData.niche,
      username: formData.username,
      password: formData.password,
      start_date: formData.start_date,
      end_date: formData.end_date,
      next_due_date: formData.next_due_date,
      payment_data: {
        termin1: formData.termin1,
        termin2: formData.termin2,
        termin3: formData.termin3
      },
      social_media: {
        instagram: formData.instagram,
        tiktok: formData.tiktok
      }
    };

    let error;
    if (editingClientId) {
      const { error: updateError } = await supabase
        .from("clients")
        .update(payload)
        .eq("id", editingClientId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("clients")
        .insert([payload]);
      error = insertError;
    }

    if (!error) {
      setIsRegisterModalOpen(false);
      setEditingClientId(null);
      fetchClients();
      // Reset form
      setFormData({
        full_name: "", niche: "", username: "", password: "",
        start_date: "", end_date: "", next_due_date: "",
        termin1: "", termin2: "", termin3: "",
        instagram: "", tiktok: ""
      });
    } else {
      alert("Error saving client: " + error.message);
    }
  };

  const handleEditClick = (client: any) => {
    setEditingClientId(client.id);
    setFormData({
      full_name: client.full_name || "",
      niche: client.niche || "",
      username: client.username || "",
      password: client.password || "",
      start_date: client.start_date || "",
      end_date: client.end_date || "",
      next_due_date: client.next_due_date || "",
      termin1: client.payment_data?.termin1 || "",
      termin2: client.payment_data?.termin2 || "",
      termin3: client.payment_data?.termin3 || "",
      instagram: client.social_media?.instagram || "",
      tiktok: client.social_media?.tiktok || ""
    });
    setIsRegisterModalOpen(true);
  };

  const copyToClipboard = (id: string) => {
    const url = `${window.location.origin}/board/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const calculateRemainingWeeks = (endDate: string) => {
    if (!endDate) return "0 Minggu";
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.max(0, Math.ceil(diffDays / 7));
    return `${weeks} Minggu`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDayDiff = (endDate: string) => {
    if (!endDate) return 999;
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  return (
    <div className="min-h-screen bg-background flex flex-col xl:flex-row font-sans overflow-hidden">
      {/* Sidebar with Premium Pastel Aesthetic */}
      <aside className="w-full xl:w-80 bg-slate-50 text-slate-900 p-10 flex flex-col relative z-20 border-r border-border">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[80px] rounded-full -mr-16 -mt-16" />
        
        <div className="flex items-center gap-2 mb-16 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-serif">
            Admin <span className="text-accent italic">Pool</span>
          </h1>
        </div>
        
        <nav className="space-y-3 flex-1 relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6 px-4">Management</p>
          <AdminNavItem label="Overview" icon={<BarChart4 className="w-4 h-4" />} active />
          <AdminNavItem label="Client Boards" icon={<Users className="w-4 h-4" />} />
          <AdminNavItem label="Financials" icon={<TrendingUp className="w-4 h-4" />} />
          
          <div className="pt-8 mt-8 border-t border-slate-200">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6 px-4">System</p>
            <AdminNavItem label="Settings" icon={<Settings className="w-4 h-4" />} />
          </div>
        </nav>

        <div className="mt-auto p-6 rounded-2xl bg-white border border-border shadow-sm relative z-10">
          <p className="text-xs text-slate-400 mb-4 font-medium">Logged in as Developer</p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-accent-secondary" />
            <span className="text-sm font-bold tracking-wide">Arunika</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 xl:p-12 overflow-y-auto no-scrollbar relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 blur-[150px] rounded-full -z-10" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
        >
          <div>
            <SectionLabel label="Admin Command Center" className="mb-4" />
            <h2 className="text-5xl font-serif tracking-tight text-foreground leading-[1.1]">
              Dashboard <span className="gradient-text italic opacity-60 ml-1">Management</span>
            </h2>
          </div>
          
          <Button 
            onClick={() => setIsRegisterModalOpen(true)}
            size="lg" 
            className="rounded-2xl group shadow-accent-lg h-16 px-10"
          >
            <Plus className="w-5 h-5 mr-3" />
            Register New Client
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-16">
          <AdminStat label="Total Clients" value={clients.length.toString()} icon={<Users className="w-5 h-5" />} />
          <AdminStat label="Active Boards" value={clients.filter(c => c.status !== 'Completed' && c.status !== 'Paused').length.toString()} icon={<Zap className="w-5 h-5" />} />
          <AdminStat label="Completed" value={clients.filter(c => c.status === 'Completed').length.toString()} icon={<CheckCircle2 className="w-5 h-5" />} />
          <AdminStat label="Avg. Progress" value={`${clients.length > 0 ? Math.round(clients.reduce((acc, c) => acc + (c.progress || 0), 0) / clients.length) : 0}%`} icon={<TrendingUp className="w-5 h-5" />} />
        </div>

        <Card className="p-0 overflow-hidden bg-white border border-border">
          <div className="p-8 border-b border-border flex items-center justify-between bg-slate-50/30">
            <div>
              <h3 className="text-xl font-serif">Active Client Boards</h3>
              <p className="text-xs text-muted-foreground mt-1">Manage and monitor all exclusive mentoring sessions</p>
            </div>
          </div>

          <div className="p-8">
            {isLoading ? (
              <div className="py-20 text-center text-slate-400 italic font-serif">
                Synchronizing board records...
              </div>
            ) : clients.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {clients.map((client) => (
                  <motion.div 
                    key={client.id}
                    whileHover={{ y: -5 }}
                    className="group bg-white border border-border shadow-sm rounded-[3rem] p-8 hover:shadow-2xl hover:border-accent/10 transition-all duration-500 overflow-hidden relative flex flex-col"
                  >
                    {/* Status Badge */}
                    <div className="flex justify-center mb-6">
                       <div className={`text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border ${client.status === 'Completed' ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100 flex items-center gap-2'}`}>
                        {client.status !== 'Completed' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                        {client.status || 'Mentoring Aktif'}
                      </div>
                    </div>

                    {/* Avatar & Name Section */}
                    <div className="flex flex-col items-center text-center space-y-4 mb-8">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-slate-100 border-4 border-white shadow-xl overflow-hidden flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-500 ring-1 ring-slate-100">
                          {client.profile_url ? (
                            <img src={client.profile_url} alt={client.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-accent/10 flex items-center justify-center text-accent text-3xl font-serif">
                              {client.full_name?.split(' ').map((n:any) => n[0]).join('').slice(0,2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        
                        {/* Dynamic Status Indicator Logo */}
                        <motion.div 
                          animate={getDayDiff(client.end_date) < 7 ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center z-10 ${getDayDiff(client.end_date) < 7 ? 'bg-amber-400 text-white' : 'bg-emerald-500 text-white'}`}
                        >
                          {getDayDiff(client.end_date) < 7 ? (
                            <AlertTriangle className="w-5 h-5" />
                          ) : (
                            <Zap className="w-5 h-5 fill-current" />
                          )}
                        </motion.div>
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="text-xl font-bold text-foreground leading-tight tracking-tight">
                          {client.full_name}
                        </h4>
                        <p className="text-xs text-accent font-bold uppercase tracking-widest opacity-60">
                          {client.niche}
                        </p>
                      </div>
                    </div>

                    {/* Mentoring Timeline & Stats */}
                    <div className="bg-slate-50/50 rounded-[2rem] border border-slate-100 p-6 space-y-5 mb-8">
                       <div className="flex items-center justify-between">
                          <div className="space-y-1">
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                               <Calendar className="w-3 h-3" />
                               Periode Mentoring
                             </p>
                             <p className="text-[11px] font-bold text-slate-600">
                               {formatDate(client.start_date)} - {formatDate(client.end_date)}
                             </p>
                          </div>
                       </div>
                       
                       <div className="h-px bg-slate-200/50 w-full" />

                       <div className="flex items-center justify-between">
                          <div className="space-y-1">
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                               <Clock className="w-3 h-3" />
                               Sisa Waktu
                             </p>
                             <div className="flex items-center gap-2">
                               <span className="text-sm font-bold text-accent">
                                 {calculateRemainingWeeks(client.end_date)}
                               </span>
                               <span className="text-[10px] text-slate-400 font-medium">tersisa</span>
                             </div>
                          </div>
                          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                             <Zap className="w-5 h-5 text-amber-400" />
                          </div>
                       </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          onClick={() => handleEditClick(client)}
                          variant="outline"
                          className="rounded-2xl h-14 text-xs font-bold border-slate-200 text-slate-500 hover:border-accent hover:text-accent group/btn"
                        >
                          <Edit3 className="w-4 h-4 mr-2 opacity-50 group-hover/btn:opacity-100 transition-opacity" />
                          Edit Data
                        </Button>
                        <Button 
                          onClick={() => copyToClipboard(client.id)}
                          variant="outline"
                          className={`rounded-2xl h-14 text-xs font-bold border-slate-200 transition-all ${
                            copiedId === client.id ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'text-slate-500 hover:border-accent hover:text-accent group/share'
                          }`}
                        >
                          {copiedId === client.id ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2 opacity-50 group-hover/share:opacity-100 transition-opacity" />}
                          {copiedId === client.id ? "Copied" : "Share"}
                        </Button>
                      </div>
                      <Link 
                        href={`/board/${client.id}?admin=true`}
                        className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-accent text-white hover:bg-accent-secondary transition-all text-xs font-bold shadow-accent-sm group/preview"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Enter Board Room
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 italic font-medium">
                No clients registered yet. Start by clicking "Register New Client"
              </div>
            )}
          </div>
        </Card>
      </main>

      {/* Modal Pendaftaran New Client */}
      <AnimatePresence>
        {isRegisterModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsRegisterModalOpen(false)}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center shadow-accent-sm">
                    {editingClientId ? <Edit3 className="w-6 h-6 text-white" /> : <User className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif">{editingClientId ? "Update" : "Onboarding"} <span className="text-accent italic">{editingClientId ? "Client Context" : "New Client"}</span></h3>
                    <p className="text-xs text-slate-400 font-medium tracking-wide">{editingClientId ? "Modify specific client attributes and mentoring plan" : "Enter client data to initialize mentoring board"}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar">
                {/* 1. Basic Info */}
                <section className="space-y-6">
                  <h4 className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Essential Client Identity
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    <InputField label="Full Name" placeholder="Jessica Alvera" value={formData.full_name} onChange={(val: string) => setFormData({...formData, full_name: val})} />
                    <InputField label="Niche / Business Name" placeholder="Fashion & Lifestyle" value={formData.niche} onChange={(val: string) => setFormData({...formData, niche: val})} />
                    <InputField label="Username for Portal" placeholder="jessica_alvera" value={formData.username} onChange={(val: string) => setFormData({...formData, username: val})} />
                    <InputField label="Portal Password" type="password" placeholder="••••••••" value={formData.password} onChange={(val: string) => setFormData({...formData, password: val})} />
                  </div>
                </section>

                {/* 2. Mentoring Period & Finance */}
                <section className="space-y-6">
                  <h4 className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Timeline & Financial Plan
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="grid grid-cols-2 gap-4">
                       <InputField label="Start Mentoring" type="date" value={formData.start_date} onChange={(val: string) => setFormData({...formData, start_date: val})} />
                       <InputField label="End Mentoring" type="date" value={formData.end_date} onChange={(val: string) => setFormData({...formData, end_date: val})} />
                    </div>
                    <InputField label="Next Due Date" type="date" value={formData.next_due_date} onChange={(val: string) => setFormData({...formData, next_due_date: val})} />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6 pt-2">
                    <InputField label="Payment Termin 1" placeholder="Rp 1.000.000" icon={<DollarSign className="w-3 h-3" />} value={formData.termin1} onChange={(val: string) => setFormData({...formData, termin1: val})} />
                    <InputField label="Payment Termin 2" placeholder="Rp 1.000.000" icon={<DollarSign className="w-3 h-3" />} value={formData.termin2} onChange={(val: string) => setFormData({...formData, termin2: val})} />
                    <InputField label="Payment Termin 3" placeholder="Rp 1.000.000" icon={<DollarSign className="w-3 h-3" />} value={formData.termin3} onChange={(val: string) => setFormData({...formData, termin3: val})} />
                  </div>
                </section>

                {/* 3. Social Media Presence */}
                <section className="space-y-6">
                  <h4 className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Social Platforms
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    <InputField label="Instagram Username" placeholder="@username" icon={<Instagram className="w-3 h-3" />} value={formData.instagram} onChange={(val: string) => setFormData({...formData, instagram: val})} />
                    <InputField label="TikTok Username" placeholder="@username" value={formData.tiktok} onChange={(val: string) => setFormData({...formData, tiktok: val})} />
                  </div>
                </section>
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-slate-50 bg-slate-50/30">
                <Button
                  onClick={handleRegisterClient}
                  className="w-full h-16 rounded-[2rem] bg-accent text-white hover:bg-accent-secondary font-bold text-lg shadow-accent-lg flex items-center justify-center gap-3"
                >
                  <Zap className="w-6 h-6" />
                  {editingClientId ? "Save Changes" : "Initialize Client Board"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const InputField = ({ label, placeholder, type = "text", icon, value, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">{label}</label>
    <div className="relative">
      {icon && (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">
          {icon}
        </div>
      )}
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center ${icon ? "pl-12 pr-6" : "px-6"} font-bold text-sm focus:outline-none focus:ring-2 ring-accent/20 placeholder:text-slate-200 transition-all`}
        placeholder={placeholder}
      />
    </div>
  </div>
);

const AdminNavItem = ({ label, icon, active = false }: any) => (
  <button className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 h-14 text-sm font-bold ${
    active 
      ? "bg-accent text-white shadow-accent shadow-sm" 
      : "text-slate-400 hover:text-slate-900 hover:bg-slate-100 font-sans"
  }`}>
    <div className={`transition-colors duration-300 ${active ? "text-white" : "text-slate-300"}`}>
      {icon}
    </div>
    {label}
  </button>
);

const AdminStat = ({ label, value, icon }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-8 bg-white border border-border shadow-sm rounded-[2rem] overflow-hidden relative group"
  >
    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-accent/5 rounded-full group-hover:scale-150 transition-transform duration-700 flex items-center justify-center p-4">
      <div className="text-accent opacity-20">{icon}</div>
    </div>
    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">{label}</p>
    <h4 className="text-4xl font-serif">{value}</h4>
  </motion.div>
);
