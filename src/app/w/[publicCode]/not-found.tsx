import Link from 'next/link';
import { ArrowLeft, BookX } from 'lucide-react';

export default function PublicWebinarNotFound() {
  return <main className="grid min-h-dvh place-items-center bg-slate-50 px-5 py-10"><section className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm"><BookX size={32} className="mx-auto text-slate-400" aria-hidden="true" /><p className="rc-eyebrow mt-6">404</p><h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">Webinar tidak tersedia</h1><p className="mt-3 text-sm leading-6 text-slate-500">Link ini tidak tersedia atau webinar belum diterbitkan.</p><Link href="/" className="rc-button rc-button-primary mt-7"><ArrowLeft size={16} aria-hidden="true" /> Kembali ke Ruang Campus</Link></section></main>;
}
