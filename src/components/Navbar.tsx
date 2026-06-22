import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMagneticHover } from '../hooks/useMagneticHover';

const NAV_LINKS = [
  { href: '#hero',     label: 'Home',    id: 'hero' },
  { href: '#about',    label: 'About',   id: 'about' },
  { href: '#projects', label: 'Work',    id: 'projects' },
  { href: '#contact',  label: 'Contact', id: 'contact' },
];

export default function Navbar() {
  const { ref: btnRef, onMouseEnter, onMouseLeave } = useMagneticHover();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Use scroll position to determine active section — more reliable than IntersectionObserver for sticky sections
  useEffect(() => {
    const findActive = () => {
      const ids = ['contact', 'projects', 'about', 'hero']; // reverse order: last match wins
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        // section is "active" when its top is at or above middle of viewport
        if (rect.top <= window.innerHeight * 0.5) {
          setActiveSection(id);
          return;
        }
      }
      setActiveSection('hero');
    };

    window.addEventListener('scroll', findActive, { passive: true });
    findActive(); // run on mount
    return () => window.removeEventListener('scroll', findActive);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className={`fixed top-0 left-0 right-0 z-50 flex justify-between items-center
        px-6 py-3 mx-4 mt-4 transition-all duration-300
        ${scrolled
          ? 'bg-[var(--color-bg)]/95 backdrop-blur-xl border-[3px] border-[var(--color-dark)] shadow-[5px_5px_0px_0px_var(--color-primary)]'
          : 'bg-transparent border-[3px] border-transparent'
        }`}
    >
      {/* Logo */}
      <a
        href="#hero"
        className="font-display font-black text-xl tracking-tighter text-dark uppercase group flex items-center gap-2"
        style={{ cursor: 'none' }}
      >
        <span className="w-3 h-3 bg-[var(--color-primary)] border-2 border-dark inline-block group-hover:rotate-45 transition-transform duration-200" />
        KATRATE
      </a>

      {/* Nav Links */}
      <div className="hidden md:flex gap-1 font-bold text-xs tracking-widest uppercase text-dark">
        {NAV_LINKS.map(({ href, label, id }) => {
          const isActive = activeSection === id;
          return (
            <a
              key={href}
              href={href}
              style={{ cursor: 'none' }}
              className={`relative px-4 py-2 transition-all duration-150 border-2
                ${isActive
                  ? 'bg-dark text-white border-dark shadow-[3px_3px_0px_0px_var(--color-primary)]'
                  : 'border-transparent hover:border-dark hover:bg-[var(--color-gold)] hover:shadow-[3px_3px_0px_0px_var(--color-dark)]'
                }`}
            >
              {label}
            </a>
          );
        })}
      </div>

      {/* CTA */}
      <button
        ref={btnRef as React.RefObject<HTMLButtonElement>}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="brutal-button px-5 py-2 font-black uppercase text-xs tracking-widest"
      >
        Hire Me ↗
      </button>

    </motion.nav>
  );
}
