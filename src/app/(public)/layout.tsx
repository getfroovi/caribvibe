import { Navbar } from '@/components/layout/Navbar';
import { BottomNav } from '@/components/layout/BottomNav';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-pink-500/30 selection:text-pink-200">
      <Navbar />
      <main className="pt-16 pb-16 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
