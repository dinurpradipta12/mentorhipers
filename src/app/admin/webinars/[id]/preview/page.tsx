import { notFound } from 'next/navigation';
import { PublicWebinarViewer } from '@/components/webinars/PublicWebinarViewer';
import { getAdminWebinarPreview, WebinarNotFoundError, WebinarSchemaUnavailableError } from '@/lib/webinars/repository';

export const dynamic = 'force-dynamic';

async function loadPreview(id: string) {
  try {
    return { kind: 'ready' as const, webinar: await getAdminWebinarPreview(id) };
  } catch (error) {
    if (error instanceof WebinarNotFoundError || error instanceof WebinarSchemaUnavailableError) return { kind: 'not-found' as const };
    throw error;
  }
}

export default async function WebinarPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await loadPreview(id);
  if (result.kind === 'not-found') notFound();
  return <PublicWebinarViewer webinar={result.webinar} preview />;
}
