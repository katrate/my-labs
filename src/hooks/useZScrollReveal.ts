import { useEffect, useRef } from 'react';

interface UseZScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

/**
 * Attach a ref to a container element. When it enters the viewport the class
 * `in-view` is added to every child that carries one of the z-scroll-* classes,
 * triggering the CSS transition defined in index.css.
 */
export function useZScrollReveal(options: UseZScrollRevealOptions = {}) {
  const { threshold = 0.15, rootMargin = '0px 0px -60px 0px', once = true } = options;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = el.querySelectorAll<HTMLElement>(
      '.z-scroll-reveal, .z-scroll-up, .z-scroll-left, .z-scroll-right'
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            entry.target.classList.remove('in-view');
          }
        });
      },
      { threshold, rootMargin }
    );

    targets.forEach((t) => observer.observe(t));

    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return ref;
}

/**
 * Simpler single-element version — attach to any element directly.
 */
export function useRevealElement(options: UseZScrollRevealOptions = {}) {
  const { threshold = 0.2, rootMargin = '0px 0px -60px 0px', once = true } = options;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in-view');
          if (once) observer.disconnect();
        } else if (!once) {
          el.classList.remove('in-view');
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return ref;
}
