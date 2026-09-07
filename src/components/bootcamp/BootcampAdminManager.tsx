'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Archive, CalendarClock, Plus, Save, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { normalizeSchedules } from '@/lib/bootcamp/schedules';
import type { BootcampBatch } from '@/lib/bootcamp/types';

function dateValue(value: string | null) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : '';
}

function schedulesValue(value: unknown) {
  return JSON.stringify(normalizeSchedules(value), null, 2);
}

export function BootcampAdminManager({ batches }: { batches: BootcampBatch[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(() => String(batches[0]?.id ?? 'new'));
  const selected = useMemo(() => batches.find((batch) => batch.id === selectedId) ?? null, [batches, selectedId]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [maxMembers, setMaxMembers] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [schedulesJson, setSchedulesJson] = useState('[]');
  const [saving, setSaving] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [profileId, setProfileId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentUsername, setStudentUsername] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  useEffect(() => {
    if (!selected) {
      setName('');
      setDescription('');
      setStatus('active');
      setMaxMembers('');
      setStartDate('');
      setEndDate('');
      setSchedulesJson('[]');
      return;
    }
    setName(selected.name);
    setDescription(selected.description ?? '');
    setStatus(selected.status || 'active');
    setMaxMembers(selected.max_members ?? '');
    setStartDate(dateValue(selected.start_date));
    setEndDate(dateValue(selected.end_date));
    setSchedulesJson(schedulesValue(selected.schedules));
  }, [selected]);

  function selectBatch(value: string) {
    setSelectedId(value);
    setError(null);
    setMessage(null);
  }

  async function saveBatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    let schedules: unknown;
    try {
      schedules = JSON.parse(schedulesJson);
    } catch {
      setError('Jadwal harus berupa JSON array yang valid.');
      setSaving(false);
      return;
    }
    if (!Array.isArray(schedules)) {
      setError('Jadwal harus berupa JSON array.');
      setSaving(false);
      return;
    }

    try {
      const endpoint = selected ? `/api/v2/batches/${encodeURIComponent(selected.id)}` : '/api/v2/batches';
      const response = await fetch(endpoint, {
        method: selected ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ name, description, status, maxMembers, startDate, endDate, schedules }),
      });
      const payload = await response.json() as { success?: boolean; error?: string; batch?: { id?: string } };
      if (!response.ok || !payload.success) throw new Error(payload.error || 'Batch tidak dapat disimpan.');
      if (!selected && payload.batch?.id) setSelectedId(payload.batch.id);
      setMessage(selected ? 'Perubahan batch tersimpan.' : 'Batch baru berhasil dibuat.');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Batch tidak dapat disimpan.');
    } finally {
      setSaving(false);
    }
  }

  async function registerStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) {
      setError('Pilih atau buat batch terlebih dahulu.');
      return;
    }
    setRegistering(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch('/api/v2/register-student', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ workspaceId: selected.id, profileId: profileId || undefined, fullName: studentName, username: studentUsername, email: studentEmail, password: studentPassword }),
      });
      const payload = await response.json() as { success?: boolean; error?: string; created?: boolean };
      if (!response.ok || !payload.success) throw new Error(payload.error || 'Siswa tidak dapat didaftarkan.');
      setMessage(payload.created ? 'Akun Auth baru dan membership berhasil dibuat.' : 'Akun Auth lama berhasil ditautkan ke batch.');
      setProfileId('');
      setStudentName('');
      setStudentUsername('');
      setStudentEmail('');
      setStudentPassword('');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Siswa tidak dapat didaftarkan.');
    } finally {
      setRegistering(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="rc-eyebrow">Administrasi Bootcamp</p><h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-950">Kelola batch dan siswa</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Perubahan dikirim ke server setelah sesi admin tervalidasi. Arsip mengubah status batch dan tidak menghapus histori.</p></div><button type="button" onClick={() => selectBatch('new')} className="rc-button rc-button-secondary"><Plus size={17} aria-hidden="true" /> Batch baru</button></div>
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}
      {message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{message}</p>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.8fr)]">
        <form onSubmit={saveBatch} className="rc-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4"><div><h3 className="font-extrabold text-slate-950">Detail batch</h3><p className="mt-1 text-xs text-slate-500">Pilih batch lama untuk mengedit atau buat draft baru.</p></div><CalendarClock size={20} className="text-teal-700" aria-hidden="true" /></div>
          <label className="rc-field mt-5"><span>Batch yang diedit</span><span className="rc-input-wrap"><select value={selectedId} onChange={(event) => selectBatch(event.target.value)} aria-label="Batch yang diedit"><option value="new">Batch baru</option>{batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}</option>)}</select></span></label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="rc-field sm:col-span-2"><span>Nama batch</span><span className="rc-input-wrap"><input value={name} onChange={(event) => setName(event.target.value)} required maxLength={180} /></span></label><label className="rc-field"><span>Status</span><span className="rc-input-wrap"><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="draft">Draft</option><option value="active">Active</option><option value="completed">Completed</option><option value="archived">Archived</option><option value="inactive">Inactive</option></select></span></label><label className="rc-field"><span>Kapasitas siswa</span><span className="rc-input-wrap"><input value={maxMembers} onChange={(event) => setMaxMembers(event.target.value)} inputMode="numeric" pattern="[0-9]*" placeholder="Opsional" /></span></label><label className="rc-field"><span>Tanggal mulai</span><span className="rc-input-wrap"><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></span></label><label className="rc-field"><span>Tanggal selesai</span><span className="rc-input-wrap"><input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></span></label><label className="rc-field sm:col-span-2"><span>Deskripsi</span><span className="rc-input-wrap"><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} maxLength={10000} /></span></label><label className="rc-field sm:col-span-2"><span>Jadwal (JSON)</span><span className="rc-input-wrap"><textarea className="font-mono text-xs" value={schedulesJson} onChange={(event) => setSchedulesJson(event.target.value)} rows={8} spellCheck={false} aria-describedby="batch-schedule-help" /></span><small id="batch-schedule-help">Format: [{'{"title":"Kelas 1","date":"2026-09-10","time":"19:00","meet_link":"https://…"}'}]</small></label></div>
          <div className="mt-5 flex flex-wrap gap-3"><button type="submit" className="rc-button rc-button-primary" disabled={saving}>{saving ? 'Menyimpan…' : <><Save size={17} aria-hidden="true" /> Simpan batch</>}</button>{selected && status !== 'archived' && <button type="button" className="rc-button rc-button-secondary" disabled={saving} onClick={() => setStatus('archived')}><Archive size={17} aria-hidden="true" /> Tandai arsip</button>}</div>
        </form>

        <form onSubmit={registerStudent} className="rc-card p-5 sm:p-6"><div className="flex items-center justify-between gap-4"><div><h3 className="font-extrabold text-slate-950">Daftarkan siswa</h3><p className="mt-1 text-xs leading-5 text-slate-500">Masukkan profile ID untuk mempertahankan akun lama, atau isi data baru untuk membuat Auth melalui server.</p></div><UserPlus size={20} className="text-teal-700" aria-hidden="true" /></div><label className="rc-field mt-5"><span>Batch tujuan</span><span className="rc-input-wrap"><input value={selected?.name ?? 'Pilih batch terlebih dahulu'} readOnly aria-label="Batch tujuan" /></span></label><label className="rc-field mt-4"><span>Profile ID lama (opsional)</span><span className="rc-input-wrap"><input value={profileId} onChange={(event) => setProfileId(event.target.value)} placeholder="UUID Auth/profile lama" /></span></label><p className="mt-2 text-xs leading-5 text-slate-500">Jika profile ID diisi, kolom akun baru di bawah diabaikan dan tidak ada akun duplikat yang dibuat.</p><div className="mt-4 space-y-4"><label className="rc-field"><span>Nama siswa baru</span><span className="rc-input-wrap"><input value={studentName} onChange={(event) => setStudentName(event.target.value)} maxLength={180} placeholder="Wajib jika profile ID kosong" /></span></label><label className="rc-field"><span>Username siswa baru</span><span className="rc-input-wrap"><input value={studentUsername} onChange={(event) => setStudentUsername(event.target.value)} maxLength={40} /></span></label><label className="rc-field"><span>Email siswa baru</span><span className="rc-input-wrap"><input type="email" value={studentEmail} onChange={(event) => setStudentEmail(event.target.value)} maxLength={254} /></span></label><label className="rc-field"><span>Password sementara siswa baru</span><span className="rc-input-wrap"><input type="password" value={studentPassword} onChange={(event) => setStudentPassword(event.target.value)} minLength={8} maxLength={256} autoComplete="new-password" /></span></label></div><button type="submit" className="rc-button rc-button-primary mt-5" disabled={registering || !selected}>{registering ? 'Mendaftarkan…' : <><UserPlus size={17} aria-hidden="true" /> Daftarkan siswa</>}</button></form>
      </div>
    </section>
  );
}
