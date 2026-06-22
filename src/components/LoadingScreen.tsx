import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 600);
          return 100;
        }
        return Math.min(100, p + Math.floor(Math.random() * 12) + 4);
      });
    }, 120);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        key="loader"
        initial={{ opacity: 1 }}
        exit={{ y: '-100%', opacity: 0 }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        className="fixed inset-0 z-[10000] bg-dark flex flex-col items-center justify-center cursor-none overflow-hidden"
      >
        {/* Diagonal stripe */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(-45deg, #fff 0px, #fff 1px, transparent 1px, transparent 18px)',
          }}
        />

        {/* Rotating accent square */}
        <motion.div
          className="absolute w-64 h-64 border-[5px] border-[var(--color-primary)] opacity-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute w-48 h-48 border-[5px] border-[var(--color-secondary)] opacity-20"
          animate={{ rotate: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />

        {/* Logo */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-[var(--color-primary)] border-2 border-white" />
            <span className="text-white text-sm font-black uppercase tracking-[0.3em]">Katrate</span>
            <div className="w-3 h-3 bg-[var(--color-secondary)] border-2 border-white" />
          </div>

          {/* Giant counter */}
          <motion.div
            key={progress}
            className="text-white text-[clamp(5rem,18vw,14rem)] font-display font-black leading-none tabular-nums"
            style={{ textShadow: '6px 6px 0px var(--color-primary)' }}
          >
            {String(Math.min(progress, 100)).padStart(3, '0')}
          </motion.div>

          <span className="text-white/30 text-xs font-bold uppercase tracking-[0.4em]">
            Loading Assets
          </span>

          {/* Progress bar */}
          <div className="w-64 h-[3px] bg-white/10 relative overflow-hidden mt-2">
            <motion.div
              className="absolute inset-y-0 left-0 bg-[var(--color-primary)]"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'linear', duration: 0.15 }}
            />
          </div>
        </div>

        {/* Bottom corner tag */}
        <div className="absolute bottom-8 right-8 text-white/20 text-xs font-bold uppercase tracking-widest">
          Portfolio v3.0
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
