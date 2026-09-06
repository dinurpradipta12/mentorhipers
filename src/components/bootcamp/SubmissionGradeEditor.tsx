'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Save, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Submission = Record<string, unknown>;
type Curriculum = Record<string, unknown>;

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function initialCriteria(value: unknown): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return '{}';
  return JSON.stringify(value, null, 2);
}

export function SubmissionGradeEditor({
  workspaceId,
  submissions,
  curriculum,
}: {
  workspaceId: string;
  submissions: Submission[];
  curriculum: Curriculum[];
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(() => String(submissions[0]?.id ?? ''));
  const selected = useMemo(() => submissions.find((submission) => String(submission.id) === selectedId) ?? null, [selectedId, submissions]);
  const [grade, setGrade] = useState('');
  const [status, setStatus] = useState('pending');
  const [feedback, setFeedback] = useState('');
  const [criteriaJson, setCriteriaJson] = useState('{}');
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setGrade(selected?.grade === null || selected?.grade === undefined ? '' : String(selected.grade));
    setStatus(text(selected?.status) || 'pending');
    setFeedback(text(selected?.mentor_feedback));
    setCriteriaJson(initialCriteria(selected?.criteria_scores));
    setReason('');
    setConfirmed(false);
    setError(null);
    setMessage(null);
  }, [selected]);

  if (submissions.length === 0) {
    return <section className="rc-card p-5 sm:p-6"><h2 className="font-extrabold text-slate-950">Penilaian submission</h2><p className="mt-2 text-sm leading-6 text-slate-500">Belum ada submission pada batch ini.</p></section>;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !confirmed) return;

    let criteriaScores: unknown;
    try {
      criteriaScores = JSON.parse(criteriaJson);
    } catch {
      setError('Criteria scores harus berupa JSON object yang valid.');
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch('/api/v2/submissions/' + encodeURIComponent(String(selected.id)) + '/grade', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          workspaceId,
          grade: grade === '' ? null : Number(grade),
          status,
          mentorFeedback: feedback,
          criteriaScores,
          reason,
        }),
      });
      const payload = await response.json() as { success?: boolean; error?: string };
      if (!response.ok || !payload.success) throw new Error(payload.error || 'Perubahan nilai tidak dapat disimpan.');
      setMessage('Perubahan tersimpan dan audit before/after telah dicatat.');
      setConfirmed(false);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Perubahan nilai tidak dapat disimpan.');
    } finally {
      setSaving(false);
    }
  }

  const currentTitle = curriculum.find((item) => String(item.id) === String(selected?.curriculum_id))?.title;

  return (
    <section className="rc-card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
        <div><p className="rc-eyebrow">Explicit grading</p><h2 className="mt-1 font-extrabold text-slate-950">Nilai & feedback submission</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Perubahan hanya berlaku untuk submission yang dipilih. Nilai akhir/ranking tidak dihitung ulang.</p></div>
        <span className="rc-stat-icon bg-emerald-50 text-emerald-700"><ShieldCheck size={19} aria-hidden="true" /></span>
      </div>
      <form onSubmit={submit} className="space-y-5 p-5 sm:p-6">
        <label className="rc-field"><span>Pilih submission</span><select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>{submissions.map((submission) => {
          const title = curriculum.find((item) => String(item.id) === String(submission.curriculum_id))?.title;
          const student = submission.v2_profiles as { full_name?: string; username?: string } | null;
          return <option key={String(submission.id)} value={String(submission.id)}>{student?.full_name || student?.username || 'Siswa'} — {String(title ?? 'Tugas')}</option>;
        })}</select></label>

        <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">Submission: {String(currentTitle ?? 'Tugas')} · status saat ini {text(selected?.status) || 'pending'}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="rc-field"><span>Nilai (0–100)</span><input type="number" min="0" max="100" step="1" value={grade} onChange={(event) => setGrade(event.target.value)} placeholder="Kosongkan untuk menghapus nilai" /></label>
          <label className="rc-field"><span>Status submission</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="pending">Pending</option><option value="in_review">In review</option><option value="completed">Completed</option></select></label>
        </div>

        <label className="rc-field"><span>Feedback mentor</span><textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} maxLength={10000} rows={4} placeholder="Tulis feedback yang akan dilihat siswa." /></label>
        <label className="rc-field"><span>Criteria scores (JSON)</span><textarea className="font-mono text-xs" value={criteriaJson} onChange={(event) => setCriteriaJson(event.target.value)} rows={6} spellCheck={false} aria-describedby="criteria-help" /><small id="criteria-help">Contoh: {'{"Kejelasan": 90, "Kelengkapan": 85}'}. Setiap skor wajib 0–100.</small></label>
        <label className="rc-field"><span>Catatan perubahan (audit)</span><input value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1000} placeholder="Contoh: Revisi setelah feedback mentor." /></label>

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950"><input className="mt-1 h-4 w-4 accent-teal-700" type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /><span>Saya memahami perubahan ini akan dicatat sebagai histori before/after dan tidak dapat membentuk ulang nilai akhir historis secara otomatis.</span></label>
        {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}
        {message && <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"><CheckCircle2 size={17} aria-hidden="true" />{message}</p>}
        <button type="submit" className="rc-button rc-button-primary" disabled={saving || !confirmed}>{saving ? 'Menyimpan…' : <><Save size={17} aria-hidden="true" />Simpan penilaian</>}</button>
      </form>
    </section>
  );
}
