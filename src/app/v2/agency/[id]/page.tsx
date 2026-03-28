import AgencyContent from "../../_core/AgencyContent";

export const runtime = 'edge';

export default function AgencyPage({ params }: { params: Promise<{ id: string }> }) {
  return <AgencyContent params={params} />;
}
