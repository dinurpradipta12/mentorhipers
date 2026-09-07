'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { BellRing, CheckCircle2, Eye, Plus, Save, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Announcement = Record<string, unknown>;

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function jsonArray(value: unknown): string {
  if (!Array.isArray(value)) return '[]';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '[]';
  }
}

export function BootcampAnnouncementManager({ workspaceId, announcements }: { workspaceId: string; announcements: Announcement[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(() => String(announcements[0]?.id ?? 'new'));
  const selected = useMemo(() => announcements.find((item) => String(item.id) === selectedId) ?? null, [announcements, selectedId]);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('announcement');
  const [imageUrl, setImageUrl] = useState('');
  const [galleryJson, setGalleryJson] = useState('[]');
  const [isPinned, setIsPinned] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) {
      setTitle('');
      setSummary('');
      setContent('');
      setCategory('announcement');
      setImageUrl('');
      setGalleryJson('[]');
      setIsPinned(false);
      return;
    }
    setTitle(text(selected.title));
    setSummary(text(selected.summary));
    setContent(text(selected.content));
    setCategory(text(selected.category) || 'announcement');
    setImageUrl(text(selected.image_url));
    setGalleryJson(jsonArray(selected.gallery_images));
    setIsPinned(selected.is_pinned === true);
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
    let galleryImages: unknown;
    try {
      galleryImages = JSON.parse(galleryJson);
    } catch {
      setError('Galeri gambar harus berupa JSON array yang valid.');
      setSaving(false);
      return;
    }
    if (!Array.isArray(galleryImages)) {
      setError('Galeri gambar harus berupa JSON array.');
      setSaving(false);
      return;
    }
    try {
      const endpoint = selected ? `/api/v2/announcements/${encodeURIComponent(String(selected.id))}` : '/api/v2/announcements';
      const response = await fetch(endpoint, {
        method: selected ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ workspaceId, title, summary, content, category, imageUrl, galleryImages, isPinned }),
      });
      const payload = await response.json() as { success?: boolean; error?: string; announcement?: { id?: string } };
      if (!response.ok || !payload.success) throw new Error(payload.error || 'Pengumuman tidak dapat disimpan.');
      if (!selected && payload.announcement?.id) setSelectedId(payload.announcement.id);
      setMessage(selected ? 'Perubahan pengumuman tersimpan.' : 'Pengumuman baru berhasil dibuat.');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Pengumuman tidak dapat disimpan.');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!selected || deleting) return;
    if (!window.confirm('Hapus pengumuman dari batch ini?')) return;
    setDeleting(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/v2/announcements/${encodeURIComponent(String(selected.id))}`, {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ workspaceId }),
      });
      const payload = await response.json() as { success?: boolean; error?: string };
      if (!response.ok || !payload.success) throw new Error(payload.error || 'Pengumuman tidak dapat dihapus.');
      setSelectedId('new');
      setMessage('Pengumuman dihapus.');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Pengumuman tidak dapat dihapus.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="rc-card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6"><div><p className="rc-eyebrow">Community board</p><h2 className="mt-1 font-extrabold text-slate-950">Pengumuman batch</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">Publikasikan informasi untuk siswa yang sudah terdaftar. URL gambar dibatasi HTTPS dan konten ditampilkan sebagai teks aman.</p></div><span className="rc-stat-icon bg-amber-50 text-amber-700"><BellRing size={19} aria-hidden="true" /></span></div>
      {error && <p role="alert" className="mx-5 mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 sm:mx-6">{error}</p>}
      {message && <p role="status" className="mx-5 mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 sm:mx-6"><CheckCircle2 size={17} aria-hidden="true" />{message}</p>}
      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(220px,0.7fr)_minmax(0,1.3fr)] sm:p-6">
        <div className="space-y-2"><button type="button" onClick={() => choose('new')} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left ${selectedId === 'new' ? 'border-teal-400 bg-teal-50' : 'border-slate-200 hover:border-teal-200'}`}><span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-teal-700"><Plus size={16} aria-hidden="true" /></span><span className="text-sm font-bold text-slate-900">Pengumuman baru</span></button>{announcements.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Belum ada pengumuman.</p>}{announcements.map((announcement) => <button key={String(announcement.id)} type="button" onClick={() => choose(String(announcement.id))} className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition ${selectedId === String(announcement.id) ? 'border-teal-400 bg-teal-50' : 'border-slate-200 hover:border-teal-200'}`}><span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-amber-700"><BellRing size={16} aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-slate-900">{text(announcement.title) || 'Tanpa judul'}</span><span className="mt-1 block text-xs text-slate-500">{announcement.is_pinned === true ? 'Dipinkan · ' : ''}{text(announcement.category) || 'announcement'}</span></span></button>)}</div>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2"><label className="rc-field sm:col-span-2"><span>Judul</span><input required value={title} onChange={(event) => setTitle(event.target.value)} maxLength={180} /></label><label className="rc-field"><span>Kategori</span><input value={category} onChange={(event) => setCategory(event.target.value)} maxLength={80} placeholder="announcement" /></label><label className="rc-field"><span>URL gambar (opsional)</span><input type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} maxLength={2000} placeholder="https://..." /></label><label className="rc-field sm:col-span-2"><span>Ringkasan</span><textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={2} maxLength={2000} /></label><label className="rc-field sm:col-span-2"><span>Isi pengumuman</span><textarea value={content} onChange={(event) => setContent(event.target.value)} rows={6} maxLength={50000} /></label><label className="rc-field sm:col-span-2"><span>Galeri gambar (JSON array URL HTTPS)</span><textarea className="font-mono text-xs" value={galleryJson} onChange={(event) => setGalleryJson(event.target.value)} rows={3} spellCheck={false} /></label><label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700 sm:col-span-2"><input type="checkbox" className="h-4 w-4 accent-teal-700" checked={isPinned} onChange={(event) => setIsPinned(event.target.checked)} /> Pin pengumuman di bagian atas</label><div className="flex flex-wrap gap-3 sm:col-span-2"><button type="submit" className="rc-button rc-button-primary" disabled={saving || deleting}>{saving ? 'Menyimpan…' : <><Save size={16} aria-hidden="true" /> Simpan pengumuman</>}</button>{selected && <button type="button" className="rc-button rc-button-secondary" disabled={saving || deleting} onClick={remove}>{deleting ? 'Menghapus…' : <><Trash2 size={16} aria-hidden="true" /> Hapus</>}</button>}<span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500"><Eye size={14} aria-hidden="true" /> terlihat untuk anggota aktif batch</span></div></form>
      </div>
    </section>
  );
}
