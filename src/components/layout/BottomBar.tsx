"use client";

import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  CheckSquare, 
  Milestone,
  Zap,
  Video,
  FileText,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  X,
  PlusCircle,
  Clock,
  Send,
  Link as LinkIcon,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";

// --- Sub-components for Modals ---

interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const ModalBase = ({ isOpen, onClose, title, children, footer }: ModalBaseProps) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
        >
          <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
             <h3 className="text-[18px] font-extrabold text-[#202224]">{title}</h3>
             <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all"><X size={20} /></button>
          </div>
          <div className="p-6 md:p-8 space-y-6 overflow-y-auto no-scrollbar flex-1">
             {children}
          </div>
          {footer && (
            <div className="p-6 md:p-8 pt-0 shrink-0">
               {footer}
            </div>
          )}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

interface InputFieldProps {
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  icon?: React.ReactNode;
}

const InputField = ({ label, placeholder, type = "text", value, onChange, icon }: InputFieldProps) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">{label}</label>
    <div className="relative">
       {icon && <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>}
       <input 
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 ${icon ? 'pl-14' : 'px-6'} font-bold text-sm focus:outline-none focus:ring-2 ring-[#4880FF]/20 transition-all`}
          placeholder={placeholder}
       />
    </div>
  </div>
);

// --- Main BottomBar Component ---

