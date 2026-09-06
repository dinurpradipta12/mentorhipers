'use client';

/* eslint-disable @next/next/no-img-element -- Covers can be approved external URLs or short-lived private Storage URLs. */

import Link from 'next/link';
import { useState } from 'react';
import { Clipboard, ExternalLink, FileVideo, Pencil, Plus, Video } from 'lucide-react';
import { EmptyState } from '@/components/app/EmptyState';
import { PageHeader } from '@/components/app/PageHeader';
import { StatusBadge } from '@/components/app/StatusBadge';
import type { WebinarListItem } from '@/lib/webinars/types';

export function WebinarAdminList({ webinars }: { webinars: WebinarListItem[] }) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copyPublicLink(webinar: WebinarListItem) {
    await navigator.clipboard.writeText(`${window.location.origin}/w/${webinar.publicCode}`);
    setCopied(webinar.id);
    window.setTimeout(() => setCopied(null), 1800);
  }

  return (
    <section className="space-y-8">
      <PageHeader eyebrow="Webinar LMS" title="Webinar LMS" description="Kelola pembelajaran publik yang terpisah dari siswa dan data Bootcamp." action={<Link href="/admin/webinars/new" className="rc-button rc-button-primary"><Plus aria-hidden="true" size={18} /> Buat Webinar</Link>} />
      {webinars.length === 0 ? <EmptyState icon={<Video size={29} />} title="Belum ada webinar" description="Buat draft pertama. Draft tidak pernah dapat dibuka oleh pengunjung publik." action={<Link href="/admin/webinars/new" className="rc-button rc-button-primary">Buat Webinar</Link>} /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{webinars.map((webinar) => <article key={webinar.id} className="rc-card overflow-hidden"><div className="flex aspect-[16/7] items-center justify-center bg-slate-100">{webinar.coverUrl ? <img src={webinar.coverUrl} alt="" className="h-full w-full object-cover" /> : <FileVideo size={32} className="text-slate-400" aria-hidden="true" />}</div><div className="p-5"><div className="flex items-start justify-between gap-3"><StatusBadge status={webinar.status} /><span className="text-xs font-bold text-slate-400">{webinar.lessonCount} lesson</span></div><h2 className="mt-4 text-lg font-extrabold text-slate-950">{webinar.title}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{webinar.description || 'Tanpa deskripsi.'}</p><p className="mt-4 text-xs font-semibold text-slate-500">{webinar.instructorName || 'Instruktur belum diatur'}</p><div className="mt-5 flex flex-wrap gap-2"><Link href={`/admin/webinars/${webinar.id}/edit`} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-teal-300 hover:text-teal-700"><Pencil aria-hidden="true" size={14} /> Edit</Link><button type="button" onClick={() => copyPublicLink(webinar)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-teal-300 hover:text-teal-700"><Clipboard aria-hidden="true" size={14} /> {copied === webinar.id ? 'Tersalin' : 'Copy Link'}</button>{webinar.status === 'published' && <a href={`/w/${webinar.publicCode}`} target="_blank" rel="noreferrer" aria-label={`Buka webinar ${webinar.title}`} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-teal-300 hover:text-teal-700"><ExternalLink aria-hidden="true" size={14} /> Preview</a>}</div></div></article>)}</div>}
    </section>
  );
}
