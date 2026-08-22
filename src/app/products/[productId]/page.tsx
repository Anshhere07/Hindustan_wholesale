import { redirect } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ productId: string }> }) {
  const resolvedParams = await params;
  redirect(`/buyer/catalog/${encodeURIComponent(resolvedParams.productId)}`);
}
