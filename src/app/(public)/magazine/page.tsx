export default function MagazinePage() {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 pt-12 md:pt-24 min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-black mb-4">The <span className="bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">Issue</span></h1>
        <p className="text-gray-400">Flip through our latest interactive digital magazine.</p>
      </div>

      <div className="flex-1 w-full bg-zinc-900 rounded-3xl border border-white/10 overflow-hidden relative min-h-[600px] shadow-2xl flex items-center justify-center">
        {/* Placeholder for Flip-page viewer iframe */}
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        
        <div className="text-center z-10 p-8 max-w-md bg-black/50 backdrop-blur-md rounded-2xl border border-white/5">
          <p className="text-gray-300 font-mono text-sm mb-4">{'<iframe src="..." />'}</p>
          <h2 className="text-2xl font-bold mb-2">Embed Flip-Page Viewer Here</h2>
          <p className="text-gray-400 text-sm">Replace this container with your preferred flip-page magazine embed code (e.g., Issuu, Heyzine, Flipsnack).</p>
        </div>
      </div>
    </div>
  );
}
