import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, LogIn, X } from 'lucide-react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

interface AuthRequiredModalProps {
  onClose: () => void;
}

export function AuthRequiredModal({ onClose }: AuthRequiredModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-sm shadow-2xl border-white/10 bg-black/90 text-white relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10 p-2"
        >
          <X className="w-5 h-5" />
        </button>
        <CardHeader className="text-center pt-8">
          <div className="mx-auto bg-gradient-to-tr from-pink-500 to-violet-500 p-3 rounded-full mb-4 w-fit">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Account Required</CardTitle>
          <CardDescription className="text-gray-300">
            You must be logged in to access the VIP side of theGriot.io.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-center text-gray-400 mb-2">
            Sign up to unlock premium content, track your watch history, and support creators.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Link href="/login" className="w-full">
            <Button 
              className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold py-6 text-base rounded-xl transition-all shadow-lg"
              onClick={onClose}
            >
              <LogIn className="w-4 h-4 mr-2" /> Log In / Sign Up
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full text-gray-400 hover:text-white"
            onClick={onClose}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </motion.div>,
    document.body
  );
}