const BottomNavigation = ({ 
  activeTab, 
  onTabChange,
  clientInfo,
  enabledFeatures = { dashboard: true, content_plan: true, timeline: true, reports: true }
}: { 
  activeTab?: string; 
  onTabChange?: (tab: string) => void;
  clientInfo?: { id?: string; name?: string; avatar?: string; email?: string },
  enabledFeatures?: { dashboard: boolean; content_plan: boolean; timeline: boolean; reports: boolean }
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [bookingSettings, setBookingSettings] = useState({
    start_hour: 9,
    end_hour: 21,
    working_days: [1, 2, 3, 4, 5]
  });

  // Dynamic Time slots
  const TIME_SLOTS = Array.from({ length: Math.max(0, bookingSettings.end_hour - bookingSettings.start_hour + 1) }, (_, i) => {
    const hour = i + bookingSettings.start_hour;
    return `${hour.toString().padStart(2, '0')}:00`;
  });
  
  // Data States for Forms
  const [bookingData, setBookingData] = useState({ subject: "", date: "", time: "", topic: "", fileLink: "" });
  const [submissionData, setSubmissionData] = useState({ subject: "", link: "", note: "", fileLink: "" });
  const [journalData, setJournalData] = useState({ subject: "", update: "", blocker: "", fileLink: "" });
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const handleOpenBooking = () => setActiveModal('booking');
    window.addEventListener('openBookingModal', handleOpenBooking);
    return () => window.removeEventListener('openBookingModal', handleOpenBooking);
  }, []);

  // Fetch occupied slots whenever date changes
  useEffect(() => {
    if (activeModal === 'booking' && bookingData.date) {
      const fetchOccupied = async () => {
        setIsLoadingSlots(true);
        
        // Fetch Booking Settings from Mentor
        const { data: mentorData } = await supabase.from('mentor_profile').select('booking_settings').limit(1).single();
        if (mentorData?.booking_settings) {
          setBookingSettings(mentorData.booking_settings);
        }

        // Fetch all schedules from all clients to check for conflicts
        const { data: allClients } = await supabase.from('clients').select('schedule');
        
        if (allClients) {
          const occupied: string[] = [];
          allClients.forEach((c: any) => {
            if (Array.isArray(c.schedule)) {
              c.schedule.forEach((s: any) => {
                // If schedule time matches the selected date, mark the hour as occupied
                const sDate = new Date(s.time);
                const selectedDate = new Date(bookingData.date);
                
                if (sDate.getUTCFullYear() === selectedDate.getUTCFullYear() &&
                    sDate.getUTCMonth() === selectedDate.getUTCMonth() &&
                    sDate.getUTCDate() === selectedDate.getUTCDate()) {
                  const hour = sDate.getUTCHours().toString().padStart(2, '0');
                  occupied.push(`${hour}:00`);
                }
              });
            }
          });
          setOccupiedSlots(occupied);
        }
        setIsLoadingSlots(false);
      };
      fetchOccupied();

      // Subscribe to Mentor Profile changes (Realtime)
      const channel = supabase
        .channel('mentor_profile_realtime')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'mentor_profile' },
          (payload) => {
            if (payload.new.booking_settings) {
              setBookingSettings(payload.new.booking_settings);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeModal, bookingData.date]);

  const handleSend = async () => {
    setIsSending(true);
    // Get user info from session or props
    const sessionStr = typeof window !== 'undefined' ? localStorage.getItem("mh_session") : null;
    const session = sessionStr ? JSON.parse(sessionStr) : {};

    const senderName = clientInfo?.name || session.username || "Mentee";
    const senderAvatar = clientInfo?.avatar || session.avatar || `https://i.pravatar.cc/150?u=${senderName}`;
    const senderEmail = clientInfo?.email || session.email || "mentee@example.com";

    // Convert local selection to UTC for DB
    const [h, m] = bookingData.time.split(':');
    const bookingFullDate = new Date(bookingData.date);
    bookingFullDate.setHours(parseInt(h), parseInt(m), 0, 0);
    const utcTime = bookingFullDate.toISOString();

    const payload: {
      client_id: string | null;
      sender_name: string;
      sender_email: string;
      sender_avatar: string;
      status: string;
      is_starred: boolean;
      subject?: string;
      snippet?: string;
      content?: string;
      category?: string;
      label?: string;
      metadata?: Record<string, unknown>;
    } = {
      client_id: clientInfo?.id || session.clientId,
      sender_name: senderName,
      sender_email: senderEmail,
      sender_avatar: senderAvatar,
      status: "unread",
      is_starred: false,
    };

    if (activeModal === 'booking') {
      const localTimeStr = bookingFullDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const localDateStr = bookingFullDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      
      payload.subject = bookingData.subject || `Booking Consultation`;
      payload.snippet = `Jadwal: ${localDateStr} | ${localTimeStr}. Topik: ${bookingData.topic}`;
      payload.content = `Subjek: ${payload.subject}\nJadwal: ${localDateStr} pukul ${localTimeStr}\n\nDetail:\n${bookingData.topic}\n\nLampiran: ${bookingData.fileLink || 'Tidak ada'}`;
      payload.category = "Call Request";
      payload.label = "Work";
      payload.metadata = { ...bookingData, utcTime };
    } else if (activeModal === 'submission') {
      payload.subject = submissionData.subject || `Quick Submission`;
      payload.snippet = `Link: ${submissionData.link}. Catatan: ${submissionData.note}`;
      payload.content = `Subjek: ${payload.subject}\nLink Tugas: ${submissionData.link}\n\nCatatan:\n${submissionData.note}\n\nLampiran Tambahan: ${submissionData.fileLink || 'Tidak ada'}`;
      payload.category = "Submission";
      payload.label = "Primary";
      payload.metadata = submissionData;
    } else if (activeModal === 'journal') {
      payload.subject = journalData.subject || `Daily Journal`;
      payload.snippet = `Progress: ${journalData.update.substring(0, 50)}...`;
      payload.content = `Subjek: ${payload.subject}\nUpdate Progress:\n${journalData.update}\n\nHambatan:\n${journalData.blocker}\n\nLampiran: ${journalData.fileLink || 'Tidak ada'}`;
      payload.category = "Discussion";
      payload.label = "Social";
      payload.metadata = journalData;
    }

    const { error } = await supabase.from('mentee_requests').insert([payload]);

    if (error) {
      console.error("Error sending request:", error);
      alert("Gagal mengirim pesan. Silakan coba lagi.");
    } else {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setActiveModal(null);
        setBookingData({ subject: "", date: "", time: "", topic: "", fileLink: "" });
        setSubmissionData({ subject: "", link: "", note: "", fileLink: "" });
        setJournalData({ subject: "", update: "", blocker: "", fileLink: "" });
      }, 2000);
    }
    setIsSending(false);
  };

  return (
    <>
      {/* GLOBAL MODAL LAYER (Moved outside any transformed parent) */}
      <ModalBase 
        isOpen={activeModal === 'booking'} 
        onClose={() => setActiveModal(null)}
        title="Booking Consultation"
        footer={
           <Button onClick={handleSend} disabled={isSuccess || isSending} className="w-full h-16 rounded-2xl bg-[#4880FF] text-white font-bold group">
              {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : isSuccess ? <CheckCircle2 className="w-5 h-5 animate-bounce" /> : <><Send className="w-5 h-5 mr-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" /> Kirim Pengajuan</>}
           </Button>
        }
      >
          <div className="space-y-6">
            <InputField label="Subjek Konsultasi" placeholder="Misal: Review Strategi Konten" value={bookingData.subject} onChange={(val: string) => setBookingData({...bookingData, subject: val})} icon={<Zap className="w-5 h-5" />} />
            <div className="space-y-2">
              <InputField label="Pilih Tanggal" type="date" value={bookingData.date} onChange={(val: string) => setBookingData({...bookingData, date: val})} icon={<Calendar className="w-5 h-5" />}  />
            </div>

            {bookingData.date && (
               <div className="space-y-3">
                  <div className="flex items-center justify-between ml-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pilih Jam (Waktu Lokal Anda)</label>
                    {!bookingSettings.working_days.includes(new Date(bookingData.date).getDay()) && (
                      <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100 uppercase tracking-tight animate-pulse">Mentor Off Day</span>
                    )}
                  </div>
                  {isLoadingSlots ? (
                     <div className="flex items-center gap-2 p-4 animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
                        <span className="text-xs font-bold text-slate-300">Checking availability...</span>
                     </div>
                  ) : (
                     <div className="grid grid-cols-4 gap-2">
                        {TIME_SLOTS.map(slot => {
                           const isTaken = occupiedSlots.includes(slot) || !bookingSettings.working_days.includes(new Date(bookingData.date).getDay());
                           return (
                              <button
                                 key={slot}
                                 disabled={isTaken}
                                 onClick={() => setBookingData({ ...bookingData, time: slot })}
                                 className={cn(
                                    "p-3 rounded-xl text-xs font-black transition-all border-2",
                                    isTaken ? "bg-slate-50 border-slate-100 text-slate-200 cursor-not-allowed opacity-50" :
                                    bookingData.time === slot ? "bg-accent border-accent text-white shadow-lg shadow-accent/20" :
                                    "bg-white border-slate-50 text-slate-600 hover:border-accent/40"
                                 )}
                              >
                                 {slot}
                              </button>
                           );
                        })}
                     </div>
                  )}
               </div>
            )}

            <div className="space-y-2">
               <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Detail Pembahasan</label>
               <textarea className="w-full h-32 rounded-2xl bg-slate-50 border border-slate-100 p-6 font-bold text-sm focus:outline-none focus:ring-2 ring-[#4880FF]/20" placeholder="Ceritakan detail yang ingin dikonsultasikan..." value={bookingData.topic} onChange={(e) => setBookingData({...bookingData, topic: e.target.value})} />
            </div>
            <InputField label="Link Lampiran (Opsional)" placeholder="https://drive.google.com/..." value={bookingData.fileLink} onChange={(val: string) => setBookingData({...bookingData, fileLink: val})} icon={<LinkIcon className="w-5 h-5" />} />
          </div>
      </ModalBase>

      <ModalBase 
        isOpen={activeModal === 'submission'} 
        onClose={() => setActiveModal(null)}
        title="Quick Submission"
        footer={
           <Button onClick={handleSend} disabled={isSuccess || isSending} className="w-full h-16 rounded-2xl bg-emerald-500 text-white font-bold group">
              {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : isSuccess ? <CheckCircle2 className="w-5 h-5 animate-bounce" /> : <><PlusCircle className="w-5 h-5 mr-3" /> Kirim Tugas</>}
           </Button>
        }
      >
          <div className="space-y-6">
            <InputField label="Judul Tugas" placeholder="Misal: Tugas Week 2 - SEO" value={submissionData.subject} onChange={(val: string) => setSubmissionData({...submissionData, subject: val})} icon={<PlusCircle className="w-5 h-5" />} />
            <InputField label="Link Utama Hasil" placeholder="https://..." value={submissionData.link} onChange={(val: string) => setSubmissionData({...submissionData, link: val})} icon={<LinkIcon className="w-5 h-5" />} />
            <div className="space-y-2">
               <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Catatan Tugas</label>
               <textarea className="w-full h-32 rounded-2xl bg-slate-50 border border-slate-100 p-6 font-bold text-sm focus:outline-none focus:ring-2 ring-emerald-500/20" placeholder="Tambahkan catatan jika ada kendala..." value={submissionData.note} onChange={(e) => setSubmissionData({...submissionData, note: e.target.value})} />
            </div>
            <InputField label="Link Pendukung Lainnya" placeholder="https://..." value={submissionData.fileLink} onChange={(val: string) => setSubmissionData({...submissionData, fileLink: val})} icon={<FileText className="w-5 h-5" />} />
         </div>
      </ModalBase>

      <ModalBase 
        isOpen={activeModal === 'journal'} 
        onClose={() => setActiveModal(null)}
        title="Daily Journal"
        footer={
           <Button onClick={handleSend} disabled={isSuccess || isSending} className="w-full h-16 rounded-2xl bg-amber-500 text-white font-bold group">
              {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : isSuccess ? <CheckCircle2 className="w-5 h-5 animate-bounce" /> : <><Sparkles className="w-5 h-5 mr-3" /> Update Progress</>}
           </Button>
        }
      >
          <div className="space-y-6">
            <InputField label="Judul Update" placeholder="Misal: Progress Konten Hari Ini" value={journalData.subject} onChange={(val: string) => setJournalData({...journalData, subject: val})} icon={<Sparkles className="w-5 h-5" />} />
            <div className="space-y-2">
               <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Apa yang kamu lakukan hari ini?</label>
               <textarea className="w-full h-32 rounded-2xl bg-slate-50 border border-slate-100 p-6 font-bold text-sm focus:outline-none focus:ring-2 ring-amber-500/20" placeholder="Sudah post 5 konten, research keyword..." value={journalData.update} onChange={(e) => setJournalData({...journalData, update: e.target.value})} />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Hambatan / Blocker?</label>
               <textarea className="w-full h-24 rounded-2xl bg-slate-50 border border-slate-100 p-6 font-bold text-sm focus:outline-none focus:ring-2 ring-amber-500/20" placeholder="Tuliskan jika ada kendala..." value={journalData.blocker} onChange={(e) => setJournalData({...journalData, blocker: e.target.value})} />
            </div>
            <InputField label="Link Pendukung (Opsional)" placeholder="https://..." value={journalData.fileLink} onChange={(val: string) => setJournalData({...journalData, fileLink: val})} icon={<LinkIcon className="w-5 h-5" />} />
         </div>
      </ModalBase>

      <AnimatePresence>
         {isSuccess && (
            <div className="fixed inset-0 z-[210] flex items-center justify-center p-6 bg-slate-900/10 backdrop-blur-md">
               <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="bg-white rounded-[3rem] p-12 text-center shadow-2xl space-y-4">
                  <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-200">
                     <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-extrabold text-[#202224]">Terkirim!</h3>
                  <p className="text-sm text-slate-400 font-bold max-w-[200px] mx-auto">Update Anda sudah masuk ke Inbox Mentor.</p>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* FLOAT BAR CONTAINER */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[min(95vw,750px)]">
        {/* QUICK ACTION MENU OVERLAY (Internal to bar's context) */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={toggleMenu} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm -z-10 rounded-[2.5rem]" style={{ margin: '-100vh -100vw' }} />
              <motion.div initial={{ opacity: 0, y: 20, scale: 0.9, x: "-50%" }} animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }} exit={{ opacity: 0, y: 20, scale: 0.9, x: "-50%" }} className="absolute bottom-24 left-1/2 w-[280px] bg-white rounded-[2.2rem] shadow-2xl p-6 border border-slate-100 z-50 flex flex-col gap-3">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center mb-2 px-4">Mentee Quick Actions</h4>
                <ActionButton icon={<Video className="w-4 h-4" />} label="Booking Consultation" color="bg-indigo-50 text-indigo-600" description="Ajukan jadwal mentoring 1:1" onClick={() => { toggleMenu(); setActiveModal('booking'); }} />
                <ActionButton icon={<PlusCircle className="w-4 h-4" />} label="Quick Submission" color="bg-emerald-50 text-emerald-600" description="Setor tugas atau link konten" onClick={() => { toggleMenu(); setActiveModal('submission'); }} />
                <ActionButton icon={<MessageSquare className="w-4 h-4" />} label="Daily Journal" color="bg-amber-50 text-amber-600" description="Update progress harian Anda" onClick={() => { toggleMenu(); setActiveModal('journal'); }} />
                <div className="pt-4 mt-2 border-t border-slate-50 flex justify-center">
                   <button onClick={toggleMenu} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"><X size={18} /></button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="bg-white/70 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[1.8rem] p-3 px-8 flex items-center justify-between">
          <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" active={activeTab === "dashboard"} onClick={() => onTabChange?.("dashboard")} />
          
          {enabledFeatures.content_plan && (
            <NavItem icon={<Calendar className="w-5 h-5" />} label="Content Plan" active={activeTab === "calendar"} onClick={() => onTabChange?.("calendar")} />
          )}
          
          {/* FAB CENTER BUTTON */}
          <div className="relative -top-6">
            <motion.button 
              whileHover={{ scale: 1.15, y: -4 }} 
              whileTap={{ scale: 0.9 }} 
              onClick={toggleMenu} 
              className={cn(
                "w-16 h-16 rounded-[1.2rem] shadow-2xl flex items-center justify-center text-white ring-8 ring-white transition-all duration-500 z-50", 
                isMenuOpen ? "bg-[#4880FF] rotate-45 shadow-[#4880FF]/40" : "bg-gradient-to-br from-[#4880FF] to-[#3666CC] shadow-[#4880FF]/20"
              )}
            >
              <Zap className={cn("w-7 h-7 transition-all duration-500", isMenuOpen ? "fill-white" : "")} />
            </motion.button>
          </div>

          {enabledFeatures.timeline && (
            <NavItem icon={<Milestone className="w-5 h-5" />} label="Timeline" active={activeTab === "timeline"} onClick={() => onTabChange?.("timeline")} />
          )}

          {enabledFeatures.reports && (
            <NavItem icon={<CheckSquare className="w-5 h-5" />} label="Goals" active={activeTab === "reports"} onClick={() => onTabChange?.("reports")} />
          )}
        </div>
      </div>
    </>
  );
};

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
  onClick: () => void;
}

const ActionButton = ({ icon, label, description, color, onClick }: ActionButtonProps) => (
  <button onClick={onClick} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group text-left">
    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", color)}>{icon}</div>
    <div className="flex-1 min-w-0">
       <p className="text-[13px] font-extrabold text-[#202224] truncate">{label}</p>
       <p className="text-[10px] font-medium text-slate-400 truncate mt-0.5">{description}</p>
    </div>
    <ArrowUpRight className="w-4 h-4 text-slate-200 group-hover:text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
  </button>
);

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon, label, active = false, onClick }: NavItemProps) => (
  <button onClick={onClick} className={cn("flex flex-col items-center gap-1.5 p-2 px-3 rounded-2xl transition-all duration-300 relative group", active ? "text-accent" : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/30")}>
    {active && <motion.div layoutId="active-pill" className="absolute inset-0 bg-accent/5 rounded-2xl -z-10" />}
    <div className={cn("transition-all duration-500", active && "scale-110 -translate-y-1")}>{icon}</div>
    <span className={cn("text-[9px] uppercase tracking-widest font-bold transition-all duration-300", active ? "opacity-100" : "opacity-40")}>{label}</span>
  </button>
);

export default BottomNavigation;
