"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
   Users,
   Settings,
   Plus,
   Search,
   ChevronLeft,
   ChevronRight,
   LogOut,
   LayoutDashboard,
   Calendar,
   FileText,
   Trash2,
   X,
   Target,
   CheckCircle2,
   Clock,
   MessageSquare,
   Zap,
   Star,
   Link as LinkIcon,
   ChevronDown,
   User,
   Sparkles
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/layout/AdminHeader";
import AdminSidebar from "@/components/layout/AdminSidebar";

// --- Components ---

interface AdminNavItemProps {
   label: string;
   icon: React.ReactElement;
   active?: boolean;
   href?: string;
   collapsed?: boolean;
}

const AdminNavItem = ({ label, icon, active = false, href = "#", collapsed = false }: AdminNavItemProps) => (
   <Link href={href} className={`w-full flex items-center gap-4 px-8 py-5 transition-all duration-300 ${active
         ? "bg-[#4880FF] text-white"
         : "text-[#202224] opacity-50 hover:opacity-100 hover:bg-slate-50 font-medium"
      } ${collapsed ? "justify-center px-0" : ""}`}>
      <div className={`transition-colors duration-300 ${active ? "text-white" : "text-slate-400"}`}>
         {React.cloneElement(icon, { size: 18 } as any)}
      </div>
      {!collapsed && <span className="text-[14px] font-bold tracking-tight">{label}</span>}
   </Link>
);

