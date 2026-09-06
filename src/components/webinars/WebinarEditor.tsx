'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Archive, ArrowLeft, ArrowDown, ArrowUp, Clipboard, ExternalLink, FileUp, LoaderCircle, Plus, Save, Trash2, Video } from 'lucide-react';
import { StatusBadge } from '@/components/app/StatusBadge';
import type { ResourceType, VideoProvider, WebinarEditorData, WebinarLesson, WebinarResource, WebinarSection, WebinarStatus } from '@/lib/webinars/types';

type SectionDraft = { id?: string; title: string; description: string; sortOrder: number };
type LessonDraft = { id?: string; sectionId: string; title: string; lessonSlug: string; description: string; videoProvider: VideoProvider; videoUrl: string; storagePath: string; thumbnailUrl: string; durationSeconds: string; contentRich: string; sortOrder: number; isPublished: boolean };
type ResourceDraft = { id?: string; lessonId: string; title: string; resourceType: ResourceType; publicUrl: string; storagePath: string; sortOrder: number };

const blankSection = (sortOrder = 0): SectionDraft => ({ title: '', description: '', sortOrder });
const blankLesson = (sectionId = '', sortOrder = 0): LessonDraft => ({ sectionId, title: '', lessonSlug: '', description: '', videoProvider: 'youtube', videoUrl: '', storagePath: '', thumbnailUrl: '', durationSeconds: '', contentRich: '', sortOrder, isPublished: false });
const blankResource = (lessonId = '', sortOrder = 0): ResourceDraft => ({ lessonId, title: '', resourceType: 'link', publicUrl: '', storagePath: '', sortOrder });

function errorMessage(payload: unknown) {
  return payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string' ? payload.error : 'Permintaan tidak dapat diproses.';
}

