import PortalContent from "../../_core/PortalContent";

export const runtime = 'edge';

export default function PortalPage({ params }: { params: Promise<{ id: string }> }) {
  return <PortalContent params={params} />;
}
