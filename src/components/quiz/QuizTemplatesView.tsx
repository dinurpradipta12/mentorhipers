import { FileQuestion, ListChecks } from 'lucide-react';
import { EmptyState } from '@/components/app/EmptyState';
import { PageHeader } from '@/components/app/PageHeader';

export function QuizTemplatesView({ templates }: { templates: Array<Record<string, unknown>> }) {
  return (
    <section className="space-y-8">
      <PageHeader eyebrow="Bootcamp tools" title="Quiz Templates" description="Template quiz yang sudah ada tetap berada di data Bootcamp dan hanya terlihat oleh administrator." />
      {templates.length === 0 ? <EmptyState icon={<FileQuestion size={28} />} title="Belum ada template quiz" description="Template baru dapat dibuat setelah kontrol admin dan RLS Bootcamp diaktifkan." /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{templates.map((template) => {
        const questions = Array.isArray(template.questions_json) ? template.questions_json.length : 0;
        return <article key={String(template.id)} className="rc-card p-5 sm:p-6"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-50 text-violet-700"><ListChecks size={21} aria-hidden="true" /></span><p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-violet-700">{String(template.category ?? 'Umum')}</p><h2 className="mt-2 text-lg font-extrabold text-slate-950">{String(template.title ?? 'Template tanpa judul')}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">{String(template.description ?? 'Tidak ada deskripsi.')}</p><p className="mt-5 border-t border-slate-100 pt-4 text-xs font-bold text-slate-500">{questions} pertanyaan</p></article>;
      })}</div>}
    </section>
  );
}
