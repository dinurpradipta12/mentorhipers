import AgencyContent from "../../_core/AgencyContent";

export default function AgencyPage({ params }: { params: Promise<{ id: string }> }) {
  return <AgencyContent params={params} />;
}
