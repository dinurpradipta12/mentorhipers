'use client';

/* eslint-disable @next/next/no-img-element -- Covers can be approved external URLs or short-lived private Storage URLs. */

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BookOpen, ChevronRight, Clock3, ExternalLink, FileText, GraduationCap, ListVideo, PlayCircle } from 'lucide-react';
import type { PublicWebinar, PublicWebinarLesson } from '@/lib/webinars/types';

function formatDuration(seconds: number | null): string | null {
  if (seconds === null || seconds === undefined || seconds < 0) return null;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  if (hours > 0) return `${hours}j ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${remainder}d`;
}

function formatPublishedAt(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

function youtubeEmbedUrl(source: string): string | null {
  try {
    const url = new URL(source);
    const host = url.hostname.toLowerCase();
    const id = host === 'youtu.be' || host === 'www.youtu.be'
      ? url.pathname.split('/').filter(Boolean)[0]
      : url.pathname.startsWith('/embed/')
        ? url.pathname.split('/')[2]
        : url.searchParams.get('v');
    return id && /^[A-Za-z0-9_-]{6,}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : null;
  } catch {
    return null;
  }
}

function vimeoEmbedUrl(source: string): string | null {
  try {
    const pathname = new URL(source).pathname;
    const id = pathname.match(/(?:^|\/)video\/(\d+)(?:\/|$)/)?.[1] ?? pathname.match(/\/(\d+)(?:\/|$)/)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : null;
  } catch {
    return null;
  }
}

function VideoFrame({ lesson }: { lesson: PublicWebinarLesson }) {
  if (!lesson.videoUrl) {
    return <div className="grid aspect-video place-items-center rounded-2xl bg-slate-900 p-6 text-center text-sm text-slate-300">Video belum tersedia.</div>;
  }

  if (lesson.videoProvider === 'direct' || lesson.videoProvider === 'storage') {
    return <video className="aspect-video w-full rounded-2xl bg-slate-950 object-contain" controls preload="metadata" poster={lesson.thumbnailUrl ?? undefined} title={`Video: ${lesson.title}`}><source src={lesson.videoUrl} />Browser Anda belum mendukung pemutar video.</video>;
  }

  const embedUrl = lesson.videoProvider === 'youtube' ? youtubeEmbedUrl(lesson.videoUrl) : vimeoEmbedUrl(lesson.videoUrl);
  if (!embedUrl) {
    return <div className="grid aspect-video place-items-center rounded-2xl bg-slate-900 p-6 text-center"><a href={lesson.videoUrl} target="_blank" rel="noreferrer" className="rc-button border border-white/25 bg-white/10 text-white">Buka video <ExternalLink size={16} aria-hidden="true" /></a></div>;
  }

  return <iframe className="aspect-video w-full rounded-2xl bg-slate-950" src={embedUrl} title={`Video: ${lesson.title}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />;
}

export function PublicWebinarViewer({ webinar, preview = false }: { webinar: PublicWebinar; preview?: boolean }) {
  const lessons = useMemo(() => webinar.sections.flatMap((section) => section.lessons), [webinar]);
  const [activeSlug, setActiveSlug] = useState<string | null>(() => lessons[0]?.lessonSlug ?? null);
  const activeLesson = lessons.find((lesson) => lesson.lessonSlug === activeSlug) ?? lessons[0] ?? null;
  const publishedAt = formatPublishedAt(webinar.publishedAt);

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3 no-underline"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-700 text-sm font-black text-white">RC</span><span className="min-w-0"><span className="block truncate text-sm font-extrabold tracking-tight text-slate-950">Ruang Campus</span><span className="block truncate text-[11px] font-medium text-slate-500">Webinar LMS</span></span></Link>
          {preview ? <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-extrabold text-amber-800">Preview admin</span> : <span className="hidden text-sm font-semibold text-slate-500 sm:block">Belajar tanpa login</span>}
        </div>
      </header>

      {preview && <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-900">Ini adalah preview khusus admin. Webinar draft tetap tidak dapat dibuka melalui link publik.</div>}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-7 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-8 lg:py-10">
          <div className="min-w-0 self-center">
            {webinar.category && <p className="rc-eyebrow">{webinar.category}</p>}
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{webinar.title}</h1>
            {webinar.instructorName && <p className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-600"><GraduationCap size={18} className="text-teal-700" aria-hidden="true" /> {webinar.instructorName}</p>}
            <p className="mt-4 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-slate-600 sm:text-base">{webinar.description || 'Materi webinar Ruang Campus.'}</p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500"><span className="inline-flex items-center gap-1.5"><ListVideo size={15} aria-hidden="true" /> {lessons.length} lesson</span>{publishedAt && <span className="inline-flex items-center gap-1.5"><Clock3 size={15} aria-hidden="true" /> Diterbitkan {publishedAt}</span>}</div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">{webinar.coverUrl ? <img src={webinar.coverUrl} alt={`Cover ${webinar.title}`} className="aspect-video h-full w-full object-cover" /> : <div className="grid aspect-video place-items-center bg-slate-900 p-6 text-center text-sm font-bold text-slate-300"><BookOpen size={32} aria-hidden="true" /></div>}</div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-7 px-4 py-7 sm:px-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:px-8 lg:py-10">
        <aside className="order-2 min-w-0 lg:order-1">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-6">
            <div className="border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-extrabold text-slate-950">Daftar pembelajaran</h2><p className="mt-1 text-xs text-slate-500">Pilih lesson untuk mulai menonton.</p></div>
            <div className="max-h-[58vh] overflow-y-auto p-2">{webinar.sections.length === 0 ? <p className="p-4 text-sm text-slate-500">Belum ada materi yang dipublikasikan.</p> : webinar.sections.map((section, sectionIndex) => <details key={`${section.title}-${section.sortOrder}`} open={sectionIndex === 0} className="group rounded-xl"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3 text-sm font-extrabold text-slate-800 marker:content-none"><span className="min-w-0 truncate">{section.title}</span><ChevronRight size={17} className="shrink-0 text-slate-400 transition-transform group-open:rotate-90" aria-hidden="true" /></summary>{section.description && <p className="px-3 pb-2 text-xs leading-5 text-slate-500">{section.description}</p>}<ul className="space-y-1 px-1 pb-2">{section.lessons.length === 0 ? <li className="px-3 py-2 text-xs text-slate-400">Belum ada lesson publik.</li> : section.lessons.map((lesson) => <li key={lesson.lessonSlug}><button type="button" onClick={() => setActiveSlug(lesson.lessonSlug)} aria-current={activeLesson?.lessonSlug === lesson.lessonSlug ? 'step' : undefined} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${activeLesson?.lessonSlug === lesson.lessonSlug ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}><PlayCircle size={16} className="shrink-0" aria-hidden="true" /><span className="min-w-0 flex-1 truncate">{lesson.title}</span>{formatDuration(lesson.durationSeconds) && <span className="shrink-0 text-[11px] font-semibold opacity-70">{formatDuration(lesson.durationSeconds)}</span>}</button></li>)}</ul></details>)}</div>
          </div>
        </aside>

        <section className="order-1 min-w-0 lg:order-2">
          {activeLesson ? <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5"><VideoFrame lesson={activeLesson} /><div className="px-1 pb-1 pt-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="rc-eyebrow">Lesson aktif</p><h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">{activeLesson.title}</h2></div>{formatDuration(activeLesson.durationSeconds) && <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600"><Clock3 size={14} aria-hidden="true" /> {formatDuration(activeLesson.durationSeconds)}</span>}</div>{activeLesson.description && <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">{activeLesson.description}</p>}{activeLesson.contentRich && <div className="mt-5 border-l-4 border-teal-500 bg-teal-50 px-4 py-3 text-sm leading-7 text-slate-700"><p className="font-extrabold text-teal-900">Catatan lesson</p><p className="mt-1 whitespace-pre-wrap">{activeLesson.contentRich}</p></div>}{activeLesson.resources.length > 0 && <div className="mt-6"><h3 className="text-sm font-extrabold text-slate-950">Resource</h3><ul className="mt-3 space-y-2">{activeLesson.resources.map((resource) => resource.publicUrl ? <li key={`${resource.title}-${resource.sortOrder}`}><a href={resource.publicUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800"><span className="flex min-w-0 items-center gap-2"><FileText size={17} className="shrink-0" aria-hidden="true" /><span className="truncate">{resource.title}</span></span><ExternalLink size={16} className="shrink-0" aria-hidden="true" /></a></li> : null)}</ul></div>}</div></article> : <article className="grid min-h-72 place-items-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><div><BookOpen size={32} className="mx-auto text-slate-400" aria-hidden="true" /><h2 className="mt-4 text-lg font-extrabold text-slate-950">Materi sedang disiapkan</h2><p className="mt-2 text-sm leading-6 text-slate-500">Belum ada lesson yang dapat ditonton pada webinar ini.</p></div></article>}
        </section>
      </div>
    </main>
  );
}
