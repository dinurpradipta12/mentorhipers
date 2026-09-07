'use client';

import { FormEvent, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardList, ExternalLink, Send, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Item = Record<string, unknown>;

function isAssignment(item: Item): boolean {
  const type = String(item.type ?? '').toLowerCase();
  return type.includes('assignment') || type === 'challenge' || type === 'task';
}

function safeUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

function text(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

export function AssignmentSubmissionForm({
  workspaceId,
  curriculum,
  submissions,
}: {
  workspaceId: string;
  curriculum: Item[];
  submissions: Item[];
}) {
  const router = useRouter();
  const assignments = useMemo(() => curriculum.filter(isAssignment), [curriculum]);
  const latestSubmissions = useMemo(() => {
    const result = new Map<string, Item>();
    for (const submission of submissions) {
      const id = String(submission.curriculum_id ?? '');
      if (id && !result.has(id)) result.set(id, submission);
    }
    return result;
  }, [submissions]);
  const [activeId, setActiveId] = useState('');
  const [fileLink, setFileLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [readingId, setReadingId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const active = assignments.find((item) => String(item.id) === activeId) ?? null;

  if (assignments.length === 0) return null;

  function choose(item: Item) {
    const existing = latestSubmissions.get(String(item.id));
    setActiveId(String(item.id));
    setFileLink(typeof existing?.file_link === 'string' ? existing.file_link : '');
    setError(null);
    setMessage(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active || submitting) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch('/api/v2/submissions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ workspaceId, curriculumId: String(active.id), fileLink }),
      });
      const payload = await response.json() as { success?: boolean; error?: string; clonedCount?: number };
      if (!response.ok || !payload.success) throw new Error(payload.error || 'Tugas tidak dapat dikumpulkan.');
      const cloneMessage = payload.clonedCount ? ` Salinan grup dibuat untuk ${payload.clonedCount} anggota.` : '';
      setMessage(`Submission tersimpan dan menunggu review mentor.${cloneMessage}`);
      setActiveId('');
      setFileLink('');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Tugas tidak dapat dikumpulkan.');
    } finally {
      setSubmitting(false);
    }
  }

  async function markRead(id: string) {
    setReadingId(id);
    try {
      const response = await fetch(`/api/v2/submissions/${encodeURIComponent(id)}/read`, {
        method: 'POST',
        credentials: 'same-origin',
      });
      if (!response.ok) throw new Error('Feedback belum dapat ditandai terbaca.');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Feedback belum dapat ditandai terbaca.');
    } finally {
      setReadingId('');
    }
  }

  return (
    <section className="rc-card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
        <div><p className="rc-eyebrow">Pengumpulan tugas</p><h2 className="mt-1 font-extrabold text-slate-950">Tugas & feedback mentor</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Kirim link HTTPS dari karya Anda. Kepemilikan, membership, dan akses batch divalidasi di server.</p></div>
        <span className="rc-stat-icon bg-teal-50 text-teal-700"><ShieldCheck size={19} aria-hidden="true" /></span>
      </div>
      {error && <p role="alert" className="mx-5 mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 sm:mx-6">{error}</p>}
      {message && <p role="status" className="mx-5 mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 sm:mx-6"><CheckCircle2 size={17} aria-hidden="true" />{message}</p>}
      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)] sm:p-6">
        <div className="space-y-3">
          {assignments.map((item) => {
            const id = String(item.id);
            const submission = latestSubmissions.get(id);
            const hasFeedback = Boolean(submission?.mentor_feedback);
            const isRead = submission?.is_feedback_read === true;
            const submissionId = String(submission?.id ?? '');
            return <article key={id} className={`rounded-2xl border p-4 transition ${activeId === id ? 'border-teal-400 bg-teal-50/40' : 'border-slate-200'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0"><p className="font-bold text-slate-900">{text(item.title, 'Tugas')}</p><p className="mt-1 text-xs text-slate-500">{submission ? `Status: ${text(submission.status, 'menunggu review')}` : 'Belum ada submission'}</p></div>
                <button type="button" onClick={() => choose(item)} className="rc-button rc-button-secondary shrink-0"><ClipboardList size={16} aria-hidden="true" />{submission ? 'Kirim revisi' : 'Kumpulkan'}</button>
              </div>
              {hasFeedback && <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-950"><p><span className="font-extrabold">Feedback mentor: </span>{String(submission?.mentor_feedback)}</p>{!isRead && <button type="button" className="mt-2 text-xs font-extrabold text-amber-800 underline" onClick={() => markRead(submissionId)} disabled={readingId === submissionId}>{readingId === submissionId ? 'Menyimpan…' : 'Tandai sudah dibaca'}</button>}</div>}
              {safeUrl(submission?.file_link) && <a href={safeUrl(submission?.file_link)!} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-teal-700">Buka submission terakhir <ExternalLink size={13} aria-hidden="true" /></a>}
            </article>;
          })}
        </div>
        {active ? <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-teal-700"><ClipboardList size={18} aria-hidden="true" /></span><div><h3 className="font-extrabold text-slate-950">{text(active.title, 'Kumpulkan tugas')}</h3><p className="mt-1 text-xs leading-5 text-slate-500">Pastikan link dapat dibuka oleh mentor dan tidak memuat password pada URL.</p></div></div><label className="rc-field mt-5"><span>Link karya / submission</span><span className="rc-input-wrap"><input type="url" required value={fileLink} onChange={(event) => setFileLink(event.target.value)} placeholder="https://drive.google.com/..." maxLength={2000} /></span></label><div className="mt-5 flex flex-wrap gap-3"><button type="button" className="rc-button rc-button-secondary" onClick={() => { setActiveId(''); setFileLink(''); setError(null); }}>Batal</button><button type="submit" className="rc-button rc-button-primary" disabled={submitting}>{submitting ? 'Mengirim…' : <><Send size={16} aria-hidden="true" /> Kirim tugas</>}</button></div></form> : <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center"><div><ClipboardList className="mx-auto text-slate-300" size={30} aria-hidden="true" /><p className="mt-3 text-sm font-bold text-slate-700">Pilih tugas untuk mengirim karya</p><p className="mt-1 text-xs leading-5 text-slate-500">Submission baru tidak menghapus histori pengumpulan sebelumnya.</p></div></div>}
      </div>
    </section>
  );
}
