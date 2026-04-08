"use client";

import React, { useState, useEffect } from "react";
import {
  Plus, Trash2, Edit, Check, X, Sparkles, FileText, ChevronRight,
  BookOpen, Save, Eye, Tag, Search, AlertCircle, ArrowLeft, Copy
} from "lucide-react";
import { supabaseV2 as supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────
interface Question {
  id: number;
  text: string;
  type: 'mc' | 'essay' | 'long_text' | 'other';
  options: string[];
  correct: number;
  required: boolean;
}

interface QuizTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  questions_json: Question[];
  created_at: string;
  updated_at: string;
}

const EMPTY_QUESTION = (): Question => ({
  id: Date.now(),
  text: "",
  type: "mc",
  options: ["", "", "", ""],
  correct: 0,
  required: true,
});

const EMPTY_TEMPLATE = {
  title: "",
  description: "",
  category: "",
  questions_json: [] as Question[],
};

const CATEGORIES = ["Branding", "Content Strategy", "Social Media", "Analytics", "Campaign", "Copywriting", "General", "Lainnya"];

// ─── Component ────────────────────────────────────────────────
export default function QuizTemplatesContent() {
  const [templates, setTemplates] = useState<QuizTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // Modal state
  const [mode, setMode] = useState<"list" | "create" | "edit" | "preview">("list");
  const [form, setForm] = useState<typeof EMPTY_TEMPLATE>(EMPTY_TEMPLATE);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<QuizTemplate | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // ─── Data ────────────────────────────────────────────────────
  const fetchTemplates = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("v2_quiz_templates")
      .select("*")
      .order("updated_at", { ascending: false });
    if (!error && data) setTemplates(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, []);

  // ─── Handlers ────────────────────────────────────────────────
  const handleCreate = () => {
    setForm({ ...EMPTY_TEMPLATE, questions_json: [EMPTY_QUESTION()] });
    setEditingId(null);
    setMode("create");
  };

  const handleEdit = (t: QuizTemplate) => {
    setForm({
      title: t.title,
      description: t.description || "",
      category: t.category || "",
      questions_json: t.questions_json,
    });
    setEditingId(t.id);
    setMode("edit");
  };

  const handleSave = async () => {
    if (!form.title.trim()) { alert("Judul template wajib diisi!"); return; }
    if (form.questions_json.length === 0) { alert("Tambahkan minimal 1 soal!"); return; }
    for (const q of form.questions_json) {
      if (!q.text.trim()) { alert("Semua teks soal wajib diisi!"); return; }
      if (q.type === 'mc' && q.options.some(o => !o.trim())) { alert("Semua pilihan jawaban untuk Pilihan Ganda wajib diisi!"); return; }
    }

    setIsSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category || "General",
        questions_json: form.questions_json,
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { error } = await supabase.from("v2_quiz_templates").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("v2_quiz_templates").insert([payload]);
        if (error) throw error;
      }
      await fetchTemplates();
      setMode("list");
    } catch (err: any) {
      alert("Gagal simpan template: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("v2_quiz_templates").delete().eq("id", id);
    if (!error) {
      setTemplates(prev => prev.filter(t => t.id !== id));
      setDeleteConfirmId(null);
    }
  };

  const handleDuplicate = async (t: QuizTemplate) => {
    const payload = {
      title: `${t.title} (Copy)`,
      description: t.description,
      category: t.category,
      questions_json: t.questions_json,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("v2_quiz_templates").insert([payload]);
    if (!error) fetchTemplates();
  };

  // ─── Question helpers ─────────────────────────────────────────
  const addQuestion = () => {
    setForm(f => ({ ...f, questions_json: [...f.questions_json, EMPTY_QUESTION()] }));
  };

  const removeQuestion = (qi: number) => {
    setForm(f => ({ ...f, questions_json: f.questions_json.filter((_, i) => i !== qi) }));
  };

  const updateQuestion = (qi: number, patch: Partial<Question>) => {
    setForm(f => {
      const qs = [...f.questions_json];
      qs[qi] = { ...qs[qi], ...patch };
      return { ...f, questions_json: qs };
    });
  };

  const updateOption = (qi: number, oi: number, val: string) => {
    setForm(f => {
      const qs = [...f.questions_json];
      const opts = [...qs[qi].options];
      opts[oi] = val;
      qs[qi] = { ...qs[qi], options: opts };
      return { ...f, questions_json: qs };
    });
  };

  // ─── Computed ─────────────────────────────────────────────────
  const filtered = templates.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "All" || t.category === filterCategory;
    return matchSearch && matchCat;
  });

  const allCategories = ["All", ...Array.from(new Set(templates.map(t => t.category).filter(Boolean)))];

  // ─────────────────────────────────────────────────────────────
  // RENDER: Builder (Create/Edit)
  // ─────────────────────────────────────────────────────────────
  if (mode === "create" || mode === "edit") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pb-20">
        <div className="max-w-[900px] mx-auto p-6 md:p-10 space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <button onClick={() => setMode("list")} className="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
              <ArrowLeft size={18}/>
            </button>
            <div>
              <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
                {mode === "create" ? "Buat Template Baru" : "Edit Template"}
              </h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Quiz Template Builder</p>
            </div>
          </div>

          {/* Meta */}
          <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-[40px] space-y-6">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Informasi Template</h3>
            <div className="space-y-4">
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Nama template, e.g. Post Test Modul 1 – Branding Dasar"
                className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 px-6 font-bold text-sm focus:outline-none focus:ring-2 ring-blue-500/20 transition-all"
              />
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Deskripsi singkat template (opsional)..."
                rows={2}
                className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 font-medium text-sm focus:outline-none focus:ring-2 ring-blue-500/20 resize-none transition-all"
              />
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setForm(f => ({ ...f, category: cat }))}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${form.category === cat ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20" : "bg-slate-50 text-slate-400 border-slate-100 hover:border-blue-200"}`}
                    >{cat}</button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Questions */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div>
                <h3 className="text-lg font-black text-[#0F172A]">Bank Soal</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{form.questions_json.length} Total Soal</p>
              </div>
              <button
                onClick={addQuestion}
                className="h-11 px-6 rounded-2xl bg-blue-600 text-white text-xs font-black hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <Plus size={16}/> Tambah Soal
              </button>
            </div>

            {form.questions_json.map((q, qi) => (
              <Card key={q.id} className="p-8 border-none shadow-lg shadow-slate-200/40 bg-white rounded-[36px] space-y-6 relative">
                {/* Question Number Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black">{qi + 1}</div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Soal {qi + 1} dari {form.questions_json.length}</span>
                  </div>
                  <button onClick={() => removeQuestion(qi)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors rounded-xl hover:bg-rose-50">
                    <Trash2 size={16}/>
                  </button>
                </div>

                {/* Question Text */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pertanyaan {q.required && <span className="text-rose-500">*</span>}</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                      {[
                        { id: 'mc', label: 'Pilihan Ganda' },
                        { id: 'essay', label: 'Essay Singkat' },
                        { id: 'long_text', label: 'Teks Panjang' },
                        { id: 'other', label: 'Lainnya' }
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => updateQuestion(qi, { type: t.id as any })}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${q.type === t.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >{t.label}</button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={q.text}
                    onChange={e => updateQuestion(qi, { text: e.target.value })}
                    placeholder={`Contoh: Apa pendapatmu tentang strategi konten ini?`}
                    rows={2}
                    className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-sm focus:outline-none focus:ring-2 ring-blue-500/20 resize-none transition-all"
                  />
                  <div className="flex items-center gap-2 px-2">
                    <button 
                      onClick={() => updateQuestion(qi, { required: !q.required })}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${q.required ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'}`}
                    >
                      {q.required && <Check size={10} strokeWidth={4}/>}
                    </button>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Wajib Diisi</span>
                  </div>
                </div>

                {/* Options for MC */}
                {q.type === 'mc' && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilihan Jawaban (klik ✓ untuk pilih jawaban benar)</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="relative">
                          <input
                            value={opt}
                            onChange={e => updateOption(qi, oi, e.target.value)}
                            placeholder={`Pilihan ${String.fromCharCode(65 + oi)}`}
                            className={`w-full h-13 py-3.5 rounded-2xl border px-5 pr-14 font-bold text-sm focus:outline-none transition-all ${q.correct === oi ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-slate-100 bg-slate-50 focus:ring-2 ring-blue-500/20"}`}
                          />
                          <button
                            onClick={() => updateQuestion(qi, { correct: oi })}
                            title="Tandai sebagai jawaban benar"
                            className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${q.correct === oi ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "bg-slate-100 text-slate-300 hover:bg-emerald-100 hover:text-emerald-600"}`}
                          >
                            <Check size={14} strokeWidth={3}/>
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold ml-1 flex items-center gap-1.5">
                      <AlertCircle size={10}/> Jawaban benar: Pilihan {String.fromCharCode(65 + q.correct)} — {q.options[q.correct] || "(belum diisi)"}
                    </p>
                  </div>
                )}

                {/* Preview for Non-MC */}
                {q.type !== 'mc' && (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 border-dashed">
                    <div className="flex items-center gap-2 mb-3 text-slate-400">
                      <FileText size={14}/>
                      <span className="text-[10px] font-black uppercase tracking-widest">User Input Preview ({q.type === 'essay' ? 'Short Answer' : q.type === 'long_text' ? 'Long Text' : 'Other'})</span>
                    </div>
                    <div className={`w-full bg-white border border-slate-200 rounded-xl ${q.type === 'long_text' ? 'h-32' : 'h-12'}`} />
                  </div>
                )}
              </Card>
            ))}

            {form.questions_json.length === 0 && (
              <div className="text-center py-20 text-slate-300">
                <FileText size={48} className="mx-auto mb-4 opacity-40"/>
                <p className="font-bold text-sm">Belum ada soal. Klik "Tambah Soal" untuk mulai.</p>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex gap-4 pt-4">
            <button onClick={() => setMode("list")} className="h-14 px-8 rounded-2xl bg-slate-100 text-slate-600 font-black text-sm hover:bg-slate-200 transition-all">
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 h-14 rounded-2xl bg-[#0F172A] text-white font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 disabled:opacity-60"
            >
              <Save size={18}/>
              {isSaving ? "Menyimpan..." : "Simpan Template"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: Preview Modal
  // ─────────────────────────────────────────────────────────────
  if (mode === "preview" && previewTemplate) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pb-20">
        <div className="max-w-[800px] mx-auto p-6 md:p-10 space-y-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setMode("list")} className="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
              <ArrowLeft size={18}/>
            </button>
            <div className="flex-1">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Preview Template</p>
              <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">{previewTemplate.title}</h1>
            </div>
            <button onClick={() => handleEdit(previewTemplate)} className="h-10 px-5 rounded-2xl bg-blue-600 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-500/20">
              <Edit size={14}/> Edit
            </button>
          </div>

          <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-[40px] space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black border border-blue-100">{previewTemplate.category}</span>
              <span className="text-[10px] font-bold text-slate-400">{previewTemplate.questions_json.length} Soal</span>
            </div>
            {previewTemplate.description && <p className="text-sm font-medium text-slate-500">{previewTemplate.description}</p>}
          </Card>

          <div className="space-y-6">
            {previewTemplate.questions_json.map((q, qi) => (
              <Card key={qi} className="p-8 border-none shadow-lg shadow-slate-200/40 bg-white rounded-[36px] space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">{qi + 1}</div>
                  <div className="flex-1 space-y-2">
                    <p className="font-black text-[#0F172A] text-sm leading-relaxed">{q.text} {q.required && <span className="text-rose-500">*</span>}</p>
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest">{q.type === 'mc' ? 'Pilihan Ganda' : q.type === 'essay' ? 'Essay Singkat' : q.type === 'long_text' ? 'Teks Panjang' : 'Lainnya'}</span>
                  </div>
                </div>

                {q.type === 'mc' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-12">
                    {q.options.map((opt, oi) => (
                      <div
                        key={oi}
                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${q.correct === oi ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-100"}`}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${q.correct === oi ? "bg-emerald-500 text-white" : "bg-white border border-slate-200 text-slate-400"}`}>
                          {q.correct === oi ? <Check size={12} strokeWidth={3}/> : String.fromCharCode(65 + oi)}
                        </div>
                        <span className={`text-sm font-bold ${q.correct === oi ? "text-emerald-700" : "text-slate-600"}`}>{opt}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="pl-12">
                     <div className={`w-full bg-slate-50 border border-slate-200 rounded-2xl border-dashed flex items-center justify-center p-8 text-slate-300 text-[10px] font-black uppercase tracking-widest ${q.type === 'long_text' ? 'h-32' : 'h-14'}`}>
                        {q.type} Input Area
                     </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: List View
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="max-w-[1400px] mx-auto p-6 md:p-10 lg:p-14 space-y-10">

        {/* Page Header */}
        <div className="relative bg-gradient-to-r from-[#0F172A] to-[#1e3a8a] rounded-[44px] p-10 xl:p-12 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"/>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Link href="/ruang-sosmed/batch" className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all">
                  <ArrowLeft size={12}/> Admin Panel
                </Link>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">Quiz Template Library</h1>
                <p className="text-sky-200 font-bold text-sm mt-2 opacity-80">Kelola bank soal post test — pakai ulang kapanpun tanpa input manual.</p>
              </div>
              <div className="flex items-center gap-6 text-sky-200 font-bold text-xs">
                <span className="flex items-center gap-2"><FileText size={14} className="text-sky-300"/> {templates.length} Templates</span>
                <span className="flex items-center gap-2"><BookOpen size={14} className="text-sky-300"/> {templates.reduce((a, t) => a + t.questions_json.length, 0)} Total Soal</span>
              </div>
            </div>
            <button
              onClick={handleCreate}
              className="h-14 px-8 rounded-2xl bg-white text-[#0F172A] font-black text-sm flex items-center gap-3 hover:scale-105 transition-all shadow-xl shrink-0"
            >
              <Plus size={20}/> Buat Template Baru
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-5 py-3 shadow-sm flex-1">
            <Search size={16} className="text-slate-400 shrink-0"/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari template..."
              className="bg-transparent border-none focus:outline-none text-sm font-bold w-full"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all border ${filterCategory === cat ? "bg-[#0F172A] text-white border-[#0F172A] shadow-lg" : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"}`}
              >{cat}</button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"/>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Templates...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 space-y-4">
            <Sparkles size={56} className="mx-auto text-slate-200"/>
            <p className="font-black text-slate-300 text-xl">
              {search || filterCategory !== "All" ? "Tidak ada template yang cocok." : "Belum ada template."}
            </p>
            {!search && filterCategory === "All" && (
              <button onClick={handleCreate} className="h-12 px-8 rounded-2xl bg-blue-600 text-white font-black text-sm shadow-xl shadow-blue-500/20 mx-auto flex items-center gap-2">
                <Plus size={16}/> Buat Template Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map(t => (
              <Card key={t.id} className="p-8 border-none shadow-lg shadow-slate-200/40 bg-white rounded-[40px] space-y-6 hover:shadow-xl hover:-translate-y-1 transition-all group relative">
                {/* Delete Confirm Overlay */}
                {deleteConfirmId === t.id && (
                  <div className="absolute inset-0 bg-white/95 rounded-[40px] z-10 flex flex-col items-center justify-center gap-4 p-8 backdrop-blur-sm">
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                      <Trash2 size={24}/>
                    </div>
                    <div className="text-center">
                      <p className="font-black text-slate-900">Hapus Template?</p>
                      <p className="text-xs text-slate-400 font-bold mt-1">Aksi ini tidak bisa dibatalkan</p>
                    </div>
                    <div className="flex gap-3 w-full">
                      <button onClick={() => setDeleteConfirmId(null)} className="flex-1 h-11 rounded-2xl bg-slate-100 text-slate-600 font-black text-xs">Batal</button>
                      <button onClick={() => handleDelete(t.id)} className="flex-1 h-11 rounded-2xl bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-500/20">Hapus</button>
                    </div>
                  </div>
                )}

                {/* Category + Actions */}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black border border-blue-100 flex items-center gap-1.5">
                    <Tag size={10}/> {t.category || "General"}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => handleDuplicate(t)} title="Duplikat" className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all">
                      <Copy size={14}/>
                    </button>
                    <button onClick={() => { setPreviewTemplate(t); setMode("preview"); }} title="Preview" className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center transition-all">
                      <Eye size={14}/>
                    </button>
                    <button onClick={() => handleEdit(t)} title="Edit" className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-all">
                      <Edit size={14}/>
                    </button>
                    <button onClick={() => setDeleteConfirmId(t.id)} title="Hapus" className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-[#0F172A] leading-tight tracking-tight">{t.title}</h3>
                  {t.description && <p className="text-xs font-medium text-slate-400 line-clamp-2">{t.description}</p>}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 pt-2 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                      <FileText size={14}/>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Soal</p>
                      <p className="text-sm font-black text-[#0F172A]">{t.questions_json.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Check size={14}/>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Maks. Nilai</p>
                      <p className="text-sm font-black text-[#0F172A]">100</p>
                    </div>
                  </div>
                  <div className="ml-auto text-[9px] text-slate-300 font-bold">
                    {new Date(t.updated_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "2-digit" })}
                  </div>
                </div>

                {/* Preview Soal (first 2) */}
                <div className="space-y-2">
                  {t.questions_json.slice(0, 2).map((q, qi) => (
                    <div key={qi} className="flex items-start gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md shrink-0">{qi + 1}</span>
                      <p className="text-[11px] font-bold text-slate-600 line-clamp-1">{q.text}</p>
                    </div>
                  ))}
                  {t.questions_json.length > 2 && (
                    <p className="text-[10px] font-bold text-slate-400 text-center pt-1">+{t.questions_json.length - 2} soal lainnya...</p>
                  )}
                </div>

                {/* Action CTA */}
                <button
                  onClick={() => { setPreviewTemplate(t); setMode("preview"); }}
                  className="w-full h-11 rounded-2xl bg-slate-50 border border-slate-100 text-slate-500 font-black text-xs hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all flex items-center justify-center gap-2 group/cta"
                >
                  <Eye size={14}/> Preview Template
                  <ChevronRight size={14} className="group-hover/cta:translate-x-1 transition-transform"/>
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
