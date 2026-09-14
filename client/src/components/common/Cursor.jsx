import React, { useEffect, useState } from 'react';
import useUiStore from '../../store/ui/themeStore.js';

const Cursor = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const { cursorHovered } = useUiStore();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      {/* Outer Cursor Ring */}
      <div
        className={`fixed pointer-events-none z-[9999] rounded-full border border-gold/60 -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ease-out ${
          cursorHovered ? 'w-14 h-14 border-gold bg-gold/5' : 'w-9 h-9'
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
      {/* Inner Cursor Dot */}
      <div
        className="fixed pointer-events-none z-[10000] w-2.5 h-2.5 bg-gold rounded-full -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
    </>
  );
};

export default Cursor;
