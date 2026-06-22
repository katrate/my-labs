import { useEffect, useRef } from 'react';
import anime from 'animejs';
import { motion } from 'framer-motion';
import { useMagneticHover } from '../hooks/useMagneticHover';

export default function HeroSection() {
  const textRef = useRef<HTMLHeadingElement>(null);
  const btn1 = useMagneticHover();
  const btn2 = useMagneticHover();

  useEffect(() => {
    if (textRef.current) {
      const text = textRef.current.innerText;
      textRef.current.innerHTML = '';

      const words = text.split(' ');
      words.forEach((word, index) => {
        const wordSpan = document.createElement('span');
        wordSpan.style.display = 'inline-block';
        wordSpan.style.overflow = 'hidden';
        wordSpan.style.verticalAlign = 'bottom';
        wordSpan.style.marginRight = '0.25em';

        word.split('').forEach((char) => {
          const charSpan = document.createElement('span');
          charSpan.innerText = char;
          charSpan.style.display = 'inline-block';
          charSpan.className = 'hero-letter';
          wordSpan.appendChild(charSpan);
        });

        textRef.current!.appendChild(wordSpan);
      });

      anime.timeline({ loop: false }).add({
        targets: '.hero-letter',
        translateY: [100, 0],
        opacity: [0, 1],
        easing: 'easeOutExpo',
        duration: 1200,
        delay: anime.stagger(28),
      });
    }
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center bg-[var(--color-bg)] border-b-[5px] border-dark"
      style={{ overflowX: 'clip' }}
    >
      {/* Grid backdrop */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-dark) 1px, transparent 1px), linear-gradient(90deg, var(--color-dark) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating accent shapes — kept within bounds */}
      <motion.div
        className="absolute top-28 right-8 w-36 h-36 bg-[var(--color-primary)] border-[4px] border-dark"
        animate={{ rotate: [0, 6, -4, 0], y: [0, -10, 6, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-32 right-20 w-20 h-20 bg-[var(--color-secondary)] border-[4px] border-dark"
        animate={{ rotate: [0, -10, 5, 0], y: [0, 10, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute top-1/2 right-6 w-12 h-12 bg-[var(--color-gold)] border-[4px] border-dark"
        animate={{ rotate: [45, 90, 45], scale: [1, 1.1, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />

      {/* EST badge */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 1.8 }}
        className="absolute top-24 right-8 flex flex-col items-end gap-1 z-10"
      >
        <span className="brutal-tag bg-dark text-white text-[10px]">EST. 2021</span>
        <span className="text-[10px] font-bold text-dark/40 uppercase tracking-widest">Portfolio v3</span>
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 px-6 md:px-16 mt-24">

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex items-center gap-3 mb-6 flex-wrap"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse inline-block" />
          <span className="brutal-tag bg-[var(--color-secondary)] text-dark text-[11px]">Creative Developer</span>
          <span className="brutal-tag bg-[var(--color-primary)] text-white text-[11px]">Open to Work</span>
        </motion.div>

        {/* Headline — font size controlled to avoid overflow */}
        <h1
          ref={textRef}
          className="font-fogsta mb-6 tracking-tighter uppercase leading-[0.88] text-dark"
          style={{
            fontSize: 'clamp(2.8rem, 7.5vw, 8rem)',
            maxWidth: '70vw',
            wordBreak: 'break-word',
          }}
        >
          Building Crazy Digital Stuff
        </h1>

        {/* Sub-text */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.9 }}
          className="text-base md:text-xl text-dark/70 font-medium max-w-lg mb-12 leading-relaxed border-l-[5px] border-dark pl-5"
          style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 400 }}
        >
          I engineer unfiltered digital experiences. From AI compilers that translate plain English into pure logic, to gesture-controlled spatial interfaces and high-octane web games. I build things that are fast, bold, and technically uncompromising using <strong className="text-dark font-black">React, Gemini AI, and MediaPipe</strong>.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="flex flex-wrap gap-4 pointer-events-auto"
        >
          <a
            href="#projects"
            className="brutal-button px-10 py-4 text-base uppercase font-black tracking-widest inline-block"
            style={{ cursor: 'none' }}
          >
            View Work ↓
          </a>
          <a
            href="#contact"
            className="brutal-button-outline px-10 py-4 text-base uppercase font-black tracking-widest inline-block"
            style={{ cursor: 'none' }}
          >
            Contact Me
          </a>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="flex gap-10 mt-16 border-t-[3px] border-dark pt-8"
        >
          {[
            { value: '5+', label: 'Years Exp.' },
            { value: '60+', label: 'Projects' },
            { value: '30+', label: 'Happy Clients' },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col">
              <span className="text-4xl font-black font-display text-dark leading-none">{value}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-dark/50 mt-1">{label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-dark/40">Scroll</span>
        <div className="w-[2px] h-10 bg-dark/20 relative overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-full bg-dark"
            animate={{ height: ['0%', '100%'], y: ['0%', '100%'] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
