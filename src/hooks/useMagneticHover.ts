import { useRef } from 'react';
import { useCursor } from '../context/CursorContext';

export function useMagneticHover() {
  const { setCursorState, setHoverBoundingRect } = useCursor();
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement | HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (ref.current) {
      setCursorState('hover');
      setHoverBoundingRect(ref.current.getBoundingClientRect());
    }
  };

  const handleMouseLeave = () => {
    setCursorState('default');
    setHoverBoundingRect(null);
  };

  return { ref, onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave };
}
