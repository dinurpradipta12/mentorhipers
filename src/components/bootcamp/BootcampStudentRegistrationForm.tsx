'use client';

import { FormEvent, useState } from 'react';
import { CheckCircle2, ShieldCheck, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

type RegistrationResponse = {
  success?: boolean;
  error?: string;
  created?: boolean;
};

export function BootcampStudentRegistrationForm({ workspaceId, batchName }: { workspaceId: string; batchName: string }) {
  const router = useRouter();
  const [profileId, setProfileId] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function registerStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/v2/register-student', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          workspaceId,
          profileId: profileId.trim() || undefined,
          fullName,
          username,
          email,
          password,
        }),
      });
      const payload = await response.json() as RegistrationResponse;
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Siswa tidak dapat didaftarkan.');
      }

      setMessage(payload.created
        ? 'Akun Auth baru dan akses batch berhasil dibuat.'
        : 'Profile lama berhasil ditautkan tanpa membuat akun duplikat.');
      setProfileId('');
      setFullName('');
      setUsername('');
      setEmail('');
      setPassword('');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Siswa tidak dapat didaftarkan.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="overflow-hidden bg-white">
      <div className="border-b border-slate-100 px-6 py-7 pr-20 sm:px-9 sm:py-9 sm:pr-24">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700">
            <UserPlus size={21} aria-hidden="true" />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">Student registration</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">Tambah siswa ke batch</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">Tautkan profile lama bila tersedia agar akun, nilai, dan histori siswa tetap sama.</p>
          </div>
        </div>
      </div>

      <form onSubmit={registerStudent} className="space-y-5 p-6 sm:p-9">
        {error && <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}
        {message && <p role="status" className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"><CheckCircle2 size={17} aria-hidden="true" />{message}</p>}

        <label className="rc-field">
          <span>Batch tujuan</span>
          <span className="rc-input-wrap"><input value={batchName} readOnly aria-label="Batch tujuan" /></span>
        </label>

        <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 shrink-0 text-blue-700" size={19} aria-hidden="true" />
            <div>
              <p className="text-sm font-extrabold text-blue-950">Sudah memiliki profile lama?</p>
              <p className="mt-1 text-xs leading-5 text-blue-900/70">Isi UUID profile di bawah. Data akun baru akan diabaikan dan sistem tidak membuat Auth user duplikat.</p>
            </div>
          </div>
          <label className="rc-field mt-4">
            <span>Profile ID lama (opsional)</span>
            <span className="rc-input-wrap"><input value={profileId} onChange={(event) => setProfileId(event.target.value)} placeholder="UUID Auth/profile lama" /></span>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="rc-field sm:col-span-2"><span>Nama siswa baru</span><span className="rc-input-wrap"><input value={fullName} onChange={(event) => setFullName(event.target.value)} required={!profileId.trim()} maxLength={180} placeholder="Wajib bila Profile ID kosong" /></span></label>
          <label className="rc-field"><span>Username siswa baru</span><span className="rc-input-wrap"><input value={username} onChange={(event) => setUsername(event.target.value)} required={!profileId.trim()} maxLength={40} /></span></label>
          <label className="rc-field"><span>Email siswa baru</span><span className="rc-input-wrap"><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required={!profileId.trim()} maxLength={254} /></span></label>
          <label className="rc-field sm:col-span-2"><span>Password sementara siswa baru</span><span className="rc-input-wrap"><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required={!profileId.trim()} minLength={8} maxLength={256} autoComplete="new-password" /></span></label>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-5">
          <button type="submit" className="rc-button rc-button-primary" disabled={saving}>
            {saving ? 'Mendaftarkan…' : <><UserPlus size={17} aria-hidden="true" /> Daftarkan siswa</>}
          </button>
        </div>
      </form>
    </section>
  );
}
