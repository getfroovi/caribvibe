import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Play, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export const revalidate = 0;

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  // Fetch Series
  const { data: series } = await supabase.from('series').select('*').eq('id', id).single();
  if (!series) return notFound();

  // Fetch Episodes
  const { data: episodes } = await supabase.from('videos').select('*').eq('series_id', id).order('episode_number', { ascending: true });

  return (
    <div className="bg-black min-h-screen text-white pb-20">
      {/* Hero Header */}
      <div className="relative w-full h-[50vh] md:h-[60vh] -mt-16">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url('${series.thumbnail_url || series.poster_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop'}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        <div className="absolute top-20 left-4 z-20">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-black/40 rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
        </div>

        <div className="absolute bottom-6 left-4 md:left-12 max-w-3xl z-10">
          <h1 className="text-4xl md:text-6xl font-black mb-3 tracking-tighter drop-shadow-xl uppercase">{series.title}</h1>
          <div className="flex items-center gap-3 text-sm font-semibold mb-4 text-gray-300">
            <span className="text-pink-500 font-bold">{episodes?.length || 0} Episodes</span>
            <span>•</span>
            <span className="font-bold">{series.category}</span>
          </div>
          <p className="text-gray-300 text-base md:text-lg mb-6 leading-relaxed max-w-2xl font-medium">{series.description}</p>
          <Link href={episodes && episodes.length > 0 ? `/watch/${episodes[0].id}` : '#'}>
            <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-bold px-8 h-12 rounded-md text-base transition-transform hover:scale-105">
              <Play className="w-5 h-5 mr-2 fill-black" /> Play Episode 1
            </Button>
          </Link>
        </div>
      </div>

      {/* Episodes List */}
      <div className="max-w-4xl mx-auto px-4 md:px-12 mt-8">
        <h2 className="text-2xl font-bold mb-6">Episodes</h2>
        {episodes && episodes.length > 0 ? (
          <div className="space-y-4">
            {episodes.map((ep) => (
              <Link 
                key={ep.id} 
                href={`/watch/${ep.id}`}
                className="flex items-center gap-4 p-3 bg-zinc-900/50 hover:bg-zinc-800 rounded-xl transition group"
              >
                <div className="relative w-32 h-20 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                  {ep.thumbnail_url || ep.poster_url || series.thumbnail_url || series.poster_url ? (
                    <img 
                      src={ep.thumbnail_url || ep.poster_url || series.thumbnail_url || series.poster_url} 
                      alt={ep.title} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">No Image</div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition" />
                  <div className="absolute bottom-1 right-1 bg-black/80 text-[10px] font-bold px-1.5 py-0.5 rounded text-white">
                    Ep {ep.episode_number}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-white group-hover:text-pink-400 transition">{ep.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-1">{ep.description || `Episode ${ep.episode_number} of ${series.title}`}</p>
                </div>
                {ep.is_premium && (
                  <div className="bg-pink-500/20 text-pink-500 text-xs font-bold px-2 py-1 rounded border border-pink-500/20">PREMIUM</div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 py-12 text-center bg-zinc-900/30 rounded-xl">
            No episodes have been released for this series yet.
          </div>
        )}
      </div>
    </div>
  );
}
