'use client';

import { RefreshCcw } from 'lucide-react';

export default function PublicWebinarError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-dvh place-items-center bg-slate-50 px-5 py-10"><section className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm"><p className="rc-eyebrow">Webinar LMS</p><h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">Webinar belum dapat dimuat</h1><p className="mt-3 text-sm leading-6 text-slate-500">Terjadi gangguan saat memuat materi. Silakan coba lagi.</p><button type="button" onClick={reset} className="rc-button rc-button-primary mt-7"><RefreshCcw size={16} aria-hidden="true" /> Coba lagi</button></section></main>;
}
