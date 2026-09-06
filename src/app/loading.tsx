import { LoadingSkeleton } from '@/components/app/LoadingSkeleton';

export default function Loading() {
  return <main className="min-h-dvh bg-slate-50 px-5 py-8 sm:px-8"><div className="mx-auto max-w-7xl"><LoadingSkeleton rows={5} /></div></main>;
}
