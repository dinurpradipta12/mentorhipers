import { notFound } from 'next/navigation';
import { AppShell } from '@/components/app/AppShell';
import { WebinarEditor } from '@/components/webinars/WebinarEditor';
import { getCurrentViewer } from '@/lib/auth/context';
import { getAdminWebinar, WebinarNotFoundError, WebinarSchemaUnavailableError } from '@/lib/webinars/repository';

export const dynamic = 'force-dynamic';

type EditorLoadResult =
  | { kind: 'ready'; webinar: Awaited<ReturnType<typeof getAdminWebinar>> }
  | { kind: 'not-found' }
  | { kind: 'schema-unavailable' };

async function loadEditor(id: string): Promise<EditorLoadResult> {
  try {
    return { kind: 'ready', webinar: await getAdminWebinar(id) };
  } catch (error) {
    if (error instanceof WebinarNotFoundError) return { kind: 'not-found' };
    if (error instanceof WebinarSchemaUnavailableError) return { kind: 'schema-unavailable' };
    throw error;
  }
}

export default async function EditWebinarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const viewer = await getCurrentViewer();
  if (!viewer?.isAdmin) return null;
  const result = await loadEditor(id);
  if (result.kind === 'not-found') notFound();
  if (result.kind === 'schema-unavailable') {
    return <AppShell viewer={viewer} active="webinars"><section className="rc-card p-7"><p className="rc-eyebrow">Migrasi diperlukan</p><h1 className="mt-2 text-2xl font-extrabold text-slate-950">Webinar LMS belum tersedia di database</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Schema Webinar LMS belum diterapkan pada project Supabase target. Terapkan migrasi setelah backup database penuh diverifikasi; jangan membuat project Supabase baru.</p></section></AppShell>;
  }
  return <AppShell viewer={viewer} active="webinars"><WebinarEditor initial={result.webinar} /></AppShell>;
}
