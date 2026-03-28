import BatchContent from "../../_core/BatchContent";

export const runtime = 'edge';

export default function BatchPage({ params }: { params: Promise<{ id: string }> }) {
  return <BatchContent params={params} />;
}
