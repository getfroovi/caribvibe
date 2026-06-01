import { ShoppingBag } from 'lucide-react';

const PRODUCTS = [
  { id: 1, name: 'Sunset Gradient Tee', price: '$35', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=500' },
  { id: 2, name: 'Ocean Vibe Hoodie', price: '$65', img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=500' },
  { id: 3, name: 'Palm Leaf Tote', price: '$25', img: 'https://images.unsplash.com/photo-1597444316986-e822d515a8ba?auto=format&fit=crop&q=80&w=500' },
  { id: 4, name: 'Tropical Bucket Hat', price: '$30', img: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&q=80&w=500' },
];

export default function ShopPage() {
  return (
    <div className="max-w-7xl mx-auto p-8 pt-12 md:pt-24">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-5xl font-black">The <span className="text-violet-500">Shop</span></h1>
        <button className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-bold hover:bg-gray-200">
          <ShoppingBag className="w-5 h-5" /> Cart (0)
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {PRODUCTS.map((item) => (
          <div key={item.id} className="group relative">
            <div className="aspect-[4/5] bg-zinc-900 rounded-3xl overflow-hidden relative mb-4">
              <img src={item.img} alt={item.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button className="bg-white/90 backdrop-blur-sm text-black font-bold py-3 px-6 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all">
                  Quick Add
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center px-2">
              <h3 className="font-bold text-lg">{item.name}</h3>
              <p className="text-pink-400 font-semibold">{item.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
