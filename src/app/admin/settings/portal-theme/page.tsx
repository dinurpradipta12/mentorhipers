"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
   Settings, Save, Palette, Image as ImageIcon, Type, Layout, CheckCircle2, AlertCircle, Plus, Trash2, Power, Zap
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { supabaseV2 as supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/layout/AdminHeader";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default function PortalThemeCMS() {
   const router = useRouter();
   const [isSidebarOpen, setSidebarOpen] = useState(true);
   const [themes, setThemes] = useState<any[]>([]);
   const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
   const [isLoaded, setIsLoaded] = useState(false);
   const [isSaving, setIsSaving] = useState(false);
   const [editTheme, setEditTheme] = useState<any>(null);
   const [appSettings, setAppSettings] = useState({
      app_name: "Mentorhipers",
      app_logo: "",
      app_favicon: ""
   });

   useEffect(() => {
       const session = localStorage.getItem("mh_session");
       if (!session || JSON.parse(session).role !== "admin") {
          router.push("/ruang-sosmed/login");
          return;
       }

       const fetchData = async () => {
           // Fetch themes
           const { data: themeData } = await supabase
               .from('v2_portal_themes')
               .select('*')
               .order('created_at', { ascending: false });
           
           if (themeData) {
               setThemes(themeData);
               const active = themeData.find(t => t.is_active);
               if (active) {
                   setActiveThemeId(active.id);
                   setEditTheme({...active});
               } else if (themeData.length > 0) {
                   setEditTheme({...themeData[0]});
               }
           }

           // Fetch general settings for sidebar
           const { data: settingsData } = await (supabase as any).from('app_settings').select('*').eq('id', 1).single();
           if (settingsData) {
               setAppSettings({
                   app_name: settingsData.app_name || "Mentorhipers",
                   app_logo: settingsData.app_logo || "",
                   app_favicon: settingsData.app_favicon || ""
               });
           }
           setIsLoaded(true);
       };

       fetchData();
   }, [router]);

   const handleToggleTheme = async (id: string) => {
       setIsSaving(true);
       try {
           // Deactivate all
           await supabase.from('v2_portal_themes').update({ is_active: false }).neq('id', id);
           // Activate target
           await supabase.from('v2_portal_themes').update({ is_active: true }).eq('id', id);
           
           setActiveThemeId(id);
           setThemes(themes.map(t => ({ ...t, is_active: t.id === id })));
           const active = themes.find(t => t.id === id);
           if (active) setEditTheme({...active});
       } catch (err) {
           console.error(err);
       } finally {
           setIsSaving(false);
       }
   };

   const handleSaveTheme = async () => {
       if (!editTheme) return;
       setIsSaving(true);
       try {
           const { error } = await supabase
               .from('v2_portal_themes')
               .update(editTheme)
               .eq('id', editTheme.id);
           
           if (!error) {
               setThemes(themes.map(t => t.id === editTheme.id ? editTheme : t));
               alert("Theme updated successfully! Check the login page to see the changes.");
           } else {
               alert("Error: " + error.message);
           }
       } catch (err) {
           console.error(err);
       } finally {
           setIsSaving(false);
       }
   };

   const handleCreateTheme = async () => {
      const newTheme = {
          theme_name: "New Theme (Copy)",
          is_active: false,
          hero_title: editTheme?.hero_title || "New Hero Title",
          hero_subtitle: editTheme?.hero_subtitle || "New Subtitle",
          primary_color: editTheme?.primary_color || "from-blue-600 to-indigo-700",
          secondary_color: editTheme?.secondary_color || "text-blue-400",
          background_css: editTheme?.background_css || "bg-slate-950",
          background_base_color: editTheme?.background_base_color || "bg-slate-950",
          footer_text: editTheme?.footer_text || "V2 Portal Environment (BETA)"
      };

      const { data, error } = await supabase.from('v2_portal_themes').insert([newTheme]).select();
      if (data) {
          setThemes([data[0], ...themes]);
          setEditTheme(data[0]);
      }
   };

   if (!isLoaded) return null;

   return (
      <div className="min-h-screen bg-[#F5F6FA] flex overflow-x-hidden font-sans">
         <AdminSidebar isSidebarOpen={isSidebarOpen} appSettings={appSettings} />

         <motion.main
            animate={{
               marginLeft: isSidebarOpen ? 240 : 80,
               width: `calc(100% - ${isSidebarOpen ? 240 : 80}px)`
            }}
            className="flex-1 flex flex-col min-h-screen"
         >
            <AdminHeader
               title="Login Portal Customizer"
               isSidebarOpen={isSidebarOpen}
               toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
            />

            <div className="flex-1 p-8 pt-32 xl:pt-36 flex flex-col lg:flex-row gap-8">
               
               {/* THEME LIST */}
               <div className="w-full lg:w-80 shrink-0 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                     <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Your Themes</h4>
                     <button onClick={handleCreateTheme} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition-all">
                        <Plus size={16} />
                     </button>
                  </div>
                  
                  {themes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setEditTheme({...t})}
                        className={`w-full p-5 rounded-2xl border transition-all text-left flex items-center justify-between group ${
                            editTheme?.id === t.id 
                            ? "bg-white border-blue-200 shadow-md ring-1 ring-blue-100" 
                            : "bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-200"
                        }`}
                      >
                         <div className="space-y-1">
                            <p className={`text-sm font-black ${editTheme?.id === t.id ? "text-blue-600" : "text-slate-700"}`}>{t.theme_name}</p>
                            <p className="text-[10px] font-bold text-slate-400">Created: {new Date(t.created_at).toLocaleDateString()}</p>
                         </div>
                         {t.is_active && <Zap size={14} className="text-amber-500 fill-amber-500" />}
                      </button>
                  ))}
               </div>

               {/* EDIT PANEL */}
               {editTheme && (
                   <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-right-4">
                      
                      {/* HEADER ACTION */}
                      <Card className="p-6 rounded-3xl border border-slate-100 bg-white flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editTheme.is_active ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                               <Zap size={20} />
                            </div>
                            <div>
                               <h3 className="font-black text-slate-800">{editTheme.theme_name}</h3>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{editTheme.is_active ? 'Theme is Active' : 'Draft / Inactive'}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            {!editTheme.is_active && (
                                <Button 
                                    onClick={() => handleToggleTheme(editTheme.id)} 
                                    disabled={isSaving}
                                    className="bg-slate-800 hover:bg-black text-white px-6 h-12 rounded-2xl font-black text-xs gap-2"
                                >
                                   <Power size={14} /> Go Live
                                </Button>
                            )}
                            <Button 
                                onClick={handleSaveTheme} 
                                disabled={isSaving}
                                className="bg-[#4880FF] hover:bg-blue-600 text-white px-8 h-12 rounded-2xl font-black text-xs gap-2 shadow-lg shadow-blue-500/20"
                            >
                               <Save size={14} /> {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                         </div>
                      </Card>

                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                         {/* BASIC INFO */}
                         <Card className="p-8 rounded-[2rem] border border-slate-100 bg-white space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                               <Type className="text-blue-500" size={18} />
                               <h4 className="font-black text-slate-800 text-sm">Text & Content</h4>
                            </div>
                            
                            <div className="space-y-4">
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Theme Name</label>
                                  <input 
                                     type="text" 
                                     value={editTheme.theme_name} 
                                     onChange={(e) => setEditTheme({...editTheme, theme_name: e.target.value})}
                                     className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold focus:outline-none focus:ring-2 ring-blue-500/10"
                                  />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Landing Hero Title</label>
                                  <textarea 
                                     rows={2}
                                     value={editTheme.hero_title} 
                                     onChange={(e) => setEditTheme({...editTheme, hero_title: e.target.value})}
                                     className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold focus:outline-none focus:ring-2 ring-blue-500/10 resize-none"
                                  />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hero Subtitle</label>
                                  <textarea 
                                     rows={3}
                                     value={editTheme.hero_subtitle} 
                                     onChange={(e) => setEditTheme({...editTheme, hero_subtitle: e.target.value})}
                                     className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold focus:outline-none focus:ring-2 ring-blue-500/10 resize-none"
                                  />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Footer Status Text</label>
                                  <input 
                                     type="text" 
                                     value={editTheme.footer_text} 
                                     onChange={(e) => setEditTheme({...editTheme, footer_text: e.target.value})}
                                     className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold focus:outline-none focus:ring-2 ring-blue-500/10"
                                  />
                               </div>
                            </div>
                         </Card>

                         {/* VISUALS */}
                         <Card className="p-8 rounded-[2rem] border border-slate-100 bg-white space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                               <Palette className="text-blue-500" size={18} />
                               <h4 className="font-black text-slate-800 text-sm">Visual & Styling</h4>
                            </div>

                            <div className="space-y-4">
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tailwind Gradient (Primary)</label>
                                  <input 
                                     type="text" 
                                     value={editTheme.primary_color} 
                                     onChange={(e) => setEditTheme({...editTheme, primary_color: e.target.value})}
                                     className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-mono focus:outline-none focus:ring-2 ring-blue-500/10"
                                     placeholder="from-blue-600 to-indigo-700"
                                  />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secondary Text Color</label>
                                  <input 
                                     type="text" 
                                     value={editTheme.secondary_color} 
                                     onChange={(e) => setEditTheme({...editTheme, secondary_color: e.target.value})}
                                     className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-mono focus:outline-none focus:ring-2 ring-blue-500/10"
                                     placeholder="text-blue-400"
                                  />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Background Color</label>
                                  <input 
                                     type="text" 
                                     value={editTheme.background_base_color} 
                                     onChange={(e) => setEditTheme({...editTheme, background_base_color: e.target.value})}
                                     className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-mono focus:outline-none focus:ring-2 ring-blue-500/10"
                                     placeholder="bg-slate-950"
                                  />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Custom Background CSS Wrapper</label>
                                  <textarea 
                                     rows={3}
                                     value={editTheme.background_css} 
                                     onChange={(e) => setEditTheme({...editTheme, background_css: e.target.value})}
                                     className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-mono focus:outline-none focus:ring-2 ring-blue-500/10 resize-none"
                                     placeholder="bg-[radial-gradient(...)]"
                                  />
                               </div>
                            </div>
                         </Card>

                         {/* JSON CONFIG */}
                         <Card className="p-8 rounded-[2rem] border border-slate-100 bg-white xl:col-span-2 space-y-4">
                            <div className="flex items-center justify-between mb-2">
                               <div className="flex items-center gap-3">
                                  <Layout className="text-blue-500" size={18} />
                                  <h4 className="font-black text-slate-800 text-sm">Moment Specific Configuration (JSON)</h4>
                               </div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase">Advanced Options</p>
                            </div>
                            <textarea 
                                rows={5}
                                value={JSON.stringify(editTheme.config, null, 2)} 
                                onChange={(e) => {
                                    try {
                                        const parsed = JSON.parse(e.target.value);
                                        setEditTheme({...editTheme, config: parsed});
                                    } catch (err) {
                                        // Silent error while typing
                                    }
                                }}
                                className="w-full bg-slate-900 border border-slate-100 rounded-xl p-6 text-xs font-mono text-emerald-400 focus:outline-none focus:ring-2 ring-blue-500/10 resize-none"
                            />
                            <p className="text-[10px] font-bold text-slate-400">Gunakan kolom ini untuk fitur spesial misal: <code>{"{\"show_clouds\": true, \"snow_intensity\": 5}"}</code></p>
                         </Card>
                      </div>

                   </div>
               )}

            </div>
         </motion.main>
      </div>
   );
}
