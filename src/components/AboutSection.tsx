import React from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { useRef, useState } from 'react';

const SKILLS = [
  { label: 'CLI & TUI Arch', pct: 95 },
  { label: 'React / Web', pct: 90 },
  { label: 'Systems & Langs', pct: 88 },
  { label: 'Applied AI & CV',   pct: 85 },
];

// Reusable whileInView wrapper that animates from Z-back
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
    up:    { hidden: { opacity: 0, y: 60,  filter: 'blur(6px)' }, visible: { opacity: 1, y: 0,  filter: 'blur(0px)' } },
    left:  { hidden: { opacity: 0, x: -70, filter: 'blur(6px)' }, visible: { opacity: 1, x: 0,  filter: 'blur(0px)' } },
    right: { hidden: { opacity: 0, x: 70,  filter: 'blur(6px)' }, visible: { opacity: 1, x: 0,  filter: 'blur(0px)' } },
    zoom:  { hidden: { opacity: 0, scale: 0.85, filter: 'blur(8px)' }, visible: { opacity: 1, scale: 1, filter: 'blur(0px)' } },
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

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (latest >= 0.6 && !isLoaded) setIsLoaded(true);
  });

  const pathLength    = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  const imageY        = useTransform(scrollYProgress, [0, 1], ['0%', '-10%']);
  const imageRotate   = useTransform(scrollYProgress, [0, 1], [3, -2]);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="bg-[var(--color-secondary)] border-b-[5px] border-dark relative"
    >
      <div className="w-full h-[200vh]">
        <div className="w-full h-screen sticky top-0 flex items-center justify-center overflow-hidden px-4 md:px-20">
          <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-20 z-10">

            {/* ---- Image column ---- */}
            <div className="flex-1 relative w-full max-w-xs mx-auto md:mx-0">
              <motion.div
                style={{ y: imageY, rotate: imageRotate }}
                className="relative w-full aspect-[3/4] border-[5px] border-dark bg-[var(--color-primary)] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
              >
                {/* Image revealed by scroll */}
                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isLoaded ? 1 : 0 }}
                  transition={{ duration: 0.7 }}
                  src="https://images.unsplash.com/photo-1549692520-acc6669e2f0c?q=80&w=800&auto=format&fit=crop"
                  alt="About"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* SVG loader overlay */}
                <motion.svg
                  initial={{ opacity: 1 }}
                  animate={{ opacity: isLoaded ? 0 : 1 }}
                  transition={{ duration: 0.7 }}
                  viewBox="0 0 200 200"
                  className="absolute inset-0 w-full h-full bg-[var(--color-primary)] z-10"
                >
                  <motion.path
                    d="M 40,100 C 40,40 160,40 160,100 C 160,160 40,160 40,100"
                    fill="none" stroke="black" strokeWidth="6"
                    style={{ pathLength }}
                  />
                  <motion.path
                    d="M 70,80 L 90,100 L 130,60"
                    fill="none" stroke="white" strokeWidth="10" strokeLinecap="square"
                    style={{ pathLength }}
                  />
                </motion.svg>

                {/* Corner badge */}
                <div className="absolute -bottom-5 -right-5 bg-dark text-white px-4 py-2 border-[3px] border-dark font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_var(--color-primary)]">
                  Available
                </div>
              </motion.div>
            </div>

            {/* ---- Text column ---- */}
            <div className="flex-1">

              {/* Section tag */}
              <ZReveal delay={0} direction="left">
                <div className="brutal-tag bg-white text-dark mb-5 inline-block">
                  About Me
                </div>
              </ZReveal>

              {/* KATRATE — always visible, NovaMoir font, no fade */}
              <ZReveal delay={0.08} direction="zoom">
                <h2
                  className="text-[clamp(3.5rem,9vw,7rem)] uppercase leading-[0.85] text-dark mb-6"
                  style={{
                    fontFamily: 'NovaMoir, serif',
                    fontWeight: 'normal',
                    letterSpacing: '-0.02em',
                  }}
                >
                  KATRATE
                </h2>
              </ZReveal>

              {/* Bio */}
              <ZReveal delay={0.16} direction="up">
                <p
                  className="text-base md:text-lg text-dark font-medium mb-6 leading-relaxed bg-white/70 p-5 border-[3px] border-dark shadow-[5px_5px_0px_0px_var(--color-dark)]"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  I don't just write code; I architect systems that push the boundaries of what the web can do. My arsenal runs deep—leveraging large language models like Gemini for intelligent logic, computer vision via MediaPipe for spatial computing, and low-level tools for custom language compilers. Whether it's a hyper-responsive web app, a complex CLI tool, or an interactive game, I focus on delivering raw performance and aggressive innovation.
                </p>
              </ZReveal>

              {/* Skills */}
              <ZReveal delay={0.24} direction="up">
                <div className="space-y-4 mb-8">
                  {SKILLS.map(({ label, pct }) => (
                    <div key={label} className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black uppercase tracking-widest text-dark">{label}</span>
                        <span className="text-xs font-black text-dark">{pct}%</span>
                      </div>
                      <div className="h-[6px] bg-white border-[2px] border-dark relative overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-dark"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ZReveal>

              {/* CTA */}
              <ZReveal delay={0.32} direction="up">
                <a
                  href="#contact"
                  className="brutal-button inline-block px-8 py-3 text-sm font-black uppercase tracking-widest"
                  style={{ cursor: 'none' }}
                >
                  Let's Work Together →
                </a>
              </ZReveal>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
