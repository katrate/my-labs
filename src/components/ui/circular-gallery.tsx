import React, { useState, useEffect, useRef, HTMLAttributes } from 'react';

const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(' ');

export interface GalleryItem {
  common: string;
  binomial: string;
  link?: string;
  photo: {
    url: string;
    text: string;
    pos?: string;
    by: string;
  };
}

interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
  radius?: number;
  autoRotateSpeed?: number;
}

const CircularGallery = React.forwardRef<HTMLDivElement, CircularGalleryProps>(
  ({ items, className, radius = 600, autoRotateSpeed = 0.015, ...props }, ref) => {
    const [rotation, setRotation] = useState(0);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
      const handleScroll = () => {
        setIsScrolling(true);
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        const scrollRotation = (window.scrollY / window.innerHeight) * 180;
        setRotation(scrollRotation);
        scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 150);
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      };
    }, []);

    useEffect(() => {
      const autoRotate = () => {
        if (!isScrolling && hoveredIndex === null) {
          setRotation((prev) => prev + autoRotateSpeed);
        }
        animationFrameRef.current = requestAnimationFrame(autoRotate);
      };
      animationFrameRef.current = requestAnimationFrame(autoRotate);
      return () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };
    }, [isScrolling, autoRotateSpeed, hoveredIndex]);

    const anglePerItem = 360 / items.length;

    return (
      <div
        ref={ref}
        role="region"
        aria-label="Circular 3D Gallery"
        className={cn('relative w-full h-full flex items-center justify-center', className)}
        style={{ perspective: '2200px' }}
        {...props}
      >
        <div
          className="relative w-full h-full"
          style={{
            transform: `rotateY(${rotation}deg)`,
            transformStyle: 'preserve-3d',
            transition: isScrolling ? 'none' : undefined,
          }}
        >
          {items.map((item, i) => {
            const itemAngle = i * anglePerItem;
            const totalRotation = rotation % 360;
            const relativeAngle = (itemAngle + totalRotation + 360) % 360;
            const normalizedAngle = Math.abs(relativeAngle > 180 ? 360 - relativeAngle : relativeAngle);

            // Richer opacity & scale falloff
            const t = 1 - normalizedAngle / 180;
            const opacity = 0.25 + t * 0.75;
            const scale = 0.82 + t * 0.18;
            const isHovered = hoveredIndex === i;
            const isFront = normalizedAngle < 30;

            return (
              <div
                key={item.photo.url}
                role="group"
                aria-label={item.common}
                className="absolute w-[240px] h-[320px] cursor-none"
                style={{
                  transform: `rotateY(${itemAngle}deg) translateZ(${radius}px) scale(${isHovered ? scale * 1.06 : scale})`,
                  left: '50%',
                  top: '50%',
                  marginLeft: '-120px',
                  marginTop: '-160px',
                  opacity,
                  transition: 'opacity 0.25s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1)',
                  zIndex: isFront ? 10 : 0,
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => {
                  if (item.link) window.open(item.link, '_blank');
                }}
              >
                {/* Card */}
                <div
                  className="relative w-full h-full overflow-hidden group rounded-2xl"
                  style={{
                    border: '3px solid #0a0a0a',
                    boxShadow: isHovered
                      ? '8px 8px 0px 0px #0a0a0a'
                      : '5px 5px 0px 0px #0a0a0a',
                    background: '#fff',
                    transition: 'box-shadow 0.2s ease',
                  }}
                >
                  {/* Image */}
                  <img
                    src={item.photo.url}
                    alt={item.photo.text}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
                    style={{
                      filter: isHovered ? 'grayscale(0%) contrast(1.05)' : 'grayscale(60%) contrast(1)',
                      objectPosition: item.photo.pos ?? 'center',
                      transform: isHovered ? 'scale(1.06)' : 'scale(1)',
                    }}
                    loading="lazy"
                  />

                  {/* Number badge — top left */}
                  <div
                    className="absolute top-3 left-3 w-8 h-8 bg-dark text-white flex items-center justify-center font-black text-xs"
                    style={{ border: '2px solid #0a0a0a', zIndex: 2 }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>

                  {/* Bottom caption */}
                  <div
                    className="absolute bottom-0 left-0 w-full p-4 translate-y-1 group-hover:translate-y-0 transition-transform duration-300"
                    style={{
                      background: 'var(--color-dark)',
                      borderTop: '3px solid #0a0a0a',
                    }}
                  >
                    <h3
                      className="text-white font-display font-black uppercase tracking-tighter leading-none"
                      style={{ fontSize: 'clamp(1rem, 2.5vw, 1.3rem)' }}
                    >
                      {item.common}
                    </h3>
                    <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mt-1">
                      {item.photo.by}
                    </p>
                  </div>

                  {/* Hover accent line — top */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px] bg-[var(--color-primary)] origin-left"
                    style={{
                      transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
                      transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Hint label */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none select-none"
          style={{ zIndex: 20 }}
        >
          <span
            className="text-dark/30 text-[10px] font-black uppercase tracking-[0.3em]"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            ← Scroll to rotate →
          </span>
        </div>
      </div>
    );
  }
);

CircularGallery.displayName = 'CircularGallery';
export { CircularGallery };
