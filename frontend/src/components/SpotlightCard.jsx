import React, { useRef, useState } from 'react';

/**
 * A premium card component that mimics the Raycast mouse-tracking spotlight highlight.
 * Calculates X/Y coordinates relative to the card border and updates CSS properties in real-time.
 */
export default function SpotlightCard({ children, className = '', style = {}, ...props }) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
  };

  return (
    <div
      ref={cardRef}
      className={`glass-panel spotlight-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...style,
        '--mouse-x': `${coords.x}px`,
        '--mouse-y': `${coords.y}px`
      }}
      {...props}
    >
      {isHovered && <div className="spotlight-overlay" />}
      <div className="spotlight-content">{children}</div>
    </div>
  );
}
