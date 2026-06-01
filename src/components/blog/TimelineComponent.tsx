'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle } from 'lucide-react';
import { useState } from 'react';

const MOCK_EVENTS = [
  { id: 1, date: '10:00 AM', title: 'Arrival at the Airport', desc: 'Landed safely and met with the tour guide.', hasVideo: false },
  { id: 2, date: '01:30 PM', title: 'Hotel Check-in & Room Tour', desc: 'The ocean view is absolutely breathtaking.', hasVideo: true },
  { id: 3, date: '04:00 PM', title: 'First Walk on the Beach', desc: 'Feeling the white sand and warm water.', hasVideo: true },
];

export function TimelineComponent() {
  const [activeEvent, setActiveEvent] = useState<number | null>(null);

  return (
    <div className="relative border-l-2 border-zinc-800 ml-4 md:ml-6 space-y-12 pb-12">
      {MOCK_EVENTS.map((event, i) => (
        <motion.div 
          key={event.id}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="relative pl-8 md:pl-12"
        >
          <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-black ${event.hasVideo ? 'bg-pink-500' : 'bg-zinc-600'}`} />
          
          <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
            <div className="w-32 flex-shrink-0 text-sm font-semibold text-pink-400">
              {event.date}
            </div>
            
            <div 
              className="flex-1 bg-zinc-900/50 hover:bg-zinc-900 border border-white/5 hover:border-pink-500/30 p-6 rounded-2xl transition-all cursor-pointer group" 
              onClick={() => setActiveEvent(activeEvent === event.id ? null : event.id)}
            >
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">
                {event.title}
              </h3>
              <p className="text-gray-400">{event.desc}</p>
              
              {event.hasVideo && (
                <div className="mt-4 inline-flex items-center gap-2 text-sm text-pink-500 bg-pink-500/10 px-3 py-1.5 rounded-full font-medium">
                  <PlayCircle className="w-4 h-4" />
                  Watch Video Highlight
                </div>
              )}

              <AnimatePresence>
                {activeEvent === event.id && event.hasVideo && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="aspect-video bg-black rounded-xl border border-white/10 flex items-center justify-center overflow-hidden"
                  >
                    <p className="text-gray-500">Video Player would load here...</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
