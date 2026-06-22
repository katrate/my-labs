import React, { createContext, useContext, useState, ReactNode } from 'react';

type CursorState = 'default' | 'hover';

interface CursorContextType {
  cursorState: CursorState;
  setCursorState: (state: CursorState) => void;
  hoverBoundingRect: DOMRect | null;
  setHoverBoundingRect: (rect: DOMRect | null) => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export const CursorProvider = ({ children }: { children: ReactNode }) => {
  const [cursorState, setCursorState] = useState<CursorState>('default');
  const [hoverBoundingRect, setHoverBoundingRect] = useState<DOMRect | null>(null);

  return (
    <CursorContext.Provider value={{ cursorState, setCursorState, hoverBoundingRect, setHoverBoundingRect }}>
      {children}
    </CursorContext.Provider>
  );
};

export const useCursor = () => {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error('useCursor must be used within a CursorProvider');
  }
  return context;
};
