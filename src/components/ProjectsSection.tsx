import React from 'react';
import { motion } from 'framer-motion';
import { CircularGallery } from './ui/circular-gallery';

// ZReveal — same pattern used across sections
function ZReveal({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'zoom';
  className?: string;
}) {
  const variants = {
    up: { hidden: { opacity: 0, y: 60, filter: 'blur(6px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)' } },
    left: { hidden: { opacity: 0, x: -70, filter: 'blur(6px)' }, visible: { opacity: 1, x: 0, filter: 'blur(0px)' } },
    right: { hidden: { opacity: 0, x: 70, filter: 'blur(6px)' }, visible: { opacity: 1, x: 0, filter: 'blur(0px)' } },
    zoom: { hidden: { opacity: 0, scale: 0.88, filter: 'blur(8px)' }, visible: { opacity: 1, scale: 1, filter: 'blur(0px)' } },
  };
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay }}
      variants={variants[direction]}
    >
      {children}
    </motion.div>
  );
}

const galleryData = [
  { common: 'WebSpeak', binomial: 'AI Compiler', link: '#webspeak', photo: { url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=400&auto=format&fit=crop', text: 'WebSpeak', by: '01 — English to Code' } },
  { common: 'AirDraw', binomial: 'Gesture UI', link: 'https://airdraw-six.vercel.app', photo: { url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400&auto=format&fit=crop', text: 'AirDraw', by: '02 — Holographic Draw' } },
  { common: 'ASCII', binomial: 'Generative Art', link: 'https://ascii-five-opal.vercel.app', photo: { url: 'https://images.unsplash.com/photo-1515630278258-407f6ce46f7b?q=80&w=400&auto=format&fit=crop', text: 'ASCII', by: '03 — Creative Coding' } },
  { common: 'Fruit Slices', binomial: 'Arcade Game', link: 'https://fruit-slicer-web-zeta.vercel.app/', photo: { url: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?q=80&w=400&auto=format&fit=crop', text: 'Fruit Slices', by: '04 — Mini Game' } },
  { common: 'Snake IO', binomial: 'Multiplayer Game', link: 'https://snake-swipe.vercel.app', photo: { url: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?q=80&w=400&auto=format&fit=crop', text: 'Snake IO', by: '05 — Arcade Classic' } },
  { common: 'Pokedex', binomial: 'API Integration', link: 'https://pokemon-lac-eight.vercel.app', photo: { url: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=400&auto=format&fit=crop', text: 'Pokedex', by: '06 — Data App' } },
  { common: 'Murder Mystery', binomial: 'Interactive Story', link: 'https://murder-mystery-virid.vercel.app', photo: { url: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=400&auto=format&fit=crop', text: 'Murder Mystery', by: '07 — Adventure Game' } },
];

export default function ProjectsSection() {
  return (
    <section id="projects" className="bg-[var(--color-bg)] border-b-[5px] border-dark">
      <div className="w-full h-[250vh]">
        <div
          className="w-full min-h-[100vh] sticky top-0 flex flex-col items-center justify-center overflow-hidden"
          style={{ perspective: '1200px' }}
        >
          {/* Header */}
          <div className="absolute top-20 z-10 flex flex-col items-center gap-3 text-center px-4">
            <ZReveal delay={0} direction="zoom">
              <div className="brutal-tag bg-dark text-white text-[11px]">
                Portfolio
              </div>
            </ZReveal>

            <ZReveal delay={0.1} direction="up">
              <h2 className="text-[clamp(2.5rem,6vw,5.5rem)] font-display font-black text-dark uppercase leading-none">
                <span className="inline-block bg-[var(--color-primary)] text-white px-4 border-[3px] border-dark shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                  OTHERS
                </span>
              </h2>
            </ZReveal>

            <ZReveal delay={0.18} direction="up">
              <p
                className="text-xs font-bold text-dark/50 uppercase tracking-[0.25em]"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Scroll · Explore
              </p>
            </ZReveal>
          </div>

          {/* Gallery */}
          <div className="w-full h-full pt-16 flex-1 flex items-center justify-center">
            <CircularGallery items={galleryData} radius={450} />
          </div>
        </div>
      </div>
    </section>
  );
}
