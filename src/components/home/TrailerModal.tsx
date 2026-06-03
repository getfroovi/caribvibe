'use client';

import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerUrl: string;
}

export function TrailerModal({ isOpen, onClose, trailerUrl }: TrailerModalProps) {
  if (!isOpen) return null;

  // Simple heuristic to check if it's a YouTube link
  const isYouTube = trailerUrl.includes('youtube.com') || trailerUrl.includes('youtu.be');
  let youtubeEmbedUrl = trailerUrl;
  
  if (isYouTube) {
    if (trailerUrl.includes('watch?v=')) {
      youtubeEmbedUrl = trailerUrl.replace('watch?v=', 'embed/');
    } else if (trailerUrl.includes('youtu.be/')) {
      youtubeEmbedUrl = trailerUrl.replace('youtu.be/', 'youtube.com/embed/');
    }
    // Add autoplay and hide controls
    youtubeEmbedUrl += (youtubeEmbedUrl.includes('?') ? '&' : '?') + 'autoplay=1&rel=0';
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-12"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 md:top-10 md:right-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[110]"
        >
          <X className="w-6 h-6" />
        </button>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        >
          {isYouTube ? (
            <iframe
              src={youtubeEmbedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <video
              src={trailerUrl}
              className="w-full h-full object-contain"
              autoPlay
              controls
              playsInline
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
