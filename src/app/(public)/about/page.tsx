export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 pt-12 md:pt-24">
      <h1 className="text-5xl md:text-6xl font-black mb-8">About <span className="text-pink-500">Us</span></h1>
      <div className="prose prose-invert prose-lg max-w-none">
        <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-4xl font-medium">
          theGriot.io was born out of a passion for sharing the untamed beauty of the islands through a lens of premium, cinematic storytelling. We are a collective of creators, travelers, and artists dedicated to bringing you the most vibrant and immersive short-form content.
        </p>
        <p className="text-gray-300 leading-relaxed mt-6">
          Our platform is designed to be more than just a video feed. It is a holistic ecosystem where you can explore our curated magazine, shop our exclusive aesthetic merchandise, and unlock premium behind-the-scenes content that you won't find anywhere else.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
        <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl">
          <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
          <p className="text-gray-400">To inspire wanderlust and capture the true essence of island life through unparalleled visual quality.</p>
        </div>
        <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl">
          <h3 className="text-2xl font-bold mb-4">The Vision</h3>
          <p className="text-gray-400">Creating a seamless intersection of media, commerce, and editorial storytelling.</p>
        </div>
      </div>
    </div>
  );
}
