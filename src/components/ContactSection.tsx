import React from 'react';
import { motion } from 'framer-motion';

// Same ZReveal helper as AboutSection
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
    zoom: { hidden: { opacity: 0, scale: 0.85, filter: 'blur(8px)' }, visible: { opacity: 1, scale: 1, filter: 'blur(0px)' } },
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

const SOCIAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com/katrate' },
  { label: '', href: '#' },
  { label: '', href: '#' },
  { label: '', href: '#' },
];

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="relative py-32 px-4 md:px-20 bg-[var(--color-bg)] min-h-screen flex items-center justify-center border-b-[5px] border-dark overflow-hidden"
    >
      {/* Decorative grid */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-dark) 1px, transparent 1px), linear-gradient(90deg, var(--color-dark) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* BIG ghost word */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        aria-hidden
      >
        <span className="text-[20vw] font-display font-black text-dark opacity-[0.03] uppercase leading-none">
          TALK
        </span>
      </div>

      <div className="relative max-w-5xl w-full z-10">

        {/* Header row */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <ZReveal delay={0} direction="left">
              <div className="brutal-tag bg-[var(--color-primary)] text-white mb-5 inline-block">
                Contact
              </div>
            </ZReveal>
            <ZReveal delay={0.08} direction="zoom">
              <h2 className="text-[clamp(3.5rem,8vw,7.5rem)] font-display font-black text-dark uppercase leading-[0.85]">
                LET'S<br />
                <span className="inline-block bg-dark text-white px-4 py-1 shadow-[8px_8px_0px_0px_var(--color-primary)]">
                  TALK.
                </span>
              </h2>
            </ZReveal>
          </div>

          {/* Social links */}
          <ZReveal delay={0.12} direction="right" className="flex flex-col gap-2 min-w-[160px]">
            {SOCIAL_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="brutal-button-outline text-xs font-black uppercase tracking-widest px-5 py-2 text-center"
                style={{ cursor: 'none' }}
              >
                {label} ↗
              </a>
            ))}
          </ZReveal>
        </div>

        {/* Form */}
        <ZReveal delay={0.18} direction="up">
          <form
            className="brutal-card bg-white p-8 md:p-12 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-xs font-black text-dark uppercase tracking-widest">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="brutal-input w-full px-5 py-4 text-dark font-bold text-base"
                  placeholder="Your name"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-xs font-black text-dark uppercase tracking-widest">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="brutal-input w-full px-5 py-4 text-dark font-bold text-base"
                  placeholder="john@example.com"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-6">
              <label htmlFor="subject" className="text-xs font-black text-dark uppercase tracking-widest">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                className="brutal-input w-full px-5 py-4 text-dark font-bold text-base"
                placeholder="New AI project inquiry"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              />
            </div>

            <div className="flex flex-col gap-2 mb-8">
              <label htmlFor="message" className="text-xs font-black text-dark uppercase tracking-widest">
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                className="brutal-input w-full px-5 py-4 text-dark font-bold text-base resize-none"
                placeholder="Tell me about your project..."
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <button
                type="submit"
                className="brutal-button px-10 py-4 text-sm font-black uppercase tracking-widest"
                style={{ cursor: 'none' }}
              >
                Send Message →
              </button>
              <span
                className="text-xs font-bold text-dark/50 uppercase tracking-widest"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Response within 24h
              </span>
            </div>
          </form>
        </ZReveal>

        {/* Bottom info strip */}
        <ZReveal delay={0.22} direction="up">
          <div className="mt-10 flex flex-wrap gap-6 items-center justify-between border-t-[3px] border-dark pt-8">
            <span
              className="text-xs font-bold text-dark/50 uppercase tracking-widest"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Based in — New Delhi, India
            </span>
            <span
              className="text-xs font-bold text-dark/50 uppercase tracking-widest"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              my494stry@gmail.com
            </span>
          </div>
        </ZReveal>

      </div>
    </section>
  );
}
