import PortalContent from "../../_core/PortalContent";

export default function PortalPage({ params }: { params: Promise<{ id: string }> }) {
  return <PortalContent params={params} />;
}
