import { ClientLogin } from './ClientLogin';

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string, message?: string }> }) {
  const resolvedParams = await searchParams;
  return <ClientLogin error={resolvedParams.error} message={resolvedParams.message} />;
}
