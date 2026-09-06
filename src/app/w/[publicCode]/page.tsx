import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicWebinarViewer } from '@/components/webinars/PublicWebinarViewer';
import { getAppUrl } from '@/lib/app-url';
import { getPublicWebinar } from '@/lib/webinars/repository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PageProps = { params: Promise<{ publicCode: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { publicCode } = await params;
  const webinar = await getPublicWebinar(publicCode);
  if (!webinar) {
    return {
      title: 'Webinar tidak tersedia',
      robots: { index: false, follow: false },
    };
  }

  const canonical = `${getAppUrl()}/w/${encodeURIComponent(webinar.publicCode)}`;
  const description = webinar.description.trim().slice(0, 160) || `Webinar bersama ${webinar.instructorName ?? 'Ruang Campus'}.`;
  return {
    title: webinar.title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      locale: 'id_ID',
      url: canonical,
      title: webinar.title,
      description,
      siteName: 'Ruang Campus',
    },
  };
}

export default async function PublicWebinarPage({ params }: PageProps) {
  const { publicCode } = await params;
  const webinar = await getPublicWebinar(publicCode);
  if (!webinar) notFound();
  return <PublicWebinarViewer webinar={webinar} />;
}
