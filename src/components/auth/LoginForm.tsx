'use client';

import { useFormStatus } from 'react-dom';
import { ArrowRight, LockKeyhole, UserRound } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rc-button rc-button-primary mt-2 w-full disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? 'Memverifikasi…' : 'Masuk ke Ruang Campus'}
      {!pending && <ArrowRight aria-hidden="true" size={18} />}
    </button>
  );
}

export function LoginForm({ nextPath, error }: { nextPath: string; error?: string }) {
  return (
    <form action="/api/auth/login" method="post" className="space-y-5" noValidate>
      <input type="hidden" name="next" value={nextPath} />
      {error === 'invalid' && (
        <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          Username/email atau kata sandi tidak cocok.
        </p>
      )}
      {error === 'configuration' && (
        <p role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Konfigurasi login belum lengkap. Hubungi administrator.
        </p>
      )}
      <label className="rc-field">
        <span>Username atau email</span>
        <span className="rc-input-wrap">
          <UserRound aria-hidden="true" size={18} />
          <input name="identifier" autoComplete="username" required minLength={2} placeholder="nama.pengguna atau email" />
        </span>
      </label>
      <label className="rc-field">
        <span>Kata sandi</span>
        <span className="rc-input-wrap">
          <LockKeyhole aria-hidden="true" size={18} />
          <input name="password" type="password" autoComplete="current-password" required minLength={1} placeholder="Masukkan kata sandi" />
        </span>
      </label>
      <SubmitButton />
    </form>
  );
}