export function WebinarEditor({ initial }: { initial: WebinarEditorData }) {
  const [webinar, setWebinar] = useState(initial);
  const [sectionDraft, setSectionDraft] = useState<SectionDraft>(blankSection(initial.sections.length));
  const [lessonDraft, setLessonDraft] = useState<LessonDraft>(blankLesson(initial.sections[0]?.id ?? '', initial.lessons.length));
  const [resourceDraft, setResourceDraft] = useState<ResourceDraft>(blankResource(initial.lessons[0]?.id ?? '', initial.resources.length));
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lessonsBySection = useMemo(() => new Map(webinar.sections.map((section) => [section.id, webinar.lessons.filter((lesson) => lesson.sectionId === section.id)])), [webinar]);

  async function api(path: string, options: RequestInit) {
    setError(null);
    const response = await fetch(path, options);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(errorMessage(payload));
    return payload as Record<string, unknown>;
  }

  async function saveDetails(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending('details');
    try {
      const payload = await api(`/api/admin/webinars/${webinar.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title: webinar.title, description: webinar.description, instructorName: webinar.instructorName, category: webinar.category, coverUrl: webinar.coverUrl, coverStoragePath: webinar.coverStoragePath }) });
      setWebinar(payload.webinar as WebinarEditorData);
      setMessage('Detail webinar tersimpan.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Detail webinar tidak tersimpan.');
    } finally { setPending(null); }
  }

  async function changeStatus(status: WebinarStatus) {
    setPending(`status-${status}`);
    try {
      const payload = await api(`/api/admin/webinars/${webinar.id}/status`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status }) });
      setWebinar(payload.webinar as WebinarEditorData);
      setMessage(status === 'published' ? 'Webinar telah diterbitkan.' : status === 'draft' ? 'Webinar kembali menjadi draft.' : 'Webinar diarsipkan.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Status webinar tidak dapat diubah.'); } finally { setPending(null); }
  }

  async function upload(kind: 'cover' | 'thumbnail' | 'video' | 'resource', file: File) {
    setPending(`upload-${kind}`);
    try {
      const form = new FormData(); form.set('kind', kind); form.set('file', file);
      const payload = await api(`/api/admin/webinars/${webinar.id}/upload`, { method: 'POST', body: form });
      return (payload.upload as { storagePath: string }).storagePath;
    } finally { setPending(null); }
  }

  async function onCoverFile(file: File | null) {
    if (!file) return;
    try { const storagePath = await upload('cover', file); setWebinar((current) => ({ ...current, coverStoragePath: storagePath, coverUrl: null })); setMessage('Cover berhasil diunggah. Klik Simpan detail untuk menggunakannya.'); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Cover tidak dapat diunggah.'); }
  }

  async function saveSection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending('section');
    try {
      const action = sectionDraft.id ? 'update' : 'create';
      const payload = await api(`/api/admin/webinars/${webinar.id}/content`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ entity: 'section', action, id: sectionDraft.id, input: sectionDraft }) });
      const item = payload.item as WebinarSection;
      setWebinar((current) => ({ ...current, sections: action === 'create' ? [...current.sections, item] : current.sections.map((section) => section.id === item.id ? item : section) }));
      setSectionDraft(blankSection(webinar.sections.length + (action === 'create' ? 1 : 0))); setMessage(action === 'create' ? 'Section dibuat.' : 'Section diperbarui.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Section tidak tersimpan.'); } finally { setPending(null); }
  }

  async function deleteSection(id: string) {
    if (!window.confirm('Hapus section beserta lesson dan resource di dalamnya?')) return;
    setPending(`section-${id}`);
    try { await api(`/api/admin/webinars/${webinar.id}/content`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ entity: 'section', action: 'delete', id }) }); setWebinar((current) => { const lessons = current.lessons.filter((lesson) => lesson.sectionId !== id); return { ...current, sections: current.sections.filter((section) => section.id !== id), lessons, resources: current.resources.filter((resource) => lessons.some((lesson) => lesson.id === resource.lessonId)) }; }); setMessage('Section dihapus.'); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Section tidak dapat dihapus.'); } finally { setPending(null); }
  }

  async function reorder(entity: 'section' | 'lesson' | 'resource', ids: string[], index: number, movement: -1 | 1) {
    const target = index + movement; if (target < 0 || target >= ids.length) return;
    const reordered = [...ids]; [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setPending(`${entity}-order`);
    try { await api(`/api/admin/webinars/${webinar.id}/content`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ entity, action: 'reorder', ids: reordered }) }); if (entity === 'section') setWebinar((current) => ({ ...current, sections: reordered.map((id, sortOrder) => ({ ...current.sections.find((section) => section.id === id)!, sortOrder })) })); else if (entity === 'lesson') setWebinar((current) => ({ ...current, lessons: reordered.map((id, sortOrder) => ({ ...current.lessons.find((lesson) => lesson.id === id)!, sortOrder })) })); else setWebinar((current) => ({ ...current, resources: reordered.map((id, sortOrder) => ({ ...current.resources.find((resource) => resource.id === id)!, sortOrder })) })); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Urutan tidak tersimpan.'); } finally { setPending(null); }
  }

  async function onLessonFile(file: File | null) {
    if (!file) return;
    try { const storagePath = await upload('video', file); setLessonDraft((current) => ({ ...current, videoProvider: 'storage', storagePath, videoUrl: '' })); setMessage('Video diunggah dan siap dipakai pada lesson.'); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Video tidak dapat diunggah.'); }
  }

  async function saveLesson(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending('lesson');
    try {
      const action = lessonDraft.id ? 'update' : 'create';
      const payload = await api(`/api/admin/webinars/${webinar.id}/content`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ entity: 'lesson', action, id: lessonDraft.id, input: { ...lessonDraft, durationSeconds: lessonDraft.durationSeconds || null } }) });
      const item = payload.item as WebinarLesson;
      setWebinar((current) => ({ ...current, lessons: action === 'create' ? [...current.lessons, item] : current.lessons.map((lesson) => lesson.id === item.id ? item : lesson) }));
      setLessonDraft(blankLesson(webinar.sections[0]?.id ?? '', webinar.lessons.length + (action === 'create' ? 1 : 0))); setMessage(action === 'create' ? 'Lesson dibuat.' : 'Lesson diperbarui.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Lesson tidak tersimpan.'); } finally { setPending(null); }
  }

  async function deleteLesson(id: string) {
    if (!window.confirm('Hapus lesson dan resource terkait?')) return;
    setPending(`lesson-${id}`);
    try { await api(`/api/admin/webinars/${webinar.id}/content`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ entity: 'lesson', action: 'delete', id }) }); setWebinar((current) => ({ ...current, lessons: current.lessons.filter((lesson) => lesson.id !== id), resources: current.resources.filter((resource) => resource.lessonId !== id) })); setMessage('Lesson dihapus.'); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Lesson tidak dapat dihapus.'); } finally { setPending(null); }
  }

  async function onResourceFile(file: File | null) {
    if (!file) return;
    try { const storagePath = await upload('resource', file); setResourceDraft((current) => ({ ...current, storagePath, publicUrl: '' })); setMessage('Resource diunggah dan siap disimpan.'); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Resource tidak dapat diunggah.'); }
  }

  async function saveResource(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending('resource');
    try { const action = resourceDraft.id ? 'update' : 'create'; const payload = await api(`/api/admin/webinars/${webinar.id}/content`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ entity: 'resource', action, id: resourceDraft.id, input: resourceDraft }) }); const item = payload.item as WebinarResource; setWebinar((current) => ({ ...current, resources: action === 'create' ? [...current.resources, item] : current.resources.map((resource) => resource.id === item.id ? item : resource) })); setResourceDraft(blankResource(webinar.lessons[0]?.id ?? '', webinar.resources.length + (action === 'create' ? 1 : 0))); setMessage(action === 'create' ? 'Resource dibuat.' : 'Resource diperbarui.'); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Resource tidak tersimpan.'); } finally { setPending(null); }
  }

  async function deleteResource(id: string) {
    if (!window.confirm('Hapus resource ini?')) return;
    setPending(`resource-${id}`);
    try { await api(`/api/admin/webinars/${webinar.id}/content`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ entity: 'resource', action: 'delete', id }) }); setWebinar((current) => ({ ...current, resources: current.resources.filter((resource) => resource.id !== id) })); setMessage('Resource dihapus.'); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Resource tidak dapat dihapus.'); } finally { setPending(null); }
  }

  return <section className="space-y-7"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><Link href="/admin/webinars" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-950"><ArrowLeft size={17} aria-hidden="true" /> Semua webinar</Link><div className="mt-3 flex flex-wrap items-center gap-3"><h1 className="text-3xl font-extrabold tracking-tight text-slate-950">{webinar.title}</h1><StatusBadge status={webinar.status} /></div><p className="mt-2 text-sm text-slate-500">Kode publik stabil: <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">/w/{webinar.publicCode}</code></p></div><div className="flex flex-wrap gap-2"><Link href={`/admin/webinars/${webinar.id}/preview`} className="rc-button border border-slate-200 bg-white text-slate-700"><ExternalLink size={16} aria-hidden="true" /> Preview</Link><button type="button" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/w/${webinar.publicCode}`).then(() => setMessage('Link publik tersalin.'))} className="rc-button border border-slate-200 bg-white text-slate-700"><Clipboard size={16} aria-hidden="true" /> Copy link</button>{webinar.status !== 'published' ? <button type="button" onClick={() => changeStatus('published')} disabled={pending !== null} className="rc-button rc-button-primary">{pending === 'status-published' && <LoaderCircle className="animate-spin" size={16} />} Publish</button> : <button type="button" onClick={() => changeStatus('draft')} disabled={pending !== null} className="rc-button border border-slate-200 bg-white text-slate-700">Unpublish</button>}<button type="button" onClick={() => changeStatus('archived')} disabled={pending !== null} aria-label="Arsipkan webinar" className="rc-button border border-slate-200 bg-white text-rose-700"><Archive size={16} aria-hidden="true" /></button></div></div>
    {(error || message) && <p role={error ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm font-medium ${error ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{error || message}</p>}
    <form onSubmit={saveDetails} className="rc-card p-5 sm:p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-extrabold text-slate-950">Detail webinar</h2><button type="submit" disabled={pending !== null} className="rc-button rc-button-primary">{pending === 'details' ? <LoaderCircle className="animate-spin" size={16} /> : <Save size={16} />} Simpan</button></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Judul"><input value={webinar.title} onChange={(event) => setWebinar((current) => ({ ...current, title: event.target.value }))} required maxLength={180} /></Field><Field label="Instruktur"><input value={webinar.instructorName ?? ''} onChange={(event) => setWebinar((current) => ({ ...current, instructorName: event.target.value || null }))} maxLength={180} /></Field><Field label="Kategori"><input value={webinar.category ?? ''} onChange={(event) => setWebinar((current) => ({ ...current, category: event.target.value || null }))} maxLength={80} /></Field><Field label="Cover URL"><input type="url" value={webinar.coverUrl ?? ''} onChange={(event) => setWebinar((current) => ({ ...current, coverUrl: event.target.value || null, coverStoragePath: event.target.value ? null : current.coverStoragePath }))} placeholder="https://…" /></Field><label className="rc-field sm:col-span-2"><span>Upload cover</span><span className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500"><FileUp size={17} aria-hidden="true" /><input aria-label="Upload cover webinar" type="file" accept="image/jpeg,image/png,image/webp" disabled={pending !== null} onChange={(event) => onCoverFile(event.target.files?.[0] ?? null)} />{pending === 'upload-cover' && <LoaderCircle className="animate-spin" size={16} />}</span>{webinar.coverStoragePath && <small className="text-emerald-700">File cover siap disimpan.</small>}</label><label className="rc-field sm:col-span-2"><span>Deskripsi</span><span className="rc-input-wrap"><textarea value={webinar.description} onChange={(event) => setWebinar((current) => ({ ...current, description: event.target.value }))} rows={4} maxLength={12000} /></span></label></div></form>
    <div className="grid gap-7 xl:grid-cols-2"><EditorCard title={sectionDraft.id ? 'Edit section' : 'Tambah section'}><form onSubmit={saveSection} className="space-y-3"><Field label="Judul section"><input value={sectionDraft.title} onChange={(event) => setSectionDraft((current) => ({ ...current, title: event.target.value }))} required /></Field><Field label="Deskripsi"><input value={sectionDraft.description} onChange={(event) => setSectionDraft((current) => ({ ...current, description: event.target.value }))} /></Field><button disabled={pending !== null} className="rc-button rc-button-primary">{sectionDraft.id ? 'Perbarui section' : <><Plus size={16} /> Tambah section</>}</button>{sectionDraft.id && <button type="button" onClick={() => setSectionDraft(blankSection(webinar.sections.length))} className="ml-2 text-sm font-bold text-slate-600">Batal</button>}</form><OrderedList items={webinar.sections} pending={pending} onEdit={(item) => setSectionDraft({ id: item.id, title: item.title, description: item.description ?? '', sortOrder: item.sortOrder })} onDelete={deleteSection} onMove={(index, movement) => reorder('section', webinar.sections.map((section) => section.id), index, movement)} /></EditorCard>
      <EditorCard title={lessonDraft.id ? 'Edit lesson' : 'Tambah lesson'}>{webinar.sections.length === 0 ? <p className="text-sm text-slate-500">Buat section terlebih dahulu.</p> : <form onSubmit={saveLesson} className="space-y-3"><SelectField label="Section"><select value={lessonDraft.sectionId} onChange={(event) => setLessonDraft((current) => ({ ...current, sectionId: event.target.value }))}>{webinar.sections.map((section) => <option key={section.id} value={section.id}>{section.title}</option>)}</select></SelectField><Field label="Judul lesson"><input value={lessonDraft.title} onChange={(event) => setLessonDraft((current) => ({ ...current, title: event.target.value }))} required /></Field><div className="grid gap-3 sm:grid-cols-2"><SelectField label="Provider"><select value={lessonDraft.videoProvider} onChange={(event) => setLessonDraft((current) => ({ ...current, videoProvider: event.target.value as VideoProvider, videoUrl: '', storagePath: '' }))}><option value="youtube">YouTube</option><option value="vimeo">Vimeo</option><option value="direct">Direct video URL</option><option value="storage">Upload video</option></select></SelectField><Field label="Durasi (detik)"><input type="number" min="0" value={lessonDraft.durationSeconds} onChange={(event) => setLessonDraft((current) => ({ ...current, durationSeconds: event.target.value }))} /></Field></div>{lessonDraft.videoProvider === 'storage' ? <label className="rc-field"><span>Upload MP4</span><span className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500"><FileUp size={17} /><input type="file" accept="video/mp4" onChange={(event) => onLessonFile(event.target.files?.[0] ?? null)} />{lessonDraft.storagePath && <small className="text-emerald-700">Video siap.</small>}</span></label> : <Field label="Video URL"><input type="url" value={lessonDraft.videoUrl} onChange={(event) => setLessonDraft((current) => ({ ...current, videoUrl: event.target.value }))} required /></Field>}<Field label="Thumbnail URL (opsional)"><input type="url" value={lessonDraft.thumbnailUrl} onChange={(event) => setLessonDraft((current) => ({ ...current, thumbnailUrl: event.target.value }))} /></Field><Field label="Deskripsi"><input value={lessonDraft.description} onChange={(event) => setLessonDraft((current) => ({ ...current, description: event.target.value }))} /></Field><label className="rc-field"><span>Catatan lesson</span><span className="rc-input-wrap"><textarea value={lessonDraft.contentRich} rows={3} onChange={(event) => setLessonDraft((current) => ({ ...current, contentRich: event.target.value }))} /></span></label><label className="flex items-center gap-2 text-sm font-bold text-slate-700"><input type="checkbox" checked={lessonDraft.isPublished} onChange={(event) => setLessonDraft((current) => ({ ...current, isPublished: event.target.checked }))} /> Publikasikan lesson</label><button disabled={pending !== null} className="rc-button rc-button-primary">{lessonDraft.id ? 'Perbarui lesson' : <><Plus size={16} /> Tambah lesson</>}</button>{lessonDraft.id && <button type="button" onClick={() => setLessonDraft(blankLesson(webinar.sections[0]?.id ?? '', webinar.lessons.length))} className="ml-2 text-sm font-bold text-slate-600">Batal</button>}</form>}<div className="mt-6 space-y-3">{webinar.sections.map((section) => <div key={section.id}><p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-slate-400">{section.title}</p><OrderedList items={lessonsBySection.get(section.id) ?? []} pending={pending} onEdit={(item) => setLessonDraft({ id: item.id, sectionId: item.sectionId, title: item.title, lessonSlug: item.lessonSlug, description: item.description ?? '', videoProvider: item.videoProvider, videoUrl: item.videoUrl ?? '', storagePath: item.storagePath ?? '', thumbnailUrl: item.thumbnailUrl ?? '', durationSeconds: item.durationSeconds?.toString() ?? '', contentRich: item.contentRich ?? '', sortOrder: item.sortOrder, isPublished: item.isPublished })} onDelete={deleteLesson} onMove={(index, movement) => reorder('lesson', (lessonsBySection.get(section.id) ?? []).map((lesson) => lesson.id), index, movement)} /></div>)}</div></EditorCard></div>
    <EditorCard title={resourceDraft.id ? 'Edit resource' : 'Tambah resource'}>{webinar.lessons.length === 0 ? <p className="text-sm text-slate-500">Buat lesson terlebih dahulu.</p> : <form onSubmit={saveResource} className="grid gap-3 sm:grid-cols-2"><SelectField label="Lesson"><select value={resourceDraft.lessonId} onChange={(event) => setResourceDraft((current) => ({ ...current, lessonId: event.target.value }))}>{webinar.lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}</select></SelectField><Field label="Judul resource"><input value={resourceDraft.title} onChange={(event) => setResourceDraft((current) => ({ ...current, title: event.target.value }))} required /></Field><SelectField label="Tipe"><select value={resourceDraft.resourceType} onChange={(event) => setResourceDraft((current) => ({ ...current, resourceType: event.target.value as ResourceType }))}><option value="link">Link</option><option value="file">File</option><option value="worksheet">Worksheet</option><option value="slide">Slide</option><option value="download">Download</option></select></SelectField><Field label="Public URL"><input type="url" value={resourceDraft.publicUrl} onChange={(event) => setResourceDraft((current) => ({ ...current, publicUrl: event.target.value, storagePath: event.target.value ? '' : current.storagePath }))} placeholder="https://…" /></Field><label className="rc-field sm:col-span-2"><span>Upload resource</span><span className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500"><FileUp size={17} /><input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => onResourceFile(event.target.files?.[0] ?? null)} />{resourceDraft.storagePath && <small className="text-emerald-700">File siap.</small>}</span></label><div className="sm:col-span-2"><button disabled={pending !== null} className="rc-button rc-button-primary">{resourceDraft.id ? 'Perbarui resource' : <><Plus size={16} /> Tambah resource</>}</button>{resourceDraft.id && <button type="button" onClick={() => setResourceDraft(blankResource(webinar.lessons[0]?.id ?? '', webinar.resources.length))} className="ml-2 text-sm font-bold text-slate-600">Batal</button>}</div></form>}<div className="mt-6"><OrderedList items={webinar.resources} pending={pending} onEdit={(item) => setResourceDraft({ id: item.id, lessonId: item.lessonId, title: item.title, resourceType: item.resourceType, publicUrl: item.publicUrl ?? '', storagePath: item.storagePath ?? '', sortOrder: item.sortOrder })} onDelete={deleteResource} onMove={(index, movement) => reorder('resource', webinar.resources.map((resource) => resource.id), index, movement)} /></div></EditorCard>
  </section>;
}

function EditorCard({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rc-card p-5 sm:p-6"><div className="mb-5 flex items-center gap-2"><Video size={18} className="text-teal-700" aria-hidden="true" /><h2 className="text-lg font-extrabold text-slate-950">{title}</h2></div>{children}</section>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="rc-field"><span>{label}</span><span className="rc-input-wrap">{children}</span></label>; }
function SelectField({ label, children }: { label: string; children: React.ReactNode }) { return <label className="rc-field"><span>{label}</span><span className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 [&>select]:w-full [&>select]:bg-transparent [&>select]:outline-none">{children}</span></label>; }
function OrderedList<T extends { id: string; title: string }>({ items, pending, onEdit, onDelete, onMove }: { items: T[]; pending: string | null; onEdit: (item: T) => void; onDelete: (id: string) => void; onMove: (index: number, movement: -1 | 1) => void }) { return <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">{items.length === 0 ? <li className="px-4 py-4 text-sm text-slate-500">Belum ada item.</li> : items.map((item, index) => <li key={item.id} className="flex items-center gap-2 px-3 py-3"><span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-700">{item.title}</span><button type="button" disabled={pending !== null || index === 0} onClick={() => onMove(index, -1)} aria-label={`Naikkan ${item.title}`} className="rounded p-1 text-slate-500 hover:bg-slate-100"><ArrowUp size={15} /></button><button type="button" disabled={pending !== null || index === items.length - 1} onClick={() => onMove(index, 1)} aria-label={`Turunkan ${item.title}`} className="rounded p-1 text-slate-500 hover:bg-slate-100"><ArrowDown size={15} /></button><button type="button" onClick={() => onEdit(item)} aria-label={`Edit ${item.title}`} className="rounded p-1 text-teal-700 hover:bg-teal-50">Edit</button><button type="button" onClick={() => onDelete(item.id)} aria-label={`Hapus ${item.title}`} className="rounded p-1 text-rose-700 hover:bg-rose-50"><Trash2 size={15} /></button></li>)}</ul>; }