export default function AdminGoalsPage() {
   const router = useRouter();
   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
   const [isLoaded, setIsLoaded] = useState(false);
   const [clients, setClients] = useState<any[]>([]);
   const [selectedClient, setSelectedClient] = useState<any>(null);
   const [tasks, setTasks] = useState<any[]>([]);
   const [isAddingTask, setIsAddingTask] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [appSettings, setAppSettings] = useState({
    app_name: "Mentorhipers",
    app_logo: "",
    app_favicon: ""
  });

   // New Task Form State
   const [taskForm, setTaskForm] = useState({
      title: "",
      description: "",
      category: "Action",
      priority: "Medium"
   });

   // Vision Config State
   const [visionForm, setVisionForm] = useState({
      statement: "",
      focus: "",
      color: "#0F172A"
   });

   // Sidebar Logic
   const toggleSidebar = () => {
      const newState = !isSidebarOpen;
      setIsSidebarOpen(newState);
      localStorage.setItem("mh_admin_sidebar", String(newState));
   };

   useEffect(() => {
      const savedSidebar = localStorage.getItem("mh_admin_sidebar");
      if (savedSidebar !== null) setIsSidebarOpen(savedSidebar === "true");

      fetchClients();
      fetchAppSettings();
   }, []);

   const fetchAppSettings = async () => {
      const { data } = await supabase.from('app_settings').select('*').eq('id', 1).single();
      if (data) {
         setAppSettings({
            app_name: data.app_name || "Mentorhipers",
            app_logo: data.app_logo || "",
            app_favicon: data.app_favicon || "",
         });
         localStorage.setItem('app_name', data.app_name || "Mentorhipers");
         localStorage.setItem('app_logo', data.app_logo || "");
         localStorage.setItem('app_favicon', data.app_favicon || "");
      }
      setIsLoaded(true);
   };

   const fetchClients = async () => {
      const { data } = await supabase.from('clients').select('*').order('full_name');
      if (data) setClients(data);
   };

   const fetchTasks = async (clientId: string) => {
      setIsLoading(true);
      const { data } = await supabase
         .from('mentee_tasks')
         .select('*')
         .eq('client_id', clientId)
         .order('created_at', { ascending: false });
      if (data) setTasks(data);
      setIsLoading(false);
   };

   const handleSelectClient = (client: any) => {
      setSelectedClient(client);
      setVisionForm({
         statement: client.vision_statement || "Membangun personal brand yang Berpengaruh.",
         focus: Array.isArray(client.roadmap_focus) ? client.roadmap_focus.join(', ') : "Market Authority, Consistent Value Rendering, Monetization Readiness",
         color: client.roadmap_color || "#0F172A"
      });
      fetchTasks(client.id);
   };

   const handleUpdateVision = async () => {
      if (!selectedClient) return;

      const focusArray = visionForm.focus.split(',').map(s => s.trim()).filter(Boolean);

      const { error } = await supabase
         .from('clients')
         .update({
            vision_statement: visionForm.statement,
            roadmap_focus: focusArray,
            roadmap_color: visionForm.color
         })
         .eq('id', selectedClient.id);

      if (!error) {
         alert("Vision Map Updated! ✨");
         // Update local client data in list
         setClients(clients.map(c => c.id === selectedClient.id ? {
            ...c,
            vision_statement: visionForm.statement,
            roadmap_focus: focusArray,
            roadmap_color: visionForm.color
         } : c));
      } else {
         alert("Error: " + error.message);
      }
   };

   const handleAddTask = async () => {
      if (!taskForm.title || !selectedClient) return;

      const { error } = await supabase
         .from('mentee_tasks')
         .insert([
            {
               client_id: selectedClient.id,
               title: taskForm.title,
               description: taskForm.description,
               category: taskForm.category,
               priority: taskForm.priority,
               status: 'To Do'
            }
         ]);

      if (!error) {
         setIsAddingTask(false);
         setTaskForm({ title: "", description: "", category: "Action", priority: "Medium" });
         fetchTasks(selectedClient.id);
      }
   };

   const handleUpdateStatus = async (taskId: string, newStatus: string) => {
      const { error } = await supabase
         .from('mentee_tasks')
         .update({ status: newStatus })
         .eq('id', taskId);

      if (!error && selectedClient) fetchTasks(selectedClient.id);
   };

   const handleDeleteTask = async (taskId: string) => {
      if (!confirm("Hapus tugas ini?")) return;
      const { error } = await supabase
         .from('mentee_tasks')
         .delete()
         .eq('id', taskId);

      if (!error && selectedClient) fetchTasks(selectedClient.id);
   };

   const handleAddFeedback = async (taskId: string, feedback: string) => {
      const { error } = await supabase
         .from('mentee_tasks')
         .update({ mentor_feedback: feedback })
         .eq('id', taskId);

      if (!error && selectedClient) fetchTasks(selectedClient.id);
   };

   if (!isLoaded) return null;

   return (
      <div className="min-h-screen bg-[#F5F6FA] flex overflow-x-hidden font-sans">
         <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif !important; }
      `}</style>
         {/* SIDEBAR */}
         <AdminSidebar isSidebarOpen={isSidebarOpen} appSettings={appSettings} />

         {/* MAIN CONTENT AREA */}
         <motion.main
            initial={false}
            animate={{
               marginLeft: isSidebarOpen ? 240 : 80,
               width: `calc(100% - ${isSidebarOpen ? 240 : 80}px)`
            }}
            transition={{ duration: isLoaded ? 0.3 : 0, ease: "easeInOut" }}
            className="flex-1 flex flex-col min-h-screen font-sans"
         >
            <AdminHeader isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="p-6 xl:p-10 pt-32 xl:pt-36 space-y-10 max-w-[1600px] mx-auto w-full">
               {/* TOP BAR / TITLE */}
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                     <h2 className="text-[32px] font-black text-[#202224] tracking-tight">Mentee Goals & Roadmap</h2>
                     <p className="text-[14px] font-bold text-[#202224] opacity-40">Kendalikan arah perjalanan personal brand mentee kamu.</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* CLIENT SELECTION LIST */}
                  <div className="lg:col-span-3 space-y-4">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-black text-[#202224] opacity-60 uppercase tracking-widest">Select Mentee</h3>
                     </div>
                     <div className="space-y-3 max-h-[70vh] overflow-y-scroll no-scrollbar pr-2 pb-10">
                        {clients.map(client => (
                           <button
                              key={client.id}
                              onClick={() => handleSelectClient(client)}
                              className={`w-full p-4 rounded-[14px] flex items-center gap-4 transition-all border ${selectedClient?.id === client.id
                                    ? 'bg-[#4880FF] text-white border-transparent'
                                    : 'bg-white border-transparent hover:border-slate-200'
                                 }`}
                           >
                              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-50 shrink-0 bg-slate-100 flex items-center justify-center font-bold text-slate-300">
                                 {client.profile_url ? <img src={client.profile_url} alt={client.full_name} className="w-full h-full object-cover" /> : "MH"}
                              </div>
                              <div className="text-left font-sans flex-1 min-w-0">
                                 <p className="text-[14px] font-extrabold truncate leading-none mb-1">{client.full_name}</p>
                                 <p className={`text-[10px] font-bold uppercase tracking-wider opacity-60`}>Active Mentee</p>
                              </div>
                              {selectedClient?.id === client.id && <ChevronRight size={14} className="ml-auto" />}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* TASKS MANAGEMENT AREA */}
                  <div className="lg:col-span-9 space-y-6">
                     {!selectedClient ? (
                        <Card className="h-[60vh] flex flex-col items-center justify-center p-10 text-center border-none shadow-sm rounded-[14px]">
                           <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                              <Users size={32} className="text-slate-300" />
                           </div>
                           <h3 className="text-xl font-extrabold text-[#202224] mb-2">Pilih Mentee untuk Dikelola</h3>
                           <p className="text-slate-400 font-bold text-sm max-w-xs">Silahkan pilih mentee dari daftar sebelah kiri untuk mengatur Roadmap dan Goals mereka.</p>
                        </Card>
                     ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                           {/* Header For Mentee Detail */}
                           <Card className="p-8 border-none bg-white overflow-hidden relative shadow-sm rounded-[14px]">
                              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                                 <div className="w-24 h-24 rounded-[20px] overflow-hidden border-4 border-[#F5F6FA] shrink-0 bg-slate-100 flex items-center justify-center font-bold text-slate-300 text-2xl">
                                    {selectedClient.profile_url ? <img src={selectedClient.profile_url} alt={selectedClient.full_name} className="w-full h-full object-cover" /> : "MH"}
                                 </div>
                                 <div className="text-center md:text-left flex-1">
                                    <h4 className="text-[28px] font-black text-[#202224] tracking-tight">{selectedClient.full_name}</h4>
                                    <p className="text-[#4880FF] font-black uppercase tracking-[2px] text-[10px] mt-1">Personal Branding Roadmap Control</p>
                                 </div>
                                 <div className="md:ml-auto flex items-center gap-3 w-full md:w-auto">
                                    <Button
                                       onClick={() => setIsAddingTask(true)}
                                       className="w-full md:w-auto h-[52px] px-8 rounded-[12px] bg-[#4880FF] text-white font-bold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-3"
                                    >
                                       <Plus size={18} /> Add Roadmap Item
                                    </Button>
                                 </div>
                              </div>
                           </Card>

                           {/* VISION & COLOUR CONFIG */}
                           <Card className="p-8 border-none bg-[#F9FAFB] shadow-sm rounded-[14px] overflow-hidden relative">
                              <div className="flex flex-col md:flex-row gap-10">
                                 <div className="flex-1 space-y-6">
                                    <h3 className="text-sm font-black text-[#202224] opacity-60 uppercase tracking-widest flex items-center gap-2">
                                       <Sparkles size={14} className="text-[#4880FF]" /> Vision Card Setup
                                    </h3>

                                    <div className="space-y-4">
                                       <div className="space-y-1">
                                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vision Statement</label>
                                          <textarea
                                             value={visionForm.statement}
                                             onChange={(e) => setVisionForm({ ...visionForm, statement: e.target.value })}
                                             className="w-full h-24 p-5 rounded-2xl bg-white border border-slate-100 font-bold text-sm focus:outline-none focus:ring-2 ring-[#4880FF]/20"
                                             placeholder="Membangun personal brand yang Berpengaruh."
                                          />
                                       </div>

                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <div className="space-y-1">
                                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Focus Points (Koma Berhenti)</label>
                                             <input
                                                value={visionForm.focus}
                                                onChange={(e) => setVisionForm({ ...visionForm, focus: e.target.value })}
                                                className="w-full h-14 px-5 rounded-2xl bg-white border border-slate-100 font-bold text-sm"
                                                placeholder="Point 1, Point 2, Point 3"
                                             />
                                          </div>
                                          <div className="space-y-1">
                                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Card Background Color</label>
                                             <div className="flex gap-3">
                                                <input
                                                   type="color"
                                                   value={visionForm.color}
                                                   onChange={(e) => setVisionForm({ ...visionForm, color: e.target.value })}
                                                   className="w-14 h-14 rounded-xl cursor-pointer border-none bg-transparent"
                                                />
                                                <input
                                                   value={visionForm.color}
                                                   onChange={(e) => setVisionForm({ ...visionForm, color: e.target.value })}
                                                   className="flex-1 h-14 px-5 rounded-2xl bg-white border border-slate-100 font-mono text-sm uppercase"
                                                />
                                             </div>
                                          </div>
                                       </div>
                                    </div>

                                    <Button
                                       onClick={handleUpdateVision}
                                       className="h-12 px-10 rounded-xl bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest"
                                    >
                                       Save Vision Setup
                                    </Button>
                                 </div>

                                 {/* PREVIEW */}
                                 <div className="w-full md:w-80 shrink-0">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Live Preview</div>
                                    <div
                                       style={{ backgroundColor: visionForm.color }}
                                       className="p-8 rounded-[32px] text-white min-h-[220px] shadow-lg relative overflow-hidden"
                                    >
                                       <div className="absolute -top-5 -right-5 w-24 h-24 bg-white/10 blur-[40px] rounded-full" />
                                       <h4 className="text-xl font-bold tracking-tight whitespace-pre-wrap leading-relaxed">{visionForm.statement || "Your Vision Statement"}</h4>
                                       <div className="mt-6 space-y-2">
                                          {visionForm.focus.split(',').slice(0, 3).map((f, i) => f.trim() && (
                                             <div key={i} className="flex items-center gap-2 opacity-60"><div className="w-1 h-1 rounded-full bg-blue-400" /><p className="text-[10px] font-bold">{f.trim()}</p></div>
                                          ))}
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </Card>

                           {/* ROADMAP ITEMS LIST */}
                           <div className="space-y-6">
                              <h3 className="text-sm font-black text-[#202224] opacity-60 uppercase tracking-widest px-2 flex items-center gap-2">
                                 <Zap size={14} className="text-[#4880FF]" /> Roadmaps & Focus List
                              </h3>
                              {isLoading ? (
                                 <div className="py-20 text-center">
                                    <div className="w-8 h-8 border-4 border-[#4880FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-sm font-bold text-slate-400">Loading roadmap data...</p>
                                 </div>
                              ) : tasks.length === 0 ? (
                                 <div className="p-16 text-center bg-white rounded-[14px] border border-slate-50">
                                    <Zap className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-400 font-bold">Belum ada roadmap yang disetting untuk mentee ini.</p>
                                 </div>
                              ) : (
                                 <div className="grid grid-cols-1 gap-6">
                                    {tasks.map(task => (
                                       <Card key={task.id} className="p-0 overflow-hidden border-none shadow-sm rounded-[14px]">
                                          <div className="flex flex-col md:flex-row min-h-[180px]">
                                             {/* COLOR TAG */}
                                             <div className={`w-full md:w-2 ${task.status === 'Completed' ? 'bg-emerald-500' :
                                                   task.status === 'Needs Revision' ? 'bg-rose-500' :
                                                      task.status === 'Under Review' ? 'bg-amber-500' : 'bg-[#4880FF]'
                                                }`} />

                                             <div className="flex-1 p-8">
                                                <div className="flex flex-col md:flex-row justify-between gap-10">
                                                   <div className="space-y-5 flex-1">
                                                      <div className="flex items-center gap-3">
                                                         <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${task.category === 'Vision' ? 'bg-blue-50 text-blue-600' :
                                                               task.category === 'Action' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                            }`}>
                                                            {task.category}
                                                         </span>
                                                         <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${task.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'
                                                            }`}>
                                                            {task.priority} Priority
                                                         </span>
                                                      </div>
                                                      <h3 className="text-[22px] font-black text-[#202224] tracking-tight">{task.title}</h3>
                                                      <p className="text-sm font-medium text-slate-500 leading-relaxed">{task.description}</p>

                                                      <div className="flex flex-wrap gap-8 pt-2">
                                                         {task.evidence_link && (
                                                            <div className="flex items-center gap-3">
                                                               <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><LinkIcon size={14} /></div>
                                                               <div>
                                                                  <p className="text-[9px] font-black text-[#202224] opacity-30 uppercase">Mentee Proof</p>
                                                                  <a href={task.evidence_link} target="_blank" className="text-xs font-bold text-emerald-600 hover:underline">View Attachment</a>
                                                               </div>
                                                            </div>
                                                         )}

                                                         {task.mentor_feedback && (
                                                            <div className="flex items-center gap-3">
                                                               <div className="w-8 h-8 rounded-lg bg-[#4880FF]/10 text-[#4880FF] flex items-center justify-center"><MessageSquare size={14} /></div>
                                                               <div>
                                                                  <p className="text-[9px] font-black text-[#202224] opacity-30 uppercase tracking-widest">Feedback Given</p>
                                                                  <p className="text-xs font-bold text-[#202224] italic opacity-80">{task.mentor_feedback}</p>
                                                               </div>
                                                            </div>
                                                         )}
                                                      </div>
                                                   </div>

                                                   <div className="flex flex-col gap-3 min-w-[220px]">
                                                      <p className="text-[10px] font-black text-[#202224] opacity-30 uppercase tracking-widest md:text-right">Task Controls</p>
                                                      <select
                                                         value={task.status}
                                                         onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                                                         className={`h-12 w-full rounded-[10px] px-4 font-black text-[11px] uppercase tracking-[1px] border-2 focus:outline-none transition-all ${task.status === 'Completed' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' :
                                                               task.status === 'Under Review' ? 'border-amber-100 bg-amber-50 text-amber-600' :
                                                                  task.status === 'Needs Revision' ? 'border-rose-100 bg-rose-50 text-rose-600' : 'border-slate-100 bg-slate-100/50 text-slate-500'
                                                            }`}
                                                      >
                                                         <option value="To Do">To Do</option>
                                                         <option value="In Progress">In Progress</option>
                                                         <option value="Under Review">Under Review</option>
                                                         <option value="Completed">Completed</option>
                                                         <option value="Needs Revision">Needs Revision</option>
                                                      </select>

                                                      <button
                                                         onClick={() => {
                                                            const feedback = prompt("Masukkan feedback Mas Mentor:", task.mentor_feedback || "");
                                                            if (feedback !== null) handleAddFeedback(task.id, feedback);
                                                         }}
                                                         className="h-12 w-full rounded-[10px] bg-white border border-slate-200 text-[#202224] font-bold text-[11px] uppercase tracking-wider hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                                      >
                                                         <MessageSquare size={14} /> Add Feedback
                                                      </button>

                                                      <button
                                                         onClick={() => handleDeleteTask(task.id)}
                                                         className="h-10 text-[10px] font-black uppercase text-rose-400 hover:text-rose-600 tracking-widest transition-colors flex items-center justify-center gap-2"
                                                      >
                                                         <Trash2 size={12} /> Delete Item
                                                      </button>
                                                   </div>
                                                </div>
                                             </div>
                                          </div>
                                       </Card>
                                    ))}
                                 </div>
                              )}
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </motion.main>

         {/* ADD TASK MODAL */}
         <AnimatePresence>
            {isAddingTask && (
               <div className="fixed inset-0 z-[101] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 20 }}
                     className="bg-white rounded-[24px] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100"
                  >
                     <div className="p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
                        <h3 className="text-2xl font-black text-[#202224] tracking-tight">Ciptakan Roadmap Baru</h3>
                        <button onClick={() => setIsAddingTask(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-all"><X size={20} /></button>
                     </div>

                     <div className="p-8 space-y-8 overflow-y-auto no-scrollbar flex-1">
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-widest text-[#202224] opacity-30 ml-1">Category</label>
                              <select
                                 value={taskForm.category}
                                 onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                                 className="w-full h-14 rounded-xl bg-slate-50 border border-slate-200 px-6 font-bold text-sm focus:outline-none focus:ring-4 ring-[#4880FF]/5 transition-all outline-none"
                              >
                                 <option value="Vision">Vision / Goals</option>
                                 <option value="Action">Action Task</option>
                                 <option value="Learning">Learning / Modul</option>
                                 <option value="Personal Brand">Personal Branding</option>
                              </select>
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-widest text-[#202224] opacity-30 ml-1">Priority</label>
                              <select
                                 value={taskForm.priority}
                                 onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                                 className="w-full h-14 rounded-xl bg-slate-50 border border-slate-200 px-6 font-bold text-sm focus:outline-none focus:ring-4 ring-[#4880FF]/5 transition-all outline-none"
                              >
                                 <option value="Low">Low</option>
                                 <option value="Medium">Medium</option>
                                 <option value="High">High Priority</option>
                              </select>
                           </div>
                        </div>

                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-[#202224] opacity-30 ml-1">Judul Roadmap / Tugas</label>
                           <input
                              placeholder="e.g. Bangun profil bio yang kuat"
                              value={taskForm.title}
                              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                              className="w-full h-14 rounded-xl bg-slate-50 border border-slate-200 px-6 font-bold text-sm focus:outline-none focus:ring-4 ring-[#4880FF]/5 transition-all outline-none"
                           />
                        </div>

                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-[#202224] opacity-30 ml-1">Detail Instruksi</label>
                           <textarea
                              placeholder="Jelaskan apa saja yang harus dicapai dalam task ini..."
                              rows={4}
                              value={taskForm.description}
                              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                              className="w-full rounded-xl bg-slate-50 border border-slate-200 p-6 font-bold text-sm focus:outline-none focus:ring-4 ring-[#4880FF]/5 transition-all outline-none resize-none"
                           />
                        </div>
                     </div>

                     <div className="p-8 pt-4 shrink-0">
                        <Button
                           onClick={handleAddTask}
                           className="w-full h-16 rounded-[14px] bg-[#4880FF] text-white font-bold text-[16px] shadow-lg shadow-[#4880FF]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        >
                           <Plus size={20} /> Publish to Mentee Dashboard
                        </Button>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
}
