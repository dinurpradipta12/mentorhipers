'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { BookOpen, Eye, EyeOff, Plus, Save, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Curriculum = Record<string, unknown>;

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function dateTimeValue(value: unknown): string {
  if (typeof value !== 'string' || !value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return '';
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function jsonValue(value: unknown, fallback: unknown): string {
  try {
    return JSON.stringify(value ?? fallback, null, 2);
  } catch {
    return JSON.stringify(fallback, null, 2);
  }
}

function published(value: unknown): boolean {
  return value === true || ['true', 't', '1', 'yes'].includes(String(value ?? '').toLowerCase());
}

export function BootcampCurriculumManager({ workspaceId, curriculum }: { workspaceId: string; curriculum: Curriculum[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(() => String(curriculum[0]?.id ?? 'new'));
  const selected = useMemo(() => curriculum.find((item) => String(item.id) === selectedId) ?? null, [curriculum, selectedId]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentRich, setContentRich] = useState('');
  const [type, setType] = useState('material');
  const [moduleName, setModuleName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [quizJson, setQuizJson] = useState('{}');
  const [assetsJson, setAssetsJson] = useState('[]');
  const [isPublished, setIsPublished] = useState(true);
  const [pointsWeight, setPointsWeight] = useState('');
  const [gradingMode, setGradingMode] = useState('auto');
  const [assignmentGroupId, setAssignmentGroupId] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) {
      setTitle('');
      setDescription('');
      setContentRich('');
      setType('material');
      setModuleName('');
      setDueDate('');
      setVideoUrl('');
      setQuizJson('{}');
      setAssetsJson('[]');
      setIsPublished(true);
      setPointsWeight('');
      setGradingMode('auto');
      setAssignmentGroupId('');
      return;
    }
    setTitle(text(selected.title));
    setDescription(text(selected.description));
    setContentRich(text(selected.content_rich));
    setType(text(selected.type) || 'material');
    setModuleName(text(selected.module_name));
    setDueDate(dateTimeValue(selected.due_date));
    setVideoUrl(text(selected.video_url));
    setQuizJson(jsonValue(selected.quiz_data, {}));
    setAssetsJson(jsonValue(selected.assets_json, []));
    setIsPublished(published(selected.is_published));
    setPointsWeight(text(selected.points_weight));
    setGradingMode(text(selected.grading_mode) || 'auto');
    setAssignmentGroupId(text(selected.assignment_group_id));
    setError(null);
    setMessage(null);
  }, [selected]);

  function choose(id: string) {
    setSelectedId(id);
    setError(null);
    setMessage(null);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    let quizData: unknown;
    let assetsJsonValue: unknown;
    try {
      quizData = JSON.parse(quizJson);
      assetsJsonValue = JSON.parse(assetsJson);
    } catch {
      setError('Quiz data dan assets harus berupa JSON yang valid.');
      setSaving(false);
      return;
    }
    if (!Array.isArray(assetsJsonValue)) {
      setError('Assets harus berupa JSON array.');
      setSaving(false);
      return;
    }
    try {
      const endpoint = selected ? `/api/v2/curriculums/${encodeURIComponent(String(selected.id))}` : '/api/v2/curriculums';
      const response = await fetch(endpoint, {
        method: selected ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ workspaceId, title, description, contentRich, type, moduleName, dueDate: dueDate ? new Date(dueDate).toISOString() : '', videoUrl, quizData, assetsJson: assetsJsonValue, isPublished, pointsWeight, gradingMode, assignmentGroupId }),
      });
      const payload = await response.json() as { success?: boolean; error?: string; curriculum?: { id?: string } };
      if (!response.ok || !payload.success) throw new Error(payload.error || 'Curriculum tidak dapat disimpan.');
      if (!selected && payload.curriculum?.id) setSelectedId(payload.curriculum.id);
      setMessage(selected ? 'Perubahan curriculum tersimpan.' : 'Curriculum baru berhasil dibuat.');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Curriculum tidak dapat disimpan.');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!selected || deleting) return;
    if (!window.confirm('Hapus curriculum ini? Penghapusan ditolak jika sudah ada histori submission atau quiz.')) return;
    setDeleting(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/v2/curriculums/${encodeURIComponent(String(selected.id))}`, {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ workspaceId }),
      });
      const payload = await response.json() as { success?: boolean; error?: string };
      if (!response.ok || !payload.success) throw new Error(payload.error || 'Curriculum tidak dapat dihapus.');
      setSelectedId('new');
      setMessage('Curriculum dihapus karena belum memiliki histori siswa.');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Curriculum tidak dapat dihapus.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="rc-card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6"><div><p className="rc-eyebrow">LMS curriculum</p><h2 className="mt-1 font-extrabold text-slate-950">Materi, tugas, dan post-test</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Kelola konten batch dari server. Menyembunyikan materi mempertahankan histori tanpa menghapus data siswa.</p></div><button type="button" className="rc-button rc-button-secondary" onClick={() => choose('new')}><Plus size={17} aria-hidden="true" /> Curriculum baru</button></div>
      {error && <p role="alert" className="mx-5 mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 sm:mx-6">{error}</p>}
      {message && <p role="status" className="mx-5 mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 sm:mx-6">{message}</p>}
      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(240px,0.7fr)_minmax(0,1.3fr)] sm:p-6">
        <div className="space-y-2">{curriculum.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Belum ada curriculum.</p>}{curriculum.map((item) => { const id = String(item.id); const isItemPublished = published(item.is_published); return <button key={id} type="button" onClick={() => choose(id)} className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition ${selectedId === id ? 'border-teal-400 bg-teal-50' : 'border-slate-200 hover:border-teal-200'}`}><span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white text-teal-700"><BookOpen size={16} aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-slate-900">{text(item.title) || 'Tanpa judul'}</span><span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-slate-500">{isItemPublished ? <><Eye size={13} aria-hidden="true" /> Published</> : <><EyeOff size={13} aria-hidden="true" /> Draft</>}</span></span></button>; })}</div>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2"><label className="rc-field sm:col-span-2"><span>Judul</span><span className="rc-input-wrap"><input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={180} /></span></label><label className="rc-field"><span>Jenis</span><span className="rc-input-wrap"><select value={type} onChange={(event) => setType(event.target.value)}><option value="material">Materi</option><option value="assignment">Assignment</option><option value="challenge">Challenge</option><option value="group_assignment">Group assignment</option><option value="post_test">Post-test</option></select></span></label><label className="rc-field"><span>Mode penilaian</span><span className="rc-input-wrap"><select value={gradingMode} onChange={(event) => setGradingMode(event.target.value)}><option value="auto">Auto</option><option value="manual">Manual</option></select></span></label><label className="rc-field"><span>Nama modul</span><span className="rc-input-wrap"><input value={moduleName} onChange={(event) => setModuleName(event.target.value)} maxLength={180} /></span></label><label className="rc-field"><span>Deadline</span><span className="rc-input-wrap"><input type="datetime-local" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></span></label><label className="rc-field"><span>Bobot (0–100)</span><span className="rc-input-wrap"><input value={pointsWeight} onChange={(event) => setPointsWeight(event.target.value)} inputMode="decimal" placeholder="Opsional" /></span></label><label className="rc-field"><span>Assignment group ID (opsional)</span><span className="rc-input-wrap"><input value={assignmentGroupId} onChange={(event) => setAssignmentGroupId(event.target.value)} placeholder="UUID group" /></span></label><label className="rc-field sm:col-span-2"><span>Deskripsi</span><span className="rc-input-wrap"><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} maxLength={12000} /></span></label><label className="rc-field sm:col-span-2"><span>Konten lesson</span><span className="rc-input-wrap"><textarea value={contentRich} onChange={(event) => setContentRich(event.target.value)} rows={4} maxLength={50000} /></span></label><label className="rc-field sm:col-span-2"><span>URL video (HTTPS)</span><span className="rc-input-wrap"><input type="url" value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} maxLength={2000} placeholder="https://..." /></span></label><label className="rc-field sm:col-span-2"><span>Quiz data (JSON)</span><span className="rc-input-wrap"><textarea className="font-mono text-xs" value={quizJson} onChange={(event) => setQuizJson(event.target.value)} rows={7} spellCheck={false} /></span></label><label className="rc-field sm:col-span-2"><span>Assets (JSON array)</span><span className="rc-input-wrap"><textarea className="font-mono text-xs" value={assetsJson} onChange={(event) => setAssetsJson(event.target.value)} rows={5} spellCheck={false} /></span></label><label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700 sm:col-span-2"><input type="checkbox" className="h-4 w-4 accent-teal-700" checked={isPublished} onChange={(event) => setIsPublished(event.target.checked)} /> Tampilkan untuk siswa dalam batch</label><div className="flex flex-wrap gap-3 sm:col-span-2"><button type="submit" className="rc-button rc-button-primary" disabled={saving || deleting}>{saving ? 'Menyimpan…' : <><Save size={17} aria-hidden="true" /> Simpan curriculum</>}</button>{selected && <button type="button" className="rc-button rc-button-secondary" disabled={saving || deleting} onClick={remove}>{deleting ? 'Menghapus…' : <><Trash2 size={16} aria-hidden="true" /> Hapus jika aman</>}</button>}</div></form>
      </div>
    </section>
  );
}
