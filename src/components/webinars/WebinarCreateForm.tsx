'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LoaderCircle, Save } from 'lucide-react';

export function WebinarCreateForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/admin/webinars', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: form.get('title'),
        description: form.get('description'),
        instructorName: form.get('instructorName'),
        category: form.get('category'),
        coverUrl: form.get('coverUrl'),
        coverStoragePath: null,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.error || 'Draft webinar tidak dapat dibuat.');
      setPending(false);
      return;
    }
    router.replace(`/admin/webinars/${payload.webinar.id}/edit`);
  }

  return (
    <form onSubmit={submit} className="rc-card mx-auto max-w-3xl p-6 sm:p-8">
      <div className="flex items-start justify-between gap-5"><div><p className="rc-eyebrow">Webinar LMS</p><h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">Buat webinar draft</h1><p className="mt-2 text-sm leading-6 text-slate-500">Draft tidak dapat dilihat publik hingga Anda menerbitkannya.</p></div><button type="button" onClick={() => router.back()} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100"><ArrowLeft size={17} aria-hidden="true" /> Kembali</button></div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2"><label className="rc-field sm:col-span-2"><span>Judul webinar</span><span className="rc-input-wrap"><input name="title" required maxLength={180} placeholder="Contoh: Strategi Konten 2026" /></span></label><label className="rc-field"><span>Instruktur / pembicara</span><span className="rc-input-wrap"><input name="instructorName" maxLength={180} placeholder="Nama instruktur" /></span></label><label className="rc-field"><span>Kategori</span><span className="rc-input-wrap"><input name="category" maxLength={80} placeholder="Contoh: Social media" /></span></label><label className="rc-field sm:col-span-2"><span>Cover URL (opsional)</span><span className="rc-input-wrap"><input name="coverUrl" type="url" placeholder="https://…" /></span></label><label className="rc-field sm:col-span-2"><span>Deskripsi</span><span className="rc-input-wrap"><textarea name="description" rows={5} maxLength={12000} placeholder="Apa yang akan dipelajari pengunjung?" /></span></label></div>
      {error && <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
      <div className="mt-7 flex justify-end"><button type="submit" disabled={pending} className="rc-button rc-button-primary disabled:cursor-wait disabled:opacity-70">{pending ? <LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> : <Save size={18} aria-hidden="true" />}{pending ? 'Membuat draft…' : 'Simpan draft'}</button></div>
    </form>
  );
}
