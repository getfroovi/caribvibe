import { ClientLogin } from './ClientLogin';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string, message?: string }> }) {
  const resolvedParams = await searchParams;
  return <ClientLogin error={resolvedParams.error} message={resolvedParams.message} />;
}
