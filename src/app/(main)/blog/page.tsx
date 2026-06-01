import Link from 'next/link';

export default function BlogListingPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 pt-24 text-white">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
        Latest Updates
      </h1>
      
      <div className="grid gap-6">
        <Link href="/blog/my-first-trip" className="block group">
          <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl hover:border-pink-500/50 transition-colors">
            <h2 className="text-2xl font-bold group-hover:text-pink-400 transition-colors">My First Trip to the Islands</h2>
            <p className="text-gray-400 mt-2 line-clamp-2">
              An amazing journey exploring the beautiful beaches and vibrant culture. Follow along the timeline to see the highlights!
            </p>
            <div className="text-sm text-gray-500 mt-4">Published • May 28, 2026</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
