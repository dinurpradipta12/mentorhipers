'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Copy, FileQuestion, ListChecks, Plus, Save, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { EmptyState } from '@/components/app/EmptyState';
import { PageHeader } from '@/components/app/PageHeader';

type Question = {
  id: number | string;
  text: string;
  type: 'mc' | 'multiple_choice' | 'essay' | 'long_text' | 'other';
  options: string[];
  correct: number | null;
  required: boolean;
};

type Template = Record<string, unknown>;

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function questionsOf(value: unknown): Question[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return [];
    const question = item as Record<string, unknown>;
    const type = question.type === 'multiple_choice' || question.type === 'essay' || question.type === 'long_text' || question.type === 'other' ? question.type : 'mc';
    const options = Array.isArray(question.options) ? question.options.filter((option): option is string => typeof option === 'string') : [];
    const rawCorrect = typeof question.correct === 'number' ? question.correct : Number(question.correct);
    return [{
      id: typeof question.id === 'number' || typeof question.id === 'string' ? question.id : index + 1,
      text: text(question.text),
      type,
      options,
      correct: Number.isSafeInteger(rawCorrect) && rawCorrect >= 0 ? rawCorrect : null,
      required: question.required !== false,
    }];
  });
}

function emptyQuestion(index: number): Question {
  return { id: `${Date.now()}-${index}`, text: '', type: 'mc', options: ['', '', '', ''], correct: 0, required: true };
}

