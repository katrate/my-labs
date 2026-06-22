import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';
import { useCursor } from '../../context/CursorContext';

export default function CustomCursor() {
  const { cursorState, hoverBoundingRect } = useCursor();
  const [mousePosition, setMousePosition] = useState({ x: -200, y: -200 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  // Main dot — tight spring
  const dotConfig = { stiffness: 800, damping: 35, mass: 0.4 };
  const dotX = useSpring(mousePosition.x, dotConfig);
  const dotY = useSpring(mousePosition.y, dotConfig);

  // Trailing ring — softer spring
  const ringConfig = { stiffness: 200, damping: 22, mass: 0.8 };
  const ringX = useSpring(mousePosition.x, ringConfig);
  const ringY = useSpring(mousePosition.y, ringConfig);

  useEffect(() => {
    if (cursorState === 'hover' && hoverBoundingRect) {
      const cx = hoverBoundingRect.left + hoverBoundingRect.width / 2;
      const cy = hoverBoundingRect.top + hoverBoundingRect.height / 2;
      dotX.set(cx);
      dotY.set(cy);
      ringX.set(cx);
      ringY.set(cy);
    } else {
      dotX.set(mousePosition.x);
      dotY.set(mousePosition.y);
      ringX.set(mousePosition.x);
      ringY.set(mousePosition.y);
    }
  }, [mousePosition, cursorState, hoverBoundingRect, dotX, dotY, ringX, ringY]);

  const isHover = cursorState === 'hover' && hoverBoundingRect;
  const ringSize = isHover ? Math.max(hoverBoundingRect!.width, hoverBoundingRect!.height) + 20 : 44;

  return (
    <>
      {/* Trailing ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-none"
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 1 : 0,
        }}
        animate={{
          width: isHover ? ringSize : 44,
          height: isHover ? ringSize : 44,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            border: '2px solid rgba(255,45,85,0.6)',
            mixBlendMode: 'difference',
          }}
        />
      </motion.div>

      {/* Main cursor dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
          width: 10,
          height: 10,
          backgroundColor: '#ffffff',
          mixBlendMode: 'difference',
          opacity: isVisible ? 1 : 0,
        }}
        animate={{
          scale: isHover ? 0.3 : 1,
        }}
        transition={{ type: 'spring', stiffness: 600, damping: 28 }}
      />
    </>
  );
}
