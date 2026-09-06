import Link from 'next/link';
import { ArrowRight, ArchiveX } from 'lucide-react';

export function RetiredAgencyFeature() {
  return (
    <main className="grid min-h-dvh place-items-center bg-slate-50 px-5 py-12">
      <section className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-600"><ArchiveX aria-hidden="true" size={27} /></span>
        <p className="rc-eyebrow mt-6">Fitur tidak tersedia</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">Agency/Team Mode telah dihentikan</h1>
        <p className="mt-4 text-sm leading-6 text-slate-500">Data Agency lama tetap diarsipkan dan tidak dicampur dengan Bootcamp maupun Webinar LMS.</p>
        <Link href="/ruang-sosmed" className="rc-button rc-button-primary mt-7">Ke Ruang Campus <ArrowRight aria-hidden="true" size={17} /></Link>
      </section>
    </main>
  );
}