export function QuizTemplatesManager({ initialTemplates }: { initialTemplates: Template[] }) {
  const router = useRouter();
  const [templates, setTemplates] = useState(initialTemplates);
  const [selectedId, setSelectedId] = useState('new');
  const selected = useMemo(() => templates.find((template) => String(template.id) === selectedId) ?? null, [selectedId, templates]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion(0)]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) {
      setTitle('');
      setDescription('');
      setCategory('General');
      setQuestions([emptyQuestion(0)]);
      return;
    }
    setTitle(text(selected.title));
    setDescription(text(selected.description));
    setCategory(text(selected.category) || 'General');
    setQuestions(questionsOf(selected.questions_json));
    setError(null);
    setMessage(null);
  }, [selected]);

  function choose(id: string) {
    setSelectedId(id);
    setError(null);
    setMessage(null);
  }

  function updateQuestion(index: number, patch: Partial<Question>) {
    setQuestions((current) => current.map((question, questionIndex) => questionIndex === index ? { ...question, ...patch } : question));
  }

  function updateOption(questionIndex: number, optionIndex: number, value: string) {
    setQuestions((current) => current.map((question, index) => {
      if (index !== questionIndex) return question;
      const options = [...question.options];
      options[optionIndex] = value;
      return { ...question, options };
    }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const endpoint = selected ? `/api/v2/quiz-templates/${encodeURIComponent(String(selected.id))}` : '/api/v2/quiz-templates';
      const response = await fetch(endpoint, {
        method: selected ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ title, description, category, questionsJson: questions }),
      });
      const payload = await response.json() as { success?: boolean; error?: string; template?: Template };
      if (!response.ok || !payload.success || !payload.template) throw new Error(payload.error || 'Template quiz tidak dapat disimpan.');
      setTemplates((current) => selected ? current.map((item) => String(item.id) === String(payload.template?.id) ? payload.template as Template : item) : [payload.template as Template, ...current]);
      setSelectedId(String(payload.template.id));
      setMessage(selected ? 'Template quiz diperbarui.' : 'Template quiz dibuat.');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Template quiz tidak dapat disimpan.');
    } finally {
      setSaving(false);
    }
  }

  async function duplicate() {
    if (!selected || saving) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch('/api/v2/quiz-templates', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ title: `${text(selected.title) || 'Template'} (Salinan)`, description: text(selected.description), category: text(selected.category) || 'General', questionsJson: questionsOf(selected.questions_json) }),
      });
      const payload = await response.json() as { success?: boolean; error?: string; template?: Template };
      if (!response.ok || !payload.success || !payload.template) throw new Error(payload.error || 'Template quiz tidak dapat disalin.');
      setTemplates((current) => [payload.template as Template, ...current]);
      setSelectedId(String(payload.template.id));
      setMessage('Salinan template dibuat.');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Template quiz tidak dapat disalin.');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!selected || deleting) return;
    if (!window.confirm('Hapus template quiz ini? Curriculum yang sudah ada tidak ikut dihapus.')) return;
    setDeleting(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/v2/quiz-templates/${encodeURIComponent(String(selected.id))}`, { method: 'DELETE', credentials: 'same-origin' });
      const payload = await response.json() as { success?: boolean; error?: string };
      if (!response.ok || !payload.success) throw new Error(payload.error || 'Template quiz tidak dapat dihapus.');
      setTemplates((current) => current.filter((item) => String(item.id) !== selectedId));
      setSelectedId('new');
      setMessage('Template quiz dihapus.');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Template quiz tidak dapat dihapus.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="space-y-8">
      <PageHeader eyebrow="Bootcamp tools" title="Quiz Templates" description="Buat dan gunakan kembali template quiz melalui server yang tervalidasi. Kunci jawaban hanya terlihat pada area admin." action={<button type="button" className="rc-button rc-button-secondary" onClick={() => choose('new')}><Plus size={17} aria-hidden="true" /> Template baru</button>} />
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}
      {message && <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"><CheckCircle2 size={17} aria-hidden="true" />{message}</p>}
      <div className="grid gap-6 xl:grid-cols-[minmax(220px,0.7fr)_minmax(0,1.3fr)]">
        <div className="space-y-2">{templates.length === 0 && <EmptyState icon={<FileQuestion size={28} />} title="Belum ada template quiz" description="Buat template pertama untuk dipakai pada post-test Bootcamp." />}{templates.map((template) => { const id = String(template.id); const count = Array.isArray(template.questions_json) ? template.questions_json.length : 0; return <button key={id} type="button" onClick={() => choose(id)} className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition ${selectedId === id ? 'border-teal-400 bg-teal-50' : 'border-slate-200 bg-white hover:border-teal-200'}`}><span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700"><ListChecks size={16} aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-slate-900">{text(template.title) || 'Tanpa judul'}</span><span className="mt-1 block text-xs text-slate-500">{count} pertanyaan · {text(template.category) || 'General'}</span></span></button>; })}</div>
        <form onSubmit={save} className="rc-card space-y-5 p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-extrabold text-slate-950">{selected ? 'Edit template' : 'Template baru'}</h2><p className="mt-1 text-xs text-slate-500">Pilihan ganda membutuhkan kunci jawaban; essay tetap tersedia untuk review manual.</p></div>{selected && <div className="flex gap-2"><button type="button" className="rc-button rc-button-secondary" onClick={duplicate} disabled={saving || deleting}><Copy size={15} aria-hidden="true" /> Salin</button><button type="button" className="rc-button rc-button-secondary text-rose-700" onClick={remove} disabled={saving || deleting}><Trash2 size={15} aria-hidden="true" /> Hapus</button></div>}</div><div className="grid gap-4 sm:grid-cols-2"><label className="rc-field sm:col-span-2"><span>Judul template</span><input required value={title} onChange={(event) => setTitle(event.target.value)} maxLength={180} /></label><label className="rc-field"><span>Kategori</span><input value={category} onChange={(event) => setCategory(event.target.value)} maxLength={80} /></label><label className="rc-field sm:col-span-2"><span>Deskripsi</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={2} maxLength={12000} /></label></div><div className="space-y-3"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-extrabold text-slate-950">Pertanyaan ({questions.length})</h3><button type="button" className="rc-button rc-button-secondary" onClick={() => setQuestions((current) => [...current, emptyQuestion(current.length)])}><Plus size={15} aria-hidden="true" /> Tambah soal</button></div>{questions.map((question, index) => <fieldset key={String(question.id)} className="rounded-2xl border border-slate-200 p-4"><legend className="px-1 text-sm font-extrabold text-slate-900">Soal {index + 1}</legend><div className="mt-2 grid gap-3 sm:grid-cols-2"><label className="rc-field sm:col-span-2"><span>Pertanyaan</span><textarea required value={question.text} onChange={(event) => updateQuestion(index, { text: event.target.value })} rows={2} maxLength={10000} /></label><label className="rc-field"><span>Tipe</span><select value={question.type} onChange={(event) => { const nextType = event.target.value as Question['type']; updateQuestion(index, { type: nextType, options: nextType === 'mc' || nextType === 'multiple_choice' ? (question.options.length >= 2 ? question.options : ['', '']) : [], correct: nextType === 'mc' || nextType === 'multiple_choice' ? (question.correct ?? 0) : null }); }}>{['mc', 'essay', 'long_text', 'other'].map((kind) => <option key={kind} value={kind}>{kind === 'mc' ? 'Pilihan ganda' : kind}</option>)}</select></label><label className="rc-field"><span>Wajib dijawab</span><span className="flex h-11 items-center gap-2 rounded-xl border border-slate-300 px-3"><input type="checkbox" checked={question.required} onChange={(event) => updateQuestion(index, { required: event.target.checked })} /> Ya</span></label>{(question.type === 'mc' || question.type === 'multiple_choice') && <div className="sm:col-span-2"><p className="text-xs font-bold text-slate-600">Pilihan & kunci</p><div className="mt-2 space-y-2">{question.options.map((option, optionIndex) => <div key={`${String(question.id)}-${optionIndex}`} className="flex items-center gap-2"><input aria-label={`Pilihan ${index + 1}.${optionIndex + 1}`} required value={option} onChange={(event) => updateOption(index, optionIndex, event.target.value)} maxLength={500} /><label className="flex shrink-0 items-center gap-1 text-xs font-bold text-slate-600"><input type="radio" name={`correct-${String(question.id)}`} checked={question.correct === optionIndex} onChange={() => updateQuestion(index, { correct: optionIndex })} /> Kunci</label></div>)}</div></div>}<button type="button" className="justify-self-start text-xs font-bold text-rose-700 underline" onClick={() => setQuestions((current) => current.filter((_, questionIndex) => questionIndex !== index))} disabled={questions.length <= 1}>Hapus soal</button></div></fieldset>)}</div><button type="submit" className="rc-button rc-button-primary" disabled={saving || deleting}>{saving ? 'Menyimpan…' : <><Save size={16} aria-hidden="true" /> Simpan template</>}</button></form>
      </div>
    </section>
  );
}
