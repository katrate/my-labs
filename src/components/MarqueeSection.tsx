import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const TICKER_ITEMS = [
  'BRUTAL DESIGN',
  '✦',
  'CREATIVE CODE',
  '✦',
  'BOLD IDEAS',
  '✦',
  'WEBGL',
  '✦',
  'REACT',
  '✦',
  'THREE.JS',
  '✦',
  'FRAMER MOTION',
  '✦',
].join('   ');

export default function MarqueeSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const x1      = useTransform(scrollYProgress, [0, 1], ['0%',   '-10%']);
  const x2      = useTransform(scrollYProgress, [0, 1], ['-10%', '0%']);
  const yImage  = useTransform(scrollYProgress, [0, 1], [80,   -80]);
  const yImage2 = useTransform(scrollYProgress, [0, 1], [-60,   60]);
  const rot1    = useTransform(scrollYProgress, [0, 1], [12,    -4]);
  const rot2    = useTransform(scrollYProgress, [0, 1], [-8,     8]);

  return (
    <section
      ref={containerRef}
      className="relative py-40 bg-[var(--color-dark)] overflow-hidden border-y-[5px] border-dark"
    >
      {/* Diagonal stripe texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-45deg, #fff 0px, #fff 1px, transparent 1px, transparent 14px)',
        }}
      />

      {/* Row 1 — white */}
      <div className="overflow-hidden mb-6 relative z-10">
        <motion.div
          style={{ x: x1 }}
          className="flex gap-16 whitespace-nowrap text-[clamp(3rem,7vw,6rem)] font-display font-black text-white uppercase tracking-tighter select-none"
        >
          {[0, 1, 2].map((i) => (
            <span key={i} className="shrink-0">
              {TICKER_ITEMS}&nbsp;&nbsp;&nbsp;&nbsp;
            </span>
          ))}
        </motion.div>
      </div>

      {/* Row 2 — accent red, reversed */}
      <div className="overflow-hidden relative z-10">
        <motion.div
          style={{ x: x2 }}
          className="flex gap-16 whitespace-nowrap text-[clamp(3rem,7vw,6rem)] font-display font-black uppercase tracking-tighter select-none"
        >
          {[0, 1, 2].map((i) => (
            <span key={i} className="shrink-0 text-[var(--color-primary)]">
              {TICKER_ITEMS}&nbsp;&nbsp;&nbsp;&nbsp;
            </span>
          ))}
        </motion.div>
      </div>

      {/* Floating image cards */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {/* Card 1 */}
        <motion.div
          style={{ y: yImage, rotate: rot1 }}
          className="absolute left-[8%] overflow-hidden"
        >
          <div
            style={{
              width: '210px',
              height: '280px',
              border: '5px solid #0a0a0a',
              background: 'var(--color-secondary)',
              boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop"
              alt="Abstract"
              style={{ width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'luminosity' }}
            />
            <div
              style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: '#0a0a0a', padding: '10px 14px',
                borderTop: '3px solid #0a0a0a',
              }}
            >
              <span
                style={{
                  color: '#fff', fontSize: '10px', fontWeight: 900,
                  textTransform: 'uppercase', letterSpacing: '0.2em',
                  fontFamily: 'Syne, sans-serif',
                }}
              >
                Web Design
              </span>
            </div>
          </div>
        </motion.div>

        {/* Center badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            width: '140px', height: '140px',
            background: 'var(--color-gold)',
            border: '5px solid #0a0a0a',
            boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
            transform: 'rotate(3deg)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            position: 'relative', zIndex: 20,
          }}
        >
          <span
            style={{
              color: '#0a0a0a', fontSize: '3rem', fontWeight: 900,
              fontFamily: 'Syne, sans-serif', lineHeight: 1,
            }}
          >
            60+
          </span>
          <span
            style={{
              color: '#0a0a0a', fontSize: '10px', fontWeight: 900,
              textTransform: 'uppercase', letterSpacing: '0.2em',
              marginTop: '4px', fontFamily: 'Space Grotesk, sans-serif',
            }}
          >
            Projects
          </span>
        </motion.div>

        {/* Card 2 */}
        <motion.div style={{ y: yImage2, rotate: rot2 }} className="absolute right-[6%]">
          <div
            style={{
              width: '190px', height: '190px',
              border: '5px solid #0a0a0a',
              background: 'var(--color-primary)',
              boxShadow: '8px 8px 0px 0px rgba(255,255,255,0.15)',
              overflow: 'hidden', position: 'relative',
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop"
              alt="Abstract 2"
              style={{ width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'luminosity' }}
            />
            <div
              style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: '#fff', padding: '10px 14px',
                borderTop: '3px solid #0a0a0a',
              }}
            >
              <span
                style={{
                  color: '#0a0a0a', fontSize: '10px', fontWeight: 900,
                  textTransform: 'uppercase', letterSpacing: '0.2em',
                  fontFamily: 'Syne, sans-serif',
                }}
              >
                WebGL
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
